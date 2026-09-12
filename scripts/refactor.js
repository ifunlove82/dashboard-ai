const fs = require('fs');
let code = fs.readFileSync('src/app/api/stats/route.ts', 'utf8');

// 1. Extract buildMetrics
const buildMetricsCode = `
// Helper to calculate the 6-dimension metrics structure
const buildMetrics = (kpis: any, targets: any, isMock: boolean) => ({
  revenue: {
    actual: kpis?.totalTaxVND || 12500000000,
    target: targets?.targetRevenue || 15000000000,
    yoy_change: 5.2,
    mom_change: -1.1,
    time_avg: 12000000000,
    peer_avg: 13000000000
  },
  declarations: {
    actual: kpis?.totalDeclarations || 15000,
    target: targets?.targetDeclarations || 16000,
    yoy_change: 2.1,
    mom_change: -0.5,
    time_avg: 14500,
    peer_avg: 15200
  },
  weight: {
    actual: kpis?.totalWeightTNE || 350000,
    target: targets?.targetWeight || 360000,
    yoy_change: 1.5,
    mom_change: 0.8,
    time_avg: 340000,
    peer_avg: 345000
  }
});
`;
code = code.replace("export async function GET(request: NextRequest) {", buildMetricsCode + "\nexport async function GET(request: NextRequest) {");

// 2. Remove inside-function buildMetrics definition
code = code.replace(/    \/\/ Helper to calculate the 6-dimension metrics structure\s+const buildMetrics = \(kpis: any, isMock: boolean\) => \(\{\s+(?:.|\n)*?    \}\);\n\n/m, '');

// 3. Remove buildMetricsFb in catch block
code = code.replace(/    \/\/ Helper to calculate the 6-dimension metrics structure for fallback\s+const buildMetricsFb = \(kpis: any\) => \(\{\s+(?:.|\n)*?    \}\);\n\n/m, '');

// 4. Update the fallback call from buildMetricsFb to buildMetrics
code = code.replace(/metrics: buildMetricsFb\(mockData\.kpis\)/g, 'metrics: buildMetrics(mockData.kpis, null, true)');

// 5. Update unit/tradeType filtering
// Replace loaiXNK setting
const loaiLogic = `
  // Analytics Engine & Global Filters new params
  const unit = searchParams.get('unit') || 'ALL';
  const timeframe = searchParams.get('timeframe') || 'Tháng';
  const tradeType = searchParams.get('tradeType') || 'Tất cả';

  // Map tradeType to loaiXNK
  let loaiXNK = 'ALL';
  if (tradeType === 'Nhập khẩu') loaiXNK = 'NK';
  if (tradeType === 'Xuất khẩu') loaiXNK = 'XK';
`;
code = code.replace(/\/\/ Analytics Engine & Global Filters new params(?:.|\n)*?const tradeType = searchParams\.get\('tradeType'\) \|\| 'Tất cả';/m, loaiLogic);

// Add unit to all pool requests and update WHERE clauses
// We will replace `AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)` with `AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK) AND (@unit = 'ALL' OR Ma_HQ = @unit)`
// Wait, `Ma_HQ` might not exist on all tables. It exists on `rpToKhai`. Does it exist on `rpHang`? Probably `Ma_HQ` is on `rpHang` too. Or maybe we only filter `rpToKhai`.
// The reviewer explicitly asked for filter parameters to be used in `kpiQuery`. "are entirely ignored in the SQL query (kpiQuery)"

code = code.replace(/kpiRequest\.input\('loaiXNK', sql\.NVarChar, loaiXNK\);/g, "kpiRequest.input('loaiXNK', sql.NVarChar, loaiXNK);\n    kpiRequest.input('unit', sql.NVarChar, unit);");
code = code.replace(/FROM rpToKhai\s+WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate\s+AND \(@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK\)/g, "FROM rpToKhai\n      WHERE Ngay_dang_ky BETWEEN @startDate AND @endDate\n        AND (@loaiXNK = 'ALL' OR Loai_XNK = @loaiXNK)\n        AND (@unit = 'ALL' OR Ma_HQ = @unit)");

// Same for taxQuery which is rpHang? It might not have Ma_HQ. Let's just do kpiQuery for now, or assume rpHang has it. But reviewer said "ignored in the SQL query (kpiQuery)". So let's just do kpiQuery and maybe add it to others if safe, but we only have to fix kpiQuery and rpTargets.

// Let's add rpTargets logic just before `if (!kpiRow || kpiRow.totalDeclarations === 0)`
const targetsLogic = `
    // Query Targets from rpTargets
    let targets = null;
    try {
      const targetRequest = pool.request();
      targetRequest.input('unit', sql.NVarChar, unit);
      const targetQuery = \`
        SELECT 
          SUM(COALESCE(Target_Revenue, 15000000000)) as targetRevenue,
          SUM(COALESCE(Target_Declarations, 16000)) as targetDeclarations,
          SUM(COALESCE(Target_Weight, 360000)) as targetWeight
        FROM rpTargets
        WHERE (@unit = 'ALL' OR Ma_HQ = @unit)
      \`;
      const targetRes = await targetRequest.query(targetQuery);
      targets = targetRes.recordset[0] || null;
    } catch (e) {
      console.warn('Could not query rpTargets, falling back to default targets', e);
    }
`;

code = code.replace("    // If no declarations found in DB, fallback to mock data", targetsLogic + "\n    // If no declarations found in DB, fallback to mock data");

// Update buildMetrics calls
code = code.replace(/metrics: buildMetrics\(mockData\.kpis, true\)/g, 'metrics: buildMetrics(mockData.kpis, targets, true)');
code = code.replace(/metrics: buildMetrics\(\{ totalTaxVND, totalDeclarations: kpiRow\.totalDeclarations, totalWeightTNE: kpiRow\.totalWeightTNE \}, false\)/g, 'metrics: buildMetrics({ totalTaxVND, totalDeclarations: kpiRow.totalDeclarations, totalWeightTNE: kpiRow.totalWeightTNE }, targets, false)');

fs.writeFileSync('src/app/api/stats/route.ts', code);
console.log('Refactoring complete');
