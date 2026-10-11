# Revenue Dashboard Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Nâng cấp trang Thu ngân sách (`/dashboard/revenue/page.tsx`) theo URD 10 với hệ thống KPI chi tiết, 6 biểu đồ, 3 bảng xếp hạng và cơ chế lọc Drill-down toàn cục.

**Architecture:** Tạo API route trả về toàn bộ dữ liệu (KPIs, Charts, Tops) trong một lần gọi (Single Fetch). Trang Frontend sẽ sử dụng URL Search Params để lưu trạng thái Drill-down (`unit`, `taxType`, `enterprise`), truyền chúng vào API để lấy dữ liệu lọc tương ứng. Giao diện chia thành các Component nhỏ để dễ quản lý.

**Tech Stack:** Next.js App Router (React Server/Client components), Recharts, Tailwind CSS, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-09-13-revenue-dashboard-details-design.md`

## Global Constraints

- Chỉ sử dụng chuẩn Tailwind CSS classes.
- Đảm bảo Dark/Light mode hoạt động tốt.
- Testing bằng cách chạy `curl` hoặc kịch bản fetch Node cho API và kiểm tra thủ công giao diện trên `localhost:3050`.

---

### Task 1: Xây dựng API Endpoint

**Files:**
- Create: `src/app/api/v1/revenue/detailed/route.ts`

**Interfaces:**
- Produces: API `GET /api/v1/revenue/detailed?unit=...&taxType=...&enterprise=...` trả về cấu trúc JSON `{ kpis, charts, tops }` với dữ liệu Mock phong phú.

- [ ] **Step 1: Khởi tạo route handler và parser**

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");
  const taxType = searchParams.get("taxType");
  const enterprise = searchParams.get("enterprise");
  
  // Return dummy response for test
  return NextResponse.json({ unit, taxType, enterprise });
}
```

- [ ] **Step 2: Viết script test thủ công API**

```javascript
// scratch/test-api.js
fetch('http://localhost:3050/api/v1/revenue/detailed?unit=HQĐN')
  .then(r => r.json()).then(console.log);
```
Chạy `node scratch/test-api.js` đảm bảo trả về `{ unit: 'HQĐN', taxType: null, enterprise: null }`.

- [ ] **Step 3: Cài đặt Mock Data Logic**
Viết logic trả về dữ liệu Mock. Thay đổi ngẫu nhiên các số lượng dựa vào params để giao diện thấy được sự thay đổi khi Drill-down.

```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const unit = searchParams.get("unit");
  const taxType = searchParams.get("taxType");
  const enterprise = searchParams.get("enterprise");

  // Giả lập biến động dựa trên drill-down
  const multiplier = enterprise ? 0.05 : taxType ? 0.2 : unit ? 0.4 : 1;

  const mockData = {
    kpis: {
      currentPeriod: 500 * multiplier,
      ytd: 12000 * multiplier,
      yoy: 12.5,
      previousPeriod: 450 * multiplier,
      target: 15000 * multiplier,
      stretchTarget: 16000 * multiplier,
      completionPct: 80,
      remaining: 3000 * multiplier
    },
    charts: {
      last6Periods: Array.from({length: 6}, (_, i) => ({ name: `Kỳ ${i+1}`, value: 100 * multiplier * (i+1) })),
      byUnit: [
        { id: 'hanoi', name: 'HQ Hà Nội', value: 4000 * multiplier },
        { id: 'hcm', name: 'HQ HCM', value: 5000 * multiplier }
      ],
      byTaxType: [
        { id: 'vat', name: 'VAT', value: 8000 * multiplier, color: '#3b82f6' },
        { id: 'nk', name: 'Nhập Khẩu', value: 4000 * multiplier, color: '#10b981' }
      ],
      byImportExport: [
        { name: 'Nhập Khẩu', value: 65, color: '#f59e0b' },
        { name: 'Xuất Khẩu', value: 35, color: '#8b5cf6' }
      ],
      byCommodityGroup: [
        { name: 'Điện tử', value: 5000 * multiplier },
        { name: 'Nông sản', value: 3000 * multiplier }
      ],
      correlation: Array.from({length: 12}, (_, i) => ({
        name: `T${i+1}`, 
        turnover: 1000 + (Math.random() * 500), 
        revenue: 100 + (Math.random() * 50)
      }))
    },
    tops: {
      enterprises: Array.from({length: 20}, (_, i) => ({ id: `dn-${i}`, name: `Doanh nghiệp ${i}`, tax: 1000 - i*10 })),
      regimes: Array.from({length: 5}, (_, i) => ({ name: `Loại hình ${i}`, value: 500 - i*50 })),
      commodities: Array.from({length: 5}, (_, i) => ({ name: `Nhóm ${i}`, value: 400 - i*40 }))
    },
    declarations: Array.from({length: 10}, (_, i) => ({
      id: `TK-${1000+i}`, date: '2026-09-13', type: 'Nhập kinh doanh', tax: 50
    }))
  };

  return NextResponse.json(mockData);
}
```

