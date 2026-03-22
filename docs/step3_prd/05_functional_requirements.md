# 📋 Functional Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.0
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-03-22

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

### FR-104: Personal Profile Management

| Field | Description |
|-------|-------------|
| **ID** | FR-104 |
| **Title** | View & Update Personal Profile |
| **Priority** | P1 |
| **User Story** | US-106 |

**Description:**  
Mọi người dùng đã xác thực (Admin, Shop Owner, Tourist đã đăng nhập) có một trang hồ sơ hợp nhất để xem/cập nhật thông tin cá nhân (họ tên, avatar, số điện thoại, ngày sinh, địa chỉ, thông tin cửa hàng nếu có) mà không cần liên hệ IT.

**Business Rules:**
- BR-110: Trường `role`, `email`, `status`, `created_at` chỉ hiển thị read-only.
- BR-111: Shop Owner thấy thêm section "Shop Details" (shop_name, shop_address, opening_hours); Admin chỉ thấy phần này khi có dữ liệu liên kết với một shop.
- BR-112: `birth_date` không được lớn hơn ngày hiện tại và user phải ≥ 18 tuổi.
- BR-113: Avatar tối đa 2MB, định dạng jpg/png/webp; hệ thống tự sinh thumbnail 128x128.
- BR-114: Mọi thay đổi phải ghi nhận vào audit log (`profile_audit`): user_id, fields_changed, updated_by, updated_at, ip.

**Pre-conditions:**
- Người dùng đã đăng nhập và có access token hợp lệ.

**Post-conditions:**
- Bản ghi `User_Profile` (hoặc bản ghi Shop Owner tương ứng) được cập nhật và đồng bộ cache.
- Event `profile.updated` được phát để FE đồng bộ header name/avatar.

