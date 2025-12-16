# Báo cáo đồng bộ dữ liệu Customer-Web ⟷ Mobile-App

## ✅ Đã hoàn thành

### 1. **User Profile Synchronization** ✓
**Backend Model**: [apps/backend/src/models/User.ts](apps/backend/src/models/User.ts)

**Fields được đồng bộ**:
- ✅ `_id` - User ID
- ✅ `hoTen` - Họ tên
- ✅ `email` - Email
- ✅ `soDienThoai` - Số điện thoại
- ✅ `avatar` - Ảnh đại diện (URL)
- ✅ `anhDaiDien` - Ảnh đại diện (backup field)
- ✅ `vaiTro` - Vai trò (khach-hang, nhan-vien, quan-tri)
- ✅ `gioiTinh` - Giới tính (nam, nu, khac)
- ✅ `ngaySinh` - Ngày sinh
- ✅ `diaChi[]` - Danh sách địa chỉ
- ✅ `danhSachYeuThich[]` - Danh sách sản phẩm yêu thích
- ✅ `trangThai` - Trạng thái tài khoản

**API Endpoints**:
- `GET /api/auth/me` - Lấy thông tin user
- `PUT /api/auth/update-profile` - Cập nhật thông tin
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

**Customer-Web**:
- ✅ AuthContext updated: [apps/customer-web/contexts/AuthContext.tsx](apps/customer-web/contexts/AuthContext.tsx)
- ✅ Methods: `updateProfile()`, `refreshProfile()`
- ✅ User interface đầy đủ fields

**Mobile-App**:
- ✅ AuthContext updated: [apps/mobile-app/src/contexts/AuthContext.tsx](apps/mobile-app/src/contexts/AuthContext.tsx)
- ✅ Methods: `updateProfile()`, `refreshProfile()`
- ✅ User interface đầy đủ fields
- ✅ API service: [apps/mobile-app/src/services/api.ts](apps/mobile-app/src/services/api.ts)

---

### 2. **Wishlist Synchronization** ✓
**Backend**: `danhSachYeuThich` trong User model + API `/users/wishlist`

**Customer-Web**:
- ✅ WishlistContext: [apps/customer-web/contexts/WishlistContext.tsx](apps/customer-web/contexts/WishlistContext.tsx)
- ✅ Sử dụng backend API thay vì localStorage
- ✅ Fallback localStorage khi offline
- ✅ Optimistic UI updates

**Mobile-App**:
- ✅ WishlistContext: [apps/mobile-app/src/contexts/WishlistContext.tsx](apps/mobile-app/src/contexts/WishlistContext.tsx)
- ✅ Đồng bộ qua API
- ✅ Cùng endpoint với customer-web

**API Endpoints**:
- `GET /api/users/wishlist` - Lấy danh sách yêu thích
- `POST /api/users/wishlist` - Thêm sản phẩm
- `DELETE /api/users/wishlist/:productId` - Xóa sản phẩm

---

### 3. **Address Management Synchronization** ✓
**Backend**: `diaChi[]` array trong User model

**Customer-Web**:
- ✅ Lưu địa chỉ qua API `/auth/addresses`
- ✅ Tự động load địa chỉ từ user profile

**Mobile-App**:
- ✅ AddressListScreen: [apps/mobile-app/src/screens/Address/AddressListScreen.tsx](apps/mobile-app/src/screens/Address/AddressListScreen.tsx)
- ✅ AddressFormScreen: [apps/mobile-app/src/screens/Address/AddressFormScreen.tsx](apps/mobile-app/src/screens/Address/AddressFormScreen.tsx)
- ✅ API integration hoàn chỉnh

**API Endpoints**:
- `POST /api/auth/addresses` - Thêm địa chỉ
- `PUT /api/auth/addresses/:id` - Cập nhật địa chỉ
- `DELETE /api/auth/addresses/:id` - Xóa địa chỉ
- `PUT /api/auth/addresses/:id/set-default` - Đặt mặc định

**Field Mapping**:
```typescript
Backend          → Frontend
--------------------------------
hoTen           → hoTen
soDienThoai     → soDienThoai
tinh            → tinhThanh
huyen           → quanHuyen
xa              → phuongXa
diaChiChiTiet   → diaChi
macDinh         → macDinh
```

---

### 4. **Order History Synchronization** ✓
**Backend**: Order model

**API Endpoints**:
- `GET /api/orders/my-orders` - Lấy danh sách đơn hàng
- `GET /api/orders/:id` - Chi tiết đơn hàng
- `PUT /api/orders/:id/cancel` - Hủy đơn hàng

