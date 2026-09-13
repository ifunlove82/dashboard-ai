"use client";

import React, { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Search,
  Download,
  FileText,
  Building2,
  CheckCircle2,
  Ship,
  Package,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import type { DeclarationItem } from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureDeclarationsTableProps {
  declarations: DeclarationItem[];
  onBack: () => void;
  enterpriseName?: string;
  enterpriseCode?: string | null;
}

export function InfrastructureDeclarationsTable({
  declarations,
  onBack,
  enterpriseName,
  enterpriseCode,
}: InfrastructureDeclarationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const companyTitle =
    enterpriseName ||
    declarations[0]?.enterpriseName ||
    (enterpriseCode ? `Doanh nghiệp ${enterpriseCode}` : "Doanh nghiệp");

  const companyCode =
    enterpriseCode || declarations[0]?.enterpriseCode || "Chưa xác định";

  // Filtered declarations
  const filteredDeclarations = useMemo(() => {
    if (!declarations) return [];
    let list = declarations;

    if (statusFilter !== "ALL") {
      list = list.filter((d) => d.status === statusFilter);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.declarationNo.toLowerCase().includes(q) ||
          d.commodity.toLowerCase().includes(q) ||
          d.type.toLowerCase().includes(q) ||
          d.port.toLowerCase().includes(q)
      );
    }

    return list;
  }, [declarations, statusFilter, searchTerm]);

  // Statistics
  const totalAmount = useMemo(
    () => declarations.reduce((sum, d) => sum + d.amount, 0),
    [declarations]
  );
  const totalContainers = useMemo(
    () => declarations.reduce((sum, d) => sum + (d.containers || 0), 0),
    [declarations]
  );
  const totalOnlineCount = useMemo(
    () =>
      declarations.filter(
        (d) => d.status.includes("24/7") || d.status.includes("hoàn thành")
      ).length,
    [declarations]
  );

  const getStatusBadge = (status: string) => {
    if (status.includes("24/7")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
          {status}
        </span>
      );
    }
    if (status.includes("thông quan") || status.includes("hoàn thành")) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
          {status}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Return button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="cursor-pointer gap-2 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs"
          >
            <ArrowLeft className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Quay lại Tổng quan</span>
          </Button>
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {companyTitle}
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Mã số thuế / Định danh DN:{" "}
              <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                {companyCode}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer gap-1.5 text-xs border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Download className="size-3.5 text-slate-500" />
            <span>Xuất báo cáo tờ khai</span>
          </Button>
        </div>
      </div>

      {/* 4 Summary Stat Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-950/70 border border-blue-200/80 dark:border-blue-800/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <FileText className="size-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng số tờ khai
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {declarations.length}{" "}
              <span className="text-xs font-normal text-slate-500">tờ khai</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tổng số tiền phí
            </div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {totalAmount.toLocaleString("vi-VN")}{" "}
              <span className="text-xs font-normal text-slate-500">VNĐ</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <Package className="size-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Khối lượng hàng
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {totalContainers}{" "}
              <span className="text-xs font-normal text-slate-500">Cont / TEU</span>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex items-center gap-3.5">
          <div className="size-10 rounded-lg bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200/80 dark:border-cyan-800/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <Ship className="size-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nộp phí 24/7
            </div>
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">
              {declarations.length > 0
                ? `${Math.round((totalOnlineCount / declarations.length) * 100)}%`
                : "100%"}
              <span className="text-xs font-normal text-slate-500 ml-1">trực tuyến</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Declarations Table Card */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
        {/* Table Filters & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="size-4 text-blue-600 dark:text-blue-400" />
              Chi tiết Tờ khai Phí Cơ Sở Hạ Tầng (Cấp Tờ khai)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Danh sách các tờ khai điện tử đã đăng ký và nộp phí qua cổng Hải quan & Cảng vụ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative min-w-[200px] sm:min-w-[240px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm Số TK, hàng hóa, cảng..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              aria-label="Lọc theo trạng thái tờ khai"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium cursor-pointer"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="Đã nộp 24/7">Đã nộp 24/7</option>
              <option value="Đã thông quan">Đã thông quan</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>

        {/* Declarations Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-200/80 dark:border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold select-none">
                <th className="py-3 px-3 text-center w-12">#</th>
                <th className="py-3 px-3 font-semibold">Số TK</th>
                <th className="py-3 px-3">Ngày nộp</th>
                <th className="py-3 px-3">Loại</th>
                <th className="py-3 px-3">Hàng hóa</th>
                <th className="py-3 px-3">Cảng / Khu vực</th>
                <th className="py-3 px-3 text-center">Số lượng</th>
                <th className="py-3 px-3 text-right">Đơn giá</th>
                <th className="py-3 px-3 text-right font-semibold">Số tiền</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredDeclarations.map((tk, idx) => {
                const unitPrice =
                  tk.containers > 0
                    ? Math.round(tk.amount / tk.containers)
                    : tk.amount;

                return (
                  <tr
                    key={tk.id}
                    className="hover:bg-blue-50/30 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    {/* Index */}
                    <td className="py-3 px-3 text-center text-slate-400 font-medium">
                      {idx + 1}
                    </td>

                    {/* Declaration No */}
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                      {tk.declarationNo}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {tk.date}
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      {tk.type}
                    </td>

                    {/* Commodity */}
                    <td className="py-3 px-3 text-slate-700 dark:text-slate-300 font-medium max-w-[180px] truncate" title={tk.commodity}>
                      {tk.commodity}
                    </td>

                    {/* Port */}
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {tk.port}
                    </td>

                    {/* Containers (Số lượng) */}
                    <td className="py-3 px-3 text-center font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {tk.containers}{" "}
                      <span className="text-[11px] font-normal text-slate-500">Cont</span>
                    </td>

                    {/* Unit price (Đơn giá) */}
                    <td className="py-3 px-3 text-right text-slate-600 dark:text-slate-400 whitespace-nowrap font-mono">
                      {unitPrice.toLocaleString("vi-VN")}{" "}
                      <span className="text-[10px] text-slate-500">đ/cont</span>
                    </td>

                    {/* Total Amount (Số tiền) */}
                    <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-[13px] font-mono">
                      {tk.amount.toLocaleString("vi-VN")} đ
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(tk.status)}
                    </td>
                  </tr>
                );
              })}

              {filteredDeclarations.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="py-10 text-center text-slate-500 dark:text-slate-400"
                  >
                    <FileText className="size-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                    Không tìm thấy tờ khai nào phù hợp với bộ lọc hiện tại
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div>
            Hiển thị{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {filteredDeclarations.length}
            </span>{" "}
            / {declarations.length} tờ khai
          </div>
          <div className="text-right">
            Tổng cộng:{" "}
            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
              {filteredDeclarations
                .reduce((sum, d) => sum + d.amount, 0)
                .toLocaleString("vi-VN")}{" "}
              VNĐ
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
