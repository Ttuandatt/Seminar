# 🗃️ Data Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 2.1  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-02-10

---

## 1. Entity Relationship Diagram

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│     Admin      │       │      POI       │       │     Tour       │
├────────────────┤       ├────────────────┤       ├────────────────┤
│ id (PK)        │       │ id (PK)        │       │ id (PK)        │
│ username       │       │ name_vi        │       │ name_vi        │
│ email          │       │ name_en        │       │ name_en        │
│ password_hash  │       │ description_vi │       │ description_vi │
│ role           │       │ description_en │       │ description_en │
│ created_at     │       │ latitude       │       │ thumbnail_url  │
│ updated_at     │       │ longitude      │       │ est_duration   │
└────────────────┘       │ trigger_radius │       │ status         │
                         │ category       │       │ created_by(FK) │
                         │ status         │       │ created_at     │
                         │ created_by(FK) │       │ updated_at     │
                         │ created_at     │       │ deleted_at     │
                         │ updated_at     │       └───────┬────────┘
                         │ deleted_at     │               │
                         └───────┬────────┘               │
                                 │                        │
                    ┌────────────┼────────────┐          │
                    │            │            │          │
            ┌───────▼───────┐    │    ┌───────▼───────┐  │
            │   POI_Media   │    │    │   Tour_POI    │◄─┘
            ├───────────────┤    │    ├───────────────┤
            │ id (PK)       │    │    │ id (PK)       │
            │ poi_id (FK)   │    │    │ tour_id (FK)  │
            │ type          │    │    │ poi_id (FK)   │
            │ language      │    │    │ order_index   │
            │ url           │    │    │ created_at    │
            │ duration      │    │    └───────────────┘
            │ size_bytes    │    │
            │ created_at    │    │
            └───────────────┘    │
                                 │
┌────────────────────────────────┼────────────────────────────────┐
│            TOURIST USER DOMAIN (Optional Login)                 │
├─────────────────────────────────────────────────────────────────┤
│                                │                                │
│  ┌────────────────┐    ┌───────▼───────┐    ┌────────────────┐  │
│  │  Tourist_User  │    │ View_History  │    │ User_Favorite  │  │
│  ├────────────────┤    ├───────────────┤    ├────────────────┤  │
│  │ id (PK)        │◄───┤ user_id (FK)  │    │ id (PK)        │  │
│  │ device_id      │    │ poi_id (FK)   │    │ user_id (FK)   │  │
│  │ email          │    │ viewed_at     │    │ poi_id (FK)    │  │
│  │ display_name   │    │ duration_sec  │    │ created_at     │  │
│  │ auth_provider  │    │ audio_played  │    └────────────────┘  │
│  │ language_pref  │    └───────────────┘                        │
│  │ push_token     │                                             │
│  │ created_at     │                                             │
│  │ last_active_at │                                             │
│  └────────────────┘                                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity Definitions

### 2.1 Admin (User)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | Login username |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Email address |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Display name |
| `role` | ENUM | NOT NULL | Values: SUPER_ADMIN, ADMIN, VIEWER |
| `status` | ENUM | NOT NULL | Values: ACTIVE, INACTIVE, LOCKED |
| `last_login_at` | TIMESTAMP | NULL | Last successful login |
| `failed_login_count` | INTEGER | DEFAULT 0 | Failed login attempts |
| `locked_until` | TIMESTAMP | NULL | Account lock expiry |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |

**Indexes:**
- `idx_admin_username` on `username`
- `idx_admin_email` on `email`

---

### 2.2 Password_Reset_Token

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `admin_id` | UUID | FK → Admin.id, NOT NULL | Token owner |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Reset token (hashed) |
| `expires_at` | TIMESTAMP | NOT NULL | Expiry time (1 hour) |
| `used_at` | TIMESTAMP | NULL | When token was used |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |

**Indexes:**
- `idx_reset_token` on `token`
- `idx_reset_admin` on `admin_id`
- `idx_reset_expires` on `expires_at`

**Business Rules:**
- Token hết hạn sau 1 giờ (BR-108)
- Chỉ dùng được 1 lần - set `used_at` khi sử dụng (BR-107)
- Delete expired tokens bằng scheduled job

---

### 2.2b Shop_Owner

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | Login email |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hashed password |
| `full_name` | VARCHAR(100) | NOT NULL | Tên chủ quán |
| `phone` | VARCHAR(20) | NULL | Số điện thoại |
| `shop_name` | VARCHAR(200) | NOT NULL | Tên quán |
| `shop_address` | VARCHAR(500) | NULL | Địa chỉ quán |
| `avatar_url` | VARCHAR(500) | NULL | Ảnh đại diện |
| `status` | ENUM | NOT NULL | Values: ACTIVE, INACTIVE, PENDING |
| `email_verified` | BOOLEAN | DEFAULT false | Email đã xác minh |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update |

**Indexes:**
- `idx_shop_owner_email` on `email`
- `idx_shop_owner_status` on `status`

**Notes:**
- Shop Owner tự đăng ký qua registration form
- Status = PENDING cho đến khi email verified
- Mỗi Shop Owner có thể sở hữu nhiều POIs

---

