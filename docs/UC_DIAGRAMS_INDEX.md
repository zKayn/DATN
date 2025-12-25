# Use Case Diagrams - LP Shop

Tài liệu này liệt kê tất cả các biểu đồ use case chi tiết đã được tạo.

---

## 📋 Tổng quan

- **Tổng số Use Cases**: 31
- **Activity Diagrams**: 7 use cases quan trọng
- **Sequence Diagrams**: 6 luồng chính
- **Format**: PlantUML (.puml) và Mermaid (.mmd)

---

## 📁 Files

### 1. Use Case Diagram Tổng quát
- **File PlantUML**: `usecase-diagram.puml`
- **File Mermaid**: `usecase-diagram.mmd` (horizontal layout)
- **Nội dung**: Tất cả 31 use cases với relationships

### 2. Activity Diagrams (Chi tiết luồng xử lý)
- **File**: `activity-diagrams.puml`
- **Format**: PlantUML
- **Xem bằng**: PlantUML extension trong VS Code

### 3. Sequence Diagrams (Tương tác giữa components)
- **File**: `sequence-diagrams.mmd`
- **Format**: Mermaid
- **Xem bằng**: Mermaid Preview trong VS Code

---

## 📊 Activity Diagrams Chi Tiết

### UC6: Đăng ký tài khoản
**Luồng**:
1. Guest nhập thông tin (email, password, hoTen, SĐT)
2. Validate email unique
3. Validate password >= 6 ký tự
4. Validate SĐT hợp lệ
5. Mã hóa password (bcrypt)
6. Tạo user trong DB với:
   - vaiTro = "khach-hang"
   - trangThai = "hoat-dong"
   - diemTichLuy = 0
7. Tạo JWT token
8. Redirect to Homepage

**Các nhánh**:
- ❌ Email đã tồn tại → Lỗi
- ❌ Password quá ngắn → Lỗi
- ❌ SĐT không hợp lệ → Lỗi
- ✅ Thành công → Homepage

---

### UC7: Đăng nhập
**Luồng**:
1. User nhập email, password
2. Kiểm tra email tồn tại
3. Kiểm tra tài khoản không bị khóa
4. So sánh password (bcrypt.compare)
5. Tạo JWT token
6. Lưu token vào localStorage/AsyncStorage
7. Redirect theo vaiTro:
   - `quan-tri` → Admin Dashboard
   - `khach-hang` → Customer Homepage

**Các nhánh**:
- ❌ Email không tồn tại → Lỗi
- ❌ Tài khoản bị khóa → Lỗi
- ❌ Sai mật khẩu → Lỗi
- ✅ Thành công → Redirect theo role

---

### UC10: Đặt hàng (Phức tạp nhất)
**Luồng chính**:
1. Customer xem giỏ hàng
2. **UC17 (Include)**: Chọn/Nhập địa chỉ giao hàng
   - Sử dụng địa chỉ mặc định
   - Hoặc chọn địa chỉ từ danh sách
   - Hoặc thêm địa chỉ mới
3. Chọn phương thức vận chuyển
4. Tính phí vận chuyển
5. **(Optional)** Áp dụng voucher:
   - Nhập mã voucher
   - Kiểm tra hợp lệ
   - Áp dụng giảm giá
   - Tăng `daSuDung` voucher
6. **(Optional)** Sử dụng điểm tích lũy:
   - Chọn số điểm
   - Tính giảm giá từ điểm
   - Trừ điểm tạm thời
7. Tính tổng thanh toán:
   ```
   tongThanhToan = tongTien + phiVanChuyen - giamGia - giamGiaTuDiem
   ```
8. **UC11 (Include)**: Thanh toán
   - Chọn phương thức (COD/VNPay/MoMo/ATM)
   - Nếu online → Redirect to payment gateway
   - Nếu thất bại → Hủy đơn, hoàn điểm
9. Tạo Order trong DB:
   - Auto-generate `maDonHang`
   - Snapshot sản phẩm vào `sanPham[]` (embedded)
   - `trangThaiDonHang` = "cho-xac-nhan"
10. Trừ tồn kho sản phẩm
11. Xóa giỏ hàng
12. Nếu dùng điểm → Tạo PointTransaction (loai = "tru")
13. Nếu thanh toán thành công → Cộng điểm (1% tongTien)
14. Tạo Notification cho Customer
15. Gửi email xác nhận
16. Redirect to "Đặt hàng thành công"

