import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';


function getDateRange(timeframe: string | null, start: string | null, end: string | null) {
  let startDate = start;
  let endDate = end;
  
  if (timeframe && (!startDate || !endDate)) {
    const now = new Date();
    if (timeframe === 'today') {
      startDate = now.toISOString().split('T')[0];
      endDate = now.toISOString().split('T')[0];
    } else if (timeframe === 'this_week') {
      const first = now.getDate() - now.getDay() + 1;
      startDate = new Date(now.setDate(first)).toISOString().split('T')[0];
      endDate = new Date().toISOString().split('T')[0];
    } else if (timeframe === 'this_month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }
  }
  return { startDate: startDate || undefined, endDate: endDate || undefined };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch') || 'ALL';
  const timeframe = searchParams.get('timeframe');
  const startParam = searchParams.get('startDate');
  const endParam = searchParams.get('endDate');

  const { startDate, endDate } = getDateRange(timeframe, startParam, endParam);

  try {
    const pool = await getDbConnection();
    
    // Declarations Query
    const req1 = pool.request();
    if (branch !== 'ALL') req1.input('branch', sql.VarChar, branch);
    if (startDate) req1.input('startDate', sql.Date, startDate);
    if (endDate) req1.input('endDate', sql.Date, endDate);

    let toKhaiWhere = '1=1';
    if (branch !== 'ALL') toKhaiWhere += ' AND Ma_HQ = @branch';
    if (startDate) toKhaiWhere += ' AND Ngay_dang_ky >= @startDate';
    if (endDate) toKhaiWhere += ' AND Ngay_dang_ky <= @endDate';

    const pDeclarations = req1.query(`
      SELECT 
        COUNT(*) as totalDeclarations,
        SUM(Kim_ngach_USD) as totalValueUSD,
        SUM(Tong_thue_thu_khac_VND) as totalTaxVND,
        SUM(So_luong_cont) as totalContainers,
        SUM(Tong_trong_luong_TNE) as totalWeightTNE,
        SUM(CASE WHEN Trong_Thong_Ke = 1 THEN 1 ELSE 0 END) as totalDeclarationsInStats,
        SUM(CASE WHEN Trong_Thong_Ke = 1 THEN Kim_ngach_USD ELSE 0 END) as totalValueUSDInStats
      FROM rpToKhai
      WHERE ${toKhaiWhere}
    `);

    // PhiCSHT Query
    const req2 = pool.request();
    if (branch !== 'ALL') req2.input('branch', sql.VarChar, branch);
    if (startDate) req2.input('startDate', sql.Date, startDate);
    if (endDate) req2.input('endDate', sql.Date, endDate);

    let phiWhere = '1=1';
    if (branch !== 'ALL') phiWhere += ' AND Ma_HQ = @branch';
    if (startDate) phiWhere += ' AND Ngay_dang_ky >= @startDate';
    if (endDate) phiWhere += ' AND Ngay_dang_ky <= @endDate';

    const pPhi = req2.query(`
      SELECT 
        SUM(So_tien) as totalPhiCSHTVND
      FROM rpPhiCSHT
      WHERE ${phiWhere}
    `);

    // rpHang Query for tax breakdown
    const req3 = pool.request();
    if (branch !== 'ALL') req3.input('branch', sql.VarChar, branch);
    if (startDate) req3.input('startDate', sql.Date, startDate);
    if (endDate) req3.input('endDate', sql.Date, endDate);

    let hangWhere = '1=1';
    let hangFrom = 'rpHang h';
    if (branch !== 'ALL') {
      hangFrom += ' JOIN rpToKhai t ON h.ID_ToKhai = t.ID';
      hangWhere += ' AND t.Ma_HQ = @branch';
    }
    if (startDate) hangWhere += ' AND h.Ngay_dang_ky >= @startDate';
    if (endDate) hangWhere += ' AND h.Ngay_dang_ky <= @endDate';

    const pHang = req3.query(`
      SELECT
        SUM(h.So_tien_thue_XNK) as thueXNK,
        SUM(h.So_tien_thue_V) as thueV,
        SUM(h.So_tien_thue_T) as thueT,
        SUM(h.So_tien_thue_M) as thueM,
        SUM(h.So_tien_thue_B) as thueB,
        SUM(h.So_tien_thue_G) as thueG
      FROM ${hangFrom}
      WHERE ${hangWhere}
    `);

    const [declarationsResult, phiResult, hangResult] = await Promise.all([pDeclarations, pPhi, pHang]);

    const row = declarationsResult.recordset[0] || {};
    const phiRow = phiResult.recordset[0] || {};
    const hangRow = hangResult.recordset[0] || {};

    const livePhiTotal = phiRow.totalPhiCSHTVND || 0;

    const kpis = {
      totalDeclarations: row.totalDeclarations || 0,
      totalValueUSD: row.totalValueUSD || 0,
      totalTaxVND: (row.totalTaxVND || 0) + 
                   (hangRow.thueXNK || 0) + 
                   (hangRow.thueV || 0) + 
                   (hangRow.thueT || 0) + 
                   (hangRow.thueM || 0) + 
                   (hangRow.thueB || 0) + 
                   (hangRow.thueG || 0),
      totalContainers: row.totalContainers || 0,
      totalWeightTNE: row.totalWeightTNE || 0,
      totalDeclarationsInStats: row.totalDeclarationsInStats || 0,
      totalValueUSDInStats: row.totalValueUSDInStats || 0,
      totalPhiCSHTVND: livePhiTotal,
    };

    const taxBreakdown = {
      thueXNK: hangRow.thueXNK || 0,
      thueV: hangRow.thueV || 0,
      thueT: hangRow.thueT || 0,
      thueM: hangRow.thueM || 0,
      thueB: hangRow.thueB || 0,
      thueG: hangRow.thueG || 0,
      thueKhac: row.totalTaxVND || 0
    };

    const phiCSHT = {
      totalFeeVND: livePhiTotal
    };

    const data = {
      isMock: false,
      branch: branch,
      kpis,
      taxBreakdown,
      phiCSHT,
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: data
    });
  } catch (error: any) {
    console.error('Database query failed:', error);
    return NextResponse.json({
      meta: { status: 500, error: error.message }
    }, { status: 500 });
  }
}
