const fs = require('fs');

async function fix() {
  let content = fs.readFileSync('src/app/api/stats/route.ts', 'utf8');

  // Fix 1: loaiXNK parsing
  content = content.replace(
    /  \/\/ Map tradeType to SQL loaiXNK\s+let loaiXNK = 'ALL';\s+if \(tradeType === 'Nhập khẩu'\) loaiXNK = 'NK';\s+if \(tradeType === 'Xuất khẩu'\) loaiXNK = 'XK';/m,
    `  // Map tradeType to SQL loaiXNK
  let loaiXNK = ['ALL', 'NK', 'XK'].includes(rawLoaiXNK) ? rawLoaiXNK : 'ALL';
  if (tradeType === 'Nhập khẩu') loaiXNK = 'NK';
  if (tradeType === 'Xuất khẩu') loaiXNK = 'XK';`
  );

  // Fix 2: kpiQuery timeframe integration
  // Extract startDateStr mapping first so we can parse it
  const filterVars = `
  const start = new Date(startDateStr);
  const filterMonth = start.getMonth() + 1;
  const filterYear = start.getFullYear();

  console.log(\`Fetching stats for range: \${startDateStr} to \${endDateStr}, type: \${loaiXNK}\`);`;
  
  content = content.replace(
    /  console\.log\(\`Fetching stats for range: \$\{startDateStr\} to \$\{endDateStr\}, type: \$\{loaiXNK\}\`\);/m,
    filterVars
  );

  const kpiBlockOld = `    const kpiRequest = pool.request();
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

  const kpiBlockNew = `    const kpiRequest = pool.request();
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

    if (timeframe === 'Tháng') {
      kpiQuery += \` AND MONTH(Ngay_dang_ky) = @filterMonth AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else if (timeframe === 'Năm') {
      kpiQuery += \` AND YEAR(Ngay_dang_ky) = @filterYear\`;
    } else {
      kpiQuery += \` AND Ngay_dang_ky BETWEEN @startDate AND @endDate\`;
    }`;

  content = content.replace(kpiBlockOld, kpiBlockNew);

  // Fix 3 & 5: rpTargets query
  const targetBlockOldRegex = /    \/\/ 1b\. Query Targets from rpTargets(?:.|\n)*?    \} catch \(e\) \{/m;
  
  const targetBlockNew = `    // 1b. Query Targets from rpTargets
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
      if (timeframe === 'Tháng') {
        targetQuery += \` AND Thang = @filterMonth\`;
      }
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {`;

  content = content.replace(targetBlockOldRegex, targetBlockNew);

  fs.writeFileSync('src/app/api/stats/route.ts', content);
  console.log('Fixed route.ts');
}

fix();
