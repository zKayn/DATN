# Khắc phục lỗi TurboModules - HƯỚNG DẪN TRIỆT ĐỂ

## ✅ ĐÃ KHẮC PHỤC: Upgrade lên Expo SDK 54

App đã được upgrade lên **Expo SDK 54** với **React 18.3.1** để tương thích với Expo Go mới nhất.

### Nếu vẫn thấy lỗi TurboModules:

## Giải pháp 1: Reload app trong Expo Go ⭐ (Nhanh nhất)

1. **Lắc điện thoại** (shake gesture)
2. Chọn **"Reload"**
3. Đợi app build lại (khoảng 10-30 giây)

**Hoặc:**
- iOS: Nhấn **Cmd + R** trong Expo Go
- Android: Nhấn **R** 2 lần nhanh

---

## Giải pháp 2: Clear cache Expo Go

### Trên iOS:
1. Mở **Expo Go** app
2. Vào tab **"Projects"**
3. **Swipe left** trên project "mobile-app"
4. Chọn **"Clear cache"**
5. Quét QR code lại

### Trên Android:
1. **Thoát hoàn toàn** Expo Go (close từ recent apps)
2. Mở lại và quét QR code

**Nếu vẫn lỗi:**
1. Settings → Apps → Expo Go
2. Storage → **Clear cache** (KHÔNG clear data)
3. Mở Expo Go và quét QR lại

---

## Giải pháp 3: Restart Metro Bundler

Trong terminal trên máy tính:

```bash
# Nhấn Ctrl+C để dừng server
# Sau đó chạy:
cd apps/mobile-app
npx expo start --clear
```

---

## Giải pháp 4: Xóa toàn bộ cache (Nếu vẫn lỗi)

```bash
cd apps/mobile-app

# Xóa cache
rm -rf .expo node_modules/.cache .metro-cache

# Restart
npx expo start --clear
```

---

## Giải pháp 5: Reinstall Expo Go (Cuối cùng)

1. **Xóa Expo Go** khỏi điện thoại
2. **Cài lại** từ App Store/Play Store
3. Quét QR code mới

---

## Kiểm tra cấu hình hiện tại:

### ✅ Package versions (Đã đúng):
```json
{
  "expo": "~54.0.0",
  "react": "18.3.1",
  "react-native": "0.81.5",
  "@react-navigation/native": "^7.1.0"
}
```

### ✅ app.json (KHÔNG có newArchEnabled):
```json
{
  "expo": {
    "name": "mobile-app",
    // KHÔNG CÓ dòng "newArchEnabled"
  }
}
```

### ✅ index.ts (Đã có gesture-handler):
```typescript
import 'react-native-gesture-handler'; // ✅ Dòng này phải ở đầu
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
```

---

## Lỗi khác thường gặp:

### "Network request failed"
**Nguyên nhân:** Backend chưa chạy hoặc IP sai

**Giải pháp:**
1. Kiểm tra backend:
   ```bash
   cd apps/backend
   npm run dev
   ```

2. Kiểm tra IP trong `src/constants/config.ts`:
   ```typescript
   export const API_URL = 'http://192.168.1.68:5000/api';
   // Thay 192.168.1.68 bằng IP máy của bạn
   ```

3. Tìm IP máy:
   ```bash
   # Windows
   ipconfig

   # macOS/Linux
   ifconfig
   ```

### "Cannot find module"
```bash
cd apps/mobile-app
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npx expo start --clear
```

---

## Debug nâng cao:

### Xem React DevTools:
1. Lắc điện thoại trong Expo Go
2. Chọn **"Toggle Performance Monitor"** hoặc **"Debug Remote JS"**
3. Mở Chrome tại `chrome://inspect`

### Xem Metro Bundler logs:
- Tất cả lỗi compile sẽ hiện trong terminal
- Tìm dòng đỏ (ERROR) để biết nguyên nhân

---

## Tại sao upgrade lên SDK 54?

- Expo Go app mới nhất (version hiện tại trên App Store/Play Store) **chỉ hỗ trợ SDK 54+**
- SDK 50 không tương thích với Expo Go mới
- SDK 54 ổn định hơn và có ít lỗi hơn

---

## Vẫn không được?

**Cuối cùng, thử các bước theo thứ tự:**

1. ✅ Lắc điện thoại → Reload
2. ✅ Clear cache Expo Go
3. ✅ Restart Metro Bundler với `--clear`
4. ✅ Xóa `.expo` folder và restart
5. ✅ Reinstall Expo Go app
6. ✅ Reinstall node_modules: `rm -rf node_modules && npm install --legacy-peer-deps`

**Nếu TẤT CẢ đều thất bại:**
- Report issue với **screenshot đầy đủ** lỗi
- Kèm theo: Expo Go version, iOS/Android version, output của `npx expo --version`

---

## Contact:
- GitHub Issues: [Report bug](https://github.com/your-repo/issues)
- Expo Community: [forums.expo.dev](https://forums.expo.dev)
