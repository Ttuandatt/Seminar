# 🗺️ GPS Tours — Phố Ẩm thực Vĩnh Khánh

Hệ thống hướng dẫn du lịch GPS cho khu phố ẩm thực Vĩnh Khánh, bao gồm Admin Dashboard, Backend API, và Tourist Mobile App.

## 📁 Cấu trúc dự án

```
Seminar/
├── apps/
│   ├── api/          # Backend API (NestJS + Prisma + PostgreSQL)
│   ├── admin/        # Admin Dashboard (React + Vite + Tailwind CSS)
│   └── mobile/       # Tourist Mobile App (Expo + React Native)
├── docs/             # Tài liệu PRD, UML, API specs
├── .env              # Database URL (root-level, dùng cho Prisma)
└── README.md         # ← Bạn đang đọc file này
```

## 🛠️ Tech Stack

| Layer | Công nghệ |
|-------|-----------| 
| **Backend** | NestJS 11, Prisma 5, PostgreSQL 15, Redis 7, msedge-tts, qrcode |
| **Frontend (Web)** | React 19, Vite 7, Tailwind CSS 4, TypeScript 5 |
| **Frontend (Mobile)** | Expo SDK 54, React Native 0.81, TypeScript 5 |
| **Auth** | JWT (Access + Refresh Token) |
| **API Docs** | Swagger (OpenAPI 3.0) |
| **Database** | Docker (PostgreSQL + Redis) |

---

## 📋 Tóm tắt luồng hoạt động hệ thống

### 🔐 **Admin** (Quản lý toàn hệ thống)

1. **Quản lý POI (Điểm tham quan)**
   - Tạo POI mới → nhập thông tin cơ bản (tên, mô tả, danh mục, vị trí GPS)
   - Upload ảnh và file audio cho nhiều ngôn ngữ (VI, EN) hoặc tự động tạo bằng TTS
   - Chỉnh sửa hoặc xóa POI
   - Xuất QR code để dán tại điểm tham quan
   - Xem preview POI trước khi công bố

2. **Quản lý Tour**
   - Tạo tour mới → chọn nhiều POI, sắp xếp thứ tự
   - Sửa thông tin tour (tên, mô tả, thời gian)
   - Xóa tour

3. **Quản lý Shop Owner**
   - Xem danh sách các cửa hàng / merchant
   - Tạo, sửa, xóa merchant
   - Gán POI cho merchant tương ứng

4. **Bản đồ & Thống kê**
   - Xem tất cả POI trên bản đồ
   - Xem số lượt xem, tương tác, QR scans cho từng POI
   - Phân tích dữ liệu theo ngày/tuần/tháng

### 🏪 **Shop Owner** (Chủ cửa hàng)

1. **Quản lý POI của cửa hàng**
   - Tạo POI mới cho cửa hàng của mình
   - Upload ảnh + audio (VI/EN) hoặc dùng TTS
   - Chỉnh sửa POI (chỉ POI của mình)
   - Xem preview

2. **Bản đồ**
   - Xem bản đồ chỉ hiển thị POI của cửa hàng mình

3. **Thống kê**
   - Xem lượt xem, lượt quét QR cho POI của mình
   - Dashboard hiển thị tóm tắt hoạt động

### 🗺️ **Tourist / Du khách** (Mobile App)

1. **Khám phá POI**
   - Xem bản đồ GPS hiển thị tất cả POI gần kỳ
   - Nhấn POI → xem chi tiết: ảnh, mô tả, audio (nếu có)
   - Chuyển đổi ngôn ngữ VI ↔ EN
   - Phát audio nếu POI có sẵn

2. **Tham quan theo Tour**
   - Xem danh sách tour disponible
   - Chọn tour → xem danh sách POI và route trên bản đồ
   - Bắt đầu tour → chế độ GPS guided navigation

3. **Quét QR**
   - Quét QR code tại POI → xác nhận đã tham quan
   - Lưu lịch sử tham quan

4. **Quản lý cá nhân**
   - Lưu POI yêu thích ❤️
   - Xem lịch sử POI đã xem
   - Chỉnh sửa hồ sơ cá nhân
   - Chọn ngôn ngữ (VI/EN)

### ✅ **Những tính năng đã hoàn thiện**

- ✅ Backend API (NestJS + Prisma + PostgreSQL)
- ✅ Admin web dashboard (React + Tailwind)
- ✅ Mobile app (Expo + React Native)
- ✅ Xác thực (JWT + role-based access)
- ✅ Quản lý POI, Tour, Media, QR code
- ✅ Text-to-Speech tự động cho POI
- ✅ Localization (VI/EN) cho text + audio
- ✅ Bản đồ GPS trên web + mobile
- ✅ Audio player với UI riêng (text ≠ audio fallback)
- ✅ Quét QR + trigger log
- ✅ Thống kê lượt xem
- ✅ Test suite cho mobile resolver + audio logic

