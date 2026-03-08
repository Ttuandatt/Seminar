# 🚀 Hướng dẫn triển khai Cloud Deployment — GPS Tours

> **Cập nhật:** 2026-03-08  
> **Trạng thái:** Checkpoint 1–5 hoàn thành ✅ | Checkpoint 6–7 đang tiến hành

---

## Tổng quan

Hướng dẫn này mô tả cách triển khai **NestJS API** lên **Render.com** (free tier) và cấu hình **mobile app** để build APK standalone. Teammate mới đọc theo thứ tự từ trên xuống.

**Kiến trúc deployment:**
```
┌────────────────┐       ┌──────────────────────┐
│  Mobile App    │──────▶│  Render.com (Cloud)   │
│  (Standalone   │ HTTPS │  ┌──────────────────┐ │
│   APK/AAB)     │       │  │ gpstours-api     │ │
└────────────────┘       │  │ NestJS + Prisma  │ │
                         │  └───────┬──────────┘ │
                         │          │             │
                         │  ┌───────▼──────────┐ │
                         │  │ gpstours-db       │ │
                         │  │ PostgreSQL 18     │ │
                         │  └──────────────────┘ │
                         │  Region: Singapore    │
                         └──────────────────────┘
```

---

## Checkpoint 1 — Tạo PostgreSQL trên Render

