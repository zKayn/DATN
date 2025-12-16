# Mobile App - Sports Store

Ứng dụng mobile React Native cho shop thể thao, được xây dựng với Expo.

## 🚀 Cài đặt

```bash
cd apps/mobile-app
npm install
```

## ▶️ Chạy app

```bash
npm start
# hoặc
npx expo start
```

Sau đó:
- **Quét QR code** bằng Expo Go app (iOS/Android)
- Nhấn `a` để mở Android emulator
- Nhấn `i` để mở iOS simulator (chỉ macOS)

## 📱 Yêu cầu

- Node.js >= 18
- npm >= 9
- **Expo Go** app trên điện thoại:
  - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
  - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## ⚙️ Cấu hình

### API URL

Mặc định app kết nối đến backend ở `localhost:5000`.

**Để chạy trên thiết bị thật:**

1. Tìm IP máy tính:
   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig
   ```

2. Sửa file `src/constants/config.ts`:
   ```typescript
   export const API_URL = 'http://192.168.1.X:5000/api';
   // Thay X bằng IP của bạn
   ```

3. Đảm bảo backend đang chạy:
   ```bash
   cd apps/backend
   npm run dev
   ```

## 🏗️ Cấu trúc dự án

```
mobile-app/
├── src/
│   ├── components/       # UI components
│   ├── screens/          # Màn hình
│   │   ├── Home/
│   │   ├── Product/
│   │   ├── Cart/
│   │   ├── Auth/
│   │   ├── Profile/
│   │   └── ...
│   ├── navigation/       # React Navigation setup
│   ├── contexts/         # Context API (Auth, Cart, Wishlist)
│   ├── services/         # API services
│   ├── constants/        # Colors, sizes, config
│   └── types/           # TypeScript types
├── assets/              # Images, fonts
├── App.tsx             # Root component
├── index.ts            # Entry point
└── app.json            # Expo config
```

## 🎨 Features

### Đã hoàn thành
- ✅ Bottom Tab Navigation (Home, Products, Wishlist, Chat, Profile)
- ✅ Authentication (Login/Register với JWT)
- ✅ Product listing với filters & sorting
- ✅ Product detail với variants (màu sắc, kích thước)
- ✅ Shopping cart với quantity management
- ✅ Checkout flow hoàn chỉnh
- ✅ Order management & history
- ✅ AI Chat support với product suggestions
- ✅ Wishlist với auto-fetch product details
- ✅ User profile & settings
- ✅ Search functionality với recent & popular searches
- ✅ Product reviews & ratings
- ✅ Empty states & loading overlays

### Components
- ProductCard với wishlist toggle
- SearchBar component
- LoadingOverlay
- EmptyState
- Custom hooks (useAsync)
- Utility functions (formatters)

## 🛠️ Tech Stack

- **Framework:** Expo SDK 54
- **Language:** TypeScript 5.3+
- **UI:** React Native 0.81.5
- **State:** Context API + AsyncStorage
- **Navigation:** React Navigation 7.x
- **HTTP:** Axios
- **Icons:** @expo/vector-icons (Ionicons)

## 🐛 Troubleshooting

Nếu gặp lỗi, xem file [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

### Lỗi thường gặp:

**1. "Cannot find module" hoặc "Metro bundler failed"**
```bash
# Clear cache và restart
npx expo start --clear
```

**2. "Network request failed" trên điện thoại**
- Kiểm tra backend đã chạy chưa
- Đổi `localhost` thành IP máy tính trong config.ts
- Đảm bảo điện thoại và máy tính cùng WiFi

**3. App không load sau khi quét QR**
- Trong Expo Go, lắc điện thoại > Reload
- Hoặc clear cache trong Expo Go settings

**4. "TurboModules" error**
- Đóng app hoàn toàn
- Quét QR code lại
- Hoặc xem [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)

## 📝 Scripts

```bash
npm start          # Start Expo dev server
npm run android    # Open on Android
npm run ios        # Open on iOS (macOS only)
npm run web        # Open in browser
```

## 🔗 Liên kết

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)

## 📄 License

Private - Sports Store Project
