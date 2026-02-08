# 🔌 API Specifications
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08  
> **Base URL:** `https://api.gpstours.vn/v1`

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

## 3. POI APIs

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
      "category": "MAIN",
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
  "category": "MAIN",
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
category: "MAIN"
images[]: (file)
images[]: (file)
audioVi: (file)
audioEn: (file)
```

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

## 6. Public APIs (Tourist App)

### GET /public/pois

Get all active POIs (no auth required).

**Query:** Same as `/pois` but only returns ACTIVE status.

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
      "distance": 45,
      "isInTriggerZone": true
    }
  ]
}
```

---

## 7. Error Response Format

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
- `RATE_LIMITED`
- `INTERNAL_ERROR`

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 7.5
