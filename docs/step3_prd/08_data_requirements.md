# 🗃️ Data Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-04-04

---

## 1. Entity Relationship Diagram

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│      User      │       │      POI       │       │     Tour       │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │       │ id (PK)        │
│ email          │       │ name_vi        │       │ name_vi        │
│ password_hash  │       │ name_en        │       │ name_en        │
│ full_name      │       │ description_vi │       │ description_vi │
│ role (enum)    │       │ description_en │       │ description_en │
│ status         │       │ latitude (Flt) │       │ thumbnail_url  │
│ profile (JSON) │       │ longitude(Flt) │       │ est_duration   │
│ created_at     │       │ trigger_radius │       │ status         │
│ updated_at     │       │ category       │       │ created_by(FK) │
└───────┬────────┘       │ status         │       │ created_at     │
        │                │ qr_code_url    │       │ updated_at     │
   ┌────▼────────┐       │ created_by(FK) │       │ deleted_at     │
   │ Shop_Owner  │       │ owner_id (FK)  │       └───────┬────────┘
   │ (profile)   │       │ created_at     │               │
   ├─────────────┤       │ updated_at     │               │
   │ id (PK)     │       │ deleted_at     │               │
   │ user_id(FK) │       └───────┬────────┘               │
   │ shop_name   │               │                        │
   │ shop_address│  ┌────────────┼────────────┐           │
   │ phone       │  │            │            │           │
   │ avatar_url  │  │    ┌───────▼───────┐    │   ┌───────▼───────┐
   │ opening_hrs │  │    │   POI_Media   │    │   │   Tour_POI    │
   └─────────────┘  │    ├───────────────┤    │   ├───────────────┤
                    │    │ id (PK)       │    │   │ id (PK)       │
                    │    │ poi_id (FK)   │    │   │ tour_id (FK)  │
                    │    │ type          │    │   │ poi_id (FK)   │
                    │    │ language      │    │   │ order_index   │
                    │    │ url           │    │   └───────────────┘
                    │    │ duration      │    │
                    │    │ size_bytes    │    │
                    │    │ created_at    │    │
                    │    └───────────────┘    │
                    │                        │
┌───────────────────┼────────────────────────┼───────────────────┐
│          TOURIST USER DOMAIN               │                   │
├────────────────────────────────────────────┤                   │
│                   │                        │                   │
│  ┌────────────────┤    ┌───────────────┐   │  ┌────────────────┐│
│  │  Tourist_User  │    │ View_History  │   │  │   Favorite     ││
│  ├────────────────┤    ├───────────────┤   │  ├────────────────┤│
│  │ id (PK)        │◄───┤ tourist_id(FK)│   │  │ id (PK)        ││
│  │ user_id (FK)   │    │ poi_id (FK)   │   │  │ tourist_id(FK) ││
│  │ display_name   │    │ viewed_at     │   │  │ poi_id (FK)    ││
│  │ language_pref  │    │ audio_played  │   │  │ created_at     ││
│  │ auto_play      │    │ trigger_type  │   │  └────────────────┘│
│  │ push_token     │    └───────────────┘   │                    │
│  │ device_id      │                        │                    │
│  └────────────────┘                        │                    │
└────────────────────────────────────────────┘                    │
```

> **Lưu ý thiết kế thực tế (Implementation Notes):**
> - `User` là bảng hợp nhất cho cả Admin, Shop Owner, và Tourist (phân quyền bằng cột `role`).
> - Không sử dụng PostGIS extension; tọa độ lưu trực tiếp bằng 2 trường `Float`.
> - Không tạo bảng `QR_Code` riêng; QR validation dùng format string `gpstours:poi:<uuid>` xử lý trên code. QR code PNG được auto-generate khi tạo POI, lưu tại `/uploads/qr/` và URL lưu trong trường `qr_code_url` của bảng POI.
> - `PoiStatus` / `TourStatus` dùng giá trị `ARCHIVED` thay vì `INACTIVE`.

---

## 2. Entity Definitions

### 2.1 User (Unified — Admin, Shop Owner, Tourist)

> **Implementation Note:** Trong code thực tế, bảng `Admin` và `Shop_Owner` được hợp nhất thành **1 bảng `User` duy nhất**, phân quyền bằng cột `role`. Thiết kế này đơn giản hóa authentication flow và giảm trùng lặp.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Display name |
| `role` | ENUM | NOT NULL | Values: ADMIN, SHOP_OWNER, TOURIST |
| `status` | ENUM | NOT NULL, DEFAULT ACTIVE | Values: ACTIVE, INACTIVE, LOCKED |
| `failed_login_count` | INTEGER | DEFAULT 0 | Failed login attempts |
| `locked_until` | TIMESTAMP | NULL | Account lock expiry |
| `refresh_token` | VARCHAR(500) | NULL | Current refresh token |
| `refresh_token_id` | VARCHAR(100) | NULL | Refresh token identifier |
| `profile` | JSONB | NULL | Extended profile data (phone, birth_date, address, gender) |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_user_email` on `email` (UNIQUE)

