# BÁO CÁO TÍNH NĂNG HỆ THỐNG GPS TOURS

> **Ngày tạo:** 31/03/2026
> **Phiên bản:** MVP (Phase 1)
> **Công nghệ:** NestJS · React · Expo (React Native) · PostgreSQL · Prisma ORM

---

## 1. TỔNG QUAN KIẾN TRÚC

| Thành phần | Công nghệ | Mô tả |
|------------|-----------|--------|
| Backend API | NestJS + TypeScript | REST API, 12 modules |
| Admin Dashboard | React 18 | Quản trị cho Admin & Shop Owner |
| Mobile App | Expo Router (React Native) | Ứng dụng du lịch cho Tourist |
| Database | PostgreSQL + Prisma ORM | 12 entities, đầy đủ indexes |
| Authentication | JWT (access + refresh token) | RBAC 3 vai trò |

**Hệ thống phân quyền 3 vai trò:**
- **Admin** — Quản lý toàn bộ hệ thống (POI, Tour, Merchant, Analytics)
- **Shop Owner** — Quản lý POI của cửa hàng mình, xem thống kê
- **Tourist** — Duyệt tour, xem POI, nghe audio, lưu yêu thích

---

## 2. TÍNH NĂNG BACKEND (API)

### 2.1. Xác thực & Phân quyền (Auth Module)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Đăng ký tài khoản | `POST /auth/register` | ✅ Hoạt động |
| Đăng nhập (JWT) | `POST /auth/login` | ✅ Hoạt động |
| Làm mới token | `POST /auth/refresh` | ✅ Hoạt động |
| Quên mật khẩu | `POST /auth/forgot-password` | ✅ Hoạt động |
| Đặt lại mật khẩu | `POST /auth/reset-password` | ✅ Hoạt động |
| Đăng xuất | `POST /auth/logout` | ✅ Hoạt động |

**Chi tiết kỹ thuật:**
- Access token hết hạn sau 15 phút, refresh token sau 7 ngày
- Khóa tài khoản sau 5 lần đăng nhập thất bại
- Token bị thu hồi được lưu trong bảng `RevokedToken`

---

### 2.2. Quản lý Điểm tham quan (POI Module)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Danh sách POI (phân trang, tìm kiếm, lọc) | `GET /pois` | ✅ Hoạt động |
| Xem chi tiết POI | `GET /pois/:id` | ✅ Hoạt động |
| Tạo POI mới | `POST /pois` | ✅ Hoạt động |
| Cập nhật POI | `PUT /pois/:id` | ✅ Hoạt động |
| Xóa POI (soft delete) | `DELETE /pois/:id` | ✅ Hoạt động |
| Thay đổi trạng thái | `PATCH /pois/:id/status` | ✅ Hoạt động |

**Dữ liệu song ngữ:** nameVi, nameEn, descriptionVi, descriptionEn
**8 danh mục:** Ẩm thực, Đường phố, Café & Tráng miệng, Bar & Nightlife, Chợ & Đặc sản, Di tích văn hóa, Trải nghiệm & Workshop, Ngoài trời & Phong cảnh
**Workflow trạng thái:** DRAFT → ACTIVE → ARCHIVED

---

### 2.3. Quản lý Media (Media Module)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Upload ảnh/audio cho POI | `POST /pois/:poiId/media` | ✅ Hoạt động |
| Xóa media | `DELETE /pois/:poiId/media/:mediaId` | ✅ Hoạt động |

**Chi tiết:** Hỗ trợ IMAGE và AUDIO, gắn nhãn ngôn ngữ (VI/EN/ALL), giới hạn 50MB/file

---

### 2.4. Quản lý Tour (Tour Module)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Danh sách tour | `GET /tours` | ✅ Hoạt động |
| Xem chi tiết tour | `GET /tours/:id` | ✅ Hoạt động |
| Tạo tour | `POST /tours` | ✅ Hoạt động |
| Cập nhật tour | `PUT /tours/:id` | ✅ Hoạt động |
| Sắp xếp POI trong tour | `PUT /tours/:id/pois` | ✅ Hoạt động |
| Xóa tour (soft delete) | `DELETE /tours/:id` | ✅ Hoạt động |

**Chi tiết:** Hỗ trợ sắp xếp thứ tự POI qua bảng trung gian `TourPoi` với `orderIndex`

---

