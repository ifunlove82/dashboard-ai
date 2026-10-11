# Dashboard Tờ khai – Kim ngạch Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng Dashboard Tờ khai – Kim ngạch (`/dashboard/declarations-turnover`) với đầy đủ phân hệ Cán cân thương mại, cụm KPI kép Tờ khai & Kim ngạch, ma trận 9 biểu đồ trực quan, và bảng dữ liệu tờ khai chi tiết hỗ trợ Drill-down theo URL parameters.

**Architecture:** Giao diện Next.js App Router phản ứng thời gian thực với URL query parameters (`unit`, `period`, `flow`, `channel`, `commodity`, `regime`). Dữ liệu được cấp phát tập trung thông qua API route `/api/v1/declarations-turnover`. Giao diện module hóa thành 4 component chính: Hero Banner Cán cân thương mại, Dual KPI Panel, Ma trận 9 Biểu đồ Recharts, và Bảng chi tiết Leaf-node.

**Tech Stack:** Next.js 16 (Turbopack), React 19, TypeScript 5, Tailwind CSS v4, Recharts, Lucide-React.

**Spec:** `docs/superpowers/specs/2026-10-11-declarations-turnover-dashboard-design.md`

## Global Constraints

- Chỉ sử dụng chuẩn Tailwind CSS v4 classes, tuyệt đối không dùng inline CSS tùy tiện hoặc file CSS riêng lẻ.
- Đảm bảo 100% hỗ trợ cả Light Mode và Dark Mode (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`).
- Tất cả biểu đồ Recharts phải bọc trong thẻ có `ResponsiveContainer` và cờ `mounted` để chống lỗi 0-height hydration trên Next.js 16.
- Định dạng tiền tệ Kim ngạch: USD (Triệu USD, Nghìn USD/TK), định dạng số lượng tờ khai có dấu phân cách hàng nghìn `toLocaleString("vi-VN")`.
- Mã màu phân luồng quy chuẩn: Xanh (`#10b981`), Vàng (`#f59e0b`), Đỏ (`#ef4444`).
- Cán cân thương mại: Xuất siêu (Xanh Emerald `#10b981`), Nhập siêu (Đỏ/Cam Rose `#f43f5e`).

---

### Task 1: API Endpoint Mock Data

**Files:**
- Create: `src/app/api/v1/declarations-turnover/route.ts`

**Interfaces:**
- Consumes: NextRequest query params (`unit`, `period`, `flow`, `channel`, `commodity`, `regime`).
- Produces: `DeclarationsTurnoverResponse` schema đúng chuẩn Spec:
  - `tradeBalance`: `{ netBalanceMillionUSD, isSurplus, exportMillionUSD, importMillionUSD, yoyChangePct, prevPeriodBalanceMillionUSD }`
  - `declarationKpis`: `{ total, exportCount, importCount, ytdTotal, prevPeriodCount, yoyChangePct, channels: { green, yellow, red }, sparklineData }`
  - `turnoverKpis`: `{ totalMillionUSD, exportMillionUSD, importMillionUSD, exportRatioPct, importRatioPct, ytdMillionUSD, prevPeriodMillionUSD, yoyChangePct, avgPerDeclarationUSD, avgChangePct, sparklineData }`
  - `charts`: `{ declarationsLast6Periods, turnoverLast6Periods, tradeBalanceLast6Periods, importExportRatio, byRegime, channelDistribution, byUnit, byCommodity, correlation }`
  - `declarations`: `Array<DeclarationItem>`

- [ ] **Step 1: Định nghĩa Interface và Logic sinh Mock Data theo Query Params**

Tạo file `src/app/api/v1/declarations-turnover/route.ts` với đầy đủ kiểu dữ liệu:
```typescript
import { NextRequest, NextResponse } from "next/server";

export interface TradeBalanceData {
  netBalanceMillionUSD: number;
  isSurplus: boolean;
  exportMillionUSD: number;
  importMillionUSD: number;
  yoyChangePct: number;
  prevPeriodBalanceMillionUSD: number;
}

export interface DeclarationKpisData {
  total: number;
  exportCount: number;
  importCount: number;
  ytdTotal: number;
  prevPeriodCount: number;
  yoyChangePct: number;
  channels: {
    green: { count: number; pct: number };
    yellow: { count: number; pct: number };
    red: { count: number; pct: number };
  };
  sparklineData: Array<{ value: number }>;
}

export interface TurnoverKpisData {
  totalMillionUSD: number;
  exportMillionUSD: number;
  importMillionUSD: number;
  exportRatioPct: number;
  importRatioPct: number;
  ytdMillionUSD: number;
  prevPeriodMillionUSD: number;
  yoyChangePct: number;
  avgPerDeclarationUSD: number;
  avgChangePct: number;
  sparklineData: Array<{ value: number }>;
}

export interface DeclarationItem {
  id: string;
  declarationNo: string;
  date: string;
  enterpriseCode: string;
  enterpriseName: string;
  regimeCode: string;
  channel: "green" | "yellow" | "red";
  flow: "XK" | "NK";
  turnoverUSD: number;
  status: string;
}

export interface DeclarationsTurnoverResponse {
  tradeBalance: TradeBalanceData;
  declarationKpis: DeclarationKpisData;
  turnoverKpis: TurnoverKpisData;
  charts: {
    declarationsLast6Periods: Array<{ period: string; exportCount: number; importCount: number; total: number }>;
    turnoverLast6Periods: Array<{ period: string; exportUSD: number; importUSD: number; totalUSD: number }>;
    tradeBalanceLast6Periods: Array<{ period: string; netBalance: number; isSurplus: boolean }>;
    importExportRatio: Array<{ name: string; value: number; pct: number; color: string }>;
    byRegime: Array<{ code: string; name: string; declarations: number; turnoverUSD: number }>;
    channelDistribution: Array<{ name: string; count: number; pct: number; color: string }>;
    byUnit: Array<{ unitId: string; name: string; declarations: number; turnoverUSD: number }>;
    byCommodity: Array<{ id: string; name: string; turnoverUSD: number; declarations: number; pct: number }>;
    correlation: Array<{ name: string; declarations: number; turnoverUSD: number; avgUSD: number }>;
  };
  declarations: DeclarationItem[];
}
```

- [ ] **Step 2: Viết hàm GET xử lý request và áp dụng hệ số scale theo bộ lọc**

Hoàn thiện logic `export async function GET(req: NextRequest)` tính toán động:
- Lấy `searchParams` (`unit`, `flow`, `channel`, `commodity`).
- Tính toán hệ số nhân `multiplier` (ví dụ `unit === "cuc_hcm"` thì hệ số 0.52, `cuc_hp` là 0.33...).
- Tính toán chính xác `netBalanceMillionUSD = exportMillionUSD - importMillionUSD` và `isSurplus = netBalanceMillionUSD >= 0`.
- Tính `avgPerDeclarationUSD = Math.round((totalMillionUSD * 1e6) / total)`.
- Trả về `NextResponse.json(...)`.

- [ ] **Step 3: Kiểm thử endpoint bằng lệnh fetch / curl**

Chạy lệnh kiểm tra phản hồi API:
```powershell
Invoke-RestMethod -Uri "http://localhost:3050/api/v1/declarations-turnover?unit=all" | Select-Object -ExpandProperty tradeBalance
```
Kỳ vọng: Trả về object `tradeBalance` với đầy đủ `netBalanceMillionUSD`, `isSurplus`, `exportMillionUSD`, `importMillionUSD`.

- [ ] **Step 4: Commit**
```bash
git add src/app/api/v1/declarations-turnover/route.ts
git commit -m "feat(api): create mock endpoint for declarations and turnover dashboard"
```

---

### Task 2: Điều hướng & Khung trang chính (Page & Navigation)

**Files:**
- Modify: `src/app/dashboard/layout.tsx` (thêm Sidebar menu item)
- Create: `src/app/dashboard/declarations-turnover/page.tsx`

**Interfaces:**
- Consumes: Next.js `useSearchParams`, `useRouter`, fetch API `/api/v1/declarations-turnover`.
- Produces: Layout hoàn chỉnh hiển thị Breadcrumbs, Global Filter, khung Loading, và kết nối các sub-components.

- [ ] **Step 1: Cập nhật Sidebar Navigation trong `src/app/dashboard/layout.tsx`**

Thêm icon `ArrowLeftRight` từ `lucide-react` và bổ sung mục menu:
```tsx
  {
    name: "Tờ khai – Kim ngạch",
    href: "/dashboard/declarations-turnover",
    icon: ArrowLeftRight,
    description: "Cán cân thương mại & Tờ khai XNK",
  },
```
Đặt ngay sau mục "Phí CSHT" (dòng 46).

- [ ] **Step 2: Tạo trang chính `src/app/dashboard/declarations-turnover/page.tsx`**

Xây dựng logic quản lý trạng thái:
- Sử dụng `useSearchParams()` để theo dõi `unit`, `flow`, `channel`, `commodity`, `regime`.
- Hàm `fetchData` gọi `/api/v1/declarations-turnover?${params.toString()}`.
- Thanh Filter Bar cho phép lọc nhanh Chi cục Hải quan, Chiều XNK (Tất cả, Xuất khẩu, Nhập khẩu), và Luồng kiểm tra.
- Render tạm thời khung placeholder cho 4 khối component chính.

- [ ] **Step 3: Kiểm thử hiển thị trang và menu điều hướng**

Mở `http://localhost:3050/dashboard/declarations-turnover` để đảm bảo:
- Sidebar hiển thị menu "Tờ khai – Kim ngạch" với icon `ArrowLeftRight` và active state hoạt động đúng.
- Trang load thành công dữ liệu từ API không có lỗi console.

- [ ] **Step 4: Commit**
```bash
git add src/app/dashboard/layout.tsx src/app/dashboard/declarations-turnover/page.tsx
git commit -m "feat(ui): add declarations-turnover page and sidebar navigation"
```

---

### Task 3: Hero Banner Cán cân thương mại & Dual KPI Panel

**Files:**
- Create: `src/components/dashboard/TradeBalanceHero.tsx`
- Create: `src/components/dashboard/DualKpiPanel.tsx`
- Modify: `src/app/dashboard/declarations-turnover/page.tsx` (nhúng 2 component vào)

**Interfaces:**
- Consumes: `TradeBalanceData`, `DeclarationKpisData`, `TurnoverKpisData` từ Task 1.
- Produces: Component giao diện chuẩn Tailwind v4, tương thích hoàn toàn Dark/Light mode.

- [ ] **Step 1: Xây dựng `TradeBalanceHero.tsx`**

Triển khai Card hiển thị Cán cân thương mại:
- Hiển thị Giá trị cán cân ròng (`netBalanceMillionUSD` Triệu USD).
- Badge trạng thái:
  - Nếu `isSurplus`: Badge nền xanh lá nhạt, chữ xanh lục (`bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400`), nhãn "XUẤT SIÊU", icon `TrendingUp`.
  - Nếu không: Badge nền đỏ nhạt, chữ đỏ (`bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400`), nhãn "NHẬP SIÊU", icon `TrendingDown`.
- Thanh tỷ lệ ngang (Horizontal progress split) thể hiện Kim ngạch XK vs NK (ví dụ 54% XK màu Blue, 46% NK màu Purple).
- Ghi chú so sánh YoY và kỳ trước.

- [ ] **Step 2: Xây dựng `DualKpiPanel.tsx`**

Triển khai lưới 2 cột (Cột Trái: Tờ khai, Cột Phải: Kim ngạch):
- **Cột Trái (Tờ khai)**:
  - Card 1: Tổng tờ khai kỳ này, tách XK vs NK, % YoY badge, số kỳ trước.
  - Card 2: Lũy kế tờ khai YTD kèm thanh tiến độ 3 phân đoạn: Luồng Xanh (Emerald), Luồng Vàng (Amber), Luồng Đỏ (Rose) với số lượng và % rõ ràng. Sparkline Recharts vùng (`AreaChart`).
- **Cột Phải (Kim ngạch)**:
  - Card 3: Tổng kim ngạch kỳ này (Triệu USD), tách XK vs NK (kèm % tỷ trọng), so sánh YoY và kỳ trước.
  - Card 4: Lũy kế kim ngạch YTD, chỉ số **Kim ngạch bình quân / tờ khai** (USD/TK) kèm % biến động so với kỳ trước. Sparkline Recharts vùng (`AreaChart`).

- [ ] **Step 3: Nhúng vào `page.tsx` và kiểm tra giao diện**

Kiểm tra trực quan trên màn hình:
- Khối Cán cân thương mại hiển thị đầy đủ nhãn Xuất/Nhập siêu.
- 4 thẻ KPI cân đối 50/50, thanh phân luồng 3 màu hiển thị sắc nét.

- [ ] **Step 4: Commit**
```bash
git add src/components/dashboard/TradeBalanceHero.tsx src/components/dashboard/DualKpiPanel.tsx src/app/dashboard/declarations-turnover/page.tsx
git commit -m "feat(ui): implement trade balance hero banner and dual kpi panel"
```

---

### Task 4: Ma trận 9 Biểu đồ trực quan (Analytical Matrix)

**Files:**
- Create: `src/components/dashboard/DeclarationsTurnoverCharts.tsx`
- Modify: `src/app/dashboard/declarations-turnover/page.tsx`

**Interfaces:**
- Consumes: `charts` payload từ API.
- Produces: 9 biểu đồ Recharts tương tác, hỗ trợ click để kích hoạt `onFilterChange(type, value)`.

- [ ] **Step 1: Xây dựng cấu trúc ma trận 9 biểu đồ trong `DeclarationsTurnoverCharts.tsx`**

Bố trí lưới 3 hàng x 3 cột (`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`):
1. **Tờ khai 6 kỳ**: Biểu đồ cột ghép (BarChart) - cột XK màu `#3b82f6`, cột NK màu `#8b5cf6`.
2. **Kim ngạch 6 kỳ**: Biểu đồ cột chồng (Stacked BarChart) - XK & NK theo Triệu USD.
3. **Cán cân XNK 6 kỳ**: Biểu đồ Bar phân kỳ (Diverging Bar) - giá trị dương màu xanh, giá trị âm màu đỏ.
4. **Cơ cấu XK / NK**: Donut Chart thể hiện tỷ lệ % kim ngạch XK vs NK.
5. **Cơ cấu theo Loại hình**: Horizontal Bar Chart các loại hình A11, B11, E21, E31...
6. **Phân luồng tờ khai**: Donut Chart 3 màu chuẩn Xanh (`#10b981`), Vàng (`#f59e0b`), Đỏ (`#ef4444`).
7. **Theo Đơn vị hải quan**: BarChart so sánh các Chi cục (Cát Lái, Tân Cảng, Đình Vũ, Cái Mép...).
8. **Theo Nhóm hàng chủ lực**: Horizontal BarChart Top nhóm hàng (Điện tử, Dệt may, Nông sản, Giày dép...).
9. **Tương quan Tờ khai – Kim ngạch**: Composed Chart kết hợp trục trái (Số tờ khai - Bar) và trục phải (Kim ngạch Triệu USD - Line).

- [ ] **Step 2: Thêm sự kiện nhấp chuột tương tác (Drill-down handlers)**

Thêm `onClick` vào các thanh Bar / slice Pie:
- Nhấp vào Đơn vị $\rightarrow$ cập nhật query param `?unit=...`.
- Nhấp vào Phân luồng $\rightarrow$ cập nhật query param `?channel=...`.
- Nhấp vào Nhóm hàng $\rightarrow$ cập nhật query param `?commodity=...`.

- [ ] **Step 3: Nhúng vào `page.tsx` và kiểm tra Recharts responsiveness**

Đảm bảo:
- Tất cả 9 biểu đồ hiển thị đúng tỉ lệ, không bị lỗi 0px hay vỡ layout khi co giãn cửa sổ trình duyệt.
- Tooltip hiển thị đầy đủ đơn vị (Tờ khai / Triệu USD / %).

- [ ] **Step 4: Commit**
```bash
git add src/components/dashboard/DeclarationsTurnoverCharts.tsx src/app/dashboard/declarations-turnover/page.tsx
git commit -m "feat(ui): implement 9-chart analytical matrix with drill-down interactivity"
```

---

### Task 5: Bảng Tờ khai chi tiết & Kiểm thử End-to-End

**Files:**
- Create: `src/components/dashboard/DeclarationsDetailTable.tsx`
- Modify: `src/app/dashboard/declarations-turnover/page.tsx`

**Interfaces:**
- Consumes: `declarations: DeclarationItem[]`, các tham số lọc hiện tại (`activeFilters`), callback xóa bộ lọc (`onResetFilter`).
- Produces: Bảng dữ liệu có tìm kiếm, lọc theo luồng, phân trang, và hiển thị trạng thái thông quan.

- [ ] **Step 1: Xây dựng `DeclarationsDetailTable.tsx`**

Triển khai Card bảng dữ liệu:
- Header: Tiêu đề "Danh sách Tờ khai chi tiết", ô tìm kiếm tức thời (theo Mã tờ khai hoặc Doanh nghiệp), hiển thị chip các bộ lọc đang kích hoạt kèm nút "Xóa bộ lọc".
- Bảng dữ liệu:
  - Cột `Mã tờ khai`: Font mono đậm kèm ngày giờ đăng ký.
  - Cột `Doanh nghiệp`: Tên doanh nghiệp và MST.
  - Cột `Loại hình & Chiều`: Badge A11/B11/E21 và nhãn XK/NK.
  - Cột `Phân luồng`: Badge màu tương ứng (Xanh, Vàng, Đỏ).
  - Cột `Kim ngạch (USD)`: Định dạng tiền tệ `$XX,XXX`.
  - Cột `Trạng thái`: Badge "Đã thông quan", "Chờ kiểm hóa", "Đã giải phóng hàng"...
- Phân trang đơn giản (Previous / Next / Tổng số tờ khai).

- [ ] **Step 2: Tích hợp hoàn thiện vào `page.tsx`**

Hoàn thiện luồng drill-down tổng thể:
- Khi người dùng nhấp vào biểu đồ trên, bảng tự động cuộn đến và hiển thị chỉ các tờ khai thỏa mãn điều kiện lọc.
- Khi người dùng bấm "Xóa bộ lọc", URL được reset về mặc định và toàn bộ trang cập nhật lại.

- [ ] **Step 3: Build & Kiểm thử toàn diện trên localhost:3050**

Chạy kiểm tra build:
```powershell
npm run build
```
Kỳ vọng: Build thành công 100% không có lỗi TypeScript hoặc Tailwind.
Mở trình duyệt kiểm tra:
1. Truy cập `http://localhost:3050/dashboard/declarations-turnover`.
2. Kiểm tra Cán cân thương mại hiển thị đúng số liệu và badge Xuất/Nhập siêu.
3. Kiểm tra 4 thẻ KPI và thanh phân luồng.
4. Kiểm tra 9 biểu đồ hiển thị mượt mà.
5. Thử nhấp vào một luồng hoặc chi cục, kiểm tra URL và bảng chi tiết lọc theo đúng tiêu chí.

- [ ] **Step 4: Commit**
```bash
git add src/components/dashboard/DeclarationsDetailTable.tsx src/app/dashboard/declarations-turnover/page.tsx
git commit -m "feat(ui): implement declarations detail table and complete declarations-turnover dashboard"
```
