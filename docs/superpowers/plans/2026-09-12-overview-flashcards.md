# Overview Flashcards YTD Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 6-card progressive-disclosure Overview Flashcard grid using strict Year-to-Date (YTD) data, replacing the existing 4-card overview.

**Architecture:** 
1. A new Next.js API route (`/api/stats/overview/route.ts`) to serve the specific strict-YTD dataset with monthly sparklines.
2. A new React Server/Client Component (`OverviewFlashcards.tsx`) to fetch and render the 6 cards in a 3x2 grid.
3. Integrate into the main `/dashboard/overview` page.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Recharts (Sparklines), shadcn/ui (Cards, Progress).

**Spec:** `docs/superpowers/specs/2026-09-12-overview-flashcards-design.md`

## Global Constraints

- **YTD Strict Mode**: The Flashcards represent Year-To-Date (YTD) data exclusively. They IGNORE the global Timeframe/Date filter.
- **Global Filters Respected**: Branch and LoaiXNK must still be applied.
- **Drill-down**: Cards must link to their respective tabs (`/dashboard/revenue`, `/dashboard/clearance`, `/dashboard/enterprises`) preserving search params.

---

### Task 1: Overview API Endpoint

**Files:**
- Create: `src/app/api/stats/overview/route.ts`

**Interfaces:**
- Consumes: URL Search Params (`branch`, `loaiXNK`). Ignores `timeframe` / `startDate` / `endDate`.
- Produces: JSON payload matching `OverviewData` interface containing 6 card datasets with YTD totals, YoY %, targets, and sparkline arrays.

- [ ] **Step 1: Write the API route implementation**

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const branch = searchParams.get("branch") || "ALL";
  const loaiXNK = searchParams.get("loaiXNK") || "ALL";
  
  // Strict YTD bounds
  const currentYear = new Date().getFullYear();
  const startDate = `${currentYear}-01-01`;
  const endDate = new Date().toISOString().split('T')[0];

  // In a real app, query the SQL Server using branch, loaiXNK, startDate, endDate.
  // For this UI build, return a robust mock payload conforming to the spec:
  const mockData = {
    revenue: {
      actual: 1245800000000,
      yoy_change: 6.8,
      target_pct: 78.4,
      sparkline: [120, 135, 125, 145, 150, 140, 155, 160, 130, 132.4]
    },
    seaport_fee: {
      actual: 2500000000,
      yoy_change: -1.5,
      target_pct: 45,
      sparkline: [20, 22, 19, 25, 23, 21, 22, 24, 25, 26]
    },
    declarations: {
      actual: 450000,
      diff_abs: 12500,
      yoy_change: 3.1,
      sparkline: [40, 42, 45, 43, 48, 47, 49, 50, 52, 51]
    },
    turnover: {
      actual: 12500000000, // USD
      diff_abs: 500000000,
      yoy_change: 8.4,
      sparkline: [1000, 1100, 1050, 1200, 1150, 1250, 1300, 1280, 1350, 1400]
    },
    goods: {
      weight: 15400000, // Tons
      containers: 85000,
      yoy_change: 4.2,
      sparkline: [1.2, 1.3, 1.25, 1.4, 1.35, 1.5, 1.6, 1.55, 1.65, 1.7]
    },
    enterprises: {
      total: 12500,
      new: 450,
      yoy_change: 2.1,
      sparkline: [1200, 1250, 1300, 1280, 1350, 1400, 1420, 1450, 1480, 1500]
    }
  };

  return NextResponse.json(mockData);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/api/stats/overview/route.ts
git commit -m "feat(api): create strict YTD overview API endpoint"
```

---

### Task 2: OverviewFlashcards Component

**Files:**
- Create: `src/components/dashboard/OverviewFlashcards.tsx`

**Interfaces:**
- Consumes: `/api/stats/overview` endpoint data.

- [ ] **Step 1: Write the UI Component implementation**

```tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AreaChart, Area, XAxis, ResponsiveContainer } from "recharts";
import { formatVND, formatUSD, formatNumber } from "@/context/DashboardContext";
import { ArrowUpRight, ArrowDownRight, Landmark, Building2, Anchor, FileText, DollarSign, Boxes } from "lucide-react";