### 2.5. Shop Owner Module

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Xem hồ sơ cửa hàng | `GET /shop-owner/me` | ✅ Hoạt động |
| Cập nhật hồ sơ | `PATCH /shop-owner/me` | ✅ Hoạt động |
| Danh sách POI của mình | `GET /shop-owner/pois` | ✅ Hoạt động |
| Xem chi tiết POI | `GET /shop-owner/pois/:id` | ✅ Hoạt động |
| Tạo POI + upload audio | `POST /shop-owner/pois` | ✅ Hoạt động |
| Cập nhật POI | `PUT /shop-owner/pois/:id` | ✅ Hoạt động |
| Upload media | `POST /shop-owner/pois/:id/media` | ✅ Hoạt động |
| Xem thống kê | `GET /shop-owner/analytics` | ✅ Hoạt động |

**Chi tiết:** Kiểm tra quyền sở hữu POI, tự động tạo QR code khi tạo POI

---

### 2.6. Tourist Module

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Xem hồ sơ du khách | `GET /tourist/me` | ✅ Hoạt động |
| Cập nhật hồ sơ | `PATCH /tourist/me` | ✅ Hoạt động |
| Danh sách yêu thích | `GET /tourist/me/favorites` | ✅ Hoạt động |
| Thêm vào yêu thích | `POST /tourist/me/favorites` | ✅ Hoạt động |
| Xóa khỏi yêu thích | `DELETE /tourist/me/favorites/:poiId` | ✅ Hoạt động |
| Lịch sử xem POI | `GET /tourist/me/history` | ✅ Hoạt động |
| Ghi nhận lượt xem | `POST /tourist/me/history` | ✅ Hoạt động |

**Chi tiết:** Theo dõi triggerType (GPS/QR/MANUAL), audioPlayed (đã nghe audio hay chưa)

---

### 2.7. Public API (Không cần đăng nhập)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Danh sách POI công khai | `GET /public/pois` | ✅ Hoạt động |
| Chi tiết POI (kèm media) | `GET /public/pois/:id` | ✅ Hoạt động |
| POI gần đây (theo tọa độ) | `GET /public/pois/nearby` | ✅ Hoạt động |
| Danh sách tour công khai | `GET /public/tours` | ✅ Hoạt động |
| Chi tiết tour | `GET /public/tours/:id` | ✅ Hoạt động |
| Ghi log sự kiện trigger | `POST /public/trigger-log` | ✅ Hoạt động |
| Xác thực mã QR | `POST /public/qr/validate` | ✅ Hoạt động |

**Chi tiết:** Tìm POI gần đây dùng công thức Haversine, bán kính mặc định 500m

---

### 2.8. QR Code Module

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Lấy QR code của POI | `GET /pois/:id/qr` | ✅ Hoạt động |
| Tạo lại QR code | `POST /pois/:id/qr/regenerate` | ✅ Hoạt động |
| Tải QR code (PNG) | `GET /pois/:id/qr/download` | ✅ Hoạt động |

**Định dạng QR:** `gpstours:poi:{poiId}`, kích thước 512px, error correction level H

---

### 2.9. Text-to-Speech (TTS Module)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Tạo audio từ văn bản | `POST /tts/generate/:poiId` | ✅ Hoạt động |
| Danh sách giọng đọc | `GET /tts/voices` | ✅ Hoạt động |

**Engine:** Microsoft Edge TTS
**Giọng Tiếng Việt:** HoaiMyNeural (nữ), NamMinhNeural (nam)
**Giọng Tiếng Anh:** AriaNeural, GuyNeural, JennyNeural
**Đầu ra:** MP3 24kHz, 96kbps, mono

---

### 2.10. Analytics Module (Admin)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Tổng quan dashboard | `GET /admin/analytics/overview` | ✅ Hoạt động |
| Top 10 POI | Included in overview | ✅ Hoạt động |
| Thống kê trigger (GPS/QR/Manual) | Included in overview | ✅ Hoạt động |
| Lọc theo khoảng thời gian | Query params: startDate/endDate | ✅ Hoạt động |

---

### 2.11. Quản lý Merchant (Admin)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Danh sách merchant | `GET /merchants` | ✅ Hoạt động |
| Xem chi tiết | `GET /merchants/:id` | ✅ Hoạt động |
| Tạo merchant | `POST /merchants` | ✅ Hoạt động |
| Cập nhật merchant | `PUT /merchants/:id` | ✅ Hoạt động |
| Xóa merchant | `DELETE /merchants/:id` | ✅ Hoạt động |

---

### 2.12. Profile Module (Chung cho tất cả vai trò)

| Tính năng | Endpoint | Trạng thái |
|-----------|----------|------------|
| Xem hồ sơ cá nhân | `GET /me` | ✅ Hoạt động |
| Cập nhật hồ sơ | `PUT /me` | ✅ Hoạt động |
| Upload avatar | `POST /me/avatar` | ✅ Hoạt động |

---

