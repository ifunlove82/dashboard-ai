---
target: src/app/page.tsx
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
timestamp: 2026-09-11T15-29-29Z
slug: src-app-page-tsx
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|:-----:|-----------|
| 1 | Visibility of System Status | 2 | Trạng thái DB có đèn báo tốt; nhưng khi lọc bị xoá trắng màn hình (layout wipeout) và AI gõ chữ 30ms gây chờ đợi không cần thiết. |
| 2 | Match System / Real World | 3 | Thuật ngữ hải quan chuẩn (VNACCS, Tờ khai, Sắc thuế); bị trừ điểm do dùng emoji huân chương (🥇🥈🥉) và tỷ giá cứng 25.000. |
| 3 | User Control and Freedom | 2 | Không thể hủy lượt sinh AI đang chạy; menu thanh bên (sidebar) không có tác dụng điều hướng; thiếu nút "Đặt lại bộ lọc". |
| 4 | Consistency and Standards | 2 | Trùng lặp màu nghiêm trọng (Xanh lá dùng cho cả Kim ngạch, VAT, Luồng xanh, Top hàng); dropdown chọn ngày dạng native chưa đồng bộ giao diện. |
| 5 | Error Prevention | 3 | Giới hạn khoảng ngày và loại hình giúp tránh lỗi nhập liệu; tự động fallback Mock data khi CSDL gặp sự cố. |
| 6 | Recognition Rather Than Recall | 3 | Màu luồng chuẩn Xanh/Vàng/Đỏ; biểu đồ 2 trục tung (USD vs VND) thiếu chú thích đơn vị trực tiếp trên trục. |
| 7 | Flexibility and Efficiency of Use | 1 | Chưa có phím tắt (như `/` để tìm kiếm, `P` để in); bảng doanh nghiệp chưa hỗ trợ sắp xếp theo cột; thiếu xuất dữ liệu Excel/CSV. |
| 8 | Aesthetic and Minimalist Design | 2 | Bố cục tổng thể tốt nhưng bị phân mảnh bởi dải màu cầu vồng trên thẻ KPI, gradient tím và hiệu ứng nhấp nháy/bouncing ở khung AI. |
| 9 | Help Users Recognize, Diagnose Errors | 2 | Đã có thông báo lỗi AI inline, nhưng cơ chế chuyển sang Mock Data chưa có thông báo nổi bật cho lãnh đạo biết là đang xem dữ liệu giả lập. |
| 10 | Help and Documentation | 1 | Thiếu tooltip giải thích các từ viết tắt chuyên ngành (TNE, Cont, Thuế BVMT, Tự vệ); thiếu liên kết quy định pháp luật. |
| **Tổng điểm** | | **21 / 40** | **Chấp nhận được (Acceptable - 52.5%)** |

---

## Design Specificity Verdict

### Đánh giá chuyên môn (Design Director Assessment)
Giao diện đã nắm bắt xuất sắc cấu trúc dữ liệu nghiệp vụ đặc thù của Hải quan Việt Nam: phân bổ đủ 6 sắc thuế theo Luật Thuế XNK số 107/2016/QH13, luồng thông quan VNACCS (Xanh/Vàng/Đỏ) và đối soát 2 loại tiền tệ (USD kim ngạch và VND thuế nộp ngân sách nhà nước).

Tuy nhiên, giao diện vẫn vướng phải những dấu vết của các mẫu template SaaS tiêu dùng phổ thông:
- **Gamification không phù hợp**: Bảng danh sách các tập đoàn kinh tế lớn dùng emoji huân chương (🥇, 🥈, 🥉) như bảng xếp hạng game giải trí thay vì danh sách quản trị rủi ro và tuân thủ tài khóa nghiêm túc.
- **Huy hiệu kỹ thuật thừa**: Badge `"DATA-DENSE ANALYTICS"` và chân trang `"Next.js 16 • Tailwind v4 PRO"` thể hiện phong cách của developer khoe công nghệ, không mang lại giá trị cho cán bộ điều hành hải quan.
- **Hiệu ứng AI dạng Chatbot**: Khung nhận định AI dùng gradient tím, icon lấp lánh nảy (bounce) và hiệu ứng gõ chữ từng ký tự. Trong trung tâm điều hành, lãnh đạo cần thông tin tóm tắt hiển thị tức thì, sắc bén để ra quyết định ngay.
- **Tỷ giá chuyển đổi cố định**: Tỷ giá USD/VND tính cứng `* 25000` trong mã nguồn làm giảm tính thẩm quyền của một báo cáo thống kê chính thống.