**Các nhánh phụ**:
- Giỏ hàng trống → Stop
- Voucher không hợp lệ → Hiển thị lỗi
- Thanh toán online thất bại → Hủy đơn

---

### UC15: Đánh giá sản phẩm
**Tiền điều kiện**: Đơn hàng có trạng thái "da-giao"

**Luồng**:
1. Customer vào "Đơn hàng của tôi"
2. Chọn đơn đã giao
3. Chọn sản phẩm muốn đánh giá
4. Kiểm tra unique constraint: `(sanPham, nguoiDung, donHang)`
5. Nếu đã đánh giá → Stop với thông báo
6. Mở form đánh giá:
   - Chọn số sao (1-5)
   - Nhập tiêu đề
   - Nhập nội dung
   - **(Optional)** Upload hình ảnh → Cloudinary
7. Tạo Review trong DB:
   - `trangThai` = "cho-duyet"
8. Cập nhật Product:
   - `soLuongDanhGia` += 1
   - `danhGiaTrungBinh` = average of all reviews
9. Tạo Notification cho Admin (loai = "danh-gia-moi")
10. Hiển thị "Gửi đánh giá thành công"

**Business Rules**:
- 1 user chỉ được đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng
- Composite unique index trên (sanPham, nguoiDung, donHang)

---

### UC25: Cập nhật trạng thái đơn hàng + Real-time sync
**Actor**: Admin

**Luồng chính**:
1. Admin vào "Quản lý đơn hàng"
2. Chọn đơn hàng
3. Chọn trạng thái mới:
   - cho-xac-nhan → da-xac-nhan
   - da-xac-nhan → dang-chuan-bi
   - dang-chuan-bi → dang-giao
   - dang-giao → da-giao
   - → da-huy
   - → tra-hang
4. Validate trạng thái hợp lệ
5. Nếu **hủy đơn**:
   - Nhập lý do hủy
   - Hoàn số lượng tồn kho
   - Nếu đã thanh toán online → Yêu cầu hoàn tiền
   - Nếu đã dùng điểm → Hoàn điểm
6. Backend:
   - Cập nhật `trangThaiDonHang`
   - Thêm vào `lichSuTrangThai[]`
   - Nếu "da-giao" → Cập nhật `giaoThanhCongLuc`, tăng `Product.daBan`
7. Tạo Notification cho Customer:
   - `loai` = "don-hang-" + trangThai
   - `tieuDe` = "Đơn hàng #maDonHang"
8. **Real-time sync to Mobile**:
   - ProfileScreen polling mỗi 10s: `api.getOrders()`
   - Nếu trạng thái thay đổi → Update UI tự động
   - NotificationContext polling mỗi 10s: `api.getNotifications()`
   - Update badge thông báo

**Tính năng Real-time**:
```javascript
// ProfileScreen.tsx
useEffect(() => {
  if (!isAuthenticated) return;

  const interval = setInterval(() => {
    loadOrders(); // Gọi API mỗi 10s
  }, 10000);

  return () => clearInterval(interval);
}, [isAuthenticated]);
```

---

### UC8-UC9-UC10: Luồng mua hàng đầy đủ
**Tổng quan**: Từ thêm vào giỏ → Quản lý giỏ → Đặt hàng

**Partition 1: UC8 - Thêm vào giỏ hàng**
1. Xem chi tiết sản phẩm
2. Chọn size/màu sắc
3. Chọn số lượng
4. Kiểm tra tồn kho
5. Nếu đủ hàng → Thêm vào Cart Collection
6. Update badge giỏ hàng

**Partition 2: UC9 - Quản lý giỏ hàng**
1. Mở giỏ hàng
2. Loop:
   - Tăng/Giảm số lượng
   - Hoặc xóa sản phẩm
   - Cập nhật giỏ hàng
   - Tính lại tổng tiền

**Partition 3: UC10 - Đặt hàng**
- Xem chi tiết ở UC10 diagram riêng

---

### UC22: Quản lý sản phẩm (Admin CRUD)
**Các thao tác**:

**1. Thêm sản phẩm mới**:
- Nhập thông tin đầy đủ
- Upload hình ảnh → Cloudinary
- Tạo slug tự động từ tên
- Đánh dấu noiBat/sanPhamMoi/Flash Sale
- Lưu vào DB