## 3. TÍNH NĂNG ADMIN DASHBOARD (React)

### 3.1. Trang xác thực

| Trang | Đường dẫn | Trạng thái |
|-------|-----------|------------|
| Đăng nhập | `/login` | ✅ Hoạt động |
| Đăng ký | `/register` | ✅ Hoạt động |
| Quên mật khẩu | `/forgot-password` | ✅ Hoạt động |
| Đặt lại mật khẩu | `/reset-password` | ✅ Hoạt động |

### 3.2. Giao diện Admin

| Chức năng | Đường dẫn | Mô tả |
|-----------|-----------|-------|
| Dashboard | `/admin/dashboard` | Tổng quan thống kê hệ thống |
| Quản lý POI | `/admin/pois` | Danh sách, tìm kiếm, lọc, phân trang |
| Tạo POI | `/admin/pois/new` | Form tạo mới song ngữ |
| Xem POI | `/admin/pois/:id` | Chi tiết POI (chỉ đọc) |
| Sửa POI | `/admin/pois/:id/edit` | Form chỉnh sửa |
| Quản lý Tour | `/admin/tours` | Danh sách tour |
| Tạo Tour | `/admin/tours/new` | Form tạo + kéo thả sắp xếp POI |
| Xem Tour | `/admin/tours/:id` | Chi tiết tour |
| Sửa Tour | `/admin/tours/:id/edit` | Chỉnh sửa + sắp xếp POI |
| Quản lý Merchant | `/admin/merchants` | CRUD shop owner |
| Bản đồ | `/admin/map` | Bản đồ hiển thị tất cả POI/Tour |
| Thống kê | `/admin/analytics` | Dashboard biểu đồ & số liệu |
| Hồ sơ cá nhân | `/admin/profile` | Chỉnh sửa thông tin tài khoản |

### 3.3. Giao diện Shop Owner

| Chức năng | Đường dẫn | Mô tả |
|-----------|-----------|-------|
| Dashboard | `/owner/dashboard` | Thống kê nhanh POI của mình |
| Quản lý POI | `/owner/pois` | Danh sách POI sở hữu |
| Tạo POI | `/owner/pois/new` | Tạo POI + upload audio |
| Xem POI | `/owner/pois/:id` | Chi tiết (chỉ đọc) |
| Sửa POI | `/owner/pois/:id/edit` | Chỉnh sửa POI |
| Bản đồ | `/owner/map` | Bản đồ POI của mình |
| Thống kê | `/owner/analytics` | Lượt xem, audio plays theo POI |
| Hồ sơ | `/owner/profile` | Thông tin cửa hàng |

### 3.4. Thành phần UI đáng chú ý
- **DashboardLayout** — Layout thống nhất cho Admin và Shop Owner với sidebar navigation
- **ProtectedRoute** — Bảo vệ route theo JWT + kiểm tra vai trò
- **Form song ngữ** — Tất cả form nhập liệu hỗ trợ VI/EN
- **Drag & Drop** — Sắp xếp POI trong tour bằng kéo thả

---

## 4. TÍNH NĂNG ỨNG DỤNG MOBILE (Expo)

### 4.1. Màn hình chính (Tab Navigation)

| Màn hình | Tab | Mô tả |
|----------|-----|-------|
| Bản đồ | Map | Hiển thị POI trên bản đồ, GPS tracking |
| Danh sách Tour | Tours | Duyệt tour có sẵn |
| Thêm | More | Menu cài đặt, hồ sơ, lịch sử |

### 4.2. Màn hình chi tiết

| Màn hình | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Chi tiết POI | `/poi/[id]` | Gallery ảnh + audio player |
| Chi tiết Tour | `/tour/[id]` | Thông tin tour + danh sách POI |
| Theo dõi Tour | `/tour/follow/[id]` | Dẫn đường GPS theo thời gian thực |

### 4.3. Xác thực & Người dùng

| Màn hình | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Đăng nhập | `/login` | Đăng nhập tourist |
| Đăng ký | `/register` | Tạo tài khoản mới |
| Quên mật khẩu | `/forgot-password` | Khôi phục mật khẩu |
| Onboarding | `/onboarding` | Hướng dẫn lần đầu sử dụng |
| Kiểm tra thiết bị | `/device-check` | Xin quyền, chọn ngôn ngữ |

### 4.4. Cài đặt & Cá nhân

| Màn hình | Đường dẫn | Mô tả |
|----------|-----------|-------|
| Chỉnh sửa hồ sơ | `/edit-profile` | Tên hiển thị, ngôn ngữ |
| Cài đặt ngôn ngữ | `/language` | Chuyển đổi VI/EN |
| Yêu thích | `/favorites` | POI đã lưu |
| Lịch sử | `/history` | POI đã xem gần đây |
| Giới thiệu | `/about` | Thông tin ứng dụng |

