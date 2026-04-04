# Business Rules
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-04-04

---

## Rule Type Legend

| Type | Ký hiệu | Mô tả | Ví dụ |
|------|----------|-------|-------|
| **Constraint** | | Ràng buộc dữ liệu, validation | "Password ≥ 8 ký tự" |
| **Computation** | | Tính toán, chuyển đổi giá trị | "Hash password bằng bcrypt" |
| **Trigger** | | Hành động tự động khi sự kiện xảy ra | "Lock account sau 5 lần sai" |
| **Inference** | | Suy luận, quyết định logic | "Chọn POI gần nhất nếu overlap" |

---

## 1. Authentication Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-101 | Username Format | Constraint | Username entered | Validate: 3-50 chars, alphanumeric + email | Return 400 + "Invalid username format" | FR-101 |
| BR-102 | Password Hashing | Computation | User created / password changed | Hash with bcrypt (cost factor 12) | — (server-side only) | FR-101 |
| BR-103 | Login Lockout | Trigger | 5 failed login attempts in 15 min | Lock account for 15 minutes | Return 423 + "Account locked, try after {time}" | FR-101 |
| BR-104 | Access Token Expiry | Constraint | Token created | Expires in 15 minutes | Return 401 + trigger auto-refresh | FR-102 |
| BR-105 | Refresh Token Expiry | Constraint | Token created | Expires in 7 days | Return 401 + redirect to login | FR-102 |
| BR-106 | Auto-Refresh | Trigger | Access token < 5 min remaining | Auto-refresh using refresh token | If refresh fails → force logout | FR-102 |
| BR-107 | Session Invalidation | Trigger | User logs out | Invalidate refresh token | — | FR-102 |
| BR-108 | Reset Link Expiry | Constraint | Reset link created | Expire after 1 hour | Return 400 + "Reset link expired" | FR-103 |
| BR-109 | Single-use Reset | Trigger | Reset link used | Invalidate immediately (set used_at) | Return 400 + "Link already used" | FR-103 |
| BR-110 | Password History | Constraint | Password changed | Cannot reuse last 3 passwords | Return 422 + "Cannot reuse recent passwords" | FR-103 |

---

## 2. POI Management Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-201 | Unique POI Name | Constraint | Create/Update POI | Name must be unique (case-insensitive) | Return 409 + "POI name already exists" | FR-201 |
| BR-202 | Required Fields | Constraint | Create POI | Require: name_vi, description_vi, lat, lng, category | Return 400 + list missing fields | FR-201 |
| BR-203 | Coordinate Validation | Constraint | Set location | Latitude: -90 to 90, Longitude: -180 to 180 | Return 400 + "Invalid coordinates" | FR-201 |
| BR-204 | Coordinate Bounds | Constraint | Set location | Must be within configured region bounds | Return 422 + "Location outside service area" | FR-204 |
| BR-205 | Edit Active Only | Constraint | Edit POI | Cannot edit deleted POIs | Return 422 + "Cannot edit deleted POI" | FR-202 |
| BR-206 | Delete Confirmation | Inference | Delete POI | Require confirmation dialog | Show confirm modal trước khi gọi API | FR-203 |
| BR-207 | Tour Warning on Delete | Inference | Delete POI in Tour | Show warning with affected Tour names | Show warning + list Tours bị ảnh hưởng | FR-203 |
| BR-208 | Soft Delete | Trigger | Delete POI | Set deleted_at timestamp, don't remove data | — (server-side) | FR-203 |
| BR-209 | Hide Deleted | Constraint | Display POIs | Exclude deleted POIs from all lists | — (query filter) | FR-203 |
| BR-210 | Image Limits | Constraint | Upload images | Max 10 images, each ≤5MB, jpg/png/webp | Return 400 + "File too large / wrong type / max reached" | FR-205 |
| BR-211 | Audio Limits | Constraint | Upload audio | Max 50MB, mp3/wav format | Return 400 + "File too large / wrong format" | FR-205 |
| BR-212 | Auto Compress | Computation | Image >2MB | Compress to target ≤2MB | If compress fails → keep original | FR-205 |
| BR-213 | Thumbnail Generation | Computation | Image uploaded | Generate 200×200 thumbnail | If generation fails → use original as thumb | FR-205 |
| BR-214 | Metadata Storage | Computation | Media uploaded | Store size, dimensions, duration | — | FR-205 |
| BR-215 | Trigger Radius Range | Constraint | Set radius | Must be 5-100 meters | Return 400 + "Radius must be 5-100m" | FR-201 |
| BR-216 | Default Trigger Radius | Computation | Create POI, no radius specified | Default to 15 meters | — | FR-201 |
| BR-217 | Default Draft Status | Trigger | POI created | Status = DRAFT by default | — | FR-207 |
| BR-218 | Publish Requirements | Constraint | Publish POI | Must have name + description + location | Return 422 + "Missing required fields for publish" | FR-207 |
| BR-219 | Unpublish Warning | Inference | Unpublish POI in Tour | Show warning with affected Tours | Show warning modal + list Tours | FR-207 |
| BR-220 | Legacy Category Remap | Computation | DB vẫn còn POI cũ (MAIN/SUB) sau migration | Script `apps/api/prisma/scripts/migrate-poi-categories.ts` remap theo keyword priority: Cultural (chua, temple, museum) → Outdoor (cau, river, park) → Experiences (workshop, class) → Markets (cho, market, specialty, souvenir) → Bars (bar, pub, cocktail) → Cafes (ca phe, coffee, dessert) → Street Food (street food, via he, xe day, oc, banh). Không match → giữ nguyên `Dining`. | Log lại để Admin kiểm tra thủ công trước/ sau khi apply | FR-201 |