**Customer-Web**: ✅ Đồng bộ qua API
**Mobile-App**:
- ✅ OrderHistoryScreen: [apps/mobile-app/src/screens/Order/OrderHistoryScreen.tsx](apps/mobile-app/src/screens/Order/OrderHistoryScreen.tsx)
- ✅ OrderDetailScreen: [apps/mobile-app/src/screens/Order/OrderDetailScreen.tsx](apps/mobile-app/src/screens/Order/OrderDetailScreen.tsx)

---

### 5. **Reviews Synchronization** ✓
**Backend**: Review model

**API Endpoints**:
- `GET /api/reviews/product/:productId` - Lấy đánh giá sản phẩm
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

**Customer-Web**:
- ✅ ReviewSection: [apps/customer-web/components/product/ReviewSection.tsx](apps/customer-web/components/product/ReviewSection.tsx)
- ✅ All Reviews Page: [apps/customer-web/app/san-pham/[slug]/danh-gia/page.tsx](apps/customer-web/app/san-pham/[slug]/danh-gia/page.tsx)

**Mobile-App**:
- ✅ ReviewScreen: [apps/mobile-app/src/screens/Review/ReviewScreen.tsx](apps/mobile-app/src/screens/Review/ReviewScreen.tsx)
- ✅ AllReviewsScreen: [apps/mobile-app/src/screens/Review/AllReviewsScreen.tsx](apps/mobile-app/src/screens/Review/AllReviewsScreen.tsx)

---

## ⚠️ Lưu ý quan trọng

### Cart Synchronization
**Hiện tại**: Cart chỉ lưu LOCAL (localStorage / AsyncStorage)

**Lý do**:
- Cart thường thay đổi liên tục
- Không cần đăng nhập để sử dụng
- Performance tốt hơn khi lưu local

**Nếu cần đồng bộ Cart**:
1. Tạo Cart model ở backend
2. API: `GET/POST/PUT/DELETE /api/cart`
3. Sync khi user login/logout
4. Merge cart local với cart server

---

## 🔄 Data Flow

### Login Flow:
```
1. User login trên Customer-Web
2. Backend trả về token + user data (bao gồm avatar, diaChi, etc)
3. Save token vào localStorage
4. Load wishlist, addresses từ user.danhSachYeuThich, user.diaChi
5. Cart merge từ localStorage

** Khi login trên Mobile-App với cùng account **
6. Backend trả về SAME user data (avatar, diaChi đã cập nhật)
7. Save token vào AsyncStorage
8. Load wishlist, addresses từ API → ĐÃ ĐỒNG BỘ ✓
```

### Update Profile Flow:
```
Customer-Web:
1. User update avatar ở customer-web
2. Call api.updateProfile(token, { avatar: newUrl })
3. Backend cập nhật User.avatar
4. AuthContext.updateProfile() → setUser(updatedData)

Mobile-App (sau khi refresh):
1. User mở app
2. AuthContext.loadUser() → call api.getProfile()
3. Backend trả về User với avatar MỚI
4. Avatar hiển thị đúng → ĐÃ ĐỒNG BỘ ✓
```

---

## 📋 Checklist đồng bộ 100%

### User Data
- [x] Avatar/Profile picture
- [x] Họ tên
- [x] Email
- [x] Số điện thoại
- [x] Giới tính
- [x] Ngày sinh
- [x] Địa chỉ giao hàng

### Shopping Data
- [x] Wishlist (Yêu thích)
- [x] Order History (Lịch sử đơn hàng)
- [x] Reviews (Đánh giá)
- [ ] Cart (Giỏ hàng - LOCAL ONLY)

### Account Settings
- [x] Password change (API available)
- [x] Account status
- [x] Role/permissions

---

## 🛠️ Cách test đồng bộ

### Test 1: Avatar Sync
1. Login customer-web với tài khoản A
2. Cập nhật avatar → Save
3. Login mobile-app với cùng tài khoản A
4. ✓ Avatar mới phải hiển thị

### Test 2: Wishlist Sync
1. Thêm sản phẩm vào wishlist trên customer-web
2. Mở mobile-app (cùng account)
3. ✓ Sản phẩm phải xuất hiện trong wishlist

### Test 3: Address Sync
1. Thêm địa chỉ mới trên mobile-app
2. Reload customer-web
3. ✓ Địa chỉ mới phải xuất hiện khi checkout

### Test 4: Review Sync
1. Viết đánh giá trên customer-web
2. Xem sản phẩm trên mobile-app
3. ✓ Đánh giá phải hiển thị (sau khi admin duyệt)

---

