# Context Snapshot — 2026-03-15

## Project Overview
- **Dự án**: GPS Tours — Hệ thống hướng dẫn du lịch ẩm thực Phố Vĩnh Khánh, Quận 4, HCMC
- **Monorepo**: `apps/api` (NestJS) + `apps/admin` (React+Vite) + `apps/mobile` (Expo/React Native)
- **Current phase**: Phase 1 COMPLETE. Phase 2 (TTS module) started. All 3 apps operational locally.

---

## CHECKPOINT — Tổng Hợp Chức Năng Hiện Có

### 1. Backend API — NestJS (`http://localhost:3000/api/v1`)

**12 modules, ~55 endpoints**

#### Auth Module (`/auth`) — 6 endpoints
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/auth/register` | Đăng ký (email, password, fullName, role) |
| POST | `/auth/login` | Đăng nhập → accessToken + refreshToken |
| POST | `/auth/refresh` | Refresh access token (rotation) |
| POST | `/auth/forgot-password` | Gửi email reset password |
| POST | `/auth/reset-password` | Reset password bằng token |
| POST | `/auth/logout` | Thu hồi token (cần JWT) |

**Bảo mật**: JWT (access 15min + refresh 7d), bcrypt 12 rounds, khóa tài khoản sau 5 lần sai (30 phút), refresh token rotation, token revocation.

#### POIs Module (`/pois`) — 6 endpoints (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/pois` | Tạo POI mới |
| GET | `/pois` | Danh sách POI (phân trang, lọc status/category, tìm kiếm) |
| GET | `/pois/:id` | Chi tiết POI + media |
| PUT | `/pois/:id` | Cập nhật POI |
| PATCH | `/pois/:id/status` | Chuyển status (DRAFT → ACTIVE → ARCHIVED) |
| DELETE | `/pois/:id` | Soft delete POI |

#### Tours Module (`/tours`) — 6 endpoints (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/tours` | Tạo tour |
| GET | `/tours` | Danh sách tour (phân trang, tìm kiếm) |
| GET | `/tours/:id` | Chi tiết tour + danh sách POI |
| PUT | `/tours/:id` | Cập nhật tour |
| PUT | `/tours/:id/pois` | Gán thứ tự POI cho tour |
| DELETE | `/tours/:id` | Soft delete tour |

#### Media Module (`/pois/:poiId/media`) — 2 endpoints (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/pois/:poiId/media` | Upload hình ảnh/audio (max 50MB, multipart) |
| DELETE | `/pois/:poiId/media/:mediaId` | Xóa media file |

#### Public Module (`/public`) — 7 endpoints (Không cần auth)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/public/pois` | Tất cả POI đang ACTIVE + media |
| GET | `/public/pois/nearby?lat&lng&radius` | POI gần vị trí (Haversine formula) |
| GET | `/public/pois/:id` | Chi tiết 1 POI (chỉ ACTIVE) |
| GET | `/public/tours` | Tất cả tour ACTIVE |
| GET | `/public/tours/:id` | Chi tiết tour + danh sách POI + route |
| POST | `/public/trigger-log` | Ghi nhật ký trigger GPS/QR (anonymous, deviceId) |
| POST | `/public/qr/validate` | Validate QR format `gpstours:poi:{id}` |

#### Tourist Module (`/tourist`) — 7 endpoints (JWT + TOURIST)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/tourist/me` | Profile du khách |
| PATCH | `/tourist/me` | Cập nhật settings (displayName, languagePref, autoPlayAudio) |
| GET | `/tourist/me/favorites` | Danh sách yêu thích (phân trang) |
| POST | `/tourist/me/favorites` | Thêm yêu thích |
| DELETE | `/tourist/me/favorites/:poiId` | Xóa yêu thích |
| GET | `/tourist/me/history` | Lịch sử xem (phân trang) |
| POST | `/tourist/me/history` | Ghi lịch sử (poiId, triggerType, audioPlayed) |

#### Shop Owner Module (`/shop-owner`) — 7 endpoints (JWT + SHOP_OWNER)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/shop-owner/me` | Profile shop owner |
| PATCH | `/shop-owner/me` | Cập nhật thông tin shop |
| GET | `/shop-owner/pois` | Danh sách POI của mình |
| POST | `/shop-owner/pois` | Tạo POI (kèm audio upload nếu có) |
| PUT | `/shop-owner/pois/:id` | Sửa POI của mình |
| POST | `/shop-owner/pois/:id/media` | Upload media cho POI |
| GET | `/shop-owner/analytics` | Thống kê (views, audio plays, per-POI) |

