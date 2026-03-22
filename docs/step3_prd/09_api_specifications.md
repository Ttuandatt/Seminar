# 🔌 API Specifications
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.0
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-03-22
> **Base URL (Dev):** `http://localhost:3000/api/v1`
> **Base URL (Prod):** `https://api.gpstours.vn/v1` *(chưa deploy)*

---

## 1. API Overview

### 1.1 General Conventions

| Aspect | Convention |
|--------|------------|
| Format | JSON |
| Auth | Bearer Token (JWT) |
| Versioning | URL path (`/v1/`) |
| Pagination | `page`, `limit` query params |
| Sorting | `sort`, `order` query params |
| Error format | `{ error: { code, message, details } }` |
| CORS | `origin: true`, `credentials: true` (hỗ trợ mobile LAN IP) |

### 1.2 Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Unexpected error |

---

## 2. Authentication APIs

### POST /auth/login

Login and get access token.

**Request:**
```json
{
  "username": "admin@example.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 900,
  "user": {
    "id": "uuid",
    "username": "admin@example.com",
    "fullName": "Admin User",
    "role": "ADMIN"
  }
}
```

**Errors:**
- `401`: Invalid credentials
- `423`: Account locked

---

### POST /auth/refresh

Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "accessToken": "new-access-token",
  "expiresIn": 900
}
```

---

### POST /auth/logout

Invalidate refresh token.

**Headers:** `Authorization: Bearer <accessToken>`

**Response:** `204 No Content`

---

### POST /auth/forgot-password

Request password reset link via email.

**Request:**
```json
{
  "email": "admin@example.com"
}
```

**Response (200):**
```json
{
  "message": "If this email exists, a reset link has been sent"
}
```

> **Note:** Luôn trả 200 để tránh email enumeration attack.

---

### POST /auth/reset-password

Reset password using token from email.

**Request:**
```json
{
  "token": "reset-token-uuid",
  "newPassword": "newSecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Password updated successfully"
}
```

**Errors:**
- `400`: Token expired or already used
- `422`: Password doesn't meet requirements (min 8 chars, complexity)

---

## 3. User Profile APIs

### GET /me

Return the consolidated profile of the currently authenticated user.

**Headers:** `Authorization: Bearer <accessToken>`

**Response (200):**
```json
{
  "id": "uuid",
  "role": "SUPER_ADMIN",
  "email": "admin@gpstours.vn",
  "fullName": "Trần Bảo Ngọc",
  "avatarUrl": "https://cdn.../avatars/ngoc.webp",
  "phone": {
    "countryCode": "+84",
    "number": "901234567"
  },
  "birthDate": "1992-05-11",
  "gender": "FEMALE",
  "address": {
    "line1": "123 Vĩnh Khánh",
    "city": "HCM",
    "country": "VN"
  },
  "shop": {
    "name": "Quán Bún Mắm Tùng",
    "address": "123 Vĩnh Khánh, Q4",
    "openingHours": [
      { "day": "MON", "open": "08:00", "close": "22:00" }
    ]
  },
  "preferences": {
    "language": "vi",
    "theme": "light"
  },
  "lastUpdatedAt": "2026-02-18T09:20:00Z"
}
```

**Errors:**
- `401`: Missing/invalid token
- `423`: Account disabled or locked

---

### PUT /me

Update personal profile fields.

**Headers:** `Authorization: Bearer <accessToken>`

**Request:**
```json
{
  "fullName": "Nguyễn Văn A",
  "birthDate": "1990-01-10",
  "phone": {
    "countryCode": "+84",
    "number": "912345678"
  },
  "address": {
    "line1": "123 Vĩnh Khánh",
    "city": "TP.HCM",
    "country": "VN"
  },
  "shop": {
    "name": "Quán Mới",
    "address": "45 Tôn Đản",
    "openingHours": [
      { "day": "MON", "open": "09:00", "close": "21:00" }
    ]
  }
}
```

> Avatar upload được gửi qua `multipart/form-data` field `avatar` với file ≤2MB.

**Response (200):**
```json
{
  "message": "Profile updated",
  "profile": {
    "fullName": "Nguyễn Văn A",
    "avatarUrl": "https://cdn.../avatars/a.webp",
    "shop": {
      "name": "Quán Mới",
      "address": "45 Tôn Đản"
    },
    "lastUpdatedAt": "2026-02-18T10:05:22Z"
  }
}
```

**Errors:**
- `400`: Invalid request body (bad JSON)
- `401`: Missing/invalid token
- `403`: Attempt to edit restricted role/email fields
- `409`: Phone already used by another user (if unique constraint enforced)
- `422`: Validation errors (underage, invalid phone, missing shop info for Shop Owner)

---

## 4. POI APIs

### GET /pois

List all POIs with pagination and filters.

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | int | 1 | Page number |
| limit | int | 20 | Items per page (max 100) |
| status | string | - | Filter by status |
| category | string | - | Filter by category |
| search | string | - | Search in name |
| lat | float | - | Center latitude for nearby |
| lng | float | - | Center longitude for nearby |
| radius | int | 1000 | Radius in meters (for nearby) |

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameVi": "Chùa Linh Ứng",
      "nameEn": "Linh Ung Pagoda",
      "descriptionVi": "...",
      "latitude": 16.0544,
      "longitude": 108.2022,
      "triggerRadius": 15,
      "category": "DINING",
      "status": "ACTIVE",
      "thumbnailUrl": "https://cdn.../thumb.jpg",
      "createdAt": "2026-02-08T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 45,
    "totalPages": 3
  }
}
```