---

### 2.2 Password_Reset_Token

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → User.id, NOT NULL | Token owner |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Reset token (hashed) |
| `expires_at` | TIMESTAMP | NOT NULL | Expiry time (1 hour) |
| `used_at` | TIMESTAMP | NULL | When token was used |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Indexes:**
- `idx_reset_token` on `token`
- `idx_reset_user` on `user_id`
- `idx_reset_expires` on `expires_at`

**Business Rules:**
- Token hết hạn sau 1 giờ (BR-108)
- Chỉ dùng được 1 lần - set `used_at` khi sử dụng (BR-107)
- Delete expired tokens bằng scheduled job

---

### 2.2 Shop_Owner (Profile extension)

> **Implementation Note:** `ShopOwner` là bảng phụ liên kết 1-1 với `User` để lưu thông tin cửa hàng. Không phải entity đăng nhập riêng.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → User.id, UNIQUE, NOT NULL | Link to User table |
| `shop_name` | VARCHAR(200) | NOT NULL | Tên quán |
| `shop_address` | VARCHAR(500) | NULL | Địa chỉ quán |
| `phone` | VARCHAR(20) | NULL | Số điện thoại |
| `avatar_url` | VARCHAR(500) | NULL | Ảnh đại diện |
| `opening_hours` | JSONB | NULL | `{ day, open, close }[]` |

**Indexes:**
- `idx_shop_owner_user_id` on `user_id` (UNIQUE)

**Notes:**
- Mỗi Shop Owner có thể sở hữu nhiều POIs
- Đăng nhập qua bảng `User` với `role = SHOP_OWNER`

---

