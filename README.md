# 🏆 Hệ Thống E-Commerce Thể Thao - Đa Nền Tảng

> Hệ thống thương mại điện tử chuyên về đồ thể thao với đầy đủ tính năng hiện đại: Web (Admin & Customer), Mobile App (iOS & Android), AI Chatbot powered by Google Gemini, và nhiều hơn nữa.

## 📋 Tổng Quan Dự Án

Dự án bao gồm 4 ứng dụng chính:

1. **Backend API** - Node.js + Express + MongoDB
2. **Admin Web** - Next.js (Quản lý hệ thống)
3. **Customer Web** - Next.js (Giao diện khách hàng)
4. **Mobile App** - React Native + Expo (iOS & Android)

## 🚀 Công Nghệ Sử Dụng

### Backend
- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcryptjs
- **AI**: Google Gemini API
- **File Upload**: Multer + Cloudinary
- **Email**: Nodemailer
- **Payment**: VNPay Integration

### Frontend Web (Admin + Customer)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts (Admin)

### Mobile App
- **Framework**: React Native + Expo SDK 50
- **Language**: TypeScript
- **Navigation**: React Navigation v6
- **State Management**: Context API
- **HTTP Client**: Axios
- **Storage**: AsyncStorage
- **Gestures**: React Native Gesture Handler

## 📁 Cấu Trúc Thư Mục

```
DATN/
├── apps/
│   ├── backend/          # API Server
│   ├── admin-web/        # Admin Dashboard
│   ├── customer-web/     # Customer Website
│   └── mobile-app/       # Mobile Application
├── package.json          # Workspace configuration
└── README.md            # Tài liệu này
```

## ⚙️ Cài Đặt & Chạy Dự Án

### Yêu Cầu Hệ Thống
- Node.js >= 18.0.0
- MongoDB đang chạy (local hoặc cloud)
- npm hoặc yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd DATN
```

### 2. Cài Đặt Dependencies
```bash
# Cài đặt cho tất cả các app (từ root)
npm install

# Hoặc cài riêng từng app
cd apps/backend && npm install
cd apps/admin-web && npm install
cd apps/customer-web && npm install
cd apps/mobile-app && npm install
```

### 3. Cấu Hình Environment Variables

#### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sports-store
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# VNPay
VNPAY_TMN_CODE=your-vnpay-code
VNPAY_HASH_SECRET=your-vnpay-secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:3001/thanh-toan/ket-qua
```

#### Admin Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Customer Web (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Khởi Chạy Ứng Dụng

#### Chạy Backend
```bash
cd apps/backend
npm run dev
# Server chạy tại: http://localhost:5000
```

#### Chạy Admin Web
```bash
cd apps/admin-web
npm run dev
# Website chạy tại: http://localhost:3000
```

#### Chạy Customer Web
```bash
cd apps/customer-web
npm run dev
# Website chạy tại: http://localhost:3001
```

#### Chạy Mobile App
```bash
cd apps/mobile-app
npm start
# Expo Dev Server sẽ khởi động
```

**Lưu ý Mobile App**:
- Cần cài **Expo Go SDK 50** trên thiết bị iOS/Android
- Download tại: https://expo.dev/go?sdkVersion=50
- Hoặc sử dụng iOS Simulator / Android Emulator

## 📱 Hướng Dẫn Mobile App Chi Tiết

### Yêu Cầu
- Expo Go SDK 50 (Quan trọng!)
- Backend đang chạy tại localhost:5000

### Cài Đặt Expo Go SDK 50

#### Trên Android
1. Truy cập: https://expo.dev/go?sdkVersion=50&platform=android
2. Tải file APK
3. Cài đặt trên thiết bị

#### Trên iOS
1. Truy cập: https://expo.dev/go?sdkVersion=50&platform=ios
2. Làm theo hướng dẫn cài qua TestFlight
3. Hoặc sử dụng iOS Simulator (cần macOS + Xcode)

### Chạy App

1. **Khởi động Backend** (bắt buộc):
```bash
cd apps/backend
npm run dev
```

2. **Khởi động Expo Dev Server**:
```bash
cd apps/mobile-app
npx expo start
```

3. **Mở App trên thiết bị**:
   - Mở Expo Go app (SDK 50)
   - Quét QR code từ terminal
   - App sẽ load và kết nối với backend

### Cấu Hình API URL cho Mobile

Nếu backend không chạy trên localhost hoặc bạn test trên thiết bị thật:

Mở file: `apps/mobile-app/src/constants/config.ts`

```typescript
export const API_URL = __DEV__
  ? 'http://192.168.1.x:5000/api' // Thay bằng IP máy tính của bạn
  : 'https://your-production-api.com/api';
```

