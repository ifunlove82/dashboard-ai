"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
  Layers,
  Table as TableIcon,
  Building2,
  FileText,
  Filter,
  Package,
} from "lucide-react";
import type { DeclarationItem } from "@/app/api/v1/declarations-turnover/route";
import { formatNumber } from "@/context/DashboardContext";

export interface DeclarationsDetailTableProps {
  declarations?: DeclarationItem[];
  activeFilters?: {
    unit?: string;
    flow?: string;
    channel?: string;
    commodity?: string;
    regime?: string;
  };
  onResetFilters?: () => void;
  loading?: boolean;
}

const UNIT_NAMES: Record<string, string> = {
  cuc_hcm: "Cục HQ TP. Hồ Chí Minh",
  cuc_hp: "Cục HQ Hải Phòng",
  cuc_brvt: "Cục HQ Bà Rịa - Vũng Tàu",
  cuc_dn: "Cục HQ Đồng Nai",
  cuc_bd: "Cục HQ Bình Dương",
};

const COMMODITY_NAMES: Record<string, string> = {
  may_vi_tinh: "Máy vi tính & Linh kiện",
  dien_thoai: "Điện thoại & Linh kiện",
  may_moc: "Máy móc thiết bị & Phụ tùng",
  det_may: "Dệt may & May mặc",
  giay_dep: "Giày dép các loại",
  sat_thep: "Sắt thép các loại",
  go_san_pham_go: "Gỗ & Sản phẩm gỗ",
  thuy_san: "Thủy hải sản",
};

const FLOW_NAMES: Record<string, string> = {
  XK: "Xuất khẩu (XK)",
  NK: "Nhập khẩu (NK)",
};

const CHANNEL_NAMES: Record<string, string> = {
  green: "Luồng Xanh",
  yellow: "Luồng Vàng",
  red: "Luồng Đỏ",
};

const PAGE_SIZE = 10;

function formatDateTimeVN(dateStr: string): string {
  if (!dateStr) return "-";
  const parts = dateStr.split(" ");
  if (parts.length === 2) {
    const [datePart, timePart] = parts;
    const ymd = datePart.split("-");
    if (ymd.length === 3) {
      return `${timePart} - ${ymd[2]}/${ymd[1]}/${ymd[0]}`;
    }
  }
  return dateStr;
}

