"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Package, Anchor, Check, ChevronRight } from "lucide-react";
import type {
  CommodityChartItem,
  PortChartItem,
} from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureCardsRow2Props {
  charts?: {
    byCommodity?: CommodityChartItem[];
    byPort?: PortChartItem[];
  } | null;
  onDrill?: (type: "commodity" | "port", value: string) => void;
  selectedCommodity?: string | null;
  selectedPort?: string | null;
}

const DEFAULT_COMMODITY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];
const DEFAULT_PORT_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#06b6d4", "#6366f1"];

export function InfrastructureCardsRow2({
  charts,
  onDrill,
  selectedCommodity,
  selectedPort,
}: InfrastructureCardsRow2Props) {
  if (!charts) return null;

  const byCommodity = charts.byCommodity || [];
  const byPort = charts.byPort || [];

  const isCommoditySelected = (name: string) => {
    return Boolean(selectedCommodity && selectedCommodity === name);
  };

  const isPortSelected = (name: string) => {
    if (!selectedPort) return false;
    if (selectedPort === name) return true;
    if (selectedPort === "HQ TP.HCM" && name.includes("TP.HCM")) return true;
    if (selectedPort === "HQ Hải Phòng" && name.includes("Hải Phòng")) return true;
    if (
      selectedPort === "HQ Bà Rịa - Vũng Tàu" &&
      (name.includes("Vũng Tàu") || name.includes("Cái Mép"))
    ) {
      return true;
    }
    return false;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      {/* Card 1: Phí theo Loại hàng hóa */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Package className="size-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  Phí theo Loại hàng hóa
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Cơ cấu doanh thu theo tính chất mặt hàng
                </p>
              </div>
            </div>

            {selectedCommodity ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                <Check className="size-3" />
                <span className="max-w-[100px] truncate">{selectedCommodity}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                {byCommodity.length} nhóm hàng
              </span>
            )}
          </div>

          {/* Commodity Custom List */}
          <div className="space-y-2.5">
            {byCommodity.map((item, index) => {
              const isSelected = isCommoditySelected(item.name);
              const color =
                item.color || DEFAULT_COMMODITY_COLORS[index % DEFAULT_COMMODITY_COLORS.length];
              const pct = Math.min(100, Math.max(0, item.percentage || 0));

              return (
                <button
                  key={item.id || item.name}
                  type="button"
                  onClick={() => onDrill?.("commodity", item.name)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-blue-50/80 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 ring-1 ring-blue-500/40"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                  title={`Click để ${isSelected ? "bỏ lọc" : "lọc theo"} ${item.name}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className={`text-xs font-semibold truncate transition-colors ${
                          isSelected
                            ? "text-blue-900 dark:text-blue-200"
                            : "text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.value.toLocaleString("vi-VN")}{" "}
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          Tỷ VNĐ
                        </span>
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md text-right min-w-[46px] ${
                          isSelected
                            ? "bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300"
                            : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.percentage}%
                      </span>
                      <ChevronRight
                        className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${
                          isSelected
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Custom Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>* Nhấp vào mục để lọc/bỏ lọc</span>
          <span>Hàng Container chiếm ưu thế lớn nhất</span>
        </div>
      </Card>

      {/* Card 2: Phí theo Khu vực Cảng biển */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="size-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Anchor className="size-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  Phí theo Cụm Cảng biển
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  Phân bổ nguồn thu theo khu vực cụm cảng
                </p>
              </div>
            </div>

            {selectedPort && selectedPort !== "ALL" ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 shrink-0">
                <Check className="size-3" />
                <span className="max-w-[100px] truncate">{selectedPort}</span>
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                {byPort.length} cụm cảng
              </span>
            )}
          </div>

          {/* Port Custom List */}
          <div className="space-y-2.5">
            {byPort.map((item, index) => {
              const isSelected = isPortSelected(item.name);
              const color =
                item.color || DEFAULT_PORT_COLORS[index % DEFAULT_PORT_COLORS.length];
              const pct = Math.min(100, Math.max(0, item.percentage || 0));

              return (
                <button
                  key={item.id || item.name}
                  type="button"
                  onClick={() => onDrill?.("port", item.name)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-700 ring-1 ring-emerald-500/40"
                      : "bg-slate-50/60 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80 hover:bg-slate-100/80 dark:hover:bg-slate-800/70 hover:border-slate-200 dark:hover:border-slate-700"
                  }`}
                  title={`Click để ${isSelected ? "bỏ lọc" : "lọc theo"} ${item.name}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="size-2.5 rounded-full shrink-0 ring-2 ring-white dark:ring-slate-900"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className={`text-xs font-semibold truncate transition-colors ${
                          isSelected
                            ? "text-emerald-900 dark:text-emerald-200"
                            : "text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.value.toLocaleString("vi-VN")}{" "}
                        <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                          Tỷ VNĐ
                        </span>
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md text-right min-w-[46px] ${
                          isSelected
                            ? "bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-200/60 dark:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {item.percentage}%
                      </span>
                      <ChevronRight
                        className={`size-3.5 transition-transform group-hover:translate-x-0.5 ${
                          isSelected
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-slate-400 dark:text-slate-500"
                        }`}
                      />
                    </div>
                  </div>

                  {/* Sub-ports subtitle if present */}
                  {item.subPorts && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-4 mb-2 truncate">
                      Cảng thành phần: <span className="font-medium text-slate-700 dark:text-slate-300">{item.subPorts}</span>
                    </div>
                  )}

                  {/* Custom Progress Bar */}
                  <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer info note */}
        <div className="mt-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
          <span>* Nhấp vào cụm cảng để lọc vùng</span>
          <span>Cụm cảng TP.HCM chiếm &gt;50% tổng thu</span>
        </div>
      </Card>
    </div>
  );
}
