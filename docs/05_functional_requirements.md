# 📋 Functional Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

---

## 1. Admin Dashboard - Authentication

### FR-101: User Login

| Field | Description |
|-------|-------------|
| **ID** | FR-101 |
| **Title** | Admin Login |
| **Priority** | P0 |
| **User Story** | US-101 |

**Description:**  
Hệ thống phải cho phép Admin đăng nhập bằng username và password.

**Business Rules:**
- BR-101: Username không phân biệt hoa thường
- BR-102: Password phải hash (bcrypt)
- BR-103: Lock account sau 5 lần đăng nhập sai trong 15 phút

**Pre-conditions:**
- Admin đã có tài khoản trong hệ thống

**Post-conditions:**
- JWT token được tạo và lưu vào localStorage/cookie
- User được redirect đến Dashboard

**Input:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| username | string | Yes | 3-50 chars |
| password | string | Yes | 8-100 chars |

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| accessToken | string | JWT token (15min expiry) |
| refreshToken | string | Refresh token (7 days) |
| user | object | User info (id, name, role) |

---

### FR-102: Session Management

| Field | Description |
|-------|-------------|
| **ID** | FR-102 |
| **Title** | Session & Token Refresh |
| **Priority** | P0 |

**Description:**  
Hệ thống tự động refresh token khi gần hết hạn và logout khi session hết hạn.

**Business Rules:**
- BR-104: Access token hết hạn sau 15 phút
- BR-105: Refresh token hết hạn sau 7 ngày
- BR-106: Auto-refresh khi access token còn < 5 phút

---

## 2. Admin Dashboard - POI Management

### FR-201: Create POI

| Field | Description |
|-------|-------------|
| **ID** | FR-201 |
| **Title** | Create New POI |
| **Priority** | P0 |
| **User Story** | US-201 |

**Description:**  
Admin có thể tạo POI mới với đầy đủ thông tin cơ bản.

**Input:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name_vi | string | Yes | 1-200 chars |
| name_en | string | No | 1-200 chars |
| description_vi | text | Yes | 1-5000 chars |
| description_en | text | No | 1-5000 chars |
| latitude | decimal | Yes | -90 to 90 |
| longitude | decimal | Yes | -180 to 180 |
| trigger_radius | integer | No | 5-100m, default 15m |
| category | enum | Yes | MAIN, SUB |
| images | file[] | No | Max 10, each ≤5MB |
| audio_vi | file | No | ≤50MB, mp3/wav |
| audio_en | file | No | ≤50MB, mp3/wav |

**Business Rules:**
- BR-201: POI name phải unique trong hệ thống
- BR-202: Ít nhất phải có name_vi và description_vi
- BR-203: Coordinates phải trong phạm vi địa điểm

---

### FR-202: Update POI

| Field | Description |
|-------|-------------|
| **ID** | FR-202 |
| **Title** | Edit Existing POI |
| **Priority** | P0 |
| **User Story** | US-202 |

**Description:**  
Admin có thể chỉnh sửa tất cả thông tin của POI đã tồn tại.

**Business Rules:**
- BR-204: Chỉ có thể edit POI đang active
- BR-205: Thay đổi coordinates cần confirm nếu POI đang trong Tour

---

### FR-203: Delete POI

| Field | Description |
|-------|-------------|
| **ID** | FR-203 |
| **Title** | Soft Delete POI |
| **Priority** | P0 |
| **User Story** | US-203 |

**Description:**  
Admin có thể xóa POI. POI sẽ được đánh dấu là deleted (soft delete).

**Business Rules:**
- BR-206: Cần confirmation dialog trước khi xóa
- BR-207: Nếu POI đang trong Tour, hiển thị warning
- BR-208: Soft delete - set `deleted_at` timestamp
- BR-209: POI đã xóa không hiển thị trên Tourist App

---

### FR-204: Map POI Picker

| Field | Description |
|-------|-------------|
| **ID** | FR-204 |
| **Title** | Select POI Location on Map |
| **Priority** | P0 |
| **User Story** | US-204 |

**Description:**  
Admin có thể chọn vị trí POI bằng cách click trên bản đồ hoặc nhập tọa độ thủ công.

**Features:**
- Interactive map with click to place marker
- Manual coordinate input fields
- Address search (geocoding)
- Show trigger radius preview

---

### FR-205: Upload Media

| Field | Description |
|-------|-------------|
| **ID** | FR-205 |
| **Title** | Upload Images and Audio |
| **Priority** | P0 |
| **User Story** | US-205, US-206 |

**Description:**  
Admin có thể upload media files cho POI.

**Business Rules:**
- BR-210: Images: jpg, png, webp, ≤5MB each, max 10 files
- BR-211: Audio: mp3, wav, ≤50MB each
- BR-212: Auto-compress images nếu >2MB
- BR-213: Generate thumbnails cho images
- BR-214: Lưu metadata (size, duration, format)

---

## 3. Admin Dashboard - Tour Management

### FR-301: Create Tour

| Field | Description |
|-------|-------------|
| **ID** | FR-301 |
| **Title** | Create New Tour |
| **Priority** | P0 |
| **User Story** | US-301 |