**Input (Update):**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| full_name | string | Yes | 3-100 chars |
| birth_date | date | No | ISO-8601, >= 1900-01-01, age ≥18 |
| phone | string | No | E.164, max 20 chars |
| gender | enum | No | MALE, FEMALE, OTHER, PREFER_NOT_SAY |
| address_line1 | string | No | ≤200 chars |
| address_line2 | string | No | ≤200 chars |
| city | string | No | ≤100 chars |
| country | string | No | ISO 3166-1 alpha-2 |
| shop_name | string | Conditional | Required for Shop Owner, ≤200 chars |
| shop_address | string | Conditional | Required for Shop Owner |
| opening_hours | json | No | Must follow `{ day, open, close }[]` schema |
| avatar | file | No | jpg/png/webp ≤2MB |

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | User identifier |
| role | enum | ADMIN, SHOP_OWNER, TOURIST |
| email | string | Login email/username |
| full_name | string | Latest full name |
| avatar_url | string | CDN URL of current avatar |
| phone | string | Normalized phone number |
| birth_date | date | Stored date of birth |
| address | object | `{ addressLine1, addressLine2, city, country }` |
| shop | object | `{ name, address, openingHours }` if applicable |
| last_updated_at | timestamp | ISO timestamp |

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
| name_zh | string | No | 1-200 chars |
| description_vi | text | Yes | 1-5000 chars |
| description_en | text | No | 1-5000 chars |
| description_zh | text | No | 1-5000 chars |
| latitude | decimal | Yes | -90 to 90 |
| longitude | decimal | Yes | -180 to 180 |
| trigger_radius | integer | No | 5-100m, default 50m |
| category | enum | Yes | DINING, STREET_FOOD, CAFES_DESSERTS, BARS_NIGHTLIFE, MARKETS_SPECIALTY, CULTURAL_LANDMARKS, EXPERIENCES_WORKSHOPS, OUTDOOR_SCENIC |
| images | file[] | No | Max 10, each ≤5MB |
| audio_vi | file | No | ≤50MB, mp3/wav |
| audio_en | file | No | ≤50MB, mp3/wav |
| audio_zh | file | No | ≤50MB, mp3/wav |

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
- Address search (geocoding) with live suggestions (>=3 characters) and auto-fill of lat/lng/address when a suggestion is selected
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
DRAFT → (Admin set ACTIVE) → ACTIVE
ACTIVE → (Admin set ARCHIVED) → ARCHIVED
ARCHIVED → (Admin set ACTIVE) → ACTIVE
```

**Business Rules:**
- BR-217: POI mới tạo mặc định ở trạng thái DRAFT
- BR-218: Cần có đủ name + description + location để chuyển ACTIVE
- BR-219: Unpublish (ARCHIVED) POI đang trong Tour = warning
- BR-220: Chỉ ACTIVE POIs hiển thị trên Tourist App

---

### FR-208: POI Status Change

| Field | Description |
|-------|-------------|
| **ID** | FR-208 |
| **Title** | Thay đổi trạng thái POI |
| **Priority** | P0 |

**Description:**
Admin thay đổi trạng thái POI giữa DRAFT / ACTIVE / ARCHIVED. Chỉ ACTIVE POIs xuất hiện trên Tourist App và được phép thêm vào Tour.

**Input:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| status | enum | Yes | DRAFT, ACTIVE, ARCHIVED |

**Business Rules:**
- BR-304: Chỉ ACTIVE POIs được thêm vào Tour
- BR-305: Khi POI bị ARCHIVED, tự động remove khỏi tất cả Tours liên quan

---

### FR-209: Generate TTS Audio

| Field | Description |
|-------|-------------|
| **ID** | FR-209 |
| **Title** | Tạo audio TTS tự động cho POI |
| **Priority** | P1 |
| **Actor** | Admin, Shop Owner |

**Description:**
Admin hoặc Shop Owner nhấn nút "Tạo audio TTS" để hệ thống tự động chuyển đổi nội dung mô tả văn bản của POI thành file audio MP3 sử dụng Microsoft Edge TTS (msedge-tts). Nếu đã có audio cho ngôn ngữ đó, file cũ bị thay thế.

**Input:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| poiId | UUID | Yes | ID POI hợp lệ |
| language | enum | Yes | VI, EN, ZH |

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | PoiMedia record ID |
| url | string | URL file audio MP3 |
| sizeBytes | integer | Kích thước file (bytes) |
| language | enum | VI / EN / ZH |

**TTS Voice Mapping:**
| Language | Voice |
|----------|-------|
| VI | vi-VN-HoaiMyNeural |
| EN | en-US-AriaNeural |
| ZH | zh-CN-XiaoxiaoNeural |

**Business Rules:**
- BR-TTS01: Nếu đã có PoiMedia (type=AUDIO, language=X) thì xóa record cũ trước khi tạo mới
- BR-TTS02: POI phải có nội dung mô tả cho ngôn ngữ được chọn (descriptionVi / descriptionEn / descriptionZh)
- BR-TTS03: Shop Owner chỉ tạo TTS cho POI do mình sở hữu (ownerId = userId)

---

### FR-210: Admin Map View

| Field | Description |
|-------|-------------|
| **ID** | FR-210 |
| **Title** | Visualize POIs & Tours on Admin Map |
| **Priority** | P1 |
| **Actor** | Admin, Shop Owner |

**Description:**
Admin có trang bản đồ tổng quan (`/admin/map`) hiển thị tất cả POIs trên Leaflet map, hỗ trợ filter theo status, xem route Tour, và điều hướng nhanh đến trang chi tiết/chỉnh sửa POI. Ngoài ra, cả Admin và Shop Owner đều có thể toggle giữa chế độ **List** và **Map** ngay trong trang POI List:
- **Admin POI List** (`/admin/pois`): Toggle List/Map hiển thị tất cả POIs (tối đa 500) lên bản đồ Leaflet với markers, radius circles, popups (View/Edit).
- **Admin Map View** (`/admin/map`): Dedicated map page — fetch `GET /pois?limit=200` + `GET /tours`.
- **Shop Owner Dashboard** (`/owner/dashboard`): Toggle List/Map hiển thị POIs do mình sở hữu lên bản đồ Leaflet.
- **Shop Owner Map View** (`/owner/map`): Dedicated map page — fetch `GET /shop-owner/pois` (role-aware, không gọi endpoint admin).

**Role-aware MapViewPage:**
Component `MapViewPage` được chia sẻ giữa Admin và Shop Owner. Component detect role qua `useAuth()`:
- **Admin** (`user.role === 'ADMIN'`): Gọi `GET /pois?limit=200` + `GET /tours`, hiển thị Tour dropdown, popup links → `/admin/pois/:id`
- **Shop Owner** (`user.role === 'SHOP_OWNER'`): Gọi `GET /shop-owner/pois`, ẩn Tour dropdown, popup links → `/owner/pois/:id`

**Features:**
- Hiển thị POI markers theo category color (8 categories, 8 màu riêng biệt)
- Hiển thị trigger radius circles (stroke color theo status: Active=xanh lá, Draft=vàng, Archived=xám)
- Filter theo status: All / Active / Draft / Archived
- Filter theo category
- Chọn Tour từ dropdown → vẽ Polyline route nối các POIs theo thứ tự (chỉ Admin)
- Toggle bật/tắt hiển thị trigger radius
- Click marker → Popup (tên, category, status, audio badge, nút View/Edit)
- Legend hiển thị 8 category colors
- **List/Map toggle** trên POI List page và Shop Owner Dashboard

**Business Rules:**
- BR-MAP01: Load tối đa 500 POIs (kèm media) trong 1 request cho Map view
- BR-MAP02: Default center: Quận 4, TP.HCM [10.7615, 106.7059], zoom 15
- BR-MAP03: Map tiles sử dụng OpenStreetMap (Leaflet)
- BR-MAP04: Map query chỉ fetch khi viewMode = 'map' (lazy loading)
- BR-MAP05: Shop Owner Map view chỉ hiển thị POIs có `ownerId = userId` — gọi `GET /shop-owner/pois` thay vì `GET /pois`
- BR-MAP06: Popup navigation links phân biệt theo role: Admin → `/admin/pois/:id`, Shop Owner → `/owner/pois/:id`
- BR-MAP07: Tour dropdown chỉ hiển thị cho Admin (Shop Owner không quản lý Tours)

---

### FR-211: Auto-Generate QR Code for POI

| Field | Description |
|-------|-------------|
| **ID** | FR-211 |
| **Title** | Tự động tạo mã QR khi tạo POI |
| **Priority** | P1 |
| **Actor** | System (triggered by Admin, Shop Owner) |

**Description:**
Khi Admin hoặc Shop Owner tạo một POI mới, hệ thống tự động sinh mã QR code dưới dạng file PNG (512x512px, error correction level H) chứa nội dung `gpstours:poi:<poiId>`. File QR được lưu tại `/uploads/qr/poi_<uuid>.png` và URL lưu trong trường `qr_code_url` của POI. Tourist quét mã QR này bằng camera để mở POI và nghe audio guide.

**Features:**
- Auto-generate QR code (fire-and-forget) khi tạo POI mới
- Hiển thị QR code trong sidebar POI Edit/View page (Admin Dashboard)
- Download QR code dưới dạng PNG
- Regenerate QR code (Admin only)
- QR format: `gpstours:poi:<uuid>` — tương thích với endpoint `POST /public/qr/validate`

**Input:**
| Field | Type | Required | Values |
|-------|------|----------|--------|
| poiId | UUID | Yes | ID POI vừa tạo |

**Output:**
| Field | Type | Description |
|-------|------|-------------|
| qrCodeUrl | string | URL file QR PNG (e.g., `/uploads/qr/poi_<uuid>.png`) |
| qrDataUrl | string | Base64 data URL cho inline display |
| qrContent | string | Nội dung mã QR: `gpstours:poi:<uuid>` |

**API Endpoints:**
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/pois/:id/qr` | JWT (Admin, Shop Owner) | Lấy QR code info (auto-generate nếu chưa có) |
| POST | `/pois/:id/qr/regenerate` | JWT (Admin) | Tạo lại QR code |
| GET | `/pois/:id/qr/download` | JWT (Admin, Shop Owner) | Download QR code PNG |

