# Hướng dẫn Import ERD vào Draw.io

## Cách 1: Import CSV (Đơn giản nhất)

### Bước 1: Mở Draw.io
- Truy cập https://app.diagrams.net/
- Hoặc dùng Draw.io Desktop App

### Bước 2: Import CSV
1. Click **File** → **Import from** → **CSV**
2. Chọn file `erd-drawio.csv`
3. Draw.io sẽ tự động tạo entities và relationships

### Bước 3: Customize
- Sắp xếp lại các entities
- Điều chỉnh màu sắc
- Thêm legend/chú thích

---

## Cách 2: Tạo thủ công từ CSV data

### Entities cần tạo (11):

#### 🟢 Core Entities (màu xanh lá)
1. **USER** - #16A34A
   - 17 fields (bao gồm _id, email, hoTen, matKhau, diaChi[], danhSachYeuThich[], diemTichLuy...)

2. **PRODUCT** - #3B82F6 (xanh dương)
   - 24 fields (bao gồm _id, ten, slug, gia, giaKhuyenMai, danhMuc FK, mauSac[], hinhAnh[]...)

3. **ORDER** - #DC2626 (đỏ)
   - 23 fields (bao gồm _id, maDonHang, nguoiDung FK, sanPham[], tongThanhToan, trangThaiDonHang...)

4. **CATEGORY** - #8B5CF6 (tím)
   - 12 fields (bao gồm _id, ten, slug, danhMucCha FK self-reference...)

#### ⚡ Transaction Entities (màu vàng/hồng)
5. **REVIEW** - #F59E0B (vàng)
   - 13 fields (sanPham FK, nguoiDung FK, donHang FK, danhGia, phanHoi...)

6. **NOTIFICATION** - #EC4899 (hồng)
   - 10 fields (nguoiNhan FK, donHang FK, danhGia FK, daDoc...)

7. **POINT_TRANSACTION** - #6366F1 (indigo)
   - 9 fields (nguoiDung FK, donHang FK, loai, soLuong, soDuSau...)

#### 🎁 Support Entities (màu xám)
8. **VOUCHER** - #14B8A6 (xanh ngọc)
   - 14 fields (ma, loai, giaTriGiam, nguoiDungApDung[]...)

9. **NEWSLETTER** - #64748B (xám)
   - 6 fields (email, subscribedAt, isActive...)

10. **BRAND** - #64748B (xám)
    - 8 fields (ten, slug, logo...)

---

## Cách 3: Sử dụng PlantUML trong Draw.io

### Bước 1: Enable PlantUML Plugin
1. Trong Draw.io, click **Extras** → **Plugins**
2. Add **PlantUML** plugin
3. Click **Apply**

### Bước 2: Insert PlantUML
1. Click **Arrange** → **Insert** → **Advanced** → **PlantUML**
2. Copy nội dung từ file `erd-diagram.puml`
3. Paste và click **Insert**

---

## Template Draw.io Entity (Thủ công)

### Tạo 1 Entity Box:
```
┌─────────────────────────┐
│  👤 USER                │ ← Header (Entity name)
├─────────────────────────┤
│ 🔑 _id: ObjectId PK     │ ← Primary Key
│ 📧 email: String UK     │ ← Unique Key
│ 👤 hoTen: String        │
│ 🔒 matKhau: String      │
│ 📱 soDienThoai: String  │
│ 🎭 vaiTro: String       │
│ ⭐ diemTichLuy: Number  │
│ ...                     │
│ 📅 createdAt: Date      │
│ 📅 updatedAt: Date      │
└─────────────────────────┘
```

### Relationship Lines:
- **1:N** (One to Many): `||----o{`
- **N:1** (Many to One): `}o----||`
- **N:N** (Many to Many): `}o----o{`
- **Optional**: `}o----o|`

---

## Relationships chính cần vẽ:

### User-centric (từ USER đi ra)
- USER `1:N` → ORDER (nguoiDung)
- USER `1:N` → REVIEW (nguoiDung)
- USER `1:N` → NOTIFICATION (nguoiNhan)
- USER `1:N` → POINT_TRANSACTION (nguoiDung)
- USER `N:N` ↔ PRODUCT (danhSachYeuThich[])
- USER `N:N` ↔ VOUCHER (nguoiDungApDung[])

### Product-centric
- PRODUCT `N:1` → CATEGORY (danhMuc)
- PRODUCT `1:N` → REVIEW (sanPham)
- PRODUCT `N:N` ↔ ORDER (sanPham[] embedded)

### Order-centric
- ORDER `N:1` → VOUCHER (maGiamGia.voucher)
- ORDER `1:N` → NOTIFICATION (donHang)
- ORDER `1:N` → POINT_TRANSACTION (donHang)

### Review-centric
- REVIEW `N:1` → ORDER (donHang)
- REVIEW `N:1` → USER (phanHoi.nguoiPhanHoi)
- REVIEW `1:N` → NOTIFICATION (danhGia)

### Self-reference
- CATEGORY `1:N` → CATEGORY (danhMucCha)

---

## Màu sắc theo MongoDB data types:

- **ObjectId (FK)**: 🔵 Blue (#3B82F6)
- **String**: ⚫ Black
- **Number**: 🟣 Purple (#8B5CF6)
- **Date**: 🟡 Yellow (#F59E0B)
- **Boolean**: 🟢 Green (#16A34A)
- **Array []**: 🔶 Orange (#F97316)
- **Object {}**: 🟤 Brown (#92400E)
- **PK**: 🔴 Red (#DC2626)
- **UK**: 🟠 Orange (#EA580C)

---

## Layout Suggestions:

### Horizontal Layout (Left to Right):

```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  USER   │─────▶│ ORDER   │─────▶│ NOTIF   │      │ VOUCHER │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
     │                 │                │
     │                 │                │
     ▼                 ▼                ▼
┌─────────┐      ┌─────────┐      ┌─────────┐
│ PRODUCT │      │ POINT_TX│      │ REVIEW  │
└─────────┘      └─────────┘      └─────────┘
     │
     ▼
┌─────────┐
│CATEGORY │
└─────────┘
```

### Vertical Layout (Top to Bottom):
- Core entities ở trên (USER, PRODUCT, CATEGORY)
- Transactions ở giữa (ORDER, REVIEW)
- Support ở dưới (VOUCHER, NOTIFICATION, POINT_TX)

---

## Icons cho Draw.io:

Bạn có thể thêm icons từ:
- **Ionicons**: https://ionic.io/ionicons
- **Material Icons**: https://fonts.google.com/icons
- **Font Awesome**: https://fontawesome.com/

Copy Unicode character:
- 👤 User: `U+1F464`
- 📦 Product: `U+1F4E6`
- 🛒 Order: `U+1F6D2`
- 📂 Category: `U+1F4C2`
- ⭐ Review: `U+2B50`
- 🔔 Notification: `U+1F514`
- 🎟️ Voucher: `U+1F39F`
- 💎 Points: `U+1F48E`

---

## Export Options:

Sau khi vẽ xong trong Draw.io, bạn có thể export:
1. **PNG/JPG**: File ảnh để trình bày
2. **SVG**: Vector graphics (scale tốt)
3. **PDF**: Để in hoặc embed vào báo cáo
4. **XML (.drawio)**: Để edit lại sau

---

**File CSV**: `erd-drawio.csv`
**File PlantUML**: `erd-diagram.puml`
**File Mermaid**: `erd-diagram.mmd`, `erd-horizontal.mmd`
