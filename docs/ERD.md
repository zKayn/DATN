# ERD - Entity Relationship Diagram

## Tổng quan

Hệ thống LP Shop có **11 entities** chính với các mối quan hệ One-to-One, One-to-Many và Many-to-Many.

---

## Entities (11)

### 1. USER (Người dùng)
- **PK**: _id
- **Unique**: email
- **Relationships**:
  - 1 User → N Orders (places)
  - 1 User → N Reviews (writes)
  - 1 User → N Notifications (receives)
  - 1 User → N PointTransactions (has)
  - N User ↔ N Products (favorites - danhSachYeuThich)
  - N User ↔ N Vouchers (uses - nguoiDungApDung)

### 2. PRODUCT (Sản phẩm)
- **PK**: _id
- **Unique**: slug
- **FK**: danhMuc → Category
- **Relationships**:
  - N Products → 1 Category
  - 1 Product → N Reviews
  - N Products ↔ N Orders (embedded in sanPham array)
  - N Products ↔ N Users (favorites)

### 3. CATEGORY (Danh mục)
- **PK**: _id
- **Unique**: ten, slug
- **FK**: danhMucCha → Category (self-reference)
- **Relationships**:
  - 1 Category → N Products
  - 1 Category → N SubCategories (danhMucCha)

### 4. ORDER (Đơn hàng)
- **PK**: _id
- **Unique**: maDonHang
- **FK**: nguoiDung → User, maGiamGia.voucher → Voucher
- **Relationships**:
  - N Orders → 1 User
  - N Orders ↔ N Products (embedded array)
  - N Orders → 0..1 Voucher
  - 1 Order → N Notifications
  - 1 Order → N PointTransactions
  - 1 Order → N Reviews

### 5. REVIEW (Đánh giá)
- **PK**: _id
- **FK**: sanPham → Product, nguoiDung → User, donHang → Order
- **Composite Unique**: (sanPham, nguoiDung, donHang)
- **Relationships**:
  - N Reviews → 1 Product
  - N Reviews → 1 User (author)
  - N Reviews → 1 Order
  - N Reviews → 0..1 User (phanHoi.nguoiPhanHoi)
  - 1 Review → N Notifications

### 6. NOTIFICATION (Thông báo)
- **PK**: _id
- **FK**: nguoiNhan → User, donHang → Order, danhGia → Review
- **Relationships**:
  - N Notifications → 1 User
  - N Notifications → 0..1 Order
  - N Notifications → 0..1 Review

### 7. VOUCHER (Mã giảm giá)
- **PK**: _id
- **Unique**: ma
- **Relationships**:
  - N Vouchers ↔ N Users (nguoiDungApDung)
  - 1 Voucher → N Orders

### 8. POINT_TRANSACTION (Giao dịch điểm)
- **PK**: _id
- **FK**: nguoiDung → User, donHang → Order
- **Relationships**:
  - N PointTransactions → 1 User
  - N PointTransactions → 0..1 Order

### 9. NEWSLETTER (Đăng ký nhận tin)
- **PK**: _id
- **Unique**: email
- **Relationships**: None (standalone)

### 10. BRAND (Thương hiệu)
- **PK**: _id
- **Unique**: ten, slug
- **Relationships**: None (Product.thuongHieu is String, not FK)

### 11. SETTINGS (Cài đặt hệ thống)
- **PK**: _id
- **Relationships**: None (singleton)

---

## Key Relationships

### One-to-Many (1:N)
- User → Orders
- User → Reviews
- User → Notifications
- User → PointTransactions
- Product → Reviews
- Category → Products
- Category → SubCategories (self-reference)
- Order → Notifications
- Order → PointTransactions
- Review → Notifications

### Many-to-Many (N:N)
- User ↔ Products (favorites via danhSachYeuThich array)
- User ↔ Vouchers (via nguoiDungApDung array)
- Order ↔ Products (embedded via sanPham array with product details)

### Optional Relationships (0..1)
- Order → Voucher (maGiamGia is optional)
- Notification → Order (optional)
- Notification → Review (optional)
- PointTransaction → Order (optional)
- Review → User (phanHoi.nguoiPhanHoi is optional)

---

## Important Fields

### Enums
- **User.vaiTro**: 'khach-hang' | 'nhan-vien' | 'quan-tri'
- **User.trangThai**: 'hoat-dong' | 'khoa'
- **Product.trangThai**: 'active' | 'inactive'
- **Order.phuongThucThanhToan**: 'cod' | 'vnpay' | 'momo' | 'the-atm'
- **Order.trangThaiThanhToan**: 'chua-thanh-toan' | 'da-thanh-toan' | 'hoan-tien'
- **Order.trangThaiDonHang**: 'cho-xac-nhan' | 'da-xac-nhan' | 'dang-chuan-bi' | 'dang-giao' | 'da-giao' | 'da-huy' | 'tra-hang'
- **Review.trangThai**: 'cho-duyet' | 'da-duyet' | 'tu-choi'
- **Voucher.loai**: 'phan-tram' | 'so-tien'
- **PointTransaction.loai**: 'cong' | 'tru'

### Embedded Arrays/Objects
- **User.diaChi**: Array of address objects
- **User.danhSachYeuThich**: Array of Product ObjectIds
- **Product.hinhAnh**: Array of image URLs
- **Product.mauSac**: Array of {ten, ma} objects
- **Order.sanPham**: Array of product items {sanPham, tenSanPham, gia, soLuong, ...}
- **Order.diaChiGiaoHang**: Embedded address object
- **Order.lichSuTrangThai**: Array of status history
- **Voucher.nguoiDungApDung**: Array of User ObjectIds

### Indexes
- **User**: email (unique)
- **Product**: slug (unique), ten+moTa+tags (text search), danhMuc, gia, noiBat, sanPhamMoi
- **Category**: ten (unique), slug (unique)
- **Order**: maDonHang (unique)
- **Review**: (sanPham + nguoiDung + donHang) composite unique
- **Notification**: (nguoiNhan + createdAt), (nguoiNhan + daDoc)
- **Voucher**: ma (unique)
- **PointTransaction**: (nguoiDung + createdAt), donHang

---

## Business Logic

### Review Rules
- 1 user chỉ được đánh giá 1 lần cho mỗi sản phẩm trong 1 đơn hàng
- Composite unique index: (sanPham, nguoiDung, donHang)

### Order Product Denormalization
- Order.sanPham là embedded array chứa snapshot của product tại thời điểm đặt hàng
- Bao gồm: sanPham (ObjectId FK), tenSanPham, hinhAnh, gia, soLuong, thanhTien
- Đảm bảo dữ liệu đơn hàng không bị thay đổi khi product cập nhật

### Voucher Validation
- ngayKetThuc > ngayBatDau
- giaTriGiam ≤ 100 (nếu loai = 'phan-tram')
- soLuong ≥ daSuDung

### Point System
- User.diemTichLuy ≥ 0
- PointTransaction.soDuSau = User.diemTichLuy sau mỗi giao dịch
- PointTransaction.loai: 'cong' (tích điểm) | 'tru' (tiêu điểm)

---

**Files**:
- PlantUML: `docs/erd-diagram.puml`
- Mermaid: `docs/erd-diagram.mmd`