export function DeclarationsDetailTable({
  declarations = [],
  activeFilters,
  onResetFilters,
  loading = false,
}: DeclarationsDetailTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedChannel, setSelectedChannel] = useState<
    "all" | "green" | "yellow" | "red"
  >("all");
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sync or reset channel tab if activeFilters.channel changes
  useEffect(() => {
    if (
      activeFilters?.channel &&
      ["green", "yellow", "red"].includes(activeFilters.channel)
    ) {
      setSelectedChannel(
        activeFilters.channel as "green" | "yellow" | "red"
      );
    } else {
      setSelectedChannel("all");
    }
  }, [activeFilters?.channel]);

  // Channel counts for quick filter tabs (based on incoming declarations)
  const channelCounts = useMemo(() => {
    const counts = {
      all: declarations.length,
      green: 0,
      yellow: 0,
      red: 0,
    };
    for (const d of declarations) {
      if (d.channel === "green") counts.green++;
      else if (d.channel === "yellow") counts.yellow++;
      else if (d.channel === "red") counts.red++;
    }
    return counts;
  }, [declarations]);

  // Filtered declarations based on search & quick channel tabs
  const filteredDeclarations = useMemo(() => {
    let result = declarations;

    // 1. Channel filter
    if (selectedChannel !== "all") {
      result = result.filter((d) => d.channel === selectedChannel);
    }

    // 2. Search filter (declarationNo, enterpriseName, enterpriseCode)
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.declarationNo.toLowerCase().includes(q) ||
          d.enterpriseName.toLowerCase().includes(q) ||
          d.enterpriseCode.toLowerCase().includes(q)
      );
    }

    return result;
  }, [declarations, selectedChannel, searchTerm]);

  // Reset to page 1 whenever search query or channel changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedChannel]);

  // Pagination calculation
  const totalItems = filteredDeclarations.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const paginatedDeclarations = useMemo(() => {
    const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
    return filteredDeclarations.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDeclarations, validCurrentPage]);

  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);

  // Active filters list for chips summary
  const hasParentFilters = Boolean(
    activeFilters &&
      (activeFilters.unit ||
        activeFilters.flow ||
        activeFilters.channel ||
        activeFilters.commodity ||
        activeFilters.regime)
  );

  const hasAnyFilterOrSearch =
    hasParentFilters ||
    searchTerm.trim().length > 0 ||
    selectedChannel !== "all";

  const handleClearSearchAndFilters = () => {
    setSearchTerm("");
    setSelectedChannel("all");
    setCurrentPage(1);
    if (onResetFilters) {
      onResetFilters();
    }
  };

  return (
    <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs overflow-hidden">
      {/* 1. Header Bar */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <TableIcon className="size-4.5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-white uppercase">
                BẢNG TỜ KHAI CHI TIẾT (DRILL-DOWN)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tra cứu danh sách tờ khai hải quan, trạng thái xử lý và trị giá kim ngạch chi tiết
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
            {totalItems} / {declarations.length} tờ khai
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
            Trang {validCurrentPage} / {totalPages}
          </span>
        </div>
      </div>

      {/* 2. Controls Toolbar: Search & Quick Channel Filter Tabs */}
      <div className="p-4 bg-slate-50/60 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Instant Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo số tờ khai (106...), tên DN, mã số thuế..."
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
              aria-label="Tìm kiếm tờ khai"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick Channel Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {/* All channels */}
            <button
              type="button"
              onClick={() => setSelectedChannel("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedChannel === "all"
                  ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Tất cả</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedChannel === "all"
                    ? "bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                }`}
              >
                {channelCounts.all}
              </span>
            </button>

            {/* Green channel */}
            <button
              type="button"
              onClick={() => setSelectedChannel("green")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedChannel === "green"
                  ? "bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60"
              }`}
            >
              <CheckCircle2 className="size-3.5" />
              <span>Luồng Xanh</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedChannel === "green"
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300"
                }`}
              >
                {channelCounts.green}
              </span>
            </button>

            {/* Yellow channel */}
            <button
              type="button"
              onClick={() => setSelectedChannel("yellow")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedChannel === "yellow"
                  ? "bg-amber-500 text-white dark:bg-amber-400 dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60"
              }`}
            >
              <AlertTriangle className="size-3.5" />
              <span>Luồng Vàng</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedChannel === "yellow"
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                    : "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300"
                }`}
              >
                {channelCounts.yellow}
              </span>
            </button>

            {/* Red channel */}
            <button
              type="button"
              onClick={() => setSelectedChannel("red")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                selectedChannel === "red"
                  ? "bg-rose-600 text-white dark:bg-rose-500 dark:text-slate-950 shadow-xs"
                  : "bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60"
              }`}
            >
              <AlertCircle className="size-3.5" />
              <span>Luồng Đỏ</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  selectedChannel === "red"
                    ? "bg-white/20 text-white dark:bg-slate-950/20 dark:text-slate-950"
                    : "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300"
                }`}
              >
                {channelCounts.red}
              </span>
            </button>
          </div>
        </div>

        {/* 3. Active Filters Chips Summary */}
        {hasAnyFilterOrSearch && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Filter className="size-3" />
              Đang lọc:
            </span>

            {activeFilters?.unit && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <Building2 className="size-3 text-blue-500" />
                Đơn vị: {UNIT_NAMES[activeFilters.unit] || activeFilters.unit}
              </span>
            )}

            {activeFilters?.flow && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                Chiều: {FLOW_NAMES[activeFilters.flow] || activeFilters.flow}
              </span>
            )}

            {activeFilters?.channel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Luồng URL: {CHANNEL_NAMES[activeFilters.channel] || activeFilters.channel}
              </span>
            )}

            {selectedChannel !== "all" && !activeFilters?.channel && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Lọc nhanh: {CHANNEL_NAMES[selectedChannel]}
                <button
                  type="button"
                  onClick={() => setSelectedChannel("all")}
                  className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  title="Bỏ lọc luồng"
                >
                  ×
                </button>
              </span>
            )}

            {activeFilters?.regime && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-mono">
                Loại hình: {activeFilters.regime}
              </span>
            )}

            {activeFilters?.commodity && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <Package className="size-3 text-amber-500" />
                Hàng hóa: {COMMODITY_NAMES[activeFilters.commodity] || activeFilters.commodity}
              </span>
            )}

            {searchTerm.trim() && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                Từ khóa: &quot;{searchTerm}&quot;
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="hover:text-rose-600 font-bold ml-1 cursor-pointer"
                  title="Xóa từ khóa"
                >
                  ×
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearSearchAndFilters}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline cursor-pointer ml-auto"
            >
              <RotateCcw className="size-3" />
              Đặt lại tất cả
            </button>
          </div>
        )}
      </div>

      {/* 4. Table Body / Loading / Empty States */}
      {loading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800/80 rounded-lg" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-lg" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800/40 rounded-lg" />
          <div className="h-12 bg-slate-100 dark:bg-slate-800/30 rounded-lg" />
        </div>
      ) : paginatedDeclarations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                <th scope="col" className="py-3 px-4">
                  Số Tờ Khai & Thời Gian
                </th>
                <th scope="col" className="py-3 px-4">
                  Doanh Nghiệp / MST
                </th>
                <th scope="col" className="py-3 px-3">
                  Loại Hình & Chiều
                </th>
                <th scope="col" className="py-3 px-3">
                  Phân Luồng
                </th>
                <th scope="col" className="py-3 px-4 text-right">
                  Kim Ngạch (USD)
                </th>
                <th scope="col" className="py-3 px-4">
                  Trạng Thái Xử Lý
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {paginatedDeclarations.map((item) => {
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Số tờ khai & Thời gian */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3.5 text-blue-500 shrink-0" />
                        <span className="font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400 group-hover:underline">
                          {item.declarationNo}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 pl-5">
                        {formatDateTimeVN(item.date)}
                      </div>
                    </td>

                    {/* Doanh nghiệp & MST */}
                    <td className="py-3 px-4 max-w-[280px]">
                      <div
                        className="font-medium text-slate-900 dark:text-slate-100 truncate text-xs"
                        title={item.enterpriseName}
                      >
                        {item.enterpriseName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-1">
                        <Building2 className="size-3 text-slate-400 shrink-0" />
                        <span>MST: {item.enterpriseCode}</span>
                      </div>
                    </td>

                    {/* Loại hình & Chiều */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80">
                          {item.regimeCode}
                        </span>
                        {item.flow === "XK" ? (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                            <ArrowUpRight className="size-2.5" />
                            XK
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60">
                            <ArrowDownRight className="size-2.5" />
                            NK
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Phân luồng */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      {item.channel === "green" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Luồng Xanh</span>
                        </span>
                      ) : item.channel === "yellow" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                          <AlertTriangle className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                          <span>Luồng Vàng</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
                          <AlertCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>Luồng Đỏ</span>
                        </span>
                      )}
                    </td>

                    {/* Kim ngạch USD */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-mono font-semibold tabular-nums text-slate-900 dark:text-white text-xs">
                        ${formatNumber(item.turnoverUSD)}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {(() => {
                        const s = item.status.toLowerCase();
                        if (s.includes("thông quan")) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                              <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{item.status}</span>
                            </span>
                          );
                        }
                        if (s.includes("hồ sơ")) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80">
                              <Clock className="size-3 text-amber-600 dark:text-amber-400 shrink-0" />
                              <span>{item.status}</span>
                            </span>
                          );
                        }
                        if (s.includes("kiểm hóa")) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/80">
                              <AlertCircle className="size-3 text-rose-600 dark:text-rose-400 shrink-0" />
                              <span>{item.status}</span>
                            </span>
                          );
                        }
                        if (s.includes("giải phóng")) {
                          return (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80">
                              <ArrowUpRight className="size-3 text-blue-600 dark:text-blue-400 shrink-0" />
                              <span>{item.status}</span>
                            </span>
                          );
                        }
                        return (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            <span>{item.status}</span>
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="py-12 px-4 text-center space-y-3">
          <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Search className="size-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Không tìm thấy tờ khai nào phù hợp
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Không có dữ liệu thỏa mãn điều kiện tìm kiếm hoặc bộ lọc hiện tại. Vui lòng kiểm tra lại từ khóa hoặc xóa bớt tiêu chí lọc.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearSearchAndFilters}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Xóa điều kiện tìm kiếm</span>
          </button>
        </div>
      )}

      {/* 5. Pagination Bar */}
      {!loading && totalItems > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div>
            Hiển thị{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {startIndex + 1}
            </span>{" "}
            –{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {endIndex}
            </span>{" "}
            trên tổng số{" "}
            <span className="font-semibold text-slate-900 dark:text-white">
              {totalItems}
            </span>{" "}
            tờ khai
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={validCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs"
              aria-label="Trang trước"
            >
              <ChevronLeft className="size-3.5" />
              <span>Trang trước</span>
            </button>

            {/* Page number buttons */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`size-7 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    p === validCurrentPage
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                  }`}
                  aria-label={`Trang ${p}`}
                  aria-current={p === validCurrentPage ? "page" : undefined}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={validCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-xs"
              aria-label="Trang sau"
            >
              <span>Trang sau</span>
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