**2. Sửa sản phẩm**:
- Load dữ liệu hiện tại
- Cập nhật thông tin
- Nếu thay đổi hình → Xóa hình cũ từ Cloudinary
- Nếu thay đổi tên → Tạo lại slug

**3. Xóa sản phẩm**:
- Kiểm tra sản phẩm trong đơn hàng
- Nếu có trong đơn hàng → **Soft delete** (trangThai = "inactive")
- Nếu không → **Hard delete** + xóa hình từ Cloudinary

**4. Cập nhật tồn kho**:
- Nhập số lượng mới
- Cập nhật `soLuongTonKho`

---

## 🔄 Sequence Diagrams Chi Tiết

### 1. UC7: Đăng nhập
**Participants**:
- User (Actor)
- Login Form (UI)
- Auth API (Backend)
- Database
- JWT Service

**Luồng tương tác**:
```
User → UI: Nhập email & password
UI → API: POST /auth/login
API → DB: Tìm user theo email
DB → API: User data
API → API: bcrypt.compare()
API → JWT: Tạo token
JWT → API: token
API → UI: {user, token}
UI → UI: Lưu token, update context
UI → User: Redirect to Homepage/Dashboard
```

**Alt flows**:
- Email không tồn tại → 404 Error
- Tài khoản bị khóa → 403 Error
- Sai mật khẩu → 401 Error

---

### 2. UC10: Đặt hàng
**Participants**:
- Customer
- Checkout Page (UI)
- Cart Service
- Order API
- Product Service
- Voucher Service
- Payment Gateway
- Notification Service
- Database

**Luồng chính**:
```
Customer → UI: Xem giỏ hàng
UI → Cart: Lấy sản phẩm
Cart → UI: Danh sách sản phẩm
Customer → UI: Đặt hàng
UI → Voucher: Validate voucher (optional)
UI → Order: POST /orders/create
Order → Product: Kiểm tra tồn kho
Order → Payment: Tạo link thanh toán (if online)
Payment → Order: Payment callback
Order → DB: Tạo Order
Order → Product: Trừ tồn kho
Order → Cart: Xóa giỏ hàng
Order → Notif: Tạo thông báo
Order → UI: Order created
UI → Customer: Hiển thị thành công
```

---

### 3. UC15: Đánh giá sản phẩm
**Participants**:
- Customer
- Order Detail Page
- Review API
- Cloudinary (Upload)
- Product Service
- Notification Service
- Database

**Luồng**:
```
Customer → UI: Vào "Đơn hàng của tôi"
UI → DB: GET orders (da-giao)
Customer → UI: Chọn sản phẩm đánh giá
UI → Review: Kiểm tra đã đánh giá
Review → DB: Find existing review
UI → Customer: Mở form (nếu chưa đánh giá)
Customer → UI: Nhập đánh giá + upload ảnh
UI → Upload: Upload images
Upload → UI: Image URLs
UI → Review: POST /reviews/create
Review → DB: Create Review (trangThai = "cho-duyet")
Review → Product: Update rating
Review → Notif: Tạo thông báo cho Admin
Review → UI: Success
```

---

### 4. UC25: Cập nhật trạng thái đơn hàng + Real-time
**Participants**:
- Admin
- Admin Web
- Order API
- Database
- Notification API
- Mobile App (Customer)
- ProfileScreen

**Luồng chính + Real-time sync**:
```
Admin → AdminUI: Chọn đơn hàng
Admin → AdminUI: Chọn trạng thái mới
AdminUI → OrderAPI: PUT /orders/:id/status
OrderAPI → DB: Update Order + lichSuTrangThai
OrderAPI → NotifAPI: Tạo thông báo
NotifAPI → DB: Create Notification
OrderAPI → AdminUI: Success

[Real-time Polling - mỗi 10 giây]
Loop:
  ProfileScreen → OrderAPI: GET /orders
  OrderAPI → DB: Fetch latest orders
  DB → OrderAPI: Orders with new status
  OrderAPI → ProfileScreen: Updated data
  ProfileScreen → MobileApp: Update UI
End Loop

Loop:
  MobileApp → NotifAPI: GET /notifications/unread
  NotifAPI → DB: Fetch notifications
  DB → NotifAPI: Notifications
  NotifAPI → MobileApp: New notifications
  MobileApp → MobileApp: Update badge
End Loop
```

---