**Business Rules:**
- BR-QR01: QR code tự động tạo khi `POST /pois` hoặc `POST /shop-owner/pois` thành công
- BR-QR02: QR code sử dụng format `gpstours:poi:<uuid>` — cùng format với mobile QR scanner
- BR-QR03: QR PNG kích thước 512x512, margin 2, error correction level H (chống hỏng ~30%)
- BR-QR04: Nếu POI chưa có QR code, endpoint `GET /pois/:id/qr` tự động tạo mới
- BR-QR05: Chỉ Admin mới có quyền regenerate QR code

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
- Marker legend uses distinct colors/icons for each POI category (8 total)
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
| **Title** | Global Audio Player Controls |
| **Priority** | P0 |
| **User Story** | US-403, US-406 |

**Controls:**
- Play / Pause button
- Progress bar with seek
- Current time / Total duration
- Background playback support via expo-audio

**Business Rules:**
- BR-404: Audio tiếp tục phát khi lock screen.
- BR-405: **Singleton Player Rule** - Ứng dụng chỉ duy trì 1 phiên Audio. Khi kích hoạt POI B, Audio của POI A sẽ lập tức bị ngắt.
- BR-406: Hỗ trợ auto-play nếu user bật cấu hình tự động phát trong Settings.

---

### FR-404: Tourist Authentication