---

## ⚡ Yêu cầu hệ thống

- **Node.js** >= 20 (khuyến nghị v22+)
- **Docker Desktop** (để chạy PostgreSQL & Redis)
- **Git**
- **Expo Go** (cài trên điện thoại từ App Store / Play Store — để test mobile app)

---

## 🚀 Hướng dẫn chạy nhanh cho team dev (Web + Mobile)

Mục tiêu của phần này là để team clone repo xong có thể chạy được ngay:
- Backend API
- Web app (Admin/Shop Owner)
- Mobile app (Expo)

### 1) Chuẩn bị môi trường

```bash
git clone <repo-url>
cd Seminar
```

Yêu cầu:
- Node.js 20+
- npm 10+
- Docker Desktop
- Expo Go trên điện thoại (nếu test mobile bằng thiết bị thật)

### 2) Chạy API + Database (Terminal 1)

```bash
cd apps/api
docker-compose up -d
```

Tạo file môi trường cho API:

```bash
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS/Linux
cp .env.example .env
```

Đảm bảo file `.env` ở thư mục gốc dự án có `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/seminar_gpstour?schema=public"
```

Cài dependencies và setup DB:

```bash
npm install
npx prisma generate
npm run db:setup
```

Chạy API dev mode:

```bash
npm run start:dev
```

API chạy tại:
- http://localhost:3000/api/v1
- http://localhost:3000/api/docs

### 3) Chạy web app (Admin/Shop Owner) (Terminal 2)

```bash
cd apps/admin
npm install
npm run dev
```

Web app chạy tại:
- http://localhost:5173

### 4) Chạy mobile app (Expo) (Terminal 3)

```bash
cd apps/mobile
npm install
```

Nếu cài dependency bị lỗi peer deps, chạy lại:

```bash
npm install --legacy-peer-deps
```

Tạo file `apps/mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://<LAN_IP_CUA_BAN>:3000
```