### 2.3 POI (Point of Interest)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `name_vi` | VARCHAR(200) | NOT NULL | Vietnamese name |
| `name_en` | VARCHAR(200) | NULL | English name |
| `name_zh` | VARCHAR(200) | NULL | Chinese name (Simplified) |
| `description_vi` | TEXT | NOT NULL | Vietnamese description |
| `description_en` | TEXT | NULL | English description |
| `description_zh` | TEXT | NULL | Chinese description (Simplified) |
| `latitude` | FLOAT | NOT NULL | GPS latitude |
| `longitude` | FLOAT | NOT NULL | GPS longitude |
| `trigger_radius` | INTEGER | DEFAULT 15 | Radius in meters (5-100) |
| `category` | ENUM | NOT NULL | Values: DINING, STREET_FOOD, CAFES_DESSERTS, BARS_NIGHTLIFE, MARKETS_SPECIALTY, CULTURAL_LANDMARKS, EXPERIENCES_WORKSHOPS, OUTDOOR_SCENIC |
| `status` | ENUM | NOT NULL | Values: DRAFT, ACTIVE, ARCHIVED |
| `qr_code_url` | VARCHAR(500) | NULL | URL to generated QR code PNG (`/uploads/qr/poi_<uuid>.png`) |
| `created_by` | UUID | FK → User.id, NOT NULL | Creator user |
| `owner_id` | UUID | FK → User.id, NULL | POI owner (Shop Owner role) |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_poi_status` on `status`
- `idx_poi_category` on `category`
- `idx_poi_deleted_at` on `deleted_at`
- `idx_poi_owner` on `owner_id`

> **Implementation Note:** Không sử dụng PostGIS `GEOMETRY(POINT)`. Tọa độ lưu trực tiếp bằng 2 trường `Float` (`latitude`, `longitude`). Tìm kiếm gần (nearby) sử dụng công thức Haversine trong application layer.

**Validation Rules:**
- `-90 <= latitude <= 90`
- `-180 <= longitude <= 180`
- `5 <= trigger_radius <= 100`

---

### 2.3 POI_Media

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Parent POI |
| `type` | ENUM | NOT NULL | Values: IMAGE, AUDIO |
| `language` | ENUM | NOT NULL | Values: VI, EN, ALL |
| `url` | VARCHAR(500) | NOT NULL | CDN URL |
| `filename` | VARCHAR(255) | NOT NULL | Original filename |
| `size_bytes` | BIGINT | NOT NULL | File size |
| `duration_seconds` | INTEGER | NULL | Audio duration |
| `width` | INTEGER | NULL | Image width |
| `height` | INTEGER | NULL | Image height |
| `mime_type` | VARCHAR(50) | NOT NULL | e.g., image/jpeg, audio/mpeg |
| `order_index` | INTEGER | DEFAULT 0 | Display order |
| `created_at` | TIMESTAMP | NOT NULL | Upload timestamp |

**Indexes:**
- `idx_media_poi` on `poi_id`
- `idx_media_type` on `type`

**Validation Rules:**
- IMAGE: max 5MB, types: jpg, png, webp
- AUDIO: max 50MB, types: mp3, wav

---

### 2.4 Tour

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `name_vi` | VARCHAR(200) | NOT NULL | Vietnamese name |
| `name_en` | VARCHAR(200) | NULL | English name |
| `description_vi` | TEXT | NULL | Vietnamese description |
| `description_en` | TEXT | NULL | English description |
| `thumbnail_url` | VARCHAR(500) | NULL | Cover image URL |
| `estimated_duration` | INTEGER | NULL | Duration in minutes |
| `status` | ENUM | NOT NULL | Values: DRAFT, ACTIVE, ARCHIVED |
| `created_by` | UUID | FK → User.id, NOT NULL | Creator user |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_tour_status` on `status`

---

### 2.5 Tour_POI (Junction Table)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `tour_id` | UUID | FK → Tour.id, NOT NULL | Parent Tour |
| `poi_id` | UUID | FK → POI.id, NOT NULL | POI in tour |
| `order_index` | INTEGER | NOT NULL | Position in tour |
| `title_override` | VARCHAR(255) | NULL | Custom stop title |
| `description_override` | TEXT | NULL | Custom stop description |
| `custom_intro` | TEXT | NULL | Intro text before stop |
| `estimated_stay_minutes` | INTEGER | NULL | Expected stay |
| `transition_note` | TEXT | NULL | Note to next stop |
| `is_required` | BOOLEAN | DEFAULT true | Mandatory stop or not |
| `unlock_rule` | VARCHAR(255) | NULL | Rule for unlocking stop |
| `created_at` | TIMESTAMP | NOT NULL | Link creation |

**Indexes:**
- `idx_tour_poi_tour` on `tour_id`
- `idx_tour_poi_poi` on `poi_id`
- UNIQUE on `(tour_id, poi_id)`
- UNIQUE on `(tour_id, order_index)`

---

## 3. Tourist User Domain (Optional Login)

> **Note:** Tourist có thể sử dụng app mà không cần login. Login là optional để sync data across devices.

### 3.1 Tourist_User

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → User.id, UNIQUE, NOT NULL | Link to unified User |
| `device_id` | VARCHAR(255) | NULL | Device identifier |
| `display_name` | VARCHAR(100) | NULL | Display name |
| `language_pref` | ENUM | DEFAULT 'VI' | Values: VI, EN (extensible) |
| `auto_play_audio` | BOOLEAN | DEFAULT true | Auto-play audio on trigger |
| `push_token` | VARCHAR(255) | NULL | FCM/APNs token |
| `push_enabled` | BOOLEAN | DEFAULT false | Push notification enabled |
| `created_at` | TIMESTAMP | NOT NULL | First app open |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
- `idx_tourist_device` on `device_id`
- UNIQUE `tourist_users.user_id`

**Notes:**
- User được tạo ngay khi mở app lần đầu (với device_id)
- Khi login, email được gắn vào record đó
- Có thể merge nhiều device_id vào 1 account

