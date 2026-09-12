---
name: VNACCS Intel - Customs Executive Dashboard
description: Bảng điều khiển thống kê tờ khai hải quan, cơ cấu thuế quan và giám sát rủi ro thương mại XNK theo chuẩn VNACCS/VCIS
colors:
  primary: "#2563eb"
  primary-deep: "#1d4ed8"
  primary-subtle: "#dbeafe"
  trend-line: "#4f46e5"
  commodity-cyan: "#0284c7"
  tax-special: "#7c3aed"
  tax-environmental: "#0d9488"
  tax-other: "#64748b"
  lane-green: "#10b981"
  lane-yellow: "#f59e0b"
  lane-red: "#ef4444"
  neutral-bg: "#f8fafc"
  neutral-dark-bg: "#020617"
  surface-card: "#ffffff"
  surface-dark-card: "#0f172a"
  border-hairline: "#e2e8f0"
  border-dark-hairline: "#1e293b"
  text-main: "#0f172a"
  text-dark-main: "#f8fafc"
  text-muted: "#64748b"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 900
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.05em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "12px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "14px"
  lg: "20px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "6px 12px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.primary-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.text-main}"
    rounded: "{rounded.md}"
    padding: "6px 10px"
    height: "32px"
  card-kpi:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-main}"
    rounded: "{rounded.xl}"
    padding: "14px 16px"
---

# Design System: VNACCS Intel - Customs Executive Dashboard

## Overview

**Creative North Star: "The Customs Command Bridge" (Trung tâm Chỉ huy Hải quan Số)**

VNACCS Intel được thiết kế như một trung tâm chỉ huy số liệu điều hành hải quan hiện đại, nơi hội tụ giữa chuẩn mực uy nghiêm của cơ quan công quyền nhà nước và sự linh hoạt, chuẩn xác của hệ thống công nghệ xử lý dữ liệu lớn thời gian thực. Giao diện từ chối mọi thủ pháp trang trí rườm rà, tập trung tuyệt đối vào tỷ lệ nén thông tin cao (Data-Dense Executive HUD), giúp các cấp Lãnh đạo Tổng cục, Cục trưởng và chuyên viên phân tích nghiệp vụ nắm bắt toàn cảnh dòng chảy xuất nhập khẩu quốc gia chỉ qua một ánh nhìn.

Hệ thống đặt trọng tâm vào tính kỷ luật thị giác: cấu trúc phân tầng rành mạch, số liệu tài chính và tờ khai được căn lề chuẩn xác, và bảng màu công vụ mang tính pháp lý cao. Mọi thành phần từ thẻ chỉ số KPI, biểu đồ kết hợp kim ngạch - thuế thu, đồ thị phân bổ tỷ trọng đến bảng xếp hạng doanh nghiệp đều được tối ưu hóa cho màn hình làm việc trung tâm cũng như sẵn sàng xuất bản in ấn định dạng vector A4 chuẩn mực.

**Key Characteristics:**
- **Mật độ dữ liệu cao (Data-Dense HUD):** Sử dụng phông chữ cô đọng, lưới micro-grid và căn chỉnh số liệu dạng `tabular-nums` để tối đa hóa lượng thông tin hữu ích trên mỗi viewport mà không gây quá tải nhận thức.
- **Tính chuẩn mực công quyền (Statutory Rigor):** Màu sắc và nhãn danh pháp tuân thủ nghiêm ngặt Luật Hải quan số 54/2014/QH13 và hệ thống thuật ngữ ngành Hải quan Việt Nam.
- **Lưỡng phân sắc thái hoàn hảo (High-Contrast Dark/Light):** Hoạt động liền mạch ở cả chế độ làm việc ban ngày (Light Slate) lẫn phòng trực ca đêm (Deep Midnight Dark mode).
- **Phân lớp viền siêu mảnh (Hairline Layered Architecture):** Phân tách các khối module thông qua ranh giới viền 1px sắc nét và các lớp nền tông màu (Tonal Surfaces), loại bỏ hoàn toàn các vệt đổ bóng mờ ảo.

## Colors

Hệ màu **"Maritime Authority Palette"** được xây dựng trên nền tảng xanh cobalt hải quan kết hợp các sắc độ công vụ bổ trợ và bộ 3 màu luật định phân luồng thông quan.

