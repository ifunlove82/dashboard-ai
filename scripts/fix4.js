const fs = require('fs');
let content = fs.readFileSync('src/app/api/stats/route.ts', 'utf8');

const startIdx = content.indexOf('    // 1b. Query Targets from rpTargets');
const endIdx = content.indexOf('    // If no declarations found in DB');

if (startIdx !== -1 && endIdx !== -1) {
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
      if (timeframe === 'Tháng' || timeframe.includes('Th')) {
        targetQuery += \` AND Thang = @filterMonth\`;
      }
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {
      console.warn('Could not query rpTargets, falling back to default targets', e);
    }
    
`;
  content = content.substring(0, startIdx) + newTargetBlock + content.substring(endIdx);
  fs.writeFileSync('src/app/api/stats/route.ts', content);
  console.log('Fixed rpTargets block');
} else {
  console.log('Could not find indices');
}
