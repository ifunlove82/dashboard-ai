# Phí CSHT Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang Dashboard chuyên sâu Phí Cơ Sở Hạ Tầng (URD 11) với layout được tinh gọn, tích hợp biểu đồ kết hợp, lưới KPI có sparkline, và bảng phân tích sâu ở cấp doanh nghiệp.

**Architecture:** 
- Trang `Phí CSHT` sử dụng URL Search Params (`unit`, `taxType`, `enterprise`) để theo dõi trạng thái Drill-down.
- Gọi 1 API duy nhất `/api/v1/infrastructure-fee/detailed` lấy toàn bộ dữ liệu.
- Phân rã Component theo từng hàng ngang: KPIs, Main Charts (60/40), Secondary Charts (50/50), Data Table.
- Khi drill-down đến cấp cuối (`enterprise`), ẩn toàn bộ biểu đồ, chỉ hiển thị bảng Tờ khai chi tiết.

**Tech Stack:** Next.js App Router (React Server/Client components), Tailwind CSS, Recharts, Lucide React icons, shadcn/ui.

**Spec:** `docs/superpowers/specs/2026-09-13-infrastructure-fee-dashboard.md` (Đã được tinh gọn lược bỏ Row Badges và Card SME/FDI).

## Global Constraints
- Chỉ sử dụng chuẩn Tailwind CSS classes.
- Đảm bảo Dark/Light mode hoạt động tốt.
- Testing bằng cách chạy `curl` hoặc kịch bản fetch Node cho API và kiểm tra thủ công giao diện trên `localhost:3050`.

---

### Task 1: API Endpoint Mock Data

**Files:**
- Create: `src/app/api/v1/infrastructure-fee/detailed/route.ts`

**Interfaces:**
- Produces: API Endpoint trả về JSON: `{ kpis, charts: { last6Periods, byImportExport, byCommodity, byPort }, topEnterprises, declarations }`.

- [ ] **Step 1: Write API Route scaffolding**
Tạo file `src/app/api/v1/infrastructure-fee/detailed/route.ts` với hàm `GET(request)`. Lấy các param `unit`, `taxType`, `enterprise` từ `request.nextUrl.searchParams`.

- [ ] **Step 2: Generate dynamic mock data**
Tạo hàm helper tính multiplier dựa vào params (nếu có `enterprise` thì multiplier rất nhỏ, nếu có `unit` thì nhỏ vừa). 
- `kpis`: 6 object (Thu kỳ báo cáo, YTD, YoY, Kỳ trước, Kế hoạch, Hoàn thành). Mỗi object có thêm `sparklineData: [{ value: 50 }, ...]`.
- `charts.last6Periods`: Mảng `{ period, amount, growth }`.
- `charts.byImportExport`: Mảng `{ name, value }` (NK, XK, Khác).
- `charts.byCommodity`: Mảng `{ name, value, percentage }`.
- `charts.byPort`: Mảng `{ name, value, percentage }`.
- `topEnterprises`: Mảng danh sách DN.
- `declarations`: Mảng chi tiết tờ khai (chỉ có data khi query có `enterprise`).

- [ ] **Step 3: Return JSON**
```typescript
return NextResponse.json({ kpis, charts, topEnterprises, declarations });
```

- [ ] **Step 4: Verify via node script**
Tạo `scratch/test-infrastructure-api.js` dùng fetch gọi `/api/v1/infrastructure-fee/detailed?unit=HQHCM`. Log kết quả để verify.

- [ ] **Step 5: Commit**
```bash
git add src/app/api/v1/infrastructure-fee/detailed/route.ts
git commit -m "feat: add infrastructure fee detailed api endpoint"
```

---

### Task 2: UI Base, Global Header & KPI Grid

**Files:**
- Create: `src/app/dashboard/infrastructure-fee/page.tsx`
- Create: `src/components/dashboard/InfrastructureKPIs.tsx`

**Interfaces:**
- Consumes: Dữ liệu `kpis` từ API.
- Produces: Base layout trang và 6 thẻ KPI.

- [ ] **Step 1: Create Page container**
Tạo file `page.tsx` sử dụng `"use client"`. Lấy `searchParams` để query fetch dữ liệu tương tự trang Revenue.
Chèn thanh `<GlobalFilterBar />` và cơ chế Breadcrumbs (ví dụ: `Phí CSHT / HQ Hải Phòng / Hàng Container`).

- [ ] **Step 2: Create InfrastructureKPIs component**
Xây dựng thẻ Card. Với mỗi KPI, thêm một thẻ Recharts `<ResponsiveContainer height={40}> <LineChart data={item.sparklineData}> <Line type="monotone" dataKey="value" strokeWidth={2} dot={false} /> </LineChart> </ResponsiveContainer>` đặt chìm bên dưới số liệu.

- [ ] **Step 3: Integrate into Page**
Import component vào `page.tsx`. Xử lý Loading state.

- [ ] **Step 4: Test in browser**
Kiểm tra giao diện tại `http://localhost:3050/dashboard/infrastructure-fee`. 
Verify Sparkline render đúng trong flex/grid mà không bị tràn (lỗi height).