---

### 3.2 View_History

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → Tourist_User.id, NOT NULL | User |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Viewed POI |
| `viewed_at` | TIMESTAMP | NOT NULL | View timestamp |
| `view_duration_sec` | INTEGER | NULL | Time spent on POI detail |
| `audio_played` | BOOLEAN | DEFAULT false | Did user play audio? |
| `trigger_type` | ENUM | NOT NULL | Values: GPS, QR, MANUAL |

**Indexes:**
- `idx_history_user` on `user_id`
- `idx_history_poi` on `poi_id`
- `idx_history_date` on `viewed_at`

> **Implementation Note:** Trường `view_duration_sec` và `audio_completed` trong PRD gốc chưa được implement trong MVP. Sẽ bổ sung ở post-MVP nếu cần.

---

### 3.3 User_Favorite

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → Tourist_User.id, NOT NULL | User |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Favorited POI |
| `created_at` | TIMESTAMP | NOT NULL | Favorite timestamp |

**Indexes:**
- `idx_fav_user` on `user_id`
- UNIQUE on `(user_id, poi_id)`

---

> **Implementation Note:** Bảng `QR_Code` riêng biệt trong PRD gốc **không được triển khai** trong MVP. Thay vào đó:
> - QR validation sử dụng format string `gpstours:poi:<uuid>` và được xử lý trực tiếp trong code controller (`/public/qr/validate`).
> - QR code PNG được **auto-generate** khi tạo POI bởi `QrService` (sử dụng thư viện `qrcode`), lưu tại `/uploads/qr/poi_<uuid>.png` (512x512, error correction level H).
> - URL file QR được lưu trong trường `qr_code_url` của bảng POI.
> - Admin có thể xem, download, và regenerate QR code thông qua API endpoints: `GET /pois/:id/qr`, `GET /pois/:id/qr/download`, `POST /pois/:id/qr/regenerate`.

---

### 4.2 Trigger_Log

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `device_id` | VARCHAR(255) | NOT NULL | Device identifier |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Triggered POI |
| `trigger_type` | ENUM | NOT NULL | Values: GPS, QR, MANUAL |
| `user_action` | ENUM | NOT NULL | Values: ACCEPTED, SKIPPED, DISMISSED |
| `user_lat` | FLOAT | NULL | User latitude at trigger |
| `user_lng` | FLOAT | NULL | User longitude at trigger |
| `distance_meters` | FLOAT | NULL | Distance to POI at trigger |
| `created_at` | TIMESTAMP | NOT NULL | Event timestamp |

**Indexes:**
- `idx_trigger_user` on `user_id`
- `idx_trigger_poi` on `poi_id`
- `idx_trigger_date` on `triggered_at`
- `idx_trigger_type` on `trigger_type`

**Notes:**
- Dùng cho analytics: accept rate, popular POIs, trigger patterns
- Dùng cho cooldown logic (BR-506: không trigger lại trong 5 phút)
- Partition by month nếu data lớn

---

## 5. TypeScript Interfaces