### Kết quả quét tự động (Deterministic Scan - `detect.mjs`)
- **Tổng số vi phạm phát hiện**: 5 cảnh báo (Category: `slop`).
  - Line 972: `animate-bounce` trên icon `Sparkles` (Vi phạm trực quan: icon nảy liên tục gây mất tập trung, lỗi WCAG).
  - Line 929: `from-indigo-50... to-violet-50` (Vi phạm màu AI cliché: gradient tím/chàm phá vỡ tính đồng nhất của giao diện điều hành).
  - Line 621: `text-violet-600 / text-violet-400` trên thẻ KPI thuế (Cảnh báo về phối màu cầu vồng ngẫu nhiên).
- **Phát hiện Runtime trong Console**: Cảnh báo Recharts `width(-1) and height(-1)` do `<ResponsiveContainer>` mount trước khi tính xong kích thước ô lưới.

---

## Overall Impression
Giao diện đã chuyển đổi ngoạn mục từ ứng dụng sơ khai sang một dashboard quản trị có cấu trúc dữ liệu rất thực tế và chức năng in ấn PDF A4 vector tuyệt vời. Tuy nhiên, sản phẩm đang ở ngưỡng giữa một "công cụ phân tích chỉ huy cấp bộ" và một "mẫu SaaS thương mại hào nhoáng". Cắt bỏ các chi tiết trang trí thừa, giải quyết dứt điểm các nút bấm chết (dead affordances) trên thanh bên và chuẩn hóa hệ thống màu sắc sẽ nâng tầm ứng dụng lên đẳng cấp chuyên nghiệp.

---

## What's Working (Điểm sáng)
1. **Kiến trúc dữ liệu bám sát nghiệp vụ hải quan**: Tách bạch 6 sắc thuế và 3 luồng tờ khai VNACCS, giải quyết chính xác bài toán quản trị nhà nước.
2. **Động cơ in ấn Dossier Vector chuẩn A4**: Tích hợp sẵn CSS print chuyên dụng, tự động thêm tiêu đề hành chính trang trọng (`BÁO CÁO THỐNG KÊ HOẠT ĐỘNG HẢI QUAN...`), loại bỏ thanh điều khiển, sẵn sàng đính kèm hồ sơ họp giao ban.
3. **Cơ chế hoạt động bền bỉ (Dual-mode resilient)**: Tự động chuyển đổi giữa SQL Server thực và Mock Data nghiệp vụ phong phú, đảm bảo phiên làm việc không bao giờ bị gián đoạn vì rớt mạng CSDL.

---

## Priority Issues (Các vấn đề ưu tiên)

### [P0] Thanh bên bị tê liệt (Dead Navigation & Broken Affordances)
- **Vấn đề**: Các nút điều hướng trên sidebar ("Tổng quan chỉ số", "Cơ cấu hàng hóa", "Doanh nghiệp XNK") có hiệu ứng hover nhưng bấm vào không có bất kỳ phản hồi nào.
- **Tác động**: Người dùng tưởng nhầm ứng dụng bị đơ hoặc lỗi mã nguồn.
- **Giải pháp**: Gắn liên kết cuộn mượt (smooth scroll) đến các khu vực tương ứng (`#commodities`, `#enterprises`) kèm trạng thái active theo vị trí màn hình.
- **Lệnh đề xuất**: `$impeccable layout src/app/page.tsx`

### [P1] Xóa trắng giao diện khi tải lại & Trì hoãn gõ chữ AI
- **Vấn đề**: Khi đổi bộ lọc ngày hoặc loại hình XNK, toàn bộ vùng nội dung bị unmount để hiện con quay xoay (spinner), gây giật màn hình (layout thrashing/CLS). Khung AI giả lập gõ chữ 30ms bắt người dùng phải chờ đợi.
- **Tác động**: Gây gián đoạn trí nhớ thị giác khi so sánh số liệu giữa các kỳ; làm chậm tốc độ tiếp cận thông tin của người điều hành.
- **Giải pháp**: Giữ nguyên dữ liệu cũ ở độ mờ 60% kèm thanh tiến độ mỏng trên đỉnh trong lúc tải; hiển thị nhận định AI tức thì với hiệu ứng fade-in nhẹ.
- **Lệnh đề xuất**: `$impeccable polish src/app/page.tsx`