| Field | Description |
|-------|-------------|
| **ID** | FR-404 |
| **Title** | Tourist Login & Registration |
| **Priority** | P1 |
| **User Story** | US-409 |

**Description:**
Người dùng app Tourist có thể đăng ký tài khoản và đăng nhập để lưu trữ lịch sử và địa điểm yêu thích.

**Business Rules:**
- BR-407: Password phải có ít nhất 8 ký tự, 1 hoa, 1 thường, 1 số.
- BR-408: Sau khi đăng nhập thành công, token được lưu vào máy. Cập nhật thẻ Profile trên ứng dụng với tên thật và email.

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
- BR-505: Trigger radius mặc định **50m** (configurable per POI, range 5-100m)
- BR-506: Hysteresis: khi user **rời khỏi vùng trigger**, POI được reset và có thể trigger lại khi quay lại (exit-based, không dùng timer)
- BR-507: **Criteria Engine** — khi nhiều POI cùng trong vùng trigger, chọn POI có điểm cao nhất theo công thức: `score = priority×0.30 + distanceScore×0.30 + notPlayedBonus×0.25 + autoPlayScore×0.15`
- BR-508: User có thể tắt auto-play trong settings
- BR-508b: Khi trigger, hệ thống **tự động phát audio** mà không hỏi. Bottom sheet hiển thị thông tin + audio player (autoPlay=true)

**State Machine:**
```
IDLE → (enter zone) → TRIGGERED → auto-play audio → PLAYING
     ↗ (exit zone) ← PLAYING
```

> **Note:** Không có bước hỏi user. Audio tự động phát khi vào vùng trigger.

---

### FR-503: QR Code Offline Fallback

| Field | Description |
|-------|-------------|
| **ID** | FR-503 |
| **Title** | Manual POI Trigger via QR with Offline Support |
| **Priority** | P1 |
| **User Story** | US-407 |

**Description:**  
User có thể quét mã QR tại vị trí thực tế của POI để xem thông tin trực tiếp. Cung cấp cơ chế Offline Fallback dựa trên SQLite.

**Business Rules:**
- BR-509: Dữ liệu văn bản POIs phải được đồng bộ hóa (sync) về máy điện thoại (SQLite).
- BR-510: **TH1 (Data Thuyết Minh Nhỏ)**: Nếu mã QR quét được khớp với dữ liệu POI nội bộ và POI đó KHÔNG chứa Audio/Video dung lượng lớn -> Bỏ qua network, hiển thị dữ liệu văn bản từ SQLite ngay lập tức.
- BR-511: **TH2 (Data Thuyết Minh Lớn)**: Nếu POI chứa Audio/Video (dung lượng lớn), hệ thống phải cảnh báo người dùng chuẩn bị kết nối mạng (Network Connection Required) trước khi điều hướng sang trang chi tiết để tải file media.
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
1. Welcome screen với app intro (icon: MapPin, color: Deep Sky Blue)
2. Giải thích tính năng auto-trigger (icon: Headphones, color: Sky Blue)
3. Giới thiệu QR fallback (icon: QrCode, color: Adventure Orange)

> **Note:** GPS permission được request khi vào Map Screen, không trong Onboarding.

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

### FR-600: Device Capability Check

| Field | Description |
|-------|-------------|
| **ID** | FR-600 |
| **Title** | Kiểm tra cấu hình thiết bị khi khởi động |
| **Priority** | P1 |

