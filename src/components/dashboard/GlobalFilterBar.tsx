"use client";

import React from "react";
import { useDashboard, BRANCH_OPTIONS } from "@/context/DashboardContext";
import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GlobalFilterBar() {
  const { branch, setBranch, timeframe, setTimeframe, loaiXNK, setLoaiXNK } = useDashboard();

  const timeframes = ["T-1", "Tuần", "Tháng", "Quý", "Năm"];
  const tradeTypes = [
    { value: "ALL", label: "Tất cả" },
    { value: "NK", label: "Nhập khẩu" },
    { value: "XK", label: "Xuất khẩu" }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-2 flex flex-wrap items-center gap-4 text-sm z-20 sticky top-[60px] md:top-0">
      
      {/* Unit Select using shadcn/ui */}
      <div className="flex items-center gap-2">
        <label htmlFor="global-unit-select" className="sr-only">Đơn vị Hải quan</label>
        <div className="flex items-center gap-1.5 px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 transition-colors">
          <Building2 className="ml-2 w-4 h-4 text-slate-500 shrink-0" />
          <Select value={branch} onValueChange={(val) => setBranch(val || "")}>
            <SelectTrigger className="border-none bg-transparent shadow-none h-7 focus:ring-0">
              <SelectValue placeholder="Chọn Đơn vị Hải quan" />
            </SelectTrigger>
            <SelectContent>
              {BRANCH_OPTIONS.map((opt) => (
                <SelectItem key={opt.code} value={opt.code}>
                  {opt.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeframe Buttons using shadcn/ui */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
        {timeframes.map((tf) => (
          <Button
            key={tf}
            variant={timeframe === tf ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeframe(tf)}
            className={`h-7 px-3 text-xs ${
              timeframe === tf
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm hover:bg-white hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tf}
          </Button>
        ))}
      </div>

      {/* Trade Type Segmented Control using shadcn/ui */}
      <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
        {tradeTypes.map((tt) => (
          <Button
            key={tt.value}
            variant={loaiXNK === tt.value ? "default" : "ghost"}
            size="sm"
            onClick={() => setLoaiXNK(tt.value)}
            className={`h-7 px-3 text-xs ${
              loaiXNK === tt.value
                ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm hover:bg-white hover:text-blue-600 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            {tt.label}
          </Button>
        ))}
      </div>

    </div>
  );
}
