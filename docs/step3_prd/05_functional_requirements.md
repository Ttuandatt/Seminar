# 📋 Functional Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 2.0  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-02-09

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

### FR-103: Password Reset

| Field | Description |
|-------|-------------|
| **ID** | FR-103 |
| **Title** | Forgot Password Flow |
| **Priority** | P1 |
| **User Story** | US-104 |

**Description:**  
Admin có thể reset mật khẩu qua email khi quên.

**Flow:**
1. Admin nhập email
2. Hệ thống gửi link reset (expiry 1h)
3. Admin click link, nhập password mới
4. Hệ thống cập nhật password

**Business Rules:**
- BR-107: Reset link chỉ dùng được 1 lần
- BR-108: Link hết hạn sau 1 giờ
- BR-109: Password mới phải khác 3 password gần nhất

**Input (Request):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | Yes | Valid email format |

**Input (Reset):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| token | string | Yes | UUID format |
| new_password | string | Yes | 8-100 chars, complexity rules |

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

### FR-206: Preview POI

| Field | Description |
|-------|-------------|
| **ID** | FR-206 |
| **Title** | Preview POI as Tourist |
| **Priority** | P1 |
| **User Story** | US-212 |

**Description:**  
Admin có thể xem trước POI trên giao diện giống Tourist App trước khi publish.

**Features:**
- Mobile-responsive preview panel
- Toggle between VN/EN languages
- Preview audio player
- Preview image gallery

**Business Rules:**
- BR-215: Preview không lưu vào analytics
- BR-216: Preview available cho cả Draft và Published POIs

---

### FR-207: Draft/Publish Status

| Field | Description |
|-------|-------------|
| **ID** | FR-207 |
| **Title** | POI Status Workflow |
| **Priority** | P1 |
| **User Story** | US-213 |

**Description:**  
POI có trạng thái Draft hoặc Published. Chỉ Published POIs hiển thị trên Tourist App.

**Status Flow:**
```
DRAFT → (publish) → PUBLISHED
      ↖ (unpublish) ↙
```

**Business Rules:**
- BR-217: POI mới tạo mặc định ở trạng thái Draft
- BR-218: Cần có đủ name + description + location để Publish
- BR-219: Unpublish POI đang trong Tour = warning
- BR-220: Draft POIs không hiển thị trên Tourist App

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

### FR-504: Onboarding Flow

| Field | Description |
|-------|-------------|
| **ID** | FR-504 |
| **Title** | First-time User Onboarding |
| **Priority** | P1 |
| **User Story** | US-506 |

**Description:**  
User lần đầu mở app sẽ thấy các màn hình hướng dẫn cách sử dụng.

**Screens:**
1. Welcome screen với app intro
2. Giải thích tính năng auto-trigger
3. Request GPS permission với lý do
4. Let's start → vào Map

**Business Rules:**
- BR-512: Chỉ hiển thị 1 lần (lưu flag vào storage)
- BR-513: User có thể skip bất cứ lúc nào
- BR-514: Có thể xem lại trong Settings

---

### FR-505: Permission Handling

| Field | Description |
|-------|-------------|
| **ID** | FR-505 |
| **Title** | GPS Permission Management |
| **Priority** | P0 |
| **User Story** | US-507, US-508 |

**Description:**  
App xử lý gracefully khi user từ chối hoặc thu hồi quyền GPS.

**Scenarios:**
| Permission State | App Behavior |
|------------------|--------------|
| Not requested | Show onboarding explanation → request |
| Denied | Show QR-only mode, prompt to enable in Settings |
| Denied permanently | Deep link to Settings |
| Granted | Normal GPS tracking mode |
| Revoked later | Detect & show re-request dialog |

**Business Rules:**
- BR-515: Giải thích lý do cần GPS trước khi request
- BR-516: QR fallback luôn available
- BR-517: Không spam permission request

---

### FR-506: Error Handling & Retry

| Field | Description |
|-------|-------------|
| **ID** | FR-506 |
| **Title** | User-friendly Error Messages |
| **Priority** | P1 |
| **User Story** | US-510 |

**Description:**  
App hiển thị thông báo lỗi rõ ràng với option retry khi có vấn đề.

**Error Types:**
| Error | Message | Actions |
|-------|---------|---------|
| Network error | "Không có kết nối internet" | [Retry] [Offline Mode] |
| POI not found | "Không tìm thấy điểm tham quan" | [Back] |
| Audio load failed | "Không thể tải audio" | [Retry] [Skip] |
| GPS error | "Không thể xác định vị trí" | [Retry] [Use QR] |

**Business Rules:**
- BR-518: Tất cả error phải có button action
- BR-519: Log errors để debug (không gửi PII)
- BR-520: Auto-retry 3 lần trước khi hiện error

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

## 7. Shop Owner Dashboard

### FR-701: Shop Owner Registration

| Field | Description |
|-------|-------------|
| **ID** | FR-701 |
| **Title** | Shop Owner Registration |
| **Priority** | P1 |
| **User Story** | US-801 |

**Description:**  
Hệ thống cho phép người dùng đăng ký tài khoản Shop Owner với thông tin quán.

**Registration Flow:**
1. User chọn "Đăng ký" trên app
2. Chọn role: Tourist hoặc Shop Owner
3. Nếu Shop Owner → form yêu cầu: email, password, tên quán, địa chỉ, số điện thoại
4. Email verification
5. Sau khi verify → truy cập Shop Owner Dashboard

**Business Rules:**
- BR-1001: Shop Owner tự đăng ký, không cần Admin tạo
- BR-1002: Email phải unique trong hệ thống

---

### FR-702: Shop Owner POI Management

| Field | Description |
|-------|-------------|
| **ID** | FR-702 |
| **Title** | Shop Owner Manage Own POI(s) |
| **Priority** | P1 |
| **User Story** | US-803 |

**Description:**  
Shop Owner có thể tạo và chỉnh sửa POI(s) thuộc quyền sở hữu của mình.

**Capabilities:**
- Tạo POI mới (tên, mô tả, vị trí, hình ảnh, audio)
- Chỉnh sửa tất cả fields của POI thuộc mình
- Xem danh sách POI(s) của mình

**Restrictions:**
- Chỉ thấy POI(s) mà mình sở hữu (owner_id = current_user)
- Không được xóa POI (chỉ Admin có quyền)
- Không được tạo/chỉnh sửa Tour

**Business Rules:**
- BR-1003: Shop Owner chỉ CRUD POI có owner_id = mình
- BR-1004: Shop Owner không xóa POI

---

### FR-703: Shop Owner Media Upload

| Field | Description |
|-------|-------------|
| **ID** | FR-703 |
| **Title** | Shop Owner Upload Media |
| **Priority** | P1 |
| **User Story** | US-804 |

**Description:**  
Shop Owner upload hình ảnh và audio giới thiệu cho POI(s) của mình.

**Same constraints as FR-301/FR-302** (Admin media upload) nhưng chỉ cho POI mà Shop Owner sở hữu.

---

### FR-704: Shop Owner Analytics

| Field | Description |
|-------|-------------|
| **ID** | FR-704 |
| **Title** | Shop Owner View Own Analytics |
| **Priority** | P1 |
| **User Story** | US-805 |

**Description:**  
Shop Owner xem thống kê lượt xem và lượt nghe audio của POI(s) mình.

**Metrics shown:**
- Tổng lượt xem POI
- Tổng lượt nghe audio
- Trend theo ngày/tuần/tháng
- Top POI (nếu nhiều POI)

**Business Rules:**
- BR-1005: Shop Owner chỉ xem analytics của POI(s) mình

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 6, 7