#### Merchants Module (`/merchants`) — 5 endpoints (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/merchants` | Tạo tài khoản shop owner |
| GET | `/merchants` | Danh sách merchants (phân trang, tìm kiếm) |
| GET | `/merchants/:id` | Chi tiết merchant |
| PUT | `/merchants/:id` | Cập nhật merchant |
| DELETE | `/merchants/:id` | Xóa/vô hiệu hóa merchant |

#### Profile Module (`/me`) — 3 endpoints (Tất cả role)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/me` | Profile hiện tại |
| PUT | `/me` | Cập nhật profile (fullName, phone, birthDate, gender...) |
| POST | `/me/avatar` | Upload avatar (max 5MB) |

#### Analytics Module (`/admin/analytics`) — 1 endpoint (Admin only)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/admin/analytics/overview` | KPI tổng quan (POI count, tours, tourists, views, top POIs, trigger stats) |

#### TTS Module (`/tts`) — 2 endpoints (Admin + Shop Owner)
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/tts/generate/:poiId` | Tạo audio TTS từ text (VI/EN, chọn giọng đọc) |
| GET | `/tts/voices` | Liệt kê giọng đọc khả dụng |

**TTS Engine**: msedge-tts, hỗ trợ VI (HoaiMyNeural, NamMinhNeural) + EN (AriaNeural, GuyNeural, JennyNeural). Auto-archive audio cũ, cleanup sau 30 ngày.

---

### 2. Admin Dashboard — React + Vite (`http://localhost:5173`)

**14 trang, 6 services, 10+ components**

#### Trang Auth (Public)
| Trang | Chức năng |
|-------|-----------|
| `/login` | Đăng nhập Admin/Shop Owner |
| `/register` | Đăng ký tài khoản |
| `/forgot-password` | Quên mật khẩu |
| `/reset-password` | Đặt lại mật khẩu |

#### Trang Admin (`/admin/*`)
| Trang | Chức năng |
|-------|-----------|
| `/admin/dashboard` | Dashboard: KPI cards, hoạt động gần đây, quick actions |
| `/admin/pois` | Quản lý POI: bảng + tìm kiếm + lọc status/category |
| `/admin/pois/new` | Tạo POI mới |
| `/admin/pois/:id` | Xem chi tiết POI |
| `/admin/pois/:id/edit` | Sửa POI + media manager + MapPicker |
| `/admin/tours` | Quản lý Tour: bảng + tìm kiếm + phân trang |
| `/admin/tours/new` | Tạo tour mới |
| `/admin/tours/:id/edit` | Sửa tour + gán thứ tự POI |
| `/admin/merchants` | Quản lý Shop Owner: card layout + tìm kiếm |
| `/admin/merchants/new` | Tạo tài khoản merchant |
| `/admin/merchants/:id/edit` | Sửa merchant |
| `/admin/analytics` | Thống kê: KPI cards, biểu đồ tuần, top POIs |
| `/admin/profile` | Profile cá nhân + avatar |

#### Trang Shop Owner (`/owner/*`)
| Trang | Chức năng |
|-------|-----------|
| `/owner/dashboard` | Tổng quan: POI của mình, stats, quick actions |
| `/owner/pois/new` | Tạo POI + song ngữ + media + MapPicker |
| `/owner/analytics` | Thống kê: lọc 7d/30d/90d, biểu đồ, per-POI breakdown |
| `/owner/profile` | Profile cửa hàng + avatar |

#### Components chính
| Component | Chức năng |
|-----------|-----------|
| `DashboardLayout` | Layout Admin: sidebar + header |
| `ShopOwnerLayout` | Layout Shop Owner: header + nav tabs |
| `MapPicker` | Bản đồ Leaflet + Nominatim geocoding + chọn tọa độ |
| `POIPreviewModal` | Preview POI + audio player |
| `ConfirmDialog` | Dialog xác nhận xóa |
| `ProtectedRoute` | Auth guard cho routes |
| `ToastProvider` | Hệ thống thông báo toast |

