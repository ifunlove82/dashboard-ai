import { NextRequest, NextResponse } from "next/server";

export interface TradeBalanceData {
  netBalanceMillionUSD: number;
  isSurplus: boolean;
  exportMillionUSD: number;
  importMillionUSD: number;
  yoyChangePct: number;
  prevPeriodBalanceMillionUSD: number;
}

export interface DeclarationKpisData {
  total: number;
  exportCount: number;
  importCount: number;
  ytdTotal: number;
  prevPeriodCount: number;
  yoyChangePct: number;
  channels: {
    green: { count: number; pct: number };
    yellow: { count: number; pct: number };
    red: { count: number; pct: number };
  };
  sparklineData: Array<{ value: number }>;
}

export interface TurnoverKpisData {
  totalMillionUSD: number;
  exportMillionUSD: number;
  importMillionUSD: number;
  exportRatioPct: number;
  importRatioPct: number;
  ytdMillionUSD: number;
  prevPeriodMillionUSD: number;
  yoyChangePct: number;
  avgPerDeclarationUSD: number;
  avgChangePct: number;
  sparklineData: Array<{ value: number }>;
}

export interface DeclarationItem {
  id: string;
  declarationNo: string;
  date: string;
  enterpriseCode: string;
  enterpriseName: string;
  regimeCode: string;
  channel: "green" | "yellow" | "red";
  flow: "XK" | "NK";
  turnoverUSD: number;
  status: string;
}

export interface DeclarationsTurnoverResponse {
  tradeBalance: TradeBalanceData;
  declarationKpis: DeclarationKpisData;
  turnoverKpis: TurnoverKpisData;
  charts: {
    declarationsLast6Periods: Array<{
      period: string;
      exportCount: number;
      importCount: number;
      total: number;
    }>;
    turnoverLast6Periods: Array<{
      period: string;
      exportUSD: number;
      importUSD: number;
      totalUSD: number;
    }>;
    tradeBalanceLast6Periods: Array<{
      period: string;
      netBalance: number;
      isSurplus: boolean;
    }>;
    importExportRatio: Array<{
      name: string;
      value: number;
      pct: number;
      color: string;
    }>;
    byRegime: Array<{
      code: string;
      name: string;
      declarations: number;
      turnoverUSD: number;
    }>;
    channelDistribution: Array<{
      name: string;
      count: number;
      pct: number;
      color: string;
    }>;
    byUnit: Array<{
      unitId: string;
      name: string;
      declarations: number;
      turnoverUSD: number;
    }>;
    byCommodity: Array<{
      id: string;
      name: string;
      turnoverUSD: number;
      declarations: number;
      pct: number;
    }>;
    correlation: Array<{
      name: string;
      declarations: number;
      turnoverUSD: number;
      avgUSD: number;
    }>;
  };
  declarations: DeclarationItem[];
}

