# 🗃️ Data Requirements
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

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
                    ┌────────────┴────────────┐          │
                    │                         │          │
            ┌───────▼───────┐         ┌───────▼───────┐  │
            │   POI_Media   │         │   Tour_POI    │◄─┘
            ├───────────────┤         ├───────────────┤
            │ id (PK)       │         │ id (PK)       │
            │ poi_id (FK)   │         │ tour_id (FK)  │
            │ type          │         │ poi_id (FK)   │
            │ language      │         │ order_index   │
            │ url           │         │ created_at    │
            │ duration      │         └───────────────┘
            │ size_bytes    │
            │ created_at    │
            └───────────────┘
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

### 2.2 POI (Point of Interest)

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
| `created_by` | UUID | FK → Admin.id | Creator |
| `created_at` | TIMESTAMP | NOT NULL | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL | Last update timestamp |
| `deleted_at` | TIMESTAMP | NULL | Soft delete timestamp |

**Indexes:**
- `idx_poi_location` GIST index on `location`
- `idx_poi_status` on `status`
- `idx_poi_category` on `category`
- `idx_poi_deleted_at` on `deleted_at`

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

## 3. TypeScript Interfaces

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
  createdBy: string;
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
```

---

## 4. Data Volume Estimates

| Entity | Initial | 6 Months | 1 Year |
|--------|---------|----------|--------|
| Admins | 5 | 10 | 20 |
| POIs | 20 | 100 | 300 |
| Media files | 100 | 500 | 1500 |
| Tours | 3 | 15 | 50 |
| Tour_POIs | 30 | 150 | 500 |

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