### Primary
- **Customs Cobalt Blue** (`#2563EB` / `oklch(0.58 0.23 255)`): Màu sắc định danh nòng cốt của hệ thống, đại diện cho hoạt động chỉ huy, nút tác vụ chính, đường kim ngạch ngoại thương USD và các tương tác điều hướng đang chọn.
- **Maritime Navy Deep** (`#1D4ED8` / `oklch(0.50 0.22 255)`): Trạng thái hover và viền nhấn của các phần tử tác vụ cấp cao.
- **Customs Tint Subtle** (`#DBEAFE` / `oklch(0.93 0.04 255)`): Nền viền mềm cho icon container và thẻ thông báo trạng thái luồng xanh.

### Secondary
- **Fiscal Indigo** (`#4F46E5` / `oklch(0.51 0.24 275)`): Đại diện cho dòng tiền thuế thu nộp ngân sách Nhà nước (VND) trên biểu đồ xu hướng và các chỉ số tài khóa.
- **Cargo Cyan** (`#0284C7` / `oklch(0.59 0.16 230)`): Sử dụng cho khối lượng và trị giá các nhóm hàng hóa trọng điểm, tránh xung đột thị giác với màu luồng tờ khai.

### Tertiary
- **Excise Violet** (`#7C3AED` / `oklch(0.55 0.25 295)`): Đại diện cho Thuế Tiêu thụ đặc biệt (TTĐB).
- **Eco Teal** (`#0D9488` / `oklch(0.59 0.14 185)`): Đại diện cho Thuế Bảo vệ môi trường (BVMT) và phân hệ thông số container logistics.
- **Statutory Slate** (`#64748B` / `oklch(0.58 0.03 245)`): Đại diện cho các khoản sắc thuế vãng lai và phụ thu khác.

### Neutral
- **Deep Midnight Background** (`#020617` / `oklch(0.12 0.02 260)`): Bề mặt nền chính ở chế độ Dark Mode, mang lại chiều sâu tối thượng cho trung tâm giám sát.
- **Clean Slate Background** (`#F8FAFC` / `oklch(0.98 0.005 245)`): Bề mặt nền trang nhã ở chế độ Light Mode.
- **Card Surface Light** (`#FFFFFF` / `oklch(1 0 0)`): Bề mặt thẻ KPI, bảng biểu ở chế độ sáng.
- **Card Surface Dark** (`#0F172A` / `oklch(0.20 0.03 260)`): Bề mặt thẻ KPI, bảng biểu ở chế độ tối.
- **Hairline Border Light** (`#E2E8F0` / `oklch(0.92 0.01 245)`): Đường viền phân cách siêu mảnh 1px cho ban ngày.
- **Hairline Border Dark** (`#1E293B` / `oklch(0.27 0.03 260)`): Đường viền phân cách siêu mảnh 1px cho ban đêm.
- **Text Main** (`#0F172A`): Màu văn bản cấp 1 cho giao diện sáng.
- **Text Dark Main** (`#F8FAFC`): Màu văn bản cấp 1 cho giao diện tối.
- **Text Muted** (`#64748B`): Màu văn bản phụ trợ, nhãn mô tả và đơn vị tiền tệ.

### Named Rules
**The Statutory Lane Invariance Rule.** Ba màu phân luồng thông quan hải quan là bất biến theo luật định: Luồng Xanh (`#10B981` - Miễn kiểm tra), Luồng Vàng (`#F59E0B` - Kiểm tra hồ sơ) và Luồng Đỏ (`#EF4444` - Kiểm tra thực tế). Tuyệt đối không hoán đổi, biến tấu sắc độ hay sử dụng 3 màu này cho các mục đích trang trí khác để tránh gây hiểu nhầm về mức độ rủi ro nghiệp vụ.

**The Currency Color Binding Rule.** Kim ngạch ngoại tệ (USD) luôn gắn liền với hệ sắc Xanh Hải quan (`#2563EB`). Tiền thu ngân sách thuế quan (VND) luôn gắn liền với hệ sắc Tím than Indigo (`#4F46E5`). Sự nhất quán này phải được bảo toàn xuyên suốt từ thẻ KPI, đồ thị cho tới bảng dữ liệu chi tiết.

## Typography

Hệ thống sử dụng bộ phông hình học hiện đại **Inter** cho toàn bộ tiêu đề, nhãn và văn bản điều hành, kết hợp với **Geist Mono** cho các chuỗi mã số thuế, số tờ khai và số liệu thống kê.

**Display Font:** Inter (`var(--font-inter)`, system-ui, -apple-system, sans-serif)
**Body Font:** Inter (`var(--font-inter)`, system-ui, -apple-system, sans-serif)
**Label/Mono Font:** Geist Mono (`var(--font-mono)`, monospace)