#### Services
| Service | Endpoints |
|---------|-----------|
| `auth.service.ts` | login, register, refresh, logout, forgot/reset password |
| `poi.service.ts` | CRUD POIs + media upload/delete + filtering |
| `tour.service.ts` | CRUD Tours + POI sequences |
| `merchant.service.ts` | CRUD Merchants |
| `profile.service.ts` | Get/Update profile + avatar |
| `shopOwnerPortal.service.ts` | Shop owner portal APIs |

---

### 3. Mobile App — Expo/React Native (Expo Go)

**12 screens, 5 services, 2 components chính**

#### Màn hình
| Màn hình | File | Chức năng |
|----------|------|-----------|
| **Map** (Tab) | `(tabs)/index.tsx` | Bản đồ + POI markers + GPS trigger + bottom sheet auto |
| **Tours** (Tab) | `(tabs)/tours.tsx` | Danh sách tour + badges + navigate |
| **More** (Tab) | `(tabs)/more.tsx` | Menu: profile, settings, favorites, history, logout |
| **POI Detail** | `poi/[id].tsx` | Carousel ảnh, AudioPlayer, language toggle, favorite |
| **Tour Detail** | `tour/[id].tsx` | Route map (Polyline), POI timeline, "Start Tour" |
| **Tour Follow** | `tour/follow/[id].tsx` | Navigation thời gian thực, live tracking |
| **QR Scanner** | `scanner.tsx` | Camera quét QR + validate online/offline |
| **Language** | `language.tsx` | Chọn ngôn ngữ VI/EN |
| **Favorites** | `favorites.tsx` | POI yêu thích (cần đăng nhập) |
| **History** | `history.tsx` | Lịch sử xem (cần đăng nhập) |
| **Onboarding** | `onboarding.tsx` | Tutorial 3 slide cho người dùng mới |
| **Login/Register** | `login.tsx`, `register.tsx` | Đăng ký/Đăng nhập Tourist |

#### Tính năng GPS & Audio
- **GPS Trigger**: `watchPositionAsync` mỗi 2s, ngưỡng 5m → Haversine distance → auto-play audio khi trong `triggerRadius` (default 50m)
- **Audio Selection**: Ưu tiên theo language preference → MediaLanguage match → fallback bất kỳ audio
- **AudioPlayer**: Play/pause, progress bar, hiện thời gian, auto-play, language-aware
- **AudioContext**: Global singleton — 1 audio player toàn app, tránh conflict
- **POITriggerSheet**: Bottom sheet hiện khi user vào vùng trigger POI

#### Offline
- **SQLite**: `syncOfflinePois()` cache text POI data
- **QR Offline**: Validate format locally khi không có mạng
- **Audio**: flag `hasLargeAudio` — cần network để stream

#### Services
| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios client, auto LAN IP detect, JWT injection, `getMediaUrl()` |
| `publicService.ts` | POIs, Tours, QR validate, Trigger log (no auth) |
| `touristService.ts` | Profile, Favorites, History (JWT) |
| `authService.ts` | Login, Register |
| `database.ts` | SQLite offline: syncOfflinePois(), getOfflinePoi() |

---

### 4. Database — PostgreSQL 15 + Prisma

**12 models, 10 enums**

#### Models
| Model | Mô tả | Fields chính |
|-------|--------|-------------|
| `User` | Tài khoản (3 roles) | email, passwordHash, fullName, role, status, failedLoginCount |
| `ShopOwner` | Profile chủ quán | shopName, shopAddress, phone, avatarUrl, openingHours |
| `TouristUser` | Profile du khách | displayName, languagePref, autoPlayAudio, pushEnabled, deviceId |
| `Poi` | Điểm tham quan | nameVi/En, descriptionVi/En, lat/lng, triggerRadius, category, status |
| `PoiMedia` | Media file | type (IMAGE/AUDIO), language (VI/EN/ALL), url, sizeBytes, durationSeconds |
| `Tour` | Tour tham quan | nameVi/En, descriptionVi/En, estimatedDuration, status |
| `TourPoi` | Gán POI vào Tour | tourId, poiId, orderIndex |
| `Favorite` | Yêu thích | touristId, poiId (unique pair) |
| `ViewHistory` | Lịch sử xem | touristId, poiId, audioPlayed, triggerType |
| `TriggerLog` | Log GPS/QR trigger | deviceId, poiId, triggerType, userAction, lat/lng, distance |
| `PasswordResetToken` | Token reset mật khẩu | token, expiresAt, usedAt |
| `RevokedToken` | Token đã thu hồi | tokenId, type, reason, expiresAt |

