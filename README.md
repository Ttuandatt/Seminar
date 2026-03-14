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
| **Backend** | NestJS 11, Prisma 5, PostgreSQL 15, Redis 7 |
| **Frontend (Web)** | React 19, Vite 7, Tailwind CSS 4, TypeScript 5 |
| **Frontend (Mobile)** | Expo SDK 54, React Native 0.81, TypeScript 5 |
| **Auth** | JWT (Access + Refresh Token) |
| **API Docs** | Swagger (OpenAPI 3.0) |
| **Database** | Docker (PostgreSQL + Redis) |

## ⚡ Yêu cầu hệ thống

- **Node.js** >= 20 (khuyến nghị v22+)
- **Docker Desktop** (để chạy PostgreSQL & Redis)
- **Git**
- **Expo Go** (cài trên điện thoại từ App Store / Play Store — để test mobile app)

---

## 🚀 Hướng dẫn Setup từ đầu

### Bước 1: Clone & Cài đặt

```bash
git clone <repo-url>
cd Seminar
```

### Bước 2: Khởi động Database (Docker)

```bash
cd apps/api
docker-compose up -d
```

Lệnh này sẽ tạo 2 containers:
- **gpstours-db** — PostgreSQL 15 (port `5432`)
- **gpstours-cache** — Redis 7 (port `6379`)

> **Kiểm tra**: `docker ps` → thấy 2 containers đang chạy.

### Bước 3: Cấu hình Backend

```bash
# Vẫn đang ở apps/api
cp .env.example .env
```

Mở file `.env` và cập nhật nếu cần (mặc định đã hoạt động với Docker ở trên, không cần sửa gì):

```env
# Database (khớp với docker-compose.yml: user=postgres, password=123, db=seminar_gpstour)
DATABASE_URL="postgresql://postgres:123@localhost:5432/seminar_gpstour?schema=public"

# JWT
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="change-me-in-production"
JWT_REFRESH_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Upload
UPLOAD_DIR="./uploads"
MAX_IMAGE_SIZE=5242880
MAX_AUDIO_SIZE=52428800
```

**Cũng cần tạo file `.env` ở thư mục gốc** (`Seminar/.env`) chứa `DATABASE_URL`:

```env
DATABASE_URL="postgresql://postgres:123@localhost:5432/seminar_gpstour?schema=public"
```

### Bước 4: Cài dependencies & Khởi tạo Database

```bash
# Ở apps/api
npm install

# Generate Prisma Client (Chạy trước để tránh lỗi EPERM nếu Server đang bật)
npx prisma generate

# Tạo bảng trong database
npx prisma migrate dev
```

### Bước 5: Chạy Backend

```bash
# Vẫn ở apps/api — development mode (auto-reload khi sửa code)
npm run start:dev
```

> **Giữ terminal này mở** — backend phải chạy liên tục.
>
> - **API**: http://localhost:3000/api/v1
> - **Swagger Docs** (test API trực tiếp trên trình duyệt): http://localhost:3000/api/docs

### Bước 6: Cài đặt & Chạy Admin / Shop Owner Dashboard

```bash
# Mở terminal mới
cd apps/admin
npm install
npm run dev
```

> **Giữ terminal này mở**.
>
> **Dashboard chạy tại**: http://localhost:5173
>
> Đây là giao diện dùng chung cho cả **Admin** (quản lý toàn hệ thống) và **Shop Owner** (quản lý cửa hàng & POI của mình).
> Đăng nhập bằng tài khoản tương ứng — hệ thống tự điều hướng theo role.

### Bước 7: Cài đặt & Chạy Tourist Mobile App

