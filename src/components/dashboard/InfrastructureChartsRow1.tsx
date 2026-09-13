"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import type {
  Last6PeriodsChartItem,
  ImportExportChartItem,
} from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureChartsRow1Props {
  charts?: {
    last6Periods?: Last6PeriodsChartItem[];
    byImportExport?: ImportExportChartItem[];
  } | null;
  onDrill?: (taxType: string) => void;
  selectedTaxType?: string | null;
}

const DEFAULT_PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export function InfrastructureChartsRow1({
  charts,
  onDrill,
  selectedTaxType,
}: InfrastructureChartsRow1Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!charts) return null;

  const last6Periods = charts.last6Periods || [];
  const byImportExport = charts.byImportExport || [];

  const totalAmount = byImportExport.reduce((sum, item) => sum + (item.value || 0), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
      {/* Cột Trái (60% - 3 cols in 5-col grid): Xu hướng 6 kỳ gần nhất */}
      <Card className="lg:col-span-3 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Thu phí 6 kỳ gần nhất
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Doanh số thực thu & tốc độ tăng trưởng
            </p>
          </div>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            T05 - T10/2024
          </span>
        </div>

        <div className="h-[280px] w-full min-h-[260px] flex-1">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={last6Periods}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#94a3b8"
                  strokeOpacity={0.15}
                />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                />
                <YAxis
                  yAxisId="amount"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                  tickFormatter={(v) => `${v.toLocaleString("vi-VN")}`}
                />
                <YAxis
                  yAxisId="growth"
                  orientation="right"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "currentColor" }}
                  className="text-slate-500 dark:text-slate-400"
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    if (name === "Doanh số thực thu") {
                      return [`${Number(value).toLocaleString("vi-VN")} Tỷ VNĐ`, name];
                    }
                    if (name === "Tăng trưởng") {
                      const num = Number(value);
                      return [`${num > 0 ? "+" : ""}${num}%`, name];
                    }
                    return [value, name];
                  }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: "11px", paddingBottom: "8px" }}
                />
                <Bar
                  yAxisId="amount"
                  dataKey="amount"
                  name="Doanh số thực thu"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={38}
                />
                <Line
                  yAxisId="growth"
                  type="monotone"
                  dataKey="growth"
                  name="Tăng trưởng"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: "#f59e0b", strokeWidth: 1.5, stroke: "#ffffff" }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg animate-pulse" />
          )}
        </div>
      </Card>

      {/* Cột Phải (40% - 2 cols in 5-col grid): Cơ cấu theo luồng nghiệp vụ */}
      <Card className="lg:col-span-2 p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Cơ cấu theo Luồng nghiệp vụ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Click lát cắt để Drill-down
            </p>
          </div>
          {selectedTaxType && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
              Đang lọc: {selectedTaxType}
            </span>
          )}
        </div>

        {/* Donut Chart with Center Text */}
        <div className="relative h-[180px] w-full flex items-center justify-center my-1">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${Number(value).toLocaleString("vi-VN")} Tỷ VNĐ`,
                    name,
                  ]}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderColor: "#334155",
                    borderRadius: "0.5rem",
                    color: "#fff",
                    fontSize: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
                  }}
                />
                <Pie
                  data={byImportExport}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={3}
                  cursor="pointer"
                  onClick={(entry) => {
                    const selectedName = entry?.name || entry?.payload?.name;
                    if (selectedName && onDrill) {
                      onDrill(selectedName);
                    }
                  }}
                >
                  {byImportExport.map((entry, index) => {
                    const isSelected = selectedTaxType === entry.name;
                    const fillColor =
                      entry.color || DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length];
                    return (
                      <Cell
                        key={`donut-cell-${index}`}
                        fill={fillColor}
                        stroke={isSelected ? "#1e293b" : "transparent"}
                        strokeWidth={isSelected ? 3 : 1}
                        className="transition-opacity hover:opacity-85 cursor-pointer"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full bg-slate-50 dark:bg-slate-800/40 rounded-lg animate-pulse" />
          )}

          {/* Center text overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Tổng thu
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {totalAmount.toLocaleString("vi-VN")}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Tỷ VNĐ
            </span>
          </div>
        </div>

        {/* Custom Legend list */}
        <div className="space-y-1.5 mt-1 pt-2 border-t border-slate-100 dark:border-slate-800">
          {byImportExport.map((item, index) => {
            const isSelected = selectedTaxType === item.name;
            const color =
              item.color || DEFAULT_PIE_COLORS[index % DEFAULT_PIE_COLORS.length];
            return (
              <button
                key={item.id || item.name}
                type="button"
                onClick={() => onDrill?.(item.name)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-all cursor-pointer text-left ${
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/50 ring-1 ring-blue-500/50 text-blue-900 dark:text-blue-200"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                }`}
                title={`Click để lọc theo ${item.name}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="size-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium truncate">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {item.value.toLocaleString("vi-VN")} Tỷ
                  </span>
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 w-12 text-right">
                    ({item.percentage}%)
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
