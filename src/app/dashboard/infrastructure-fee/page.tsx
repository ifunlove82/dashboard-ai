"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { InfrastructureKPIs } from "@/components/dashboard/InfrastructureKPIs";
import type {
  KpiItem,
  Last6PeriodsChartItem,
  ImportExportChartItem,
  CommodityChartItem,
  PortChartItem,
  EnterpriseItem,
  DeclarationItem,
} from "@/app/api/v1/infrastructure-fee/detailed/route";

interface InfrastructureFeeData {
  kpis: KpiItem[];
  charts: {
    last6Periods: Last6PeriodsChartItem[];
    byImportExport: ImportExportChartItem[];
    byCommodity: CommodityChartItem[];
    byPort: PortChartItem[];
  };
  topEnterprises: EnterpriseItem[];
  declarations: DeclarationItem[];
}

export default function InfrastructureFeePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [data, setData] = useState<InfrastructureFeeData | null>(null);
  const [loading, setLoading] = useState(true);

  const unit = searchParams ? searchParams.get("unit") : null;
  const taxType = searchParams ? searchParams.get("taxType") : null;
  const enterprise = searchParams ? searchParams.get("enterprise") : null;

  useEffect(() => {
    setLoading(true);
    const query = searchParams ? searchParams.toString() : "";
    fetch(`/api/v1/infrastructure-fee/detailed${query ? `?${query}` : ""}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch infrastructure fee data");
        return res.json();
      })
      .then((json: InfrastructureFeeData) => {
        setData(json);
      })
      .catch((err) => {
        console.error("Error fetching infrastructure fee data:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  const resetFilter = (level: "all" | "unit" | "taxType") => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (level === "all") {
      params.delete("unit");
      params.delete("taxType");
      params.delete("enterprise");
    } else if (level === "unit") {
      params.delete("taxType");
      params.delete("enterprise");
    } else if (level === "taxType") {
      params.delete("enterprise");
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleUnitChange = (selectedUnit: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (!selectedUnit || selectedUnit === "ALL") {
      params.delete("unit");
    } else {
      params.set("unit", selectedUnit);
    }
    params.delete("taxType");
    params.delete("enterprise");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3">
        <div className="size-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Đang tải dữ liệu Phí Cơ Sở Hạ Tầng...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Global Filter Bar & Breadcrumbs */}
      <GlobalFilterBar
        unit={unit}
        taxType={taxType}
        enterprise={enterprise}
        onResetFilter={resetFilter}
        onUnitChange={handleUnitChange}
      />

      {/* 6-Card KPI Grid with Sparklines */}
      <InfrastructureKPIs kpis={data?.kpis || []} />
    </div>
  );
}