**Character:** Nghiêm túc, hiện đại, tối ưu hóa khả năng đọc lướt trên màn hình độ phân giải cao và hiển thị sắc nét khi in ấn văn bản khổ A4.

### Hierarchy
- **Display** (Weight: 900, Size: `1.5rem` / 24px - 28px, Line-height: 1.2, Tracking: `-0.025em`): Tiêu đề đầu mối cấp cao của trang điều hành và tiêu đề in ấn báo cáo PDF.
- **Headline** (Weight: 900, Size: `1.5rem` / 24px, Line-height: 1.15, Tracking: `-0.02em`): Số đo tài chính trung tâm trên các thẻ chỉ số KPI (kết hợp `tabular-nums`).
- **Title** (Weight: 700, Size: `0.875rem` / 14px, Line-height: 1.25): Tiêu đề của các Card module, tiêu đề đồ thị và tên phân mục dữ liệu.
- **Body** (Weight: 400 - 500, Size: `0.75rem` / 12px, Line-height: 1.5): Nội dung diễn giải, văn bản phân tích AI, thông tin dòng hàng và bảng dữ liệu.
- **Label** (Weight: 700, Size: `0.6875rem` / 11px, Tracking: `0.05em`, Uppercase): Nhãn phân loại chỉ số, thẻ trạng thái, tiêu đề cột bảng dữ liệu và mã luật định.

### Named Rules
**The Tabular Number Integrity Rule.** Tất cả mọi con số biểu thị tiền tệ (USD, VND), số lượng tờ khai, sản lượng container (TEU) và tỷ lệ phần trăm (%) bắt buộc phải bật thuộc tính `font-variant-numeric: tabular-nums`. Các chữ số phải có độ rộng cố định để bảo đảm căn thẳng hàng dọc hoàn hảo trong các bảng dữ liệu so sánh.

**The Label Subtlety Rule.** Các nhãn mô tả siêu nhỏ (10px - 11px) luôn áp dụng `uppercase`, `font-bold` và tăng `letter-spacing` (tracking-wider), đi kèm màu `text-muted` để tạo độ tương phản thứ bậc rõ ràng với số liệu chính mà không làm phân tâm mắt người đọc.

## Layout

Hệ thống áp dụng mô hình bố cục điều hành **Sidebar + Executive HUD Canvas** linh hoạt:

- **Khung nhìn tổng thể:** Chiều rộng giới hạn tối đa `max-w-[1600px]` căn giữa để giữ tầm mắt tập trung trên màn hình siêu rộng (Ultrawide).
- **Thanh điều hướng Sidebar (Sticky Left HUD):** Chiều rộng cố định 256px (`w-64`), bám dính đỉnh màn hình (`sticky top-0 h-screen`), tích hợp huy hiệu nhận diện VNACCS/VCIS, menu phím tắt và chỉ báo trạng thái kết nối SQL Server Live thời gian thực.
- **Lưới chỉ số KPI hàng đầu (Overview Grid):** Cấu trúc 4 cột cân bằng (`grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4`), tối ưu hóa hiển thị thẻ chỉ số trên cả máy tính bảng và màn hình lớn.
- **Lưới phân tích chuyên sâu 12 cột (Analytical Grid):**
  - Hàng 1: Đồ thị xu hướng chuỗi thời gian (8 cột) kết hợp biểu đồ cơ cấu thuế (4 cột).
  - Hàng 2: Nhóm hàng hóa trọng điểm (7 cột) kết hợp phân luồng kiểm soát rủi ro (5 cột).
- **Khu vực Báo cáo AI & Bảng Doanh nghiệp:** Chiếm toàn bộ 12 cột với khả năng cuộn độc lập và bung mở chi tiết hồ sơ ngay tại chỗ (In-situ Expansion).
- **Print Layout:** Bố cục tự động chuyển sang chế độ in chuẩn A4 (`size: A4; margin: 12mm 15mm;`), ẩn toàn bộ thanh công cụ, nút bấm và sidebar, hiển thị tiêu đề báo cáo nghiệp vụ chính thức.

## Elevation & Depth

Hệ thống tuân thủ triệt để nguyên lý **Phân lớp viền siêu mảnh (Hairline Layered Architecture)**. 

Bề mặt phẳng là trạng thái nghỉ tự nhiên. Độ sâu của không gian không được tạo ra từ những vệt đổ bóng mờ ảo làm đục số liệu, mà được kiến tạo thông qua sự tương phản có tính toán giữa các sắc độ xám đá (Slate-50 / Slate-100 / Slate-900 / Slate-950) cùng các đường viền hairline 1px sắc bén.