---

### GET /pois/:id

Get single POI with all details.

**Response (200):**
```json
{
  "id": "uuid",
  "nameVi": "Chùa Linh Ứng",
  "nameEn": "Linh Ung Pagoda",
  "descriptionVi": "Mô tả chi tiết...",
  "descriptionEn": "Detailed description...",
  "latitude": 16.0544,
  "longitude": 108.2022,
  "triggerRadius": 15,
  "category": "DINING",
  "status": "ACTIVE",
  "media": [
    {
      "id": "uuid",
      "type": "IMAGE",
      "language": "ALL",
      "url": "https://cdn.../image1.jpg",
      "orderIndex": 0
    },
    {
      "id": "uuid",
      "type": "AUDIO",
      "language": "VI",
      "url": "https://cdn.../audio_vi.mp3",
      "durationSeconds": 180
    }
  ],
  "tours": [
    {
      "id": "uuid",
      "nameVi": "Tour Đà Nẵng"
    }
  ],
  "createdBy": {
    "id": "uuid",
    "fullName": "Admin"
  },
  "createdAt": "2026-02-08T10:00:00Z",
  "updatedAt": "2026-02-08T10:00:00Z"
}
```

---

### POST /pois

Create new POI.

**Headers:** `Authorization: Bearer <token>`

**Request (multipart/form-data):**
```
nameVi: "Chùa Linh Ứng"
nameEn: "Linh Ung Pagoda"
descriptionVi: "..."
descriptionEn: "..."
latitude: 16.0544
longitude: 108.2022
triggerRadius: 15
category: "DINING"
status: "ACTIVE" // optional, default DRAFT
images[]: (file)
images[]: (file)
audioVi: (file)
audioEn: (file)
```

> **Rule:** Nếu không gửi `status` thì POI tạo mới mặc định `DRAFT`. Admin có thể đặt `ACTIVE` ngay khi tạo nếu nội dung đạt chuẩn QC.

**Response (201):**
```json
{
  "id": "new-uuid",
  "message": "POI created successfully"
}
```

---

### PUT /pois/:id