- [ ] **Step 5: Commit**
```bash
git add src/app/dashboard/infrastructure-fee/page.tsx src/components/dashboard/InfrastructureKPIs.tsx
git commit -m "feat: add infrastructure page and kpi grid with sparklines"
```

---

### Task 3: Main Charts (Row 1 - Xu hướng & Luồng)

**Files:**
- Create: `src/components/dashboard/InfrastructureChartsRow1.tsx`
- Modify: `src/app/dashboard/infrastructure-fee/page.tsx`

**Interfaces:**
- Consumes: Dữ liệu `charts.last6Periods` và `charts.byImportExport`.

- [ ] **Step 1: Create Row 1 Component**
Chia Grid: Cột trái `md:col-span-3` (hoặc 60%), cột phải `md:col-span-2` (hoặc 40%).
- Cột Trái (ComposedChart): Kết hợp `<Bar>` cho số thu và `<Line>` cho tốc độ tăng trưởng.
- Cột Phải (PieChart/Donut): Vẽ luồng nghiệp vụ. Custom Legend bên dưới.

- [ ] **Step 2: Add interactivity**
Gắn event `onClick` vào Donut chart để gọi `handleDrill(item)` -> đẩy URL param `taxType`.

- [ ] **Step 3: Integrate into Page**
Gọi `<InfrastructureChartsRow1 charts={data.charts} />` ngay dưới lưới KPIs. 
Chỉ render khi `!searchParams.get("enterprise")`.

- [ ] **Step 4: Test**
Click vào chart trên UI để đảm bảo param thay đổi và API fetch lại data.

- [ ] **Step 5: Commit**
```bash
git add src/components/dashboard/InfrastructureChartsRow1.tsx src/app/dashboard/infrastructure-fee/page.tsx
git commit -m "feat: add infrastructure main charts 60-40 split"
```

---

### Task 4: Secondary Cards (Row 2 - Hàng hóa & Cảng)

**Files:**
- Create: `src/components/dashboard/InfrastructureCardsRow2.tsx`
- Modify: `src/app/dashboard/infrastructure-fee/page.tsx`

**Interfaces:**
- Consumes: Dữ liệu `charts.byCommodity` và `charts.byPort`.

- [ ] **Step 1: Create Cards Components**
Vì spec tinh gọn, chia Row 2 thành 2 cột 50/50.
Cấu trúc mỗi card là danh sách Custom List (dùng thẻ `div`, không cần Recharts).
- Tên item (ví dụ: Hàng Container).
- Dòng progress: `<div className="h-2 w-full bg-slate-100 rounded"><div className="h-full bg-blue-500 rounded" style={{width: percentage}} /></div>`
- Text số tiền (Tỷ VNĐ) và %.

- [ ] **Step 2: Add Interactivity**
Bấm vào một hàng trong danh sách sẽ drill-down (ví dụ bấm Hàng Container sẽ đẩy URL).

- [ ] **Step 3: Integrate into Page**
Gọi `<InfrastructureCardsRow2 charts={data.charts} />` bên dưới Row 1. (Cũng ẩn khi có `enterprise`).

- [ ] **Step 4: Test**
Kiểm tra Dark/Light mode vì tự vẽ Custom progress bar.

- [ ] **Step 5: Commit**
```bash
git add src/components/dashboard/InfrastructureCardsRow2.tsx src/app/dashboard/infrastructure-fee/page.tsx
git commit -m "feat: add infrastructure list cards row 2"
```

---

### Task 5: TOP Tables & Leaf Node (Bảng Tờ Khai)

**Files:**
- Create: `src/components/dashboard/InfrastructureTables.tsx`
- Modify: `src/app/dashboard/infrastructure-fee/page.tsx`

**Interfaces:**
- Consumes: Dữ liệu `topEnterprises` (khi chưa drill) và `declarations` (khi đã drill đến đích).

- [ ] **Step 1: Build the Component**
Tạo component đa năng. Nhận prop `isLeaf` (dựa trên việc có `enterprise` param hay không).
- Nếu `!isLeaf`: Hiển thị Tabs, và Bảng chứa danh sách `topEnterprises`. Các dòng trong bảng click được để đi sâu vào DN.
- Nếu `isLeaf`: Bảng chuyển sang mode hiển thị danh sách `declarations` (Tờ khai/chứng từ, Ngày, Khu vực cảng, Số tiền).

- [ ] **Step 2: Clean up the UI**
Sử dụng Table HTML chuẩn với Tailwind `border-collapse`, `divide-y`. Giữ các cột gọn gàng, rõ ràng. Căn lề số tiền sang phải.

- [ ] **Step 3: Integrate into Page**
Gọi `<InfrastructureTables />` ở cuối trang. (Nó luôn luôn hiện, nhưng mode hiển thị tự đổi dựa vào param).

- [ ] **Step 4: Verify Full Flow**
Chạy ứng dụng. Click thử từ biểu đồ -> List -> Bảng TOP DN -> Xem màn hình thay đổi sang Bảng tờ khai. Dùng breadcrumb để lùi lại.

- [ ] **Step 5: Commit**
```bash
git add src/components/dashboard/InfrastructureTables.tsx src/app/dashboard/infrastructure-fee/page.tsx
git commit -m "feat: add infrastructure tables and leaf node views"
```
