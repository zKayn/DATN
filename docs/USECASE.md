# Biểu đồ Use Case - Hệ thống LP Shop

## Tổng quan

Hệ thống LP Shop là một nền tảng thương mại điện tử với 3 actors chính:
- **Khách vãng lai (Guest)**: Người dùng chưa đăng nhập
- **Khách hàng (Customer)**: Người dùng đã đăng ký và đăng nhập
- **Quản trị viên (Admin)**: Người quản lý hệ thống

## Các Actors

### 1. Khách vãng lai (Guest)
Người dùng truy cập hệ thống mà chưa đăng nhập. Có thể:
- Xem sản phẩm
- Tìm kiếm và lọc sản phẩm
- Xem Flash Sale
- Đăng ký/Đăng nhập

### 2. Khách hàng (Customer)
Người dùng đã đăng ký tài khoản và đăng nhập. Kế thừa tất cả quyền của Guest và thêm:
- Quản lý giỏ hàng
- Đặt hàng và thanh toán
- Quản lý đơn hàng
- Đánh giá sản phẩm
- Quản lý tài khoản cá nhân
- Xem thông báo real-time

### 3. Quản trị viên (Admin)
Người quản lý toàn bộ hệ thống:
- Quản lý sản phẩm, danh mục
- Quản lý đơn hàng, cập nhật trạng thái
- Quản lý người dùng
- Xem thống kê, báo cáo
- Gửi thông báo

---

## Chi tiết Use Cases

### A. Chức năng công khai (Guest)

#### UC1: Xem danh sách sản phẩm
**Mô tả**: Hiển thị danh sách sản phẩm với phân trang
**Actor**: Guest, Customer
**Luồng chính**:
1. Hệ thống hiển thị danh sách sản phẩm
2. Người dùng cuộn để xem thêm sản phẩm
3. Hệ thống tải thêm sản phẩm (infinite scroll/pagination)

#### UC2: Xem chi tiết sản phẩm
**Mô tả**: Xem thông tin chi tiết của 1 sản phẩm
**Actor**: Guest, Customer
**Luồng chính**:
1. Người dùng chọn 1 sản phẩm
2. Hệ thống hiển thị: hình ảnh, giá, mô tả, đánh giá
3. [Extend] Người dùng có thể thêm vào yêu thích
4. [Extend] Người dùng có thể xem/viết đánh giá

#### UC3: Tìm kiếm sản phẩm
**Mô tả**: Tìm kiếm sản phẩm theo từ khóa
**Actor**: Guest, Customer
**Luồng chính**:
1. Người dùng nhập từ khóa tìm kiếm
2. Hệ thống hiển thị kết quả phù hợp
3. Người dùng có thể lọc, sắp xếp kết quả

#### UC4: Lọc sản phẩm theo danh mục
**Mô tả**: Lọc sản phẩm theo danh mục, giá, thương hiệu
**Actor**: Guest, Customer
**Luồng chính**:
1. Người dùng chọn bộ lọc (danh mục, giá, rating)
2. Hệ thống hiển thị sản phẩm phù hợp

#### UC5: Xem Flash Sale
**Mô tả**: Xem sản phẩm đang trong chương trình Flash Sale
**Actor**: Guest, Customer
**Luồng chính**:
1. Hệ thống hiển thị sản phẩm Flash Sale với đếm ngược thời gian
2. Hiển thị số lượng đã bán/còn lại

#### UC6: Đăng ký tài khoản
**Mô tả**: Tạo tài khoản mới
**Actor**: Guest
**Luồng chính**:
1. Guest nhập thông tin: email, mật khẩu, họ tên, SĐT
2. Hệ thống xác thực thông tin
3. Tạo tài khoản thành công

#### UC7: Đăng nhập
**Mô tả**: Đăng nhập vào hệ thống
**Actor**: Guest, Admin
**Luồng chính**:
1. Người dùng nhập email và mật khẩu
2. Hệ thống xác thực
3. Chuyển hướng đến trang tương ứng (Customer/Admin)

---

### B. Chức năng khách hàng (Customer)

#### UC8: Thêm vào giỏ hàng
**Mô tả**: Thêm sản phẩm vào giỏ hàng
**Actor**: Customer
**Luồng chính**:
1. Customer chọn sản phẩm và số lượng
2. Nhấn "Thêm vào giỏ hàng"
3. Hệ thống cập nhật giỏ hàng

#### UC9: Quản lý giỏ hàng
**Mô tả**: Xem, cập nhật, xóa sản phẩm trong giỏ
**Actor**: Customer
**Luồng chính**:
1. Customer mở giỏ hàng
2. Có thể: tăng/giảm số lượng, xóa sản phẩm
3. Xem tổng tiền

#### UC10: Đặt hàng
**Mô tả**: Tạo đơn hàng mới
**Actor**: Customer
**Luồng chính**:
1. Customer chọn sản phẩm trong giỏ hàng
2. [Include] Chọn/Nhập địa chỉ giao hàng (UC17)
3. Chọn phương thức vận chuyển
4. [Include] Chọn phương thức thanh toán (UC11)
5. Xác nhận đặt hàng
6. Hệ thống tạo đơn hàng và gửi thông báo

