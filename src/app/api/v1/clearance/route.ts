import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';
import { getMockClearance } from '@/lib/mockData';

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
    
    const req = pool.request();
    if (branch !== 'ALL') req.input('branch', sql.VarChar, branch);
    if (startDate) req.input('startDate', sql.Date, startDate);
    if (endDate) req.input('endDate', sql.Date, endDate);

    let whereClause = '1=1';
    if (branch !== 'ALL') whereClause += ' AND Ma_HQ = @branch';
    if (startDate) whereClause += ' AND Ngay_dang_ky >= @startDate';
    if (endDate) whereClause += ' AND Ngay_dang_ky <= @endDate';

    const result = await req.query(`
      SELECT 
        SUM(CASE WHEN Trong_Thong_Ke = 1 THEN 1 ELSE 0 END) as totalInStats,
        SUM(CASE WHEN Trong_Thong_Ke = 1 THEN Kim_ngach_USD ELSE 0 END) as inStatsValueUSD,
        SUM(CASE WHEN Trong_Thong_Ke = 0 OR Trong_Thong_Ke IS NULL THEN 1 ELSE 0 END) as totalOutOfStats,
        SUM(CASE WHEN Trong_Thong_Ke = 0 OR Trong_Thong_Ke IS NULL THEN Kim_ngach_USD ELSE 0 END) as outOfStatsValueUSD,
        SUM(CASE WHEN Loai_XNK = 'XK' THEN 1 ELSE 0 END) as exportDeclarations,
        SUM(CASE WHEN Loai_XNK = 'XK' THEN Kim_ngach_USD ELSE 0 END) as exportValueUSD,
        SUM(CASE WHEN Loai_XNK = 'NK' THEN 1 ELSE 0 END) as importDeclarations,
        SUM(CASE WHEN Loai_XNK = 'NK' THEN Kim_ngach_USD ELSE 0 END) as importValueUSD
      FROM rpToKhai
      WHERE ${whereClause}
    `);

    const mockDataRef = getMockClearance(startDate, endDate, branch);
    const row = result.recordset[0] || {};
    
    const exportValueUSD = row.exportValueUSD || 0;
    const importValueUSD = row.importValueUSD || 0;

    const data = {
      isMock: false,
      branch: branch,
      clearance: mockDataRef.clearance ? {
        ...mockDataRef.clearance,
        totalInStats: row.totalInStats || 0,
        inStatsValueUSD: row.inStatsValueUSD || 0,
        totalOutOfStats: row.totalOutOfStats || 0,
        outOfStatsValueUSD: row.outOfStatsValueUSD || 0,
        exportDeclarations: row.exportDeclarations || 0,
        exportValueUSD: exportValueUSD,
        importDeclarations: row.importDeclarations || 0,
        importValueUSD: importValueUSD,
        tradeBalanceUSD: exportValueUSD - importValueUSD,
      } : undefined,
      channels: mockDataRef.channels,
      commodities: mockDataRef.commodities
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: data
    });
  } catch (error) {
    console.warn('Database failed, falling back to mock data', error);
    const mockData = getMockClearance(startDate, endDate, branch);
    return NextResponse.json({
      meta: { status: 200 },
      data: mockData
    });
  }
}
