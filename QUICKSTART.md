# 🚀 HƯỚNG DẪN KHỞI CHẠY NHANH

## ✅ NHỮNG GÌ ĐÃ CÓ

Dự án đã được setup với cấu trúc hoàn chỉnh bao gồm:

### 1. **Backend API** (✅ 100%)
- 44 API endpoints hoàn chỉnh
- MongoDB models & schemas
- Authentication với JWT
- AI Chatbot (OpenAI)
- Upload hình ảnh (Cloudinary)
- Payment VNPay
- ~2,500 lines of code

### 2. **Customer Web** (✅ 40%)
- Next.js 14 setup hoàn chỉnh
- Header & Footer responsive
- Tailwind CSS configured
- Homepage structure
- ~500 lines of code

### 3. **Admin Web** (✅ 30%)
- Next.js 14 setup
- Login page đẹp
- Tailwind configured
- Ready cho dashboard

## 📦 BƯỚC 1: CÀI ĐẶT

```bash
# 1. Cài dependencies cho root
npm install

# 2. Cài dependencies cho Backend
cd apps/backend
npm install

# 3. Cài dependencies cho Customer Web
cd ../customer-web
npm install

# 4. Cài dependencies cho Admin Web
cd ../admin-web
npm install

# Quay về root
cd ../..
```

## ⚙️ BƯỚC 2: CẤU HÌNH MÔI TRƯỜNG

### Backend (.env)

```bash
cd apps/backend
cp .env.example .env
```

Mở file `.env` và điền thông tin:

```env
# Server
PORT=5000
NODE_ENV=development

# Database - QUAN TRỌNG!
# Option 1: MongoDB Local
MONGODB_URI=mongodb://localhost:27017/sports-store

# Option 2: MongoDB Atlas (Khuyến nghị)
# Đăng ký free tại: https://cloud.mongodb.com
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-store

# JWT Secret - Tạo random string
JWT_SECRET=my-super-secret-key-2025-change-this
JWT_EXPIRE=7d

# Cloudinary (Upload ảnh) - Free tier
# Đăng ký tại: https://cloudinary.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OpenAI (AI Chatbot)
# Lấy key tại: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-api-key

# Email (tùy chọn)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# VNPay (tùy chọn - dùng sandbox)
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3000/payment/vnpay-return

# URLs
CLIENT_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001
```

### Customer Web (.env.local)

```bash
cd ../customer-web
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=Cửa Hàng Thể Thao
```

### Admin Web (.env.local)

```bash
cd ../admin-web
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_NAME=Admin - Quản Trị
```

## 🗄️ BƯỚC 3: SETUP MONGODB

### Option 1: MongoDB Local (Đơn giản)

```bash
# Windows - Download & install từ:
# https://www.mongodb.com/try/download/community

# Sau khi cài, chạy:
mongod

# MongoDB sẽ chạy tại: mongodb://localhost:27017
```

### Option 2: MongoDB Atlas (Khuyến nghị)

1. Truy cập: https://cloud.mongodb.com
2. Tạo tài khoản miễn phí
3. Tạo cluster (chọn FREE tier)
4. Tạo Database User (username & password)
5. Whitelist IP: 0.0.0.0/0 (cho phép tất cả)
6. Lấy connection string và paste vào `.env`

## 🚀 BƯỚC 4: CHẠY ỨNG DỤNG

### Cách 1: Chạy tất cả cùng lúc (Khuyến nghị)

```bash
# Từ thư mục root
npm run dev

# Hoặc dùng Turbo
npx turbo run dev
```

Ứng dụng sẽ chạy tại:
- **Backend API**: http://localhost:5000
- **Customer Web**: http://localhost:3000
- **Admin Web**: http://localhost:3001

### Cách 2: Chạy từng service

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Customer Web
cd apps/customer-web
npm run dev

# Terminal 3 - Admin Web
cd apps/admin-web
npm run dev
```

## 🧪 BƯỚC 5: TEST API

### Sử dụng Thunder Client / Postman

#### 1. Đăng ký tài khoản

```http
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "hoTen": "Nguyễn Văn A",
  "email": "admin@example.com",
  "matKhau": "123456",
  "soDienThoai": "0987654321"
}
```

Response:
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "_id": "...",
      "hoTen": "Nguyễn Văn A",
      "email": "admin@example.com",
      "vaiTro": "khach-hang"
    }
  }
}
```

#### 2. Đăng nhập

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "matKhau": "123456"
}
```

#### 3. Tạo danh mục (cần token)

```http
POST http://localhost:5000/api/categories
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "tenDanhMuc": "Giày Thể Thao",
  "moTa": "Giày thể thao nam nữ chính hãng"
}
```

#### 4. Tạo sản phẩm

```http
POST http://localhost:5000/api/products
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE

