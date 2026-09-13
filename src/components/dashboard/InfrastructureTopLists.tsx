"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  Building2,
  Search,
  Download,
  ChevronRight,
  Layers,
  Package,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { EnterpriseItem } from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureTopListsProps {
  topEnterprises: EnterpriseItem[];
  onDrill?: (enterpriseId: string) => void;
}

export function InfrastructureTopLists({
  topEnterprises,
  onDrill,
}: InfrastructureTopListsProps) {
  const [activeTab, setActiveTab] = useState<"enterprises" | "regimes" | "commodities">("enterprises");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState<number>(10);

  // Filtered Enterprises
  const filteredEnterprises = useMemo(() => {
    if (!topEnterprises) return [];
    let list = topEnterprises;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.code.toLowerCase().includes(q) ||
          e.commodityType.toLowerCase().includes(q) ||
          e.port.toLowerCase().includes(q)
      );
    }
    return list;
  }, [topEnterprises, searchTerm]);

  // Aggregated Regimes / Declaration Types
  const aggregatedRegimes = useMemo(() => {
    if (!topEnterprises) return [];
    const map = new Map<
      string,
      { type: string; count: number; periodAmount: number; ytdAmount: number }
    >();

    topEnterprises.forEach((e) => {
      const key = e.declarationType;
      const existing = map.get(key) || {
        type: key,
        count: 0,
        periodAmount: 0,
        ytdAmount: 0,
      };
      existing.count += 1;
      existing.periodAmount += e.periodAmount;
      existing.ytdAmount += e.ytdAmount;
      map.set(key, existing);
    });

    const totalPeriod = Array.from(map.values()).reduce((sum, item) => sum + item.periodAmount, 0);

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: totalPeriod > 0 ? (item.periodAmount / totalPeriod) * 100 : 0,
      }))
      .sort((a, b) => b.periodAmount - a.periodAmount);
  }, [topEnterprises]);

  // Aggregated Commodities
  const aggregatedCommodities = useMemo(() => {
    if (!topEnterprises) return [];
    const map = new Map<
      string,
      { commodity: string; count: number; periodAmount: number; ytdAmount: number }
    >();

    topEnterprises.forEach((e) => {
      const key = e.commodityType;
      const existing = map.get(key) || {
        commodity: key,
        count: 0,
        periodAmount: 0,
        ytdAmount: 0,
      };
      existing.count += 1;
      existing.periodAmount += e.periodAmount;
      existing.ytdAmount += e.ytdAmount;
      map.set(key, existing);
    });

    const totalPeriod = Array.from(map.values()).reduce((sum, item) => sum + item.periodAmount, 0);

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: totalPeriod > 0 ? (item.periodAmount / totalPeriod) * 100 : 0,
      }))
      .sort((a, b) => b.periodAmount - a.periodAmount);
  }, [topEnterprises]);

  const displayedEnterprises = filteredEnterprises.slice(0, limit);
  const totalAmount = topEnterprises.reduce((acc, curr) => acc + curr.periodAmount, 0);

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 font-bold text-xs border border-amber-300 dark:border-amber-700 shadow-2xs">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200 font-bold text-xs border border-slate-300 dark:border-slate-600 shadow-2xs">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center size-6 rounded-full bg-orange-100 text-orange-800 dark:bg-orange-950/80 dark:text-orange-300 font-bold text-xs border border-orange-300 dark:border-orange-700 shadow-2xs">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center size-6 text-slate-500 dark:text-slate-400 font-medium text-xs">
        {rank}
      </span>
    );
  };

  const getTagBadge = (tag: string) => {
    if (tag.includes("TOP 1")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30">
          {tag}
        </span>
      );
    }
    if (tag.includes("FDI")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30">
          {tag}
        </span>
      );
    }
    if (tag.includes("Nhà nước")) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/30">
          {tag}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {tag}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    if (status.includes("24/7")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/60">
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
          {status}
        </span>
      );
    }
    if (status.includes("hoàn thành")) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60">
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/60">
        <Clock className="size-3 text-amber-600 dark:text-amber-400" />
        {status}
      </span>
    );
  };

  return (
    <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
      {/* Header with Tabs and Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        {/* Navigation Tabs */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("enterprises")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "enterprises"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Building2 className="size-4" />
            <span>TOP Doanh nghiệp nộp phí</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-900/80 dark:text-blue-300">
              {topEnterprises.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("regimes")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "regimes"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Layers className="size-4" />
            <span>TOP Loại hình tờ khai</span>
            <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {aggregatedRegimes.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("commodities")}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === "commodities"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 shadow-2xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/60"
            }`}
          >
            <Package className="size-4" />
            <span>TOP Nhóm hàng</span>
          </button>
        </div>

        {/* Search & Limits */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === "enterprises" && (
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm tên DN, MST, cảng..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          {activeTab === "enterprises" && (
            <div className="flex items-center gap-1 border border-slate-200 dark:border-slate-700 rounded-lg p-0.5 bg-slate-50 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setLimit(5)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  limit === 5
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                TOP 5
              </button>
              <button
                type="button"
                onClick={() => setLimit(10)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  limit === 10
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                TOP 10
              </button>
              <button
                type="button"
                onClick={() => setLimit(50)}
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  limit === 50
                    ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                Tất cả
              </button>
            </div>
          )}

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors shadow-2xs cursor-pointer"
            title="Xuất dữ liệu Excel"
          >
            <Download className="size-3.5 text-slate-500" />
            <span className="hidden sm:inline">Xuất Excel</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Enterprises Table */}
      {activeTab === "enterprises" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold select-none">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3">Doanh nghiệp & MST</th>
                <th className="py-3 px-3">Loại hình tờ khai</th>
                <th className="py-3 px-3">Cơ cấu hàng</th>
                <th className="py-3 px-3">Khu vực cảng</th>
                <th className="py-3 px-3 text-right font-semibold">Thu kỳ (Tỷ)</th>
                <th className="py-3 px-3 text-right">Lũy kế YTD</th>
                <th className="py-3 px-3 text-center">Tỷ trọng</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-3 text-center w-20">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {displayedEnterprises.map((dn) => (
                <tr
                  key={dn.id}
                  onClick={() => onDrill && onDrill(dn.id)}
                  className="hover:bg-blue-50/40 dark:hover:bg-blue-950/20 cursor-pointer transition-colors group"
                >
                  {/* Rank */}
                  <td className="py-3 px-3 text-center">{getRankBadge(dn.rank)}</td>

                  {/* Enterprise Name & Tax Code */}
                  <td className="py-3 px-3 max-w-[260px]">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-xs shrink-0 border border-blue-200/80 dark:border-blue-800/80">
                        {dn.avatar || dn.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate block">
                            {dn.name}
                          </span>
                          {getTagBadge(dn.tag)}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                          MST: {dn.code}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Declaration Type */}
                  <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                    {dn.declarationType}
                  </td>

                  {/* Commodity */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {dn.commodityType}
                  </td>

                  {/* Port */}
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    {dn.port}
                  </td>

                  {/* Period Amount */}
                  <td className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap text-[13px]">
                    {dn.periodAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>

                  {/* YTD Amount */}
                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {dn.ytdAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>

                  {/* Percentage */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {dn.percentage}%
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    {getStatusBadge(dn.status)}
                  </td>

                  {/* Drill Action */}
                  <td className="py-3 px-3 text-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDrill && onDrill(dn.id);
                      }}
                      className="p-1 rounded-md text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                      title={`Xem tờ khai của ${dn.name}`}
                    >
                      <ChevronRight className="size-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </td>
                </tr>
              ))}

              {displayedEnterprises.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    Không tìm thấy doanh nghiệp phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Regimes Table */}
      {activeTab === "regimes" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3">Loại hình tờ khai</th>
                <th className="py-3 px-3 text-center">Số lượng DN</th>
                <th className="py-3 px-3 text-right font-semibold">Thu kỳ báo cáo</th>
                <th className="py-3 px-3 text-right">Lũy kế YTD</th>
                <th className="py-3 px-3 text-center">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {aggregatedRegimes.map((r, idx) => (
                <tr
                  key={r.type}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3 text-center text-slate-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {r.type}
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {r.count} DN
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    {r.periodAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {r.ytdAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {r.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Commodities Table */}
      {activeTab === "commodities" && (
        <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3">Nhóm hàng hóa biểu thu</th>
                <th className="py-3 px-3 text-center">Số lượng DN</th>
                <th className="py-3 px-3 text-right font-semibold">Thu kỳ báo cáo</th>
                <th className="py-3 px-3 text-right">Lũy kế YTD</th>
                <th className="py-3 px-3 text-center">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {aggregatedCommodities.map((c, idx) => (
                <tr
                  key={c.commodity}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3 px-3 text-center text-slate-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                    {c.commodity}
                  </td>
                  <td className="py-3 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                    {c.count} DN
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-blue-600 dark:text-blue-400">
                    {c.periodAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700 dark:text-slate-300">
                    {c.ytdAmount.toLocaleString("vi-VN", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}{" "}
                    Tỷ
                  </td>
                  <td className="py-3 px-3 text-center font-semibold text-slate-700 dark:text-slate-300">
                    {c.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
        <div>
          Hiển thị{" "}
          <span className="font-semibold text-slate-700 dark:text-slate-200">
            {activeTab === "enterprises"
              ? displayedEnterprises.length
              : activeTab === "regimes"
              ? aggregatedRegimes.length
              : aggregatedCommodities.length}
          </span>{" "}
          mục • Bấm vào dòng doanh nghiệp để xem chi tiết tờ khai
        </div>
        <div className="text-right">
          Tổng thu các DN hàng đầu:{" "}
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {totalAmount.toLocaleString("vi-VN", {
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            })}{" "}
            Tỷ VNĐ
          </span>
        </div>
      </div>
    </Card>
  );
}