---

## 3. Tour Management Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-301 | POI in Multiple Tours | Constraint | Add POI to Tour | Allow (M:N relationship) | — | FR-302 |
| BR-302 | Minimum POIs | Constraint | Publish Tour | Require at least 2 POIs | Return 422 + "Tour must have ≥2 POIs" | FR-302 |
| BR-303 | Order Determines Route | Inference | Display Tour | POI order = suggested route | — | FR-302 |
| BR-304 | Active POIs Only | Constraint | Add to Tour | Only active (published) POIs can be added | Return 422 + "POI is not published" | FR-302 |
| BR-305 | Cascade POI Remove | Trigger | POI deleted/unpublished | Remove from all Tours, reorder remaining | Notify Admin về Tours bị ảnh hưởng | FR-302 |
| BR-306 | Draft Status | Trigger | Create Tour | New Tours start as DRAFT | — | FR-301 |
| BR-307 | Estimated Duration | Computation | Tour POIs changed | Sum of audio durations + estimated walking time | If no audio → show "N/A" | FR-301 |

---

## 4. Map & Audio Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-401 | Show Active Only | Constraint | Display on map | Only status=ACTIVE POIs visible | — | FR-401 |
| BR-402 | Center on User | Trigger | Map loads | Center on user's current location | If no GPS → center on default area | FR-401 |
| BR-403 | Offline Fallback | Inference | No internet | Show cached POI data | Show "Offline" badge + cached data | FR-602 |
| BR-404 | Background Audio | Constraint | Screen locked | Continue audio playback | — | FR-403 |
| BR-405 | Pause on Call | Trigger | Incoming call | Pause audio automatically | — | FR-403 |
| BR-406 | Resume After Call | Trigger | Call ends | Resume audio playback | — | FR-403 |

---

## 5. Location & Trigger Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-501 | Permission Request | Trigger | GPS needed | Request permission just-in-time với lý do | If denied → switch to QR-only mode | FR-505 |
| BR-502 | Update Frequency | Constraint | GPS tracking active | Update every 5-10 seconds | If battery low → reduce to 30s | FR-501 |
| BR-503 | High Accuracy | Constraint | Location request | Use HIGH_ACCURACY mode | Fallback to BALANCED nếu indoor | FR-501 |
| BR-504 | Background Tracking | Constraint | App in background | Continue GPS tracking | Respect OS background limits | FR-501 |
| BR-506 | Hysteresis (Cooldown) | Constraint | Just triggered POI | No re-trigger for 5 minutes | — | FR-502 |
| BR-507 | Criteria Engine — Overlap Resolution | Inference | Multiple POIs in range simultaneously | Tính điểm từng POI theo công thức: `score = priority×0.30 + distanceScore×0.30 + notPlayedBonus×0.25 + autoPlayScore×0.15`. Chọn POI có điểm cao nhất. Chỉ trigger nếu POI đó chưa được play trong session hiện tại. | — | FR-502 |
| BR-508 | User Preference | Constraint | Auto-play setting OFF | Show notification only, don't auto-play | — | FR-502 |
| BR-509 | QR Content | Constraint | QR scanned | Must contain valid POI ID or deep link | Return error nếu format sai | FR-503 |
| BR-510 | QR Validation | Computation | QR scanned | Parse and validate format before processing | Show "Invalid QR" nếu không parse được | FR-503 |
| BR-511 | Invalid QR | Trigger | Unknown POI ID from QR | Show "POI not found" error | Suggest nearby POIs instead | FR-503 |