**Lấy IP máy tính**:
```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

### Build Production (Tùy chọn - Cho Windows)

Nếu muốn build file APK/IPA từ Windows:

```bash
# Cài EAS CLI
npm install -g eas-cli

# Đăng nhập Expo
eas login

# Build Android
eas build --platform android --profile preview

# Build iOS (cần Apple Developer Account)
eas build --platform ios --profile preview
```

File build sẽ được tạo trên cloud và có thể download về.

## 🔑 Tính Năng Chính

### Backend API
- ✅ RESTful API architecture
- ✅ JWT authentication & authorization
- ✅ CRUD operations cho tất cả entities
- ✅ Image upload với Cloudinary
- ✅ AI Chatbot với Google Gemini API
- ✅ Email notifications
- ✅ VNPay payment integration
- ✅ Order management
- ✅ Analytics & statistics

### Admin Web
- ✅ Dashboard với biểu đồ thống kê
- ✅ Quản lý sản phẩm, danh mục, thương hiệu
- ✅ Quản lý đơn hàng
- ✅ Quản lý người dùng & khách hàng
- ✅ Quản lý khuyến mãi & mã giảm giá
- ✅ Upload hình ảnh
- ✅ Xem lịch sử chat AI
- ✅ Responsive design

### Customer Web
- ✅ Trang chủ với banner, sản phẩm nổi bật
- ✅ **Tìm kiếm real-time** (gõ là thấy kết quả ngay - debounce 500ms)
- ✅ Lọc & sắp xếp sản phẩm
- ✅ Chi tiết sản phẩm với đánh giá
- ✅ Giỏ hàng
- ✅ Checkout & thanh toán VNPay
- ✅ Quản lý tài khoản & đơn hàng
- ✅ AI Chatbot hỗ trợ 24/7
- ✅ Responsive mobile-friendly

### Mobile App
- ✅ Đăng nhập / Đăng ký
- ✅ Home screen với banner carousel
- ✅ Danh sách & tìm kiếm sản phẩm
- ✅ Chi tiết sản phẩm
- ✅ Giỏ hàng
- ✅ Checkout
- ✅ AI Chat hỗ trợ
- ✅ Quản lý đơn hàng
- ✅ Profile & settings
- ✅ Cross-platform (iOS & Android)

## 🤖 AI Chatbot

AI Chatbot sử dụng **Google Gemini API** để:
- Tư vấn sản phẩm thể thao
- Trả lời câu hỏi về đơn hàng
- Hỗ trợ chọn size, màu sắc
- Giải đáp thắc mắc về vận chuyển, thanh toán
- Gợi ý sản phẩm phù hợp dựa trên preferences

## 💳 Thanh Toán

Hệ thống tích hợp **VNPay** với các phương thức:
- Thẻ ATM nội địa
- Thẻ tín dụng/ghi nợ quốc tế
- QR Code VNPay
- Ví điện tử

## 📊 Database Schema

### Collections Chính
- `users` - Người dùng (admin, staff, customer)
- `products` - Sản phẩm
- `categories` - Danh mục
- `brands` - Thương hiệu
- `orders` - Đơn hàng
- `reviews` - Đánh giá
- `promotions` - Khuyến mãi
- `coupons` - Mã giảm giá
- `chats` - Lịch sử chat AI

## 🔒 Bảo Mật

- JWT tokens với expiration
- Password hashing với bcrypt (10 rounds)
- Input validation & sanitization
- CORS configuration
- Rate limiting
- Secure headers (helmet)
- XSS protection

## 🛠️ Development Scripts

### Backend
```bash
npm run dev          # Dev với nodemon
npm start           # Production
npm run seed        # Seed database với sample data
```

### Frontend (Admin/Customer Web)
```bash
npm run dev         # Development server
npm run build       # Production build
npm start           # Start production server
npm run lint        # ESLint check
```

### Mobile App
```bash
npm start           # Start Expo
npx expo start -c   # Start với cache clear
npx expo run:android # Build & run Android (cần Android Studio)
npx expo run:ios    # Build & run iOS (cần macOS + Xcode)
```

## 📝 API Endpoints Chính

### Authentication
```
POST   /api/auth/register       # Đăng ký
POST   /api/auth/login          # Đăng nhập
GET    /api/auth/profile        # Lấy profile (Auth required)
PUT    /api/auth/profile        # Cập nhật profile (Auth required)
POST   /api/auth/change-password # Đổi mật khẩu (Auth required)
```

### Products
```
GET    /api/san-pham            # Danh sách sản phẩm (có filter, sort, pagination)
GET    /api/san-pham/:id        # Chi tiết sản phẩm
POST   /api/san-pham            # Tạo sản phẩm (Admin only)
PUT    /api/san-pham/:id        # Cập nhật (Admin only)
DELETE /api/san-pham/:id        # Xóa (Admin only)
GET    /api/san-pham/search     # Tìm kiếm sản phẩm
```

### Orders
```
GET    /api/don-hang            # Danh sách đơn hàng (Admin hoặc của user)
GET    /api/don-hang/:id        # Chi tiết đơn hàng
POST   /api/don-hang            # Tạo đơn hàng mới
PUT    /api/don-hang/:id/status # Cập nhật trạng thái (Admin/Staff)
DELETE /api/don-hang/:id        # Hủy đơn hàng
```

### Chat AI
```
POST   /api/chat/ai             # Gửi tin nhắn đến AI
GET    /api/chat/history        # Lịch sử chat
DELETE /api/chat/:id            # Xóa cuộc trò chuyện
```

### Reviews
```
GET    /api/danh-gia/san-pham/:id  # Đánh giá của sản phẩm
POST   /api/danh-gia                # Tạo đánh giá mới
PUT    /api/danh-gia/:id            # Cập nhật đánh giá
DELETE /api/danh-gia/:id            # Xóa đánh giá
```

*(Xem chi tiết đầy đủ API docs trong code backend/routes)*

## 🐛 Troubleshooting

### Backend không kết nối MongoDB
```bash
# Kiểm tra MongoDB đang chạy
mongosh
# Hoặc trên Linux
sudo systemctl status mongod
```

Nếu chưa có MongoDB, cài đặt:
- MongoDB Community: https://www.mongodb.com/try/download/community
- Hoặc dùng MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas

### Frontend không kết nối API
1. Kiểm tra `NEXT_PUBLIC_API_URL` trong `.env.local`
2. Đảm bảo backend đang chạy tại port 5000
3. Kiểm tra CORS settings trong backend

### Mobile App - TurboModule Error
Nếu gặp lỗi "PlatformConstants not found":
1. Đảm bảo đang dùng **Expo Go SDK 50** (không phải SDK 54)
2. Xóa cache: `npx expo start -c`
3. Reinstall: `rm -rf node_modules && npm install`

### Mobile App không kết nối Backend
1. Kiểm tra backend đang chạy
2. Nếu test trên thiết bị thật:
   - Cập nhật IP trong `apps/mobile-app/src/constants/config.ts`
   - Đảm bảo cùng mạng WiFi
3. Tắt firewall tạm thời để test

### Expo Go SDK Version Mismatch
```
ERROR  Project is incompatible with this version of Expo Go
```

**Giải pháp**:
- Gỡ Expo Go hiện tại
- Tải đúng Expo Go SDK 50 từ: https://expo.dev/go?sdkVersion=50
- Hoặc build custom development client (xem hướng dẫn ở trên)

## 📈 Performance Tips

### Frontend
- Sử dụng Next.js Image optimization
- Enable static generation cho pages không thay đổi
- Lazy load components với React.lazy()
- Memoize expensive computations

### Mobile
- Sử dụng FlatList cho danh sách dài
- Optimize images với react-native-fast-image
- Implement pagination
- Use React.memo cho components

### Backend
- Index các fields thường query
- Sử dụng select() để giới hạn fields trả về
- Implement caching (Redis)
- Paginate large datasets

## 🔄 Cập Nhật Gần Đây

### v1.0.0 (Tháng 12/2025)
- ✅ Hoàn thiện mobile app với Expo SDK 50
- ✅ **Tìm kiếm real-time** trong Customer Web (debounce 500ms)
- ✅ Tích hợp Google Gemini AI Chatbot
- ✅ VNPay payment integration
- ✅ Responsive design toàn bộ hệ thống
- ✅ Cross-platform mobile (iOS & Android)

## 📞 Liên Hệ & Hỗ Trợ

Nếu gặp vấn đề hoặc cần hỗ trợ:
- **Email**: support@thethaopro.com
- **GitHub Issues**: [Link to issues]
- **Documentation**: [Link to full docs]

## 👥 Đội Ngũ Phát Triển

Dự án đồ án tốt nghiệp - DATN 2025

## 📄 License

Dự án này thuộc quyền sở hữu của nhóm phát triển. Không được sao chép hoặc sử dụng cho mục đích thương mại mà không có sự cho phép.

---

**Phiên bản**: 1.0.0
**Cập nhật lần cuối**: Tháng 12/2025
**Status**: ✅ Production Ready
