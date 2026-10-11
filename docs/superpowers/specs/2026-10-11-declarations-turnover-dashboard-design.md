# Đặc tả Kỹ thuật: Dashboard Tờ khai – Kim ngạch (URD 12)

- **Ngày ban hành**: 11/10/2026
- **Trạng thái**: Chờ duyệt (Pending Review)
- **Tài liệu nghiệp vụ liên quan**: URD 12. DASHBOARD TỜ KHAI – KIM NGẠCH
- **Đường dẫn trang**: `/dashboard/declarations-turnover`
- **API Endpoint**: `/api/v1/declarations-turnover`

---

## 1. Mục tiêu & Bối cảnh (Objectives & Context)
Xây dựng phân hệ Dashboard chuyên sâu phục vụ lãnh đạo và cán bộ hải quan giám sát, phân tích song hành giữa **Số lượng Tờ khai** (khối lượng công việc, thông quan) và **Giá trị Kim ngạch** (quy mô thương mại XNK). Đồng thời, cung cấp cái nhìn tức thời về **Cán cân thương mại** (Xuất siêu / Nhập siêu) và tương quan giữa tờ khai với kim ngạch theo từng đơn vị, loại hình, nhóm hàng và luồng hải quan.

---

## 2. Kiến trúc & Điều hướng (Architecture & Navigation)
- **Tích hợp Menu Sidebar (`src/app/dashboard/layout.tsx`)**:
  - Tên menu: `Tờ khai – Kim ngạch`
  - Đường dẫn: `/dashboard/declarations-turnover`
  - Icon: `ArrowLeftRight` (Lucide-React)
  - Vị trí: Đứng sau "Phí CSHT" và trước "Thông quan".
- **Quản lý trạng thái tương tác (URL Query State)**:
  - `unit`: Chi cục hải quan (`all`, `cuc_hcm`, `cuc_hp`, `cuc_brvt`...).
  - `period`: Kỳ báo cáo (`2024-10`, `Q3-2024`, `2024`...).
  - `flow`: Chiều hàng (`all`, `xk`, `nk`).
  - `channel`: Luồng kiểm tra (`all`, `green`, `yellow`, `red`).
  - `commodity`: Nhóm hàng (`all`, `dien_tu`, `det_may`...).
  - `regime`: Mã loại hình (`all`, `A11`, `B11`, `E21`...).
  - Khi người dùng nhấp vào các thành phần biểu đồ, URL query params sẽ cập nhật tức thì, kích hoạt lọc lại toàn bộ dữ liệu trang.

---

## 3. Cấu trúc Giao diện & Component (UI Component Breakdown)

### 3.1. Hero Banner: Cán cân thương mại (`TradeBalanceHero.tsx`)
- **Vị trí**: Đầu trang, ngay dưới thanh bộ lọc.
- **Công thức tính**:
  $$\text{Cán cân} = \text{Kim ngạch XK} - \text{Kim ngạch NK}$$
- **Trực quan hóa**:
  - Giá trị ròng (Net Trade Balance) tính bằng **Triệu USD** (hoặc **Tỷ USD** nếu quy mô lớn).
  - Phân loại tự động:
    - $\ge 0$: **"XUẤT SIÊU"** (Badge màu xanh Emerald, Icon `TrendingUp`).
    - $< 0$: **"NHẬP SIÊU"** (Badge màu cam/đỏ Rose, Icon `TrendingDown`).
  - So sánh cùng kỳ (YoY %) và so sánh kỳ trước.
  - Thanh tỷ lệ ngang (Horizontal Split Bar) thể hiện trực quan tỷ trọng % giữa Kim ngạch XK và Kim ngạch NK.

### 3.2. Khối KPI song hành (`DualKpiPanel.tsx`)
Bố cục lưới chia đôi 50/50 trên màn hình lớn:

#### A. Cột Tờ khai (Bên trái):
1. **Card 1: Tổng tờ khai kỳ báo cáo**:
   - Chỉ số chính: Tổng số tờ khai đã phát sinh/thông quan.
   - Tách chi tiết: Tờ khai XK vs Tờ khai NK.
   - So sánh: % YoY và số lượng kỳ trước.
2. **Card 2: Lũy kế Tờ khai (YTD) & Phân luồng**:
   - Chỉ số chính: Lũy kế tờ khai từ đầu năm (YTD).
   - Thanh phân luồng trực quan 3 màu (Multi-segment progress bar):
     - **Luồng Xanh**: Số lượng & % (Xanh Emerald).
     - **Luồng Vàng**: Số lượng & % (Vàng Amber).
     - **Luồng Đỏ**: Số lượng & % (Đỏ Rose).
   - Biểu đồ Sparkline vùng (AreaChart) xu hướng 12 kỳ.

#### B. Cột Kim ngạch (Bên phải):
1. **Card 3: Tổng kim ngạch XNK kỳ báo cáo**:
   - Chỉ số chính: Tổng kim ngạch (Triệu USD).
   - Tách chi tiết: Kim ngạch XK vs Kim ngạch NK (kèm % tỷ trọng XK/NK).
   - So sánh: % YoY và giá trị kỳ trước.
