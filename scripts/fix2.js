const fs = require('fs');

async function fix2() {
  let content = fs.readFileSync('src/app/api/stats/route.ts', 'utf8');

  // Fix kpiQuery block
  const oldKpiBlock = `    // 1. Query KPIs from rpToKhai
    const kpiRequest = pool.request();
    kpiRequest.input('startDate', sql.Date, startDateStr);
    kpiRequest.input('endDate', sql.Date, endDateStr);
    kpiRequest.input('loaiXNK', sql.NVarChar, loaiXNK);
    kpiRequest.input('unit', sql.NVarChar, unit);
    
    const kpiQuery = \`
      SELECT 
        COUNT(*) as totalDeclarations,
        SUM(COALESCE(Kim_ngach_USD, 0)) as totalValueUSD,
        SUM(COALESCE(So_luong_cont, 0)) as totalContainers,
        SUM(COALESCE(Tong_trong_luong_TNE, 0)) as totalWeightTNE,
        SUM(COALESCE(Tong_thue_thu_khac_VND, 0)) as totalOtherTaxVND
      FROM rpToKhai
      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate
        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)
        AND (@unit = 'ALL' OR Ma_HQ = @unit)
    \`;`;

  const newKpiBlock = `    // 1. Query KPIs from rpToKhai
    const kpiRequest = pool.request();
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

    if (timeframe === 'Tháng' || timeframe === 'ThAng') {
      kpiQuery += \` AND MONTH(Ngay_dang_ky) = @filterMonth AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else if (timeframe === 'Năm') {
      kpiQuery += \` AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else {
      kpiQuery += \` AND Ngay_dang_ky BETWEEN @startDate AND @endDate\`;
    }`;

  if (content.includes(oldKpiBlock)) {
    content = content.replace(oldKpiBlock, newKpiBlock);
    console.log("kpiBlock replaced");
  } else {
    console.log("kpiBlock NOT found");
  }

  // Fix targetQuery block
  const oldTargetBlock = `    // 1b. Query Targets from rpTargets
    let targets = null;
    try {
      const targetRequest = pool.request();
      targetRequest.input('unit', sql.NVarChar, unit);
      targetRequest.input('timeframe', sql.NVarChar, timeframe);
      const targetQuery = \`
        SELECT 
          SUM(COALESCE(Target_Revenue, 15000000000)) as targetRevenue,
          SUM(COALESCE(Target_Declarations, 16000)) as targetDeclarations,
          SUM(COALESCE(Target_Weight, 360000)) as targetWeight
        FROM rpTargets
        WHERE (@unit = 'ALL' OR Ma_HQ = @unit)
          AND (@timeframe = 'ALL' OR Thoi_Gian = @timeframe OR @timeframe IS NOT NULL)
      \`;
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {
      console.warn('Could not query rpTargets, falling back to default targets', e);
    }`;

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
      if (timeframe === 'Tháng' || timeframe === 'ThAng') {
        targetQuery += \` AND Thang = @filterMonth\`;
      }
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {
      console.warn('Could not query rpTargets, falling back to default targets', e);
    }`;

  if (content.includes(oldTargetBlock)) {
    content = content.replace(oldTargetBlock, newTargetBlock);
    console.log("targetBlock replaced");
  } else {
    console.log("targetBlock NOT found");
  }

  // Double check loaiXNK block
  // If we already replaced it, the code might be good. Let's see what's in the file.
  
  fs.writeFileSync('src/app/api/stats/route.ts', content);
  console.log('Fixed route.ts 2');
}

fix2();