Update existing POI.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nameVi": "Updated Name",
  "descriptionVi": "Updated description",
  "status": "ACTIVE"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "message": "POI updated successfully"
}
```

---

### DELETE /pois/:id

Soft delete POI.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

**Errors:**
- `422`: POI is part of active Tour (warning required)

---

### PATCH /pois/:id/status

Change POI status (Draft ↔ Published).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "ACTIVE"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "ACTIVE",
  "message": "POI published successfully"
}
```

**Errors:**
- `422`: Missing required fields for publish (name, description, location)
- `422`: POI in active Tour cannot be set to DRAFT

---

### POST /pois/:id/media

Upload media to specific POI.

**Headers:** `Authorization: Bearer <token>`

**Request (multipart/form-data):**
```
file: (binary)
type: "IMAGE" | "AUDIO"
language: "VI" | "EN" | "ALL"
orderIndex: 0
```

**Response (201):**
```json
{
  "id": "media-uuid",
  "type": "IMAGE",
  "url": "https://cdn.../image.jpg",
  "thumbnailUrl": "https://cdn.../thumb.jpg",
  "sizeBytes": 245000,
  "orderIndex": 0
}
```

**Errors:**
- `400`: File too large (IMAGE > 5MB, AUDIO > 50MB)
- `400`: Unsupported file type
- `422`: Max 10 images per POI

---

### DELETE /pois/:id/media/:mediaId

Remove media from POI.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## 4. Tour APIs

### GET /tours

List all tours.

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameVi": "Tour Phố Ẩm thực",
      "nameEn": "Food Street Tour",
      "thumbnailUrl": "https://cdn.../tour.jpg",
      "estimatedDuration": 120,
      "poiCount": 8,
      "status": "ACTIVE"
    }
  ],
  "pagination": {...}
}
```

---

### GET /tours/:id

Get tour with POIs.

**Response (200):**
```json
{
  "id": "uuid",
  "nameVi": "Tour Phố Ẩm thực",
  "descriptionVi": "...",
  "pois": [
    {
      "orderIndex": 0,
      "poi": {
        "id": "uuid",
        "nameVi": "Điểm 1",
        "latitude": 16.05,
        "longitude": 108.20
      }
    },
    {
      "orderIndex": 1,
      "poi": {...}
    }
  ]
}
```

---

### POST /tours

Create new tour.

**Request:**
```json
{
  "nameVi": "Tour mới",
  "descriptionVi": "...",
  "estimatedDuration": 90,
  "poiIds": ["poi-uuid-1", "poi-uuid-2", "poi-uuid-3"]
}
```

---

### PUT /tours/:id/pois

Update POIs in tour (add/remove/reorder).

**Request:**
```json
{
  "pois": [
    { "poiId": "uuid-1", "orderIndex": 0 },
    { "poiId": "uuid-2", "orderIndex": 1 },
    { "poiId": "uuid-3", "orderIndex": 2 }
  ]
}
```

---

### PUT /tours/:id

Update tour basic info.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nameVi": "Updated Tour Name",
  "descriptionVi": "Updated description",
  "estimatedDuration": 120
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "message": "Tour updated successfully"
}
```

---

### DELETE /tours/:id

Soft delete Tour.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### PATCH /tours/:id/status

