export interface DashboardData {
  isMock: boolean;
  kpis: {
    totalDeclarations: number;
    totalValueUSD: number;
    totalContainers: number;
    totalWeightTNE: number;
    totalTaxVND: number;
  };
  taxBreakdown: {
    thueXNK: number;
    thueV: number;
    thueT: number;
    thueM: number;
    thueB: number;
    thueG: number;
    thueKhac: number;
  };
  trends: Array<{
    date: string;
    valueUSD: number;
    declarations: number;
    taxVND: number;
  }>;
  channels: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  commodities: Array<{
    name: string;
    valueVND: number;
    taxVND: number;
    quantity: number;
  }>;
  countries: Array<{
    code: string;
    name: string;
    valueUSD: number;
  }>;
  enterprises: Array<{
    taxId: string;
    name: string;
    valueUSD: number;
    declarations: number;
    containers: number;
  }>;
}

export function getMockStats(startDate?: string, endDate?: string, loaiXNK?: string): DashboardData {
  // Generate high quality mock data based on Vietnamese customs context
  const start = startDate ? new Date(startDate) : new Date('2026-01-01');
  const end = endDate ? new Date(endDate) : new Date('2026-06-30');
  
  // Calculate difference in months to generate trends
  const months: string[] = [];
  const current = new Date(start);
  current.setDate(1);
  while (current <= end) {
    const monthStr = current.toLocaleString('default', { month: '2-digit' }) + '/' + current.getFullYear();
    if (!months.includes(monthStr)) {
      months.push(monthStr);
    }
    current.setMonth(current.getMonth() + 1);
  }
  
  // Handle empty list
  if (months.length === 0) {
    months.push('06/2026');
  }

  // Define multipliers based on import/export type
  let multiplier = 1.0;
  if (loaiXNK === 'NK') multiplier = 0.55;
  if (loaiXNK === 'XK') multiplier = 0.45;

  const totalDeclarations = Math.round(15240 * multiplier);
  const totalValueUSD = 482590000 * multiplier;
  const totalContainers = Math.round(28400 * multiplier);
  const totalWeightTNE = 352400 * multiplier;
  const totalTaxVND = 1254300000000 * multiplier; // 1,254 billion VND

  // Generate trends
  const trends = months.map((m, idx) => {
    // Generate slight seasonality
    const factor = 0.85 + Math.sin(idx * 1.5) * 0.15;
    return {
      date: m,
      valueUSD: Math.round((totalValueUSD / months.length) * factor),
      declarations: Math.round((totalDeclarations / months.length) * factor),
      taxVND: Math.round((totalTaxVND / months.length) * factor),
    };
  });

  // Channels distribution: Green (65%), Yellow (30%), Red (5%)
  const channels = [
    { name: 'Luồng Xanh', value: Math.round(totalDeclarations * 0.65), color: '#10B981' },
    { name: 'Luồng Vàng', value: Math.round(totalDeclarations * 0.30), color: '#F59E0B' },
    { name: 'Luồng Đỏ', value: Math.round(totalDeclarations * 0.05), color: '#EF4444' }
  ];

  // Tax Breakdown
  const taxBreakdown = {
    thueXNK: Math.round(totalTaxVND * 0.35),  // 35%
    thueV: Math.round(totalTaxVND * 0.45),    // 45% (VAT is largest)
    thueT: Math.round(totalTaxVND * 0.12),    // 12% (SCT)
    thueM: Math.round(totalTaxVND * 0.04),    // 4% (Environmental)
    thueB: Math.round(totalTaxVND * 0.015),   // 1.5% (Self-defense)
    thueG: Math.round(totalTaxVND * 0.01),    // 1% (Other)
    thueKhac: Math.round(totalTaxVND * 0.015) // 1.5% (Other collected tax)
  };

  // Commodities
  const commoditiesList = [
    { name: 'Máy tính, sản phẩm điện tử và linh kiện', pct: 0.28, taxPct: 0.15 },
    { name: 'Máy móc, thiết bị, dụng cụ phụ tùng khác', pct: 0.18, taxPct: 0.20 },
    { name: 'Điện thoại các loại và linh kiện', pct: 0.14, taxPct: 0.08 },
    { name: 'Sắt thép các loại', pct: 0.08, taxPct: 0.15 },
    { name: 'Dệt, may, da giày', pct: 0.12, taxPct: 0.10 },
    { name: 'Xăng dầu các loại', pct: 0.06, taxPct: 0.22 },
    { name: 'Hóa chất và sản phẩm hóa chất', pct: 0.05, taxPct: 0.06 },
    { name: 'Nông sản, thủy sản các loại', pct: 0.05, taxPct: 0.04 },
  ];

  const commodities = commoditiesList.map(item => ({
    name: item.name,
    valueVND: Math.round(totalValueUSD * 25000 * item.pct), // Approximate USD to VND
    taxVND: Math.round(totalTaxVND * item.taxPct),
    quantity: Math.round(totalWeightTNE * item.pct * 1.5),
  })).sort((a, b) => b.valueVND - a.valueVND);

  // Top partner countries
  const countries = [
    { code: 'CN', name: 'Trung Quốc', valueUSD: Math.round(totalValueUSD * 0.38) },
    { code: 'US', name: 'Hoa Kỳ', valueUSD: Math.round(totalValueUSD * 0.22) },
    { code: 'KR', name: 'Hàn Quốc', valueUSD: Math.round(totalValueUSD * 0.15) },
    { code: 'JP', name: 'Nhật Bản', valueUSD: Math.round(totalValueUSD * 0.09) },
    { code: 'DE', name: 'Đức', valueUSD: Math.round(totalValueUSD * 0.04) },
    { code: 'SG', name: 'Singapore', valueUSD: Math.round(totalValueUSD * 0.04) },
    { code: 'TH', name: 'Thái Lan', valueUSD: Math.round(totalValueUSD * 0.04) },
    { code: 'OTHER', name: 'Các nước khác', valueUSD: Math.round(totalValueUSD * 0.04) },
  ].sort((a, b) => b.valueUSD - a.valueUSD);

  // Top enterprises
  const enterprises = [
    { taxId: '0100793405', name: 'CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM', valueUSD: Math.round(totalValueUSD * 0.16), declarations: Math.round(totalDeclarations * 0.08), containers: Math.round(totalContainers * 0.12) },
    { taxId: '3600252879', name: 'CÔNG TY CỔ PHẦN THÉP HÒA PHÁT DUNG QUẤT', valueUSD: Math.round(totalValueUSD * 0.07), declarations: Math.round(totalDeclarations * 0.04), containers: Math.round(totalContainers * 0.06) },
    { taxId: '0100101308', name: 'TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP', valueUSD: Math.round(totalValueUSD * 0.05), declarations: Math.round(totalDeclarations * 0.03), containers: Math.round(totalContainers * 0.02) },
    { taxId: '3500101112', name: 'LIÊN DOANH VIỆT - NGA VIETSOVPETRO', valueUSD: Math.round(totalValueUSD * 0.045), declarations: Math.round(totalDeclarations * 0.02), containers: Math.round(totalContainers * 0.01) },
    { taxId: '0302568603', name: 'CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)', valueUSD: Math.round(totalValueUSD * 0.04), declarations: Math.round(totalDeclarations * 0.04), containers: Math.round(totalContainers * 0.03) },
    { taxId: '0100150619', name: 'TẬP ĐOÀN XĂNG DẦU VIỆT NAM (PETROLIMEX)', valueUSD: Math.round(totalValueUSD * 0.038), declarations: Math.round(totalDeclarations * 0.03), containers: Math.round(totalContainers * 0.04) },
    { taxId: '1800155054', name: 'CÔNG TY CỔ PHẦN LỌC HÓA DẦU BÌNH SƠN', valueUSD: Math.round(totalValueUSD * 0.035), declarations: Math.round(totalDeclarations * 0.02), containers: Math.round(totalContainers * 0.03) },
    { taxId: '0300996328', name: 'CÔNG TY TNHH NƯỚC GIẢI KHÁT COCA-COLA VIỆT NAM', valueUSD: Math.round(totalValueUSD * 0.025), declarations: Math.round(totalDeclarations * 0.025), containers: Math.round(totalContainers * 0.025) },
  ].sort((a, b) => b.valueUSD - a.valueUSD);

  return {
    isMock: true,
    kpis: {
      totalDeclarations,
      totalValueUSD,
      totalContainers,
      totalWeightTNE,
      totalTaxVND,
    },
    taxBreakdown,
    trends,
    channels,
    commodities,
    countries,
    enterprises,
  };
}