**Description:**
Mỗi lần khởi động ứng dụng, hệ thống kiểm tra hai năng lực thiết bị bắt buộc. Nếu thiếu, màn hình DeviceCheck chặn người dùng và hướng dẫn khắc phục.

**Checks:**
| Capability | Check Method | Bắt buộc? |
|-----------|--------------|-----------|
| GPS / Location | `expo-location.requestForegroundPermissionsAsync()` | ✅ |
| Internet | `expo-network.getNetworkStateAsync()` | ✅ |

**Flow:**
```
App Start → DeviceCheckScreen
  → Run checks
  → All pass → navigate to (tabs)
  → Any fail → show blocking UI + "Kiểm tra lại" button
```

**Business Rules:**
- BR-DEVICE01: Cả GPS và Internet đều phải pass mới cho vào app
- BR-DEVICE02: User có thể nhấn "Mở cài đặt thiết bị" để mở Settings
- BR-DEVICE03: Khi tất cả pass, navigate thẳng đến màn hình bản đồ

---

### FR-601: Language Selection

| Field | Description |
|-------|-------------|
| **ID** | FR-601 |
| **Title** | Change Display Language |
| **Priority** | P0 |
| **User Story** | US-405 |

**Description:**
User chọn ngôn ngữ hiển thị (VI/EN/ZH). Khi đổi ngôn ngữ, **cả nội dung text và audio** của POI đều chuyển sang ngôn ngữ tương ứng.

**Supported Languages:**
| Code | Language | Flag | TTS Voice |
|------|----------|------|-----------|
| vi | Tiếng Việt | 🇻🇳 | vi-VN-HoaiMyNeural |
| en | English | 🇬🇧 | en-US-AriaNeural |
| zh | 中文 | 🇨🇳 | zh-CN-XiaoxiaoNeural |

**Business Rules:**
- BR-601: Auto-detect device language ở lần đầu (vi/en/zh); default vi nếu không match
- BR-602: Fallback to Vietnamese nếu không có translation cho ngôn ngữ được chọn
- BR-603: Lưu preference vào AsyncStorage ('app_language')
- BR-604: Reload content khi đổi language
- BR-605: Audio player tìm PoiMedia theo language code (VI/EN/ZH), nếu không có thì fallback ALL

---

### FR-601b: i18n UI Strings

| Field | Description |
|-------|-------------|
| **ID** | FR-601b |
| **Title** | Internationalization for App UI Strings |
| **Priority** | P1 |

**Description:**
Toàn bộ chuỗi UI của mobile app (labels, buttons, messages, tab names) được quốc tế hóa qua i18next + react-i18next. Khi user đổi ngôn ngữ, không chỉ nội dung POI/Tour mà cả giao diện app cũng chuyển sang ngôn ngữ tương ứng.

**Implementation:**
- Library: `i18next` + `react-i18next`
- Translation files: `i18n/locales/vi.json`, `i18n/locales/en.json`
- LanguageContext cung cấp helper functions: `getPoiName(poi)`, `getPoiDescription(poi)`, `getTourName(tour)`, `getTourDescription(tour)`
- Persistence: AsyncStorage key `app_language`
- Fallback language: Vietnamese (vi)

**Business Rules:**
- BR-601b1: UI strings phải có bản dịch VI và EN
- BR-601b2: Nếu thiếu bản dịch cho key, fallback sang VI
- BR-601b3: Language detection: đọc từ AsyncStorage → device locale → default VI

---

### FR-601c: Web Dashboard Bilingual Form Labels

| Field | Description |
|-------|-------------|
| **ID** | FR-601c |
| **Title** | Bilingual Form Labels for Web Dashboard |
| **Priority** | P2 |

**Description:**
Trên Web Dashboard (Admin + Shop Owner), form tạo/chỉnh sửa POI có tabs chuyển đổi ngôn ngữ (Vietnamese / English). Khi user chuyển tab ngôn ngữ, không chỉ trường nhập liệu (name, description) mà **toàn bộ nhãn form** (section headings, labels, placeholders, buttons, toast messages) cũng chuyển sang ngôn ngữ tương ứng.

