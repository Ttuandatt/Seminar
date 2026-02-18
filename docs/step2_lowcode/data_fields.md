# 🗃️ Data Fields
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh — Step 2

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-11  
> **Cập nhật:** 2026-02-14  
> **Ref:** Step 2 Low-code (UI + Flow + Rule)

---

## 1. Admin

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Admin | id | UUID | Yes | Auto-generated | PK |
| Admin | username | String(50) | Yes | 3-50 chars, alphanumeric | Unique |
| Admin | email | String(100) | Yes | Valid email format | Unique |
| Admin | password_hash | String(255) | Yes | bcrypt hash | Never expose |
| Admin | full_name | String(100) | Yes | 2-100 chars | Display name |
| Admin | role | Enum | Yes | SUPER_ADMIN, ADMIN, VIEWER | — |
| Admin | status | Enum | Yes | ACTIVE, INACTIVE, LOCKED | Default: ACTIVE |
| Admin | last_login_at | Timestamp | No | — | Auto-updated |
| Admin | failed_login_count | Integer | Yes | ≥ 0 | Default: 0, reset on success |
| Admin | locked_until | Timestamp | No | — | Set when locked |
| Admin | created_at | Timestamp | Yes | Auto | — |
| Admin | updated_at | Timestamp | Yes | Auto | — |

---

## 2. Password Reset Token

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| PasswordResetToken | id | UUID | Yes | Auto | PK |
| PasswordResetToken | user_id | UUID | Yes | FK → Admin/User | Who requested |
| PasswordResetToken | token | String(255) | Yes | crypto.randomBytes | Unique, hashed |
| PasswordResetToken | expires_at | Timestamp | Yes | created_at + 1h | BR-07 |
| PasswordResetToken | used_at | Timestamp | No | — | Set when used (BR-06) |
| PasswordResetToken | created_at | Timestamp | Yes | Auto | — |

---

## 3. POI

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| POI | id | UUID | Yes | Auto | PK |
| POI | name_vi | String(200) | Yes | 2-200 chars | Vietnamese name |
| POI | name_en | String(200) | No | 2-200 chars | English name |
| POI | description_vi | Text | Yes | 10-5000 chars | Vietnamese desc |
| POI | description_en | Text | No | 10-5000 chars | English desc |
| POI | latitude | Decimal(10,8) | Yes | -90 to 90 | GPS lat |
| POI | longitude | Decimal(11,8) | Yes | -180 to 180 | GPS lng |
| POI | trigger_radius | Integer | Yes | 5-100m | Default: 15m (BR-19) |
| POI | category | Enum | Yes | DINING, STREET_FOOD, CAFES_DESSERTS, BARS_NIGHTLIFE, MARKETS_SPECIALTY, CULTURAL_LANDMARKS, EXPERIENCES_WORKSHOPS, OUTDOOR_SCENIC | POI taxonomy |
| POI | status | Enum | Yes | DRAFT, ACTIVE, ARCHIVED | Default: DRAFT (BR-15); Admin có thể đặt ACTIVE ngay khi tạo nếu đủ dữ liệu |
| POI | owner_id | UUID | No | FK → Shop_Owner | NULL if Admin-created |
| POI | created_by | UUID | Yes | FK → Admin/User | Creator |
| POI | created_at | Timestamp | Yes | Auto | — |
| POI | updated_at | Timestamp | Yes | Auto | — |
| POI | deleted_at | Timestamp | No | — | Soft delete (BR-17) |

---

