# 📋 Business Rules
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh — Step 2

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-11  
> **Cập nhật:** 2026-02-14  
> **Ref:** Step 2 Low-code (UI + Flow + Rule)

---

## 1. Authentication

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-01 | Login Lockout | IF 5 failed attempts in 15 min | THEN lock account 15 min | High |
| BR-02 | Password Hashing | IF user created/password changed | THEN hash with bcrypt (cost 12) | High |
| BR-03 | Access Token Expiry | IF token created | THEN expires in 15 min | High |
| BR-04 | Refresh Token Expiry | IF token created | THEN expires in 7 days | High |
| BR-05 | Auto-Refresh | IF access token < 5 min remaining | THEN auto-refresh, if fail → logout | Medium |
| BR-06 | Reset Link Single-use | IF reset link used | THEN invalidate immediately | High |
| BR-07 | Reset Link Expiry | IF reset link created | THEN expires 1 hour | High |
| BR-08 | Password History | IF password changed | THEN cannot reuse last 3 passwords | Medium |
| BR-09 | Unified Registration | IF new user registers | THEN single endpoint handles Tourist + Shop Owner | Medium |

---

## 2. POI Management

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-10 | Unique POI Name | IF create/update POI | THEN name must be unique (case-insensitive) | High |
| BR-11 | Required Fields | IF create POI | THEN require: name_vi, description_vi, lat, lng, category | High |
| BR-12 | Coordinate Bounds | IF set location | THEN must be within service area | High |
| BR-13 | Image Limits | IF upload images | THEN max 10 files, each ≤ 5MB, JPEG/PNG/WebP only | Medium |
| BR-14 | Audio Limits | IF upload audio | THEN max 50MB, MP3/WAV only | Medium |
| BR-15 | Default Draft | IF POI created | THEN status = DRAFT by default | Medium |
| BR-16 | Publish Requirements | IF publish POI | THEN must have name + description + location | High |
| BR-17 | Soft Delete | IF delete POI | THEN set status='archived', keep data | High |
| BR-18 | Cascade Warning | IF delete POI in Tour | THEN warn with affected Tour names, require double confirm | High |
| BR-19 | Trigger Radius | IF set radius | THEN 5-100m range, default 15m | Medium |
| BR-20 | Auto Compress | IF image > 2MB | THEN compress to ≤ 2MB target | Low |
| BR-21 | Thumbnail Generation | IF image uploaded | THEN generate 200×200 thumbnail | Low |

---

## 3. Tour Management

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-22 | Minimum POIs | IF publish Tour | THEN require ≥ 2 POIs | High |
| BR-23 | Active POIs Only | IF add POI to Tour | THEN only published POIs allowed | High |
| BR-24 | POI Multi-Tour | IF add POI to Tour | THEN allow same POI in multiple Tours (M:N) | Medium |
| BR-25 | Order = Route | IF display Tour | THEN POI order = suggested walking route | Medium |
| BR-26 | Duration Calc | IF Tour POIs changed | THEN recalculate estimated_duration | Low |
| BR-27 | Cascade Remove | IF POI deleted/unpublished | THEN auto-remove from all Tours, reorder | High |

---

## 4. Map & Audio

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-28 | Active Only on Map | IF display on tourist map | THEN only status=published POIs | High |
| BR-29 | Center on User | IF map loads | THEN center on user's GPS position | Medium |
| BR-30 | Background Audio | IF screen locked | THEN continue audio playback | Medium |
| BR-31 | Pause on Call | IF incoming phone call | THEN pause audio, resume after | Medium |
| BR-32 | Singleton Audio | IF audio is playing AND another POI audio triggered | THEN instantly pause previous audio and play new audio | High |

---

## 5. Location & Trigger

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-33 | GPS Interval | IF tracking active | THEN update every 5-10 seconds | High |
| BR-34 | Accuracy Filter | IF GPS accuracy > 10m | THEN keep previous position | Medium |
| BR-35 | Trigger on Enter | IF distance ≤ trigger_radius | THEN auto-show POI content | High |
| BR-36 | Cooldown | IF POI just triggered | THEN no re-trigger for 5 minutes | High |
| BR-37 | Overlap Priority | IF 2+ POIs in range | THEN trigger closest, show others in list | High |
| BR-38 | Category Priority | IF overlap + same distance | THEN use taxonomy priority (Cultural > Outdoor > Experiences > Markets > Bars > Cafes > Street Food > Dining) | Medium |
| BR-39 | QR Fallback Offline (TH1) | IF QR scanned AND POI data small (no audio) | THEN load text from SQLite without network | High |
| BR-40 | QR Fallback Online (TH2) | IF QR scanned AND POI data large (has audio/video) | THEN prompt user for network connection before load | High |

---

## 6. Shop Owner

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-41 | Data Isolation | IF SO queries POIs | THEN only return POIs where owner_id = current SO | High |
| BR-42 | No Delete | IF SO attempts delete | THEN deny, only Admin can delete | High |
| BR-43 | Auto Owner | IF SO creates POI | THEN auto-set owner_id = current SO | High |
| BR-44 | Analytics Scoped | IF SO views analytics | THEN only show stats for own POIs | High |

---

## 7. Tourist

| ID | Rule Name | Condition | Action | Priority |
|----|-----------|-----------|--------|----------|
| BR-45 | Login for Favorites | IF Tourist adds favorite without login | THEN prompt login dialog | Medium |
| BR-46 | Toggle Favorite | IF Tourist taps ❤️ | THEN toggle ON/OFF (upsert/delete) | Medium |
| BR-47 | Auto History | IF Tourist views POI / audio plays | THEN log to view_history | Low |
| BR-48 | Language Fallback | IF selected language content null | THEN fallback to Vietnamese | Medium |
| BR-49 | GPS Permission | IF GPS needed | THEN request just-in-time with reason | High |
| BR-50 | Auto Profile Update | IF Tourist logs in | THEN trigger profile synchronization automatically | Medium |

---

## Tổng kết

| Module | Rules | High Priority |
|--------|-------|---------------|
| Authentication | 9 (BR-01~09) | 5 |
| POI Management | 12 (BR-10~21) | 5 |
| Tour Management | 6 (BR-22~27) | 3 |
| Map & Audio | 5 (BR-28~32) | 2 |
| Location & Trigger | 8 (BR-33~40) | 6 |
| Shop Owner | 4 (BR-41~44) | 4 |
| Tourist | 6 (BR-45~50) | 1 |
| **Tổng** | **50 rules** | **26 High** |
