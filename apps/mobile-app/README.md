# 📱 Thể Thao Pro - Mobile App

React Native mobile application cho hệ thống thương mại điện tử thể thao.

## 🚀 Công nghệ sử dụng

- **React Native** với Expo
- **TypeScript**
- **React Navigation** (Stack & Bottom Tabs)
- **Axios** - HTTP client
- **AsyncStorage** - Local storage
- **Expo Vector Icons** - Icons

## 📂 Cấu trúc thư mục

```
mobile-app/
├── src/
│   ├── components/         # Reusable components
│   ├── screens/           # Screen components
│   │   ├── Auth/          # Login, Register
│   │   ├── Home/          # Home screen
│   │   ├── Product/       # Product listing, detail
│   │   ├── Cart/          # Shopping cart
│   │   ├── Checkout/      # Checkout flow
│   │   ├── Chat/          # AI Chat
│   │   └── Profile/       # User profile
│   ├── navigation/        # Navigation setup
│   ├── contexts/          # React Context (Auth, Cart)
│   ├── services/          # API services
│   ├── constants/         # Constants, config
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── App.tsx               # Entry point
└── package.json
```

## 🛠️ Cài đặt

### Yêu cầu

- Node.js >= 18
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Các bước cài đặt

1. **Cài đặt dependencies:**

```bash
cd apps/mobile-app
npm install
```

2. **Cấu hình Backend URL:**

Mở file `src/constants/config.ts` và cập nhật `API_URL`:

```typescript
export const API_URL = __DEV__
  ? 'http://YOUR_IP:5000/api'  // Thay YOUR_IP bằng IP máy chủ backend
  : 'https://your-production-api.com/api';
```

**Lưu ý IP cho các thiết bị:**
- **Android Emulator**: `http://10.0.2.2:5000/api`
- **iOS Simulator**: `http://localhost:5000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:5000/api`

3. **Chạy Backend API:**

Đảm bảo backend đang chạy trên `http://localhost:5000`

```bash
cd apps/backend
npm run dev
```

## 🎯 Chạy ứng dụng

### Android

```bash
npm run android
```

### iOS (chỉ trên macOS)

```bash
npm run ios
```

### Web (Development)

```bash
npm run web
```

### Expo Go

1. Cài đặt Expo Go trên điện thoại:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. Chạy development server:

```bash
npm start
```

3. Quét QR code bằng Expo Go

## 📋 Features

### ✅ Đã hoàn thành

- **Authentication**
  - Đăng nhập
  - Đăng ký
  - Logout
  - JWT token management

- **Navigation**
  - Stack Navigator
  - Bottom Tab Navigator
  - Authenticated/Unauthenticated flows

- **Contexts**
  - AuthContext - Quản lý authentication
  - CartContext - Quản lý giỏ hàng

- **API Integration**
  - Axios setup với interceptors
  - Token auto-injection
  - Error handling

- **Screens (Placeholders)**
  - Home
  - Products
  - Product Detail
  - Cart
  - Checkout
  - AI Chat
  - Profile

### 🔨 Cần phát triển

- **Home Screen**: Hiển thị sản phẩm nổi bật, banner
- **Product Listing**: Grid view, filters, search
- **Product Detail**: Images, specs, add to cart
- **Cart**: Item management, quantity update
- **Checkout**: Address form, payment methods
- **AI Chat**: Tích hợp Gemini API, chat UI
- **Profile**: Order history, wishlist, settings
- **Notifications**: Push notifications
- **Payment Integration**: VNPay, MoMo

## 🎨 Thiết kế

App sử dụng design system từ `src/constants/config.ts`:

```typescript
COLORS: {
  primary: '#3B82F6',    // Blue
  success: '#10B981',    // Green
  danger: '#EF4444',     // Red
  warning: '#F59E0B',    // Yellow
}

SIZES: {
  h1: 32,
  h2: 24,
  body: 16,
  padding: 16,
  borderRadius: 8,
}
```

## 🔧 Debug

### Xem logs

```bash
# Expo logs
npx expo start

# React Native logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

### Clear cache

```bash
npx expo start -c
```

## 📦 Build Production

### Android (APK)

```bash
eas build --platform android --profile preview
```

### iOS (IPA)

```bash
eas build --platform ios --profile preview
```

## 🤝 Contributing

1. Tạo branch mới: `git checkout -b feature/ten-tinh-nang`
2. Commit changes: `git commit -m 'Add some feature'`
3. Push to branch: `git push origin feature/ten-tinh-nang`
4. Tạo Pull Request

## 📄 License

MIT License

## 👥 Team

Mobile App Team - Thể Thao Pro

---

**Happy Coding! 🎉**
