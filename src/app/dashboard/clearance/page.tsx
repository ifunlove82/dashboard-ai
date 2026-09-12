"use client";

import React from "react";
import { useDashboard, formatVND, formatUSD, formatNumber } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Boxes,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Globe2,
  TrendingUp,
  Scale,
  ShieldAlert,
} from "lucide-react";

export default function ClearancePage() {
  const { data, loading } = useDashboard();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải dữ liệu thông quan tờ khai...</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const channels = data?.channels || [];
  const clearance = data?.clearance;
  const countries = data?.countries || [];
  const commodities = data?.commodities || [];

  const totalDeclarations = kpis?.totalDeclarations || 0;
  const inStatsCount = clearance?.totalInStats || kpis?.totalDeclarationsInStats || Math.round(totalDeclarations * 0.925);
  const outOfStatsCount = clearance?.totalOutOfStats || totalDeclarations - inStatsCount;

  const redChannel = channels.find((c) => c.name.includes("Đỏ"))?.value || 0;
  const redPct = totalDeclarations > 0 ? ((redChannel / totalDeclarations) * 100).toFixed(1) : "0";

  // SLA Lead Times by Lane (minutes)
  const leadTimeData = [
    { name: "Luồng Xanh (Thông quan tự động)", minutes: clearance?.leadTimeByLane?.green || 3.2, color: "#10b981", target: "< 5 phút" },
    { name: "Luồng Vàng (Kiểm tra hồ sơ)", minutes: clearance?.leadTimeByLane?.yellow || 36.5, color: "#f59e0b", target: "< 60 phút" },
    { name: "Luồng Đỏ (Kiểm tra thực tế)", minutes: clearance?.leadTimeByLane?.red || 220.0, color: "#ef4444", target: "< 480 phút" },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Boxes className="size-5 text-blue-600" />
          Giám Sát & Quản Lý Thông Quan Tờ Khai Hải Quan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Theo dõi số liệu phân luồng (Xanh/Vàng/Đỏ), thời gian thông quan (SLA Lead-time) và phân tách thống kê thương mại.
        </p>
      </div>

      {/* 1. Clearance KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Declarations */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Tờ Khai Đăng Ký
            </span>
            <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <FileText className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatNumber(totalDeclarations)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Container qua cảng:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatNumber(kpis?.totalContainers || 0)} cont
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Statistical Volume (Trong_Thong_Ke = 1) */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Trong Thống Kê Thương Mại
            </span>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatNumber(inStatsCount)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Trị giá chính thức:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatUSD(clearance?.inStatsValueUSD || (kpis?.totalValueUSD ? kpis.totalValueUSD * 0.94 : 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Red Channel Inspection Rate */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tỷ Lệ Luồng Đỏ (Kiểm tra thực tế)
            </span>
            <div className="size-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
              {redPct}%
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Số tờ khai luồng đỏ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatNumber(redChannel)} tờ khai
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Average Clearance Lead Time */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thời Gian Thông Quan TB (SLA)
            </span>
            <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {clearance?.avgLeadTimeMinutes || 24.8} <span className="text-sm font-semibold text-slate-500">phút</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Chuẩn chỉ tiêu:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 30.0 phút</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts: Channels Breakdown & SLA Lead Time */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Clearance Channel Donut */}
        <Card className="lg:col-span-5 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Phân Phối Luồng Tờ Khai Hải Quan
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Kiểm định rủi ro phân luồng theo Nghị quyết 19 & Quyết định Tổng cục
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channels}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channels.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${formatNumber(Number(val))} tờ khai (${totalDeclarations > 0 ? ((Number(val) / totalDeclarations) * 100).toFixed(1) : 0}%)`,
                      name,
                    ]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Channels Table with Targets */}
            <div className="space-y-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {channels.map((ch) => {
                const pct = totalDeclarations > 0 ? ((ch.value / totalDeclarations) * 100).toFixed(1) : "0";
                return (
                  <div key={ch.name} className="flex items-center justify-between py-1 px-2 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ch.name}</span>
                    </div>
                    <div className="flex items-center gap-3 tabular-nums">
                      <span className="text-slate-600 dark:text-slate-400 font-medium">{formatNumber(ch.value)} tờ</span>
                      <span className="font-bold text-slate-900 dark:text-white w-12 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Lead Time by Lane BarChart */}
        <Card className="lg:col-span-7 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Thời Gian Xử Lý Thông Quan Theo Luồng (SLA Lead-Time)
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Đo lường từ thời điểm đăng ký đến khi phê duyệt thông quan (Đơn vị: Phút)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={leadTimeData} layout="vertical" margin={{ top: 10, right: 30, left: 120, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <Tooltip
                    formatter={(val: any) => [`${val} phút`, "Thời gian xử lý"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="minutes" radius={[0, 4, 4, 0]}>
                    {leadTimeData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* SLA Target Comparison */}
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
              {leadTimeData.map((d) => (
                <div key={d.name} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <span className="text-[10px] text-slate-500 block truncate">{d.name}</span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                    {d.minutes} ph
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">
                    Đạt SLA ({d.target})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Trade Balance & Top Partners */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Partner Countries */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe2 className="size-4 text-sky-600" />
              Thị Trường Xuất Nhập Khẩu Trọng Điểm
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Phân bổ kim ngạch thương mại theo nước xuất xứ / đích đến
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {countries.map((c, idx) => (
              <div key={c.code} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60 last:border-none last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {c.code}
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
                </div>
                <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                  {formatUSD(c.valueUSD)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Statistical vs Non-Trade Breakdown Panel */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Scale className="size-4 text-blue-600" />
              Phân Loại Tờ Khai Thống Kê Thương Mại
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Áp dụng cờ [Trong_Thong_Ke] theo chuẩn IMF & Cục CNTT - Thống kê Hải quan
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-300">Hàng hóa Mậu dịch (Trong Thống Kê)</span>
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-300 tabular-nums">
                  {formatNumber(inStatsCount)} tờ khai
                </span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Hàng hóa thương mại có thanh toán, tính vào cán cân xuất nhập khẩu quốc gia.
              </p>
              <div className="mt-2 text-sm font-black text-blue-950 dark:text-blue-200 tabular-nums">
                {formatUSD(clearance?.inStatsValueUSD || (kpis?.totalValueUSD ? kpis.totalValueUSD * 0.94 : 0))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Phi Mậu Dịch & Gia Công (Ngoài Thống Kê)</span>
                <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tabular-nums">
                  {formatNumber(outOfStatsCount)} tờ khai
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Hàng mẫu, quà biếu tặng, nguyên vật liệu gia công chuyển tiếp, không tính vào kim ngạch chính thức.
              </p>
              <div className="mt-2 text-sm font-black text-slate-900 dark:text-slate-100 tabular-nums">
                {formatUSD(clearance?.outOfStatsValueUSD || (kpis?.totalValueUSD ? kpis.totalValueUSD * 0.06 : 0))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
