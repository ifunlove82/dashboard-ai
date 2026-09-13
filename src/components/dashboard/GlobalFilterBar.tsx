"use client";

import React from "react";
import {
  ChevronRight,
  Filter,
  Download,
  Building2,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface GlobalFilterBarProps {
  unit?: string | null;
  taxType?: string | null;
  enterprise?: string | null;
  onResetFilter: (level: "all" | "unit" | "taxType") => void;
  onUnitChange?: (unit: string) => void;
}

const PORT_UNITS = [
  { value: "ALL", label: "Tất cả Cảng biển" },
  { value: "HQ Hải Phòng", label: "Cảng Hải Phòng (Đình Vũ - Lạch Huyện)" },
  { value: "HQ TP.HCM", label: "Cảng TP.HCM (Cát Lái - Hiệp Phước)" },
  { value: "HQ Bà Rịa - Vũng Tàu", label: "Cảng Cái Mép - Thị Vải" },
  { value: "HQ Đà Nẵng", label: "Cảng Đà Nẵng (Tiên Sa)" },
  { value: "HQ Quảng Ninh", label: "Cảng Quảng Ninh (Cái Lân)" },
];

export function GlobalFilterBar({
  unit,
  taxType,
  enterprise,
  onResetFilter,
  onUnitChange,
}: GlobalFilterBarProps) {
  const hasFilter = Boolean(unit || taxType || enterprise);

  return (
    <div className="space-y-4 mb-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumbs" className="flex items-center flex-wrap gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => onResetFilter("all")}
          className={`font-semibold transition-colors ${
            !hasFilter
              ? "text-blue-600 dark:text-blue-400 cursor-default"
              : "text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
          }`}
        >
          Phí CSHT
        </button>

        {unit && (
          <>
            <ChevronRight className="size-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onResetFilter("unit")}
              className={`font-semibold transition-colors ${
                !taxType && !enterprise
                  ? "text-blue-600 dark:text-blue-400 cursor-default"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
              }`}
            >
              {unit}
            </button>
          </>
        )}

        {taxType && (
          <>
            <ChevronRight className="size-3.5 text-slate-400" />
            <button
              type="button"
              onClick={() => onResetFilter("taxType")}
              className={`font-semibold transition-colors ${
                !enterprise
                  ? "text-blue-600 dark:text-blue-400 cursor-default"
                  : "text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 cursor-pointer"
              }`}
            >
              {taxType}
            </button>
          </>
        )}

        {enterprise && (
          <>
            <ChevronRight className="size-3.5 text-slate-400" />
            <span className="font-bold text-slate-900 dark:text-white max-w-[280px] sm:max-w-md truncate">
              {enterprise}
            </span>
          </>
        )}

        {hasFilter && (
          <button
            type="button"
            onClick={() => onResetFilter("all")}
            className="ml-2 inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-500 dark:text-slate-500 dark:hover:text-rose-400 cursor-pointer transition-colors"
            title="Xóa bộ lọc drill-down"
          >
            <RotateCcw className="size-3" />
            <span>Đặt lại</span>
          </button>
        )}
      </nav>

      {/* Page Title & Global Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              11. Dashboard Phí Cơ Sở Hạ Tầng (CSHT)
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              VNACCS & Cảng điện tử: Đồng bộ trực tuyến
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Theo dõi tiến độ thu phí kết cấu hạ tầng, dịch vụ tiện ích khu vực cảng biển & tờ khai doanh nghiệp
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Port Unit selector */}
          <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Building2 className="size-3.5 text-slate-400 shrink-0" />
            <select
              value={unit || "ALL"}
              onChange={(e) => onUnitChange && onUnitChange(e.target.value)}
              className="bg-transparent border-none outline-none font-medium cursor-pointer text-xs pr-2"
              aria-label="Chọn Cửa khẩu Cảng biển"
            >
              {PORT_UNITS.map((p) => (
                <option key={p.value} value={p.value} className="dark:bg-slate-800">
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {/* Period badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            <Calendar className="size-3.5 text-slate-400 shrink-0" />
            <span>Năm 2024 YTD</span>
          </div>

          {/* Advanced Filter Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-medium border-slate-200 dark:border-slate-700"
          >
            <Filter className="size-3.5 mr-1" />
            <span>Bộ lọc</span>
          </Button>

          {/* Export Report Button */}
          <Button
            size="sm"
            className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs"
          >
            <Download className="size-3.5 mr-1" />
            <span>Xuất báo cáo</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
