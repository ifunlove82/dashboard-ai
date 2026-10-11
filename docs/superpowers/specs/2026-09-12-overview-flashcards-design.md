# Spec: Overview Flashcards Redesign (YTD 6-Card Layout)

## 1. Core Principles
- **YTD Strict Mode**: The Flashcards on the `/dashboard/overview` page represent Year-To-Date (YTD) data (Lũy kế từ đầu năm đến hiện tại) exclusively. They **IGNORE** the global Timeframe/Date filter from `DashboardContext`.
- **Global Filters Respected**: The cards still respect the global **Cục Hải quan** (Branch) and **Loại hình XNK** (Trade Type) filters.
- **Layout**: 6 Cards arranged in a Grid. To prevent horizontal cramping (due to Sparklines and Progress Bars), the layout will use a 3-column by 2-row grid on large screens (`grid-cols-1 md:grid-cols-2 xl:grid-cols-3`).

## 2. Card Specifications

### Thẻ 1: Số Thu (Revenue)
- **Dữ liệu chính**: Tổng thu YTD (Trong + Ngoài thống kê).
- **So sánh (Badge)**: % YoY (Tăng/giảm so với cùng kỳ năm ngoái), màu Xanh/Đỏ.
- **Trực quan hóa 1**: Progress Bar thể hiện % Đạt chỉ tiêu giao/phấn đấu.
- **Trực quan hóa 2**: Sparkline (Biểu đồ Line nhỏ) thể hiện xu hướng thu theo từng tháng.

### Thẻ 2: Phí Cơ sở hạ tầng (Seaport Fee)
- **Dữ liệu chính**: Số thu Phí CSHT YTD.
- **So sánh (Badge)**: % YoY.
- **Trực quan hóa 1**: Progress Bar thể hiện % Đạt chỉ tiêu.
- **Trực quan hóa 2**: Sparkline xu hướng thu phí theo từng tháng.

### Thẻ 3: Số lượng Tờ khai (Declarations)
- **Dữ liệu chính**: Tổng số tờ khai YTD (Trong thống kê).
- **Số phụ**: Chênh lệch tuyệt đối so với cùng kỳ năm trước.
- **So sánh (Badge)**: % YoY.
- **Trực quan hóa**: Sparkline xu hướng tờ khai theo tháng.

### Thẻ 4: Kim ngạch (Turnover)
- **Dữ liệu chính**: Tổng kim ngạch YTD (USD, Trong thống kê).
- **Số phụ**: Chênh lệch tuyệt đối so với cùng kỳ năm trước.
- **So sánh (Badge)**: % YoY.
- **Trực quan hóa**: Sparkline xu hướng kim ngạch theo tháng.

### Thẻ 5: Hàng hóa (Goods Volume)
- **Dữ liệu chính**: Tổng trọng lượng Hàng hóa YTD.
- **Số phụ**: Số lượng Container.
- **So sánh (Badge)**: % YoY.
- **Trực quan hóa**: Sparkline xu hướng lượng hàng theo tháng.

### Thẻ 6: Doanh nghiệp (Enterprises)
- **Dữ liệu chính**: Tổng số Doanh nghiệp làm thủ tục YTD.
- **Số phụ**: Số Doanh nghiệp phát sinh mới.
- **So sánh (Badge)**: % YoY.
- **Trực quan hóa**: Sparkline xu hướng số lượng doanh nghiệp theo tháng.

## 3. Data Architecture & API Fetching
Since the global context (`DashboardContext`) manages a mutable `startDate` and `endDate`, the `/dashboard/overview` page will need to fetch its own specific dataset for the flashcards to enforce the YTD rule.

1. **Client Component Logic**:
   - Get the current Year (e.g., 2026).
   - Generate absolute YTD dates: `startDate = '2026-01-01'` and `endDate = '[Today]'`.
   - Call `/api/stats` or a new `/api/v1/overview-cards` endpoint using these strict dates, while passing along the `branch` and `loaiXNK` from the global context.
2. **Sparkline Data**:
   - The API must return an array of monthly data (e.g., `sparklines: { revenue: [120, 130, 115, ...], declarations: [...] }`) to render the mini Line charts on each card.

## 4. UI Library & Implementation
- **Cards**: `shadcn/ui` Card component.
- **Sparklines**: `recharts` (Mini `<LineChart>` without axes or grids to fit inside the card).
- **Badges**: Custom Tailwind classes for Up (Green) / Down (Red).

## 5. Interaction (Drill-down)
All cards act as navigation triggers (Drill-down) to their respective detailed tabs:
- **Thẻ 1 (Số Thu)** -> `/dashboard/revenue`
- **Thẻ 2 (Phí CSHT)** -> `/dashboard/revenue`
- **Thẻ 3 (Tờ khai)** -> `/dashboard/clearance`
- **Thẻ 4 (Kim ngạch)** -> `/dashboard/clearance`
- **Thẻ 5 (Hàng hóa)** -> `/dashboard/clearance`
- **Thẻ 6 (Doanh nghiệp)** -> `/dashboard/enterprises`

Navigation should preserve the global context filters (Branch, LoaiXNK) via URL search params so the user doesn't lose their session state when drilling down.