---

## 6. Language & Localization Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-601 | Auto Detect | Computation | First app open | Detect device language (VI/EN/ZH); default VI nếu không match | Default to VI | FR-601 |
| BR-602 | Fallback Language | Inference | Translation missing | Show Vietnamese content as fallback | Show "(Nội dung bằng Tiếng Việt)" | FR-601 |
| BR-603 | Save Preference | Trigger | Language changed | Store in AsyncStorage ('app_language') | — | FR-601 |
| BR-604 | Hot Reload | Trigger | Language switched | Reload content + switch audio player sang ngôn ngữ mới | Show loading indicator | FR-601 |
| BR-605 | Audio Language Match | Inference | Language switched | Tìm PoiMedia type=AUDIO language=VI/EN/ZH; nếu không có thì dùng language=ALL | Fallback to ALL | FR-601 |

---

## 7. Cache & Offline Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-606 | Sync on Connect | Trigger | Internet restored | Sync data in background | If conflict → server wins | FR-602 |
| BR-607 | Offline Indicator | Trigger | No internet detected | Show "Offline" badge in UI | — | FR-602 |
| BR-608 | Cache Expiry | Constraint | Cached data | Expire after 7 days | Re-fetch on next connection | FR-602 |
| BR-609 | Download on View | Trigger | Image/audio accessed first time | Cache for offline use | If storage full → LRU eviction | FR-602 |
| BR-610 | Cache Size Limit | Constraint | Cache grows | Limit to 500MB, LRU eviction | Warn user before evicting | FR-602 |

---

## 8. Analytics & Audit Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-701 | Audit Admin Actions | Trigger | Admin Create/Update/Delete | Log action, user_id, timestamp, entity | — | — |
| BR-702 | Track POI Views | Trigger | Tourist views POI | Log POI ID, timestamp, session, device | Không log nếu Admin preview | FR-402 |
| BR-703 | Track Audio Completion | Computation | Audio finishes | Calculate and log completion rate (%) | — | FR-403 |
| BR-704 | Track Geofence Enter | Trigger | User enters trigger zone | Log POI, distance, time, action (accept/skip) | — | FR-502 |
| BR-705 | Log All Triggers | Trigger | GPS/QR trigger fires | Log trigger_type + user_action to Trigger_Log | — | FR-502 |

---

## 9. Tourist User Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-801 | Anonymous Usage | Constraint | First app open | Create device-based session, no login required | — | FR-504 |
| BR-802 | Optional Login | Inference | Tourist uses app | Login only required for sync/favorites | Show "Login to save" prompt | — |
| BR-803 | Device Data Merge | Trigger | Login after anonymous use | Merge device history + favorites to account | If conflict → keep most recent | — |
| BR-804 | Favorite Unique | Constraint | Add favorite | One per POI per user (unique constraint) | Return 409 + "Already in favorites" | — |
| BR-805 | Social Login | Constraint | Tourist registers | Support Google, Facebook, Apple OAuth | Fallback to email registration | — |

---

## 10. QR Code Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-901 | QR Auto-deactivate | Trigger | POI deleted/unpublished | Set QR is_active = false | — | FR-503 |
| BR-902 | QR Reactivate | Trigger | POI re-published | Set QR is_active = true | — | FR-503 |
| BR-903 | QR Scan Counter | Computation | QR scanned successfully | Increment scan_count + update last_scanned_at | — | FR-503 |
| BR-904 | QR Deep Link Format | Constraint | QR generated | Format: `https://gpstours.app/poi/{poi_id}` | — | FR-503 |