### Bước 1.1: Đăng ký Render
1. Mở [render.com](https://render.com) → **Get Started for Free**
2. Đăng nhập bằng **GitHub** (tài khoản chứa repo `Ttuandatt/Seminar`)

### Bước 1.2: Tạo PostgreSQL Database
1. Dashboard → click **"+ New"** → chọn **PostgreSQL**
2. Điền thông tin:

| Field | Giá trị |
|-------|---------|
| Name | `gpstours-db` |
| Database | `gpstours` |
| User | `gpstours_user` |
| Region | **Singapore (Southeast Asia)** |
| Plan | **Free** |

3. Click **"Create Database"** → chờ status = **Available** ✅

### Bước 1.3: Lấy Connection String
1. Vào database → click **"Connect"** (góc phải)
2. Copy **Internal Database URL** (dùng cho Web Service cùng Render):
```
postgresql://gpstours_db_user:xxxx@dpg-xxxxx-a/gpstours_db
```
3. Copy **External Database URL** (dùng cho seed từ máy local):
```
postgresql://gpstours_db_user:xxxx@dpg-xxxxx.singapore-postgres.render.com/gpstours_db
```

> ⚠️ **QUAN TRỌNG:** Lưu cả 2 URL lại.
> - Internal URL → dùng cho env var trên Render
> - External URL → dùng để seed data từ máy local

**🚩 Gate:** Có được 2 connection strings

---

## Checkpoint 2 — Deploy NestJS API

### Bước 2.1: Tạo Web Service
1. Dashboard → **"+ New"** → **Web Service**
2. Chọn repo **Ttuandatt/Seminar** → **Connect**

### Bước 2.2: Cấu hình Service

| Field | Giá trị |
|-------|---------|
| Name | `gpstours-api` |
| Region | **Singapore** (khớp với DB) |
| Branch | `main` |
| Root Directory | `apps/api` |
| Runtime | **Node** |
| Build Command | `npm install --include=dev && npx prisma generate && npm run build` |
| Start Command | `npx prisma migrate deploy && node dist/src/main` |
| Plan | **Free** |

> ⚠️ **LƯU Ý QUAN TRỌNG:**
> - Build command **phải có** `--include=dev` vì `@nestjs/cli` là devDependency, cần cho `nest build`.
> - Start command dùng `dist/src/main` (KHÔNG PHẢI `dist/main.js`) — đây là output path mặc định của NestJS.

### Bước 2.3: Thêm Environment Variables
Trong phần "Environment Variables" trước khi deploy, thêm:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `<Internal Database URL từ Checkpoint 1>` |
| `JWT_SECRET` | `<random string 64+ ký tự>` |
| `JWT_REFRESH_SECRET` | `<random string 64+ ký tự khác>` |
| `JWT_EXPIRATION` | `15m` |
| `JWT_REFRESH_EXPIRATION` | `7d` |
| `UPLOAD_DIR` | `./uploads` |
| `NODE_ENV` | `production` |
| `PORT` | `3000` |

> 💡 **Tip:** Có thể dùng nút "Add from .env" để paste tất cả env vars cùng lúc thay vì thêm từng dòng.

### Bước 2.4: Deploy
1. Click **"Deploy Web Service"**
2. Chờ build + deploy (~3-5 phút)
3. Kiểm tra tab **Events** → thấy **"Deploy live"** ✅

Sau khi deploy xong, service URL là: `https://gpstours-api.onrender.com`

> 📝 **Lưu ý free tier:** Service sẽ spin down sau 15 phút không hoạt động. Request đầu tiên sau khi spin up sẽ chậm ~50 giây.

**🚩 Gate:** Events hiện "Deploy live" với dấu ✅ xanh

---

## Checkpoint 3 — Seed Database

### Bước 3.1: Seed từ máy local
Mở terminal tại thư mục `apps/api`, chạy:

**Windows (PowerShell):**
```powershell
# Set External Database URL (thay xxxx bằng giá trị thật từ Checkpoint 1)
$env:DATABASE_URL="postgresql://gpstours_db_user:xxxx@dpg-xxxxx.singapore-postgres.render.com/gpstours_db"

# Chạy seed
npx prisma db seed
```

**macOS / Linux (Bash):**
```bash
DATABASE_URL="postgresql://gpstours_db_user:xxxx@dpg-xxxxx.singapore-postgres.render.com/gpstours_db" \
  npx prisma db seed
```

### Bước 3.2: Kết quả mong đợi
```
🌱 Seeding database...
✅ Admin: admin@gpstours.vn
✅ Shop Owner: bunmam@gpstours.vn
✅ Tourist: tourist@example.com
✅ Created 5 POIs
✅ Tour: Tour Ẩm thực Vĩnh Khánh (5 POIs)
🎉 Seed complete!
```

### Tài khoản test

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@gpstours.vn` | `admin123` |
| Shop Owner | `bunmam@gpstours.vn` | `shop123` |
| Tourist | `tourist@example.com` | `tourist123` |

### Dữ liệu mẫu

| Loại | Số lượng | Chi tiết |
|------|----------|----------|
| POIs | 5 | Bún Mắm Tùng, Ốc Đào, Hải Sản Bé Mặn, Chùa Xá Lợi, Cà Phê Vợt |
| Tours | 1 | Tour Ẩm thực Vĩnh Khánh (5 POIs, ~90 phút) |
| Users | 3 | Admin, Shop Owner, Tourist |

**🚩 Gate:** Seed exit code 0 + thấy "Seed complete!"

---

## Checkpoint 4 — Kiểm tra API Cloud

### Test 1: Public endpoints
```powershell
# Lấy danh sách POIs (kỳ vọng: 5 items)
curl https://gpstours-api.onrender.com/api/v1/public/pois

# Lấy danh sách Tours (kỳ vọng: 1 item)
curl https://gpstours-api.onrender.com/api/v1/public/tours
```

### Test 2: Auth login
```powershell
# PowerShell
$body = '{"email":"admin@gpstours.vn","password":"admin123"}'
Invoke-RestMethod -Uri "https://gpstours-api.onrender.com/api/v1/auth/login" `
  -Method POST -ContentType "application/json" -Body $body
```

Kỳ vọng nhận được:
```json
{
  "accessToken": "eyJhbG...",
  "refreshToken": "eyJhbG...",
  "user": {
    "id": "...",
    "email": "admin@gpstours.vn",
    "fullName": "Admin GPS Tours",
    "role": "ADMIN"
  }
}
```

### Test 3: Tourist registration (tuỳ chọn)
```powershell
$body = '{"email":"newuser@test.com","password":"Test1234","fullName":"Test User"}'
Invoke-RestMethod -Uri "https://gpstours-api.onrender.com/api/v1/auth/register" `
  -Method POST -ContentType "application/json" -Body $body
```

**🚩 Gate:** Tất cả endpoints trả response đúng

---

## Checkpoint 5 — Mobile Branding

### Các file đã thay đổi

#### `apps/mobile/app.json`
```diff
- "name": "mobile",
- "slug": "mobile",
+ "name": "GPS Tours",
+ "slug": "gpstours",
+ "android": { "package": "com.gpstours.tourist" },
+ "ios": { "bundleIdentifier": "com.gpstours.tourist" }
```
- Splash background → `#3b82f6` (brand blue)
- Thêm permissions: `ACCESS_FINE_LOCATION`, `CAMERA`
- Thêm plugins: `expo-location`, `expo-camera`

#### `apps/mobile/eas.json` (file mới)
- **development**: Dev client build
- **preview**: Build APK, trỏ API tới `https://gpstours-api.onrender.com/api/v1`
- **production**: Build AAB cho Google Play Store

**🚩 Gate:** Code đã commit + push lên `main`

---

## Checkpoint 6 — EAS Build APK ⬜ (tiếp theo)

### Yêu cầu
- Tài khoản [expo.dev](https://expo.dev) (miễn phí)
- Node.js 18+

### Các bước

```bash
# 1. Cài EAS CLI (nếu chưa có)
npm install -g eas-cli

# 2. Đăng nhập Expo
eas login

# 3. Di chuyển vào thư mục mobile
cd apps/mobile

# 4. Build APK cho Android (~15 phút trên Expo cloud)
eas build --platform android --profile preview

# 5. Sau khi build xong, Expo sẽ cho link download .apk
# Ví dụ: https://expo.dev/artifacts/eas/xxxxx.apk
```

**🚩 Gate:** File `.apk` download thành công

---

## Checkpoint 7 — UAT Verification ⬜ (cuối cùng)

### Checklist kiểm tra trên điện thoại thật

| # | Test | Kỳ vọng |
|---|------|---------|
| 1 | Cài APK → mở app | Không crash |
| 2 | Tên app trên launcher | Hiện "GPS Tours" |
| 3 | Bản đồ hiện POI markers | 5 markers từ cloud API |
| 4 | Login + Register Tourist | Hoạt động OK |
| 5 | Nghe audio POI | Stream + play OK |
| 6 | QR Scan | Quét QR → xem POI detail |
| 7 | Offline sync | Đồng bộ dữ liệu OK |

**🚩 Gate:** ✅ App production-ready

---

## Troubleshooting

### Build thất bại trên Render

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `nest: command not found` | Thiếu `--include=dev` trong Build Command | Sửa Build Command thêm `--include=dev` |
| `Cannot find module 'dist/main.js'` | Sai đường dẫn start | Đổi thành `node dist/src/main` |
| `ECONNREFUSED` database | Sai DATABASE_URL | Kiểm tra lại Internal URL từ Checkpoint 1 |
| Deploy failed — "Exited with status 1" | Lỗi runtime | Kiểm tra tab Logs để xem chi tiết |

### Seed thất bại

| Lỗi | Giải pháp |
|-----|-----------|
| `Connection timed out` | Dùng **External** URL (không phải Internal) |
| `Unique constraint` | Data đã seed trước đó, có thể bỏ qua |
| `Cannot find module 'dotenv'` | Chạy `npm install` trước |