> **Yêu cầu trước**: Cài **Expo Go** trên điện thoại Android/iOS:
> - Android: [Play Store — Expo Go](https://play.google.com/store/apps/details?id=host.exp.exponent)
> - iOS: [App Store — Expo Go](https://apps.apple.com/app/expo-go/id982107779)
>
> Điện thoại và máy tính phải **cùng mạng Wi-Fi**.

```bash
# Mở terminal mới
cd apps/mobile

# Bắt buộc thêm --legacy-peer-deps để tránh lỗi xung đột phiên bản thư viện
npm install --legacy-peer-deps
```

**Bước 1 — Lấy LAN IP**: chạy thử Expo để terminal tự hiện IP:

```bash
npx expo start
```

Terminal sẽ hiện dòng:
```
Metro waiting on exp://192.168.1.6:8081
                        ^^^^^^^^^^^
                        Đây là LAN IP của bạn
```

Nhấn `Ctrl+C` để tắt, rồi **tạo file `apps/mobile/.env`** với IP vừa lấy:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.6:3000
```

**Bước 2 — Chạy lại với clear cache**:

```bash
npx expo start --clear
```

> Quét **QR code** hiện trên terminal bằng app **Expo Go**.
> App tải xong sẽ hiển thị giao diện bản đồ với các POI.
>
> **Giữ terminal này mở** — tắt terminal sẽ mất kết nối trên điện thoại.

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
| **Merchants** | `/merchants` | Admin quản lý Shop Owners |
| **Shop Owner** | `/shop-owner` | Shop owner tự quản lý profile & POIs |
| **Tourist** | `/tourist` | API cho ứng dụng du khách |
| **Public** | `/public` | API công khai (không cần auth) |
| **Analytics** | `/analytics` | Thống kê lượt xem, tương tác |

### Roles

| Role | Quyền |
|------|-------|
| `ADMIN` | Toàn quyền quản lý hệ thống |
| `SHOP_OWNER` | Quản lý cửa hàng & POIs của mình |
| `TOURIST` | Xem tours, POIs, lưu yêu thích |

### Database Schema (11 entities)

`User`, `ShopOwner`, `TouristUser`, `Poi`, `PoiMedia`, `Tour`, `TourPoi`, `Favorite`, `ViewHistory`, `TriggerLog`, `PasswordResetToken`

> Chi tiết xem tại `apps/api/prisma/schema.prisma`

---

## 🖥️ Kiến trúc Admin Dashboard

### Pages

| Route | Trang | Mô tả |
|-------|-------|--------|
| `/login` | LoginPage | Đăng nhập admin |
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
| `/admin/analytics` | AnalyticsPage | Thống kê |
| `/admin/profile` | ProfilePage | Quản lý hồ sơ Admin |

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

| Tab/Route | Screen | Mô tả |
|-----------|--------|--------|
| `(tabs)/index` | 🗺️ Map Screen | Bản đồ với POI markers, GPS, bottom sheet preview |
| `(tabs)/tours` | 📋 Tour List | Danh sách tours với badges (số POIs, duration) |
| `(tabs)/more` | ⚙️ More | Login/Logout, Settings, Favorites link |
| `poi/[id]` | 📍 POI Detail | Image carousel, AudioPlayer, language toggle, favorite |
| `tour/[id]` | 🗺️ Tour Detail | Route map (Polyline), POI timeline, Start Tour |

### Components

| Component | Chức năng |
|-----------|-----------|
| `AudioPlayer.tsx` | Play/Pause, progress bar, time display (Managed by Global Context) |

### Services

| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios instance, auto LAN IP, JWT interceptors |
| `publicService.ts` | POIs, Tours, QR validate (no auth) |
| `touristService.ts` | Profile, Favorites, History (JWT required) |
| `authService.ts` | Login, Register specifically for TOURIST role |
| `database.ts` | SQLite management, POI offline synchronization |

---

## 🧑‍💻 Tạo tài khoản Admin đầu tiên

Sau khi backend chạy, dùng Swagger hoặc Postman:

```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "email": "admin@gpstours.vn",
  "password": "admin123",
  "fullName": "System Admin",
  "role": "ADMIN"
}
```

Sau đó đăng nhập vào Admin Dashboard tại http://localhost:5173 với thông tin trên.

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
| `npx expo start` | Chạy dev server (quét QR bằng Expo Go) |
| `npx expo start --clear` | Chạy + xóa cache bundler (dùng khi có lỗi lạ) |
| `npm install --legacy-peer-deps` | Cài dependencies (bắt buộc dùng flag này) |

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
| Mobile: `Cannot find module` | Chạy `npm install --legacy-peer-deps` rồi `npx expo start --clear` |
| Mobile: `No Android device found` | Dùng Expo Go quét QR thay vì nhấn `a` (không cần emulator) |