---

## 11. Shop Owner Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-1001 | POI Requires Admin Approval | Constraint | Shop Owner tạo POI | POI của Shop Owner mặc định status=DRAFT; cần Admin đổi sang ACTIVE để hiển thị trên Tourist App | — | FR-702 |
| BR-1001b | Self Registration | Constraint | Shop Owner registers | No Admin approval needed for account, self-service | — | FR-701 |
| BR-1002 | Unique Email | Constraint | Register Shop Owner | Email must be unique across all users | Return 409 + "Email already exists" | FR-701 |
| BR-1003 | Data Isolation | Constraint | Shop Owner accesses POIs | Filter by owner_id = current user | Return 403 + "Access denied" nếu truy cập POI người khác | FR-702 |
| BR-1004 | Owner Delete Permission | Constraint | Shop Owner attempts delete | Allow delete when the authenticated user owns the POI, otherwise block | Return 403 + "Only the owner or an Admin can delete POIs" | FR-702 |
| BR-1005 | Analytics Scoping | Constraint | Shop Owner views analytics | Show only own POI(s) metrics | Return 403 nếu truy cập system analytics | FR-704 |
| BR-1006 | Multiple POIs | Constraint | Shop Owner creates POI | Allow owning multiple POIs | — | FR-702 |

---

## 12. TTS Generation Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-TTS01 | Voice Mapping | Computation | TTS requested | Map language → msedge-tts voice: VI→vi-VN-HoaiMyNeural, EN→en-US-AriaNeural, ZH→zh-CN-XiaoxiaoNeural | Return 400 nếu language không hợp lệ | FR-209 |
| BR-TTS02 | Description Required | Constraint | TTS requested | POI phải có nội dung mô tả cho ngôn ngữ được chọn (descriptionVi/descriptionEn/descriptionZh) | Return 400 + "No [language] description to convert" | FR-209 |
| BR-TTS03 | Replace Existing Audio | Trigger | TTS generated | Nếu đã có PoiMedia (type=AUDIO, language=X): xóa record cũ, tạo record mới | — | FR-209 |
| BR-TTS04 | Owner Check | Constraint | Shop Owner calls TTS | Kiểm tra poi.ownerId === currentUserId | Return 403 nếu không phải chủ POI | FR-209 |
| BR-TTS05 | File Storage | Computation | TTS audio generated | Lưu file MP3 vào /uploads/; tạo PoiMedia record với url, sizeBytes, originalName | Return 500 nếu ghi file thất bại | FR-209 |

---

## 13. Device Capability Check Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-DEVICE01 | GPS Required | Constraint | App startup | Kiểm tra Location permission; nếu chưa có → request | Hiển thị màn hình DeviceCheck với hướng dẫn cấp quyền | FR-600 |
| BR-DEVICE02 | Internet Required | Constraint | App startup | Kiểm tra isConnected && isInternetReachable qua expo-network | Hiển thị màn hình DeviceCheck với hướng dẫn bật WiFi/4G | FR-600 |
| BR-DEVICE03 | Block On Fail | Trigger | Any check fails | Chặn không cho vào app; hiển thị màn hình DeviceCheck với icon, mô tả, nút "Kiểm tra lại" | — | FR-600 |
| BR-DEVICE04 | Open Settings | Trigger | User cần cấp quyền thủ công | Nút "Mở cài đặt thiết bị" → Linking.openSettings() | — | FR-600 |
| BR-DEVICE05 | Auto Proceed | Trigger | All checks pass | Tự động navigate sang (tabs)/map screen | — | FR-600 |

---

