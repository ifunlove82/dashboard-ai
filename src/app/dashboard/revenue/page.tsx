"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RevenueKPIs } from "@/components/dashboard/RevenueKPIs";
import { RevenueChartsRow1 } from "@/components/dashboard/RevenueChartsRow1";
import { RevenueChartsRow2 } from "@/components/dashboard/RevenueChartsRow2";
import { RevenueTopLists } from "@/components/dashboard/RevenueTopLists";
import { RevenueDeclarationTable } from "@/components/dashboard/RevenueDeclarationTable";

export default function RevenuePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [data, setData] = useState<any>(null);

  const unit = searchParams.get("unit");
  const taxType = searchParams.get("taxType");
  const enterprise = searchParams.get("enterprise");

  useEffect(() => {
    fetch(`/api/v1/revenue/detailed?${searchParams.toString()}`)
      .then((r) => r.json())
      .then(setData);
  }, [searchParams]);

  const resetFilter = (level: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (level === "all") {
      params.delete("unit");
      params.delete("taxType");
      params.delete("enterprise");
    }
    if (level === "unit") {
      params.delete("taxType");
      params.delete("enterprise");
    }
    if (level === "taxType") {
      params.delete("enterprise");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-500 dark:text-slate-400">
        Đang tải dữ liệu thu ngân sách...
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex gap-2 text-sm font-semibold mb-6 items-center text-slate-600 dark:text-slate-400">
        <button
          onClick={() => resetFilter("all")}
          className="text-blue-500 hover:underline dark:text-blue-400 cursor-pointer"
        >
          Toàn Cục
        </button>
        {unit && (
          <>
            <span>/</span>
            <button
              onClick={() => resetFilter("unit")}
              className="text-blue-500 hover:underline dark:text-blue-400 cursor-pointer"
            >
              {unit}
            </button>
          </>
        )}
        {taxType && (
          <>
            <span>/</span>
            <button
              onClick={() => resetFilter("taxType")}
              className="text-blue-500 hover:underline dark:text-blue-400 cursor-pointer"
            >
              {taxType}
            </button>
          </>
        )}
        {enterprise && (
          <>
            <span>/</span>
            <span className="text-slate-900 dark:text-white font-bold">{enterprise}</span>
          </>
        )}
      </div>
      <RevenueKPIs kpis={data.kpis} />
      {!enterprise ? (
        <>
          <RevenueChartsRow1 charts={data.charts} />
          <RevenueChartsRow2 charts={data.charts} />
          <RevenueTopLists tops={data.tops} />
        </>
      ) : (
        <RevenueDeclarationTable declarations={data.declarations} />
      )}
    </div>
  );
}
