"use client";

import React from "react";
import { TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight } from "lucide-react";
import type { TradeBalanceData } from "@/app/api/v1/declarations-turnover/route";

export interface TradeBalanceHeroProps {
  data?: TradeBalanceData | null;
  loading?: boolean;
}

function formatViDecimal(val: number, decimals: number = 1): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function TradeBalanceHero({ data, loading = false }: TradeBalanceHeroProps) {
  if (loading || !data) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-xs animate-pulse space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-lg bg-slate-200 dark:bg-slate-800" />
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-48" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-64" />
            </div>
          </div>
          <div className="h-7 bg-slate-200 dark:bg-slate-800 rounded-full w-28" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          <div className="lg:col-span-5 space-y-3">
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-36" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-56" />
            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded w-48" />
          </div>
          <div className="lg:col-span-7 h-24 bg-slate-100 dark:bg-slate-800/40 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    netBalanceMillionUSD,
    isSurplus,
    exportMillionUSD,
    importMillionUSD,
    yoyChangePct,
    prevPeriodBalanceMillionUSD,
  } = data;

  // Calculate percentages
  const totalTurnover = exportMillionUSD + importMillionUSD;
  const exportPct = totalTurnover > 0 ? (exportMillionUSD / totalTurnover) * 100 : 50;
  const importPct = totalTurnover > 0 ? (importMillionUSD / totalTurnover) * 100 : 50;

  const netBalanceSign = netBalanceMillionUSD >= 0 ? "+" : "-";
  const formattedNetBalance = `${netBalanceSign}${formatViDecimal(Math.abs(netBalanceMillionUSD), 1)}`;

  const prevPeriodSign = prevPeriodBalanceMillionUSD >= 0 ? "+" : "-";
  const formattedPrevPeriod = `${prevPeriodSign}${formatViDecimal(Math.abs(prevPeriodBalanceMillionUSD), 1)}`;

  const yoySign = yoyChangePct >= 0 ? "+" : "";
  const formattedYoy = `${yoySign}${formatViDecimal(yoyChangePct, 1)}%`;

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-slate-50/40 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/95 dark:to-blue-950/20 p-5 md:p-6 shadow-xs">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-56 h-56 bg-blue-500/5 dark:bg-blue-400/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="size-9 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/40 shadow-2xs">
            <Scale className="size-5" />
          </div>
          <div>
            <h2 className="text-sm md:text-base font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase">
              CÁN CÂN THƯƠNG MẠI (XUẤT - NHẬP KHẨU)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tổng quan chênh lệch kim ngạch xuất khẩu và nhập khẩu hàng hóa toàn ngành
            </p>
          </div>
        </div>

        {/* Badge Xuất Siêu / Nhập Siêu */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-2xs transition-colors ${
              isSurplus
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-800/60"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/70 dark:border-rose-800/60"
            }`}
          >
            {isSurplus ? (
              <>
                <TrendingUp className="size-3.5 stroke-[2.5]" />
                <span>XUẤT SIÊU</span>
              </>
            ) : (
              <>
                <TrendingDown className="size-3.5 stroke-[2.5]" />
                <span>NHẬP SIÊU</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="pt-5 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Net Trade Balance (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Cán cân thương mại ròng
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl md:text-4xl font-extrabold tracking-tight tabular-nums ${
                isSurplus
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formattedNetBalance}
            </span>
            <span className="text-sm md:text-base font-semibold text-slate-500 dark:text-slate-400">
              Triệu USD
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span
              className={`inline-flex items-center gap-0.5 font-semibold ${
                yoyChangePct >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {yoyChangePct >= 0 ? (
                <ArrowUpRight className="size-3.5" />
              ) : (
                <ArrowDownRight className="size-3.5" />
              )}
              {formattedYoy} YoY so với cùng kỳ
            </span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span>
              Kỳ trước:{" "}
              <strong className="font-semibold text-slate-700 dark:text-slate-300">
                {formattedPrevPeriod} Triệu USD
              </strong>
            </span>
          </div>
        </div>

        {/* Right: Horizontal Split Bar & XK/NK details (7 cols) */}
        <div className="lg:col-span-7 space-y-3 bg-white/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800 rounded-xl p-4 shadow-2xs">
          {/* Numbers Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            {/* Xuất khẩu (XK) */}
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#3b82f6] shrink-0 ring-2 ring-blue-500/20" />
              <span className="text-slate-600 dark:text-slate-300">
                Xuất khẩu:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViDecimal(exportMillionUSD, 1)} Triệu USD
                </strong>
              </span>
              <span className="text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded text-[11px] border border-blue-200/50 dark:border-blue-800/50">
                ({formatViDecimal(exportPct, 1)}%)
              </span>
            </div>

            {/* Nhập khẩu (NK) */}
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-[#4f46e5] shrink-0 ring-2 ring-indigo-500/20" />
              <span className="text-slate-600 dark:text-slate-300">
                Nhập khẩu:{" "}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {formatViDecimal(importMillionUSD, 1)} Triệu USD
                </strong>
              </span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded text-[11px] border border-indigo-200/50 dark:border-indigo-800/50">
                ({formatViDecimal(importPct, 1)}%)
              </span>
            </div>
          </div>

          {/* Horizontal Split Progress Bar */}
          <div className="space-y-1.5">
            <div
              className="h-3.5 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-700/60 p-0.5 shadow-inner"
              role="progressbar"
              aria-label="Tỷ lệ Xuất khẩu vs Nhập khẩu"
              aria-valuenow={Math.round(exportPct)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                style={{ width: `${exportPct}%` }}
                className="h-full bg-blue-600 rounded-l-full transition-all duration-500"
                title={`Xuất khẩu: ${formatViDecimal(exportMillionUSD, 1)} Triệu USD (${formatViDecimal(exportPct, 1)}%)`}
              />
              <div
                style={{ width: `${importPct}%` }}
                className="h-full bg-indigo-600 rounded-r-full transition-all duration-500"
                title={`Nhập khẩu: ${formatViDecimal(importMillionUSD, 1)} Triệu USD (${formatViDecimal(importPct, 1)}%)`}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 font-medium px-0.5">
              <span>Xuất khẩu (XK)</span>
              <span>Tổng kim ngạch 2 chiều: {formatViDecimal(totalTurnover, 1)} Triệu USD</span>
              <span>Nhập khẩu (NK)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
