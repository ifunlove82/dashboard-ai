export interface MockPhiCSHT {
  id: string;
  ngayDangKy: string;
  soTien: number;
  maHQ?: string;
  loaiXNK?: string;
  maDNXNK?: string;
  loaiHang?: string;
}

export interface MockHieuSuatCongChuc {
  id: string;
  maCongChuc: string;
  tenCongChuc?: string;
  ngay: string;
  toKhaiXanh: number;
  toKhaiVang: number;
  toKhaiDo: number;
  viPham: number;
  thoiGianXuLyTbPhut?: number;
}

export interface MockDeclaration {
  id: string;
  ngayDangKy: string;
  tongToKhai: number;
  maHQ: string;
  maLH: string;
  maDNXNK: string;
  tenDNXNK: string;
  luong: string;
  loaiXNK: string;
  nuocXNK: string;
  diaDiemGiamSat: string;
  soLuongCont: number;
  tongTrongLuongTNE: number;
  kimNgachUSD: number;
  tongThueThuKhacVND: number;
  trongThongKe: boolean;
  thoiDiemDangKy: string;
  thoiDiemPhanLuong: string;
  thoiDiemThongQuan: string;
  maCongChuc: string;
}

export interface DashboardData {
  isMock: boolean;
  kpis: {
    totalDeclarations: number;
    totalValueUSD: number;
    totalContainers: number;
    totalWeightTNE: number;
    totalTaxVND: number;
    totalDeclarationsInStats?: number;
    totalValueUSDInStats?: number;
    totalPhiCSHTVND?: number;
    targetPhiCSHTVND?: number;
    activeEnterprises?: number;
    newEnterprises?: number;
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
    feeCSHTVND?: number;
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
  topEnterprises?: Array<{
    taxId: string;
    name: string;
    valueUSD: number;
    declarations: number;
    containers: number;
  }>;
  phiCSHT?: {
    totalFeeVND: number;
    targetVND: number;
    completionRate: number;
    growthYoY: number;
    growthMoM: number;
    byType: Array<{ type: string; valueVND: number; percentage: number }>;
    byCargo: Array<{ cargo: string; valueVND: number; percentage: number }>;
    topEnterprises: Array<{ taxId: string; name: string; feeVND: number; count: number }>;
    trends: Array<{ date: string; feeVND: number }>;
  };
  officerPerformance?: Array<{
    maCongChuc: string;
    tenCongChuc: string;
    workload: number;
    toKhaiXanh: number;
    toKhaiVang: number;
    toKhaiDo: number;
    viPham: number;
    hitRatePct: number;
    avgLeadTimeMinutes: number;
  }>;
  clearance?: {
    totalInStats: number;
    totalOutOfStats: number;
    inStatsValueUSD: number;
    outOfStatsValueUSD: number;
    exportDeclarations: number;
    exportValueUSD: number;
    importDeclarations: number;
    importValueUSD: number;
    tradeBalanceUSD: number;
    avgLeadTimeMinutes: number;
    leadTimeByLane: {
      green: number;
      yellow: number;
      red: number;
    };
  };
}

export const MOCK_OFFICERS = [
  { code: 'CC01', name: 'Nguyễn Văn An' },
  { code: 'CC02', name: 'Trần Thị Bình' },
  { code: 'CC03', name: 'Lê Hoàng Cường' },
  { code: 'CC04', name: 'Phạm Minh Đức' },
  { code: 'CC05', name: 'Hoàng Thị Mai' },
  { code: 'CC06', name: 'Vũ Quốc Hùng' },
  { code: 'CC07', name: 'Đỗ Bích Ngọc' },
  { code: 'CC08', name: 'Ngô Tuấn Anh' }
];

export const mockPhiCSHT: MockPhiCSHT[] = [
  { id: 'phi-001', ngayDangKy: '2026-01-15', soTien: 1450000, maHQ: '01AB', loaiXNK: 'NK', maDNXNK: '0100793405', loaiHang: 'Container' },
  { id: 'phi-002', ngayDangKy: '2026-01-22', soTien: 3200000, maHQ: '01AB', loaiXNK: 'XK', maDNXNK: '3600252879', loaiHang: 'Hàng rời' },
  { id: 'phi-003', ngayDangKy: '2026-02-10', soTien: 950000, maHQ: '02CI', loaiXNK: 'NK', maDNXNK: '0100101308', loaiHang: 'Container' },
  { id: 'phi-004', ngayDangKy: '2026-02-18', soTien: 2100000, maHQ: '03EE', loaiXNK: 'NK', maDNXNK: '3500101112', loaiHang: 'Hàng lỏng' },
  { id: 'phi-005', ngayDangKy: '2026-03-05', soTien: 1800000, maHQ: '43NG', loaiXNK: 'XK', maDNXNK: '0302568603', loaiHang: 'Container' },
  { id: 'phi-006', ngayDangKy: '2026-03-19', soTien: 4500000, maHQ: '51CD', loaiXNK: 'NK', maDNXNK: '0100150619', loaiHang: 'Hàng lỏng' },
  { id: 'phi-007', ngayDangKy: '2026-04-12', soTien: 2750000, maHQ: '01AB', loaiXNK: 'XK', maDNXNK: '1800155054', loaiHang: 'Container' },
  { id: 'phi-008', ngayDangKy: '2026-04-28', soTien: 1200000, maHQ: '02CI', loaiXNK: 'NK', maDNXNK: '0300996328', loaiHang: 'Container' },
  { id: 'phi-009', ngayDangKy: '2026-05-14', soTien: 3100000, maHQ: '03EE', loaiXNK: 'NK', maDNXNK: '3700148156', loaiHang: 'Hàng rời' },
  { id: 'phi-010', ngayDangKy: '2026-05-27', soTien: 1650000, maHQ: '43NG', loaiXNK: 'XK', maDNXNK: '0300481234', loaiHang: 'Container' },
  { id: 'phi-011', ngayDangKy: '2026-06-02', soTien: 2900000, maHQ: '51CD', loaiXNK: 'NK', maDNXNK: '0100793405', loaiHang: 'Container' }
];

export const mockHieuSuatCongChuc: MockHieuSuatCongChuc[] = [
  { id: 'hs-001', maCongChuc: 'CC01', tenCongChuc: 'Nguyễn Văn An', ngay: '2026-05-02', toKhaiXanh: 28, toKhaiVang: 12, toKhaiDo: 3, viPham: 1, thoiGianXuLyTbPhut: 24.5 },
  { id: 'hs-002', maCongChuc: 'CC02', tenCongChuc: 'Trần Thị Bình', ngay: '2026-05-02', toKhaiXanh: 32, toKhaiVang: 8, toKhaiDo: 2, viPham: 0, thoiGianXuLyTbPhut: 18.2 },
  { id: 'hs-003', maCongChuc: 'CC03', tenCongChuc: 'Lê Hoàng Cường', ngay: '2026-05-02', toKhaiXanh: 22, toKhaiVang: 15, toKhaiDo: 4, viPham: 2, thoiGianXuLyTbPhut: 32.1 },
  { id: 'hs-004', maCongChuc: 'CC04', tenCongChuc: 'Phạm Minh Đức', ngay: '2026-05-02', toKhaiXanh: 26, toKhaiVang: 10, toKhaiDo: 2, viPham: 0, thoiGianXuLyTbPhut: 22.4 },
  { id: 'hs-005', maCongChuc: 'CC05', tenCongChuc: 'Hoàng Thị Mai', ngay: '2026-05-02', toKhaiXanh: 30, toKhaiVang: 9, toKhaiDo: 1, viPham: 0, thoiGianXuLyTbPhut: 19.8 },
  { id: 'hs-006', maCongChuc: 'CC06', tenCongChuc: 'Vũ Quốc Hùng', ngay: '2026-05-02', toKhaiXanh: 25, toKhaiVang: 14, toKhaiDo: 3, viPham: 1, thoiGianXuLyTbPhut: 28.6 },
  { id: 'hs-007', maCongChuc: 'CC07', tenCongChuc: 'Đỗ Bích Ngọc', ngay: '2026-05-02', toKhaiXanh: 35, toKhaiVang: 6, toKhaiDo: 1, viPham: 0, thoiGianXuLyTbPhut: 16.5 },
  { id: 'hs-008', maCongChuc: 'CC08', tenCongChuc: 'Ngô Tuấn Anh', ngay: '2026-05-02', toKhaiXanh: 20, toKhaiVang: 16, toKhaiDo: 5, viPham: 2, thoiGianXuLyTbPhut: 36.4 }
];

export const mockDeclarations: MockDeclaration[] = [
  {
    id: 'tk-001',
    ngayDangKy: '2026-05-10',
    tongToKhai: 1,
    maHQ: '01AB',
    maLH: 'A11',
    maDNXNK: '0100793405',
    tenDNXNK: 'CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM',
    luong: 'Xanh',
    loaiXNK: 'NK',
    nuocXNK: 'Hàn Quốc',
    diaDiemGiamSat: 'CẢNG HẢI PHÒNG',
    soLuongCont: 4,
    tongTrongLuongTNE: 48.5,
    kimNgachUSD: 185000,
    tongThueThuKhacVND: 46250000,
    trongThongKe: true,
    thoiDiemDangKy: '2026-05-10T08:15:00',
    thoiDiemPhanLuong: '2026-05-10T08:17:30',
    thoiDiemThongQuan: '2026-05-10T08:21:00',
    maCongChuc: 'CC01'
  },
  {
    id: 'tk-002',
    ngayDangKy: '2026-05-11',
    tongToKhai: 1,
    maHQ: '01AB',
    maLH: 'B11',
    maDNXNK: '3600252879',
    tenDNXNK: 'CÔNG TY CỔ PHẦN THÉP HÒA PHÁT DUNG QUẤT',
    luong: 'Vàng',
    loaiXNK: 'XK',
    nuocXNK: 'Hoa Kỳ',
    diaDiemGiamSat: 'CẢNG HẢI PHÒNG',
    soLuongCont: 6,
    tongTrongLuongTNE: 120.0,
    kimNgachUSD: 310000,
    tongThueThuKhacVND: 0,
    trongThongKe: true,
    thoiDiemDangKy: '2026-05-11T09:30:00',
    thoiDiemPhanLuong: '2026-05-11T09:33:00',
    thoiDiemThongQuan: '2026-05-11T10:15:00',
    maCongChuc: 'CC02'
  },
  {
    id: 'tk-003',
    ngayDangKy: '2026-05-12',
    tongToKhai: 1,
    maHQ: '02CI',
    maLH: 'G11',
    maDNXNK: '0100101308',
    tenDNXNK: 'TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP',
    luong: 'Đỏ',
    loaiXNK: 'NK',
    nuocXNK: 'Đức',
    diaDiemGiamSat: 'CẢNG HẢI PHÒNG',
    soLuongCont: 2,
    tongTrongLuongTNE: 15.2,
    kimNgachUSD: 95000,
    tongThueThuKhacVND: 12500000,
    trongThongKe: false, // Sample / transit / non-trade
    thoiDiemDangKy: '2026-05-12T10:00:00',
    thoiDiemPhanLuong: '2026-05-12T10:04:00',
    thoiDiemThongQuan: '2026-05-12T14:45:00',
    maCongChuc: 'CC03'
  }
];

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
  
