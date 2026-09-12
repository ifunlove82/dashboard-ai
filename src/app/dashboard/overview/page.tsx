"use client";

import React from "react";
import Link from "next/link";
import { useDashboard, formatVND, formatUSD, formatNumber } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts";
import {
  FileText,
  DollarSign,
  Award,
  Anchor,
  TrendingUp,
  ArrowRight,
  Boxes,
  Building2,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function OverviewPage() {
  const { data, loading, refreshing } = useDashboard();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải dữ liệu tổng quan hải quan...</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const trends = data?.trends || [];
  const channels = data?.channels || [];
  const commodities = (data?.commodities || []).slice(0, 5);
  const topEnterprises = (data?.topEnterprises || data?.enterprises || []).slice(0, 5);

  const totalDeclarations = kpis?.totalDeclarations || 0;
  const greenDeclarations = channels.find((c) => c.name.includes("Xanh"))?.value || 0;
  const greenPct = totalDeclarations > 0 ? ((greenDeclarations / totalDeclarations) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Page Title & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Tổng quan Hoạt động Hải quan & Thương mại XNK
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chỉ số vĩ mô tổng hợp, kim ngạch thương mại, thu nộp ngân sách và lưu lượng thông quan.
          </p>
        </div>
        {refreshing && (
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 self-start">
            <span className="size-2 rounded-full bg-blue-600 animate-ping" />
            Đang cập nhật số liệu mới nhất...
          </span>
        )}
      </div>

      {/* 1. Flashcards (KPI Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Declarations */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng số tờ khai
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
              <span className="text-slate-500">Tỷ lệ thông quan ngay:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{greenPct}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Total USD Value */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-sky-400 dark:hover:border-sky-600 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Kim ngạch XNK
            </span>
            <div className="size-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <DollarSign className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatUSD(kpis?.totalValueUSD || 0)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Quy đổi:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {kpis?.totalValueUSD ? `${((kpis.totalValueUSD * 25000) / 1e12).toFixed(1)} nghìn tỷ đ` : "0 đ"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Tax Revenue */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-indigo-400 dark:hover:border-indigo-600 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thuế Hải quan đã thu
            </span>
            <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Award className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(kpis?.totalTaxVND || 0)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Tỷ lệ động viên:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {kpis?.totalTaxVND && kpis?.totalValueUSD
                  ? `${((kpis.totalTaxVND / (kpis.totalValueUSD * 25000)) * 100).toFixed(2)}%`
                  : "0%"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Seaport Infrastructure Fee */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 shadow-2xs hover:border-teal-400 dark:hover:border-teal-600 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Phí CSHT Cảng biển
            </span>
            <div className="size-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Anchor className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(kpis?.totalPhiCSHTVND || data?.phiCSHT?.totalFeeVND || 0)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Đạt chỉ tiêu:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {data?.phiCSHT?.completionRate || 93.3}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Main Macro Charts: Trend & Clearance Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend: Tax & Value Composed Chart */}
        <Card className="lg:col-span-2 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Diễn biến Thu ngân sách & Kim ngạch theo thời gian
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Cột: Thu ngân sách (Tỷ VND) — Đường: Kim ngạch XNK (Triệu USD)
                </CardDescription>
              </div>
              <Link
                href="/dashboard/revenue"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
              >
                Chi tiết thu <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    yAxisId="left"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => `${(v / 1e9).toFixed(0)}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => `$${(v / 1e6).toFixed(0)}M`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => {
                      if (name === "Thu ngân sách") return [formatVND(Number(value)), name];
                      if (name === "Kim ngạch") return [formatUSD(Number(value)), name];
                      return [value, name];
                    }}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar yAxisId="left" dataKey="taxVND" name="Thu ngân sách" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="valueUSD"
                    name="Kim ngạch"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: "#10b981" }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Clearance Channels Donut Chart */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                  Cơ cấu Phân luồng Tờ khai
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Tỷ lệ thông quan Xanh / Vàng / Đỏ
                </CardDescription>
              </div>
              <Link
                href="/dashboard/clearance"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
              >
                Chi tiết luồng <ArrowRight className="size-3" />
              </Link>
            </div>
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

            {/* Channels Legend Grid */}
            <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
              {channels.map((ch) => (
                <div key={ch.name} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60">
                  <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-500">
                    <span className="size-2 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span>{ch.name}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                    {formatNumber(ch.value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Secondary Analytics: Top Commodities & Top Enterprises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Commodities */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Boxes className="size-4 text-blue-600" />
              Top Mặt hàng Xuất Nhập khẩu Chủ lực
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Trị giá quy đổi và thuế suất đóng góp cao nhất
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {commodities.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60 last:border-none last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="size-5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                    {item.name}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatVND(item.valueVND)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Thuế: {formatVND(item.taxVND)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Enterprises Quick List */}
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="size-4 text-indigo-600" />
                  Top Doanh nghiệp Đóng góp Kim ngạch
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Dẫn đầu về khối lượng và trị giá hải quan
                </CardDescription>
              </div>
              <Link
                href="/dashboard/enterprises"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1"
              >
                Xem tất cả <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topEnterprises.map((dn, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100 dark:border-slate-800/60 last:border-none last:pb-0">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="size-5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-slate-800 dark:text-slate-200 truncate" title={dn.name}>
                      {dn.name}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      MST: {dn.taxId} • {dn.declarations} tờ khai
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatUSD(dn.valueUSD)}
                  </div>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    {dn.containers} cont
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