## 🐛 Issues Found & Fixed

### Issue #1: Avatar Not Displaying on Mobile-App ❌ → ✅ FIXED

**Problem**:
- Avatar field was being synced from backend correctly
- AuthContext had `avatar` and `anhDaiDien` fields
- BUT ProfileScreen was hardcoded to only show first letter of name
- Code at [ProfileScreen.tsx:78-81](apps/mobile-app/src/screens/Profile/ProfileScreen.tsx#L78-L81) ignored avatar URL

**Before**:
```typescript
<View style={styles.avatar}>
  <Text style={styles.avatarText}>
    {user?.hoTen?.charAt(0).toUpperCase() || 'U'}
  </Text>
</View>
```

**After**:
```typescript
<View style={styles.avatar}>
  {user?.avatar || user?.anhDaiDien ? (
    <Image
      source={{ uri: user.avatar || user.anhDaiDien }}
      style={styles.avatarImage}
    />
  ) : (
    <Text style={styles.avatarText}>
      {user?.hoTen?.charAt(0).toUpperCase() || 'U'}
    </Text>
  )}
</View>
```

**Fix Applied**:
1. ✅ Added Image import to ProfileScreen
2. ✅ Changed avatar rendering to show actual image when available
3. ✅ Added fallback to letter avatar when no image exists
4. ✅ Added `overflow: 'hidden'` to avatar style for proper border-radius
5. ✅ Added `avatarImage` style for full-size image display

**Files Modified**:
- [apps/mobile-app/src/screens/Profile/ProfileScreen.tsx](apps/mobile-app/src/screens/Profile/ProfileScreen.tsx)
- [apps/mobile-app/src/screens/Profile/ProfileEditScreen.tsx](apps/mobile-app/src/screens/Profile/ProfileEditScreen.tsx) - NEW
- [apps/mobile-app/src/services/api.ts](apps/mobile-app/src/services/api.ts) - Added uploadAvatar()
- [apps/mobile-app/src/navigation/RootNavigator.tsx](apps/mobile-app/src/navigation/RootNavigator.tsx) - Added ProfileEdit route
- [apps/backend/src/controllers/auth.controller.ts](apps/backend/src/controllers/auth.controller.ts) - Added uploadAvatar endpoint
- [apps/backend/src/routes/auth.routes.ts](apps/backend/src/routes/auth.routes.ts) - Added /upload-avatar route

**Test Results**:
- ✅ Avatar from backend now displays correctly
- ✅ Falls back to letter avatar if no image
- ✅ Syncs with customer-web avatar updates
- ✅ Can upload and change avatar from mobile-app
- ✅ Edit button added to ProfileScreen

**Additional Fix - Customer-web to Mobile-app sync**:
- ✅ Fixed customer-web to update both `avatar` and `anhDaiDien` fields
- ✅ Fixed backend login/register responses to return all user fields
- ✅ Now avatar syncs bidirectionally: customer-web ⟷ mobile-app

---

---

## 🆕 Tính năng mới: Profile Edit Screen

### Chức năng đã thêm:
1. ✅ **ProfileEditScreen** - Màn hình chỉnh sửa thông tin cá nhân
   - Upload/thay đổi ảnh đại diện
   - Chỉnh sửa họ tên
   - Cập nhật số điện thoại
   - Chọn giới tính (Nam/Nữ/Khác)
   - Nhập ngày sinh

2. ✅ **Upload Avatar API** - `POST /api/auth/upload-avatar`
   - Upload ảnh lên Cloudinary
   - Tự động resize và optimize (500x500, crop: fill)
   - Cập nhật cả `avatar` và `anhDaiDien` fields

3. ✅ **Edit Button** - Nút chỉnh sửa trên ProfileScreen
   - Vị trí góc phải trên header
   - Navigate đến ProfileEditScreen

### Thư viện đã cài:
- `expo-image-picker` - Chọn ảnh từ thư viện

### API Endpoints:
- `POST /api/auth/upload-avatar` - Upload ảnh đại diện
- `PUT /api/auth/update-profile` - Cập nhật thông tin profile

---

## 🎯 Kết luận

✅ **Đã đạt 100% đồng bộ dữ liệu**

Tất cả dữ liệu quan trọng (User Profile, Wishlist, Addresses, Orders, Reviews) đều được đồng bộ 100% qua backend API.

**Avatar synchronization now working correctly** - Fixed UI rendering issue + Added upload feature on mobile-app.

Chỉ Cart là local-only, có thể bổ sung backend sync nếu cần thiết.

**Last Updated**: 2025-12-14 (Avatar display fixed + Profile edit screen added)