## 14. Criteria Engine Rules

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-CE01 | Scoring Formula | Computation | Multiple POIs in trigger range | `score = (priority/5)×0.30 + (1-dist/radius)×0.30 + notPlayed×0.25 + autoPlay×0.15` | — | FR-502 |
| BR-CE02 | Priority Normalization | Computation | Calculate priority score | priority field (1–5) normalized: priorityScore = priority / 5 | Default priority=1 nếu null | FR-502 |
| BR-CE03 | Distance Score | Computation | Calculate distance score | distanceScore = max(0, 1 − distance / triggerRadius). Closer = higher score | 0 nếu distance > radius | FR-502 |
| BR-CE04 | Not Played Bonus | Inference | POI chưa được play trong session | notPlayedBonus = 1.0 nếu poiId không có trong triggeredPoiIds; 0.0 nếu đã play | — | FR-502 |
| BR-CE05 | AutoPlay Score | Inference | poi.autoPlay flag | autoPlayScore = 1.0 nếu autoPlay=true, 0.0 nếu false | Default true nếu null | FR-502 |
| BR-CE06 | Single Winner | Constraint | Scoring complete | Chỉ POI có score cao nhất được trigger; không trigger đồng thời nhiều POI | — | FR-502 |
| BR-CE07 | Already Played Skip | Constraint | Best POI đã trong triggeredPoiIds | Không re-trigger; giữ audio hiện tại | — | FR-502 |
| BR-CE08 | Exit Resets | Trigger | User rời khỏi vùng trigger | Xóa poiId khỏi triggeredPoiIds; POI có thể trigger lại khi user quay lại | — | FR-502 |

---

## 16. Rule Type Legend

| Type | Ký hiệu | Mô tả | Số lượng |
|------|----------|-------|----------|
| **Constraint** | | Ràng buộc, validation, giới hạn | 39 |
| **Computation** | | Tính toán, chuyển đổi, xử lý | 13 |
| **Trigger** | | Hành động tự động khi event xảy ra | 23 |
| **Inference** | | Suy luận, quyết định logic | 7 |

## 13. Rule Priority Legend

| Priority | Meaning | Enforcement |
|----------|---------|-------------|
| **High** | Critical for functionality | Must implement, block on violation |
| **Medium** | Important for UX | Should implement, warn on violation |
| **Low** | Nice to have | Can defer, soft guidance |

---

## 14. Rule Validation Summary

| Category | | | | | Total |
|----------|-----|-----|-----|-----|-------|
| 1. Authentication | 4 | 1 | 3 | 0 | **10** |
| 2. POI Management | 10 | 5 | 2 | 3 | **20** |
| 3. Tour Management | 2 | 1 | 2 | 1 | **7** |
| 4. Map & Audio | 1 | 0 | 3 | 1 | **6** |
| 5. Location & Trigger | 5 | 1 | 1 | 1 | **10** |
| 6. Language | 0 | 1 | 2 | 2 | **5** |
| 7. Cache & Offline | 2 | 0 | 3 | 0 | **5** |
| 8. Analytics & Audit | 0 | 1 | 4 | 0 | **5** |
| 9. Tourist User | 2 | 0 | 1 | 1 | **5** |
| 10. QR Code | 1 | 1 | 2 | 0 | **4** |
| **11. Shop Owner** | **6** | **0** | **0** | **0** | **6** |
| **Total** | **33** | **11** | **23** | **9** | **83** |

---

> **Reference:** `PRDs/00_requirements_intake.md`, `05_functional_requirements.md`, `08_data_requirements.md`

---

## 15. Delta Rules v3.1

| ID | Rule Name | Type | Condition | Action | Exception (Khi vi phạm) | FR Ref |
|----|-----------|------|-----------|--------|--------------------------|--------|
| BR-1101 | Translation target whitelist | Constraint | Gọi translate API | Chỉ cho phép ngôn ngữ nằm trong supported_languages | 400 nếu target không hợp lệ | FR-807 |
| BR-1102 | Translation retry | Trigger | Translate lỗi tạm thời | Retry với backoff tối đa 3 lần | Trả lỗi 503 nếu vẫn fail | FR-807 |
| BR-1103 | Custom tour ownership | Constraint | Tourist update/delete tour | Chỉ thao tác trên tour do chính user tạo | 403 Forbidden | FR-805 |
| BR-1104 | Custom tour size limit | Constraint | Tạo/sửa custom tour | Tối thiểu 1 POI, tối đa 20 POIs/tour | 422 Validation error | FR-805 |
| BR-1105 | Password reset token TTL | Constraint | Tạo token reset | Hết hạn sau 1 giờ | Token expired | FR-103 |
| BR-1106 | Revoked token reject immediately | Trigger | Access/refresh token đã revoke | Từ chối request ngay | 401 Unauthorized | FR-102 |

