"use client";

import React, { useState, useMemo } from "react";
import { useDashboard, formatUSD, formatVND, formatNumber } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Building2,
  Search,
  ArrowUpDown,
  ShieldCheck,
  AlertTriangle,
  Award,
  Filter,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function EnterprisesPage() {
  const { data, loading, searchTerm, setSearchTerm } = useDashboard();
  const [sortField, setSortField] = useState<"valueUSD" | "declarations" | "containers">("valueUSD");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [complianceFilter, setComplianceFilter] = useState<string>("ALL");

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải danh sách doanh nghiệp xuất nhập khẩu...</p>
      </div>
    );
  }

  const rawEnterprises = data?.topEnterprises || data?.enterprises || [];

  // Enhance enterprises with compliance rating
  const enterprisesWithCompliance = useMemo(() => {
    return rawEnterprises.map((dn, idx) => {
      let status = "Tuân thủ cao";
      let statusColor = "emerald";
      let badge = "Hạng 1 (Chuẩn mực)";

      if (idx === 0 || idx === 1) {
        status = "DN Ưu tiên (AEO)";
        statusColor = "blue";
        badge = "AEO";
      } else if (idx >= 7) {
        status = "Cần theo dõi rủi ro";
        statusColor = "amber";
        badge = "Hạng 3 (Theo dõi)";
      }

      return {
        ...dn,
        status,
        statusColor,
        badge,
      };
    });
  }, [rawEnterprises]);

  // Filter & Sort
  const filteredEnterprises = useMemo(() => {
    return enterprisesWithCompliance
      .filter((dn) => {
        const matchesSearch =
          dn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          dn.taxId.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompliance =
          complianceFilter === "ALL" ||
          (complianceFilter === "AEO" && dn.status.includes("AEO")) ||
          (complianceFilter === "HIGH" && dn.status.includes("Tuân thủ")) ||
          (complianceFilter === "RISK" && dn.status.includes("rủi ro"));
        return matchesSearch && matchesCompliance;
      })
      .sort((a, b) => {
        const factor = sortOrder === "asc" ? 1 : -1;
        return (a[sortField] - b[sortField]) * factor;
      });
  }, [enterprisesWithCompliance, searchTerm, complianceFilter, sortField, sortOrder]);

  const toggleSort = (field: "valueUSD" | "declarations" | "containers") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const totalValue = rawEnterprises.reduce((sum, e) => sum + e.valueUSD, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Building2 className="size-5 text-indigo-600" />
          Xếp Hạng & Đánh Giá Mức Độ Tuân Thủ Doanh Nghiệp XNK
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Quản lý phân loại rủi ro doanh nghiệp, mức độ tuân thủ pháp luật hải quan và kim ngạch thương mại phát sinh.
        </p>
      </div>

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doanh Nghiệp Đang Hoạt Động
            </span>
            <div className="size-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <Building2 className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatNumber(data?.kpis?.activeEnterprises || 120)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Mới phát sinh thủ tục:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                +{data?.kpis?.newEnterprises || 18} DN
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Doanh Nghiệp Ưu Tiên (AEO)
            </span>
            <div className="size-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <Award className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-blue-600 dark:text-blue-400">
              12 <span className="text-sm font-semibold text-slate-500">doanh nghiệp</span>
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Tỷ lệ luồng xanh AEO:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">99.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-3.5 px-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng Kim Ngạch Top Đầu
            </span>
            <div className="size-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="size-3.5" />
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-3.5 pt-0">
            <div className="text-2xl font-extrabold tracking-tight tabular-nums text-slate-900 dark:text-white">
              {formatUSD(totalValue)}
            </div>
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">Chiếm tỷ trọng:</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">~68.5% tổng số</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Search & Compliance Filter Bar */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
        <CardContent className="p-4 flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo Mã số thuế hoặc Tên công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Compliance Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setComplianceFilter("ALL")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                complianceFilter === "ALL"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Tất cả ({rawEnterprises.length})
            </button>
            <button
              type="button"
              onClick={() => setComplianceFilter("AEO")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                complianceFilter === "AEO"
                  ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              AEO (Ưu tiên)
            </button>
            <button
              type="button"
              onClick={() => setComplianceFilter("HIGH")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                complianceFilter === "HIGH"
                  ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Tuân thủ cao
            </button>
            <button
              type="button"
              onClick={() => setComplianceFilter("RISK")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                complianceFilter === "RISK"
                  ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
              }`}
            >
              Cần theo dõi
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 3. Enterprises Ranking Table */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Danh Sách Chi Tiết Doanh Nghiệp ({filteredEnterprises.length})</span>
            <span className="text-xs font-normal text-slate-500">
              Nhấn tiêu đề cột để sắp xếp
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Mã số thuế</th>
                  <th className="py-3 px-4">Tên Doanh nghiệp</th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => toggleSort("declarations")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Tờ khai</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-center cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => toggleSort("containers")}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <span>Số cont</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </th>
                  <th
                    className="py-3 px-4 text-right cursor-pointer hover:text-slate-900 dark:hover:text-white"
                    onClick={() => toggleSort("valueUSD")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>Kim ngạch (USD)</span>
                      <ArrowUpDown className="size-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="py-3 px-4 text-center">Đánh giá rủi ro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEnterprises.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Không tìm thấy doanh nghiệp nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredEnterprises.map((dn, idx) => (
                    <tr
                      key={dn.taxId}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4 font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                        {dn.taxId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {dn.name}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatNumber(dn.declarations)}
                      </td>
                      <td className="py-3 px-4 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                        {formatNumber(dn.containers)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                        {formatUSD(dn.valueUSD)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            dn.statusColor === "blue"
                              ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                              : dn.statusColor === "emerald"
                              ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                              : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                          }`}
                        >
                          {dn.badge}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