2. **Card 4: Lũy kế Kim ngạch (YTD) & Bình quân**:
   - Chỉ số chính: Lũy kế kim ngạch từ đầu năm (YTD Triệu USD).
   - **Kim ngạch bình quân / tờ khai** (Nghìn USD/TK) = $\frac{\text{Tổng kim ngạch}}{\text{Tổng tờ khai}}$.
   - So sánh biến động bình quân so với kỳ trước.
   - Biểu đồ Sparkline vùng (AreaChart) xu hướng 12 kỳ.

---

### 3.3. Ma trận 9 Biểu đồ trực quan (`DeclarationsTurnoverCharts.tsx`)
Bố cục lưới 3x3:
1. **Tờ khai 6 kỳ gần nhất** (Composed/Bar Chart): Thể hiện diễn biến số lượng tờ khai XK và NK qua 6 kỳ gần nhất.
2. **Kim ngạch 6 kỳ gần nhất** (Stacked Bar Chart): Thể hiện giá trị kim ngạch XK và NK qua 6 kỳ.
3. **Cán cân XNK qua các kỳ** (Diverging Bar / Area Chart): Minh họa xu hướng xuất siêu/nhập siêu ròng qua các tháng.
4. **Cơ cấu XK / NK** (Donut Chart): Tỷ lệ phần trăm kim ngạch xuất khẩu và nhập khẩu.
5. **Theo Loại hình** (Horizontal Bar Chart): Top các loại hình phổ biến (A11 - Nhập KD, B11 - Xuất KD, E21 - Nhập NVL, E31 - Nhập SXXK...).
6. **Phân luồng tờ khai** (Donut Chart): Phân bổ 3 luồng Xanh, Vàng, Đỏ kèm % và số lượng.
7. **Theo Đơn vị hải quan** (Bar Chart): So sánh tổng tờ khai và kim ngạch theo từng Chi cục.
8. **Theo Nhóm hàng chủ lực** (Bar Chart): Top các nhóm hàng chiếm tỷ trọng kim ngạch cao nhất (Điện tử, Dệt may, Giày da, Nông thủy sản, Sắt thép...).
9. **Tương quan Tờ khai – Kim ngạch** (Composed Dual-Axis Chart): Một trục thể hiện số lượng tờ khai, trục kia thể hiện giá trị kim ngạch, giúp phát hiện ngay các nhóm hàng hoặc đơn vị có giá trị cao trên mỗi tờ khai.

---

### 3.4. Bảng Tờ khai chi tiết (`DeclarationsDetailTable.tsx`)
- Danh sách tờ khai chi tiết (Leaf-node Table) tương tác linh hoạt:
  - Cột: `Mã tờ khai`, `Ngày đăng ký`, `Doanh nghiệp (MST & Tên)`, `Loại hình`, `Luồng (Badge Xanh/Vàng/Đỏ)`, `Chiều (XK/NK)`, `Kim ngạch (USD)`, `Trạng thái`.
  - Hỗ trợ tìm kiếm theo Mã TK / Tên Doanh nghiệp, lọc nhanh theo luồng và phân trang.

---

## 4. Đặc tả API Endpoint (`GET /api/v1/declarations-turnover`)

### 4.1. Tham số truy vấn (Query Parameters)
| Tham số | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `unit` | string | `all` | Mã đơn vị/Chi cục (`all`, `cuc_hcm`, `cuc_hp`...) |
| `period` | string | `current` | Kỳ báo cáo (`2024-10`, `Q3-2024`, `2024`...) |
| `flow` | string | `all` | Chiều hàng (`all`, `xk`, `nk`) |
| `channel` | string | `all` | Phân luồng (`all`, `green`, `yellow`, `red`) |
| `commodity` | string | `all` | Nhóm hàng (`all`, `dien_tu`, `det_may`...) |
| `regime` | string | `all` | Loại hình (`all`, `A11`, `B11`...) |

### 4.2. Schema phản hồi JSON
```typescript
export interface DeclarationsTurnoverResponse {
  tradeBalance: {
    netBalanceMillionUSD: number;
    isSurplus: boolean;
    exportMillionUSD: number;
    importMillionUSD: number;
    yoyChangePct: number;
    prevPeriodBalanceMillionUSD: number;
  };
  declarationKpis: {
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
  };
  turnoverKpis: {
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
  };
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
  declarations: Array<{
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
  }>;
}
```

---

## 5. Quy chuẩn Kỹ thuật & Thiết kế (Technical & Design Constraints)
1. **Thiết kế & Bảng màu**:
   - Sử dụng chuẩn CSS Tailwind v4, không viết custom CSS ngoài.
   - Luồng Xanh (`#10b981`), Luồng Vàng (`#f59e0b`), Luồng Đỏ (`#ef4444`).
   - Xuất khẩu (`#3b82f6` - Blue), Nhập khẩu (`#8b5cf6` - Purple/Violet).
   - Hỗ trợ mượt mà Dark Mode (`dark:bg-slate-900`, `dark:border-slate-800`).
2. **Recharts Component Safety**:
   - Tất cả biểu đồ Recharts đều bọc trong thẻ có `min-h-[260px]` và kiểm tra cờ `mounted` để ngăn chặn lỗi hydration và layout collapsing 0px trên Next.js 16 / Turbopack.
3. **Localization**:
   - Tiền tệ: USD (Triệu USD, USD/TK), định dạng chuẩn `toLocaleString("vi-VN")`.
   - Tờ khai: số lượng có dấu phân cách hàng nghìn.