{
  "tenSanPham": "Giày Nike Air Max 2024",
  "moTa": "Giày thể thao Nike Air Max phiên bản mới nhất",
  "moTaChiTiet": "Thiết kế hiện đại, êm ái, phù hợp cho chạy bộ và tập gym",
  "gia": 2500000,
  "giaKhuyenMai": 2000000,
  "hinhAnh": [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
  ],
  "danhMuc": "CATEGORY_ID_HERE",
  "thuongHieu": "Nike",
  "xuatXu": "Vietnam",
  "kichThuoc": [
    { "size": "39", "soLuong": 10 },
    { "size": "40", "soLuong": 15 },
    { "size": "41", "soLuong": 20 }
  ],
  "mauSac": [
    { "mau": "Đen", "maMau": "#000000", "soLuong": 25 },
    { "mau": "Trắng", "maMau": "#FFFFFF", "soLuong": 20 }
  ],
  "tongSoLuong": 45,
  "noiBat": true,
  "sanPhamMoi": true
}
```

#### 5. Test AI Chatbot

```http
POST http://localhost:5000/api/ai/chatbot
Content-Type: application/json

{
  "message": "Cho tôi gợi ý giày chạy bộ tốt"
}
```

## 📱 BƯỚC 6: TRUY CẬP GIAO DIỆN

### Customer Web: http://localhost:3000
- Trang chủ
- Header với search, cart, wishlist
- Footer đầy đủ
- Responsive mobile

### Admin Web: http://localhost:3001
- Trang đăng nhập
- Demo credentials: admin@example.com / password123

## 🎨 BƯỚC 7: THÊM DỮ LIỆU MẪU

### Script seed data (tạo file seed.js)

```javascript
// apps/backend/seed.js
const mongoose = require('mongoose');
const Category = require('./src/models/Category');
const Product = require('./src/models/Product');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  // Xóa dữ liệu cũ
  await Category.deleteMany({});
  await Product.deleteMany({});

  // Tạo danh mục
  const categories = await Category.create([
    { tenDanhMuc: 'Giày Thể Thao', moTa: 'Giày chạy bộ, gym, bóng đá' },
    { tenDanhMuc: 'Quần Áo', moTa: 'Áo thun, quần short, áo khoác thể thao' },
    { tenDanhMuc: 'Dụng Cụ Tập', moTa: 'Tạ, dây kéo, máy tập' },
    { tenDanhMuc: 'Phụ Kiện', moTa: 'Túi, bình nước, găng tay' }
  ]);

  // Tạo sản phẩm mẫu
  await Product.create([
    {
      tenSanPham: 'Giày Nike Air Max 2024',
      moTa: 'Giày chạy bộ cao cấp',
      moTaChiTiet: 'Thiết kế hiện đại, êm ái',
      gia: 2500000,
      giaKhuyenMai: 2000000,
      hinhAnh: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff'],
      danhMuc: categories[0]._id,
      thuongHieu: 'Nike',
      xuatXu: 'Vietnam',
      kichThuoc: [
        { size: '39', soLuong: 10 },
        { size: '40', soLuong: 15 }
      ],
      mauSac: [
        { mau: 'Đen', maMau: '#000000', soLuong: 15 },
        { mau: 'Trắng', maMau: '#FFFFFF', soLuong: 10 }
      ],
      tongSoLuong: 25,
      noiBat: true,
      sanPhamMoi: true
    },
    // Thêm nhiều sản phẩm khác...
  ]);

  console.log('✅ Seed data thành công!');
  process.exit(0);
}

seed().catch(console.error);
```

Chạy:
```bash
cd apps/backend
node seed.js
```

## 🐛 TROUBLESHOOTING

### Lỗi MongoDB connection
```bash
# Kiểm tra MongoDB đang chạy
mongod --version

# Kiểm tra connection string trong .env
# Đảm bảo username/password đúng
```

### Lỗi Port đã sử dụng
```bash
# Windows - Kill port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Hoặc đổi PORT trong .env
PORT=5001
```

### Lỗi OpenAI API
```bash
# Nếu chưa có key, chatbot sẽ trả về message mặc định
# Không ảnh hưởng các tính năng khác
```

## 📚 API DOCUMENTATION

### Xem tất cả endpoints:
Mở file: `PROJECT_SUMMARY.md` section "API ENDPOINTS"

### Test API:
1. Import Postman collection (TODO: tạo file)
2. Hoặc dùng Thunder Client extension trong VS Code

## 🎯 TIẾP THEO

1. **Hoàn thiện Customer Web**:
   - Tạo components cho Homepage
   - Tạo trang sản phẩm
   - Tích hợp API

2. **Hoàn thiện Admin Web**:
   - Dashboard
   - Quản lý sản phẩm
   - Quản lý đơn hàng

3. **Mobile App**:
   - Setup React Native
   - Tạo screens

## 💡 TIPS

1. **Hot reload**: Code thay đổi sẽ tự động reload
2. **API logs**: Check terminal Backend để xem requests
3. **React DevTools**: Install extension để debug React
4. **MongoDB Compass**: GUI tool để xem database

## ❓ CÂU HỎI

**Q: Tôi nên bắt đầu từ đâu?**
A: Chạy Backend trước, test API bằng Postman, sau đó chạy Frontend

**Q: Cần tài khoản gì?**
A:
- MongoDB Atlas (free)
- Cloudinary (free)
- OpenAI (optional, cần thẻ credit)

**Q: Code ở đâu?**
A:
- Backend: `apps/backend/src/`
- Customer Web: `apps/customer-web/`
- Admin Web: `apps/admin-web/`

**Q: Làm sao xem database?**
A: Dùng MongoDB Compass hoặc Atlas web interface

---

**🎉 Chúc bạn code vui vẻ!**

Nếu gặp lỗi, check file `GUIDE.md` hoặc `PROJECT_SUMMARY.md`
