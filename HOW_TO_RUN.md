# 🚀 HƯỚNG DẪN CHẠY DỰ ÁN

## ✅ BẠN ĐÃ CÀI XEM

Dependencies đã được cài đặt thành công!

## 📝 TRƯỚC KHI CHẠY

### 1. Setup MongoDB (BẮT BUỘC)

Bạn có 2 lựa chọn:

#### Option A: MongoDB Atlas (Khuyến nghị - Dễ nhất)

1. Truy cập: https://cloud.mongodb.com
2. Đăng ký account miễn phí
3. Tạo cluster (chọn FREE M0)
4. Tạo Database User:
   - Username: `admin`
   - Password: `password123` (hoặc tùy chọn)
5. Whitelist IP: `0.0.0.0/0` (Allow all)
6. Click "Connect" → "Connect your application"
7. Copy connection string

#### Option B: MongoDB Local

```bash
# Download & install từ:
https://www.mongodb.com/try/download/community

# Sau khi cài, chạy:
mongod
```

### 2. Setup Backend Environment

```bash
cd apps/backend

# Copy file .env
copy .env.example .env

# Mở file .env và điền:
```

**File `.env` tối thiểu**:
```env
# MongoDB (QUAN TRỌNG!)
MONGODB_URI=mongodb+srv://admin:password123@cluster.mongodb.net/sports-store
# Hoặc local: mongodb://localhost:27017/sports-store

# JWT Secret
JWT_SECRET=my-super-secret-key-2025

# Port
PORT=5000
NODE_ENV=development

# Client URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

**Optional** (có thể bỏ qua tạm thời):
```env
# Cloudinary (cho upload ảnh - optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# OpenAI (cho chatbot - optional)
OPENAI_API_KEY=

# Email (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=
EMAIL_PASSWORD=

# Payment (optional)
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
```

### 3. Setup Frontend Environment

```bash
# Customer Web
cd apps/customer-web
copy .env.example .env.local
# File .env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Admin Web
cd ../admin-web
copy .env.example .env.local
# File .env.local:
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

---

## 🏃 CHẠY ỨNG DỤNG

### Cách 1: Chạy TẤT CẢ cùng lúc (Khuyến nghị)

```bash
# Từ thư mục root D:\DATN
npm run dev
```

**Sẽ chạy**:
- Backend API: http://localhost:5000
- Customer Web: http://localhost:3000
- Admin Web: http://localhost:3001

### Cách 2: Chạy từng app riêng

#### Terminal 1 - Backend
```bash
cd apps/backend
npm run dev
```

#### Terminal 2 - Customer Web
```bash
cd apps/customer-web
npm run dev
```

#### Terminal 3 - Admin Web
```bash
cd apps/admin-web
npm run dev
```

---

## 🧪 TEST ỨNG DỤNG

### 1. Test Backend API

Mở browser hoặc Postman:

```http
GET http://localhost:5000/health
```

Response:
```json
{
  "status": "OK",
  "message": "Backend API đang hoạt động",
  "timestamp": "2025-11-29T..."
}
```

### 2. Test Customer Web

```
http://localhost:3000
```

Bạn sẽ thấy:
- ✅ Hero banner với 3 slides
- ✅ 6 danh mục sản phẩm
- ✅ 8 sản phẩm nổi bật
- ✅ 8 sản phẩm mới
- ✅ 6 đánh giá khách hàng
- ✅ Form đăng ký newsletter

### 3. Test Admin Web

```
http://localhost:3001
```

Bạn sẽ thấy:
- ✅ Trang đăng nhập đẹp
- Demo credentials: admin@example.com / password123

---

## 🔧 TROUBLESHOOTING

### Lỗi: "turbo not found"
```bash
npm install
```

### Lỗi: MongoDB connection failed
```bash
# Kiểm tra .env trong apps/backend
# Đảm bảo MONGODB_URI đúng format
# Test connection string bằng MongoDB Compass
```

### Lỗi: Port already in use
```bash
# Windows - Kill port
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=5001
```

### Lỗi: Module not found
```bash
# Backend
cd apps/backend
npm install

# Customer Web
cd apps/customer-web
npm install

# Admin Web
cd apps/admin-web
npm install
```

### Lỗi: Python required (TensorFlow)
```
Đã loại bỏ TensorFlow khỏi dependencies.
Không cần Python nữa!
```

---

## 📊 STATUS CHECK

Sau khi chạy, kiểm tra:

- [ ] Backend API: http://localhost:5000/health → OK
- [ ] Customer Web: http://localhost:3000 → Hiện homepage
- [ ] Admin Web: http://localhost:3001 → Hiện login page
- [ ] MongoDB: Connected (check terminal logs)

---

## 🎯 NHỮNG GÌ ĐANG HOẠT ĐỘNG

### Backend API ✅
- 44 endpoints hoàn chỉnh
- JWT authentication
- MongoDB connected
- AI chatbot (nếu có OpenAI key)
- File upload (nếu có Cloudinary)

### Customer Web ✅
- Homepage đầy đủ 7 sections
- Responsive design
- Beautiful UI
- Mock data

### Admin Web ✅
- Login page
- Basic setup

---

## 📝 TẠO DỮ LIỆU MẪU

Sau khi backend chạy, sử dụng Postman để:

### 1. Đăng ký Admin
```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "hoTen": "Admin",
  "email": "admin@example.com",
  "matKhau": "123456",
  "vaiTro": "quan-tri"
}
```

### 2. Đăng nhập
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "matKhau": "123456"
}
```

Lưu `token` từ response!

### 3. Tạo danh mục
```http
POST http://localhost:5000/api/categories
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tenDanhMuc": "Giày Thể Thao",
  "moTa": "Giày chạy bộ, gym, bóng đá"
}
```

### 4. Tạo sản phẩm
```http
POST http://localhost:5000/api/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "tenSanPham": "Giày Nike Air Max 2024",
  "moTa": "Giày chạy bộ cao cấp",
  "moTaChiTiet": "Thiết kế hiện đại, êm ái",
  "gia": 2500000,
  "giaKhuyenMai": 2000000,
  "hinhAnh": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff"],
  "danhMuc": "CATEGORY_ID_FROM_STEP_3",
  "thuongHieu": "Nike",
  "xuatXu": "Vietnam",
  "kichThuoc": [
    { "size": "39", "soLuong": 10 },
    { "size": "40", "soLuong": 15 }
  ],
  "mauSac": [
    { "mau": "Đen", "maMau": "#000000", "soLuong": 15 }
  ],
  "tongSoLuong": 25,
  "noiBat": true,
  "sanPhamMoi": true
}
```

---

## 🎉 DONE!

Bây giờ bạn có:
- ✅ Backend API chạy tốt
- ✅ Customer Web với homepage đẹp
- ✅ Admin Web với login page
- ✅ MongoDB connected
- ✅ Sẵn sàng phát triển tiếp

---

## 📞 CẦN TRỢ GIÚP?

Xem thêm:
- [QUICKSTART.md](QUICKSTART.md) - Hướng dẫn chi tiết
- [GUIDE.md](GUIDE.md) - Development guide
- [PROGRESS_UPDATE.md](PROGRESS_UPDATE.md) - Cập nhật mới nhất

---

**Date**: 2025-11-29
**Status**: Ready to run! 🚀