### [P1] Xung đột màu sắc ngữ nghĩa & Dải màu cầu vồng
- **Vấn đề**: Màu Xanh lá (#10B981) bị dùng trùng lặp cho: Kim ngạch, Thuế VAT, Luồng xanh thông quan, và Cột hàng hóa. Trong nghiệp vụ hải quan, Xanh lá có ý nghĩa sinh mệnh duy nhất: *Được miễn kiểm tra thực tế (Luồng Xanh)*. Thẻ KPI dùng 4 màu khác nhau (Xanh dương, Xanh lá, Tím, Vàng cam) thiếu chuẩn mực.
- **Vấn đề**: Bảng doanh nghiệp dùng emoji huân chương (🥇🥈🥉).
- **Giải pháp**: Dành riêng bộ màu Xanh/Vàng/Đỏ cho 3 luồng kiểm tra hải quan. Đưa các chỉ số tài chính về tông Xanh biển đậm (Navy) và Slate trung tính. Thay emoji bằng badge số thứ hạng kim loại trang nhã.
- **Lệnh đề xuất**: `$impeccable colorize src/app/page.tsx`

### [P2] Rào cản Trợ năng (Accessibility) & Thiếu cấu hình tiếng Việt
- **Vấn đề**: File `layout.tsx` khai báo `lang="en"` cho giao diện 100% tiếng Việt, khiến trình đọc màn hình đọc sai ngữ âm. Các ô `<select>` và `<input>` tìm kiếm thiếu `aria-label`. Màu chữ nhãn phụ (`text-slate-400` trên nền trắng = 2.9:1) vi phạm tiêu chuẩn tương phản WCAG AA (cần tối thiểu 4.5:1).
- **Giải pháp**: Cập nhật `lang="vi"`, thêm `aria-label`, nâng màu chữ phụ lên `text-slate-500` / `text-slate-400 (dark)`, bổ sung phím tắt tìm kiếm (`/`).
- **Lệnh đề xuất**: `$impeccable harden src/app/page.tsx`

---

## Persona Red Flags (Góc nhìn người dùng)

### Alex (Chuyên viên phân tích cấp cao / Lãnh đạo)
- **Thiếu phím tắt**: Không thể bấm `/` để vào ô tìm kiếm doanh nghiệp, không thể dùng phím số để chuyển tab.
- **Không sắp xếp được bảng**: Bảng chỉ cố định theo kim ngạch, không thể bấm vào tiêu đề cột để xem doanh nghiệp có số lượng Container nhiều nhất hay nộp thuế nhiều nhất.
- **Thiếu xuất dữ liệu thô**: Alex cần trích xuất bảng doanh nghiệp ra Excel/CSV để chạy mô hình kiểm toán độc lập.

### Jordan (Cán bộ hải quan mới nhận việc)
- **Thuật ngữ viết tắt không giải thích**: Các ký hiệu `"TNE"` (Tấn), `"Cont"`, tên các sắc thuế không có tooltip giải thích ý nghĩa.
- **Lúng túng với biểu đồ 2 trục**: Trục trái là USD ($M), trục phải là VND (B - Tỷ đồng) dễ gây nhầm lẫn đường nào biểu diễn chỉ tiêu nào nếu không nhìn kỹ màu.

### Sam (Người sử dụng công cụ trợ năng / Trình đọc màn hình)
- **Méo mó giọng đọc**: Thuộc tính `lang="en"` làm NVDA/VoiceOver phát âm các từ tiếng Việt như những âm tiết tiếng Anh vô nghĩa.
- **Ô nhập liệu vô danh**: Ô chọn ngày và ô tìm kiếm doanh nghiệp không có nhãn tiếp cận (`aria-label`).
- **Độ tương phản thấp**: Chữ xám mờ `text-slate-400` trên nền sáng rất khó đọc với người thị lực yếu.

---

## Minor Observations (Ghi nhận vi mô)
1. Thẻ footer `"Next.js 16 • Tailwind v4 PRO"` nên thay bằng thông tin cơ quan: `"Hệ thống Thống kê Hải quan VNACCS/VCIS"`.
2. Tỷ giá tính nhẩm `* 25000` nên có ghi chú rõ ràng về căn cứ tỷ giá hạch toán của Ngân hàng Nhà nước.
3. Ngày in ấn trên báo cáo PDF đang lấy `new Date()` (thời điểm bấm nút in) thay vì ngày chốt số liệu thống kê.

---

## Questions to Consider (Câu hỏi định hướng)
1. *Chúng ta có nên biến phân tích rủi ro tờ khai (tỷ lệ Luồng Đỏ/Vàng vượt ngưỡng) thành một dải cảnh báo nghiệp vụ nổi bật trên cùng khi có biến động bất thường, thay vì chỉ là thẻ biểu đồ thụ động?*
2. *Liệu bản tóm tắt AI có nên được trình bày thành định dạng 'Phiếu Thông báo Điều hành' với các đề xuất hành động cụ thể, tải tức thì thay vì hiệu ứng gõ chữ hồi hộp?*
3. *Bảng Top Doanh nghiệp có nên bổ sung tính năng phân loại nhóm rủi ro tuân thủ (Doanh nghiệp ưu tiên / Tuân thủ tốt / Cần giám sát) để hỗ trợ nghiệp vụ sâu hơn?*