Change Tour status (Draft ↔ Published).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "status": "ACTIVE"
}
```

**Errors:**
- `422`: Tour must have at least 2 POIs to publish

---

## 5. Upload APIs

### POST /upload/image

Upload image file.

**Headers:** `Authorization: Bearer <token>`

**Request:** `multipart/form-data`
- `file`: Image file (max 5MB)

**Response (201):**
```json
{
  "url": "https://cdn.../image.jpg",
  "thumbnailUrl": "https://cdn.../thumb.jpg",
  "sizeBytes": 245000,
  "width": 1920,
  "height": 1080
}
```

---

### POST /upload/audio

Upload audio file.

**Request:** `multipart/form-data`
- `file`: Audio file (max 50MB)

**Response (201):**
```json
{
  "url": "https://cdn.../audio.mp3",
  "sizeBytes": 5000000,
  "durationSeconds": 180
}
```

---

## 6. Public APIs (Tourist App - No Auth)

### GET /public/pois

Get all active POIs (no auth required).

**Query:** Same as `/pois` but only returns `status=ACTIVE`.

---

### GET /public/pois/:id

Get single POI details (no auth required).

---

### GET /public/tours

Get all active tours (no auth required).

---

### GET /public/tours/:id

Get tour with POI order (no auth required).

---

### GET /public/pois/nearby

Get POIs near location.

**Query:**
```
?lat=16.0544&lng=108.2022&radius=500
```

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameVi": "Chùa ABC",
      "latitude": 16.0544,
      "longitude": 108.2022,
      "distance": 45,
      "isInTriggerZone": true,
      "triggerRadius": 15
    }
  ]
}
```

---

### POST /public/qr/validate

Validate QR code and return POI info.

**Request:**
```json
{
  "codeData": "https://gpstours.app/poi/uuid-123"
}
```

**Response (200):**
```json
{
  "valid": true,
  "poi": {
    "id": "uuid-123",
    "nameVi": "Chùa ABC",
    "status": "ACTIVE"
  }
}
```

**Errors:**
- `404`: QR code not found or POI deleted
- `422`: POI is not published

---

## 7. Tourist User APIs (Optional Auth)

> **Note:** Tourist có thể dùng app không cần login. APIs này available khi tourist đăng ký.

### POST /auth/register

Register a new account (Tourist or Shop Owner).

**Request:**
```json
{
  "role": "TOURIST",
  "email": "tourist@example.com",
  "password": "password123",
  "displayName": "Nguyễn Văn A",
  "languagePref": "VI"
}
```

**Request (Shop Owner):**
```json
{
  "role": "SHOP_OWNER",
  "email": "owner@example.com",
  "password": "password123",
  "fullName": "Nguyễn Văn Tùng",
  "shopName": "Quán Bún Mắm Tùng",
  "shopAddress": "123 Vĩnh Khánh, Q.4",
  "phone": "0901234567"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "role": "TOURIST",
  "message": "Account created. Please verify your email."
}
```

---

### POST /tourist/login

Tourist login.

**Request:**
```json
{
  "email": "tourist@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "displayName": "Nguyễn Văn A",
    "languagePref": "VI"
  }
}
```

---

### POST /tourist/social-login

Login via Google/Facebook/Apple.

**Request:**
```json
{
  "provider": "GOOGLE",
  "idToken": "google-id-token"
}
```

**Response (200):** Same as `/tourist/login`

---

### GET /tourist/me

Get current tourist profile.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": "uuid",
  "email": "tourist@example.com",
  "displayName": "Nguyễn Văn A",
  "languagePref": "VI",
  "autoPlayAudio": true,
  "pushEnabled": false
}
```

---

### PATCH /tourist/me

Update tourist preferences.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "languagePref": "EN",
  "autoPlayAudio": false,
  "pushEnabled": true,
  "pushToken": "fcm-token-string"
}
```

---

### GET /tourist/me/history

Get POI view history.

**Headers:** `Authorization: Bearer <token>`

**Query:** `?page=1&limit=20`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "poi": {
        "id": "poi-uuid",
        "nameVi": "Chùa ABC",
        "thumbnailUrl": "https://cdn.../thumb.jpg"
      },
      "viewedAt": "2026-02-10T10:00:00Z",
      "audioPlayed": true,
      "triggerType": "GPS"
    }
  ],
  "pagination": {...}
}
```

---

### GET /tourist/me/favorites

Get favorite POIs.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "id": "fav-uuid",
      "poi": {
        "id": "poi-uuid",
        "nameVi": "Chùa ABC",
        "thumbnailUrl": "https://cdn.../thumb.jpg"
      },
      "createdAt": "2026-02-10T10:00:00Z"
    }
  ]
}
```

---

