# 📜 Business Rules
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

---

## 1. Authentication Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-101 | Username Format | Username entered | Validate: 3-50 chars, alphanumeric + email | High |
| BR-102 | Password Hashing | User created/password changed | Hash with bcrypt (cost 12) | High |
| BR-103 | Login Lockout | 5 failed login attempts | Lock account for 15 minutes | High |
| BR-104 | Access Token Expiry | Token created | Expires in 15 minutes | High |
| BR-105 | Refresh Token Expiry | Token created | Expires in 7 days | High |
| BR-106 | Auto-Refresh | Access token < 5 min remaining | Auto-refresh using refresh token | Medium |
| BR-107 | Session Invalidation | User logs out | Invalidate refresh token | High |

---

## 2. POI Management Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-201 | Unique POI Name | Create/Update POI | Name must be unique (case-insensitive) | High |
| BR-202 | Required Fields | Create POI | Require: name_vi, description_vi, lat, lng, category | High |
| BR-203 | Coordinate Validation | Set location | Latitude: -90 to 90, Longitude: -180 to 180 | High |
| BR-204 | Coordinate Bounds | Set location | Must be within configured region bounds | Medium |
| BR-205 | Edit Active Only | Edit POI | Cannot edit deleted POIs | High |
| BR-206 | Delete Confirmation | Delete POI | Require confirmation dialog | High |
| BR-207 | Tour Warning on Delete | Delete POI in Tour | Show warning with affected Tour names | Medium |
| BR-208 | Soft Delete | Delete POI | Set deleted_at timestamp, don't remove data | High |
| BR-209 | Hide Deleted | Display POIs | Exclude deleted POIs from all lists | High |
| BR-210 | Image Limits | Upload images | Max 10 images, each ≤5MB, jpg/png/webp | High |
| BR-211 | Audio Limits | Upload audio | Max 50MB, mp3/wav format | High |
| BR-212 | Auto Compress | Image >2MB | Compress to target size | Low |
| BR-213 | Thumbnail Generation | Image uploaded | Generate 200x200 thumbnail | Medium |
| BR-214 | Metadata Storage | Media uploaded | Store size, dimensions, duration | Medium |
| BR-215 | Trigger Radius Range | Set radius | Must be 5-100 meters | High |
| BR-216 | Default Trigger Radius | Create POI | Default 15 meters if not specified | Low |

---

## 3. Tour Management Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-301 | POI in Multiple Tours | Add POI to Tour | Allow (M:N relationship) | Medium |
| BR-302 | Minimum POIs | Publish Tour | Require at least 2 POIs | High |
| BR-303 | Order Determines Route | Display Tour | POI order = suggested route | High |
| BR-304 | Active POIs Only | Add to Tour | Only active POIs can be added | High |
| BR-305 | Cascade POI Delete | POI deleted | Remove from all Tours, reorder remaining | High |
| BR-306 | Draft Status | Create Tour | New Tours start as DRAFT | Medium |
| BR-307 | Estimated Duration | Calculate | Sum of audio durations + walking time | Low |

---

## 4. Location & Trigger Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-401 | Show Active Only | Display on map | Only status=ACTIVE POIs visible | High |
| BR-402 | Center on User | Map loads | Center on user's current location | Medium |
| BR-403 | Offline Fallback | No internet | Show cached POI data | High |
| BR-404 | Background Audio | Screen locked | Continue audio playback | High |
| BR-405 | Pause on Call | Incoming call | Pause audio automatically | High |
| BR-406 | Resume After Call | Call ends | Resume audio playback | Medium |
| BR-501 | Permission Request | GPS needed | Request permission just-in-time | High |
| BR-502 | Update Frequency | Tracking active | Update every 5-10 seconds | High |
| BR-503 | High Accuracy | Location request | Use HIGH_ACCURACY mode | High |
| BR-504 | Background Tracking | App in background | Continue tracking | High |
| BR-505 | Default Trigger Radius | No custom value | Use 15 meters | Medium |
| BR-506 | Hysteresis | Just triggered POI | No re-trigger for 5 minutes | High |
| BR-507 | Overlap Resolution | Multiple POIs in range | Trigger closest POI only | High |
| BR-508 | User Preference | Auto-play setting | Respect user's auto-play toggle | Medium |
| BR-509 | QR Content | QR scanned | Contains POI ID or deep link | High |
| BR-510 | QR Validation | QR scanned | Validate format before processing | High |
| BR-511 | Invalid QR | Unknown POI ID | Show error message | Medium |

---

## 5. Language & Localization Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-601 | Auto Detect | First app open | Detect device language | Medium |
| BR-602 | Fallback Language | Translation missing | Show Vietnamese content | High |
| BR-603 | Save Preference | Language changed | Store in local storage | High |
| BR-604 | Hot Reload | Language switched | Reload content without app restart | Medium |
| BR-605 | Missing Translation Indicator | Content in fallback | Show "(Content in Vietnamese)" | Low |

---

## 6. Cache & Offline Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-606 | Sync on Connect | Internet restored | Sync data in background | High |
| BR-607 | Offline Indicator | No internet | Show "Offline" badge | High |
| BR-608 | Cache Expiry | Cached data | Expire after 7 days | Medium |
| BR-609 | Download on View | Image/audio accessed | Cache for offline use | Medium |
| BR-610 | Cache Size Limit | Cache grows | Limit to 500MB, LRU eviction | Low |

---

## 7. Analytics & Audit Rules

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-701 | Audit Admin Actions | Create/Update/Delete | Log action with user, timestamp | High |
| BR-702 | Track POI Views | User views POI | Log POI ID, timestamp, session | Medium |
| BR-703 | Track Audio Completion | Audio finishes | Log completion rate | Medium |
| BR-704 | Track Geofence Enter | User enters zone | Log POI, time, action (play/skip) | Medium |

---

## 8. Rule Priority Legend

| Priority | Meaning | Enforcement |
|----------|---------|-------------|
| **High** | Critical for functionality | Must implement, block on violation |
| **Medium** | Important for UX | Should implement, warn on violation |
| **Low** | Nice to have | Can defer, soft guidance |

---

## 9. Rule Validation Summary

| Category | High | Medium | Low | Total |
|----------|------|--------|-----|-------|
| Authentication | 5 | 1 | 0 | 6 |
| POI Management | 10 | 3 | 3 | 16 |
| Tour Management | 3 | 3 | 1 | 7 |
| Location & Trigger | 12 | 4 | 0 | 16 |
| Language | 2 | 2 | 1 | 5 |
| Cache & Offline | 2 | 2 | 1 | 5 |
| Analytics | 1 | 3 | 0 | 4 |
| **Total** | **35** | **18** | **6** | **59** |

---

> **Reference:** `PRDs/00_requirements_intake.md`, `05_functional_requirements.md`
