# Phân Tích Hệ Thống - LP SHOP E-Commerce

## Bảng Phân Tích Classes/Collections

| CLASS NAME | ATTRIBUTES | METHODS | DESCRIPTION |
|------------|-----------|---------|-------------|
| **User** | userId (_id), email (UK), hoTen, matKhau (hashed), soDienThoai, avatar, anhDaiDien, diaChi[] (embedded), vaiTro (enum), trangThai (enum), gioiTinh (enum), ngaySinh, danhSachYeuThich[] (ref Product), lichSuTimKiem[], diemTichLuy, resetPasswordToken, resetPasswordExpire, createdAt, updatedAt | register(), login(), logout(), updateProfile(), changePassword(), forgotPassword(), resetPassword(), addToFavorites(), removeFromFavorites(), updateSearchHistory(), addAddress(), updateAddress(), deleteAddress(), getPoints(), viewOrders(), viewNotifications() | Đại diện cho người dùng trong hệ thống bao gồm khách hàng, nhân viên và quản trị viên. Quản lý thông tin cá nhân, xác thực và phân quyền. |
| **Product** | productId (_id), ten, slug (UK), moTa, moTaChiTiet, gia, giaKhuyenMai, hinhAnh[], danhMuc (FK), loaiSanPham, thuongHieu, kichThuoc[], mauSac[] (embedded), soLuongTonKho, daBan, luotXem, danhGiaTrungBinh, soLuongDanhGia, trangThai (enum), noiBat, sanPhamMoi, dacDiem[], thongSoKyThuat (Map), tags[], seoKeywords[], createdAt, updatedAt | createProduct(), updateProduct(), deleteProduct(), getProduct(), listProducts(), searchProducts(), filterByCategory(), filterByPrice(), incrementView(), updateStock(), calculateRating(), addToStock(), reduceStock(), checkAvailability(), toggleFeatured(), updateSEO() | Đại diện cho sản phẩm thể thao trong cửa hàng. Quản lý thông tin sản phẩm, kho hàng, giá cả và đánh giá. |
| **Category** | categoryId (_id), ten (UK), slug (UK), moTa, hinhAnh, danhMucCha (FK self-ref), loaiSanPham[], thuTu, trangThai (enum), seoTitle, seoDescription, createdAt, updatedAt | createCategory(), updateCategory(), deleteCategory(), getCategory(), listCategories(), listSubCategories(), getParentCategory(), reorderCategories(), toggleStatus(), getProductCount(), buildCategoryTree(), updateSEO() | Đại diện cho danh mục sản phẩm. Hỗ trợ cấu trúc phân cấp với danh mục cha-con để tổ chức sản phẩm. |
| **Order** | orderId (_id), maDonHang (UK auto), nguoiDung (FK), sanPham[] (embedded), tongTien, phiVanChuyen, giamGia, maGiamGia (embedded voucher), diemSuDung, giamGiaTuDiem, tongThanhToan, diaChiGiaoHang (embedded), phuongThucThanhToan (enum), trangThaiThanhToan (enum), trangThaiDonHang (enum), ghiChu, lyDoHuy, thanhToanLuc, giaoDuKienLuc, giaoThanhCongLuc, lichSuTrangThai[] (embedded), createdAt, updatedAt | createOrder(), updateOrder(), getOrder(), listOrders(), cancelOrder(), confirmOrder(), updateStatus(), applyVoucher(), applyPoints(), calculateTotal(), processPayment(), updatePaymentStatus(), trackOrder(), addStatusHistory(), generateInvoice(), estimateDelivery(), completeOrder() | Đại diện cho đơn hàng của khách hàng. Quản lý toàn bộ chu trình từ đặt hàng đến giao hàng thành công. |
| **Review** | reviewId (_id), sanPham (FK), nguoiDung (FK), donHang (FK), danhGia (1-5), tieuDe, noiDung, hinhAnh[], phanHoi (embedded), huuIch, trangThai (enum), createdAt, updatedAt | createReview(), updateReview(), deleteReview(), getReview(), listReviews(), replyToReview(), approveReview(), rejectReview(), markHelpful(), getProductReviews(), calculateAverageRating(), uploadImages(), verifyPurchase() | Đại diện cho đánh giá sản phẩm từ khách hàng. Chỉ cho phép đánh giá từ đơn hàng đã hoàn thành. |
| **Notification** | notificationId (_id), tieuDe, noiDung, loai (enum), nguoiNhan (FK), donHang (FK optional), danhGia (FK optional), daDoc, createdAt, updatedAt | createNotification(), sendNotification(), markAsRead(), markAllAsRead(), deleteNotification(), listNotifications(), getUnreadCount(), sendBulkNotifications(), scheduleNotification(), sendOrderNotification(), sendReviewNotification() | Lưu trữ thông báo gửi đến người dùng về đơn hàng, đánh giá, khuyến mãi và các sự kiện khác. |
| **Voucher** | voucherId (_id), ma (UK uppercase), loai (enum), giaTriGiam, giamToiDa, donToiThieu, soLuong, daSuDung, ngayBatDau, ngayKetThuc, moTa, trangThai (enum), nguoiDungApDung[] (FK), createdAt, updatedAt | createVoucher(), updateVoucher(), deleteVoucher(), getVoucher(), listVouchers(), applyVoucher(), validateVoucher(), checkAvailability(), incrementUsage(), checkUserEligibility(), activateVoucher(), deactivateVoucher(), getAvailableVouchers(), checkExpiry() | Đại diện cho mã giảm giá. Quản lý các chương trình khuyến mãi với điều kiện áp dụng và giới hạn sử dụng. |
| **PointTransaction** | transactionId (_id), nguoiDung (FK indexed), loai (enum), soLuong, moTa, donHang (FK optional), soDuSau, createdAt, updatedAt | createTransaction(), getTransaction(), listTransactions(), getUserTransactions(), calculateBalance(), addPoints(), deductPoints(), getPointsHistory(), revertTransaction(), getMonthlyReport() | Lưu trữ lịch sử giao dịch điểm tích lũy. Theo dõi cộng/trừ điểm từ đơn hàng và sử dụng điểm. |
| **Newsletter** | newsletterId (_id), email (UK), subscribedAt, isActive, createdAt, updatedAt | subscribe(), unsubscribe(), getSubscriber(), listSubscribers(), toggleStatus(), sendNewsletter(), exportSubscribers(), checkSubscription() | Quản lý danh sách đăng ký nhận tin tức và email marketing. Collection độc lập không liên kết với User. |
| **Brand** | brandId (_id), ten (UK), slug (UK auto), moTa, logo, thuTu, trangThai (enum), createdAt, updatedAt | createBrand(), updateBrand(), deleteBrand(), getBrand(), listBrands(), toggleStatus(), reorderBrands(), getProductCount(), uploadLogo() | Đại diện cho thương hiệu sản phẩm. Hiện tại Product.thuongHieu là String, có thể nâng cấp lên FK sau này. |