#### UC11: Thanh toán
**Mô tả**: Thanh toán đơn hàng
**Actor**: Customer
**Luồng chính**:
1. Chọn phương thức: COD/Chuyển khoản/Ví điện tử
2. Nhập thông tin thanh toán (nếu cần)
3. Xác nhận thanh toán
4. Hệ thống xử lý và cập nhật trạng thái

#### UC12: Xem lịch sử đơn hàng
**Mô tả**: Xem danh sách các đơn hàng đã đặt
**Actor**: Customer
**Luồng chính**:
1. Customer vào trang "Đơn hàng của tôi"
2. Hệ thống hiển thị danh sách đơn hàng với trạng thái
3. **Real-time update**: Tự động cập nhật mỗi 10 giây

#### UC13: Xem chi tiết đơn hàng
**Mô tả**: Xem thông tin chi tiết 1 đơn hàng
**Actor**: Customer
**Luồng chính**:
1. Customer chọn 1 đơn hàng
2. Hệ thống hiển thị: sản phẩm, giá, địa chỉ, trạng thái, lịch sử

#### UC14: Hủy đơn hàng
**Mô tả**: Hủy đơn hàng đang chờ xác nhận
**Actor**: Customer
**Luồng chính**:
1. Customer chọn đơn hàng cần hủy
2. Nhập lý do hủy
3. Xác nhận hủy
4. Hệ thống cập nhật trạng thái

#### UC15: Đánh giá sản phẩm
**Mô tả**: Viết đánh giá cho sản phẩm đã mua
**Actor**: Customer
**Tiền điều kiện**: Đã mua sản phẩm
**Luồng chính**:
1. Customer chọn sản phẩm đã mua
2. Chọn số sao (1-5)
3. Viết nội dung đánh giá
4. Upload hình ảnh (optional)
5. Gửi đánh giá

#### UC16: Xem/Quản lý yêu thích
**Mô tả**: Thêm/Xóa sản phẩm yêu thích
**Actor**: Customer
**Luồng chính**:
1. Customer thêm sản phẩm vào danh sách yêu thích
2. Xem danh sách sản phẩm yêu thích
3. Có thể xóa khỏi danh sách

#### UC17: Quản lý địa chỉ giao hàng
**Mô tả**: Thêm, sửa, xóa địa chỉ giao hàng
**Actor**: Customer
**Luồng chính**:
1. Customer vào quản lý địa chỉ
2. Có thể: thêm mới, sửa, xóa, đặt địa chỉ mặc định
3. Nhập: họ tên, SĐT, địa chỉ chi tiết, tỉnh/thành

#### UC18: Cập nhật thông tin cá nhân
**Mô tả**: Sửa thông tin tài khoản
**Actor**: Customer
**Luồng chính**:
1. Customer vào trang cá nhân
2. Cập nhật: họ tên, SĐT, avatar, email
3. Đổi mật khẩu (optional)
4. Lưu thay đổi

#### UC19: Xem thông báo
**Mô tả**: Xem thông báo về đơn hàng, khuyến mãi
**Actor**: Customer
**Luồng chính**:
1. Hệ thống gửi thông báo real-time
2. Customer xem danh sách thông báo
3. Đánh dấu đã đọc
4. **Real-time**: Polling mỗi 10 giây để cập nhật

#### UC20: Xem điểm tích lũy
**Mô tả**: Xem điểm thưởng và lịch sử tích lũy
**Actor**: Customer
**Luồng chính**:
1. Customer xem tổng điểm hiện có
2. Xem lịch sử tích/tiêu điểm
3. Xem ưu đãi dành cho thành viên

#### UC21: Đăng xuất
**Mô tả**: Thoát khỏi tài khoản
**Actor**: Customer, Admin
**Luồng chính**:
1. Customer chọn đăng xuất
2. Hệ thống xóa session
3. Chuyển về trang đăng nhập

---

### C. Chức năng quản trị (Admin)

#### UC22: Quản lý sản phẩm
**Mô tả**: CRUD sản phẩm
**Actor**: Admin
**Luồng chính**:
1. Admin có thể:
   - Thêm sản phẩm mới (tên, giá, hình ảnh, mô tả)
   - Sửa thông tin sản phẩm
   - Xóa sản phẩm
   - Cập nhật tồn kho
   - Đặt sản phẩm nổi bật/Flash Sale

#### UC23: Quản lý danh mục
**Mô tả**: CRUD danh mục sản phẩm
**Actor**: Admin
**Luồng chính**:
1. Admin có thể:
   - Thêm danh mục mới
   - Sửa tên danh mục
   - Xóa danh mục
   - Sắp xếp thứ tự hiển thị

#### UC24: Quản lý đơn hàng
**Mô tả**: Xem và quản lý tất cả đơn hàng
**Actor**: Admin
**Luồng chính**:
1. Admin xem danh sách đơn hàng
2. Lọc theo trạng thái, ngày, khách hàng
3. Xem chi tiết đơn hàng
4. [Include] Cập nhật trạng thái (UC25)

