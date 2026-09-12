"use client";

import React from "react";
import { useDashboard, BRANCH_OPTIONS, DATE_PRESETS } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Building2,
  RefreshCw,
  Printer,
  Moon,
  Sun,
  Search,
  Command,
  Database,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
} from "lucide-react";

export function DashboardHeader() {
  const {
    branch,
    setBranch,
    datePreset,
    setDatePreset,
    loaiXNK,
    setLoaiXNK,
    refetch,
    refreshing,
    loading,
    dbStatus,
    isDarkMode,
    toggleTheme,
    setShowShortcutsModal,
    searchTerm,
    setSearchTerm,
    exportPDF,
  } = useDashboard();

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filters (Branch, Date Range, Type) */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Branch Selector */}
          <div className="relative">
            <label htmlFor="branch-select" className="sr-only">
              Chi cục Hải quan
            </label>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <Building2 className="size-3.5 text-slate-400 shrink-0" />
              <select
                id="branch-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-transparent border-none outline-none font-medium cursor-pointer pr-4 focus:ring-0 text-xs"
              >
                {BRANCH_OPTIONS.map((opt) => (
                  <option key={opt.code} value={opt.code} className="dark:bg-slate-800">
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Preset Selector */}
          <div className="relative">
            <label htmlFor="date-select" className="sr-only">
              Kỳ báo cáo
            </label>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-xs font-medium text-slate-700 dark:text-slate-200 shadow-2xs hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <Calendar className="size-3.5 text-slate-400 shrink-0" />
              <select
                id="date-select"
                value={datePreset}
                onChange={(e) => setDatePreset(e.target.value)}
                className="bg-transparent border-none outline-none font-medium cursor-pointer pr-4 focus:ring-0 text-xs"
              >
                {Object.entries(DATE_PRESETS).map(([key, item]) => (
                  <option key={key} value={key} className="dark:bg-slate-800">
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Import / Export Selector */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setLoaiXNK("ALL")}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                loaiXNK === "ALL"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tất cả
            </button>
            <button
              type="button"
              onClick={() => setLoaiXNK("NK")}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                loaiXNK === "NK"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Nhập khẩu
            </button>
            <button
              type="button"
              onClick={() => setLoaiXNK("XK")}
              className={`px-2 py-1 rounded-md font-medium transition-all ${
                loaiXNK === "XK"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Xuất khẩu
            </button>
          </div>

          {/* Search Input */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm MST, Doanh nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 w-52 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Right: DB Status, Actions, Theme */}
        <div className="flex items-center gap-2">
          {/* DB Status Badge */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
              dbStatus === "live"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800"
                : "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                dbStatus === "live" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span>{dbStatus === "live" ? "SQL Server Live" : "Dữ liệu Mẫu (Fallback)"}</span>
          </div>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={loading || refreshing}
            className="h-8 px-2.5 text-xs text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            <span className="hidden md:inline ml-1.5">Làm mới</span>
          </Button>

          {/* PDF Export Button */}
          <Button
            variant="default"
            size="sm"
            onClick={exportPDF}
            className="h-8 px-2.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 shadow-2xs"
            title="In / Xuất báo cáo PDF"
          >
            <Printer className="size-3.5" />
            <span className="hidden md:inline ml-1.5">In / Xuất PDF</span>
          </Button>

          {/* Dark / Light Mode Switcher */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="h-8 w-8 p-0 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Đổi giao diện Sáng / Tối (D)"
            aria-label="Chuyển đổi giao diện"
          >
            {isDarkMode ? <Sun className="size-4 text-amber-400" /> : <Moon className="size-4 text-slate-600" />}
          </Button>

          {/* Shortcuts Info Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowShortcutsModal(true)}
            className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Phím tắt hệ thống (?)"
            aria-label="Xem phím tắt"
          >
            <HelpCircle className="size-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