#### Enums
| Enum | Giá trị |
|------|---------|
| `Role` | ADMIN, SHOP_OWNER, TOURIST |
| `UserStatus` | ACTIVE, INACTIVE, LOCKED |
| `PoiCategory` | DINING, STREET_FOOD, CAFES_DESSERTS, BARS_NIGHTLIFE, MARKETS_SPECIALTY, CULTURAL_LANDMARKS, EXPERIENCES_WORKSHOPS, OUTDOOR_SCENIC |
| `PoiStatus` | DRAFT, ACTIVE, ARCHIVED |
| `TourStatus` | DRAFT, ACTIVE, ARCHIVED |
| `MediaType` | IMAGE, AUDIO |
| `MediaLanguage` | VI, EN, ALL |
| `TriggerType` | GPS, QR, MANUAL |
| `UserAction` | ACCEPTED, SKIPPED, DISMISSED |
| `TokenType` | ACCESS, REFRESH |

---

### 5. Infrastructure

| Component | Chi tiết |
|-----------|----------|
| Docker | PostgreSQL 15 (port 5432) + Redis 7 (port 6379) |
| Prisma Studio | `http://localhost:5555` |
| Swagger API Docs | `http://localhost:3000/api` |
| Static Files | `/uploads` served via ServeStaticModule |
| Guards | JwtAuthGuard, RolesGuard |
| Decorators | @Roles(), @CurrentUser() |
| Filters | HttpExceptionFilter (global error formatting) |

---

### 6. Lệnh Chạy

```bash
# 1. Docker (PostgreSQL + Redis)
cd apps/api && docker compose up -d

# 2. Database setup
cd apps/api && npx prisma migrate dev && npx prisma db seed

# 3. Backend API
cd apps/api && npm run start:dev     # → http://localhost:3000

# 4. Admin Dashboard
cd apps/admin && npm run dev         # → http://localhost:5173

# 5. Mobile App
cd apps/mobile && npx expo start --clear  # → Quét QR bằng Expo Go

# Database tools
cd apps/api && npx prisma studio     # → http://localhost:5555
```

---

## Chức Năng Chưa Làm (Phase 2+)

> Chi tiết: xem `docs/implementation_plan.md`

### Cao
| Feature | Status | Mô tả |
|---------|--------|-------|
| TTS Frontend Integration | Chưa | Nút "Tạo Audio TTS" trên Admin/Shop Owner POI form |
| Shop Registration Flow | Chưa | PENDING_REVIEW → APPROVED → REJECTED → SUSPENDED + giấy phép |
| Translation NER | Chưa | Dịch thông minh giữ danh từ riêng (Hai Bà Trưng ≠ Two Lady Trung) |
| Audio Criteria Engine | Chưa | Scoring POI khi nhiều POI trigger cùng lúc |
| Offline Map (PMTiles) | Chưa | Tải bản đồ offline khu vực Q4 |
| Language Package | Chưa | Gói ngôn ngữ offline (300 file/lang, max 3 lang, LRU) |

### Trung bình
| Feature | Status | Mô tả |
|---------|--------|-------|
| Payment (MoMo/VNPay) | Chưa | Subscription premium cho tourist & shop owner |
| WebSocket Dashboard | Chưa | Real-time user count by role |
| Heatmap UI | Một phần | trigger_log có rồi, cần aggregation + visualization |
| Frontend Highlight POI | Chưa | Pulse animation marker khi đang phát audio |
| Load Testing | Chưa | k6 scripts, benchmark results |

---

## Documentation
| File | Nội dung | Status |
|------|----------|--------|
| `docs/system-proposal.md` | Kiến trúc hệ thống tổng thể (17 sections) | Current |
| `docs/implementation_plan.md` | Kế hoạch phát triển Phase 2+ (40 tasks) | New |
| `docs/snapshot/project_snapshot.md` | Project status dashboard | Current |
| `docs/step3_prd/` | 13 PRD documents + diagrams | Current |
| `README.md` | Hướng dẫn setup & chạy | Current |
