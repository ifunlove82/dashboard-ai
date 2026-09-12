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
  Receipt,
  Award,
  Anchor,
  TrendingUp,
  Percent,
  CheckCircle,
  Clock,
  Building2,
  Boxes,
} from "lucide-react";

const TAX_COLORS: Record<string, string> = {
  thueXNK: "#3b82f6", // Blue
  thueV: "#10b981", // Emerald
  thueT: "#f59e0b", // Amber
  thueM: "#8b5cf6", // Purple
  thueB: "#ec4899", // Pink
  thueG: "#06b6d4", // Cyan
  thueKhac: "#64748b", // Slate
};

const TAX_LABELS: Record<string, string> = {
  thueXNK: "Thuế Xuất Nhập Khẩu",
  thueV: "Thuế Giá trị gia tăng (VAT)",
  thueT: "Thuế Tiêu thụ đặc biệt",
  thueM: "Thuế Bảo vệ môi trường",
  thueB: "Thuế Tự vệ & Chống BPG",
  thueG: "Thuế Chống phân biệt đối xử",
  thueKhac: "Thuế & Khoản thu khác",
};

export default function RevenuePage() {
  const { data, loading } = useDashboard();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải dữ liệu thu ngân sách...</p>
      </div>
    );
  }

  const kpis = data?.kpis;
  const taxBreakdown = data?.taxBreakdown || {
    thueXNK: 0,
    thueV: 0,
    thueT: 0,
    thueM: 0,
    thueB: 0,
    thueG: 0,
    thueKhac: 0,
  };
  const phiCSHT = data?.phiCSHT;
  const trends = data?.trends || [];

  const totalTax = kpis?.totalTaxVND || 0;
  const totalFee = kpis?.totalPhiCSHTVND || phiCSHT?.totalFeeVND || 0;

  // Prepare Tax Pie Data
  const taxPieData = Object.entries(taxBreakdown)
    .filter(([_, val]) => Number(val) > 0)
    .map(([key, val]) => ({
      name: TAX_LABELS[key] || key,
      value: Number(val),
      color: TAX_COLORS[key] || "#64748b",
      pct: totalTax > 0 ? ((Number(val) / totalTax) * 100).toFixed(1) : "0",
    }));

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Receipt className="size-5 text-blue-600" />
          Thu Ngân Sách Nhà Nước & Phí Hạ Tầng Cảng Biển
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Theo dõi tiến độ thực hiện chỉ tiêu số thu NSNN, chi tiết cơ cấu các sắc thuế và thu phí hạ tầng cảng biển.
        </p>
      </div>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Thu Hải Quan (NSNN)
            </span>
            <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Award className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(totalTax)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Tiến độ dự toán:</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">92.4%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thuế Giá Trị Gia Tăng (VAT)
            </span>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Percent className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(taxBreakdown.thueV)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Chiếm cơ cấu:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {totalTax > 0 ? ((taxBreakdown.thueV / totalTax) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thuế Xuất Nhập Khẩu
            </span>
            <div className="size-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Boxes className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(taxBreakdown.thueXNK)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Chiếm cơ cấu:</span>
              <span className="font-bold text-sky-600 dark:text-sky-400">
                {totalTax > 0 ? ((taxBreakdown.thueXNK / totalTax) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Phí CSHT Cảng Biển (rpPhiCSHT)
            </span>
            <div className="size-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Anchor className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatVND(totalFee)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Hoàn thành:</span>
              <span className="font-bold text-teal-600 dark:text-teal-400">
                {phiCSHT?.completionRate || 93.3}% chỉ tiêu
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tax Structure Donut Chart */}
        <Card className="lg:col-span-5 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Cơ cấu các Sắc thuế Nộp Ngân sách
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Tỷ trọng đóng góp của từng sắc thuế trong tổng số thu
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taxPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {taxPieData.map((entry, index) => (
                      <Cell key={`tax-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any, name: any) => [
                      `${formatVND(Number(val))} (${totalTax > 0 ? ((Number(val) / totalTax) * 100).toFixed(1) : 0}%)`,
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

            {/* Tax Legend list */}
            <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              {taxPieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 dark:text-slate-300 font-medium truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 tabular-nums">
                    <span className="font-bold text-slate-900 dark:text-white">{formatVND(item.value)}</span>
                    <span className="text-[11px] text-slate-400 font-semibold w-10 text-right">{item.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue & Infrastructure Fee Trend */}
        <Card className="lg:col-span-7 border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
              Tiến độ Thu Ngân sách & Phí CSHT theo Tháng
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Thuế Hải quan (Xanh dương) và Phí hạ tầng cảng biển (Xanh ngọc)
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    tickFormatter={(v) => `${(v / 1e9).toFixed(0)}T`}
                  />
                  <Tooltip
                    formatter={(value: any, name: any) => [formatVND(Number(value)), name]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                  <Bar dataKey="taxVND" name="Thuế NSNN" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="feeCSHTVND" name="Phí CSHT Cảng biển" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Fee Breakdown By Cargo */}
            {phiCSHT?.byCargo && (
              <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                {phiCSHT.byCargo.map((c) => (
                  <div key={c.cargo} className="p-2 rounded-lg bg-teal-50/60 dark:bg-teal-950/40 border border-teal-100 dark:border-teal-900/50">
                    <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 block">
                      {c.cargo} ({c.percentage}%)
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white tabular-nums mt-0.5 block">
                      {formatVND(c.valueVND)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 3. Top Enterprises Paying Seaport Infrastructure Fee */}
      {phiCSHT?.topEnterprises && (
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Anchor className="size-4 text-teal-600" />
              Top Doanh nghiệp Nộp Phí Hạ Tầng Cảng Biển Lớn Nhất
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Trích xuất tự động từ bảng dữ liệu [rpPhiCSHT]
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Mã số thuế</th>
                    <th className="py-2.5 px-4">Tên Doanh nghiệp</th>
                    <th className="py-2.5 px-4 text-center">Số lượt cont/lô</th>
                    <th className="py-2.5 px-4 text-right">Tổng phí CSHT đã nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {phiCSHT.topEnterprises.map((dn, idx) => (
                    <tr key={dn.taxId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">{dn.taxId}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-white">{dn.name}</td>
                      <td className="py-2.5 px-4 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatNumber(dn.count)}
                      </td>
                      <td className="py-2.5 px-4 text-right font-bold text-teal-600 dark:text-teal-400 tabular-nums">
                        {formatVND(dn.feeVND)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
