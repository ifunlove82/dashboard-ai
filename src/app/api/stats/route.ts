import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';
import { getMockStats } from '@/lib/mockData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawStartDate = searchParams.get('startDate') || '2026-01-01';
  const rawEndDate = searchParams.get('endDate') || '2026-06-30';
  const rawLoaiXNK = searchParams.get('loaiXNK') || 'ALL'; // ALL, NK, XK

  // Input validation & sanitization (hardening)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  const startDateStr = dateRegex.test(rawStartDate) ? rawStartDate : '2026-01-01';
  const endDateStr = dateRegex.test(rawEndDate) ? rawEndDate : '2026-06-30';
  const loaiXNK = ['ALL', 'NK', 'XK'].includes(rawLoaiXNK) ? rawLoaiXNK : 'ALL';

  console.log(`Fetching stats for range: ${startDateStr} to ${endDateStr}, type: ${loaiXNK}`);

  try {
    const pool = await getDbConnection();
    
    // 1. Query KPIs from rpToKhai
    const kpiRequest = pool.request();
    kpiRequest.input('startDate', sql.Date, startDateStr);
    kpiRequest.input('endDate', sql.Date, endDateStr);
    kpiRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const kpiQuery = `
      SELECT 
        COUNT(*) as totalDeclarations,
        SUM(COALESCE(Kim_ngach_USD, 0)) as totalValueUSD,
        SUM(COALESCE(So_luong_cont, 0)) as totalContainers,
        SUM(COALESCE(Tong_trong_luong_TNE, 0)) as totalWeightTNE,
        SUM(COALESCE(Tong_thue_thu_khac_VND, 0)) as totalOtherTaxVND
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
    `;
    const kpiRes = await kpiRequest.query(kpiQuery);
    const kpiRow = kpiRes.recordset[0];
    
    // If no declarations found in DB, fallback to mock data to keep dashboard active
    if (!kpiRow || kpiRow.totalDeclarations === 0) {
      console.log('No data found in SQL Server, falling back to mock data');
      return NextResponse.json(
        { ...getMockStats(startDateStr, endDateStr, loaiXNK), isMock: true },
        { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
      );
    }

    // 2. Query Taxes from rpHang
    const taxRequest = pool.request();
    taxRequest.input('startDate', sql.Date, startDateStr);
    taxRequest.input('endDate', sql.Date, endDateStr);
    taxRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const taxQuery = `
      SELECT
        SUM(COALESCE(So_tien_thue_XNK, 0)) as thueXNK,
        SUM(COALESCE(So_tien_thue_V, 0)) as thueV,
        SUM(COALESCE(So_tien_thue_T, 0)) as thueT,
        SUM(COALESCE(So_tien_thue_M, 0)) as thueM,
        SUM(COALESCE(So_tien_thue_B, 0)) as thueB,
        SUM(COALESCE(So_tien_thue_G, 0)) as thueG,
        SUM(COALESCE(Tong_thue, 0)) as totalTaxVND
      FROM rpHang
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
    `;
    const taxRes = await taxRequest.query(taxQuery);
    const taxRow = taxRes.recordset[0] || {};

    const totalTaxVND = (taxRow.totalTaxVND || 0) + (kpiRow.totalOtherTaxVND || 0);

    const taxBreakdown = {
      thueXNK: taxRow.thueXNK || 0,
      thueV: taxRow.thueV || 0,
      thueT: taxRow.thueT || 0,
      thueM: taxRow.thueM || 0,
      thueB: taxRow.thueB || 0,
      thueG: taxRow.thueG || 0,
      thueKhac: kpiRow.totalOtherTaxVND || 0,
    };

    // 3. Query Trends (rpToKhai value and counts)
    const trendsRequest = pool.request();
    trendsRequest.input('startDate', sql.Date, startDateStr);
    trendsRequest.input('endDate', sql.Date, endDateStr);
    trendsRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const trendsQuery = `
      SELECT 
        MIN(Ngay_dang_ky) as min_date,
        FORMAT(Ngay_dang_ky, 'MM/yyyy') as month,
        SUM(COALESCE(Kim_ngach_USD, 0)) as valueUSD,
        COUNT(*) as declarations
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY FORMAT(Ngay_dang_ky, 'MM/yyyy')
      ORDER BY min_date
    `;
    const trendsRes = await trendsRequest.query(trendsQuery);
    
    // Tax trends from rpHang
    const taxTrendsRequest = pool.request();
    taxTrendsRequest.input('startDate', sql.Date, startDateStr);
    taxTrendsRequest.input('endDate', sql.Date, endDateStr);
    taxTrendsRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const taxTrendsQuery = `
      SELECT 
        FORMAT(Ngay_dang_ky, 'MM/yyyy') as month,
        SUM(COALESCE(Tong_thue, 0)) as taxVND
      FROM rpHang
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY FORMAT(Ngay_dang_ky, 'MM/yyyy')
    `;
    const taxTrendsRes = await taxTrendsRequest.query(taxTrendsQuery);
    const taxTrendMap: Record<string, number> = {};
    taxTrendsRes.recordset.forEach((row: { month: string; taxVND: number }) => {
      taxTrendMap[row.month] = row.taxVND;
    });

    const trends = trendsRes.recordset.map((row: { month: string; valueUSD: number; declarations: number }) => ({
      date: row.month,
      valueUSD: row.valueUSD,
      declarations: row.declarations,
      taxVND: taxTrendMap[row.month] || 0,
    }));

    // 4. Query Customs Channels
    const channelsRequest = pool.request();
    channelsRequest.input('startDate', sql.Date, startDateStr);
    channelsRequest.input('endDate', sql.Date, endDateStr);
    channelsRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const channelsQuery = `
      SELECT 
        COALESCE(Luong, N'Chưa phân luồng') as name,
        COUNT(*) as value
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY Luong
    `;
    const channelsRes = await channelsRequest.query(channelsQuery);
    const channelColors: Record<string, string> = {
      'Xanh': '#10B981',
      'Vàng': '#F59E0B',
      'Đỏ': '#EF4444',
      'Luồng Xanh': '#10B981',
      'Luồng Vàng': '#F59E0B',
      'Luồng Đỏ': '#EF4444'
    };
    
    const channels = channelsRes.recordset.map((row: { name: string; value: number }) => {
      // Normalize name
      let name = row.name;
      if (name === 'Xanh' || name === 'Xanh ') name = 'Luồng Xanh';
      if (name === 'Vàng' || name === 'Vang') name = 'Luồng Vàng';
      if (name === 'Đỏ' || name === 'Do') name = 'Luồng Đỏ';
      return {
        name,
        value: row.value,
        color: channelColors[name] || '#6B7280'
      };
    });

    // 5. Query Commodities
    const commoditiesRequest = pool.request();
    commoditiesRequest.input('startDate', sql.Date, startDateStr);
    commoditiesRequest.input('endDate', sql.Date, endDateStr);
    commoditiesRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const commoditiesQuery = `
      SELECT TOP 10
        COALESCE(Nhom_hang, N'Khác') as name,
        SUM(COALESCE(Tri_gia_VND, 0)) as valueVND,
        SUM(COALESCE(Tong_thue, 0)) as taxVND,
        SUM(COALESCE(So_luong, 0)) as quantity
      FROM rpHang
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY Nhom_hang
      ORDER BY valueVND DESC
    `;
    const commoditiesRes = await commoditiesRequest.query(commoditiesQuery);
    const commodities = commoditiesRes.recordset;

    // 6. Query Countries
    const countriesRequest = pool.request();
    countriesRequest.input('startDate', sql.Date, startDateStr);
    countriesRequest.input('endDate', sql.Date, endDateStr);
    countriesRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const countriesQuery = `
      SELECT TOP 10
        COALESCE(Nuoc_XNK, N'Khác') as name,
        SUM(COALESCE(Kim_ngach_USD, 0)) as valueUSD
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY Nuoc_XNK
      ORDER BY valueUSD DESC
    `;
    const countriesRes = await countriesRequest.query(countriesQuery);
    const countries = countriesRes.recordset.map((row: { name: string; valueUSD: number }) => ({
      code: row.name.substring(0, 2).toUpperCase(),
      name: row.name,
      valueUSD: row.valueUSD
    }));

    // 7. Query Enterprises
    const enterprisesRequest = pool.request();
    enterprisesRequest.input('startDate', sql.Date, startDateStr);
    enterprisesRequest.input('endDate', sql.Date, endDateStr);
    enterprisesRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    
    const enterprisesQuery = `
      SELECT TOP 10
        COALESCE(Ma_DN_XNK, 'N/A') as taxId,
        COALESCE(Ten_DN_XNK, N'Doanh nghiệp Vãng lai') as name,
        SUM(COALESCE(Kim_ngach_USD, 0)) as valueUSD,
        COUNT(*) as declarations,
        SUM(COALESCE(So_luong_cont, 0)) as containers
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
      GROUP BY Ma_DN_XNK, Ten_DN_XNK
      ORDER BY valueUSD DESC
    `;
    const enterprisesRes = await enterprisesRequest.query(enterprisesQuery);
    const enterprises = enterprisesRes.recordset;

    return NextResponse.json(
      {
        isMock: false,
        kpis: {
          totalDeclarations: kpiRow.totalDeclarations,
          totalValueUSD: kpiRow.totalValueUSD,
          totalContainers: kpiRow.totalContainers,
          totalWeightTNE: kpiRow.totalWeightTNE,
          totalTaxVND,
        },
        taxBreakdown,
        trends,
        channels,
        commodities,
        countries,
        enterprises,
        topEnterprises: enterprises,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );

  } catch (error) {
    console.error('Database connection or query failed. Falling back to Mock Data. Error:', error);
    // If the database connection fails, return mock data so the application is still interactive
    return NextResponse.json(
      { ...getMockStats(startDateStr, endDateStr, loaiXNK), isMock: true },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    );
  }
}
