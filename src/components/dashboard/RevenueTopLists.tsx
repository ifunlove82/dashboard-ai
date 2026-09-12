"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function RevenueTopLists({ tops }: { tops: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [enterpriseLimit, setEnterpriseLimit] = useState(5);
  const [regimeLimit, setRegimeLimit] = useState(5);
  const [commodityLimit, setCommodityLimit] = useState(5);

  if (!tops) return null;

  const handleEnterprise = (id: string) => {
    if (!id) return;
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("enterprise", id);
    router.push(`${pathname}?${params.toString()}`);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN").format(val) + " tỷ VNĐ";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Cột 1: TOP Doanh nghiệp */}
      <Card className="p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            TOP Doanh nghiệp
          </h4>
          <select
            aria-label="Chọn số lượng hiển thị TOP doanh nghiệp"
            value={enterpriseLimit}
            onChange={(e) => setEnterpriseLimit(Number(e.target.value))}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>TOP 5</option>
            <option value={10}>TOP 10</option>
            <option value={20}>TOP 20</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {(tops.enterprises || []).slice(0, enterpriseLimit).map((dn: any, index: number) => (
            <div
              key={dn.id || index}
              onClick={() => handleEnterprise(dn.id || dn.name)}
              className="flex justify-between items-center py-2 px-1 text-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded transition-colors group"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-4">
                  {index + 1}
                </span>
                <span className="truncate text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium">
                  {dn.name}
                </span>
              </div>
              <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                {formatCurrency(dn.tax)}
              </span>
            </div>
          ))}
          {(!tops.enterprises || tops.enterprises.length === 0) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              Không có dữ liệu doanh nghiệp
            </p>
          )}
        </div>
      </Card>

      {/* Cột 2: TOP Loại hình */}
      <Card className="p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            TOP Loại hình
          </h4>
          <select
            aria-label="Chọn số lượng hiển thị TOP loại hình"
            value={regimeLimit}
            onChange={(e) => setRegimeLimit(Number(e.target.value))}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>TOP 5</option>
            <option value={10}>TOP 10</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {(tops.regimes || []).slice(0, regimeLimit).map((r: any, index: number) => (
            <div
              key={r.name || index}
              className="flex justify-between items-center py-2 px-1 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-4">
                  {index + 1}
                </span>
                <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                  {r.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                {formatCurrency(r.value)}
              </span>
            </div>
          ))}
          {(!tops.regimes || tops.regimes.length === 0) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              Không có dữ liệu loại hình
            </p>
          )}
        </div>
      </Card>

      {/* Cột 3: TOP Nhóm hàng */}
      <Card className="p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">
            TOP Nhóm hàng
          </h4>
          <select
            aria-label="Chọn số lượng hiển thị TOP nhóm hàng"
            value={commodityLimit}
            onChange={(e) => setCommodityLimit(Number(e.target.value))}
            className="text-xs border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value={5}>TOP 5</option>
            <option value={10}>TOP 10</option>
          </select>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {(tops.commodities || []).slice(0, commodityLimit).map((c: any, index: number) => (
            <div
              key={c.name || index}
              className="flex justify-between items-center py-2 px-1 text-sm"
            >
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 w-4">
                  {index + 1}
                </span>
                <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                  {c.name}
                </span>
              </div>
              <span className="font-semibold text-slate-900 dark:text-white shrink-0">
                {formatCurrency(c.value)}
              </span>
            </div>
          ))}
          {(!tops.commodities || tops.commodities.length === 0) && (
            <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
              Không có dữ liệu nhóm hàng
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}