```typescript
// Admin / User
interface Admin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'LOCKED';
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Shop Owner
interface ShopOwner {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  shopName: string;
  shopAddress?: string;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// POI
interface POI {
  id: string;
  nameVi: string;
  nameEn?: string;
  descriptionVi: string;
  descriptionEn?: string;
  latitude: number;
  longitude: number;
  triggerRadius: number;
  category:
    | 'DINING'
    | 'STREET_FOOD'
    | 'CAFES_DESSERTS'
    | 'BARS_NIGHTLIFE'
    | 'MARKETS_SPECIALTY'
    | 'CULTURAL_LANDMARKS'
    | 'EXPERIENCES_WORKSHOPS'
    | 'OUTDOOR_SCENIC';
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  qrCodeUrl?: string; // Auto-generated QR code PNG URL
  media: POIMedia[];
  createdBy?: string;
  ownerId?: string;  // Shop Owner FK
  createdAt: Date;
  updatedAt: Date;
}

// Media
interface POIMedia {
  id: string;
  poiId: string;
  type: 'IMAGE' | 'AUDIO';
  language: 'VI' | 'EN' | 'ZH' | 'ALL';
  url: string;
  filename: string;
  sizeBytes: number;
  durationSeconds?: number;
  mimeType: string;
  orderIndex: number;
}

// Tour
interface Tour {
  id: string;
  nameVi: string;
  nameEn?: string;
  descriptionVi: string;
  descriptionEn?: string;
  thumbnailUrl?: string;
  estimatedDuration?: number;
  status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  pois: TourPOI[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TourPOI {
  id: string;
  tourId: string;
  poiId: string;
  poi?: POI;
  orderIndex: number;
  titleOverride?: string;
  descriptionOverride?: string;
  customIntro?: string;
  estimatedStayMinutes?: number;
  transitionNote?: string;
  isRequired: boolean;
  unlockRule?: string;
}

// ============================================
// TOURIST USER DOMAIN (Optional Login)
// ============================================

interface TouristUser {
  id: string;
  deviceId: string;
  email?: string;
  displayName?: string;
  authProvider?: 'EMAIL' | 'GOOGLE' | 'FACEBOOK' | 'APPLE';
  languagePref: 'VI' | 'EN';
  autoPlayAudio: boolean;
  pushToken?: string;
  pushEnabled: boolean;
  createdAt: Date;
  lastActiveAt: Date;
}

interface ViewHistory {
  id: string;
  userId: string;
  poiId: string;
  poi?: POI;
  viewedAt: Date;
  viewDurationSec?: number;
  audioPlayed: boolean;
  audioCompleted: boolean;
  triggerType: 'GPS' | 'QR' | 'MANUAL';
}

interface UserFavorite {
  id: string;
  userId: string;
  poiId: string;
  poi?: POI;
  createdAt: Date;
}

// ============================================
// SYSTEM SUPPORT
// ============================================

interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

interface RevokedToken {
  id: string;
  tokenId: string;
  userId: string;
  type: 'ACCESS' | 'REFRESH';
  reason?: string;
  expiresAt: Date;
  createdAt: Date;
}

interface QRCode {
  id: string;
  poiId: string;
  codeData: string;
  format: 'URL' | 'POI_ID';
  isActive: boolean;
  scanCount: number;
  generatedAt: Date;
  lastScannedAt?: Date;
}

interface TriggerLog {
  id: string;
  userId?: string;
  poiId: string;
  triggerType: 'GPS' | 'QR' | 'MANUAL';
  userAction: 'ACCEPTED' | 'SKIPPED' | 'DISMISSED';
  userLat?: number;
  userLng?: number;
  distanceMeters?: number;
  triggeredAt: Date;
}

interface SupportedLanguage {
  code: string;
  label: string;
  enabled: boolean;
  supportsText: boolean;
  supportsTts: boolean;
  requiresPack: boolean;
  allowOffline: boolean;
  defaultVoice?: string;
  fallbackVoice?: string;
  priority: number;
  description?: string;
  region?: string;
}

// ============================================
// SYSTEM SUPPORT
// ============================================
```

---

## 6. Data Volume Estimates

| Entity | Initial | 6 Months | 1 Year |
|--------|---------|----------|---------|
| Admins | 5 | 10 | 20 |
| **Shop_Owners** | **0** | **50** | **200** |
| Supported_Languages | 11 | 11 | 15 |
| Revoked_Tokens | 0 | 200 | 2000 |
| Password_Reset_Tokens | 0 | 20 | 50 |
| POIs | 20 | 100 | 300 |
| Media files | 100 | 500 | 1500 |
| Tours | 3 | 15 | 50 |
| Tour_POIs | 30 | 150 | 500 |
| Tourist_Users | 0 | 500 | 2000 |
| View_History | 0 | 5000 | 20000 |
| User_Favorites | 0 | 200 | 1000 |
| Trigger_Logs | 0 | 10000 | 50000 |

**Storage Estimates:**
- Images: ~500KB avg × 500 = 250MB (6 months)
- Audio: ~5MB avg × 200 = 1GB (6 months)
- Database: ~100MB (6 months)

---

## 5. Data Migration Notes

**If migrating from existing system:**
- POI data from Excel → JSON → Database
- Images from local storage → Cloud storage
- Audio files from local → Cloud storage

**Data validation on import:**
- Validate coordinates are in expected region
- Validate file sizes
- Check for duplicate names

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 7.6
