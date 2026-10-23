"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Boxes,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import type {
  DeclarationKpisData,
  TurnoverKpisData,
} from "@/app/api/v1/declarations-turnover/route";

export interface DualKpiPanelProps {
  declarationKpis?: DeclarationKpisData | null;
  turnoverKpis?: TurnoverKpisData | null;
  loading?: boolean;
}

function formatViNumber(val: number): string {
  return new Intl.NumberFormat("vi-VN").format(val);
}

function formatViDecimal(val: number, decimals: number = 1): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function DualKpiPanel({
  declarationKpis,
  turnoverKpis,
  loading = false,
}: DualKpiPanelProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (loading || !declarationKpis || !turnoverKpis) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Skeleton Column */}
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={`skel-decl-${i}`}
              className="h-56 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/3" />
            </div>
          ))}
        </div>

        {/* Right Skeleton Column */}
        <div className="flex flex-col gap-4">
          {[1, 2].map((i) => (
            <div
              key={`skel-turn-${i}`}
              className="h-56 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="h-9 w-9 bg-slate-200 dark:bg-slate-800 rounded-lg" />
                <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-full" />
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Declaration sparkline data
  const declSparklineData = declarationKpis.sparklineData.map((d, i) => ({
    period: `T${i + 1}`,
    value: d.value,
  }));
  const latestDeclSpark =
    declSparklineData.length > 0
      ? declSparklineData[declSparklineData.length - 1].value
      : null;

  // Turnover sparkline data
  const turnoverSparklineData = turnoverKpis.sparklineData.map((d, i) => ({
    period: `T${i + 1}`,
    value: d.value,
  }));
  const latestTurnoverSpark =
    turnoverSparklineData.length > 0
      ? turnoverSparklineData[turnoverSparklineData.length - 1].value
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ===================== CỘT TRÁI: PHÂN KHU TỜ KHAI (2 CARDS) ===================== */}
      <div className="flex flex-col gap-4">
        {/* Section Tag */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phân khu Tờ khai Hải quan
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Đơn vị: Tờ khai (TK)
          </span>
        </div>

        {/* CARD 1: Tổng tờ khai kỳ này */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-colors flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
                  <FileText className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Tổng tờ khai kỳ này
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Số lượng tờ khai thông quan phát sinh
                  </p>
                </div>
              </div>

              {/* YoY Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs ${
                  declarationKpis.yoyChangePct >= 0
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/60"
                }`}
              >
                {declarationKpis.yoyChangePct >= 0 ? (
                  <ArrowUpRight className="size-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="size-3 stroke-[2.5]" />
                )}
                <span>
                  {declarationKpis.yoyChangePct >= 0 ? "+" : ""}
                  {formatViDecimal(declarationKpis.yoyChangePct, 1)}% YoY
                </span>
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {formatViNumber(declarationKpis.total)}
              </span>
              <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
                tờ khai
              </span>
            </div>

            {/* Breakdown XK vs NK */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">XK:</span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViNumber(declarationKpis.exportCount)} TK
                </strong>
              </div>
              <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-purple-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">NK:</span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViNumber(declarationKpis.importCount)} TK
                </strong>
              </div>
            </div>
          </div>

          {/* Footer note: Kỳ trước */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Kỳ trước: {formatViNumber(declarationKpis.prevPeriodCount)} TK</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatViNumber(declarationKpis.total - declarationKpis.prevPeriodCount)} TK
            </span>
          </div>
        </div>

        {/* CARD 2: Lũy kế Tờ khai (YTD) & Phân luồng */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-blue-400/60 dark:hover:border-blue-600/60 transition-colors flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-sky-50 dark:bg-sky-950/70 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 border border-sky-100 dark:border-sky-900/40 shadow-2xs">
                  <Boxes className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Lũy kế Tờ khai (YTD) & Phân luồng
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tổng tích lũy từ đầu năm 2024
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                YTD 2024
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {formatViNumber(declarationKpis.ytdTotal)}
              </span>
              <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
                tờ khai
              </span>
            </div>

            {/* Multi-segment progress bar 3 màu */}
            <div className="space-y-1.5 p-3 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 mb-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-600 dark:text-slate-400 font-medium">
                  Cơ cấu kiểm tra phân luồng:
                </span>
                <span className="text-slate-500 dark:text-slate-400 text-[11px]">VNACCS Live</span>
              </div>

              {/* Multi-segment bar */}
              <div
                className="h-2.5 w-full rounded-full overflow-hidden flex bg-slate-200/60 dark:bg-slate-700/60 gap-0.5 p-0.5"
                role="progressbar"
                aria-label="Cơ cấu phân luồng tờ khai"
              >
                <div
                  style={{ width: `${declarationKpis.channels.green.pct}%` }}
                  className="h-full bg-emerald-500 rounded-l-full transition-all duration-300"
                  title={`Xanh: ${formatViNumber(declarationKpis.channels.green.count)} TK (${formatViDecimal(declarationKpis.channels.green.pct, 1)}%)`}
                />
                <div
                  style={{ width: `${declarationKpis.channels.yellow.pct}%` }}
                  className="h-full bg-amber-500 transition-all duration-300"
                  title={`Vàng: ${formatViNumber(declarationKpis.channels.yellow.count)} TK (${formatViDecimal(declarationKpis.channels.yellow.pct, 1)}%)`}
                />
                <div
                  style={{ width: `${declarationKpis.channels.red.pct}%` }}
                  className="h-full bg-rose-500 rounded-r-full transition-all duration-300"
                  title={`Đỏ: ${formatViNumber(declarationKpis.channels.red.count)} TK (${formatViDecimal(declarationKpis.channels.red.pct, 1)}%)`}
                />
              </div>

              {/* 3 Lane Legend Details */}
              <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                  <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">
                    Xanh: <strong>{formatViNumber(declarationKpis.channels.green.count)} TK</strong> ({formatViDecimal(declarationKpis.channels.green.pct, 1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-medium">
                  <span className="size-2 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">
                    Vàng: <strong>{formatViNumber(declarationKpis.channels.yellow.count)} TK</strong> ({formatViDecimal(declarationKpis.channels.yellow.pct, 1)}%)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                  <span className="size-2 rounded-full bg-rose-500 shrink-0" />
                  <span className="truncate">
                    Đỏ: <strong>{formatViNumber(declarationKpis.channels.red.count)} TK</strong> ({formatViDecimal(declarationKpis.channels.red.pct, 1)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sparkline AreaChart 12 kỳ */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Diễn biến 12 kỳ (tờ khai)</span>
              {latestDeclSpark !== null && (
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  Kỳ 12: {formatViNumber(latestDeclSpark)} TK
                </span>
              )}
            </div>

            <div className="h-14 w-full relative overflow-hidden">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={declSparklineData}
                    margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSparklineDecl" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md border border-slate-700">
                              <span>
                                {payload[0].payload.period}:{" "}
                                <strong>{formatViNumber(Number(payload[0].value))} TK</strong>
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSparklineDecl)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 rounded animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== CỘT PHẢI: PHÂN KHU KIM NGẠCH (2 CARDS) ===================== */}
      <div className="flex flex-col gap-4">
        {/* Section Tag */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <DollarSign className="size-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Phân khu Kim ngạch XNK
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Đơn vị: Triệu USD
          </span>
        </div>

        {/* CARD 3: Tổng kim ngạch XNK */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-purple-400/60 dark:hover:border-purple-600/60 transition-colors flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-purple-50 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-900/40 shadow-2xs">
                  <DollarSign className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Tổng kim ngạch XNK
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Giá trị thống kê 2 chiều xuất nhập khẩu
                  </p>
                </div>
              </div>

              {/* YoY Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-2xs ${
                  turnoverKpis.yoyChangePct >= 0
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/60"
                }`}
              >
                {turnoverKpis.yoyChangePct >= 0 ? (
                  <ArrowUpRight className="size-3 stroke-[2.5]" />
                ) : (
                  <ArrowDownRight className="size-3 stroke-[2.5]" />
                )}
                <span>
                  {turnoverKpis.yoyChangePct >= 0 ? "+" : ""}
                  {formatViDecimal(turnoverKpis.yoyChangePct, 1)}% YoY
                </span>
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {formatViDecimal(turnoverKpis.totalMillionUSD, 1)}
              </span>
              <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Triệu USD
              </span>
            </div>

            {/* Breakdown XK vs NK */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">XK:</span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViDecimal(turnoverKpis.exportMillionUSD, 1)} Tr. USD
                </strong>
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200/40">
                  ({formatViDecimal(turnoverKpis.exportRatioPct, 1)}%)
                </span>
              </div>
              <span className="text-slate-300 dark:text-slate-600 font-light">|</span>
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-indigo-600 shrink-0" />
                <span className="text-slate-600 dark:text-slate-400">NK:</span>
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViDecimal(turnoverKpis.importMillionUSD, 1)} Tr. USD
                </strong>
                <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200/40">
                  ({formatViDecimal(turnoverKpis.importRatioPct, 1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Footer note: Kỳ trước */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Kỳ trước: {formatViDecimal(turnoverKpis.prevPeriodMillionUSD, 1)} Triệu USD</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">
              +{formatViDecimal(turnoverKpis.totalMillionUSD - turnoverKpis.prevPeriodMillionUSD, 1)} Tr. USD
            </span>
          </div>
        </div>

        {/* CARD 4: Lũy kế Kim ngạch (YTD) & Bình quân */}
        <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs hover:border-indigo-400/60 dark:hover:border-indigo-600/60 transition-colors flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                  <TrendingUp className="size-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                    Lũy kế Kim ngạch (YTD) & Bình quân
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Tổng kim ngạch tích lũy từ đầu năm 2024
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                YTD 2024
              </span>
            </div>

            {/* Main Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
                {formatViDecimal(turnoverKpis.ytdMillionUSD, 1)}
              </span>
              <span className="text-xs md:text-sm font-semibold text-slate-500 dark:text-slate-400">
                Triệu USD
              </span>
            </div>

            {/* Kim ngạch bình quân / tờ khai */}
            <div className="p-2.5 rounded-lg bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">
                  Kim ngạch bình quân / tờ khai:
                </span>
                <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                  ~{formatViNumber(turnoverKpis.avgPerDeclarationUSD)} USD/TK
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50 self-start sm:self-auto">
                <ArrowUpRight className="size-3" />
                <span>+{formatViDecimal(turnoverKpis.avgChangePct, 1)}% so với kỳ trước</span>
              </span>
            </div>
          </div>

          {/* Sparkline AreaChart 12 kỳ */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>Diễn biến kim ngạch 12 kỳ (Triệu USD)</span>
              {latestTurnoverSpark !== null && (
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  Kỳ 12: {formatViDecimal(latestTurnoverSpark, 1)} Tr. USD
                </span>
              )}
            </div>

            <div className="h-14 w-full relative overflow-hidden">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={turnoverSparklineData}
                    margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSparklineTurnover" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="period" hide />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white text-[11px] px-2 py-1 rounded shadow-md border border-slate-700">
                              <span>
                                {payload[0].payload.period}:{" "}
                                <strong>{formatViDecimal(Number(payload[0].value), 1)} Triệu USD</strong>
                              </span>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorSparklineTurnover)"
                      isAnimationActive={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 rounded animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
