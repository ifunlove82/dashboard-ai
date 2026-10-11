# URD 11. DASHBOARD PHÍ CƠ SỞ HẠ TẦNG (CSHT)
**Tài liệu Đặc tả Thiết kế (Design Specification)**
Ngày: 2026-09-13
Mức độ: Phức tạp

## 1. Mục tiêu (Objective)
Xây dựng trang Dashboard chuyên sâu theo dõi tiến độ thu phí sử dụng công trình kết cấu hạ tầng, công trình dịch vụ, tiện ích công cộng khu vực cửa khẩu cảng biển. Tuân thủ 100% hình ảnh layout mẫu.

## 2. Cấu trúc Layout (Architecture)

### 2.1. Header (Thanh tiêu đề & Bộ lọc)
- **Tiêu đề**: "11. Dashboard Phí Cơ Sở Hạ Tầng (CSHT)" + Subtitle.
- **Global Filters (Right-aligned)**:
  - Chọn kỳ báo cáo (VD: Năm 2024 YTD).
  - Chọn Cửa khẩu Cảng biển (Dropdown).
  - Nút "Bộ lọc nâng cao" (Ghost/Outline).
  - Nút "Xuất báo cáo thu phí" (Solid Blue).

### 2.2. Row 1: Lưới 6 KPI (3 columns x 2 rows)
Hiển thị 6 thẻ KPI. Mỗi thẻ có tiêu đề, giá trị cực lớn (Tỷ VNĐ), **Sparkline** (biểu đồ đường mini nền dưới), và phần footer chú thích số liệu.
1. **THU KỲ BÁO CÁO (T10)**: Có sparkline màu xanh, text chú thích tăng giảm.
2. **THU PHÍ YTD 2024**: Có sparkline màu xanh đậm.
3. **TĂNG TRƯỞNG YOY**: Có sparkline màu vàng/cam, giá trị %.
4. **THU KỲ TRƯỚC (T09)**: Có sparkline xám.
5. **KẾ HOẠCH NĂM 2024**: Có sparkline nhạt, so sánh số giao chỉ tiêu.
6. **% HOÀN THÀNH KH**: Có text tỷ lệ %, kèm thanh Progress bar thu nhỏ.

### 2.3. Row 2: Thanh Thông tin Hoạt động (Operation Badges)
Một dải Flexbox ngang chứa các thông số vận hành:
- **Badge 1**: Tỷ lệ Nộp không dùng tiền mặt 24/7 (VD: 99.4%).
- **Badge 2**: Tốc độ tự động thông quan CSHT (VD: 98.6%).
- **Badge 3**: Số lượt Tờ khai / Phương tiện (VD: 1.420.500).
- **Trạng thái hệ thống (Right-aligned)**: Pill chỉ báo "Hệ thống Hải quan (VNACCS) & Cảng điện tử: Đồng bộ trực tuyến".

### 2.4. Row 3: Biểu đồ Phân tích Chính (60/40)
- **Cột Trái (60%) - Thu phí 6 kỳ gần nhất**: ComposedChart (Bar + Line kết hợp). Trục X là tháng (T05-T10). Cột thể hiện doanh số thực thu, Đường (Line có dot) thể hiện tỷ lệ tăng trưởng.
- **Cột Phải (40%) - Cơ cấu Phí theo Luồng Nghiệp vụ**: PieChart (dạng Donut). Giữa Donut ghi TỔNG THU. Bên dưới là Custom Legend hiển thị list (Nhập khẩu, Xuất khẩu, Tạm nhập/Quá cảnh) kèm giá trị tuyệt đối và %.

### 2.5. Row 4: Phân tích 3 Chiều (3 columns, equal width)
3 Thẻ (Card) có chiều cao bằng nhau:
- **Card 1 - Phí theo Loại hàng hóa**: Danh sách list dọc. Mỗi item hiển thị tên (Container, Hàng rời, Hàng lỏng), kèm thanh ngang mini (Progress bar) và số Tỷ VNĐ + %.
- **Card 2 - Phí theo Khu vực Cảng biển**: Liệt kê các cụm Cảng (TP.HCM, Hải Phòng, Cảng khác) kèm tên chi tiết bến cảng nhỏ. Bên phải là Badge hiển thị %.
- **Card 3 - Phân khúc Doanh nghiệp**: Một thanh Horizontal Stacked Bar ở trên cùng (TOP 50 vs SME). Bên dưới là 3 khối Box thông tin về các nhóm (T50, SME, FDI).

### 2.6. Row 5: Bảng Dữ liệu & Xếp hạng TOP (Data Table)
- **Tabs Controls**: 3 Tabs dạng Underline hoặc Button (TOP Doanh nghiệp nộp phí, TOP Loại hình theo phí, TOP Nhóm hàng theo biểu thu).
- **Table Actions (Right)**: Search bar, Limit Selector (TOP 5, 10, 20, Tất cả), nút Export Excel.
- **Bảng (Table)**: Cấu trúc Table phức tạp với các cột:
  - STT (#).
  - Tên Doanh Nghiệp (có avatar 2 chữ cái, Tên công ty, MST, Label).
  - Loại hình tờ khai (Có icon).
  - Cơ cấu hàng (Có icon/mô tả).
  - Khu vực cảng.
  - Số thu kỳ (Tỷ).
  - Lũy kế YTD (Tỷ).
  - % Tỷ trọng.
  - Trạng thái.
- **Footer**: Pagination (Phân trang) và dòng text thống kê tổng thu.

## 3. Kiến trúc API (Mock Data)
- endpoint: /api/v1/infrastructure-fee/dashboard
- Response: Payload duy nhất trả về { kpis, operations, trends, breakdown, commodities, ports, segments, topEnterprises } để render toàn bộ trang trong 1 lần fetch.

## 4. Ràng buộc Kỹ thuật (Global Constraints)
- Chỉ sử dụng chuẩn Tailwind CSS classes. KHÔNG viết CSS tự do (trừ những animation đặc biệt không có trong Tailwind).
- Recharts phải được bọc trong container lex-1 min-h-0 để xử lý lỗi 0-height trên Flexbox/CSS Grid.
- Đảm bảo tương thích Dark / Light mode (đặc biệt các thẻ KPI và Table rows).
- Responsive:
  - Row 1: Mobile (1 cột) -> Tablet (2 cột) -> Desktop (3 cột).
  - Row 3: Mobile (1 cột) -> Desktop (2 cột 60/40).
  - Row 4: Mobile (1 cột) -> Desktop (3 cột ngang).