### 2.3 POI (Point of Interest)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `name_vi` | VARCHAR(200) | NOT NULL | Vietnamese name |
| `name_en` | VARCHAR(200) | NULL | English name |
| `description_vi` | TEXT | NOT NULL | Vietnamese description |
| `description_en` | TEXT | NULL | English description |
| `latitude` | DECIMAL(10,8) | NOT NULL | GPS latitude |
| `longitude` | DECIMAL(11,8) | NOT NULL | GPS longitude |
| `location` | GEOMETRY(POINT) | NOT NULL | PostGIS point (for spatial queries) |
| `trigger_radius` | INTEGER | DEFAULT 15 | Radius in meters (5-100) |
| `category` | ENUM | NOT NULL | Values: MAIN, SUB |
| `status` | ENUM | NOT NULL | Values: DRAFT, ACTIVE, INACTIVE |
| `created_by` | UUID | FK → Admin.id, NULL | Creator (Admin) |
| `owner_id` | UUID | FK → Shop_Owner.id, NULL | POI owner (Shop Owner) |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_poi_location` GIST index on `location`
- `idx_poi_status` on `status`
- `idx_poi_category` on `category`
- `idx_poi_deleted_at` on `deleted_at`
- `idx_poi_owner` on `owner_id`

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
| `description_vi` | TEXT | NOT NULL | Vietnamese description |
| `description_en` | TEXT | NULL | English description |
| `thumbnail_url` | VARCHAR(500) | NULL | Cover image URL |
| `estimated_duration` | INTEGER | NULL | Duration in minutes |
| `status` | ENUM | NOT NULL | Values: DRAFT, ACTIVE, INACTIVE |
| `created_by` | UUID | FK → Admin.id | Creator |
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
| `device_id` | VARCHAR(255) | NOT NULL | Device identifier (anonymous mode) |
| `email` | VARCHAR(100) | UNIQUE, NULL | Email (if logged in) |
| `display_name` | VARCHAR(100) | NULL | Display name |
| `auth_provider` | ENUM | NULL | Values: EMAIL, GOOGLE, FACEBOOK, APPLE |
| `password_hash` | VARCHAR(255) | NULL | For email login |
| `language_pref` | ENUM | DEFAULT 'VI' | Values: VI, EN |
| `auto_play_audio` | BOOLEAN | DEFAULT true | Auto-play audio on trigger |
| `push_token` | VARCHAR(255) | NULL | FCM/APNs token |
| `push_enabled` | BOOLEAN | DEFAULT false | Push notification enabled |
| `created_at` | TIMESTAMP | NOT NULL | First app open |
| `last_active_at` | TIMESTAMP | NOT NULL | Last activity |

**Indexes:**
- `idx_tourist_device` on `device_id`
- `idx_tourist_email` on `email`

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
| `audio_completed` | BOOLEAN | DEFAULT false | Did user complete audio? |
| `trigger_type` | ENUM | NOT NULL | Values: GPS, QR, MANUAL |

**Indexes:**
- `idx_history_user` on `user_id`
- `idx_history_poi` on `poi_id`
- `idx_history_date` on `viewed_at`

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

## 4. System Support Entities

### 4.1 QR_Code

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Linked POI |
| `code_data` | VARCHAR(500) | UNIQUE, NOT NULL | QR encoded data (deep link) |
| `format` | ENUM | DEFAULT 'URL' | Values: URL, POI_ID |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `scan_count` | INTEGER | DEFAULT 0 | Total scans |
| `generated_at` | TIMESTAMP | NOT NULL | Generation time |
| `last_scanned_at` | TIMESTAMP | NULL | Last scan time |

**Indexes:**
- `idx_qr_poi` on `poi_id`
- `idx_qr_code` on `code_data`

**Notes:**
- Mỗi POI có thể có nhiều QR codes (ví dụ: in ở nhiều vị trí)
- QR code bị inactive khi POI bị xóa hoặc unpublish
- `code_data` format: `https://gpstours.app/poi/{poi_id}`

---

### 4.2 Trigger_Log

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PK | Primary key |
| `user_id` | UUID | FK → Tourist_User.id, NULL | User (NULL if anonymous) |
| `poi_id` | UUID | FK → POI.id, NOT NULL | Triggered POI |
| `trigger_type` | ENUM | NOT NULL | Values: GPS, QR, MANUAL |
| `user_action` | ENUM | NOT NULL | Values: ACCEPTED, SKIPPED, IGNORED, AUTO_DISMISSED |
| `user_lat` | DECIMAL(10,8) | NULL | User latitude at trigger |
| `user_lng` | DECIMAL(11,8) | NULL | User longitude at trigger |
| `distance_meters` | DECIMAL(6,2) | NULL | Distance to POI at trigger |
| `triggered_at` | TIMESTAMP | NOT NULL | Event timestamp |

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
  role: 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';
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
  category: 'MAIN' | 'SUB';
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
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
  language: 'VI' | 'EN' | 'ALL';
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
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE';
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
  adminId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
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
  userAction: 'ACCEPTED' | 'SKIPPED' | 'IGNORED' | 'AUTO_DISMISSED';
  userLat?: number;
  userLng?: number;
  distanceMeters?: number;
  triggeredAt: Date;
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
| Password_Reset_Tokens | 0 | 20 | 50 |
| POIs | 20 | 100 | 300 |
| Media files | 100 | 500 | 1500 |
| Tours | 3 | 15 | 50 |
| Tour_POIs | 30 | 150 | 500 |
| QR_Codes | 20 | 100 | 300 |
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