Ví dụ:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.6:3000
```

Chạy Expo:

```bash
npm run start -- --clear
```

Lưu ý cho mobile:
- Điện thoại và máy tính phải cùng mạng Wi-Fi.
- Quét QR bằng Expo Go.
- Nếu dùng emulator Android/iOS thì có thể dùng localhost theo cấu hình emulator tương ứng.

### 5) Luồng dev hằng ngày (khuyến nghị)

Mỗi ngày làm việc, chỉ cần mở 3 terminal và chạy:

```bash
# Terminal 1
cd apps/api
npm run start:dev
```

```bash
# Terminal 2
cd apps/admin
npm run dev
```

```bash
# Terminal 3
cd apps/mobile
npm run start
```

> Nếu database chưa chạy: vào `apps/api` và chạy thêm `docker-compose up -d`.

### 6) Tài khoản mẫu sau khi seed

| Vai trò | Email | Mật khẩu |
|---------|-------|-----------|
| Admin | `admin@gpstours.vn` | `admin123` |
| Shop Owner | `bunmam@gpstours.vn` | `shop123` |
| Tourist | `tourist@example.com` | `tourist123` |

Nếu cần reset sạch DB và seed lại:

```bash
cd apps/api
npm run db:reset
```

---

## 📖 Các tool hữu ích

### Prisma Studio (Database GUI)

```bash
cd apps/api
npx prisma studio
```
> Mở trình duyệt tại http://localhost:5555 để xem/sửa data trực tiếp.

### Swagger API Docs

Truy cập http://localhost:3000/api/docs khi backend đang chạy để:
- Xem tất cả endpoints
- Test API trực tiếp trên trình duyệt
- Xem request/response schema

---

## 🏗️ Kiến trúc Backend

### Modules

| Module | Prefix | Mô tả |
|--------|--------|--------|
| **Auth** | `/auth` | Đăng ký, đăng nhập, refresh token |
| **POIs** | `/pois` | CRUD điểm tham quan |
| **Tours** | `/tours` | CRUD tours, gán POIs vào tour |
| **Media** | `/media` | Upload hình ảnh, audio |
| **QR** | `/pois/:id/qr` | Tạo, tái tạo, tải QR code cho POI |
| **TTS** | `/tts` | Text-to-Speech — tạo audio tự động cho POI |
| **Profile** | `/profile` | Quản lý hồ sơ cá nhân, upload avatar |
| **Merchants** | `/merchants` | Admin quản lý Shop Owners |
| **Shop Owner** | `/shop-owner` | Shop owner tự quản lý profile, POIs & analytics |
| **Tourist** | `/tourist` | API cho ứng dụng du khách |
| **Public** | `/public` | API công khai (không cần auth), QR validate, trigger log |
| **Analytics** | `/analytics` | Thống kê lượt xem, tương tác |
| **Seed-Export** | — | Export seed data phục vụ báo cáo & testing |

### Roles

| Role | Quyền |
|------|-------|
| `ADMIN` | Toàn quyền quản lý hệ thống |
| `SHOP_OWNER` | Quản lý cửa hàng & POIs của mình |
| `TOURIST` | Xem tours, POIs, lưu yêu thích |

### Database Schema (12 entities)

`User`, `ShopOwner`, `TouristUser`, `Poi`, `PoiMedia`, `Tour`, `TourPoi`, `Favorite`, `ViewHistory`, `TriggerLog`, `PasswordResetToken`, `RevokedToken`

**Enums chính:** `UserRole`, `UserStatus`, `PoiStatus`, `PoiCategory`, `MediaLanguage` (VI/EN/ALL), `TriggerType` (GPS/QR/MANUAL), `UserAction`

> Chi tiết xem tại `apps/api/prisma/schema.prisma`

---

## 🖥️ Kiến trúc Admin Dashboard

### Pages — Auth

| Route | Trang | Mô tả |
|-------|-------|--------|
| `/login` | LoginPage | Đăng nhập |
| `/register` | RegisterPage | Đăng ký tài khoản |
| `/forgot-password` | ForgotPasswordPage | Quên mật khẩu |
| `/reset-password` | ResetPasswordPage | Đặt lại mật khẩu |

### Pages — Admin

| Route | Trang | Mô tả |
|-------|-------|--------|
| `/admin` | DashboardPage | Tổng quan KPI |
| `/admin/pois` | POIListPage | Danh sách POIs |
| `/admin/pois/new` | POIFormPage | Tạo POI mới |
| `/admin/pois/:id/edit` | POIFormPage | Sửa POI |
| `/admin/tours` | TourListPage | Danh sách Tours |
| `/admin/tours/new` | TourFormPage | Tạo Tour mới |
| `/admin/tours/:id/edit` | TourFormPage | Sửa Tour |
| `/admin/merchants` | MerchantListPage | Danh sách Merchants |
| `/admin/merchants/new` | MerchantFormPage | Tạo Merchant |
| `/admin/merchants/:id/edit` | MerchantFormPage | Sửa Merchant |
| `/admin/map` | MapViewPage | Bản đồ POI markers & controls |
| `/admin/analytics` | AnalyticsPage | Thống kê |
| `/admin/profile` | ProfilePage | Quản lý hồ sơ Admin |

### Pages — Shop Owner

| Route | Trang | Mô tả |
|-------|-------|--------|
| `/owner` | ShopOwnerDashboardPage | Dashboard cửa hàng |
| `/owner/pois/edit` | ShopOwnerPOIFormPage | Chỉnh sửa POI của mình |
| `/owner/map` | MapViewPage | Bản đồ (dùng chung với Admin) |
| `/owner/analytics` | ShopOwnerAnalyticsPage | Thống kê cửa hàng |
| `/owner/profile` | ShopOwnerProfilePage | Quản lý hồ sơ Shop Owner |

---

## 📱 Kiến trúc Tourist Mobile App

### Tech Stack

| Item | Chi tiết |
|------|----------|
| **Framework** | Expo SDK 54 + React Native 0.81 |
| **Navigation** | expo-router (file-based routing) |
| **Maps** | react-native-maps (default provider) |
| **Audio** | expo-audio (Global Singleton Context) |
| **Database** | expo-sqlite (Offline QR Fallback) |
| **Icons** | lucide-react-native + react-native-svg |
| **HTTP** | Axios (auto-detect LAN IP) |
| **Storage** | AsyncStorage (JWT tokens) |

### Screens

**Tab chính (3):**

| Tab/Route | Screen | Mô tả |
|-----------|--------|--------|
| `(tabs)/index` | 🗺️ Map Screen | Bản đồ với POI markers, GPS, bottom sheet preview |
| `(tabs)/tours` | 📋 Tour List | Danh sách tours với badges (số POIs, duration) |
| `(tabs)/more` | ⚙️ More | Login/Logout, Settings, Favorites link |

**Auth & Onboarding (4):**

| Route | Screen | Mô tả |
|-------|--------|--------|
| `login` | Login | Đăng nhập Tourist |
| `register` | Register | Đăng ký tài khoản |
| `forgot-password` | Forgot Password | Quên mật khẩu |
| `onboarding` | Onboarding | Hướng dẫn sử dụng lần đầu |

**Chi tiết & Tính năng (9):**

| Route | Screen | Mô tả |
|-------|--------|--------|
| `poi/[id]` | 📍 POI Detail | Image carousel, AudioPlayer, language toggle, favorite |
| `tour/[id]` | 🗺️ Tour Detail | Route map (Polyline), POI timeline, Start Tour |
| `tour/follow/[id]` | 🧭 Tour Follow | Chế độ điều hướng theo tour (guided navigation) |
| `scanner` | 📷 QR Scanner | Quét QR code tại POI |
| `favorites` | ❤️ Favorites | Danh sách POI đã yêu thích |
| `history` | 🕐 History | Lịch sử POI đã xem |
| `edit-profile` | 👤 Edit Profile | Chỉnh sửa thông tin cá nhân |
| `language` | 🌐 Language | Chọn ngôn ngữ VI/EN |
| `about` | ℹ️ About | Thông tin ứng dụng |

### Components

| Component | Chức năng |
|-----------|-----------|
| `AudioPlayer.tsx` | Play/Pause, progress bar, time display (Managed by Global Context) |
| `MapControls` | Nút điều khiển bản đồ (zoom, GPS, layers) |
| `BottomSheet` | Bottom sheet xem preview POI từ bản đồ |

### Services

| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios instance, auto LAN IP, JWT interceptors |
| `publicService.ts` | POIs, Tours, QR validate, trigger log (no auth) |
| `touristService.ts` | Profile, Favorites, History (JWT required) |
| `authService.ts` | Login, Register, Forgot/Reset Password for TOURIST |
| `database.ts` | SQLite management, POI offline synchronization |

---

## 🧑‍💻 Tài khoản test

Nếu đã chạy `npm run db:seed` ở Bước 4, hệ thống đã có sẵn 3 tài khoản:

| Vai trò | Email | Mật khẩu | Đăng nhập tại |
|---------|-------|-----------|---------------|
| **Admin** | `admin@gpstours.vn` | `admin123` | http://localhost:5173 → tự chuyển `/admin` |
| **Shop Owner** | `bunmam@gpstours.vn` | `shop123` | http://localhost:5173 → tự chuyển `/owner` |
| **Tourist** | `tourist@example.com` | `tourist123` | Mobile App (Expo Go) |

> Nếu muốn tạo thêm tài khoản, dùng Swagger: http://localhost:3000/api/docs → `POST /auth/register`

---

## 📝 Scripts tham khảo nhanh

### Backend (`apps/api`)

| Script | Mô tả |
|--------|--------|
| `npm run start:dev` | Chạy dev mode (auto-reload) |
| `npm run start:prod` | Chạy production (cần `npm run build` trước) |
| `npm run build` | Build production bundle |
| `npx prisma studio` | Mở Database GUI |
| `npx prisma migrate deploy` | Áp dụng migrations |
| `npx prisma migrate dev` | Tạo migration mới |

### Admin Dashboard (`apps/admin`)

| Script | Mô tả |
|--------|--------|
| `npm run dev` | Chạy dev server |
| `npm run build` | Build production |
| `npm run preview` | Preview bản build |

### Tourist Mobile App (`apps/mobile`)

| Script | Mô tả |
|--------|--------|
| `npm run start` | Chạy dev server (quét QR bằng Expo Go) |
| `npm run start -- --clear` | Chạy + xóa cache bundler (dùng khi có lỗi lạ) |
| `npm install --legacy-peer-deps` | Dùng khi cài dependencies bị lỗi peer deps |

---

## ❓ Troubleshooting

| Vấn đề | Giải pháp |
|---------|-----------|
| `Cannot connect to database` | Kiểm tra Docker containers: `docker ps` |
| `Port 5432 already in use` | Tắt PostgreSQL local hoặc đổi port trong `docker-compose.yml` |
| `CORS error` | Đảm bảo frontend chạy đúng port `5173` |
| `401 Unauthorized` | Token hết hạn, đăng nhập lại |
| `Prisma Client not generated` | Chạy `npx prisma generate` |
| Mobile: `AxiosError: Network Error` | Đảm bảo điện thoại và laptop cùng mạng Wi-Fi, và `EXPO_PUBLIC_API_URL` trong `apps/mobile/.env` đúng LAN IP |
| Mobile: POI không hiện trên bản đồ | Kiểm tra POI có status `ACTIVE` không (Prisma Studio hoặc Admin Dashboard) |
| Mobile: `Cannot find module` | Chạy `npm install --legacy-peer-deps` rồi `npm run start -- --clear` |
| Mobile: `No Android device found` | Dùng Expo Go quét QR thay vì nhấn `a` (không cần emulator) |