### 4.5. Tính năng đặc biệt

| Tính năng | Mô tả |
|-----------|-------|
| **Quét QR** | Quét mã QR để mở POI (`/scanner`) |
| **Audio Player** | Phát audio nền với play/pause/seek |
| **GPS Auto-trigger** | Tự động phát hiện POI gần đây theo GPS |
| **Đa ngôn ngữ** | react-i18next hỗ trợ VI/EN toàn app |

---

## 5. CƠ SỞ DỮ LIỆU

### 5.1. Sơ đồ thực thể (12 bảng)

| Bảng | Mô tả | Quan hệ chính |
|------|-------|---------------|
| `User` | Tài khoản xác thực | → ShopOwner, TouristUser, Poi, Tour |
| `ShopOwner` | Hồ sơ cửa hàng | → User |
| `TouristUser` | Hồ sơ du khách | → User, Favorite, ViewHistory |
| `Poi` | Điểm tham quan | → User, PoiMedia, TourPoi, TriggerLog |
| `PoiMedia` | File ảnh/audio | → Poi |
| `Tour` | Lộ trình tham quan | → User, TourPoi |
| `TourPoi` | Bảng trung gian Tour-POI | → Tour, Poi |
| `Favorite` | POI yêu thích | → TouristUser, Poi |
| `ViewHistory` | Lịch sử xem | → TouristUser, Poi |
| `TriggerLog` | Log sự kiện GPS/QR | → Poi |
| `PasswordResetToken` | Token đặt lại mật khẩu | → User |
| `RevokedToken` | Token đã thu hồi | → User |

### 5.2. Enum quan trọng

| Enum | Giá trị |
|------|---------|
| Role | `ADMIN`, `SHOP_OWNER`, `TOURIST` |
| UserStatus | `ACTIVE`, `INACTIVE`, `LOCKED` |
| PoiStatus | `DRAFT`, `ACTIVE`, `ARCHIVED` |
| PoiCategory | 8 danh mục (Dining, Street Food, Café, Bar, Market, Cultural, Experience, Outdoor) |
| MediaType | `IMAGE`, `AUDIO` |
| MediaLanguage | `VI`, `EN`, `ALL` |
| TriggerType | `GPS`, `QR`, `MANUAL` |

---

## 6. TÍCH HỢP & THƯ VIỆN

| Tính năng | Thư viện | Mô tả |
|-----------|----------|-------|
| Text-to-Speech | msedge-tts | Tổng hợp giọng nói VI/EN |
| QR Code | qrcode | Tạo mã QR cho POI |
| Upload file | multer | Xử lý upload ảnh/audio (max 50MB) |
| Xác thực | jsonwebtoken | JWT access + refresh token |
| Đa ngôn ngữ | react-i18next | Giao diện song ngữ VI/EN |
| ORM | Prisma | Truy cập PostgreSQL type-safe |
| Bản đồ | Expo Maps | Hiển thị bản đồ trên mobile |

---

## 7. THỐNG KÊ TỔNG HỢP

| Chỉ số | Số lượng |
|--------|----------|
| Backend modules | 12 |
| API endpoints | ~50+ |
| Database entities | 12 bảng |
| Admin routes | 15 trang |
| Shop Owner routes | 8 trang |
| Mobile screens | 15+ màn hình |
| Ngôn ngữ hỗ trợ | 2 (Tiếng Việt, Tiếng Anh) |
| Vai trò người dùng | 3 (Admin, Shop Owner, Tourist) |

---

## 8. KẾT LUẬN

Hệ thống GPS Tours đã hoàn thành **Phase 1 (MVP)** với đầy đủ các tính năng cốt lõi:

1. **Hệ thống xác thực hoàn chỉnh** — Đăng ký, đăng nhập, quên/đặt lại mật khẩu, phân quyền 3 vai trò
2. **CRUD đầy đủ** — POI, Tour, Merchant, Media với soft delete và workflow trạng thái
3. **Đa nền tảng** — Admin Dashboard (Web) + Mobile App (iOS/Android)
4. **Song ngữ toàn hệ thống** — Dữ liệu và giao diện đều hỗ trợ VI/EN
5. **Tính năng đặc thù du lịch** — GPS tracking, QR scan, Audio guide (TTS), Tour navigation
6. **Phân tích dữ liệu** — Dashboard thống kê cho Admin và Shop Owner
7. **Kiến trúc sạch** — Type-safe TypeScript, Prisma ORM, JWT auth, REST API chuẩn