**Implementation:**
- File: `apps/admin/src/constants/form-labels.ts`
- Object `POI_FORM_LABELS` chứa 2 key `VI` và `EN`, mỗi key là object chứa toàn bộ label strings
- Component sử dụng: `const L = POI_FORM_LABELS[activeLang]` rồi dùng `L.poiName`, `L.description`, `L.ttsHeading`, v.v.
- Áp dụng cho cả `POIFormPage` (Admin) và `ShopOwnerPOIFormPage` (Shop Owner)

**Labels covered:**
- Page title/subtitle (Create / Edit / View)
- Section headings (Content, Classification, Location, Media, TTS)
- Form labels (POI Name, Description, Category, Address, Latitude, Longitude, Trigger Radius)
- Placeholders
- Button text (Cancel, Save, Submit, Generate TTS VI/EN)
- Toast messages (success, error, validation)
- Sidebar text (Approval Status, Tips)

**Business Rules:**
- BR-601c1: Default language tab = VI
- BR-601c2: Chuyển tab chỉ thay đổi UI labels, không ảnh hưởng dữ liệu form (mỗi tab edit field tương ứng)
- BR-601c3: Không sử dụng i18n library (lightweight constant-based approach)

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
Shop Owner có thể tạo, xem chi tiết, và chỉnh sửa POI(s) thuộc quyền sở hữu của mình. Form POI hỗ trợ 3 chế độ: Create, View (read-only), và Edit.

**Capabilities:**
- Tạo POI mới (tên, mô tả, vị trí, hình ảnh, audio) — route `/owner/pois/new`
- Xem chi tiết POI (read-only) — route `/owner/pois/:id`
- Chỉnh sửa tất cả fields của POI thuộc mình — route `/owner/pois/:id/edit`
- Xem danh sách POI(s) của mình — route `/owner/dashboard`
- Tạo TTS audio từ mô tả POI (sử dụng `POST /tts/generate/:poiId`) — chỉ khả dụng khi POI đã được lưu (edit mode)
- Xem và phát lại existing media (hình ảnh, audio) trong chế độ view/edit

**Routes:**
| Route | Mode | Description |
|-------|------|-------------|
| `/owner/pois/new` | Create | Form tạo POI mới |
| `/owner/pois/:id` | View | Xem chi tiết POI (read-only, tất cả inputs disabled) |
| `/owner/pois/:id/edit` | Edit | Chỉnh sửa POI + upload media + TTS generation |

**API Endpoints Used:**
- `GET /shop-owner/pois/:id` — lấy chi tiết POI (bao gồm media) cho view/edit
- `POST /shop-owner/pois` — tạo POI mới
- `PUT /shop-owner/pois/:id` — cập nhật POI
- `POST /shop-owner/pois/:id/media` — upload media
- `POST /tts/generate/:poiId` — tạo TTS audio (roles: ADMIN, SHOP_OWNER)

**Dashboard Buttons:**
- Nút **Edit** (✏️) → navigate `/owner/pois/:id/edit`
- Nút **View** (🔗) → navigate `/owner/pois/:id`
- Nút **Delete** (🗑️) → soft delete via `DELETE /pois/:id`

**Restrictions:**
- Chỉ thấy POI(s) mà mình sở hữu (owner_id = current_user)
- Không được xóa POI (chỉ Admin có quyền)
- Không được tạo/chỉnh sửa Tour

**Business Rules:**
- BR-1003: Shop Owner chỉ CRUD POI có owner_id = mình
- BR-1004: Shop Owner không xóa POI
- BR-1005b: TTS generation cho Shop Owner sử dụng cùng endpoint `POST /tts/generate/:poiId` với Admin (backend check ownership qua JWT)

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

## 8. Tourist App — Phase 4 (Auto-trigger, Tour Following, QR, Favorites, History)

### FR-801: Auto-trigger POI theo GPS

| Field | Description |
|-------|-------------|
| **ID** | FR-801 |
| **Title** | Tự động phát hiện điểm lân cận theo vị trí GPS |
| **Priority** | P0 |
| **User Story** | US-404 |

**Description:**  
Hệ thống sử dụng `Location.watchPositionAsync` để liên tục giám sát vị trí GPS của du khách. Khi khoảng cách đến POI < `triggerRadius` (mặc định **50m**), tự động hiển thị bottom sheet thông tin và **auto-play audio** (không hỏi user).

