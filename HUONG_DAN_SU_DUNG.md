# 📚 HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG BÁN ĐỒ THỂ THAO

## 🚀 Bắt Đầu Nhanh

### Yêu Cầu Hệ Thống
- **Node.js**: >= 18.0.0
- **MongoDB**: >= 5.0
- **npm** hoặc **yarn**

### Cài Đặt Lần Đầu

1. **Clone repository và cài đặt dependencies:**
```bash
cd DATN
npm install
```

2. **Cấu hình môi trường:**

Tạo file `.env` trong thư mục `apps/backend`:
```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sports-store

# JWT
JWT_SECRET=your-super-secret-key-here

# OpenAI (Optional)
OPENAI_API_KEY=sk-your-openai-api-key

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Payment Gateways (Optional)
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
MOMO_PARTNER_CODE=your-momo-code
MOMO_ACCESS_KEY=your-momo-key
MOMO_SECRET_KEY=your-momo-secret
```

Tạo file `.env.local` trong `apps/customer-web`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Tạo file `.env.local` trong `apps/admin-web`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. **Chạy ứng dụng:**
```bash
# Windows: Sử dụng script tự động kill processes cũ
./start.bat

# Hoặc chạy thủ công
npm run dev
```

Ứng dụng sẽ chạy tại:
- **Backend API**: http://localhost:5000
- **Customer Web**: http://localhost:3000
- **Admin Web**: http://localhost:3001

---

## 🏗️ Kiến Trúc Hệ Thống

```
DATN/
├── apps/
│   ├── backend/           # Backend API (Node.js + Express + MongoDB)
│   ├── customer-web/      # Website khách hàng (Next.js 14)
│   ├── admin-web/         # Website quản trị (Next.js 14)
│   └── mobile/            # Mobile app (React Native + Expo)
├── packages/              # Shared packages
├── start.bat             # Script khởi động tự động
└── kill-ports.js         # Script dọn dẹp ports
```

---

## 🛠️ ADMIN WEB - QUẢN TRỊ HỆ THỐNG

### Đăng Nhập

Truy cập: http://localhost:3001

**Tài khoản mặc định:**
- Email: `admin@example.com`
- Password: `admin123`

### 1. Dashboard (Tổng Quan)

**URL**: `/dashboard`

Hiển thị:
- 📊 **Thống kê tổng quan**: Tổng đơn hàng, doanh thu, khách hàng, sản phẩm
- 📋 **Đơn hàng gần đây**: 5 đơn hàng mới nhất
- 📈 **Loading states**: Skeleton UI khi đang tải dữ liệu

**Dữ liệu từ API:**
- `GET /api/stats` - Lấy thống kê tổng quan
- `GET /api/orders?limit=5` - Lấy đơn hàng gần đây

---

### 2. Quản Lý Sản Phẩm

**URL**: `/dashboard/san-pham`

#### Chức Năng:

✅ **Xem danh sách sản phẩm**
- Hiển thị: Hình ảnh, tên, danh mục, giá, tồn kho, đã bán
- Phân trang: 10 sản phẩm/trang
- Tìm kiếm theo tên, SKU

✅ **Thêm sản phẩm mới**
- Click nút "Thêm Sản Phẩm Mới"
- Điền đầy đủ thông tin:
  - Tên sản phẩm (*)
  - Danh mục (*)
  - Thương hiệu (*)
  - Giá gốc (*), Giá khuyến mãi
  - Số lượng tồn kho (*)
  - Hình ảnh (URLs)
  - Màu sắc (tên + mã màu hex)
  - Đặc điểm nổi bật
  - Trạng thái: Đang bán / Tạm ẩn

✅ **Chỉnh sửa sản phẩm**
- Click icon bút chì trên sản phẩm
- Cập nhật thông tin
- Lưu thay đổi

✅ **Xóa sản phẩm**
- Click icon thùng rác
- Xác nhận xóa

✅ **Bật/tắt trạng thái**
- Click badge trạng thái để toggle

**API Endpoints:**
```
GET    /api/products              - Lấy danh sách
POST   /api/products              - Thêm mới
PUT    /api/products/:id          - Cập nhật
DELETE /api/products/:id          - Xóa
```

---

### 3. Quản Lý Danh Mục

**URL**: `/dashboard/danh-muc`

#### Chức Năng:

✅ **Xem danh sách danh mục** (Grid layout)
- Hiển thị: Tên, mô tả, thứ tự, trạng thái

✅ **Thêm danh mục**
- Click "Thêm Danh Mục"
- Modal form hiện lên
- Điền:
  - Tên danh mục (*)
  - Mô tả
  - Hình ảnh (URL)
  - Thứ tự hiển thị
  - Trạng thái

✅ **Chỉnh sửa danh mục**
- Click nút "Sửa" trên card danh mục
- Modal chỉnh sửa hiện lên

✅ **Xóa danh mục**
- Click nút "Xóa"
- Xác nhận

**API Endpoints:**
```
GET    /api/categories            - Lấy danh sách
POST   /api/categories            - Thêm mới
PUT    /api/categories/:id        - Cập nhật
DELETE /api/categories/:id        - Xóa
```