export function OverviewFlashcards() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const branch = searchParams.get("branch") || "ALL";
      const loaiXNK = searchParams.get("loaiXNK") || "ALL";
      try {
        const res = await fetch(`/api/stats/overview?branch=${branch}&loaiXNK=${loaiXNK}`);
        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [searchParams]);

  if (loading || !data) return <div className="h-40 flex items-center justify-center">Đang tải thẻ tổng quan...</div>;

  const query = searchParams.toString() ? `?${searchParams.toString()}` : "";

  const renderBadge = (val: number) => {
    const isUp = val >= 0;
    return (
      <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-1 rounded-full ${isUp ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
        {isUp ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
        {isUp ? '+' : ''}{val}% YoY
      </span>
    );
  };

  const renderAreaChart = (arr: number[]) => {
    const chartData = arr.map((v, i) => ({ name: \`T\${i + 1}\`, value: v }));
    return (
      <div className="h-16 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8' }} dy={5} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBlue)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  };

  const renderCard = ({
    href, title, subtitle, icon: Icon, actualStr, actualUnit, targetPct, targetLabel, targetValue, yoy, sparkline, sparkLabel
  }: any) => {
    return (
      <Link href={href}>
        <Card className="hover:border-blue-500 transition-colors cursor-pointer shadow-sm overflow-hidden h-full flex flex-col justify-between">
          <div className="p-4 pb-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-200">{title}</h3>
                  <p className="text-[11px] text-slate-500">{subtitle}</p>
                </div>
              </div>
              {renderBadge(yoy)}
            </div>

            {/* Main Number & Progress */}
            <div className="flex items-end justify-between mb-2 mt-2">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">{actualStr}</span>
                <span className="text-xs font-semibold text-slate-500">{actualUnit}</span>
              </div>
              {targetPct !== undefined && <span className="text-xs font-bold text-blue-600">{targetPct}% kế hoạch</span>}
            </div>

            {targetPct !== undefined && (
              <>
                <Progress value={targetPct} className="h-2 mb-2 bg-slate-100 [&>div]:bg-blue-600" />
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                  <span>Đạt {targetPct}% chỉ tiêu năm</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{targetLabel}: {targetValue}</span>
                </div>
              </>
            )}
          </div>

          {/* Sparkline Section */}
          <div className="pt-2">
            <div className="px-4 flex items-center justify-between text-[11px] text-slate-500">
              <span>{sparkLabel}</span>
              {sparkline && <span className="font-semibold text-blue-600">Tháng mới nhất: {sparkline[sparkline.length - 1]}</span>}
            </div>
            {sparkline && renderAreaChart(sparkline)}
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
      {renderCard({
        href: \`/dashboard/revenue\${query}\`,
        title: "Số thu NSNN",
        subtitle: "Lũy kế Kho bạc Nhà nước",
        icon: Landmark,
        actualStr: (data.revenue.actual / 1e9).toFixed(1),
        actualUnit: "tỷ VNĐ",
        targetPct: data.revenue.target_pct,
        targetLabel: "Pháp lệnh",
        targetValue: "1.590 tỷ VNĐ",
        yoy: data.revenue.yoy_change,
        sparkline: data.revenue.sparkline,
        sparkLabel: "Diễn biến số thu 10 tháng (T1 - T10)"
      })}

      {renderCard({
        href: \`/dashboard/revenue\${query}\`,
        title: "Phí Cơ sở hạ tầng",
        subtitle: "Lũy kế thu phí CSHT",
        icon: Anchor,
        actualStr: (data.seaport_fee.actual / 1e9).toFixed(1),
        actualUnit: "tỷ VNĐ",
        targetPct: data.seaport_fee.target_pct,
        targetLabel: "Chỉ tiêu",
        targetValue: "5.500 tỷ VNĐ",
        yoy: data.seaport_fee.yoy_change,
        sparkline: data.seaport_fee.sparkline,
        sparkLabel: "Diễn biến thu phí các tháng"
      })}

      {renderCard({
        href: \`/dashboard/clearance\${query}\`,
        title: "Số lượng Tờ khai",
        subtitle: "Tổng tờ khai đã thông quan",
        icon: FileText,
        actualStr: formatNumber(data.declarations.actual),
        actualUnit: "tờ khai",
        yoy: data.declarations.yoy_change,
        sparkline: data.declarations.sparkline,
        sparkLabel: "Biến động tờ khai theo tháng"
      })}

      {renderCard({
        href: \`/dashboard/clearance\${query}\`,
        title: "Kim ngạch XNK",
        subtitle: "Tổng kim ngạch thống kê",
        icon: DollarSign,
        actualStr: (data.turnover.actual / 1e6).toFixed(1),
        actualUnit: "triệu USD",
        yoy: data.turnover.yoy_change,
        sparkline: data.turnover.sparkline,
        sparkLabel: "Diễn biến kim ngạch các tháng"
      })}

      {renderCard({
        href: \`/dashboard/clearance\${query}\`,
        title: "Tổng lượng Hàng hóa",
        subtitle: \`Container: \${formatNumber(data.goods.containers)}\`,
        icon: Boxes,
        actualStr: formatNumber(data.goods.weight),
        actualUnit: "Tấn",
        yoy: data.goods.yoy_change,
        sparkline: data.goods.sparkline,
        sparkLabel: "Diễn biến lượng hàng"
      })}

      {renderCard({
        href: \`/dashboard/enterprises\${query}\`,
        title: "Doanh nghiệp",
        subtitle: \`Phát sinh mới: \${formatNumber(data.enterprises.new)} DN\`,
        icon: Building2,
        actualStr: formatNumber(data.enterprises.total),
        actualUnit: "doanh nghiệp",
        yoy: data.enterprises.yoy_change,
        sparkline: data.enterprises.sparkline,
        sparkLabel: "Số lượng DN tham gia"
      })}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/OverviewFlashcards.tsx
git commit -m "feat(ui): build 6-card full-width sparkline grid matching user mockup"
```

---

### Task 3: Replace old cards in Overview Page

**Files:**
- Modify: `src/app/dashboard/overview/page.tsx`

- [ ] **Step 1: Replace old 4 cards with new `<OverviewFlashcards />`**

```tsx
// Inside src/app/dashboard/overview/page.tsx
// Add the import at the top
import { OverviewFlashcards } from "@/components/dashboard/OverviewFlashcards";

// In the JSX, REPLACE the entire `<!-- 1. Flashcards (KPI Grid) -->` section 
// containing the 4 `<Card>` elements with:
      {/* 1. Flashcards (KPI Grid) */}
      <OverviewFlashcards />
```
*(Reviewer note: The executor must remove the old grid containing `Total Declarations`, `Total USD Value`, `Tax Revenue`, and `Seaport Infrastructure Fee` cards).*

- [ ] **Step 2: Run build to verify types**

Run: `npm run build`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/dashboard/overview/page.tsx
git commit -m "refactor(ui): swap old overview cards for the new strict-YTD Flashcards grid"
```