- [ ] **Step 4: Chạy test lại**
`node scratch/test-api.js` và kiểm tra response JSON đầy đủ.

- [ ] **Step 5: Commit**
`git add src/app/api/v1/revenue/detailed/route.ts`
`git commit -m "feat: add revenue details api endpoint"`

---

### Task 2: Dựng Khung Giao Diện & KPIs

**Files:**
- Modify: `src/app/dashboard/revenue/page.tsx`
- Create: `src/components/dashboard/RevenueKPIs.tsx`

**Interfaces:**
- Consumes: API `GET /api/v1/revenue/detailed`
- Produces: `RevenueKPIs` hiển thị 8 thẻ KPI (Grid 4x2).

- [ ] **Step 1: Viết Component RevenueKPIs**
Tạo `src/components/dashboard/RevenueKPIs.tsx` nhận props `kpis` và render 8 thẻ card bằng shadcn `<Card>`. Cần định dạng số tiền VND.

```tsx
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function RevenueKPIs({ kpis }: { kpis: any }) {
  if (!kpis) return null;
  const format = (v: number) => new Intl.NumberFormat('vi-VN').format(v) + ' tỷ VNĐ';
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <p className="text-xs text-slate-500">Thu kỳ báo cáo</p>
        <h3 className="text-xl font-bold">{format(kpis.currentPeriod)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Thu YTD</p>
        <h3 className="text-xl font-bold">{format(kpis.ytd)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">YoY</p>
        <h3 className="text-xl font-bold">{kpis.yoy > 0 ? `+${kpis.yoy}%` : `${kpis.yoy}%`}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Kỳ trước</p>
        <h3 className="text-xl font-bold">{format(kpis.previousPeriod)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Chỉ tiêu giao</p>
        <h3 className="text-xl font-bold">{format(kpis.target)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Phấn đấu</p>
        <h3 className="text-xl font-bold">{format(kpis.stretchTarget)}</h3>
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">% Hoàn thành</p>
        <h3 className="text-xl font-bold">{kpis.completionPct}%</h3>
        <Progress value={kpis.completionPct} className="h-1.5 mt-2" />
      </Card>
      <Card className="p-4">
        <p className="text-xs text-slate-500">Còn phải thu</p>
        <h3 className="text-xl font-bold text-rose-500">{format(kpis.remaining)}</h3>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Viết logic trang page.tsx (Breadcrumbs & Fetch)**
Chỉnh sửa `src/app/dashboard/revenue/page.tsx` thành Client Component để dùng `useSearchParams`, load data từ API và hiển thị Breadcrumbs.

```tsx
"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RevenueKPIs } from "@/components/dashboard/RevenueKPIs";

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
      .then(r => r.json())
      .then(setData);
  }, [searchParams]);

  const resetFilter = (level: string) => {
    const params = new URLSearchParams(searchParams);
    if (level === 'all') { params.delete('unit'); params.delete('taxType'); params.delete('enterprise'); }
    if (level === 'unit') { params.delete('taxType'); params.delete('enterprise'); }
    if (level === 'taxType') { params.delete('enterprise'); }
    router.push(`${pathname}?${params.toString()}`);
  };

  if (!data) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex gap-2 text-sm font-semibold mb-6">
        <button onClick={() => resetFilter('all')} className="text-blue-500 hover:underline">Toàn Cục</button>
        {unit && <> <span>/</span> <button onClick={() => resetFilter('unit')} className="text-blue-500 hover:underline">{unit}</button> </>}
        {taxType && <> <span>/</span> <button onClick={() => resetFilter('taxType')} className="text-blue-500 hover:underline">{taxType}</button> </>}
        {enterprise && <> <span>/</span> <span>{enterprise}</span> </>}
      </div>
      <RevenueKPIs kpis={data.kpis} />
      {/* Phải chừa không gian cho Charts và Tables */}
    </div>
  );
}
```

- [ ] **Step 3: Test giao diện**
Truy cập `localhost:3050/dashboard/revenue`. Kiểm tra Breadcrumbs và KPI renders đúng dữ liệu. Thêm query params `?unit=HANOI` để xem data đổi.

- [ ] **Step 4: Commit**
`git add src/app/dashboard/revenue/page.tsx src/components/dashboard/RevenueKPIs.tsx`
`git commit -m "feat: add revenue kpis and breadcrumb drilldown"`

---

### Task 3: Xây dựng Biểu đồ (Phần 1 - Hàng 1)

**Files:**
- Create: `src/components/dashboard/RevenueChartsRow1.tsx`
- Modify: `src/app/dashboard/revenue/page.tsx`

**Interfaces:**
- Consumes: `data.charts` từ API. `useRouter` để push params drill-down.

- [ ] **Step 1: Viết Component Charts Row 1**
Tạo file `src/components/dashboard/RevenueChartsRow1.tsx`. Render Bar Chart (Đơn vị), Donut (Thuế), Area Chart (6 kỳ).
Biểu đồ Cột (Đơn vị) và Donut (Thuế) có sự kiện `onClick` để điều hướng URL Drill-down.

```tsx
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell, AreaChart, Area } from "recharts";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function RevenueChartsRow1({ charts }: { charts: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleDrill = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 h-64">
        <h4 className="font-semibold text-sm mb-4">Số thu theo Đơn vị (Click để Drill)</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={charts.byUnit} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" hide />
            <Bar dataKey="value" fill="#3b82f6" cursor="pointer" onClick={(data) => handleDrill('unit', data.id)} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 h-64">
        <h4 className="font-semibold text-sm mb-4">Loại thuế</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={charts.byTaxType} dataKey="value" innerRadius={50} outerRadius={80} onClick={(data) => handleDrill('taxType', data.id)} cursor="pointer">
              {charts.byTaxType.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 h-64">
        <h4 className="font-semibold text-sm mb-4">6 kỳ gần nhất</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={charts.last6Periods}>
            <XAxis dataKey="name" />
            <Area type="monotone" dataKey="value" stroke="#8b5cf6" fill="#c4b5fd" />
            <Tooltip />
          </AreaChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Đưa component vào page.tsx**
Sửa `page.tsx` và import `RevenueChartsRow1`. Lưu ý quy tắc Level Cuối (ẩn khi có `enterprise`).

```tsx
import { RevenueChartsRow1 } from "@/components/dashboard/RevenueChartsRow1";
//... inside render, under RevenueKPIs
      {!enterprise && (
        <>
          <RevenueChartsRow1 charts={data.charts} />
        </>
      )}
```

- [ ] **Step 3: Test Drill-down**
Click vào biểu đồ Đơn vị trên trình duyệt, quan sát URL thêm `?unit=...` và biểu đồ khác thay đổi dữ liệu, Breadcrumb hiển thị dài ra.

- [ ] **Step 4: Commit**
`git add src/app/dashboard/revenue/page.tsx src/components/dashboard/RevenueChartsRow1.tsx`
`git commit -m "feat: add interactive charts row 1 for drilldown"`

---

### Task 4: Xây dựng Biểu đồ (Phần 2 - Hàng 2)

**Files:**
- Create: `src/components/dashboard/RevenueChartsRow2.tsx`
- Modify: `src/app/dashboard/revenue/page.tsx`

**Interfaces:**
- Consumes: `data.charts`

- [ ] **Step 1: Viết Component Charts Row 2**
Tạo file `src/components/dashboard/RevenueChartsRow2.tsx` render Tương quan Kim ngạch, Pie XK/NK, và Bar (Nhóm hàng).

```tsx
import { Card } from "@/components/ui/card";
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export function RevenueChartsRow2({ charts }: { charts: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4 h-64">
        <h4 className="font-semibold text-sm mb-4">Tương quan Kim ngạch - Thu</h4>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={charts.correlation}>
            <XAxis dataKey="name" />
            <Tooltip />
            <Bar dataKey="turnover" fill="#94a3b8" />
            <Line type="monotone" dataKey="revenue" stroke="#ef4444" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 h-64">
        <h4 className="font-semibold text-sm mb-4">Số thu theo XK/NK</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={charts.byImportExport} dataKey="value" innerRadius={0} outerRadius={80}>
              {charts.byImportExport.map((entry: any, index: number) => <Cell key={index} fill={entry.color} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>
      <Card className="p-4 h-64 overflow-y-auto">
        <h4 className="font-semibold text-sm mb-4">Nhóm hàng</h4>
        {charts.byCommodityGroup.map((c: any) => (
          <div key={c.name} className="flex justify-between border-b border-slate-100 py-2 text-sm">
            <span>{c.name}</span>
            <span className="font-bold">{c.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Nhúng vào page.tsx**
Sửa `page.tsx`, import `RevenueChartsRow2` và render dưới Row1 (bên trong block `!enterprise`).

- [ ] **Step 3: Test giao diện**
Kiểm tra Hàng 2 hiển thị đẹp mắt và render biểu đồ đúng.

- [ ] **Step 4: Commit**
`git add src/app/dashboard/revenue/page.tsx src/components/dashboard/RevenueChartsRow2.tsx`
`git commit -m "feat: add secondary charts row 2"`

---

### Task 5: Xây dựng TOP Lists và Bảng Tờ khai (Level cuối)

**Files:**
- Create: `src/components/dashboard/RevenueTopLists.tsx`
- Create: `src/components/dashboard/RevenueDeclarationTable.tsx`
- Modify: `src/app/dashboard/revenue/page.tsx`

**Interfaces:**
- Consumes: `data.tops`, `data.declarations`.

- [ ] **Step 1: Component RevenueTopLists**
Tạo `src/components/dashboard/RevenueTopLists.tsx`. Render 3 cột chứa danh sách Top Doanh nghiệp (Click được để nhảy tới cấp enterprise), Top Loại hình, Top Nhóm hàng.

```tsx
import { Card } from "@/components/ui/card";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function RevenueTopLists({ tops }: { tops: any }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleEnterprise = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('enterprise', id);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-sm">TOP Doanh nghiệp</h4><select className="text-xs border rounded p-1"><option>TOP 5</option></select></div>
        {tops.enterprises.slice(0,5).map((dn: any) => (
          <div key={dn.id} onClick={() => handleEnterprise(dn.id)} className="flex justify-between py-2 text-sm cursor-pointer hover:bg-slate-50 border-b border-slate-100">
            <span>{dn.name}</span><span className="font-semibold text-blue-600">{dn.tax}</span>
          </div>
        ))}
      </Card>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-sm">TOP Loại hình</h4><select className="text-xs border rounded p-1"><option>TOP 5</option></select></div>
        {tops.regimes.slice(0,5).map((r: any) => (
          <div key={r.name} className="flex justify-between py-2 text-sm border-b border-slate-100">
            <span>{r.name}</span><span className="font-semibold">{r.value}</span>
          </div>
        ))}
      </Card>
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4"><h4 className="font-bold text-sm">TOP Nhóm hàng</h4><select className="text-xs border rounded p-1"><option>TOP 5</option></select></div>
        {tops.commodities.slice(0,5).map((c: any) => (
          <div key={c.name} className="flex justify-between py-2 text-sm border-b border-slate-100">
            <span>{c.name}</span><span className="font-semibold">{c.value}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Component Bảng Tờ Khai**
Tạo `src/components/dashboard/RevenueDeclarationTable.tsx` hiển thị cho cấp độ `enterprise`.

```tsx
import { Card } from "@/components/ui/card";

export function RevenueDeclarationTable({ declarations }: { declarations: any[] }) {
  return (
    <Card className="p-4">
      <h4 className="font-bold mb-4">Danh sách Tờ khai (Mức độ chi tiết sâu nhất)</h4>
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b"><th className="py-2">Số TK</th><th>Ngày</th><th>Loại hình</th><th>Thuế nộp</th></tr>
        </thead>
        <tbody>
          {declarations.map(tk => (
            <tr key={tk.id} className="border-b">
              <td className="py-2">{tk.id}</td><td>{tk.date}</td><td>{tk.type}</td><td className="font-bold text-green-600">{tk.tax}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
```

- [ ] **Step 3: Nhúng vào page.tsx**
Render `RevenueTopLists` nếu `!enterprise`.
Render `RevenueDeclarationTable` nếu `enterprise`.

```tsx
// page.tsx (inside return)
      {!enterprise ? (
        <>
          <RevenueChartsRow1 charts={data.charts} />
          <RevenueChartsRow2 charts={data.charts} />
          <RevenueTopLists tops={data.tops} />
        </>
      ) : (
        <RevenueDeclarationTable declarations={data.declarations} />
      )}
```

- [ ] **Step 4: Chạy test End-to-End Drill-down**
Click từ Cục HQ -> Click vào Biểu đồ Thuế VAT -> Click Top Doanh nghiệp 1 -> Giao diện ẩn biểu đồ và hiện bảng Tờ khai. Click Breadcrumb "Toàn Cục" quay về trang đầu.

- [ ] **Step 5: Commit**
`git add src/app/dashboard/revenue/page.tsx src/components/dashboard/RevenueTopLists.tsx src/components/dashboard/RevenueDeclarationTable.tsx`
`git commit -m "feat: add top lists and leaf node declaration table"`

---