---

### 4. Quản Lý Đơn Hàng

**URL**: `/dashboard/don-hang`

#### Chức Năng:

✅ **Xem danh sách đơn hàng**
- Hiển thị: Mã đơn, khách hàng, sản phẩm, tổng tiền, thanh toán, trạng thái
- Phân trang: 10 đơn/trang

✅ **Lọc theo trạng thái**
- Tất cả
- Chờ xác nhận
- Đã xác nhận
- Đang giao
- Đã giao
- Đã hủy

✅ **Cập nhật trạng thái đơn hàng**
- Click vào dropdown trạng thái
- Chọn trạng thái mới
- Tự động cập nhật lên server

✅ **Xem chi tiết đơn hàng**
- Click icon mắt
- Xem đầy đủ thông tin

**API Endpoints:**
```
GET /api/orders                    - Lấy danh sách
GET /api/orders/:id                - Chi tiết
PUT /api/orders/:id/status         - Cập nhật trạng thái
```

---

## 🛍️ CUSTOMER WEB - WEBSITE KHÁCH HÀNG

### Trang Chủ
**URL**: http://localhost:3000

**Sections:**
- 🎯 Hero Banner
- 🔥 Flash Sale
- 📦 Danh mục sản phẩm
- ⭐ Sản phẩm nổi bật
- 💬 Chatbot AI
- 📰 Footer

---

### Trang Sản Phẩm
**URL**: `/san-pham`

**Chức năng:**

✅ **Bộ lọc (Sidebar)**
- Sắp xếp: Mới nhất, Giá, Bán chạy, Đánh giá
- Danh mục
- Khoảng giá (min-max)
- Thương hiệu (checkbox)
- Kích thước (buttons)
- Màu sắc (color picker)
- Đánh giá (stars)

✅ **Danh sách sản phẩm**
- Grid 2-4 cột responsive
- Hiển thị: Hình ảnh, tên, giá, giảm giá, rating
- Phân trang: 12 sản phẩm/trang

✅ **Mobile Responsive**
- Bộ lọc dạng modal trên mobile
- Grid 2 cột trên mobile

---

### Trang Chi Tiết Sản Phẩm
**URL**: `/san-pham/[slug]`

**Sections:**

✅ **Image Gallery**
- Main image lớn
- Thumbnails dưới
- Click để zoom
- Previous/Next navigation
- Counter "1/4"

✅ **Thông tin sản phẩm**
- Tên, thương hiệu, rating
- Giá, giảm giá %
- Chọn màu sắc (color swatches)
- Chọn kích thước (buttons)
- Chọn số lượng (+ / -)
- Thêm vào giỏ hàng
- Yêu thích (heart icon)
- Đặc điểm nổi bật
- Thông số kỹ thuật

✅ **Review Section**
- Tổng quan đánh giá (rating trung bình)
- Biểu đồ phân bố sao
- Lọc & sắp xếp đánh giá
- Form viết đánh giá
- Hiển thị đánh giá với hình ảnh
- Nút "Hữu ích"

✅ **Sản phẩm liên quan**
- 4 sản phẩm tương tự

---

### Giỏ Hàng
**URL**: `/gio-hang`

**Chức năng:**

✅ **Danh sách sản phẩm trong giỏ**
- Hình ảnh, tên, size, màu
- Giá, giảm giá
- Điều chỉnh số lượng
- Xóa sản phẩm
- Checkbox chọn sản phẩm

✅ **Tóm tắt đơn hàng**
- Tạm tính
- Phí vận chuyển (miễn phí từ 500k)
- Tổng cộng
- Nút tiến hành thanh toán

✅ **Trạng thái rỗng**
- Hiển thị khi giỏ hàng trống
- Link đến trang sản phẩm

---

### Thanh Toán
**URL**: `/thanh-toan`

**Form thông tin:**

✅ **Thông tin giao hàng**
- Họ tên (*)
- Số điện thoại (*)
- Email
- Địa chỉ (*)
- Tỉnh/Thành phố (*)
- Quận/Huyện
- Ghi chú

✅ **Phương thức thanh toán**
- COD (Thanh toán khi nhận hàng)
- VNPay
- MoMo

✅ **Sử dụng điểm tích lũy**
- Checkbox để sử dụng điểm

✅ **Tóm tắt đơn hàng**
- Danh sách sản phẩm mini
- Tính tổng tiền
- Phí ship
- Giảm giá từ điểm

---

### Tài Khoản Người Dùng
**URL**: `/tai-khoan`

**Sidebar Menu:**
- Thông tin cá nhân
- Đơn hàng của tôi
- Sản phẩm yêu thích
- Địa chỉ nhận hàng
- Đổi mật khẩu
- Điểm tích lũy
- Đăng xuất

**Tabs:**

✅ **Thông tin cá nhân**
- Form cập nhật: Tên, email, phone, giới tính, ngày sinh
- Avatar hiển thị

✅ **Địa chỉ nhận hàng**
- Danh sách địa chỉ
- Đánh dấu địa chỉ mặc định
- Thêm/Sửa/Xóa địa chỉ

