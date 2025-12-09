# 🚀 CÁCH CHẠY ỨNG DỤNG

## ✅ CÁCH ĐƠN GIẢN NHẤT (Khuyến nghị)

Chỉ cần chạy file `start.bat`:

```bash
start.bat
```

**File này sẽ tự động:**
1. ✅ Kill tất cả node processes cũ
2. ✅ Đợi 3 giây để ports được giải phóng
3. ✅ Chạy `npm run dev` để khởi động tất cả apps

---

## 🔧 CÁCH MANUAL

Nếu muốn chạy thủ công:

### Bước 1: Kill processes cũ
```bash
npm run kill
```

### Bước 2: Đợi 3 giây
```bash
# Windows
powershell -Command "Start-Sleep -Seconds 3"
```

### Bước 3: Chạy ứng dụng
```bash
npm run dev
```

---

## 📊 SAU KHI CHẠY

Ứng dụng sẽ khởi động 3 services:

| Service | URL | Status |
|---------|-----|--------|
| Backend API | http://localhost:5000 | ✅ |
| Customer Web | http://localhost:3000 | ✅ |
| Admin Web | http://localhost:3001 | ✅ |

### Kiểm tra Backend:
```bash
curl http://localhost:5000/health
```

---

## ❗ NẾU GẶP LỖI "PORT ALREADY IN USE"

**Giải pháp nhanh nhất:**
```bash
start.bat
```

**Hoặc manual:**
```bash
# Kill tất cả node processes
taskkill /F /IM node.exe /T

# Đợi 3 giây
powershell -Command "Start-Sleep -Seconds 3"

# Chạy lại
npm run dev
```

---

## 📝 GHI CHÚ

- **MongoDB**: Hiện tại chưa kết nối được do credentials sai, nhưng ứng dụng vẫn chạy bình thường
- **Cập nhật MONGODB_URI**: Edit file `apps/backend/.env` khi cần
- **Dừng ứng dụng**: Nhấn `Ctrl+C` trong terminal

---

**Date**: 2025-11-29
**Version**: 1.0.0
