"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { GlobalFilterBar } from "@/components/dashboard/GlobalFilterBar";
import { InfrastructureKPIs } from "@/components/dashboard/InfrastructureKPIs";
import { InfrastructureChartsRow1 } from "@/components/dashboard/InfrastructureChartsRow1";
import { InfrastructureCardsRow2 } from "@/components/dashboard/InfrastructureCardsRow2";
import { InfrastructureTopLists } from "@/components/dashboard/InfrastructureTopLists";
import { InfrastructureDeclarationsTable } from "@/components/dashboard/InfrastructureDeclarationsTable";
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
  const commodity = searchParams ? searchParams.get("commodity") : null;
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
      params.delete("commodity");
      params.delete("enterprise");
    } else if (level === "unit") {
      params.delete("taxType");
      params.delete("commodity");
      params.delete("enterprise");
    } else if (level === "taxType") {
      params.delete("commodity");
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
    params.delete("commodity");
    params.delete("enterprise");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleDrill = (taxTypeValue: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (params.get("taxType") === taxTypeValue) {
      params.delete("taxType");
    } else {
      params.set("taxType", taxTypeValue);
    }
    params.delete("enterprise");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleCardDrill = (type: "commodity" | "port" | string, value: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    if (type === "commodity") {
      if (params.get("commodity") === value) {
        params.delete("commodity");
      } else {
        params.set("commodity", value);
      }
    } else if (type === "port") {
      let unitValue = value;
      if (value.includes("TP.HCM")) unitValue = "HQ TP.HCM";
      else if (value.includes("Hải Phòng")) unitValue = "HQ Hải Phòng";
      else if (value.includes("Vũng Tàu") || value.includes("Cái Mép")) unitValue = "HQ Bà Rịa - Vũng Tàu";

      if (params.get("unit") === unitValue) {
        params.delete("unit");
      } else {
        params.set("unit", unitValue);
      }
    }
    params.delete("enterprise");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleEnterpriseDrill = (enterpriseId: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.set("enterprise", enterpriseId);
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const handleBackFromDeclarations = () => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : "");
    params.delete("enterprise");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const currentEnterpriseName = enterprise
    ? data?.topEnterprises?.find((e) => e.id === enterprise || e.code === enterprise)?.name ||
      data?.declarations?.[0]?.enterpriseName ||
      `Doanh nghiệp ${enterprise}`
    : undefined;

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
        enterprise={currentEnterpriseName || enterprise}
        onResetFilter={resetFilter}
        onUnitChange={handleUnitChange}
      />

      {/* Leaf-Node Drill-down view: When enterprise is selected, hide Grid, Row 1, Row 2, Top Lists */}
      {enterprise ? (
        <InfrastructureDeclarationsTable
          declarations={data?.declarations || []}
          onBack={handleBackFromDeclarations}
          enterpriseName={currentEnterpriseName}
          enterpriseCode={enterprise}
        />
      ) : (
        <>
          {/* 6-Card KPI Grid with Sparklines */}
          <InfrastructureKPIs kpis={data?.kpis || []} />

          {/* Main Charts (Row 1 - Xu hướng & Luồng) */}
          {data?.charts && (
            <InfrastructureChartsRow1
              charts={data.charts}
              onDrill={handleDrill}
              selectedTaxType={taxType}
            />
          )}

          {/* Secondary Cards (Row 2 - Hàng hóa & Cảng) */}
          {data?.charts && (
            <InfrastructureCardsRow2
              charts={data.charts}
              onDrill={handleCardDrill}
              selectedCommodity={commodity}
              selectedPort={unit}
            />
          )}

          {/* Top Lists Table (Row 3 - TOP Doanh nghiệp & Loại hình) */}
          {data?.topEnterprises && (
            <InfrastructureTopLists
              topEnterprises={data.topEnterprises}
              onDrill={handleEnterpriseDrill}
            />
          )}
        </>
      )}
    </div>
  );
}
