"use client";

import React from "react";
import { useDashboard, formatNumber } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Users,
  Award,
  Clock,
  ShieldAlert,
  CheckCircle2,
  FileCheck,
  TrendingUp,
} from "lucide-react";

export default function OfficerPerformancePage() {
  const { data, loading } = useDashboard();

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải dữ liệu hiệu suất công chức hải quan...</p>
      </div>
    );
  }

  const officers = data?.officerPerformance || [];

  const totalOfficers = officers.length;
  const totalWorkload = officers.reduce((sum, o) => sum + o.workload, 0);
  const totalViolations = officers.reduce((sum, o) => sum + o.viPham, 0);
  const avgLeadTime =
    officers.length > 0
      ? (officers.reduce((sum, o) => sum + o.avgLeadTimeMinutes, 0) / officers.length).toFixed(1)
      : "18.5";
  const avgHitRate =
    officers.length > 0
      ? (officers.reduce((sum, o) => sum + o.hitRatePct, 0) / officers.length).toFixed(1)
      : "14.2";

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Users className="size-5 text-indigo-600" />
          Đánh Giá Hiệu Suất & Năng Suất Công Chức Hải Quan
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Theo dõi định mức xử lý tờ khai, tỷ lệ phát hiện vi phạm (Hit Rate) và thời gian giải quyết thủ tục theo bảng [rpHieuSuatCongChuc].
        </p>
      </div>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Công Chức Tham Gia Xử Lý
            </span>
            <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Users className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {totalOfficers} <span className="text-sm font-semibold text-slate-500">cán bộ</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Tổng hồ sơ thụ lý:</span>
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {formatNumber(totalWorkload)} tờ khai
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Vi Phạm Phát Hiện (Cảnh báo)
            </span>
            <div className="size-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-rose-600 dark:text-rose-400">
              {totalViolations} <span className="text-sm font-semibold text-slate-500">vụ việc</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Tỷ lệ phát hiện TB:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{avgHitRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Năng Suất TB / Cán Bộ
            </span>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileCheck className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {totalOfficers > 0 ? Math.round(totalWorkload / totalOfficers) : 0} <span className="text-sm font-semibold text-slate-500">tờ/người</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Đánh giá tiến độ:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Đạt định mức</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Thời Gian Giải Quyết TB
            </span>
            <div className="size-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <Clock className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {avgLeadTime} <span className="text-sm font-semibold text-slate-500">phút</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Quy định tối đa:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">&lt; 30.0 phút</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts: Workload Comparison */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
            So Sánh Khối Lượng Tờ Khai Xử Lý Theo Công Chức (Workload)
          </CardTitle>
          <CardDescription className="text-xs text-slate-500">
            Phân loại tờ khai theo luồng Xanh, luồng Vàng và luồng Đỏ
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={officers} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="maCongChuc" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.75rem",
                    color: "#fff",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Bar dataKey="toKhaiXanh" name="Luồng Xanh" fill="#10b981" stackId="a" />
                <Bar dataKey="toKhaiVang" name="Luồng Vàng" fill="#f59e0b" stackId="a" />
                <Bar dataKey="toKhaiDo" name="Luồng Đỏ" fill="#ef4444" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 3. Detailed Officer Ranking Table */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
            Bảng Kê Chi Tiết Hiệu Suất Cán Bộ Hải Quan
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Mã cán bộ</th>
                  <th className="py-3 px-4">Họ và tên</th>
                  <th className="py-3 px-4 text-center">Luồng Xanh</th>
                  <th className="py-3 px-4 text-center">Luồng Vàng</th>
                  <th className="py-3 px-4 text-center">Luồng Đỏ</th>
                  <th className="py-3 px-4 text-center">Tổng thụ lý</th>
                  <th className="py-3 px-4 text-center">Phát hiện vi phạm</th>
                  <th className="py-3 px-4 text-center">Tỷ lệ phát hiện</th>
                  <th className="py-3 px-4 text-right">TG xử lý TB</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {officers.map((off, idx) => (
                  <tr key={off.maCongChuc} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {off.maCongChuc}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      {off.tenCongChuc}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {formatNumber(off.toKhaiXanh)}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-amber-600 dark:text-amber-400 tabular-nums">
                      {formatNumber(off.toKhaiVang)}
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-rose-600 dark:text-rose-400 tabular-nums">
                      {formatNumber(off.toKhaiDo)}
                    </td>
                    <td className="py-3 px-4 text-center font-extrabold text-slate-900 dark:text-white tabular-nums">
                      {formatNumber(off.workload)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                      {off.viPham} vụ
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60">
                        {off.hitRatePct}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                      {off.avgLeadTimeMinutes} phút
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
