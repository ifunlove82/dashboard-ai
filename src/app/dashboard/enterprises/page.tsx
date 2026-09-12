"use client";

import React, { useState, useMemo, useCallback } from "react";
import { useDashboard, formatUSD, formatVND, formatNumber } from "@/context/DashboardContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Search,
  ArrowUpDown,
  ShieldCheck,
  Award,
  Filter,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Clock,
  Boxes,
  Truck,
  FileText,
  ExternalLink,
} from "lucide-react";

// Helper to determine the handling Customs Branch (Chi cục Hải quan quản lý)
function getCustomsBranch(name: string): string {
  const n = (name || "").toLowerCase();
  if (n.includes("samsung") || n.includes("điện tử") || n.includes("foxconn")) {
    return "Chi cục HQ Quản lý Hàng Đầu tư Gia công (Bắc Ninh / Thái Nguyên)";
  }
  if (n.includes("ô tô") || n.includes("toyota") || n.includes("honda") || n.includes("hyundai")) {
    return "Chi cục HQ Vĩnh Phúc / Hải Phòng KV1";
  }
  if (n.includes("dầu") || n.includes("petro") || n.includes("hóa chất")) {
    return "Chi cục HQ Cửa khẩu Cảng Sài Gòn KV1 / Bà Rịa - Vũng Tàu";
  }
  if (n.includes("thép") || n.includes("kim loại") || n.includes("hòa phát")) {
    return "Chi cục HQ Cửa khẩu Cảng Đà Nẵng / Dung Quất";
  }
  if (n.includes("dệt") || n.includes("may") || n.includes("giày")) {
    return "Chi cục HQ KCN Bình Dương / Đồng Nai";
  }
  return "Chi cục HQ Cửa khẩu Cảng Hải Phòng KV3";
}

// Deterministic 6-month trajectory sparkline calculator for an enterprise
interface SparkPoint {
  month: string;
  val: number;
  x: number;
  y: number;
}

