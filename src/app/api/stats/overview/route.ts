import { NextResponse } from "next/server";

export interface OverviewData {
  revenue: {
    actual: number;
    yoy_change: number;
    target_pct: number;
    sparkline: number[];
  };
  seaport_fee: {
    actual: number;
    yoy_change: number;
    target_pct: number;
    sparkline: number[];
  };
  declarations: {
    actual: number;
    import: number;
    export: number;
    diff_abs: number;
    yoy_change: number;
    sparkline: number[];
  };
  turnover: {
    actual: number;
    import: number;
    export: number;
    diff_abs: number;
    yoy_change: number;
    sparkline: number[];
  };
  goods: {
    weight: number;
    import: number;
    export: number;
    containers: number;
    yoy_change: number;
    sparkline: number[];
  };
  enterprises: {
    total: number;
    new: number;
    yoy_change: number;
    sparkline: number[];
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch") || "ALL";
  const loaiXNK = searchParams.get("loaiXNK") || "ALL";
  
  // Strict YTD bounds
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = new Date().toISOString().split('T')[0];

  // In a real app, query the SQL Server using branch, loaiXNK, startDate, endDate.
  // For this UI build, return a robust mock payload conforming to the spec:
  console.log(`[Overview API] Strict YTD query: branch=${branch}, loaiXNK=${loaiXNK}, range=${startDate}..${endDate}`);

  const mockData: OverviewData = {
    revenue: {
      actual: 1245800000000,
      yoy_change: 6.8,
      target_pct: 78.4,
      sparkline: [120, 135, 125, 145, 150, 140, 155, 160, 130, 132.4]
    },
    seaport_fee: {
      actual: 2500000000,
      yoy_change: -1.5,
      target_pct: 45,
      sparkline: [20, 22, 19, 25, 23, 21, 22, 24, 25, 26]
    },
    declarations: {
      actual: 450000,
      import: 200000,
      export: 250000,
      diff_abs: 12500,
      yoy_change: 3.1,
      sparkline: [40, 42, 45, 43, 48, 47, 49, 50, 52, 51]
    },
    turnover: {
      actual: 12500000000, // USD
      import: 7000000000,
      export: 5500000000,
      diff_abs: 500000000,
      yoy_change: 8.4,
      sparkline: [1000, 1100, 1050, 1200, 1150, 1250, 1300, 1280, 1350, 1400]
    },
    goods: {
      weight: 15400000, // Tons
      import: 8400000,
      export: 7000000,
      containers: 85000,
      yoy_change: 4.2,
      sparkline: [1.2, 1.3, 1.25, 1.4, 1.35, 1.5, 1.6, 1.55, 1.65, 1.7]
    },
    enterprises: {
      total: 12500,
      new: 450,
      yoy_change: 2.1,
      sparkline: [1200, 1250, 1300, 1280, 1350, 1400, 1420, 1450, 1480, 1500]
    }
  };

  return NextResponse.json(mockData);
}