const sampleDeclarations: DeclarationItem[] = [
  {
    id: "tk-001",
    declarationNo: "106294817201",
    date: "2024-10-11 08:30",
    enterpriseCode: "0300588569",
    enterpriseName: "Công ty TNHH Samsung Electronics VN",
    regimeCode: "B11",
    channel: "green",
    flow: "XK",
    turnoverUSD: 1450200,
    status: "Thông quan",
  },
  {
    id: "tk-002",
    declarationNo: "106294817202",
    date: "2024-10-11 08:45",
    enterpriseCode: "0200119854",
    enterpriseName: "Công ty TNHH LG Electronics VN",
    regimeCode: "A11",
    channel: "green",
    flow: "NK",
    turnoverUSD: 890500,
    status: "Thông quan",
  },
  {
    id: "tk-003",
    declarationNo: "106294817203",
    date: "2024-10-11 09:10",
    enterpriseCode: "0312456789",
    enterpriseName: "Công ty TNHH Intel Products VN",
    regimeCode: "E21",
    channel: "yellow",
    flow: "NK",
    turnoverUSD: 2340000,
    status: "Chờ kiểm tra hồ sơ",
  },
  {
    id: "tk-004",
    declarationNo: "106294817204",
    date: "2024-10-11 09:25",
    enterpriseCode: "3700145298",
    enterpriseName: "Tổng Công ty May Đức Giang - CTCP",
    regimeCode: "B11",
    channel: "green",
    flow: "XK",
    turnoverUSD: 312000,
    status: "Thông quan",
  },
  {
    id: "tk-005",
    declarationNo: "106294817205",
    date: "2024-10-11 09:40",
    enterpriseCode: "3500891234",
    enterpriseName: "CTCP Thép Hòa Phát Dung Quất",
    regimeCode: "A12",
    channel: "red",
    flow: "NK",
    turnoverUSD: 4150000,
    status: "Chờ kiểm hóa thực tế",
  },
  {
    id: "tk-006",
    declarationNo: "106294817206",
    date: "2024-10-11 10:05",
    enterpriseCode: "0100109106",
    enterpriseName: "Tập đoàn CN - Viễn thông Quân đội (Viettel)",
    regimeCode: "A11",
    channel: "green",
    flow: "NK",
    turnoverUSD: 780000,
    status: "Thông quan",
  },
  {
    id: "tk-007",
    declarationNo: "106294817207",
    date: "2024-10-11 10:20",
    enterpriseCode: "2300123987",
    enterpriseName: "CTCP Tập đoàn Thủy sản Minh Phú",
    regimeCode: "B11",
    channel: "green",
    flow: "XK",
    turnoverUSD: 620400,
    status: "Thông quan",
  },
  {
    id: "tk-008",
    declarationNo: "106294817208",
    date: "2024-10-11 10:45",
    enterpriseCode: "0309876543",
    enterpriseName: "Công ty TNHH Foxconn Interconnect",
    regimeCode: "E31",
    channel: "yellow",
    flow: "NK",
    turnoverUSD: 1820000,
    status: "Chờ kiểm tra hồ sơ",
  },
  {
    id: "tk-009",
    declarationNo: "106294817209",
    date: "2024-10-11 11:10",
    enterpriseCode: "3600283921",
    enterpriseName: "Công ty TNHH Hyundai Aluminum Vina",
    regimeCode: "B11",
    channel: "yellow",
    flow: "XK",
    turnoverUSD: 540000,
    status: "Chờ kiểm tra hồ sơ",
  },
  {
    id: "tk-010",
    declarationNo: "106294817210",
    date: "2024-10-11 11:35",
    enterpriseCode: "0201928374",
    enterpriseName: "Công ty TNHH VinFast Trading & Production",
    regimeCode: "A11",
    channel: "red",
    flow: "NK",
    turnoverUSD: 3620000,
    status: "Chờ kiểm hóa thực tế",
  },
  {
    id: "tk-011",
    declarationNo: "106294817211",
    date: "2024-10-11 13:15",
    enterpriseCode: "0109871234",
    enterpriseName: "Công ty Cổ phần Sữa Việt Nam (Vinamilk)",
    regimeCode: "B11",
    channel: "green",
    flow: "XK",
    turnoverUSD: 495000,
    status: "Thông quan",
  },
  {
    id: "tk-012",
    declarationNo: "106294817212",
    date: "2024-10-11 13:40",
    enterpriseCode: "0311223344",
    enterpriseName: "Công ty TNHH Yazaki HP Việt Nam",
    regimeCode: "E21",
    channel: "green",
    flow: "NK",
    turnoverUSD: 720000,
    status: "Thông quan",
  },
  {
    id: "tk-013",
    declarationNo: "106294817213",
    date: "2024-10-11 14:05",
    enterpriseCode: "3701234890",
    enterpriseName: "Công ty TNHH Nestle Việt Nam",
    regimeCode: "G12",
    channel: "yellow",
    flow: "XK",
    turnoverUSD: 280000,
    status: "Chờ kiểm tra hồ sơ",
  },
  {
    id: "tk-014",
    declarationNo: "106294817214",
    date: "2024-10-11 14:30",
    enterpriseCode: "3600987123",
    enterpriseName: "Công ty TNHH C.P. Việt Nam",
    regimeCode: "A11",
    channel: "green",
    flow: "NK",
    turnoverUSD: 640000,
    status: "Thông quan",
  },
  {
    id: "tk-015",
    declarationNo: "106294817215",
    date: "2024-10-11 14:55",
    enterpriseCode: "0101234567",
    enterpriseName: "Tổng Công ty Hàng không Việt Nam - CTCP",
    regimeCode: "B13",
    channel: "red",
    flow: "XK",
    turnoverUSD: 910000,
    status: "Chờ kiểm hóa thực tế",
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const unit = searchParams.get("unit") || "all";
  const period = searchParams.get("period") || "current";
  const flow = searchParams.get("flow") || "all";
  const channel = searchParams.get("channel") || "all";
  const commodity = searchParams.get("commodity") || "all";
  const regime = searchParams.get("regime") || "all";

  // Calculate scaling multiplier based on customs unit
  const unitLower = unit.toLowerCase();
  let multiplier = 1.0;
  if (unitLower === "cuc_hcm") {
    multiplier = 0.52;
  } else if (unitLower === "cuc_hp") {
    multiplier = 0.33;
  } else if (unitLower === "cuc_brvt") {
    multiplier = 0.15;
  } else if (unitLower === "cuc_dn") {
    multiplier = 0.22;
  } else if (unitLower === "cuc_bd") {
    multiplier = 0.28;
  } else if (unitLower === "all" || unitLower === "") {
    multiplier = 1.0;
  } else {
    multiplier = 0.25;
  }

  // 1. Turnover KPIs
  const totalMillionUSD = Math.round(28450.5 * multiplier * 10) / 10;
  const exportMillionUSD = Math.round(14950.2 * multiplier * 10) / 10;
  const importMillionUSD = Math.round(13500.3 * multiplier * 10) / 10;
  const exportRatioPct = 52.5;
  const importRatioPct = 47.5;
  const ytdMillionUSD = Math.round(265400.0 * multiplier * 10) / 10;
  const prevPeriodMillionUSD = Math.round(27100.2 * multiplier * 10) / 10;
  const turnoverYoyChangePct = 12.6;

  // 2. Declaration KPIs
  const totalDeclarations = Math.round(185420 * multiplier);
  const exportCount = Math.round(88210 * multiplier);
  const importCount = Math.round(97210 * multiplier);
  const ytdTotal = Math.round(1682300 * multiplier);
  const prevPeriodCount = Math.round(179350 * multiplier);
  const declarationYoyChangePct = 8.4;

  const avgPerDeclarationUSD =
    totalDeclarations > 0
      ? Math.round((totalMillionUSD * 1e6) / totalDeclarations)
      : 0;
  const avgChangePct = 3.8;

  const declarationChannels = {
    green: { count: Math.round(120523 * multiplier), pct: 65.0 },
    yellow: { count: Math.round(55626 * multiplier), pct: 30.0 },
    red: { count: Math.round(9271 * multiplier), pct: 5.0 },
  };

  const declarationSparkline = [
    138500, 142000, 146200, 151800, 157400, 161200, 166500, 170100, 173800,
    178200, 181900, 185420,
  ].map((val) => ({
    value: Math.round(val * multiplier),
  }));

  const turnoverSparkline = [
    21200.0, 22150.0, 22900.5, 23800.0, 24650.0, 25200.0, 25900.0, 26400.0,
    26850.5, 27300.0, 27900.0, 28450.5,
  ].map((val) => ({
    value: Math.round(val * multiplier * 10) / 10,
  }));

  // 3. Trade Balance
  const netBalanceMillionUSD =
    Math.round((exportMillionUSD - importMillionUSD) * 10) / 10;
  const isSurplus = netBalanceMillionUSD >= 0;
  const prevPeriodBalanceMillionUSD =
    Math.round(1120.5 * multiplier * 10) / 10;

  const tradeBalance: TradeBalanceData = {
    netBalanceMillionUSD,
    isSurplus,
    exportMillionUSD,
    importMillionUSD,
    yoyChangePct: 11.8,
    prevPeriodBalanceMillionUSD,
  };

  const declarationKpis: DeclarationKpisData = {
    total: totalDeclarations,
    exportCount,
    importCount,
    ytdTotal,
    prevPeriodCount,
    yoyChangePct: declarationYoyChangePct,
    channels: declarationChannels,
    sparklineData: declarationSparkline,
  };

  const turnoverKpis: TurnoverKpisData = {
    totalMillionUSD,
    exportMillionUSD,
    importMillionUSD,
    exportRatioPct,
    importRatioPct,
    ytdMillionUSD,
    prevPeriodMillionUSD,
    yoyChangePct: turnoverYoyChangePct,
    avgPerDeclarationUSD,
    avgChangePct,
    sparklineData: turnoverSparkline,
  };

  // 4. Charts
  const declarationsLast6Periods = [
    {
      period: "T05",
      exportCount: Math.round(79500 * multiplier),
      importCount: Math.round(87200 * multiplier),
      total: Math.round(166700 * multiplier),
    },
    {
      period: "T06",
      exportCount: Math.round(81200 * multiplier),
      importCount: Math.round(89300 * multiplier),
      total: Math.round(170500 * multiplier),
    },
    {
      period: "T07",
      exportCount: Math.round(83400 * multiplier),
      importCount: Math.round(91800 * multiplier),
      total: Math.round(175200 * multiplier),
    },
    {
      period: "T08",
      exportCount: Math.round(85100 * multiplier),
      importCount: Math.round(93900 * multiplier),
      total: Math.round(179000 * multiplier),
    },
    {
      period: "T09",
      exportCount: Math.round(86900 * multiplier),
      importCount: Math.round(95600 * multiplier),
      total: Math.round(182500 * multiplier),
    },
    {
      period: "T10",
      exportCount,
      importCount,
      total: totalDeclarations,
    },
  ];

  const turnoverLast6Periods = [
    {
      period: "T05",
      exportUSD: Math.round(13100.5 * multiplier * 10) / 10,
      importUSD: Math.round(11900.2 * multiplier * 10) / 10,
      totalUSD: Math.round(25000.7 * multiplier * 10) / 10,
    },
    {
      period: "T06",
      exportUSD: Math.round(13520.0 * multiplier * 10) / 10,
      importUSD: Math.round(12250.8 * multiplier * 10) / 10,
      totalUSD: Math.round(25770.8 * multiplier * 10) / 10,
    },
    {
      period: "T07",
      exportUSD: Math.round(13980.4 * multiplier * 10) / 10,
      importUSD: Math.round(12610.1 * multiplier * 10) / 10,
      totalUSD: Math.round(26590.5 * multiplier * 10) / 10,
    },
    {
      period: "T08",
      exportUSD: Math.round(14350.2 * multiplier * 10) / 10,
      importUSD: Math.round(12980.5 * multiplier * 10) / 10,
      totalUSD: Math.round(27330.7 * multiplier * 10) / 10,
    },
    {
      period: "T09",
      exportUSD: Math.round(14690.8 * multiplier * 10) / 10,
      importUSD: Math.round(13240.2 * multiplier * 10) / 10,
      totalUSD: Math.round(27931.0 * multiplier * 10) / 10,
    },
    {
      period: "T10",
      exportUSD: exportMillionUSD,
      importUSD: importMillionUSD,
      totalUSD: totalMillionUSD,
    },
  ];

  const tradeBalanceLast6Periods = turnoverLast6Periods.map((item) => {
    const netBalance = Math.round((item.exportUSD - item.importUSD) * 10) / 10;
    return {
      period: item.period,
      netBalance,
      isSurplus: netBalance >= 0,
    };
  });

  const importExportRatio = [
    { name: "Xuất khẩu", value: exportMillionUSD, pct: 52.5, color: "#3b82f6" },
    { name: "Nhập khẩu", value: importMillionUSD, pct: 47.5, color: "#8b5cf6" },
  ];

  const byRegime = [
    {
      code: "A11",
      name: "Nhập KD tiêu dùng",
      declarations: Math.round(48500 * multiplier),
      turnoverUSD: Math.round(7250.4 * multiplier * 10) / 10,
    },
    {
      code: "B11",
      name: "Xuất kinh doanh",
      declarations: Math.round(44200 * multiplier),
      turnoverUSD: Math.round(6820.1 * multiplier * 10) / 10,
    },
    {
      code: "E21",
      name: "Nhập NVL gia công",
      declarations: Math.round(29800 * multiplier),
      turnoverUSD: Math.round(4310.5 * multiplier * 10) / 10,
    },
    {
      code: "E31",
      name: "Nhập SXXK",
      declarations: Math.round(26400 * multiplier),
      turnoverUSD: Math.round(3980.2 * multiplier * 10) / 10,
    },
    {
      code: "G12",
      name: "Tạm nhập tái xuất",
      declarations: Math.round(14200 * multiplier),
      turnoverUSD: Math.round(2410.8 * multiplier * 10) / 10,
    },
    {
      code: "A12",
      name: "Nhập KD sản xuất",
      declarations: Math.round(12320 * multiplier),
      turnoverUSD: Math.round(1950.5 * multiplier * 10) / 10,
    },
    {
      code: "B13",
      name: "Xuất khẩu đã tạm nhập",
      declarations: Math.round(10000 * multiplier),
      turnoverUSD: Math.round(1728.0 * multiplier * 10) / 10,
    },
  ];

  const channelDistribution = [
    {
      name: "Luồng Xanh",
      count: declarationChannels.green.count,
      pct: 65.0,
      color: "#10b981",
    },
    {
      name: "Luồng Vàng",
      count: declarationChannels.yellow.count,
      pct: 30.0,
      color: "#f59e0b",
    },
    {
      name: "Luồng Đỏ",
      count: declarationChannels.red.count,
      pct: 5.0,
      color: "#ef4444",
    },
  ];

  const byUnit = [
    {
      unitId: "cuc_hcm",
      name: "Cục HQ TP. Hồ Chí Minh",
      declarations: Math.round(74160 * multiplier),
      turnoverUSD: Math.round(11380.2 * multiplier * 10) / 10,
    },
    {
      unitId: "cuc_hp",
      name: "Cục HQ Hải Phòng",
      declarations: Math.round(46350 * multiplier),
      turnoverUSD: Math.round(7112.6 * multiplier * 10) / 10,
    },
    {
      unitId: "cuc_bd",
      name: "Cục HQ Bình Dương",
      declarations: Math.round(27810 * multiplier),
      turnoverUSD: Math.round(4267.5 * multiplier * 10) / 10,
    },
    {
      unitId: "cuc_dn",
      name: "Cục HQ Đồng Nai",
      declarations: Math.round(22250 * multiplier),
      turnoverUSD: Math.round(3414.0 * multiplier * 10) / 10,
    },
    {
      unitId: "cuc_brvt",
      name: "Cục HQ Bà Rịa - Vũng Tàu",
      declarations: Math.round(14850 * multiplier),
      turnoverUSD: Math.round(2276.2 * multiplier * 10) / 10,
    },
  ];

  const byCommodity = [
    {
      id: "may_vi_tinh",
      name: "Máy vi tính & Linh kiện",
      turnoverUSD: Math.round(5850.5 * multiplier * 10) / 10,
      declarations: Math.round(31200 * multiplier),
      pct: 20.6,
    },
    {
      id: "dien_thoai",
      name: "Điện thoại & Linh kiện",
      turnoverUSD: Math.round(4920.3 * multiplier * 10) / 10,
      declarations: Math.round(26800 * multiplier),
      pct: 17.3,
    },
    {
      id: "may_moc",
      name: "Máy móc thiết bị & Phụ tùng",
      turnoverUSD: Math.round(3890.1 * multiplier * 10) / 10,
      declarations: Math.round(24500 * multiplier),
      pct: 13.7,
    },
    {
      id: "det_may",
      name: "Dệt may & May mặc",
      turnoverUSD: Math.round(3410.8 * multiplier * 10) / 10,
      declarations: Math.round(29100 * multiplier),
      pct: 12.0,
    },
    {
      id: "giay_dep",
      name: "Giày dép các loại",
      turnoverUSD: Math.round(2340.2 * multiplier * 10) / 10,
      declarations: Math.round(18400 * multiplier),
      pct: 8.2,
    },
    {
      id: "sat_thep",
      name: "Sắt thép các loại",
      turnoverUSD: Math.round(1950.4 * multiplier * 10) / 10,
      declarations: Math.round(12300 * multiplier),
      pct: 6.9,
    },
    {
      id: "go_san_pham_go",
      name: "Gỗ & Sản phẩm gỗ",
      turnoverUSD: Math.round(1620.5 * multiplier * 10) / 10,
      declarations: Math.round(14200 * multiplier),
      pct: 5.7,
    },
    {
      id: "thuy_san",
      name: "Thủy hải sản",
      turnoverUSD: Math.round(1450.2 * multiplier * 10) / 10,
      declarations: Math.round(11200 * multiplier),
      pct: 5.1,
    },
  ];

  const correlation = [
    {
      name: "Máy vi tính & LK",
      declarations: Math.round(31.2 * multiplier * 10) / 10,
      turnoverUSD: Math.round(5850.5 * multiplier * 10) / 10,
      avgUSD: Math.round((5850.5 * 1e6) / (31.2 * 1000)),
    },
    {
      name: "Điện thoại & LK",
      declarations: Math.round(26.8 * multiplier * 10) / 10,
      turnoverUSD: Math.round(4920.3 * multiplier * 10) / 10,
      avgUSD: Math.round((4920.3 * 1e6) / (26.8 * 1000)),
    },
    {
      name: "Máy móc thiết bị",
      declarations: Math.round(24.5 * multiplier * 10) / 10,
      turnoverUSD: Math.round(3890.1 * multiplier * 10) / 10,
      avgUSD: Math.round((3890.1 * 1e6) / (24.5 * 1000)),
    },
    {
      name: "Dệt may",
      declarations: Math.round(29.1 * multiplier * 10) / 10,
      turnoverUSD: Math.round(3410.8 * multiplier * 10) / 10,
      avgUSD: Math.round((3410.8 * 1e6) / (29.1 * 1000)),
    },
    {
      name: "Giày dép",
      declarations: Math.round(18.4 * multiplier * 10) / 10,
      turnoverUSD: Math.round(2340.2 * multiplier * 10) / 10,
      avgUSD: Math.round((2340.2 * 1e6) / (18.4 * 1000)),
    },
    {
      name: "Sắt thép",
      declarations: Math.round(12.3 * multiplier * 10) / 10,
      turnoverUSD: Math.round(1950.4 * multiplier * 10) / 10,
      avgUSD: Math.round((1950.4 * 1e6) / (12.3 * 1000)),
    },
    {
      name: "Gỗ & SP gỗ",
      declarations: Math.round(14.2 * multiplier * 10) / 10,
      turnoverUSD: Math.round(1620.5 * multiplier * 10) / 10,
      avgUSD: Math.round((1620.5 * 1e6) / (14.2 * 1000)),
    },
    {
      name: "Thủy sản",
      declarations: Math.round(11.2 * multiplier * 10) / 10,
      turnoverUSD: Math.round(1450.2 * multiplier * 10) / 10,
      avgUSD: Math.round((1450.2 * 1e6) / (11.2 * 1000)),
    },
  ];

  // 5. Declarations filtering
  let filteredDeclarations = sampleDeclarations;

  if (flow && flow !== "all") {
    filteredDeclarations = filteredDeclarations.filter(
      (d) => d.flow.toUpperCase() === flow.toUpperCase()
    );
  }

  if (channel && channel !== "all") {
    filteredDeclarations = filteredDeclarations.filter(
      (d) => d.channel.toLowerCase() === channel.toLowerCase()
    );
  }

  if (regime && regime !== "all") {
    filteredDeclarations = filteredDeclarations.filter(
      (d) => d.regimeCode.toUpperCase() === regime.toUpperCase()
    );
  }

  const response: DeclarationsTurnoverResponse = {
    tradeBalance,
    declarationKpis,
    turnoverKpis,
    charts: {
      declarationsLast6Periods,
      turnoverLast6Periods,
      tradeBalanceLast6Periods,
      importExportRatio,
      byRegime,
      channelDistribution,
      byUnit,
      byCommodity,
      correlation,
    },
    declarations: filteredDeclarations,
  };

  return NextResponse.json(response);
}