✅ **Đổi mật khẩu**
- Mật khẩu hiện tại
- Mật khẩu mới
- Xác nhận mật khẩu

✅ **Điểm tích lũy**
- Hiển thị tổng điểm
- Lịch sử điểm (tăng/giảm)

---

## 🔌 API BACKEND

### Authentication
```
POST /api/auth/register          - Đăng ký
POST /api/auth/login             - Đăng nhập
GET  /api/auth/me                - Lấy thông tin user
PUT  /api/auth/profile           - Cập nhật profile
PUT  /api/auth/change-password   - Đổi mật khẩu
```

### Products
```
GET    /api/products              - Danh sách (filter, search, sort, paginate)
GET    /api/products/:id          - Chi tiết
POST   /api/products              - Thêm mới (Admin)
PUT    /api/products/:id          - Cập nhật (Admin)
DELETE /api/products/:id          - Xóa (Admin)
```

### Categories
```
GET    /api/categories            - Danh sách
POST   /api/categories            - Thêm (Admin)
PUT    /api/categories/:id        - Sửa (Admin)
DELETE /api/categories/:id        - Xóa (Admin)
```

### Orders
```
GET  /api/orders                  - Danh sách (User: own, Admin: all)
GET  /api/orders/:id              - Chi tiết
POST /api/orders                  - Tạo đơn hàng
PUT  /api/orders/:id/status       - Cập nhật trạng thái (Admin)
PUT  /api/orders/:id/cancel       - Hủy đơn (User)
```

### Reviews
```
GET  /api/reviews/product/:id     - Reviews của sản phẩm
POST /api/reviews                 - Tạo review
PUT  /api/reviews/:id             - Cập nhật
DELETE /api/reviews/:id           - Xóa
POST /api/reviews/:id/helpful     - Đánh dấu hữu ích
```

### AI Chatbot
```
POST /api/ai/chat                 - Chat với AI
```

### Stats (Admin)
```
GET /api/stats                    - Thống kê tổng quan
```

---

## 🎨 Giao Diện & Design System

### Colors
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Danger**: Red (#EF4444)
- **Gray Scale**: 50-900

### Typography
- **Font**: System UI (sans-serif)
- **Sizes**: xs, sm, base, lg, xl, 2xl, 3xl

### Components
- **Buttons**: Primary, Secondary, Outline, Ghost
- **Cards**: Shadow, Border, Hover effects
- **Forms**: Input, Select, Textarea, Checkbox, Radio
- **Modals**: Overlay, Centered, Responsive
- **Tables**: Striped, Hover, Responsive

---

## 🐛 Xử Lý Lỗi Thường Gặp

### 1. Port đã được sử dụng
**Lỗi**: `EADDRINUSE :::5000` hoặc :::3000, :::3001

**Giải pháp:**
```bash
# Sử dụng script tự động
./start.bat

# Hoặc kill thủ công
npm run kill
npm run dev
```

### 2. MongoDB connection failed
**Lỗi**: `MongoDB connection error`

**Giải pháp:**
- Kiểm tra `MONGODB_URI` trong `.env`
- Đảm bảo MongoDB Atlas cho phép IP của bạn
- Check username/password

### 3. JWT Secret missing
**Lỗi**: `JWT_SECRET is not defined`

**Giải pháp:**
- Thêm `JWT_SECRET=your-secret-key` vào file `.env`

### 4. Next.js Image Error
**Lỗi**: `Invalid src prop`

**Giải pháp:**
- Thêm domain vào `next.config.js`:
```js
images: {
  domains: ['images.unsplash.com', 'i.pravatar.cc', 'res.cloudinary.com'],
}
```

---

## 📦 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deploy Backend
```bash
cd apps/backend
npm run build
# Deploy to Heroku, Railway, Vercel, etc.
```

### Deploy Frontend
```bash
# Customer Web
cd apps/customer-web
npm run build
# Deploy to Vercel

# Admin Web
cd apps/admin-web
npm run build
# Deploy to Vercel
```

---

## 🔐 Bảo Mật

- ✅ JWT authentication
- ✅ Password hashing với bcrypt
- ✅ CORS configured
- ✅ Input validation
- ✅ XSS protection
- ✅ SQL injection prevention (NoSQL)
- ⚠️ Cần thêm rate limiting cho production
- ⚠️ Cần HTTPS cho production

---

## 📞 Liên Hệ & Hỗ Trợ

- **Email**: support@sportsstore.com
- **GitHub Issues**: [Link to repo]
- **Documentation**: [Link to docs]

---

## 📝 Changelog

### Version 1.0.0 (2025-11-29)
- ✅ Backend API hoàn chỉnh với 44 endpoints
- ✅ Admin Web với quản lý sản phẩm, danh mục, đơn hàng
- ✅ Customer Web với trang chủ, sản phẩm, giỏ hàng, thanh toán
- ✅ MongoDB integration
- ✅ AI Chatbot (OpenAI)
- ✅ Payment gateways (VNPay, MoMo)
- ✅ Review system với hình ảnh
- ✅ Point system (điểm tích lũy)

---

**Chúc bạn sử dụng ứng dụng thành công! 🎉**
