# Cleanup NUL Files

## Vấn Đề

Khi sử dụng lệnh redirect `> nul` hoặc `2>nul` trong Git Bash hoặc WSL trên Windows, thay vì redirect đến `NUL` device (giống `/dev/null` trên Linux), nó tạo ra các **file thực sự** có tên `nul`.

### Ví dụ lệnh gây ra vấn đề:

```bash
# ❌ SAI - Tạo file 'nul'
npm run dev > nul 2>&1

# ✅ ĐÚNG - Redirect đến /dev/null
npm run dev > /dev/null 2>&1

# ✅ ĐÚNG - Hoặc sử dụng NUL trên Windows CMD
npm run dev > NUL 2>&1
```

## Giải Pháp

### 1. Tự Động Dọn Dẹp

Chạy script cleanup:

```bash
./cleanup-nul.sh
```

### 2. Thủ Công Dọn Dẹp

```bash
# Tìm tất cả file 'nul'
find . -name "nul" -type f

# Xóa tất cả file 'nul'
find . -name "nul" -type f -delete
```

### 3. Ngăn Chặn Trong Tương Lai

File `nul` đã được thêm vào `.gitignore` để tránh commit nhầm.

**Lưu ý:** Khi viết scripts hoặc chạy lệnh, hãy sử dụng:
- `/dev/null` cho Bash/WSL
- `NUL` (viết hoa) cho Windows CMD
- Tránh sử dụng `nul` (viết thường)

## Tại Sao Vấn Đề Này Xảy Ra?

Git Bash và WSL chạy trong môi trường Unix-like trên Windows. Khi bạn sử dụng `nul` (lowercase), nó được hiểu là tên file thông thường chứ không phải special device. Trong khi đó:

- Windows CMD: `NUL`, `CON`, `PRN`, v.v. là reserved device names
- Unix/Linux: `/dev/null`, `/dev/zero`, v.v. là special devices
- Git Bash/WSL: Cần sử dụng `/dev/null` thay vì `nul`

## Kiểm Tra

Sau khi dọn dẹp, verify không còn file `nul`:

```bash
find . -name "nul" -type f | wc -l
# Output: 0
```

---

**Ngày tạo:** 2025-12-16
**Cập nhật lần cuối:** 2025-12-16