### Shadow Vocabulary
- **Subtle Surface Hairline** (`ring-1 ring-foreground/10` hoặc `border border-slate-200/80` / `dark:border-slate-800/80`): Xác lập ranh giới vật lý sắc nét cho các thẻ KPI, bảng biểu và modal.
- **Micro Hover Accent** (`shadow-xs` / `shadow-2xs`): Đổ bóng cực nhẹ (độ sâu 1-2px) xuất hiện duy nhất khi di chuột qua các nút tác vụ hoặc thẻ tương tác để cung cấp phản hồi xúc giác tinh tế.
- **Dropdown & Tooltip Float** (`box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1)`): Sử dụng riêng cho bảng chú giải Recharts Tooltip và danh sách phím tắt để tách biệt khỏi mặt phẳng dữ liệu bên dưới.

### Named Rules
**The No-Fuzzy-Shadow Rule.** Cấm tuyệt đối việc áp dụng các lớp `shadow-lg`, `shadow-xl` hoặc `shadow-2xl` mờ rộng trên các thành phần hiển thị số liệu. Độ sâu trong giao diện nghiệp vụ phải sạch, gọn và dứt khoát.

## Shapes

Ngôn ngữ hình khối được định hình theo phong cách **Compact Precision (Sắc gọn chuẩn mực)**:

- **Bán kính bo góc cơ sở:** `--radius: 0.625rem` (10px).
- **Thẻ KPI & Khối nội dung chính (Cards):** Bo góc `rounded-xl` (12px), tạo sự hòa nhã nhưng vẫn giữ vững cấu trúc lưới chuyên nghiệp.
- **Nút bấm & Ô nhập liệu (Buttons & Inputs):** Bo góc `rounded-lg` (8px) cho kích thước tiêu chuẩn và `rounded-[min(var(--radius-md),10px)]` (6px) cho kích thước nhỏ (xs/sm).
- **Huy hiệu & Nhãn luồng (Badges & Chips):** Bo tròn hoàn toàn `rounded-full` hoặc `rounded-md` (6px), tạo hình khối viên thuốc cô đọng.
- **Đầu thanh biểu đồ cột (Bar Chart Radius):** Bo tròn góc ngoài `radius={[0, 5, 5, 0]}` cho thanh ngang, giữ góc phẳng ở trục số liệu.

## Components

### Buttons
- **Shape:** Bo góc vừa phải (8px / `rounded-lg` hoặc 6px cho `size="sm"` / `size="xs"`).
- **Primary:** Nền xanh Hải quan (`#2563EB`), chữ trắng, padding `h-8 px-2.5` hoặc `h-7 px-2.5`, chữ `text-xs font-semibold`. Khi hover chuyển sang Navy Deep (`#1D4ED8`), active dịch chuyển vi mô `active:scale-95`.
- **Outline:** Nền trong suốt hoặc nền card, viền hairline (`border-slate-300 dark:border-slate-700`), chữ màu văn bản chính. Hover tạo nền `bg-slate-100 dark:bg-slate-800`.
- **Icon Buttons:** Kích thước `size-7` hoặc `size-8`, căn giữa hoàn hảo, hỗ trợ phím tắt và tooltip tương ứng.

### Cards / Containers
- **Corner Style:** Bo góc `rounded-xl` (12px).
- **Background:** Trắng tinh (`#FFFFFF`) trên nền sáng, xám phiến đậm (`#0F172A` với độ mờ 90%) trên nền tối.
- **Border:** Viền hairline 1px đồng nhất (`border-slate-200/80 dark:border-slate-800/80`).
- **Internal Padding:** `--card-spacing: 16px` cho card tiêu chuẩn; `12px` cho card cỡ nhỏ.

### Chips & Statutory Badges
- **Luồng Xanh (Green Lane):** Nền xanh lá nhạt (`bg-emerald-50 dark:bg-emerald-950/60`), chữ và viền xanh ngọc (`text-emerald-700 dark:text-emerald-300 border-emerald-300/60`).
- **Luồng Vàng (Yellow Lane):** Nền hổ phách nhạt (`bg-amber-50 dark:bg-amber-950/60`), chữ và viền vàng đậm (`text-amber-700 dark:text-amber-300 border-amber-300/60`).
- **Luồng Đỏ (Red Lane):** Nền đỏ hồng nhạt (`bg-rose-50 dark:bg-rose-950/60`), chữ và viền đỏ tươi (`text-rose-700 dark:text-rose-300 border-rose-300/60`).
- **Doanh nghiệp Ưu tiên (AEO):** Huy hiệu đặc thù đính kèm biểu tượng khiên bảo mật (`ShieldCheck`), biểu thị cấp tuân thủ cao nhất của Tổng cục Hải quan.

