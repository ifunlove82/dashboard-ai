"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftRight,
  Building2,
  Filter,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Scale,
  Layers,
  BarChart3,
  Table as TableIcon,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  FileText,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import type {
  DeclarationsTurnoverResponse,
  DeclarationItem,
} from "@/app/api/v1/declarations-turnover/route";
import { formatNumber, formatUSD } from "@/context/DashboardContext";

const UNIT_OPTIONS = [
  { value: "all", label: "Tất cả Cục Hải quan" },
  { value: "cuc_hcm", label: "Cục HQ TP. Hồ Chí Minh" },
  { value: "cuc_hp", label: "Cục HQ Hải Phòng" },
  { value: "cuc_brvt", label: "Cục HQ Bà Rịa - Vũng Tàu" },
  { value: "cuc_dn", label: "Cục HQ Đồng Nai" },
  { value: "cuc_bd", label: "Cục HQ Bình Dương" },
];

const FLOW_OPTIONS = [
  { value: "all", label: "Tất cả Chiều hàng" },
  { value: "XK", label: "Xuất khẩu (XK)" },
  { value: "NK", label: "Nhập khẩu (NK)" },
];

const CHANNEL_OPTIONS = [
  { value: "all", label: "Tất cả Phân luồng" },
  { value: "green", label: "Luồng Xanh" },
  { value: "yellow", label: "Luồng Vàng" },
  { value: "red", label: "Luồng Đỏ" },
];

function DeclarationsTurnoverContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read URL query params with defaults
  const unit = searchParams?.get("unit") || "all";
  const period = searchParams?.get("period") || "current";
  const flow = searchParams?.get("flow") || "all";
  const channel = searchParams?.get("channel") || "all";
  const commodity = searchParams?.get("commodity") || "all";
  const regime = searchParams?.get("regime") || "all";

  const [data, setData] = useState<DeclarationsTurnoverResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const hasActiveFilters = Boolean(
    unit !== "all" ||
    flow !== "all" ||
    channel !== "all" ||
    commodity !== "all" ||
    regime !== "all" ||
    period !== "current"
  );

  // Fetch API whenever query params change
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (unit && unit !== "all") params.set("unit", unit);
      if (period && period !== "current") params.set("period", period);
      if (flow && flow !== "all") params.set("flow", flow);
      if (channel && channel !== "all") params.set("channel", channel);
      if (commodity && commodity !== "all") params.set("commodity", commodity);
      if (regime && regime !== "all") params.set("regime", regime);

      const queryString = params.toString();
      const apiUrl = `/api/v1/declarations-turnover${queryString ? `?${queryString}` : ""}`;

      const res = await fetch(apiUrl);
      if (!res.ok) {
        throw new Error(`Lỗi tải dữ liệu (${res.status}): ${res.statusText}`);
      }
      const json: DeclarationsTurnoverResponse = await res.json();
      setData(json);
    } catch (err: unknown) {
      console.error("Lỗi khi tải dữ liệu tờ khai - kim ngạch:", err);
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, period, flow, channel, commodity, regime]);

  // URL search params manipulation
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (!value || value === "all" || (key === "period" && value === "current")) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  const handleResetFilters = () => {
    router.push(pathname);
  };

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
        <Link
          href="/dashboard/overview"
          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Dashboard
        </Link>
        <ChevronRight className="size-3.5 text-slate-400" />
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          Tờ khai – Kim ngạch
        </span>
        {hasActiveFilters && (
          <>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              Đang lọc theo bộ điều kiện
            </span>
          </>
        )}
      </nav>

      {/* 2. Page Header & Interactive Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-5 shadow-xs space-y-4">
        {/* Title and Badge */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <ArrowLeftRight className="size-4.5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Dashboard Tờ khai – Kim ngạch
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 pl-10.5">
              Theo dõi cán cân thương mại, diễn biến tờ khai và giá trị kim ngạch XNK
            </p>
          </div>

          <div className="flex items-center gap-2 pl-10.5 md:pl-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              VNACCS Live: T10/2024
            </span>
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors disabled:opacity-50"
              title="Tải lại dữ liệu"
              aria-label="Tải lại dữ liệu"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin text-blue-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
          {/* Unit selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Đơn vị:</span>
            <select
              value={unit}
              onChange={(e) => updateFilter("unit", e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-xs pr-1"
              aria-label="Chọn Chi cục Hải quan"
            >
              {UNIT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Flow selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Filter className="size-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Chiều hàng:</span>
            <select
              value={flow}
              onChange={(e) => updateFilter("flow", e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-xs pr-1"
              aria-label="Chọn Chiều hàng"
            >
              {FLOW_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Channel selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Layers className="size-3.5 text-slate-400 shrink-0" />
            <span className="text-slate-500 dark:text-slate-400 text-[11px]">Phân luồng:</span>
            <select
              value={channel}
              onChange={(e) => updateFilter("channel", e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-xs pr-1"
              aria-label="Chọn Phân luồng"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 transition-colors cursor-pointer"
            >
              <RotateCcw className="size-3.5" />
              <span>Đặt lại bộ lọc</span>
            </button>
          )}
        </div>
      </div>

      {/* Error state alert */}
      {error && (
        <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/30 flex items-start gap-3 text-rose-800 dark:text-rose-300">
          <AlertCircle className="size-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold text-sm">Không thể kết nối đến máy chủ API</h3>
            <p className="text-xs text-rose-700 dark:text-rose-400">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="text-xs font-medium underline hover:text-rose-900 dark:hover:text-rose-100 mt-2 block"
            >
              Thử tải lại dữ liệu
            </button>
          </div>
        </div>
      )}

      {/* 3. Khung 1: Cán cân thương mại (TradeBalanceHero) */}
      <section
        id="section-trade-balance-hero"
        aria-label="Cán cân thương mại"
        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Scale className="size-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              1. Cán cân thương mại XNK (Trade Balance Hero)
            </h2>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            Task 3 Component
          </span>
        </div>

        {loading ? (
          <div className="py-8 space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-6 bg-slate-100 dark:bg-slate-800/60 rounded w-2/3" />
          </div>
        ) : data ? (
          <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Cán cân thương mại ròng
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  ${formatNumber(Math.abs(data.tradeBalance.netBalanceMillionUSD))} Tr. USD
                </span>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    data.tradeBalance.isSurplus
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                      : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                  }`}
                >
                  {data.tradeBalance.isSurplus ? (
                    <>
                      <TrendingUp className="size-3" />
                      XUẤT SIÊU
                    </>
                  ) : (
                    <>
                      <TrendingDown className="size-3" />
                      NHẬP SIÊU
                    </>
                  )}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Biến động cùng kỳ: +{data.tradeBalance.yoyChangePct}% YoY
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <span className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                Kim ngạch Xuất khẩu (XK)
              </span>
              <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1">
                ${formatNumber(data.tradeBalance.exportMillionUSD)} Tr. USD
              </div>
              <p className="text-[11px] text-blue-600/80 dark:text-blue-400 mt-1">
                Tỷ trọng: {data.turnoverKpis.exportRatioPct}%
              </p>
            </div>

            <div className="p-4 rounded-lg bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40">
              <span className="text-xs text-purple-700 dark:text-purple-300 font-medium">
                Kim ngạch Nhập khẩu (NK)
              </span>
              <div className="text-2xl font-extrabold text-purple-900 dark:text-purple-100 mt-1">
                ${formatNumber(data.tradeBalance.importMillionUSD)} Tr. USD
              </div>
              <p className="text-[11px] text-purple-600/80 dark:text-purple-400 mt-1">
                Tỷ trọng: {data.turnoverKpis.importRatioPct}%
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* 4. Khung 2: KPI song hành (DualKpiPanel) */}
      <section
        id="section-dual-kpi-panel"
        aria-label="KPI song hành"
        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="size-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              2. Chỉ số song hành Tờ khai & Kim ngạch (Dual KPI Panel)
            </h2>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            Task 3 Component
          </span>
        </div>

        {loading ? (
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : data ? (
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* TK Card 1 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Tổng tờ khai kỳ này
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(data.declarationKpis.total)} TK
              </div>
              <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                <span>XK: {formatNumber(data.declarationKpis.exportCount)}</span>
                <span>NK: {formatNumber(data.declarationKpis.importCount)}</span>
              </div>
            </div>

            {/* TK Card 2 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Lũy kế Tờ khai YTD
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatNumber(data.declarationKpis.ytdTotal)} TK
              </div>
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-2">
                <span className="text-emerald-600 font-medium">Xanh: {data.declarationKpis.channels.green.pct}%</span>
                <span className="text-amber-600 font-medium">Vàng: {data.declarationKpis.channels.yellow.pct}%</span>
                <span className="text-rose-600 font-medium">Đỏ: {data.declarationKpis.channels.red.pct}%</span>
              </div>
            </div>

            {/* KN Card 3 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Tổng kim ngạch kỳ này
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${formatNumber(data.turnoverKpis.totalMillionUSD)} Tr. USD
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Tăng trưởng: +{data.turnoverKpis.yoyChangePct}% YoY
              </div>
            </div>

            {/* KN Card 4 */}
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">
                Kim ngạch BQ / Tờ khai
              </span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                ${formatNumber(data.turnoverKpis.avgPerDeclarationUSD)} USD
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
                Biến động: +{data.turnoverKpis.avgChangePct}% so với kỳ trước
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* 5. Khung 3: 9 Biểu đồ trực quan (DeclarationsTurnoverCharts) */}
      <section
        id="section-declarations-turnover-charts"
        aria-label="Ma trận 9 biểu đồ phân tích"
        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              3. Ma trận 9 Biểu đồ trực quan (Declarations & Turnover Charts Matrix)
            </h2>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
            Task 4 Component
          </span>
        </div>

        {/* 9 Chart Cards Grid */}
        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[
            { id: 1, name: "1. Tờ khai 6 kỳ gần nhất", desc: "BarChart cột ghép XK vs NK", dataCount: data?.charts.declarationsLast6Periods.length },
            { id: 2, name: "2. Kim ngạch 6 kỳ gần nhất", desc: "Stacked BarChart XK vs NK (Triệu USD)", dataCount: data?.charts.turnoverLast6Periods.length },
            { id: 3, name: "3. Cán cân XNK 6 kỳ gần nhất", desc: "Diverging BarChart Xuất siêu / Nhập siêu", dataCount: data?.charts.tradeBalanceLast6Periods.length },
            { id: 4, name: "4. Cơ cấu Xuất khẩu vs Nhập khẩu", desc: "Donut Chart tỷ trọng kim ngạch", dataCount: data?.charts.importExportRatio.length },
            { id: 5, name: "5. Cơ cấu theo Loại hình (Regime)", desc: "Horizontal BarChart A11, B11, E21...", dataCount: data?.charts.byRegime.length },
            { id: 6, name: "6. Phân luồng Tờ khai", desc: "Donut Chart Luồng Xanh / Vàng / Đỏ", dataCount: data?.charts.channelDistribution.length },
            { id: 7, name: "7. Phân bổ theo Chi cục Hải quan", desc: "BarChart so sánh các đơn vị", dataCount: data?.charts.byUnit.length },
            { id: 8, name: "8. Theo Nhóm hàng chủ lực", desc: "Horizontal BarChart Top nhóm hàng", dataCount: data?.charts.byCommodity.length },
            { id: 9, name: "9. Tương quan Tờ khai – Kim ngạch", desc: "Composed Chart (Bar số TK & Line kim ngạch)", dataCount: data?.charts.correlation.length },
          ].map((chart) => (
            <div
              key={chart.id}
              className="p-4 rounded-lg border border-slate-200/60 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between min-h-[140px]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {chart.name}
                  </h3>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    Recharts
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {chart.desc}
                </p>
              </div>

              <div className="mt-4 pt-2 border-t border-slate-200/40 dark:border-slate-700/40 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Trạng thái:</span>
                {loading ? (
                  <span className="text-blue-500 animate-pulse font-medium">Đang tải...</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Sẵn sàng ({chart.dataCount || 0} điểm dữ liệu)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Khung 4: Bảng tờ khai chi tiết (DeclarationsDetailTable) */}
      <section
        id="section-declarations-detail-table"
        aria-label="Bảng tờ khai chi tiết"
        className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <TableIcon className="size-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              4. Bảng Tờ khai chi tiết & Kim ngạch (Declarations Detail Table)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {data ? `${data.declarations.length} tờ khai` : "0 tờ khai"}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60">
              Task 5 Component
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-8 space-y-3 animate-pulse">
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
            <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ) : data && data.declarations.length > 0 ? (
          <div className="pt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Số Tờ Khai</th>
                  <th className="py-2.5 px-3">Thời Gian</th>
                  <th className="py-2.5 px-3">Doanh Nghiệp</th>
                  <th className="py-2.5 px-3">Loại Hình</th>
                  <th className="py-2.5 px-3">Phân Luồng</th>
                  <th className="py-2.5 px-3">Chiều</th>
                  <th className="py-2.5 px-3 text-right">Trị Giá (USD)</th>
                  <th className="py-2.5 px-3">Trạng Thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.declarations.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2 px-3 font-mono text-[11px] font-medium text-blue-600 dark:text-blue-400">
                      {item.declarationNo}
                    </td>
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-2 px-3 max-w-[220px] truncate" title={item.enterpriseName}>
                      <span className="font-medium text-slate-800 dark:text-slate-200 block truncate">
                        {item.enterpriseName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {item.enterpriseCode}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-medium text-slate-700 dark:text-slate-300">
                      {item.regimeCode}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.channel === "green"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : item.channel === "yellow"
                            ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400"
                        }`}
                      >
                        {item.channel === "green"
                          ? "Luồng Xanh"
                          : item.channel === "yellow"
                          ? "Luồng Vàng"
                          : "Luồng Đỏ"}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-medium">
                      <span
                        className={
                          item.flow === "XK"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-purple-600 dark:text-purple-400"
                        }
                      >
                        {item.flow}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono font-semibold text-slate-900 dark:text-white">
                      ${formatNumber(item.turnoverUSD)}
                    </td>
                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400 text-[11px]">
                      {item.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
              Hiển thị 5 / {data.declarations.length} tờ khai gần nhất (Task 5 sẽ cung cấp bảng tương tác đầy đủ kèm phân trang và tìm kiếm)
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-500">
            Không tìm thấy tờ khai nào phù hợp với bộ lọc đã chọn.
          </div>
        )}
      </section>
    </div>
  );
}

export default function DeclarationsTurnoverPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
          <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Đang khởi tạo Dashboard Tờ khai – Kim ngạch...</p>
        </div>
      }
    >
      <DeclarationsTurnoverContent />
    </Suspense>
  );
}