---

## Mối Quan Hệ Chính (Relationships)

### One-to-Many Relationships:
1. **USER → ORDER**: Một người dùng có nhiều đơn hàng
2. **USER → REVIEW**: Một người dùng viết nhiều đánh giá
3. **USER → NOTIFICATION**: Một người dùng nhận nhiều thông báo
4. **USER → POINT_TRANSACTION**: Một người dùng có nhiều giao dịch điểm
5. **PRODUCT → REVIEW**: Một sản phẩm có nhiều đánh giá
6. **CATEGORY → PRODUCT**: Một danh mục chứa nhiều sản phẩm
7. **CATEGORY → CATEGORY**: Danh mục cha có nhiều danh mục con (self-reference)
8. **ORDER → NOTIFICATION**: Một đơn hàng tạo nhiều thông báo
9. **ORDER → POINT_TRANSACTION**: Một đơn hàng tạo giao dịch điểm
10. **REVIEW → NOTIFICATION**: Một đánh giá tạo thông báo

### Many-to-Many Relationships:
1. **USER ↔ PRODUCT**: Nhiều người dùng yêu thích nhiều sản phẩm (danhSachYeuThich)
2. **ORDER ↔ PRODUCT**: Đơn hàng chứa nhiều sản phẩm (embedded denormalized)
3. **VOUCHER ↔ USER**: Nhiều người dùng có thể dùng nhiều voucher (nguoiDungApDung)

### Optional Relationships:
1. **ORDER → VOUCHER**: Đơn hàng có thể áp dụng voucher (maGiamGia.voucher)
2. **REVIEW → ORDER**: Đánh giá liên kết với đơn hàng đã mua (required)
3. **REVIEW → USER**: Phản hồi đánh giá từ admin/staff (phanHoi.nguoiPhanHoi)

