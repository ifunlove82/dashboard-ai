# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Người dùng chính**: Lãnh đạo và Cán bộ Quản lý Hải quan, chuyên viên phân tích nghiệp vụ XNK.
- **Mục tiêu công việc**: Giám sát tổng thể luồng tờ khai (Xanh / Vàng / Đỏ), cơ cấu các khoản thu ngân sách thuế quan (Thuế XNK, VAT, TTĐB, BVMT, Tự vệ, v.v.), theo dõi top doanh nghiệp kim ngạch lớn, cảnh báo sớm rủi ro nghiệp vụ qua trợ lý AI và xuất báo cáo định dạng vector PDF chuẩn A4 gửi cấp lãnh đạo.

## Product Purpose

- Cung cấp bảng điều khiển thống kê (Executive Dashboard) trực quan, có độ nén dữ liệu cao (data-dense), cập nhật số liệu tờ khai xuất nhập khẩu theo thời gian thực trực tiếp từ CSDL Microsoft SQL Server.
- Hỗ trợ ra quyết định điều hành nhanh chóng thông qua các chỉ số đo lường hiệu quả (KPIs), phân tích xu hướng kim ngạch - thuế thu và tóm tắt nhận định nghiệp vụ tự động bằng AI Gemini.

## Positioning

- Khác với các hệ thống báo cáo tĩnh hoặc phần mềm hải quan nghiệp vụ truyền thống vốn phân mảnh và giao diện cũ kỹ, hệ thống này kết nối dữ liệu trực tiếp theo mô hình [Table.sql](Table.sql) (`rpToKhai` và `rpHang`), có cơ chế tự động chuyển đổi High-Fidelity Mock Data khi ngắt kết nối DB, tích hợp AI chuyên sâu đánh giá rủi ro và hỗ trợ chế độ Dark/Light mode hiện đại theo chuẩn quốc tế.

## Operating Context

- **Môi trường hoạt động**: Trình duyệt máy tính để bàn (Desktop Web) tại trung tâm chỉ huy / phòng làm việc của cán bộ quản lý hải quan.
- **Tần suất sử dụng**: Hàng ngày và định kỳ cuối tháng / quý để đánh giá tiến độ thu nộp ngân sách và kiểm soát luồng hàng hóa.
- **Tài liệu đầu ra**: Báo cáo PDF vector chuẩn A4 được in hoặc lưu trực tiếp từ trình duyệt để đính kèm hồ sơ giao ban.

## Capabilities and Constraints

- **Truy vấn CSDL SQL Server trực tiếp**: Dựa trên 2 bảng nghiệp vụ cốt lõi:
  - `rpToKhai`: Thông tin tờ khai, mã loại hình, chi cục hải quan, kim ngạch, các sắc thuế, số container, luồng thông quan (1: Xanh, 2: Vàng, 3: Đỏ).
  - `rpHang`: Chi tiết dòng hàng, mã HS, tên hàng hóa, trị giá nguyên tệ và VND.
- **Tỷ lệ phân luồng hải quan**: Chỉ biểu diễn tỷ lệ và số lượng phân luồng (Xanh / Vàng / Đỏ), không cần trích xuất danh sách chi tiết các tờ khai luồng đỏ.
- **Cơ cấu Thuế quan**: Phân tách rõ các sắc thuế (Thuế XNK, VAT, Tiêu thụ đặc biệt, Bảo vệ môi trường, Tự vệ, Khác).
- **Bộ dữ liệu dự phòng**: Tự động kích hoạt Mock Data chuẩn nghiệp vụ nếu chưa có kết nối CSDL SQL Server hoặc bảng rỗng.
- **AI Phân tích**: Tích hợp Google Gemini 1.5 Flash (hoặc bộ phân tích cục bộ tích hợp sẵn khi chưa có API key).
- **Xuất PDF**: Tối ưu in ấn định dạng vector A4 không phụ thuộc thư viện render canvas dễ lỗi font/màu CSS.

## Brand Commitments

- **Phong cách thị giác**: Data-Dense Executive Dashboard, độ tương phản chuẩn WCAG AAA, giao diện hỗ trợ Dark và Light mode.
- **Ngôn ngữ**: Tiếng Việt chuẩn mực thuật ngữ ngành Hải quan Việt Nam (Tờ khai, Kim ngạch, Luồng tờ khai, Trị giá tính thuế, Đơn vị hải quan, v.v.).

## Evidence on Hand

- Cấu trúc CSDL chuẩn: [Table.sql](Table.sql).
- Bộ dữ liệu mô phỏng nghiệp vụ thực tế: [mockData.ts](src/lib/mockData.ts).
- Script khởi tạo và kiểm thử CSDL: [seed.js](scripts/seed.js).

## Product Principles

1. **Chính xác & Minh bạch**: Số liệu hiển thị sử dụng định dạng `tabular-nums`, căn chỉnh thẳng hàng, rõ ràng giữa kim ngạch USD và tiền thuế VND.
2. **Nghiệp vụ là trọng tâm**: Tập trung vào các chỉ số điều hành then chốt (Cơ cấu thuế, tỷ lệ luồng xanh, top doanh nghiệp đóng góp), tránh làm loãng giao diện bằng các yếu tố trang trí thừa thãi.
3. **Phản hồi tức thời**: Bộ lọc thời gian và loại hình tác động mượt mà, AI phân tích có khung tóm tắt điều hành (Executive Summary) ngắn gọn, hành động được ngay.
4. **Độ tin cậy cao**: Luôn hoạt động ổn định kể cả khi mất kết nối CSDL hoặc chưa có khóa API ngoài thông qua cơ chế Fallback tự hồi phục.

## Accessibility & Inclusion

- Hỗ trợ đầy đủ Dark Mode và Light Mode với tỷ lệ tương phản cao cho môi trường làm việc ban ngày cũng như trực ca đêm.
- Kích thước chữ, thẻ đo lường và nhãn biểu đồ được thiết kế rõ ràng, dễ đọc trên màn hình lớn.