### 5. UC6: Đăng ký tài khoản
**Participants**:
- Guest
- Register Form
- Auth API
- Database
- JWT Service
- Email Service

**Luồng**:
```
Guest → UI: Nhập thông tin đăng ký
UI → UI: Validate form
UI → API: POST /auth/register
API → DB: Kiểm tra email tồn tại
API → API: bcrypt.hash(password)
API → DB: Create User (vaiTro = "khach-hang")
API → JWT: Tạo token
API → Email: Send welcome email (optional)
API → UI: {user, token}
UI → UI: Lưu token
UI → Guest: Redirect to Homepage
```

---

### 6. UC8-UC9: Thêm vào giỏ hàng & Quản lý
**Participants**:
- Customer
- Product Detail Page
- Cart Page
- Cart API
- Product API
- Database

**UC8 - Thêm vào giỏ**:
```
Customer → UI: Chọn sản phẩm, size, màu, số lượng
UI → ProductAPI: Kiểm tra tồn kho
ProductAPI → DB: Get soLuongTonKho
DB → ProductAPI: Stock available
UI → CartAPI: POST /cart/add
CartAPI → DB: Add to cart
CartAPI → UI: Success
UI → UI: Update cart badge
```

**UC9 - Quản lý giỏ**:
```
Customer → CartUI: Mở giỏ hàng
CartUI → CartAPI: GET /cart
CartAPI → DB: Fetch cart items
DB → CartAPI: Cart data
CartAPI → CartUI: Display items

Loop (Chỉnh sửa):
  Customer → CartUI: Tăng/Giảm/Xóa
  CartUI → CartAPI: PUT /cart/update hoặc DELETE /cart/:id
  CartAPI → ProductAPI: Kiểm tra tồn kho (if tăng)
  CartAPI → DB: Update/Delete
  CartAPI → CartUI: Updated
  CartUI → CartUI: Tính lại tổng tiền
End Loop

Customer → CartUI: Đặt hàng
CartUI → Customer: Redirect to UC10
```

---

## 📖 Cách xem Diagrams

### PlantUML (.puml files)
1. Cài extension: **PlantUML** trong VS Code
2. Mở file `.puml`
3. Nhấn `Alt + D` hoặc click biểu tượng PlantUML
4. Xem preview bên phải

### Mermaid (.mmd files)
1. Cài extension: **Mermaid Preview** trong VS Code
2. Mở file `.mmd`
3. Nhấn `Ctrl+Shift+P` → "Mermaid: Preview"
4. Hoặc right-click → "Open Preview"

---

## 🎨 Color Coding

### Activity Diagrams:
- **Start/Stop**: Green/Red circles
- **Activity**: Blue rectangles
- **Decision**: Yellow diamonds
- **Partition**: Light blue groups

### Sequence Diagrams:
- **Actor**: Stick figure
- **UI**: Light blue
- **Backend API**: Green
- **Database**: Gray
- **External Service**: Orange

---

## 📝 Notes

### Real-time Features (⚡):
- **UC12**: Xem lịch sử đơn hàng (polling 10s)
- **UC19**: Xem thông báo (polling 10s)
- **UC25**: Cập nhật trạng thái đơn hàng (sync to mobile)

### Include Relationships:
- **UC10** includes **UC11** (Thanh toán)
- **UC10** includes **UC17** (Địa chỉ giao hàng)
- **UC24** includes **UC25** (Cập nhật trạng thái)

### Extend Relationships:
- **UC2** extends **UC15** (Xem sản phẩm → Đánh giá)
- **UC2** extends **UC16** (Xem sản phẩm → Yêu thích)
- **UC22** extends **UC23** (Quản lý sản phẩm → Quản lý danh mục)

---

## 📂 File Structure

```
docs/
├── usecase-diagram.puml          # UC tổng quát (PlantUML)
├── usecase-diagram.mmd           # UC tổng quát (Mermaid)
├── activity-diagrams.puml        # 7 Activity diagrams chi tiết
├── sequence-diagrams.mmd         # 6 Sequence diagrams
├── USECASE.md                    # Mô tả chi tiết 31 UCs
└── UC_DIAGRAMS_INDEX.md          # File này
```

---

**Tổng kết**: Tất cả 31 use cases đã được vẽ ở dạng tổng quát, và 7 use cases quan trọng nhất đã có activity diagram + sequence diagram chi tiết.