---

## Embedded Documents (Dữ liệu nhúng)

### USER Collection:
- **diaChi[]**: Mảng địa chỉ giao hàng {hoTen, soDienThoai, tinh, huyen, xa, diaChiChiTiet, macDinh}

### PRODUCT Collection:
- **mauSac[]**: Mảng màu sắc {ten, ma}
- **thongSoKyThuat**: Map các thông số kỹ thuật

### ORDER Collection:
- **sanPham[]**: Mảng sản phẩm denormalized {sanPham, ten, hinhAnh, gia, soLuong, tongTien, kichThuoc, mauSac}
- **diaChiGiaoHang**: Đối tượng địa chỉ {hoTen, soDienThoai, tinh, huyen, xa, diaChiChiTiet}
- **maGiamGia**: Thông tin voucher {voucher, ma, giaTriGiam}
- **lichSuTrangThai[]**: Lịch sử trạng thái {trangThai, moTa, thoiGian}

### REVIEW Collection:
- **phanHoi**: Phản hồi từ admin {noiDung, nguoiPhanHoi, thoiGian}

---

## Enums và Constants

### User.vaiTro:
- `khach-hang` - Khách hàng
- `nhan-vien` - Nhân viên
- `quan-tri` - Quản trị viên

### User.trangThai:
- `hoat-dong` - Đang hoạt động
- `khoa` - Bị khóa

### User.gioiTinh:
- `nam` - Nam
- `nu` - Nữ
- `khac` - Khác

### Product.trangThai:
- `active` - Đang bán
- `inactive` - Ngừng bán

### Category.trangThai:
- `active` - Hiển thị
- `inactive` - Ẩn

### Order.phuongThucThanhToan:
- `cod` - Thanh toán khi nhận hàng
- `vnpay` - VNPay
- `momo` - MoMo
- `the-atm` - Thẻ ATM

### Order.trangThaiThanhToan:
- `chua-thanh-toan` - Chưa thanh toán
- `da-thanh-toan` - Đã thanh toán
- `hoan-tien` - Hoàn tiền

### Order.trangThaiDonHang:
- `cho-xac-nhan` - Chờ xác nhận
- `da-xac-nhan` - Đã xác nhận
- `dang-chuan-bi` - Đang chuẩn bị
- `dang-giao` - Đang giao
- `da-giao` - Đã giao
- `da-huy` - Đã hủy
- `tra-hang` - Trả hàng

### Review.trangThai:
- `cho-duyet` - Chờ duyệt
- `da-duyet` - Đã duyệt
- `tu-choi` - Từ chối

### Notification.loai:
- `don-hang-moi` - Đơn hàng mới
- `don-hang-huy` - Đơn hàng hủy
- `don-hang-xac-nhan` - Đơn hàng xác nhận
- `don-hang-dang-giao` - Đang giao hàng
- `don-hang-hoan-thanh` - Hoàn thành
- `danh-gia-moi` - Đánh giá mới
- `phan-hoi-danh-gia` - Phản hồi đánh giá
- `khuyen-mai` - Khuyến mãi
- `he-thong` - Hệ thống

### Voucher.loai:
- `phan-tram` - Giảm theo phần trăm
- `so-tien` - Giảm số tiền cố định

### Voucher.trangThai:
- `hoat-dong` - Đang hoạt động
- `tam-dung` - Tạm dừng
- `het-han` - Hết hạn

### PointTransaction.loai:
- `cong` - Cộng điểm
- `tru` - Trừ điểm

---

## Indexes Quan Trọng

### USER:
- `email` (unique)
- `soDienThoai`
- `vaiTro`
- `trangThai`

### PRODUCT:
- `slug` (unique)
- `danhMuc`
- `thuongHieu`
- `trangThai`
- `noiBat`
- `sanPhamMoi`
- Compound: `{trangThai: 1, danhMuc: 1}`
- Text index: `{ten: "text", moTa: "text", tags: "text"}`

### CATEGORY:
- `slug` (unique)
- `ten` (unique)
- `danhMucCha`
- `trangThai`

### ORDER:
- `maDonHang` (unique)
- `nguoiDung`
- `trangThaiDonHang`
- `trangThaiThanhToan`
- Compound: `{nguoiDung: 1, createdAt: -1}`

