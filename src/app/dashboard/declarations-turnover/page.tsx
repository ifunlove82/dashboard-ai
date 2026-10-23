"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftRight,
  Building2,
  Filter,
  RotateCcw,
  Layers,
  BarChart3,
  ChevronRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import type { DeclarationsTurnoverResponse } from "@/app/api/v1/declarations-turnover/route";
import { TradeBalanceHero } from "@/components/dashboard/TradeBalanceHero";
import { DualKpiPanel } from "@/components/dashboard/DualKpiPanel";
import { DeclarationsTurnoverCharts } from "@/components/dashboard/DeclarationsTurnoverCharts";
import { DeclarationsDetailTable } from "@/components/dashboard/DeclarationsDetailTable";

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
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  };

  const handleResetFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const handleChartFilter = (filterType: string, value: string) => {
    updateFilter(filterType, value);
    // Smooth scroll down to details table when filtering from a chart
    if (value && value !== "all") {
      setTimeout(() => {
        const tableElement = document.getElementById("section-declarations-detail-table");
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  const activeFilters = {
    unit: unit !== "all" ? unit : undefined,
    flow: flow !== "all" ? flow : undefined,
    channel: channel !== "all" ? channel : undefined,
    commodity: commodity !== "all" ? commodity : undefined,
    regime: regime !== "all" ? regime : undefined,
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

          {/* Active Regime chip */}
          {regime !== "all" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/60 text-xs font-medium text-blue-700 dark:text-blue-300">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Loại hình:</span>
              <span className="font-bold">{regime}</span>
              <button
                type="button"
                onClick={() => updateFilter("regime", "all")}
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
                title="Bỏ lọc loại hình"
              >
                ×
              </button>
            </div>
          )}

          {/* Active Commodity chip */}
          {commodity !== "all" && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/80 dark:bg-purple-950/60 text-xs font-medium text-purple-700 dark:text-purple-300">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">Nhóm hàng:</span>
              <span className="font-bold">{commodity}</span>
              <button
                type="button"
                onClick={() => updateFilter("commodity", "all")}
                className="hover:text-rose-600 dark:hover:text-rose-400 ml-0.5 cursor-pointer font-bold"
                title="Bỏ lọc nhóm hàng"
              >
                ×
              </button>
            </div>
          )}

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
      <section id="section-trade-balance-hero" aria-label="Cán cân thương mại">
        <TradeBalanceHero data={data?.tradeBalance} loading={loading} />
      </section>

      {/* 4. Khung 2: KPI song hành (DualKpiPanel) */}
      <section id="section-dual-kpi-panel" aria-label="KPI song hành">
        <DualKpiPanel
          declarationKpis={data?.declarationKpis}
          turnoverKpis={data?.turnoverKpis}
          loading={loading}
        />
      </section>

      {/* 5. Khung 3: 9 Biểu đồ trực quan (DeclarationsTurnoverCharts) */}
      <section
        id="section-declarations-turnover-charts"
        aria-label="Ma trận 9 biểu đồ phân tích"
        className="space-y-3"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <BarChart3 className="size-4.5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              3. Ma trận 9 Biểu đồ trực quan (Declarations & Turnover Charts Matrix)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
                Biểu đồ tự động đồng bộ theo bộ lọc
              </span>
            )}
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              Interactive 3x3 Matrix
            </span>
          </div>
        </div>

        <DeclarationsTurnoverCharts
          charts={data?.charts}
          onFilterChange={handleChartFilter}
          activeFilters={activeFilters}
          loading={loading}
        />
      </section>

      {/* 6. Khung 4: Bảng tờ khai chi tiết (DeclarationsDetailTable) */}
      <section
        id="section-declarations-detail-table"
        aria-label="Bảng tờ khai chi tiết"
      >
        <DeclarationsDetailTable
          declarations={data?.declarations}
          activeFilters={activeFilters}
          onResetFilters={handleResetFilters}
          loading={loading}
        />
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