**Input:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name_vi | string | Yes | 1-200 chars |
| name_en | string | No | 1-200 chars |
| description_vi | text | Yes | 1-2000 chars |
| description_en | text | No | 1-2000 chars |
| thumbnail | file | No | ≤5MB |
| estimated_duration | integer | No | minutes |

---

### FR-302: Manage Tour POIs

| Field | Description |
|-------|-------------|
| **ID** | FR-302 |
| **Title** | Add/Remove/Reorder POIs in Tour |
| **Priority** | P0 |
| **User Story** | US-302, US-303 |

**Features:**
- Add multiple POIs to Tour
- Remove POI from Tour
- Drag & drop to reorder
- Show POI preview with thumbnail

**Business Rules:**
- BR-301: Một POI có thể thuộc nhiều Tours
- BR-302: Tour phải có ít nhất 2 POIs để publish
- BR-303: Thứ tự POIs quyết định lộ trình gợi ý

---

## 4. Tourist App - Map & POI

### FR-401: Display POIs on Map

| Field | Description |
|-------|-------------|
| **ID** | FR-401 |
| **Title** | Show POI Markers on Map |
| **Priority** | P0 |
| **User Story** | US-401 |

**Description:**  
App hiển thị tất cả POIs có status=active trên bản đồ với markers.

**Features:**
- Cluster markers when zoomed out
- Different marker icons for MAIN vs SUB POIs
- Current location indicator
- Compass orientation

**Business Rules:**
- BR-401: Chỉ hiển thị POIs có status=active
- BR-402: Center map on user location by default
- BR-403: Offline: hiển thị cached POIs

---

### FR-402: POI Detail View

| Field | Description |
|-------|-------------|
| **ID** | FR-402 |
| **Title** | POI Detail Modal/Page |
| **Priority** | P0 |
| **User Story** | US-402 |

**Display:**
- POI name (theo language selected)
- Description text
- Image gallery (swipeable)
- Audio player
- Distance from current location
- Part of which Tours

---

### FR-403: Audio Playback

| Field | Description |
|-------|-------------|
| **ID** | FR-403 |
| **Title** | Audio Player Controls |
| **Priority** | P0 |
| **User Story** | US-403, US-406 |

**Controls:**
- Play / Pause button
- Progress bar with seek
- Current time / Total duration
- Background playback support

**Business Rules:**
- BR-404: Audio tiếp tục phát khi lock screen
- BR-405: Pause audio khi incoming call
- BR-406: Resume audio sau call kết thúc

---

## 5. Tourist App - Location Service

### FR-501: GPS Location Tracking

| Field | Description |
|-------|-------------|
| **ID** | FR-501 |
| **Title** | Track User Location |
| **Priority** | P0 |

**Description:**  
App theo dõi vị trí người dùng để trigger nội dung tự động.

**Business Rules:**
- BR-501: Request location permission khi cần
- BR-502: Update frequency: 5-10 seconds
- BR-503: Accuracy: HIGH_ACCURACY mode
- BR-504: Continue tracking in background

---

### FR-502: Auto-trigger POI Content

| Field | Description |
|-------|-------------|
| **ID** | FR-502 |
| **Title** | Geofence Enter Trigger |
| **Priority** | P0 |
| **User Story** | US-404 |

**Description:**  
Khi user đi vào vùng trigger của POI, app tự động thông báo và hỏi có muốn nghe audio không.

**Business Rules:**
- BR-505: Trigger radius mặc định 15m (configurable per POI)
- BR-506: Hysteresis: không trigger lại trong 5 phút
- BR-507: Conflict resolution: trigger POI gần nhất nếu overlap
- BR-508: User có thể tắt auto-play trong settings

**State Machine:**
```
IDLE → (enter zone) → TRIGGERED → (user accepts) → PLAYING
                   ↘ (user skips) → COOLDOWN → (5min) → IDLE
```

---

### FR-503: QR Code Fallback

| Field | Description |
|-------|-------------|
| **ID** | FR-503 |
| **Title** | Manual POI Trigger via QR |
| **Priority** | P1 |
| **User Story** | US-407 |

**Description:**  
User có thể quét mã QR tại POI để mở nội dung trực tiếp.

**Business Rules:**
- BR-509: QR code chứa POI ID hoặc deep link
- BR-510: Validate QR format trước khi process
- BR-511: Hiển thị error nếu POI không tồn tại

---

## 6. Tourist App - Language & Settings

### FR-601: Language Selection

| Field | Description |
|-------|-------------|
| **ID** | FR-601 |
| **Title** | Change Display Language |
| **Priority** | P0 |
| **User Story** | US-405 |

**Business Rules:**
- BR-601: Auto-detect device language ở lần đầu
- BR-602: Fallback to Vietnamese nếu không có translation
- BR-603: Lưu preference vào local storage
- BR-604: Reload content khi đổi language

---

### FR-602: Offline Mode

| Field | Description |
|-------|-------------|
| **ID** | FR-602 |
| **Title** | Offline Data Access |
| **Priority** | P1 |
| **User Story** | US-409 |

**Description:**  
App cache dữ liệu để sử dụng khi offline.

**Cached Data:**
- POI list with basic info
- Images (downloaded on view)
- Audio files (downloaded on view)
- Map tiles for viewed area

**Business Rules:**
- BR-605: Sync khi có internet
- BR-606: Show "offline" indicator
- BR-607: Cache expiry: 7 ngày

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 6, 7
