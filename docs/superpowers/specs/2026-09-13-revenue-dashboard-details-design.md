# Revenue Dashboard Details (URD 10) - Design Spec

## 1. Mục tiêu
Nâng cấp toàn diện phân hệ Thu ngân sách (`/dashboard/revenue/page.tsx`) theo yêu cầu URD 10, bổ sung hệ thống KPI chi tiết, 6 loại biểu đồ phân tích, 3 danh sách xếp hạng TOP, và cơ chế lọc Drill-down toàn cục (Dashboard-wide).

## 2. Kiến trúc Giao diện (UI/UX Layout)
Trang sẽ được chia thành 4 khu vực chính:

### 2.1. Thanh điều hướng Drill-down (Breadcrumbs)
- Hiển thị cấp độ lọc hiện tại: `Toàn Cục` → `[Đơn vị]` → `[Loại thuế]` → `[Doanh nghiệp]` → `[Tờ khai]`.
- Nút "X" hoặc click vào cấp cha để quay lại (Reset filter).

### 2.2. Khu vực KPI (8 Metrics)
Lưới 4 cột x 2 hàng, hiển thị:
1. Thu kỳ báo cáo (Số tuyệt đối)
2. Thu YTD (Lũy kế đầu năm)
3. YoY (% Tăng trưởng cùng kỳ)
4. Kỳ trước (So sánh chuỗi thời gian)
5. Chỉ tiêu được giao (Tuyệt đối)
6. Chỉ tiêu phấn đấu (Tuyệt đối)
7. % hoàn thành (Progress bar)
8. Còn phải thu (Chỉ tiêu - YTD)

### 2.3. Khu vực Biểu đồ (Charts)
Chia làm 2 hàng để không bị quá tải:
- **Hàng 1 (Ưu tiên Drill-down):**
  - Số thu theo Đơn vị (Horizontal Bar Chart).
  - Số thu theo Loại thuế (Donut Chart).
  - Số thu 6 kỳ gần nhất (Area Chart).
- **Hàng 2 (Tương quan & Phân bổ):**
  - Tương quan Kim ngạch - Số thu (Composed Chart: Cột cho Kim ngạch, Đường cho Số thu).
  - Số thu theo XK/NK (Pie Chart / Phân tách màu).
  - Số thu theo Nhóm hàng (Treemap hoặc Horizontal Bar).

### 2.4. Khu vực Bảng xếp hạng (TOP)
3 bảng danh sách đặt cạnh nhau (grid-cols-3):
- TOP Doanh nghiệp nộp thuế.
- TOP Loại hình theo số thu.
- TOP Nhóm hàng theo số thu.
- **Tương tác:** Mỗi bảng có Dropdown chọn số lượng (TOP 5, TOP 10, TOP 20). Nút "Xem tất cả" dưới mỗi bảng mở Modal hiển thị dạng Table đầy đủ.

## 3. Quản lý Trạng thái & Cơ chế Drill-down
- Sử dụng `URL Search Params` để lưu trạng thái Drill-down (`?unit=...&tax=...&enterprise=...`). Điều này giúp người dùng có thể chia sẻ URL hoặc tải lại trang mà không mất bộ lọc.
- Khi click vào một cột của biểu đồ "Số thu theo Đơn vị", URL sẽ thêm `unit=[id]`. Các biểu đồ khác tự động re-render và thu hẹp dữ liệu theo `unit`.
- **Level cuối (Tờ khai):** Khi người dùng đã drill-down đến cấp độ Doanh nghiệp (`?enterprise=...`), giao diện phần "Biểu đồ" và "TOP" sẽ được ẩn đi. Thay vào đó, hiển thị một Bảng dữ liệu (Data Table) chi tiết danh sách các **Tờ khai/Chứng từ** của Doanh nghiệp đó.

## 4. API Endpoint Contract
**Tạo mới API Mockup:** `GET /api/v1/revenue/detailed`
**Query Params:** `branch`, `loaiXNK`, `timeframe`, `unit` (drill), `taxType` (drill), `enterprise` (drill).

**JSON Response Schema:**
```json
{
  "kpis": {
    "currentPeriod": 500,
    "ytd": 12000,
    "yoy": 12.5,
    "previousPeriod": 450,
    "target": 15000,
    "stretchTarget": 16000,
    "completionPct": 80,
    "remaining": 3000
  },
  "charts": {
    "last6Periods": [...],
    "byUnit": [...],
    "byTaxType": [...],
    "byImportExport": [...],
    "byCommodityGroup": [...],
    "correlation": [...]
  },
  "tops": {
    "enterprises": [...],
    "regimes": [...],
    "commodities": [...]
  }
}
```

## 5. Phương án Tích hợp
- Gỡ bỏ toàn bộ code cũ trong `src/app/dashboard/revenue/page.tsx`.
- Viết mới các Client Component con: `<RevenueKPIs />`, `<RevenueCharts />`, `<RevenueTopLists />` để chia nhỏ logic.
- Khai báo file API route mới tại `src/app/api/v1/revenue/detailed/route.ts`.