  // Statistical Trade breakdown
  const totalDeclarationsInStats = Math.round(totalDeclarations * 0.925);
  const totalValueUSDInStats = Math.round(totalValueUSD * 0.94);
  const totalPhiCSHTVND = Math.round(48500000000 * multiplier); // ~48.5 billion VND
  const targetPhiCSHTVND = Math.round(52000000000 * multiplier); // ~52 billion target

  // Generate trends
  const trends = months.map((m, idx) => {
    const factor = 0.85 + Math.sin(idx * 1.5) * 0.15;
    return {
      date: m,
      valueUSD: Math.round((totalValueUSD / months.length) * factor),
      declarations: Math.round((totalDeclarations / months.length) * factor),
      taxVND: Math.round((totalTaxVND / months.length) * factor),
      feeCSHTVND: Math.round((totalPhiCSHTVND / months.length) * factor),
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
    valueVND: Math.round(totalValueUSD * 25000 * item.pct),
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

  // URD Section: Phí Cơ Sở Hạ Tầng (Seaport Infrastructure Fee)
  const phiCSHT = {
    totalFeeVND: totalPhiCSHTVND,
    targetVND: targetPhiCSHTVND,
    completionRate: Math.round((totalPhiCSHTVND / targetPhiCSHTVND) * 1000) / 10,
    growthYoY: 8.4,
    growthMoM: 3.1,
    byType: [
      { type: 'Nhập khẩu', valueVND: Math.round(totalPhiCSHTVND * 0.58), percentage: 58 },
      { type: 'Xuất khẩu', valueVND: Math.round(totalPhiCSHTVND * 0.42), percentage: 42 }
    ],
    byCargo: [
      { cargo: 'Container', valueVND: Math.round(totalPhiCSHTVND * 0.68), percentage: 68 },
      { cargo: 'Hàng rời', valueVND: Math.round(totalPhiCSHTVND * 0.20), percentage: 20 },
      { cargo: 'Hàng lỏng', valueVND: Math.round(totalPhiCSHTVND * 0.12), percentage: 12 }
    ],
    topEnterprises: [
      { taxId: '0100793405', name: 'CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM', feeVND: Math.round(totalPhiCSHTVND * 0.18), count: 2150 },
      { taxId: '3600252879', name: 'CÔNG TY CỔ PHẦN THÉP HÒA PHÁT DUNG QUẤT', feeVND: Math.round(totalPhiCSHTVND * 0.12), count: 1420 },
      { taxId: '0100150619', name: 'TẬP ĐOÀN XĂNG DẦU VIỆT NAM (PETROLIMEX)', feeVND: Math.round(totalPhiCSHTVND * 0.09), count: 850 },
      { taxId: '1800155054', name: 'CÔNG TY CỔ PHẦN LỌC HÓA DẦU BÌNH SƠN', feeVND: Math.round(totalPhiCSHTVND * 0.08), count: 760 },
      { taxId: '0302568603', name: 'CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)', feeVND: Math.round(totalPhiCSHTVND * 0.06), count: 620 }
    ],
    trends: months.map((m, idx) => ({
      date: m,
      feeVND: Math.round((totalPhiCSHTVND / months.length) * (0.88 + Math.sin(idx * 1.2) * 0.14))
    }))
  };

  // URD Section: Officer Performance (Workload, Lead Time, Hit Rate)
  const officerPerformance = MOCK_OFFICERS.map((off, idx) => {
    const toKhaiXanh = 180 + idx * 25;
    const toKhaiVang = 85 + (idx % 3) * 15;
    const toKhaiDo = 20 + (idx % 4) * 8;
    const workload = toKhaiXanh + toKhaiVang + toKhaiDo;
    const viPham = Math.round(toKhaiDo * 0.25 + toKhaiVang * 0.04);
    const hitRatePct = Math.round((viPham / (toKhaiVang + toKhaiDo)) * 1000) / 10;
    const avgLeadTimeMinutes = Math.round((18 + (idx % 5) * 6.5) * 10) / 10;

    return {
      maCongChuc: off.code,
      tenCongChuc: off.name,
      workload,
      toKhaiXanh,
      toKhaiVang,
      toKhaiDo,
      viPham,
      hitRatePct,
      avgLeadTimeMinutes
    };
  });

  // URD Section: Clearance Statistics (Statistical goods filtering)
  const clearance = {
    totalInStats: totalDeclarationsInStats,
    totalOutOfStats: totalDeclarations - totalDeclarationsInStats,
    inStatsValueUSD: totalValueUSDInStats,
    outOfStatsValueUSD: totalValueUSD - totalValueUSDInStats,
    exportDeclarations: Math.round(totalDeclarationsInStats * 0.46),
    exportValueUSD: Math.round(totalValueUSDInStats * 0.48),
    importDeclarations: Math.round(totalDeclarationsInStats * 0.54),
    importValueUSD: Math.round(totalValueUSDInStats * 0.52),
    tradeBalanceUSD: Math.round(totalValueUSDInStats * (0.48 - 0.52)),
    avgLeadTimeMinutes: 24.8,
    leadTimeByLane: {
      green: 3.2,
      yellow: 36.5,
      red: 220.0
    }
  };

  return {
    isMock: true,
    kpis: {
      totalDeclarations,
      totalValueUSD,
      totalContainers,
      totalWeightTNE,
      totalTaxVND,
      totalDeclarationsInStats,
      totalValueUSDInStats,
      totalPhiCSHTVND,
      targetPhiCSHTVND,
      activeEnterprises: enterprises.length * 15,
      newEnterprises: 18
    },
    taxBreakdown,
    trends,
    channels,
    commodities,
    countries,
    enterprises,
    topEnterprises: enterprises,
    phiCSHT,
    officerPerformance,
    clearance
  };
}

// Helpers for Task 2 endpoints fallback
export function getMockRevenue(startDate?: string, endDate?: string, branch?: string) {
  const stats = getMockStats(startDate, endDate);
  return {
    isMock: true,
    branch: branch || 'ALL',
    kpis: stats.kpis,
    taxBreakdown: stats.taxBreakdown,
    phiCSHT: stats.phiCSHT,
    trends: stats.trends
  };
}

export function getMockClearance(startDate?: string, endDate?: string, branch?: string) {
  const stats = getMockStats(startDate, endDate);
  return {
    isMock: true,
    branch: branch || 'ALL',
    clearance: stats.clearance,
    channels: stats.channels,
    commodities: stats.commodities
  };
}

export function getMockOfficerPerformance(startDate?: string, endDate?: string) {
  const stats = getMockStats(startDate, endDate);
  return {
    isMock: true,
    officers: stats.officerPerformance
  };
}