### POST /tourist/me/favorites

Add POI to favorites.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "poiId": "poi-uuid"
}
```

**Response (201):**
```json
{
  "id": "fav-uuid",
  "message": "Added to favorites"
}
```

**Errors:**
- `409`: Already in favorites

---

### DELETE /tourist/me/favorites/:poiId

Remove POI from favorites.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## 8. Shop Owner APIs

> **Note:** Shop Owner đăng nhập qua `/auth/register` với `role: SHOP_OWNER`. Sau khi verify email, truy cập dashboard.

### POST /shop-owner/login

Shop Owner login.

**Request:**
```json
{
  "email": "owner@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token",
  "user": {
    "id": "uuid",
    "shopName": "Quán Bún Mắm Tùng",
    "role": "SHOP_OWNER"
  }
}
```

---

### GET /shop-owner/pois

Get POIs owned by current Shop Owner.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "nameVi": "Quán Bún Mắm Tùng",
      "status": "ACTIVE",
      "viewCount": 120,
      "audioPlayCount": 85
    }
  ]
}
```

> **Data isolation:** Backend filters by `owner_id = current_user.id`. Shop Owner cannot see other owners' POIs.

---

### POST /shop-owner/pois

Create new POI (Shop Owner).

**Headers:** `Authorization: Bearer <token>`

**Request (multipart/form-data):**
```
nameVi: "Quán Bún Mắm Tùng - Chi nhánh 2"
descriptionVi: "..."
latitude: 10.7575
longitude: 106.6993
images[]: (file)
audioVi: (file)
```

**Response (201):**
```json
{
  "id": "new-uuid",
  "ownerId": "shop-owner-uuid",
  "message": "POI created successfully"
}
```

---

### PUT /shop-owner/pois/:id

Update own POI.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nameVi": "Updated Name",
  "descriptionVi": "Updated description"
}
```

**Errors:**
- `403`: Not your POI (owner_id mismatch)

---

### POST /shop-owner/pois/:id/media

Upload media to own POI. Same format as `/pois/:id/media`.

**Errors:**
- `403`: Not your POI

---

### GET /shop-owner/analytics

Get analytics for own POI(s) only.

**Headers:** `Authorization: Bearer <token>`

**Query:** `?startDate=2026-01-01&endDate=2026-02-10`

**Response (200):**
```json
{
  "totalViews": 350,
  "totalAudioPlays": 210,
  "pois": [
    {
      "id": "uuid",
      "nameVi": "Quán Bún Mắm Tùng",
      "viewCount": 350,
      "audioPlayCount": 210,
      "audioPlayRate": 0.60
    }
  ],
  "dailyViews": [
    { "date": "2026-02-09", "views": 15 },
    { "date": "2026-02-10", "views": 18 }
  ]
}
```

---

### GET /shop-owner/me

Get Shop Owner profile.

**Headers:** `Authorization: Bearer <token>`

---

### PATCH /shop-owner/me

Update Shop Owner profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "shopName": "Updated Shop Name",
  "phone": "0901234567"
}
```

---

## 9. TTS (Text-to-Speech) APIs

> **Note:** TTS sử dụng Microsoft Edge TTS engine. Khi Admin/Shop Owner tạo hoặc cập nhật POI description, hệ thống có thể tự động hoặc thủ công sinh audio từ text.

### POST /tts/generate/:poiId

Generate TTS audio cho một POI. Audio cũ được archive (`orderIndex: -1`) và tự xóa sau 30 ngày.

**Headers:** `Authorization: Bearer <token>`

**Roles:** `ADMIN`, `SHOP_OWNER`

**Request:**
```json
{
  "language": "VI",
  "voice": "vi-VN-HoaiMyNeural"
}
```

**Available Voices:**

