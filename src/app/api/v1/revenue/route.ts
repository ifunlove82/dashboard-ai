import { NextResponse } from 'next/server';
import { getDbConnection, sql } from '@/lib/db';
import { getMockRevenue } from '@/lib/mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get('branch') || 'ALL';

  try {
    const pool = await getDbConnection();
    
    const req1 = pool.request();
    if (branch !== 'ALL') {
      req1.input('branch', sql.VarChar, branch);
    }
    const declarationsResult = await req1.query(`
      SELECT 
        COUNT(id) as totalDeclarations,
        SUM(kimNgachUSD) as totalValueUSD,
        SUM(tongThueThuKhacVND) as totalTaxVND
      FROM rpToKhai
      ${branch !== 'ALL' ? 'WHERE maHQ = @branch' : ''}
    `);

    const req2 = pool.request();
    if (branch !== 'ALL') {
      req2.input('branch', sql.VarChar, branch);
    }
    const phiResult = await req2.query(`
      SELECT 
        SUM(soTien) as totalPhiCSHTVND
      FROM rpPhiCSHT
      ${branch !== 'ALL' ? 'WHERE maHQ = @branch' : ''}
    `);

    const data = {
      isMock: false,
      kpis: {
        totalDeclarations: declarationsResult.recordset[0]?.totalDeclarations || 0,
        totalValueUSD: declarationsResult.recordset[0]?.totalValueUSD || 0,
        totalTaxVND: declarationsResult.recordset[0]?.totalTaxVND || 0,
        totalPhiCSHTVND: phiResult.recordset[0]?.totalPhiCSHTVND || 0,
      }
    };

    return NextResponse.json({
      meta: { status: 200 },
      data: data
    });
  } catch (error) {
    console.warn('Database failed, falling back to mock data', error);
    const mockData = getMockRevenue(undefined, undefined, branch);
    return NextResponse.json({
      meta: { status: 200 },
      data: mockData
    });
  }
}