#### UC25: Cập nhật trạng thái đơn hàng
**Mô tả**: Thay đổi trạng thái đơn hàng
**Actor**: Admin
**Luồng chính**:
1. Admin chọn đơn hàng
2. Cập nhật trạng thái:
   - Chờ xác nhận → Đã xác nhận
   - Đang chuẩn bị → Đang giao
   - Đang giao → Đã giao
   - Hủy/Trả hàng
3. **Real-time**: Mobile-app tự động cập nhật sau 10 giây

#### UC26: Quản lý người dùng
**Mô tả**: CRUD người dùng
**Actor**: Admin
**Luồng chính**:
1. Admin xem danh sách người dùng
2. Có thể:
   - Xem thông tin chi tiết
   - Khóa/Mở khóa tài khoản
   - Phân quyền
   - Xem lịch sử mua hàng

#### UC27: Quản lý đánh giá
**Mô tả**: Duyệt, xóa đánh giá
**Actor**: Admin
**Luồng chính**:
1. Admin xem danh sách đánh giá
2. Có thể:
   - Duyệt/Ẩn đánh giá
   - Xóa đánh giá vi phạm
   - Trả lời đánh giá

#### UC28: Xem thống kê
**Mô tả**: Xem báo cáo, thống kê hệ thống
**Actor**: Admin
**Luồng chính**:
1. Admin xem dashboard với:
   - Doanh thu theo ngày/tháng/năm
   - Số đơn hàng mới
   - Sản phẩm bán chạy
   - Tồn kho
   - Số lượng khách hàng mới

#### UC29: Quản lý banner/khuyến mãi
**Mô tả**: Cấu hình banner, chương trình khuyến mãi
**Actor**: Admin
**Luồng chính**:
1. Admin thêm/sửa/xóa banner trang chủ
2. Tạo chương trình khuyến mãi:
   - Flash Sale
   - Giảm giá theo %
   - Mã giảm giá

#### UC30: Gửi thông báo
**Mô tả**: Gửi thông báo đến khách hàng
**Actor**: Admin
**Luồng chính**:
1. Admin soạn nội dung thông báo
2. Chọn đối tượng nhận (tất cả/nhóm/cá nhân)
3. Gửi thông báo
4. Hệ thống push notification real-time

#### UC31: Quản lý newsletter
**Mô tả**: Gửi email marketing
**Actor**: Admin
**Luồng chính**:
1. Admin tạo nội dung email
2. Chọn danh sách người nhận
3. Lên lịch/Gửi ngay
4. Theo dõi tỉ lệ mở email

---

## Mối quan hệ giữa các Use Case

### Include (Bao gồm - Bắt buộc)
- **UC10 (Đặt hàng) include UC11 (Thanh toán)**: Đặt hàng bắt buộc phải có bước thanh toán
- **UC10 (Đặt hàng) include UC17 (Quản lý địa chỉ)**: Đặt hàng cần chọn địa chỉ giao hàng
- **UC24 (Quản lý đơn hàng) include UC25 (Cập nhật trạng thái)**: Quản lý đơn hàng bao gồm cập nhật trạng thái

### Extend (Mở rộng - Tùy chọn)
- **UC2 (Xem chi tiết sản phẩm) extend UC15 (Đánh giá)**: Khi xem sản phẩm có thể viết đánh giá
- **UC2 (Xem chi tiết sản phẩm) extend UC16 (Yêu thích)**: Khi xem sản phẩm có thể thêm vào yêu thích
- **UC22 (Quản lý sản phẩm) extend UC23 (Quản lý danh mục)**: Khi quản lý sản phẩm có thể cần thêm danh mục mới

---

## Tính năng Real-time

### Polling (Cập nhật định kỳ - 10 giây)
1. **Thông báo**: Mobile-app tự động kiểm tra thông báo mới mỗi 10 giây
2. **Đơn hàng**: ProfileScreen tự động cập nhật danh sách đơn hàng mỗi 10 giây
3. **Luồng**:
   - Admin cập nhật trạng thái đơn hàng → Backend cập nhật DB
   - Mobile-app polling mỗi 10 giây → Lấy dữ liệu mới
   - UI tự động cập nhật trạng thái đơn hàng

---

## Màu sắc hệ thống (Festive Theme)

Toàn bộ hệ thống sử dụng bảng màu đỏ-xanh-vàng (Christmas/Tết):
- **Primary (Đỏ)**: #DC2626 - Nút chính, header, giá khuyến mãi
- **Secondary (Xanh lá)**: #16A34A - Trạng thái thành công, icon
- **Accent (Vàng)**: #F59E0B - Điểm nhấn, Flash Sale, khuyến mãi

---

## Tài liệu kỹ thuật

- **PlantUML Diagram**: `docs/usecase-diagram.puml`
- **Backend API**: `apps/backend/`
- **Admin Web**: `apps/admin-web/`
- **Customer Web**: `apps/customer-web/`
- **Mobile App**: `apps/mobile-app/`

---

**Ngày tạo**: 2025-12-24
**Hệ thống**: LP Shop - E-commerce Platform