| Language | Voice ID | Description |
|----------|----------|-------------|
| VI | `vi-VN-HoaiMyNeural` | Giọng nữ (mặc định) |
| VI | `vi-VN-NamMinhNeural` | Giọng nam |
| EN | `en-US-AriaNeural` | Female (default) |
| EN | `en-US-GuyNeural` | Male |
| EN | `en-US-JennyNeural` | Female (alternative) |

**Response (201):**
```json
{
  "id": "media-uuid",
  "type": "AUDIO",
  "language": "VI",
  "url": "/uploads/tts/<uuid>/tts_vi.mp3",
  "originalName": "tts_vi.mp3",
  "sizeBytes": 125000,
  "orderIndex": 0,
  "message": "TTS audio generated successfully"
}
```

**Audio specs:** MP3, 24 kHz, 96 kbps mono.

**Errors:**
- `400`: POI không có description cho ngôn ngữ yêu cầu
- `404`: POI not found
- `500`: TTS engine error

---

### GET /tts/voices

Get danh sách available TTS voices.

**Headers:** `Authorization: Bearer <token>`

**Query:** `?language=VI`

**Response (200):**
```json
{
  "voices": [
    {
      "id": "vi-VN-HoaiMyNeural",
      "name": "Hoài My",
      "language": "VI",
      "gender": "FEMALE",
      "isDefault": true
    },
    {
      "id": "vi-VN-NamMinhNeural",
      "name": "Nam Minh",
      "language": "VI",
      "gender": "MALE",
      "isDefault": false
    }
  ]
}
```

---

## 10. Trigger & Analytics APIs

### POST /public/trigger-log

Log GPS/QR trigger event (no auth, uses device_id).

**Request:**
```json
{
  "deviceId": "device-uuid",
  "poiId": "poi-uuid",
  "triggerType": "GPS",
  "userAction": "ACCEPTED",
  "userLat": 16.0544,
  "userLng": 108.2022,
  "distanceMeters": 12.5
}
```

**Response (201):**
```json
{
  "id": "log-uuid",
  "recorded": true
}
```

---

### GET /admin/analytics/overview

Get analytics dashboard data (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Query:** `?startDate=2026-01-01&endDate=2026-02-10`

**Response (200):**
```json
{
  "totalPOIs": 45,
  "totalTours": 8,
  "totalTourists": 234,
  "totalViews": 1580,
  "totalAudioPlays": 890,
  "topPOIs": [
    {
      "id": "uuid",
      "nameVi": "Chùa ABC",
      "viewCount": 120,
      "audioPlayRate": 0.75
    }
  ],
  "triggerStats": {
    "gps": 650,
    "qr": 200,
    "manual": 730
  },
  "dailyViews": [
    { "date": "2026-02-09", "views": 45 },
    { "date": "2026-02-10", "views": 52 }
  ]
}
```

---

### GET /admin/analytics/export

Export analytics data to CSV.

**Headers:** `Authorization: Bearer <token>`

**Query:** `?startDate=2026-01-01&endDate=2026-02-10&type=views`

**Response:** CSV file download

---

## 11. Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "nameVi",
        "message": "Name is required"
      }
    ]
  }
}
```

**Error Codes:**
- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `CONFLICT`
- `BUSINESS_RULE_VIOLATION`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

---

## 12. API Summary

| Section | Endpoints | Auth Required |
|---------|-----------|---------------|
| 2. Auth | 6 | No (except logout) |
| 3. User Profile | 2 | Yes (Bearer JWT) |
| 4. POI Admin | 8 | Yes (Bearer JWT) |
| 5. Tour Admin | 6 | Yes (Bearer JWT) |
| 6. Upload | 2 | Yes (Bearer JWT) |
| 7. Public | 7 | No |
| 8. Tourist User | 9 | Yes (Tourist JWT) |
| **9. Shop Owner** | **9** | **Yes (Shop Owner JWT)** |
| **10. TTS** | **2** | **Yes (Admin/Shop Owner JWT)** |
| 11. Analytics | 3 | Mixed |
| **Total** | **54** | |

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 7.5
