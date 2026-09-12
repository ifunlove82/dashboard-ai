"use client";

import React from "react";
import { useDashboard, BRANCH_OPTIONS } from "@/context/DashboardContext";
import { Building2 } from "lucide-react";

export function GlobalFilterBar() {
  const { unit, setUnit, timeframe, setTimeframe, tradeType, setTradeType } = useDashboard();

  const timeframes = ["T-1", "Tuần", "Tháng", "Quý", "Năm"];
  const tradeTypes = ["Tất cả", "Nhập khẩu", "Xuất khẩu"];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-4 text-sm z-20 sticky top-[60px] md:top-0">
      
      {/* Unit Select */}
      <div className="flex items-center gap-2">
        <label htmlFor="global-unit-select" className="sr-only">Đơn vị Hải quan</label>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
          <Building2 className="w-4 h-4 text-slate-500" />
          <select
            id="global-unit-select"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="bg-transparent border-none outline-none font-medium cursor-pointer text-sm focus:ring-0"
          >
            {BRANCH_OPTIONS.map((opt) => (
              <option key={opt.code} value={opt.code}>
                {opt.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeframe Buttons */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              timeframe === tf
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Trade Type Segmented Control */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
        {tradeTypes.map((tt) => (
          <button
            key={tt}
            onClick={() => setTradeType(tt)}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              tradeType === tt
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tt}
          </button>
        ))}
      </div>

    </div>
  );
}
