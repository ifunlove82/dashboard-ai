import { NextRequest, NextResponse } from "next/server";

export interface SparklinePoint {
  value: number;
}

export interface KpiItem {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  unit: string;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  note?: string;
  sparklineData: SparklinePoint[];
  progress?: number;
  strokeColor?: string;
}

export interface Last6PeriodsChartItem {
  period: string;
  amount: number;
  growth: number;
}

export interface ImportExportChartItem {
  id?: string;
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface CommodityChartItem {
  id?: string;
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface PortChartItem {
  id?: string;
  name: string;
  value: number;
  percentage: number;
  subPorts?: string;
  color?: string;
}

export interface EnterpriseItem {
  id: string;
  rank: number;
  name: string;
  code: string;
  avatar: string;
  tag: string;
  declarationType: string;
  commodityType: string;
  port: string;
  periodAmount: number;
  ytdAmount: number;
  percentage: number;
  status: string;
}

export interface DeclarationItem {
  id: string;
  declarationNo: string;
  date: string;
  port: string;
  type: string;
  commodity: string;
  containers: number;
  amount: number;
  amountBillion: number;
  status: string;
  enterpriseCode: string;
  enterpriseName: string;
}

function getMultiplier(unit: string | null, taxType: string | null, enterprise: string | null): number {
  if (enterprise) return 0.05;
  if (taxType) return 0.2;
  if (unit && unit !== "ALL") return 0.4;
  return 1.0;
}

function roundTo(val: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round(val * factor) / factor;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl?.searchParams || new URL(request.url).searchParams;
  const unit = searchParams.get("unit");
  const taxType = searchParams.get("taxType");
  const enterprise = searchParams.get("enterprise");

  const multiplier = getMultiplier(unit, taxType, enterprise);

  const kpis: KpiItem[] = [
    {
      id: "current_period",
      title: "THU KỲ BÁO CÁO (T10)",
      value: roundTo(1245.8 * multiplier, 1),
      formattedValue: `${roundTo(1245.8 * multiplier, 1).toLocaleString("vi-VN")} Tỷ`,
      unit: "Tỷ VNĐ",
      change: "+8.2%",
      changeType: "positive",
      note: "Tăng 8.2% so với kỳ trước",
      sparklineData: [
        { value: 42 },
        { value: 48 },
        { value: 45 },
        { value: 54 },
        { value: 50 },
        { value: 62 },
        { value: 68 }
      ],
      strokeColor: "#3b82f6"
    },
    {
      id: "ytd",
      title: "THU PHÍ YTD 2024",
      value: roundTo(12850.5 * multiplier, 1),
      formattedValue: `${roundTo(12850.5 * multiplier, 1).toLocaleString("vi-VN")} Tỷ`,
      unit: "Tỷ VNĐ",
      change: "+14.6%",
      changeType: "positive",
      note: "Lũy kế từ đầu năm",
      sparklineData: [
        { value: 30 },
        { value: 45 },
        { value: 60 },
        { value: 75 },
        { value: 92 },
        { value: 110 },
        { value: 128 }
      ],
      strokeColor: "#1d4ed8"
    },
    {
      id: "yoy",
      title: "TĂNG TRƯỞNG YOY",
      value: 14.6,
      formattedValue: "+14.6%",
      unit: "%",
      change: "+2.3%",
      changeType: "positive",
      note: "So với cùng kỳ 2023",
      sparklineData: [
        { value: 8 },
        { value: 10 },
        { value: 9 },
        { value: 12 },
        { value: 11 },
        { value: 13 },
        { value: 14.6 }
      ],
      strokeColor: "#f59e0b"
    },
    {
      id: "previous_period",
      title: "THU KỲ TRƯỚC (T09)",
      value: roundTo(1150.2 * multiplier, 1),
      formattedValue: `${roundTo(1150.2 * multiplier, 1).toLocaleString("vi-VN")} Tỷ`,
      unit: "Tỷ VNĐ",
      change: "-3.1%",
      changeType: "negative",
      note: "Thực thu tháng 9",
      sparklineData: [
        { value: 58 },
        { value: 54 },
        { value: 52 },
        { value: 50 },
        { value: 49 },
        { value: 47 },
        { value: 45 }
      ],
      strokeColor: "#64748b"
    },
    {
      id: "target",
      title: "KẾ HOẠCH NĂM 2024",
      value: roundTo(14500.0 * multiplier, 1),
      formattedValue: `${roundTo(14500.0 * multiplier, 1).toLocaleString("vi-VN")} Tỷ`,
      unit: "Tỷ VNĐ",
      change: "100%",
      changeType: "neutral",
      note: "Chỉ tiêu được giao",
      sparklineData: [
        { value: 100 },
        { value: 100 },
        { value: 100 },
        { value: 100 },
        { value: 100 },
        { value: 100 },
        { value: 100 }
      ],
      strokeColor: "#0ea5e9"
    },
    {
      id: "completion",
      title: "% HOÀN THÀNH KH",
      value: 88.6,
      formattedValue: "88.6%",
      unit: "%",
      progress: 88.6,
      change: "+4.2%",
      changeType: "positive",
      note: `Còn thiếu ${roundTo(1649.5 * multiplier, 1).toLocaleString("vi-VN")} Tỷ`,
      sparklineData: [
        { value: 25 },
        { value: 38 },
        { value: 51 },
        { value: 64 },
        { value: 73 },
        { value: 81 },
        { value: 88.6 }
      ],
      strokeColor: "#10b981"
    }
  ];

  const charts = {
    last6Periods: [
      { period: "T05", amount: Math.round(1050 * multiplier), growth: 5.2 },
      { period: "T06", amount: Math.round(1120 * multiplier), growth: 6.7 },
      { period: "T07", amount: Math.round(1080 * multiplier), growth: -3.5 },
      { period: "T08", amount: Math.round(1190 * multiplier), growth: 10.2 },
      { period: "T09", amount: Math.round(1150 * multiplier), growth: -3.4 },
      { period: "T10", amount: Math.round(1245 * multiplier), growth: 8.2 }
    ] as Last6PeriodsChartItem[],

    byImportExport: [
      { id: "nk", name: "Nhập khẩu", value: Math.round(745 * multiplier), percentage: 59.8, color: "#3b82f6" },
      { id: "xk", name: "Xuất khẩu", value: Math.round(412 * multiplier), percentage: 33.1, color: "#10b981" },
      { id: "khac", name: "Tạm nhập / Quá cảnh / Khác", value: Math.round(88 * multiplier), percentage: 7.1, color: "#f59e0b" }
    ] as ImportExportChartItem[],

    byCommodity: [
      { id: "container", name: "Hàng Container", value: Math.round(820 * multiplier), percentage: 65.8, color: "#3b82f6" },
      { id: "hang_roi", name: "Hàng rời / xá", value: Math.round(275 * multiplier), percentage: 22.1, color: "#10b981" },
      { id: "hang_long", name: "Hàng lỏng / khí hóa lỏng", value: Math.round(150 * multiplier), percentage: 12.1, color: "#f59e0b" }
    ] as CommodityChartItem[],

    byPort: [
      { id: "hcm", name: "Cụm Cảng TP.HCM (Cát Lái, Hiệp Phước)", value: Math.round(650 * multiplier), percentage: 52.2, subPorts: "Cát Lái, Hiệp Phước, VICT", color: "#3b82f6" },
      { id: "hp", name: "Cụm Cảng Hải Phòng (Đình Vũ, Lạch Huyện)", value: Math.round(430 * multiplier), percentage: 34.5, subPorts: "Đình Vũ, Lạch Huyện, Tân Vũ", color: "#10b981" },
      { id: "brvt", name: "Cụm Cảng Bà Rịa - Vũng Tàu (Cái Mép)", value: Math.round(165 * multiplier), percentage: 13.3, subPorts: "Cái Mép, TCIT, Gemalink", color: "#f59e0b" }
    ] as PortChartItem[]
  };

  const topEnterprises: EnterpriseItem[] = [
    {
      id: "DN001",
      rank: 1,
      name: "TỔNG CÔNG TY TÂN CẢNG SÀI GÒN",
      code: "0300812345",
      avatar: "TC",
      tag: "TOP 1",
      declarationType: "Nhập kinh doanh (A11)",
      commodityType: "Hàng Container",
      port: "Cát Lái - TP.HCM",
      periodAmount: roundTo(85 * multiplier, 1),
      ytdAmount: roundTo(890 * multiplier, 1),
      percentage: 6.8,
      status: "Đã hoàn thành"
    },
    {
      id: "DN002",
      rank: 2,
      name: "CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM THÁI NGUYÊN",
      code: "4601112223",
      avatar: "SE",
      tag: "FDI",
      declarationType: "Nhập gia công (E21)",
      commodityType: "Linh kiện điện tử",
      port: "Đình Vũ - Hải Phòng",
      periodAmount: roundTo(72 * multiplier, 1),
      ytdAmount: roundTo(750 * multiplier, 1),
      percentage: 5.8,
      status: "Đã hoàn thành"
    },
    {
      id: "DN003",
      rank: 3,
      name: "TẬP ĐOÀN DẦU KHÍ VIỆT NAM (PETROVIETNAM)",
      code: "0100150619",
      avatar: "PV",
      tag: "Doanh nghiệp Nhà nước",
      declarationType: "Nhập kinh doanh xăng dầu (A12)",
      commodityType: "Hàng lỏng / Dầu mỏ",
      port: "Hiệp Phước - TP.HCM",
      periodAmount: roundTo(64 * multiplier, 1),
      ytdAmount: roundTo(680 * multiplier, 1),
      percentage: 5.1,
      status: "Đã hoàn thành"
    },
    {
      id: "DN004",
      rank: 4,
      name: "CÔNG TY CỔ PHẦN TẬP ĐOÀN HÒA PHÁT",
      code: "0900223456",
      avatar: "HP",
      tag: "TOP 50",
      declarationType: "Nhập nguyên liệu sản xuất (A12)",
      commodityType: "Quặng sắt / Hàng rời",
      port: "Cái Mép - Vũng Tàu",
      periodAmount: roundTo(58 * multiplier, 1),
      ytdAmount: roundTo(590 * multiplier, 1),
      percentage: 4.7,
      status: "Đã hoàn thành"
    },
    {
      id: "DN005",
      rank: 5,
      name: "CÔNG TY TNHH THỜI TRANG & MAY MẶC VIỆT TIẾN",
      code: "0300456789",
      avatar: "VT",
      tag: "TOP 50",
      declarationType: "Xuất kinh doanh (B11)",
      commodityType: "Dệt may / Phụ liệu",
      port: "Cát Lái - TP.HCM",
      periodAmount: roundTo(45 * multiplier, 1),
      ytdAmount: roundTo(480 * multiplier, 1),
      percentage: 3.6,
      status: "Đã nộp 24/7"
    },
    {
      id: "DN006",
      rank: 6,
      name: "CÔNG TY TNHH LG ELECTRONICS VIỆT NAM HẢI PHÒNG",
      code: "0201314567",
      avatar: "LG",
      tag: "FDI",
      declarationType: "Nhập sản xuất XK (E31)",
      commodityType: "Điện tử gia dụng",
      port: "Lạch Huyện - Hải Phòng",
      periodAmount: roundTo(41 * multiplier, 1),
      ytdAmount: roundTo(430 * multiplier, 1),
      percentage: 3.3,
      status: "Đã hoàn thành"
    },
    {
      id: "DN007",
      rank: 7,
      name: "TỔNG CÔNG TY PHÁT ĐIỆN 3 (GENCO 3)",
      code: "0312015543",
      avatar: "G3",
      tag: "Năng lượng",
      declarationType: "Nhập kinh doanh (A11)",
      commodityType: "Than đá / Hàng rời",
      port: "Cái Mép - Vũng Tàu",
      periodAmount: roundTo(38 * multiplier, 1),
      ytdAmount: roundTo(390 * multiplier, 1),
      percentage: 3.0,
      status: "Đang xử lý"
    },
    {
      id: "DN008",
      rank: 8,
      name: "CÔNG TY CP Ô TÔ TRƯỜNG HẢI (THACO)",
      code: "4000381234",
      avatar: "TH",
      tag: "Sản xuất",
      declarationType: "Nhập linh kiện (A12)",
      commodityType: "Linh kiện ô tô",
      port: "Cát Lái - TP.HCM",
      periodAmount: roundTo(34 * multiplier, 1),
      ytdAmount: roundTo(350 * multiplier, 1),
      percentage: 2.7,
      status: "Đã hoàn thành"
    },
    {
      id: "DN009",
      rank: 9,
      name: "CÔNG TY CP THỰC PHẨM MASAN",
      code: "0302832109",
      avatar: "MS",
      tag: "Tiêu dùng",
      declarationType: "Xuất sản phẩm (B11)",
      commodityType: "Hàng đóng container",
      port: "Cát Lái - TP.HCM",
      periodAmount: roundTo(29 * multiplier, 1),
      ytdAmount: roundTo(310 * multiplier, 1),
      percentage: 2.3,
      status: "Đã nộp 24/7"
    },
    {
      id: "DN010",
      rank: 10,
      name: "CÔNG TY TNHH CANON VIỆT NAM",
      code: "0101135790",
      avatar: "CN",
      tag: "FDI",
      declarationType: "Nhập nguyên liệu E21",
      commodityType: "Thiết bị quang học / in ấn",
      port: "Tân Vũ - Hải Phòng",
      periodAmount: roundTo(25 * multiplier, 1),
      ytdAmount: roundTo(270 * multiplier, 1),
      percentage: 2.0,
      status: "Đã hoàn thành"
    }
  ];

  const enterpriseNameMap: Record<string, string> = {
    DN001: "TỔNG CÔNG TY TÂN CẢNG SÀI GÒN",
    DN002: "CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM THÁI NGUYÊN",
    DN003: "TẬP ĐOÀN DẦU KHÍ VIỆT NAM (PETROVIETNAM)",
    DN004: "CÔNG TY CỔ PHẦN TẬP ĐOÀN HÒA PHÁT",
    DN005: "CÔNG TY TNHH THỜI TRANG & MAY MẶC VIỆT TIẾN",
    DN006: "CÔNG TY TNHH LG ELECTRONICS VIỆT NAM HẢI PHÒNG",
    DN007: "TỔNG CÔNG TY PHÁT ĐIỆN 3 (GENCO 3)",
    DN008: "CÔNG TY CP Ô TÔ TRƯỜNG HẢI (THACO)",
    DN009: "CÔNG TY CP THỰC PHẨM MASAN",
    DN010: "CÔNG TY TNHH CANON VIỆT NAM"
  };

  const selectedEnterpriseName = enterprise
    ? (enterpriseNameMap[enterprise] || (topEnterprises.find(e => e.id === enterprise || e.code === enterprise)?.name) || `Doanh nghiệp ${enterprise}`)
    : "";

  const declarations: DeclarationItem[] = enterprise
    ? [
        {
          id: "TK-10594837201",
          declarationNo: "105948372010",
          date: "2024-10-15 08:30:15",
          port: "Cảng Cát Lái",
          type: "A11 - Nhập kinh doanh",
          commodity: "Linh kiện điện tử phụ trợ",
          containers: 12,
          amount: 38500000,
          amountBillion: 0.0385,
          status: "Đã nộp 24/7",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837202",
          declarationNo: "105948372021",
          date: "2024-10-15 09:15:22",
          port: "Cảng Cát Lái",
          type: "A11 - Nhập kinh doanh",
          commodity: "Thùng Container rỗng 40ft",
          containers: 8,
          amount: 17600000,
          amountBillion: 0.0176,
          status: "Đã thông quan",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837203",
          declarationNo: "105948372032",
          date: "2024-10-14 14:20:05",
          port: "Cảng Hiệp Phước",
          type: "B11 - Xuất kinh doanh",
          commodity: "Hàng tiêu dùng đóng hộp",
          containers: 24,
          amount: 52800000,
          amountBillion: 0.0528,
          status: "Đã nộp 24/7",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837204",
          declarationNo: "105948372043",
          date: "2024-10-14 11:05:40",
          port: "Cảng Cát Lái",
          type: "E21 - Nhập nguyên liệu",
          commodity: "Vật tư thiết bị viễn thông",
          containers: 6,
          amount: 19800000,
          amountBillion: 0.0198,
          status: "Đã nộp 24/7",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837205",
          declarationNo: "105948372054",
          date: "2024-10-13 16:45:10",
          port: "Cảng Tân Cảng",
          type: "A12 - Nhập sản xuất",
          commodity: "Thép tấm cuộn",
          containers: 15,
          amount: 44200000,
          amountBillion: 0.0442,
          status: "Đã thông quan",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837206",
          declarationNo: "105948372065",
          date: "2024-10-12 10:10:30",
          port: "Cảng Cát Lái",
          type: "A11 - Nhập kinh doanh",
          commodity: "Hàng hóa chất lỏng chuyên dụng",
          containers: 10,
          amount: 31500000,
          amountBillion: 0.0315,
          status: "Đã nộp 24/7",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837207",
          declarationNo: "105948372076",
          date: "2024-10-11 15:35:18",
          port: "Cảng Hiệp Phước",
          type: "B11 - Xuất kinh doanh",
          commodity: "Hàng gỗ nội thất đóng cont",
          containers: 18,
          amount: 47200000,
          amountBillion: 0.0472,
          status: "Đã nộp 24/7",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        },
        {
          id: "TK-10594837208",
          declarationNo: "105948372087",
          date: "2024-10-10 08:50:00",
          port: "Cảng Cát Lái",
          type: "G12 - Tạm nhập tái xuất",
          commodity: "Thiết bị máy móc triển lãm",
          containers: 4,
          amount: 12000000,
          amountBillion: 0.0120,
          status: "Đã hoàn thành",
          enterpriseCode: enterprise,
          enterpriseName: selectedEnterpriseName
        }
      ]
    : [];

  return NextResponse.json({ kpis, charts, topEnterprises, declarations });
}
