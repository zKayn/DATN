# 🏃‍♂️ Ứng Dụng Đa Nền Tảng Bán Đồ Thể Thao Tích Hợp AI

## 📋 Mô tả dự án

Hệ thống thương mại điện tử đa nền tảng chuyên bán đồ thể thao, tích hợp công nghệ AI để mang lại trải nghiệm mua sắm thông minh và hiện đại.

## 🏗️ Kiến trúc hệ thống

### Ứng dụng (Apps)
- **Customer Web**: Website dành cho khách hàng (Next.js 14)
- **Admin Web**: Website quản trị độc lập (Next.js 14)
- **Mobile App**: Ứng dụng di động (React Native)
- **Backend API**: API Server (Node.js + Express + MongoDB)

### Thư viện dùng chung (Packages)
- **ui**: Components UI dùng chung
- **types**: TypeScript types
- **utils**: Utilities functions
- **config**: Cấu hình chung

## 🚀 Công nghệ sử dụng

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Mobile**: React Native, Expo
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB, Mongoose
- **AI**: OpenAI API, TensorFlow.js
- **Authentication**: JWT, bcrypt
- **Payment**: VNPay, MoMo
- **Storage**: Cloudinary
- **Monorepo**: Turborepo

## 📦 Cài đặt

```bash
# Clone repository
git clone <repository-url>

# Cài đặt dependencies
npm install

# Copy env files
cp apps/backend/.env.example apps/backend/.env
cp apps/customer-web/.env.example apps/customer-web/.env.local
cp apps/admin-web/.env.example apps/admin-web/.env.local

# Chạy tất cả services
npm run dev

# Hoặc chạy từng service
npm run dev:customer   # Customer Web
npm run dev:admin      # Admin Web
npm run dev:mobile     # Mobile App
npm run dev:backend    # Backend API
```

## 🌟 Tính năng chính

### Khách hàng
- ✅ Trang chủ hiện đại với banner động
- ✅ Tìm kiếm thông minh với AI
- ✅ Gợi ý sản phẩm cá nhân hóa
- ✅ Chatbot hỗ trợ 24/7
- ✅ Giỏ hàng & thanh toán trực tuyến
- ✅ Theo dõi đơn hàng realtime
- ✅ Đánh giá & review sản phẩm
- ✅ Wishlist yêu thích

### Admin
- ✅ Dashboard analytics
- ✅ Quản lý sản phẩm, đơn hàng
- ✅ Quản lý khách hàng
- ✅ Báo cáo AI insights
- ✅ Quản lý khuyến mãi
- ✅ Phân quyền nhân viên

### Mobile App
- ✅ UI/UX tối ưu cho mobile
- ✅ Push notifications
- ✅ Quét QR code
- ✅ Thanh toán ví điện tử
- ✅ Offline mode

## 📱 Ports

- Customer Web: http://localhost:3000
- Admin Web: http://localhost:3001
- Backend API: http://localhost:5000
- Mobile App: Expo Go

## 📄 License

MIT License

## 👥 Đội ngũ phát triển

DATN - 2025