### Inputs / Search Fields
- **Style:** Nền `bg-slate-100 dark:bg-slate-800/80`, viền `border-slate-200 dark:border-slate-700`, bo góc 8px, chữ `text-xs`.
- **Focus:** Vòng bao nét đơn 2px xanh hải quan (`outline-2 outline-blue-600 outline-offset-2`).
- **Affordance:** Tích hợp phím tắt tìm kiếm nhanh `/` bên trong ô và nút xóa nhanh `X` khi có dữ liệu.

### Navigation
- **Sidebar Nav:** Các nút điều hướng phẳng, bo góc 8px, chuyển trạng thái mượt mà. Khi kích hoạt hiển thị nền xanh cobalt rực rỡ chữ trắng cùng độ đậm `font-semibold`.
- **Mobile Quick Pills:** Dải tab con nhộng trượt ngang mềm mại (`rounded-full px-3 py-1.5`) cho màn hình cảm ứng dưới 1024px.

### Tables / Data Grids
- **Header:** Dính đỉnh (`sticky top-0 z-10`), chữ in hoa cỡ nhỏ (`text-[10px] font-bold tracking-wider`), màu xám nhạt với hiệu ứng mờ nền (`backdrop-blur-xs`).
- **Rows:** Chiều cao compact `py-3 px-4`, phân tách bằng đường kẻ hairline mảnh, hiệu ứng hover nhẹ `hover:bg-blue-50/30 dark:hover:bg-slate-800/40`.
- **Actions:** Tích hợp tính năng sao chép mã số thuế 1-chạm kèm micro-feedback "Đã chép" màu xanh ngọc.

### Signature Component: Enterprise In-Situ Dossier & Sparkline
- **Trích lục Hồ sơ Doanh nghiệp tại chỗ:** Khi nhấp chuột vào bất kỳ hàng doanh nghiệp nào, một thẻ hồ sơ chi tiết (Dossier) mở ra ngay bên dưới hàng với hiệu ứng chuyển cảnh View Transition mượt mà.
- **Biểu đồ Sparkline 6 tháng:** Đồ thị đường cong SVG tích hợp gradient xanh cobalt hiển thị xu hướng tăng trưởng kim ngạch thực tế của doanh nghiệp qua 6 tháng mà không làm xáo trộn bố cục bảng.

## Do's and Don'ts

### Do:
- **Do** luôn định dạng số liệu tài chính và số lượng bằng `font-variant-numeric: tabular-nums` và căn lề phải đối với các cột số liệu tiền tệ.
- **Do** giữ vững 3 màu phân luồng thông quan hải quan (Xanh: `#10B981`, Vàng: `#F59E0B`, Đỏ: `#EF4444`) theo đúng tiêu chuẩn pháp lý tại Điều 32 Luật Hải quan.
- **Do** phân biệt rõ ràng màu sắc giữa Kim ngạch ngoại thương USD (`#2563EB`) và Thuế thu ngân sách VND (`#4F46E5`).
- **Do** cung cấp phản hồi xúc giác tức thì (Micro-feedback) trong vòng 1.5s - 2s khi người dùng sao chép mã số thuế hoặc sao chép báo cáo AI.
- **Do** hỗ trợ đầy đủ phím tắt bàn phím (`/` tìm kiếm, `D` đổi theme, `P` xuất in, `?` mở trợ giúp phím tắt) cho cán bộ phân tích thao tác nhanh.

### Don't:
- **Don't** sử dụng màu xanh lá cây hoặc màu đỏ cho các thành phần biểu đồ thông thường không thuộc về phân luồng tờ khai để tránh gây hiểu nhầm về mức độ rủi ro nghiệp vụ.
- **Don't** sử dụng đổ bóng lớn khuếch tán (`shadow-xl`, `shadow-2xl`) làm mờ và đục các vùng hiển thị số liệu dày đặc.
- **Don't** chèn các khoảng đệm thừa thãi (padding quá lớn) làm giảm mật độ hiển thị dữ liệu điều hành trên mỗi màn hình.
- **Don't** làm mất số 0 đầu tiên của Mã số thuế doanh nghiệp khi xuất dữ liệu ra file Excel/CSV.
- **Don't** phá vỡ cấu trúc in ấn chuẩn vector A4 bằng cách sử dụng các thư viện chụp canvas dễ vỡ phông chữ tiếng Việt.
