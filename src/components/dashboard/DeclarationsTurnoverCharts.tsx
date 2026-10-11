"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Layers,
  Building2,
  Boxes,
  GitCompare,
  TrendingUp,
  X,
  Filter,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Line,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import type { DeclarationsTurnoverResponse } from "@/app/api/v1/declarations-turnover/route";

export interface DeclarationsTurnoverChartsProps {
  charts?: DeclarationsTurnoverResponse["charts"] | null;
  onFilterChange?: (filterType: string, value: string) => void;
  activeFilters?: {
    unit?: string;
    flow?: string;
    channel?: string;
    commodity?: string;
    regime?: string;
  };
  loading?: boolean;
}

const tooltipContentStyle: React.CSSProperties = {
  backgroundColor: "#0f172a",
  borderColor: "#334155",
  borderRadius: "0.5rem",
  color: "#f8fafc",
  fontSize: "12px",
  padding: "8px 12px",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
};

function formatViNumber(val: number): string {
  return new Intl.NumberFormat("vi-VN").format(val);
}

function formatViDecimal(val: number, decimals: number = 1): string {
  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(val);
}

export function DeclarationsTurnoverCharts({
  charts,
  onFilterChange,
  activeFilters = {},
  loading = false,
}: DeclarationsTurnoverChartsProps) {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filter click helper: toggles off if already active, or activates new value
  const handleItemClick = (filterType: string, value: string) => {
    if (!onFilterChange) return;
    const currentActive = activeFilters[filterType as keyof typeof activeFilters];
    if (currentActive === value) {
      onFilterChange(filterType, "all");
    } else {
      onFilterChange(filterType, value);
    }
  };

  const isFlowActive = Boolean(activeFilters.flow && activeFilters.flow !== "all");
  const isChannelActive = Boolean(activeFilters.channel && activeFilters.channel !== "all");
  const isUnitActive = Boolean(activeFilters.unit && activeFilters.unit !== "all");
  const isCommodityActive = Boolean(activeFilters.commodity && activeFilters.commodity !== "all");
  const isRegimeActive = Boolean(activeFilters.regime && activeFilters.regime !== "all");

  // Loading skeleton or SSR fallback
  if (!mounted || loading || !charts) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: 9 }).map((_, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs animate-pulse flex flex-col justify-between h-[340px]"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-40" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800/60 rounded w-16" />
              </div>
              <div className="h-3 bg-slate-100 dark:bg-slate-800/40 rounded w-56" />
            </div>
            <div className="h-[240px] bg-slate-100/70 dark:bg-slate-800/40 rounded-lg flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-slate-200 dark:border-slate-700 border-t-transparent animate-spin" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {/* ============================================================ */}
      {/* 1. TỜ KHAI 6 KỲ GẦN NHẤT (BarChart cột kép XK vs NK)        */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isFlowActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                1. Tờ khai 6 kỳ gần nhất
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Số lượng tờ khai XK và NK (Click cột để lọc chiều hàng)
            </p>
          </div>
          {isFlowActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("flow", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
              title="Bỏ lọc chiều hàng"
            >
              <span>{activeFilters.flow}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              T05 - T10
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.declarationsLast6Periods}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(val) => `${Math.round(val / 1000)}k`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, name: any) => [
                  `${formatViNumber(Number(value))} tờ khai`,
                  name === "exportCount" ? "Xuất khẩu (XK)" : "Nhập khẩu (NK)",
                ]}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "6px" }}
                formatter={(val) => (val === "exportCount" ? "Xuất khẩu" : "Nhập khẩu")}
              />
              <Bar
                dataKey="exportCount"
                name="exportCount"
                fill="#3b82f6"
                radius={[3, 3, 0, 0]}
                cursor="pointer"
                opacity={activeFilters.flow === "NK" ? 0.35 : 1}
                onClick={() => handleItemClick("flow", "XK")}
              />
              <Bar
                dataKey="importCount"
                name="importCount"
                fill="#8b5cf6"
                radius={[3, 3, 0, 0]}
                cursor="pointer"
                opacity={activeFilters.flow === "XK" ? 0.35 : 1}
                onClick={() => handleItemClick("flow", "NK")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. KIM NGẠCH 6 KỲ GẦN NHẤT (Stacked BarChart XK vs NK)      */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isFlowActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Activity className="size-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                2. Kim ngạch 6 kỳ gần nhất
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Giá trị XNK xếp chồng (Triệu USD, click để lọc)
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            Triệu USD
          </span>
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.turnoverLast6Periods}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, name: any) => [
                  `$${formatViDecimal(Number(value), 1)} Triệu USD`,
                  name === "exportUSD" ? "Xuất khẩu (XK)" : "Nhập khẩu (NK)",
                ]}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "6px" }}
                formatter={(val) => (val === "exportUSD" ? "Xuất khẩu" : "Nhập khẩu")}
              />
              <Bar
                dataKey="exportUSD"
                name="exportUSD"
                stackId="turnover"
                fill="#3b82f6"
                cursor="pointer"
                opacity={activeFilters.flow === "NK" ? 0.35 : 1}
                onClick={() => handleItemClick("flow", "XK")}
              />
              <Bar
                dataKey="importUSD"
                name="importUSD"
                stackId="turnover"
                fill="#8b5cf6"
                radius={[3, 3, 0, 0]}
                cursor="pointer"
                opacity={activeFilters.flow === "XK" ? 0.35 : 1}
                onClick={() => handleItemClick("flow", "NK")}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. CÁN CÂN XNK 6 KỲ (Diverging BarChart)                     */}
      {/* ============================================================ */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                3. Cán cân XNK 6 kỳ gần nhất
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Chênh lệch Xuất siêu (+) vs Nhập siêu (-) (Triệu USD)
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
            Xuất siêu liên tục
          </span>
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.tradeBalanceLast6Periods}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="period"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(val) => `$${val}`}
              />
              <ReferenceLine y={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any) => {
                  const val = Number(value);
                  const isSurplus = val >= 0;
                  return [
                    `${isSurplus ? "+" : ""}$${formatViDecimal(val, 1)} Triệu USD`,
                    isSurplus ? "Xuất siêu" : "Nhập siêu",
                  ];
                }}
                labelFormatter={(label) => `Kỳ: ${label}`}
              />
              <Bar dataKey="netBalance" name="Cán cân" radius={[3, 3, 0, 0]}>
                {charts.tradeBalanceLast6Periods.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.netBalance >= 0 ? "#10b981" : "#ef4444"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. CƠ CẤU XUẤT KHẨU VS NHẬP KHẨU (Donut Chart)              */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isFlowActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <PieChartIcon className="size-4 text-blue-600 dark:text-blue-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                4. Cơ cấu Xuất khẩu vs Nhập khẩu
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Tỷ trọng kim ngạch 2 chiều (Click lát bánh để lọc)
            </p>
          </div>
          {isFlowActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("flow", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{activeFilters.flow}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Tỷ trọng %
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.importExportRatio}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="46%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                cursor="pointer"
                onClick={(entry: any) => {
                  const name = entry?.name || entry?.payload?.name || "";
                  const flowCode = name.toLowerCase().includes("xuất") ? "XK" : "NK";
                  handleItemClick("flow", flowCode);
                }}
              >
                {charts.importExportRatio.map((entry, index) => {
                  const isMatch =
                    (activeFilters.flow === "XK" && entry.name.includes("Xuất")) ||
                    (activeFilters.flow === "NK" && entry.name.includes("Nhập"));
                  const isDimmed = isFlowActive && !isMatch;
                  return (
                    <Cell
                      key={`pie-ratio-${index}`}
                      fill={entry.color}
                      opacity={isDimmed ? 0.35 : 1}
                      stroke={isMatch ? "#2563eb" : "transparent"}
                      strokeWidth={isMatch ? 3 : 0}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, name: any, item: any) => [
                  `$${formatViDecimal(Number(value), 1)} Tr. USD (${item?.payload?.pct}%)`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value: string, entry: any) => (
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {value} ({entry?.payload?.pct}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. CƠ CẤU THEO LOẠI HÌNH (Horizontal BarChart)              */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isRegimeActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Boxes className="size-4 text-sky-600 dark:text-sky-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                5. Cơ cấu theo Loại hình (Regime)
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Kim ngạch theo mã loại hình A11, B11... (Click để lọc)
            </p>
          </div>
          {isRegimeActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("regime", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{activeFilters.regime}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {charts.byRegime.length} loại hình
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.byRegime}
              layout="vertical"
              margin={{ top: 5, right: 15, left: -10, bottom: -5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="code"
                width={45}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fontWeight: 600, fill: "#475569" }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, _: any, item: any) => [
                  `$${formatViDecimal(Number(value), 1)} Tr. USD (${formatViNumber(item?.payload?.declarations)} TK)`,
                  `${item?.payload?.code}: ${item?.payload?.name}`,
                ]}
              />
              <Bar
                dataKey="turnoverUSD"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(entry: any) => {
                  const code = entry?.code || entry?.payload?.code;
                  if (code) handleItemClick("regime", code);
                }}
              >
                {charts.byRegime.map((entry, index) => {
                  const isSelected = activeFilters.regime === entry.code;
                  const isDimmed = isRegimeActive && !isSelected;
                  return (
                    <Cell
                      key={`regime-${index}`}
                      fill={isSelected ? "#2563eb" : "#3b82f6"}
                      opacity={isDimmed ? 0.35 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. TỶ LỆ PHÂN LUỒNG TỜ KHAI (Donut Chart)                   */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isChannelActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                6. Tỷ lệ Phân luồng tờ khai
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Luồng Xanh / Vàng / Đỏ (Click để lọc luồng)
            </p>
          </div>
          {isChannelActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("channel", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{activeFilters.channel}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              3 Luồng HQ
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={charts.channelDistribution}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="46%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                cursor="pointer"
                onClick={(entry: any) => {
                  const name = entry?.name || entry?.payload?.name || "";
                  let ch = "green";
                  if (name.includes("Vàng")) ch = "yellow";
                  else if (name.includes("Đỏ")) ch = "red";
                  handleItemClick("channel", ch);
                }}
              >
                {charts.channelDistribution.map((entry, index) => {
                  const chCode = entry.name.includes("Xanh")
                    ? "green"
                    : entry.name.includes("Vàng")
                    ? "yellow"
                    : "red";
                  const isSelected = activeFilters.channel === chCode;
                  const isDimmed = isChannelActive && !isSelected;
                  return (
                    <Cell
                      key={`channel-${index}`}
                      fill={entry.color}
                      opacity={isDimmed ? 0.35 : 1}
                      stroke={isSelected ? "#1e293b" : "transparent"}
                      strokeWidth={isSelected ? 3 : 0}
                    />
                  );
                })}
              </Pie>
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, name: any, item: any) => [
                  `${formatViNumber(Number(value))} tờ khai (${item?.payload?.pct}%)`,
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                formatter={(value: string, entry: any) => (
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    {value} ({entry?.payload?.pct}%)
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 7. PHÂN BỔ THEO CHI CỤC HẢI QUAN (BarChart)                 */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isUnitActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Building2 className="size-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                7. Phân bổ theo Cục Hải quan
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              So sánh kim ngạch theo đơn vị hải quan (Click để lọc)
            </p>
          </div>
          {isUnitActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("unit", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{activeFilters.unit}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              5 Đơn vị
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.byUnit}
              margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(name) => {
                  if (name.includes("Hồ Chí Minh")) return "TP.HCM";
                  if (name.includes("Hải Phòng")) return "Hải Phòng";
                  if (name.includes("Bình Dương")) return "Bình Dương";
                  if (name.includes("Đồng Nai")) return "Đồng Nai";
                  if (name.includes("Vũng Tàu")) return "BR-VT";
                  return name;
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, _: any, item: any) => [
                  `$${formatViDecimal(Number(value), 1)} Tr. USD (${formatViNumber(item?.payload?.declarations)} TK)`,
                  item?.payload?.name,
                ]}
              />
              <Bar
                dataKey="turnoverUSD"
                fill="#0ea5e9"
                radius={[4, 4, 0, 0]}
                cursor="pointer"
                onClick={(entry: any) => {
                  const unitId = entry?.unitId || entry?.payload?.unitId;
                  if (unitId) handleItemClick("unit", unitId);
                }}
              >
                {charts.byUnit.map((entry, index) => {
                  const isSelected = activeFilters.unit === entry.unitId;
                  const isDimmed = isUnitActive && !isSelected;
                  return (
                    <Cell
                      key={`unit-${index}`}
                      fill={isSelected ? "#2563eb" : "#0ea5e9"}
                      opacity={isDimmed ? 0.35 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 8. THEO NHÓM HÀNG CHỦ LỰC (Horizontal BarChart)             */}
      {/* ============================================================ */}
      <div
        className={`rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between ${
          isCommodityActive
            ? "border-blue-400 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10"
            : "border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Boxes className="size-4 text-violet-600 dark:text-violet-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                8. Theo Nhóm hàng chủ lực
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Top các nhóm hàng có kim ngạch cao nhất (Click để lọc)
            </p>
          </div>
          {isCommodityActive ? (
            <button
              type="button"
              onClick={() => onFilterChange?.("commodity", "all")}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 hover:bg-blue-200 transition-colors cursor-pointer"
            >
              <span>{activeFilters.commodity}</span>
              <X className="size-2.5" />
            </button>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              Top 8
            </span>
          )}
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={charts.byCommodity}
              layout="vertical"
              margin={{ top: 5, right: 15, left: 10, bottom: -5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.4} />
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="name"
                width={105}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9.5, fill: "#475569" }}
                tickFormatter={(name) => {
                  if (name.includes("Máy vi tính")) return "Máy vi tính & LK";
                  if (name.includes("Điện thoại")) return "Điện thoại & LK";
                  if (name.includes("Máy móc")) return "Máy móc thiết bị";
                  if (name.includes("Dệt may")) return "Dệt may";
                  if (name.includes("Giày dép")) return "Giày dép";
                  if (name.includes("Sắt thép")) return "Sắt thép";
                  if (name.includes("Gỗ")) return "Gỗ & SP gỗ";
                  if (name.includes("Thủy")) return "Thủy hải sản";
                  return name;
                }}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, _: any, item: any) => [
                  `$${formatViDecimal(Number(value), 1)} Tr. USD (${item?.payload?.pct}%) - ${formatViNumber(item?.payload?.declarations)} TK`,
                  item?.payload?.name,
                ]}
              />
              <Bar
                dataKey="turnoverUSD"
                radius={[0, 4, 4, 0]}
                cursor="pointer"
                onClick={(entry: any) => {
                  const id = entry?.id || entry?.payload?.id;
                  if (id) handleItemClick("commodity", id);
                }}
              >
                {charts.byCommodity.map((entry, index) => {
                  const isSelected = activeFilters.commodity === entry.id;
                  const isDimmed = isCommodityActive && !isSelected;
                  return (
                    <Cell
                      key={`commodity-${index}`}
                      fill={isSelected ? "#2563eb" : "#8b5cf6"}
                      opacity={isDimmed ? 0.35 : 1}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 9. TƯƠNG QUAN TỜ KHAI – KIM NGẠCH (ComposedChart)           */}
      {/* ============================================================ */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-xs flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <GitCompare className="size-4 text-rose-600 dark:text-rose-400" />
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                9. Tương quan Tờ khai – Kim ngạch
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Cột: Số tờ khai (Nghìn TK) | Đường: Kim ngạch (Triệu USD)
            </p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            2 Trục số liệu
          </span>
        </div>

        <div className="h-[250px] w-full pt-1">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={charts.correlation}
              margin={{ top: 10, right: -15, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.4} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={{ stroke: "#cbd5e1", opacity: 0.5 }}
                tick={{ fontSize: 9, fill: "#64748b" }}
                interval={0}
                tickFormatter={(val) => {
                  if (val.includes("Máy vi tính")) return "Vi tính";
                  if (val.includes("Điện thoại")) return "ĐT";
                  if (val.includes("Máy móc")) return "Máy móc";
                  if (val.includes("Dệt")) return "Dệt may";
                  if (val.includes("Giày")) return "Giày";
                  if (val.includes("Sắt")) return "Thép";
                  if (val.includes("Gỗ")) return "Gỗ";
                  if (val.includes("Thủy")) return "Thủy sản";
                  return val;
                }}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9.5, fill: "#64748b" }}
                tickFormatter={(val) => `${val}k`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 9.5, fill: "#f43f5e" }}
                tickFormatter={(val) => `$${Math.round(val / 1000)}k`}
              />
              <Tooltip
                contentStyle={tooltipContentStyle}
                formatter={(value: any, name: any, item: any) => {
                  if (name === "declarations") {
                    return [
                      `${formatViDecimal(Number(value), 1)} nghìn TK`,
                      "Số tờ khai",
                    ];
                  }
                  return [
                    `$${formatViDecimal(Number(value), 1)} Tr. USD (TB: $${formatViNumber(item?.payload?.avgUSD)}/TK)`,
                    "Kim ngạch",
                  ];
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ fontSize: "11px", paddingBottom: "6px" }}
                formatter={(val) =>
                  val === "declarations" ? "Số TK (nghìn)" : "Kim ngạch (Tr. USD)"
                }
              />
              <Bar
                yAxisId="left"
                dataKey="declarations"
                name="declarations"
                fill="#94a3b8"
                radius={[3, 3, 0, 0]}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="turnoverUSD"
                name="turnoverUSD"
                stroke="#f43f5e"
                strokeWidth={2.5}
                dot={{ r: 3, fill: "#f43f5e" }}
                activeDot={{ r: 5 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
