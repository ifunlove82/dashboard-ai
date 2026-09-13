# Báo Cáo Task 5: Top Lists & Leaf-node Declarations Table

## 1. Tổng Quan Công Việc Đã Thực Hiện
Đã triển khai hoàn tất Task 5 cho trang Dashboard Phí Cơ Sở Hạ Tầng (CSHT) theo đúng đặc tả kỹ thuật và yêu cầu trong task brief:
1. **Thành phần `InfrastructureTopLists.tsx` (Xếp hạng TOP Doanh nghiệp & Loại hình)**:
   - **Hệ thống 3 Tabs chuyên sâu**:
     - *Tab 1: TOP Doanh nghiệp nộp phí*: Bảng dữ liệu 10 cột chuẩn chỉnh (# STT, Doanh nghiệp & MST kèm Avatar + Tag nhãn, Loại hình tờ khai, Cơ cấu hàng, Cụm cảng, Thu kỳ Tỷ VNĐ, Lũy kế YTD, % Tỷ trọng, Trạng thái hoàn thành/nộp 24/7, Nút thao tác chi tiết).
     - *Tab 2: TOP Loại hình tờ khai*: Tổng hợp động theo các nhóm loại hình tờ khai chính (A11, A12, E21, B11, E31...) hiển thị số lượng DN, doanh số thu kỳ, lũy kế và % tỷ trọng.
     - *Tab 3: TOP Nhóm hàng*: Tổng hợp theo nhóm hàng hóa biểu thu (Hàng Container, Linh kiện, Hàng rời, Dầu mỏ...) kèm số lượng DN và tỷ trọng.
   - **Bộ điều khiển & Bộ lọc**:
     - Ô tìm kiếm tức thời theo Tên Doanh nghiệp, Mã số thuế, Nhóm hàng, Cảng biển.
     - Selector số lượng hiển thị nhanh: TOP 5, TOP 10, Tất cả.
     - Nút Xuất Excel.
     - Huy hiệu xếp hạng trực quan (Hạng 1 vàng kim, Hạng 2 bạc, Hạng 3 đồng).
   - **Cơ chế Drill-down**: Nhấp vào bất kỳ hàng doanh nghiệp hoặc nút mũi tên chi tiết sẽ kích hoạt `onDrill(dn.id)` cập nhật URL param `?enterprise=...`.

2. **Thành phần `InfrastructureDeclarationsTable.tsx` (Bảng Chi Tiết Tờ Khai - The Leaf Node)**:
   - **Thanh tiêu đề & Nút Quay lại**:
     - Nút "Quay lại Tổng quan" gắn icon `ArrowLeft` cho phép người dùng thoát trạng thái drill-down và trở về màn hình tổng quan.
     - Thông tin chi tiết doanh nghiệp được chọn: Tên đầy đủ doanh nghiệp, Mã số thuế / Mã định danh.
     - Nút Xuất báo cáo tờ khai.
   - **4 Thẻ Mini-KPI tổng kết**:
     - *Tổng số tờ khai*: Số lượng tờ khai của doanh nghiệp.
     - *Tổng số tiền phí*: Tổng tiền phí đã nộp (VNĐ).
     - *Khối lượng hàng*: Tổng số container (Cont / TEU).
     - *Nộp phí 24/7*: Tỷ lệ nộp trực tuyến 24/7 qua cổng điện tử Hải quan & Cảng vụ (100%).
   - **Bảng Tờ Khai Chi Tiết**:
     - Đầy đủ các trường theo yêu cầu: STT, Số TK (định dạng font-mono nổi bật), Ngày nộp, Loại hình tờ khai, Tên hàng hóa chi tiết, Cảng / Khu vực xếp dỡ, Số lượng cont, Đơn giá định mức thu phí (đ/cont), Tổng số tiền nộp (VNĐ) căn phải nổi bật, Trạng thái (Pill badge "Đã nộp 24/7" kèm chấm hiệu ứng pulse, "Đã thông quan", "Đã hoàn thành").
     - Hỗ trợ lọc theo trạng thái và tìm kiếm thời gian thực theo Số TK, Hàng hóa, Cảng.

3. **Tích hợp vào `src/app/dashboard/infrastructure-fee/page.tsx`**:
   - Khi URL có param `enterprise`: Ẩn toàn bộ Grid 6 KPI, Row 1 (Biểu đồ chính), Row 2 (Cards Hàng hóa & Cảng) và Top Lists. Chỉ hiển thị duy nhất `<InfrastructureDeclarationsTable>`.
   - Khi URL không có param `enterprise`: Hiển thị đầy đủ Grid 6 KPI, Row 1, Row 2 và `<InfrastructureTopLists>`.
   - Kết nối hai chiều với `GlobalFilterBar`: Breadcrumb hiển thị đường dẫn đầy đủ `Phí CSHT > [Cảng] > [Luồng] > [Tên Doanh nghiệp]`, cho phép người dùng click lùi cấp bất kỳ lúc nào hoặc bấm nút Reset.

## 2. Danh Sách Tệp Đã Tạo & Chỉnh Sửa
- **Create**: `src/components/dashboard/InfrastructureTopLists.tsx`
- **Create**: `src/components/dashboard/InfrastructureDeclarationsTable.tsx`
- **Modify**: `src/app/dashboard/infrastructure-fee/page.tsx`

## 3. Quy Trình Kiểm Thử & Xác Minh (Verification)
1. **Kiểm tra biên dịch Type-check**:
   - Lệnh `npx tsc --noEmit`: 0 errors trên toàn bộ dự án.
2. **Kiểm tra Production Build**:
   - Lệnh `npm run build`: Thành công 100%, render route `/dashboard/infrastructure-fee` không gặp bất kỳ cảnh báo hay lỗi cú pháp nào.
3. **Kiểm thử API Endpoint & Luồng Drill-down qua Node Script**:
   - Script `scratch/test-task5-drilldown.js` đã xác minh thành công 5 kịch bản:
     - Gọi default API: Trả về 10 doanh nghiệp hàng đầu, mảng `declarations` rỗng (`decCount: 0`).
     - Gọi API với `enterprise=DN001`: Trả về 8 tờ khai chi tiết với đầy đủ `declarationNo`, `containers`, `amount`, `enterpriseName`.
     - Tải trang tổng quan `localhost:3050/dashboard/infrastructure-fee`: HTTP 200.
     - Tải trang leaf node `localhost:3050/dashboard/infrastructure-fee?enterprise=DN001`: HTTP 200.
     - Kết hợp đa tầng tham số (`unit=HQ TP.HCM` + `taxType=Nhập khẩu` + `enterprise=DN001`): HTTP 200, dữ liệu tờ khai đồng bộ và số liệu KPI co giãn chính xác.
4. **Kiểm tra chuẩn giao diện Dark / Light Mode & Tailwind CSS**:
   - Sử dụng hoàn toàn các Tailwind utility classes chuẩn (`bg-white dark:bg-slate-900`, `border-slate-200/80 dark:border-slate-800`, `text-slate-900 dark:text-white`, `text-slate-500 dark:text-slate-400`).
   - Các badge trạng thái và nút bấm responsive mượt mà trên mọi kích thước màn hình.