## 4. POI Media

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| POI_Media | id | UUID | Yes | Auto | PK |
| POI_Media | poi_id | UUID | Yes | FK → POI | Parent POI |
| POI_Media | type | Enum | Yes | IMAGE, AUDIO | Media type |
| POI_Media | language | Enum | No | VI, EN | For audio only |
| POI_Media | url | String(500) | Yes | Valid URL | S3/CDN URL |
| POI_Media | thumbnail_url | String(500) | No | Valid URL | For images (BR-21) |
| POI_Media | duration_seconds | Integer | No | > 0 | Audio duration |
| POI_Media | size_bytes | Integer | Yes | > 0 | File size |
| POI_Media | mime_type | String(50) | Yes | image/*, audio/* | Content type |
| POI_Media | order_index | Integer | No | ≥ 0 | Display order |
| POI_Media | created_at | Timestamp | Yes | Auto | — |

---

## 5. Tour

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Tour | id | UUID | Yes | Auto | PK |
| Tour | name_vi | String(200) | Yes | 2-200 chars | Vietnamese |
| Tour | name_en | String(200) | No | 2-200 chars | English |
| Tour | description_vi | Text | No | — | Vietnamese |
| Tour | description_en | Text | No | — | English |
| Tour | thumbnail_url | String(500) | No | Valid URL | Cover image |
| Tour | estimated_duration | Integer | No | Minutes | Auto-calc (BR-26) |
| Tour | status | Enum | Yes | DRAFT, PUBLISHED, ARCHIVED | Default: DRAFT |
| Tour | created_by | UUID | Yes | FK → Admin | Creator |
| Tour | created_at | Timestamp | Yes | Auto | — |
| Tour | updated_at | Timestamp | Yes | Auto | — |
| Tour | deleted_at | Timestamp | No | — | Soft delete |

---

## 6. Tour_POI (Junction)

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Tour_POI | id | UUID | Yes | Auto | PK |
| Tour_POI | tour_id | UUID | Yes | FK → Tour | Parent Tour |
| Tour_POI | poi_id | UUID | Yes | FK → POI | POI in Tour |
| Tour_POI | order_index | Integer | Yes | ≥ 0 | Route order (BR-25) |
| Tour_POI | created_at | Timestamp | Yes | Auto | — |

**Constraint:** UNIQUE(tour_id, poi_id)

---

## 7. Shop Owner

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Shop_Owner | id | UUID | Yes | Auto | PK |
| Shop_Owner | user_id | UUID | Yes | FK → User/Admin | 1:1 relation |
| Shop_Owner | business_name | String(200) | Yes | 2-200 chars | Tên cửa hàng |
| Shop_Owner | phone | String(20) | No | VN phone format | +84... |
| Shop_Owner | address | String(500) | No | — | Địa chỉ |
| Shop_Owner | created_at | Timestamp | Yes | Auto | — |
| Shop_Owner | updated_at | Timestamp | Yes | Auto | — |

---

## 8. Tourist User

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Tourist_User | id | UUID | Yes | Auto | PK |
| Tourist_User | device_id | String(255) | No | — | Anonymous tracking |
| Tourist_User | email | String(100) | No | Valid email | Optional login |
| Tourist_User | display_name | String(100) | No | — | Display name |
| Tourist_User | auth_provider | Enum | No | LOCAL, GOOGLE | Social login |
| Tourist_User | language_pref | Enum | Yes | VI, EN | Default: VI (BR-47) |
| Tourist_User | push_token | String(255) | No | — | Push notifications |
| Tourist_User | created_at | Timestamp | Yes | Auto | — |
| Tourist_User | last_active_at | Timestamp | No | — | Activity tracking |

---

## 9. View History

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| View_History | id | UUID | Yes | Auto | PK |
| View_History | user_id | UUID | No | FK → Tourist_User | NULL = anonymous |
| View_History | poi_id | UUID | Yes | FK → POI | POI viewed |
| View_History | viewed_at | Timestamp | Yes | Auto | When viewed |
| View_History | duration_seconds | Integer | No | ≥ 0 | Time spent |
| View_History | audio_played | Boolean | Yes | — | Default: false |
| View_History | trigger_type | Enum | Yes | GPS, QR, MANUAL | How triggered |

---

## 10. Favorites

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Favorite | id | UUID | Yes | Auto | PK |
| Favorite | user_id | UUID | Yes | FK → Tourist_User | Required login (BR-44) |
| Favorite | poi_id | UUID | Yes | FK → POI | Favorited POI |
| Favorite | created_at | Timestamp | Yes | Auto | — |

**Constraint:** UNIQUE(user_id, poi_id)

---

## 11. Trigger Log

| Entity | Field | Type | Required | Validation | Notes |
|--------|-------|------|----------|------------|-------|
| Trigger_Log | id | UUID | Yes | Auto | PK |
| Trigger_Log | user_id | UUID | No | FK → Tourist | NULL = anonymous |
| Trigger_Log | poi_id | UUID | Yes | FK → POI | Triggered POI |
| Trigger_Log | latitude | Decimal(10,8) | Yes | — | Tourist position |
| Trigger_Log | longitude | Decimal(11,8) | Yes | — | Tourist position |
| Trigger_Log | distance_meters | Decimal(6,2) | Yes | — | Distance to POI |
| Trigger_Log | triggered_at | Timestamp | Yes | Auto | — |

---

## Tổng kết

| Entity | Fields | Relations |
|--------|--------|-----------|
| Admin | 12 | — |
| PasswordResetToken | 6 | → Admin |
| POI | 15 | → Admin, → Shop_Owner |
| POI_Media | 11 | → POI |
| Tour | 12 | → Admin |
| Tour_POI | 5 | → Tour, → POI |
| Shop_Owner | 7 | → User/Admin |
| Tourist_User | 9 | — |
| View_History | 7 | → Tourist_User, → POI |
| Favorite | 4 | → Tourist_User, → POI |
| Trigger_Log | 7 | → Tourist_User, → POI |
| **Tổng** | **95 fields** | **11 entities** |
