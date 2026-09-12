import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';
import { getMockClearance } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch') || 'ALL';

  try {
    const pool = await getDbConnection();
    
    const req = pool.request();
    if (branch !== 'ALL') {
      req.input('branch', sql.VarChar, branch);
    }
    const result = await req.query(`
      SELECT 
        COUNT(id) as totalInStats,
        SUM(kimNgachUSD) as inStatsValueUSD
      FROM rpToKhai
      WHERE Trong_Thong_Ke = 1
      ${branch !== 'ALL' ? 'AND maHQ = @branch' : ''}
    `);

    const data = {
      isMock: false,
      clearance: {
        totalInStats: result.recordset[0]?.totalInStats || 0,
        inStatsValueUSD: result.recordset[0]?.inStatsValueUSD || 0,
      }
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: data
    });
  } catch (error) {
    console.warn('Database failed, falling back to mock data', error);
    const mockData = getMockClearance(undefined, undefined, branch);
    return NextResponse.json({
      meta: { status: 200 },
      data: mockData
    });
  }
}