### REVIEW:
- `sanPham`
- `nguoiDung`
- `donHang`
- `trangThai`
- Compound: `{sanPham: 1, trangThai: 1}`

### NOTIFICATION:
- `nguoiNhan`
- `daDoc`
- Compound: `{nguoiNhan: 1, daDoc: 1, createdAt: -1}`

### VOUCHER:
- `ma` (unique)
- `trangThai`
- Compound: `{trangThai: 1, ngayKetThuc: 1}`

### POINT_TRANSACTION:
- `nguoiDung` (indexed)
- Compound: `{nguoiDung: 1, createdAt: -1}`

### NEWSLETTER:
- `email` (unique)
- `isActive`

### BRAND:
- `ten` (unique)
- `slug` (unique)
- `trangThai`

---

## Business Logic Quan Trọng

### 1. Quy trình Đặt hàng:
1. Khách hàng thêm sản phẩm vào giỏ → kiểm tra tồn kho
2. Áp dụng voucher (nếu có) → validate điều kiện
3. Sử dụng điểm tích lũy (nếu có)
4. Tính tổng thanh toán = tongTien + phiVanChuyen - giamGia - giamGiaTuDiem
5. Tạo đơn hàng với trạng thái `cho-xac-nhan`
6. Giảm số lượng tồn kho sản phẩm
7. Tạo thông báo cho khách hàng và admin
8. Nếu thanh toán online → chuyển đến cổng thanh toán

### 2. Quy trình Hoàn thành đơn:
1. Cập nhật trạng thái → `da-giao`
2. Tạo PointTransaction → cộng điểm cho khách hàng
3. Cập nhật User.diemTichLuy
4. Cho phép khách hàng đánh giá sản phẩm
5. Tạo thông báo hoàn thành

### 3. Quy trình Hủy đơn:
1. Cập nhật trạng thái → `da-huy`
2. Lưu lý do hủy
3. Hoàn lại tồn kho sản phẩm
4. Nếu đã thanh toán → xử lý hoàn tiền
5. Nếu đã dùng voucher → hoàn lại số lượng
6. Nếu đã dùng điểm → hoàn lại điểm (tạo PointTransaction loại `cong`)

### 4. Tính điểm tích lũy:
- **Cộng điểm**: 1% giá trị đơn hàng (ví dụ: 100.000đ = 1.000 điểm)
- **Quy đổi điểm**: 1.000 điểm = 1.000đ
- **Giới hạn sử dụng**: Tối đa 50% tổng đơn hàng

### 5. Xác thực Voucher:
- Kiểm tra mã có tồn tại
- Kiểm tra trạng thái = `hoat-dong`
- Kiểm tra trong thời hạn (ngayBatDau <= now <= ngayKetThuc)
- Kiểm tra còn số lượng (daSuDung < soLuong)
- Kiểm tra đơn tối thiểu (tongTien >= donToiThieu)
- Kiểm tra người dùng đã dùng chưa (nếu có giới hạn)

### 6. Tính đánh giá trung bình:
- Khi có đánh giá mới được duyệt
- Cập nhật Product.danhGiaTrungBinh = SUM(danhGia) / COUNT(*)
- Cập nhật Product.soLuongDanhGia = COUNT(*)

---

## Ghi chú Kỹ thuật

### Denormalization Strategy:
- **ORDER.sanPham[]**: Lưu snapshot dữ liệu sản phẩm tại thời điểm đặt hàng để tránh thay đổi giá/thông tin ảnh hưởng đơn hàng cũ
- **ORDER.diaChiGiaoHang**: Lưu địa chỉ cụ thể để tránh thay đổi địa chỉ trong User ảnh hưởng

### Security:
- **User.matKhau**: Hash bằng bcrypt, `select: false` trong schema
- **User.resetPasswordToken**: Hash token reset password
- **Validation**: Email format, phone format, enum values
- **Authorization**: Check vaiTro cho các operations admin

### Performance Optimization:
- Cache Product.danhGiaTrungBinh và Product.soLuongDanhGia
- Cache User.diemTichLuy thay vì query PointTransaction mỗi lần
- Index compound cho queries phổ biến
- Pagination cho list APIs

---

**Generated**: 2025-12-26
**Version**: 1.0
**Project**: LP SHOP E-Commerce Platform
