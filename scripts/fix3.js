const fs = require('fs');

async function fix3() {
  let content = fs.readFileSync('src/app/api/stats/route.ts', 'utf8');

  // Fix kpiQuery block
  const oldKpiBlockRegex = /    const kpiRequest = pool\.request\(\);[\s\S]*?const kpiRow = kpiRes\.recordset\[0\];/m;

  const newKpiBlock = `    const kpiRequest = pool.request();
    kpiRequest.input('startDate', sql.Date, startDateStr);
    kpiRequest.input('endDate', sql.Date, endDateStr);
    kpiRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    kpiRequest.input('unit', sql.NVarChar, unit);
    kpiRequest.input('filterMonth', sql.Int, filterMonth);
    kpiRequest.input('filterYear', sql.Int, filterYear);
    
    let kpiQuery = \`
      SELECT 
        COUNT(*) as totalDeclarations,
        SUM(COALESCE(Kim_ngach_USD, 0)) as totalValueUSD,
        SUM(COALESCE(So_luong_cont, 0)) as totalContainers,
        SUM(COALESCE(Tong_trong_luong_TNE, 0)) as totalWeightTNE,
        SUM(COALESCE(Tong_thue_thu_khac_VND, 0)) as totalOtherTaxVND
      FROM rpToKhai
      WHERE (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
        AND (@unit = 'ALL' OR Ma_HQ = @unit)
    \`;

    if (timeframe === 'Tháng' || timeframe === 'ThAng' || timeframe === 'ThAng' || timeframe === 'Tháng' || timeframe.includes('Th')) {
      kpiQuery += \` AND MONTH(Ngay_dang_ky) = @filterMonth AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else if (timeframe === 'Năm' || timeframe === 'Nam' || timeframe.includes('N')) {
      kpiQuery += \` AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else {
      kpiQuery += \` AND Ngay_dang_ky BETWEEN @startDate AND @endDate\`;
    }
    const kpiRes = await kpiRequest.query(kpiQuery);
    const kpiRow = kpiRes.recordset[0];`;

  content = content.replace(oldKpiBlockRegex, newKpiBlock);

  // Fix targetQuery block
  const oldTargetBlockRegex = /    \/\/ 1b\. Query Targets from rpTargets[\s\S]*?console\.warn\('Could not query rpTargets, falling back to default targets', e\);\n    \}/m;

  const newTargetBlock = `    // 1b. Query Targets from rpTargets
    let targets = null;
    try {
      const targetRequest = pool.request();
      targetRequest.input('unit', sql.NVarChar, unit);
      targetRequest.input('filterMonth', sql.Int, filterMonth);
      targetRequest.input('filterYear', sql.Int, filterYear);
      let targetQuery = \`
        SELECT 
          SUM(COALESCE(ChiTieu_Thu, 0)) as targetRevenue,
          SUM(COALESCE(ChiTieu_ToKhai, 0)) as targetDeclarations,
          SUM(COALESCE(ChiTieu_KimNgach, 0)) as targetWeight
        FROM rpTargets
        WHERE (@unit = 'ALL' OR Ma_HQ = @unit)
          AND Nam = @filterYear
      \`;
      if (timeframe === 'Tháng' || timeframe === 'ThAng' || timeframe === 'ThAng' || timeframe === 'Tháng' || timeframe.includes('Th')) {
        targetQuery += \` AND Thang = @filterMonth\`;
      }
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {
      console.warn('Could not query rpTargets, falling back to default targets', e);
    }`;

  content = content.replace(oldTargetBlockRegex, newTargetBlock);

  fs.writeFileSync('src/app/api/stats/route.ts', content);
  console.log('Fixed route.ts with regex');
}

fix3();