**Business Rules:**
- BR-801: Tính khoảng cách bằng công thức Haversine (trong `utils/distance.ts`)
- BR-802: Mỗi POI chỉ trigger 1 lần trong 1 session (được track bằng `triggeredPoiIds`)
- BR-803: Bottom sheet popup hiển thị tên, hình ảnh, và tự động autoPlay audio
- BR-804: Quản lý hàng chờ phát Audio (Audio Queue Management): Đảm bảo ở một thời điểm chỉ có 1 luồng âm thanh được phát (không phát trùng lặp).
- BR-805: Xử lý chuyển vùng liền kề: Khi user đang nghe audio của vùng 1, nếu lập tức rời khỏi vùng 1 và đi vào vùng 2, hệ thống phải **tắt ngay lập tức** audio vùng 1 trước khi tự động phát audio của vùng 2.

---

### FR-802: Tour Following Mode

| Field | Description |
|-------|-------------|
| **ID** | FR-802 |
| **Title** | Chế độ đi theo Tour thực tế |
| **Priority** | P0 |
| **User Story** | US-407 |

**Description:**  
Giao diện bản đồ chuyên dụng cho việc bám sát lộ trình tour. Vẽ đường Polyline giữa các trạm, theo dõi tiến độ và tự động check-in khi đến nơi.

**Business Rules:**
- BR-804: Hiển thị markers màu (xanh: đang đến, xanh lá: đã qua, xám: chưa đến)
- BR-805: Tự động chuyển sang trạm kế tiếp khi bấm nút "Tiếp theo"
- BR-806: Khi hoàn thành tất cả trạm, hiển thị màn hình chúc mừng

---

### FR-803: QR Scanner

| Field | Description |
|-------|-------------|
| **ID** | FR-803 |
| **Title** | Quét mã QR để check-in địa điểm |
| **Priority** | P1 |
| **User Story** | US-503 |

**Description:**  
Tourist mở camera quét QR code được gắn tại các điểm tham quan. App gọi API `/public/qr/validate` để kiểm tra và chuyển hướng đến trang chi tiết POI.

**Business Rules:**
- BR-807: QR format: `gpstours:poi:<uuid>`
- BR-808: Nếu QR không hợp lệ, hiển thị thông báo lỗi và cho quét lại
- BR-809: Sử dụng `expo-camera` (CameraView) với `onBarcodeScanned`
- BR-809a: Phân loại tải dữ liệu khi quét QR:
  + TH1 (Offline Mode): Nếu dung lượng data thuyết minh < cấu hình bộ nhớ cho phép của thiết bị -> Không yêu cầu Wi-Fi, truy xuất ngay dữ liệu Local qua **SQLite**.
  + TH2 (Online Mode): Nếu tổng dung lượng data thuyết minh > cấu hình thiết bị -> Bắt buộc yêu cầu Wi-Fi/4G, gọi API lên **SQL Server (PostgreSQL)** để lấy thông tin.

---

### FR-804: Favorites

| Field | Description |
|-------|-------------|
| **ID** | FR-804 |
| **Title** | Lưu địa điểm yêu thích |
| **Priority** | P1 |
| **User Story** | US-408 |

**Description:**  
Tourist đã đăng nhập có thể bấm nút ❤️ trên POI Detail để lưu địa điểm yêu thích. Màn hình Favorites hiển thị danh sách các POI đã lưu.

**Business Rules:**
- BR-810: Cần đăng nhập để sử dụng tính năng
- BR-811: Toggle favorite (bấm lần 2 để bỏ yêu thích)
- BR-812: API: `POST/DELETE /tourist/me/favorites/:poiId`

---

### FR-805: History

| Field | Description |
|-------|-------------|
| **ID** | FR-805 |
| **Title** | Lịch sử trải nghiệm |
| **Priority** | P1 |
| **User Story** | US-409 |

**Description:**  
Màn hình liệt kê các địa điểm du khách đã tham quan, bao gồm thời gian và trạng thái nghe audio.

**Business Rules:**
- BR-813: Cần đăng nhập để xem
- BR-814: Sắp xếp theo thời gian mới nhất
- BR-815: API: `GET /tourist/me/history`

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 6, 7