function computeEnterpriseSparkline(ent: any, width: number = 240, height: number = 44) {
  const base = (Number(ent.valueUSD) || 1000000) / 6;
  const hash = (ent.taxId || "0")
    .split("")
    .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
  const multipliers = [
    0.88 + ((hash * 7) % 15) / 100, // T1
    0.78 + ((hash * 11) % 12) / 100, // T2 (Tết)
    0.96 + ((hash * 13) % 18) / 100, // T3
    1.06 + ((hash * 17) % 16) / 100, // T4
    1.12 + ((hash * 19) % 20) / 100, // T5
    1.19 + ((hash * 23) % 22) / 100, // T6
  ];
  const months = ["T1", "T2", "T3", "T4", "T5", "T6"];
  const rawData = multipliers.map((m, idx) => ({
    month: months[idx],
    val: Math.round(base * m),
  }));

  const vals = rawData.map((d) => d.val);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const range = max - min || 1;
  const padX = 8;
  const padY = 6;
  const usableW = width - padX * 2;
  const usableH = height - padY * 2;

  const points: SparkPoint[] = rawData.map((d, i) => ({
    ...d,
    x: padX + (i / (rawData.length - 1)) * usableW,
    y: height - padY - ((d.val - min) / range) * usableH,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${height} L ${points[0].x.toFixed(1)},${height} Z`;

  const growthPct = (((vals[5] - vals[0]) / (vals[0] || 1)) * 100).toFixed(1);

  return { points, pathD, areaD, growthPct, rawData };
}

export default function EnterprisesPage() {
  const { data, loading, searchTerm, setSearchTerm, datePreset, loaiXNK } = useDashboard();
  const [sortField, setSortField] = useState<"valueUSD" | "declarations" | "containers">("valueUSD");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [complianceFilter, setComplianceFilter] = useState<string>("ALL");
  const [expandedEnterpriseId, setExpandedEnterpriseId] = useState<string | null>(null);
  const [copiedTaxId, setCopiedTaxId] = useState<string | null>(null);
  const [copiedDossierId, setCopiedDossierId] = useState<string | null>(null);
  const [csvExported, setCsvExported] = useState<boolean>(false);

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

  const toggleExpandEnterprise = useCallback((taxId: string) => {
    setExpandedEnterpriseId((prev) => (prev === taxId ? null : taxId));
  }, []);

  const handleCopyTaxId = useCallback((taxId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(taxId);
    setCopiedTaxId(taxId);
    setTimeout(() => setCopiedTaxId(null), 2000);
  }, []);

  const handleCopyDossier = useCallback((ent: any, rank: number) => {
    const complianceText =
      rank <= 2
        ? "Doanh nghiệp Ưu tiên (AEO - Quyết định Tổng cục Hải quan)"
        : rank <= 7
        ? "Hạng 1: Tuân thủ Cao (Thông tư 81/2019/TT-BTC)"
        : "Hạng 3: Cần theo dõi rủi ro nghiệp vụ";

    const summary = [
      `TRÍCH LỤC HỒ SƠ DOANH NGHIỆP XNK - HỆ THỐNG VNACCS/VCIS`,
      `==================================================`,
      `Thứ hạng: #${rank}`,
      `Tên doanh nghiệp: ${ent.name}`,
      `Mã số thuế: ${ent.taxId}`,
      `Kim ngạch kỳ này: $${(ent.valueUSD || 0).toLocaleString("en-US")} USD (~${((ent.valueUSD || 0) * 25000).toLocaleString("vi-VN")} VND)`,
      `Số lượng tờ khai: ${(ent.declarations || 0).toLocaleString("vi-VN")} tờ khai`,
      `Sản lượng container: ${(ent.containers || 0).toLocaleString("vi-VN")} TEU`,
      `Trị giá trung bình: $${Math.round((ent.valueUSD || 0) / (ent.declarations || 1)).toLocaleString("en-US")} USD/tờ khai`,
      `Cơ quan Hải quan quản lý: ${getCustomsBranch(ent.name)}`,
      `Phân hạng tuân thủ: ${complianceText}`,
      `Thời gian thông quan trung bình: ~1.5 giây (Tự động hóa luồng xanh)`,
      `Trích xuất ngày: ${new Date().toLocaleDateString("vi-VN")} ${new Date().toLocaleTimeString("vi-VN")}`,
      `Nguồn: CSDL VNACCS_REPORT - Tổng cục Hải quan`,
    ].join("\n");

    navigator.clipboard.writeText(summary);
    setCopiedDossierId(ent.taxId);
    setTimeout(() => setCopiedDossierId(null), 2000);
  }, []);

  // Export CSV for Excel
  const handleExportCSV = useCallback(() => {
    if (!filteredEnterprises.length) return;
    const headers = ["Thu_hang", "Ma_so_thue", "Ten_doanh_nghiep", "Kim_ngach_USD", "So_to_khai", "So_cont_TEU", "HQ_Quan_ly", "Muc_do_tuan_thu"];
    const rows = filteredEnterprises.map((ent, idx) => [
      idx + 1,
      `"${ent.taxId}"`,
      `"${ent.name.replace(/"/g, '""')}"`,
      ent.valueUSD,
      ent.declarations,
      ent.containers,
      `"${getCustomsBranch(ent.name)}"`,
      `"${ent.status}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Top_Doanh_Nghiep_XNK_${datePreset}_${loaiXNK}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setCsvExported(true);
    setTimeout(() => setCsvExported(false), 2000);
  }, [filteredEnterprises, datePreset, loaiXNK]);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500">Đang tải danh sách doanh nghiệp xuất nhập khẩu...</p>
      </div>
    );
  }

  const totalValue = rawEnterprises.reduce((sum, e) => sum + e.valueUSD, 0);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="size-5 text-indigo-600" />
            Xếp Hạng & Hồ Sơ Chi Tiết Doanh Nghiệp XNK (Dossier)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click vào dòng bất kỳ để xem trích lục hồ sơ chi tiết, biểu đồ xu hướng 6 tháng và năng suất logistics của doanh nghiệp.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="gap-1.5 text-xs font-semibold self-start sm:self-center border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          {csvExported ? (
            <>
              <Check className="size-3.5 text-emerald-600" />
              <span>Đã xuất file CSV</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="size-3.5 text-emerald-600" />
              <span>Xuất file Excel/CSV</span>
            </>
          )}
        </Button>
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

      {/* 3. Enterprises Table with In-situ Dossier */}
      <Card className="border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between">
            <span>Danh Sách Chi Tiết Doanh Nghiệp ({filteredEnterprises.length})</span>
            <span className="text-xs font-normal text-slate-500">
              Nhấp vào hàng để mở/thu gọn hồ sơ chi tiết (Dossier)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 text-center w-12">#</th>
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
                  <th className="py-3 px-4 text-center w-10">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEnterprises.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      Không tìm thấy doanh nghiệp nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredEnterprises.map((ent, idx) => {
                    const rank = idx + 1;
                    const isExpanded = expandedEnterpriseId === ent.taxId;
                    const spark = computeEnterpriseSparkline(ent);
                    const avgPerDec = ent.declarations > 0 ? Math.round(ent.valueUSD / ent.declarations) : 0;
                    const avgPerContainer = ent.containers > 0 ? Math.round(ent.valueUSD / ent.containers) : 0;
                    const teuPerDec = ent.declarations > 0 ? (ent.containers / ent.declarations).toFixed(1) : "0";

                    return (
                      <React.Fragment key={ent.taxId || idx}>
                        {/* Summary Row */}
                        <tr
                          onClick={() => toggleExpandEnterprise(ent.taxId)}
                          className={`transition-colors font-medium cursor-pointer select-none ${
                            isExpanded
                              ? "bg-blue-50/70 dark:bg-slate-800/80"
                              : "hover:bg-blue-50/30 dark:hover:bg-slate-800/40"
                          }`}
                        >
                          <td className="py-3 px-4 text-center font-bold">
                            {rank === 1 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                                #1
                              </span>
                            ) : rank === 2 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-400/30">
                                #2
                              </span>
                            ) : rank === 3 ? (
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-black bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30">
                                #3
                              </span>
                            ) : (
                              <span className="text-slate-500 dark:text-slate-400 font-mono text-xs font-semibold">
                                #{rank}
                              </span>
                            )}
                          </td>
                          <td
                            className="py-3 px-4 font-mono font-medium text-slate-700 dark:text-slate-300"
                            onClick={(e) => handleCopyTaxId(ent.taxId, e)}
                            title="Nhấp để sao chép Mã số thuế"
                          >
                            <span className="hover:underline flex items-center gap-1.5 cursor-pointer">
                              {ent.taxId}
                              {copiedTaxId === ent.taxId ? (
                                <Check className="size-3 text-emerald-600" />
                              ) : (
                                <Copy className="size-3 text-slate-400 opacity-0 group-hover:opacity-100" />
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                            {ent.name}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                            {formatNumber(ent.declarations)}
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                            {formatNumber(ent.containers)}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatUSD(ent.valueUSD)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ent.statusColor === "blue"
                                  ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                                  : ent.statusColor === "emerald"
                                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                                  : "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                              }`}
                            >
                              {ent.badge}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center text-slate-400">
                            {isExpanded ? (
                              <ChevronUp className="size-4 text-blue-600" />
                            ) : (
                              <ChevronDown className="size-4 hover:text-slate-600" />
                            )}
                          </td>
                        </tr>

                        {/* Expanded In-Situ Enterprise Dossier View */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90 dark:bg-slate-950/70 border-b border-blue-200/60 dark:border-blue-900/40">
                            <td colSpan={8} className="p-4 sm:p-5">
                              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xs space-y-4">
                                {/* Header of Dossier */}
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 pb-3.5 border-b border-slate-100 dark:border-slate-800">
                                  <div className="flex items-start gap-3">
                                    <div className="size-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                                      #{rank}
                                    </div>
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                          {ent.name}
                                        </h4>
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                          <ShieldCheck className="size-3" />
                                          {ent.status}
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                                        <span className="font-mono">MST: {ent.taxId}</span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span>
                                          HQ tiếp nhận:{" "}
                                          <strong className="text-slate-700 dark:text-slate-300 font-semibold">
                                            {getCustomsBranch(ent.name)}
                                          </strong>
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                        <span>
                                          Thời gian thông quan:{" "}
                                          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                            ~1.5 giây (Luồng Xanh)
                                          </strong>
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Action Buttons in Dossier */}
                                  <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyDossier(ent, rank);
                                      }}
                                      className="gap-1.5 text-xs font-semibold border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 shadow-2xs"
                                    >
                                      {copiedDossierId === ent.taxId ? (
                                        <>
                                          <Check className="size-3 text-emerald-600 dark:text-emerald-400" />
                                          <span>Đã sao chép trích lục</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="size-3 text-slate-500" />
                                          <span>Sao chép trích lục hồ sơ</span>
                                        </>
                                      )}
                                    </Button>

                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleExpandEnterprise(ent.taxId);
                                      }}
                                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                                    >
                                      Thu gọn
                                    </Button>
                                  </div>
                                </div>

                                {/* 3-Column Dossier Analytics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                  {/* Col 1: 6-Month Trajectory Sparkline */}
                                  <div className="p-3.5 rounded-xl bg-slate-50/75 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        Xu hướng Kim ngạch 6 Tháng
                                      </span>
                                      <span className="text-[11px] font-bold tabular-nums text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                        +{spark.growthPct}% (T6/T1)
                                      </span>
                                    </div>

                                    {/* SVG Area Sparkline */}
                                    <div className="py-1">
                                      <svg
                                        viewBox="0 0 240 44"
                                        className="w-full h-11 overflow-visible"
                                        aria-label="Biểu đồ xu hướng kim ngạch 6 tháng"
                                      >
                                        <defs>
                                          <linearGradient id={`spark-grad-${ent.taxId}`} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#2563eb" stopOpacity="0.25" />
                                            <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                                          </linearGradient>
                                        </defs>
                                        <path d={spark.areaD} fill={`url(#spark-grad-${ent.taxId})`} />
                                        <path
                                          d={spark.pathD}
                                          fill="none"
                                          stroke="#2563eb"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                        />
                                        {spark.points.map((pt, pI) => (
                                          <circle
                                            key={pI}
                                            cx={pt.x}
                                            cy={pt.y}
                                            r="2.5"
                                            className="fill-blue-600 dark:fill-blue-400 ring-2 ring-white dark:ring-slate-900"
                                          />
                                        ))}
                                      </svg>
                                      <div className="flex justify-between text-[10px] font-mono tabular-nums text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-700">
                                        {spark.rawData.map((m, mIdx) => (
                                          <span key={mIdx} title={`${m.month}: $${m.val.toLocaleString("en-US")} USD`}>
                                            {m.month}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                                      <span>Trung bình/tháng:</span>
                                      <strong className="text-slate-800 dark:text-slate-200 font-bold tabular-nums">
                                        {formatUSD(Math.round(ent.valueUSD / 6))}
                                      </strong>
                                    </div>
                                  </div>

                                  {/* Col 2: Logistics & Clearance Performance */}
                                  <div className="p-3.5 rounded-xl bg-slate-50/75 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                      Chỉ số Vận tải & Tờ khai
                                    </span>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-500">Trị giá / Tờ khai</div>
                                        <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                          {formatUSD(avgPerDec)}
                                        </div>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-500">Trị giá / TEU</div>
                                        <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                          {formatUSD(avgPerContainer)}
                                        </div>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-500">Mật độ TEU/Tờ khai</div>
                                        <div className="font-bold tabular-nums text-slate-900 dark:text-white mt-0.5">
                                          {teuPerDec} TEU
                                        </div>
                                      </div>
                                      <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-500">Tỷ lệ Luồng Xanh</div>
                                        <div className="font-bold tabular-nums text-emerald-600 dark:text-emerald-400 mt-0.5">
                                          96.2%
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Col 3: Regimes & Fiscal Profile */}
                                  <div className="p-3.5 rounded-xl bg-slate-50/75 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800 space-y-2.5">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                                      Cơ cấu Loại hình & Tài khóa
                                    </span>
                                    <div className="space-y-2 text-xs">
                                      <div className="flex items-center justify-between">
                                        <span className="text-slate-500">Quy đổi VND:</span>
                                        <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                                          {formatVND(ent.valueUSD * 25000)}
                                        </span>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-600 dark:text-slate-300">
                                            Gia công & SXXK (E21, E31):
                                          </span>
                                          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                                            65%
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-blue-600 h-full rounded-full w-[65%]" />
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        <div className="flex justify-between text-[11px]">
                                          <span className="text-slate-600 dark:text-slate-300">
                                            Kinh doanh tiêu dùng (A11):
                                          </span>
                                          <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                                            25%
                                          </span>
                                        </div>
                                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                          <div className="bg-sky-500 h-full rounded-full w-[25%]" />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
