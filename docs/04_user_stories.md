# 📝 User Stories
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 2.0  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-02-08  
> **Format:** INVEST (Independent, Negotiable, Valuable, Estimable, Small, Testable)

---

## Tổng quan Epics

| Epic | Mô tả | Stories |
|------|-------|---------|
| Epic 1 | Xác thực Admin | 3 |
| Epic 2 | Quản lý POI | 10 |
| Epic 3 | Quản lý Tour | 6 |
| Epic 4 | Tourist App - Core | 9 |
| Epic 5 | Tourist App - Location | 5 |
| Epic 6 | Tourist App - Settings | 3 |
| Epic 7 | Analytics & Reports | 3 |

---

## 1. Epic 1: Xác thực Admin (Authentication)

### US-101: Đăng nhập Admin
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | đăng nhập vào hệ thống bằng username/password |
| **So that** | tôi có thể truy cập và quản lý nội dung |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-001 |

**Acceptance Criteria:** See AC-101

---

### US-102: Đăng xuất Admin
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | đăng xuất khỏi hệ thống |
| **So that** | tài khoản của tôi được bảo mật khi rời khỏi máy tính |
| **Priority** | P0 |
| **Story Points** | 1 |

---

### US-103: Session Timeout
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | được thông báo khi session sắp hết hạn |
| **So that** | tôi có thể lưu công việc trước khi bị logout tự động |
| **Priority** | P1 |
| **Story Points** | 2 |

---

## 2. Epic 2: Quản lý POI (POI Management)

### US-201: Xem danh sách POIs
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xem danh sách tất cả POIs với phân trang |
| **So that** | tôi có cái nhìn tổng quan về tất cả điểm tham quan |
| **Priority** | P0 |
| **Story Points** | 3 |

---

### US-202: Tìm kiếm và lọc POIs
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | tìm kiếm POI theo tên và lọc theo category/status |
| **So that** | tôi có thể nhanh chóng tìm POI cần chỉnh sửa |
| **Priority** | P1 |
| **Story Points** | 3 |

---

### US-203: Tạo POI mới
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | tạo một POI mới với thông tin cơ bản (tên, mô tả, vị trí) |
| **So that** | du khách có thể xem thông tin về điểm tham quan này |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Refs** | AD-002 |

**Acceptance Criteria:** See AC-201

---

### US-204: Chỉnh sửa POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | chỉnh sửa thông tin của một POI đã có |
| **So that** | tôi có thể cập nhật nội dung khi cần thiết |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-003 |

---

### US-205: Xóa POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xóa một POI không còn sử dụng |
| **So that** | hệ thống không hiển thị POI đã lỗi thời |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Refs** | AD-004 |

**Acceptance Criteria:** See AC-203

---

### US-206: Đặt POI trên bản đồ
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | chọn vị trí POI bằng cách click trên bản đồ hoặc nhập tọa độ |
| **So that** | POI được định vị chính xác cho tính năng GPS trigger |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Refs** | AD-005 |

---

### US-207: Phân loại POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | gán loại (Chính/Phụ) cho POI |
| **So that** | du khách biết đâu là điểm tham quan chính |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Refs** | AD-006 |

---

### US-208: Upload hình ảnh cho POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | upload nhiều hình ảnh cho một POI |
| **So that** | du khách có thể xem hình ảnh về địa điểm |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-013 |

---

### US-209: Upload audio cho POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | upload file audio thuyết minh cho POI |
| **So that** | du khách có thể nghe audio guide khi đến địa điểm |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-014 |

---

### US-210: Nội dung đa ngôn ngữ
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | nhập nội dung POI bằng nhiều ngôn ngữ (VN/EN) |
| **So that** | du khách quốc tế có thể đọc/nghe bằng ngôn ngữ của họ |
| **Priority** | P1 |
| **Story Points** | 5 |
| **Refs** | AD-015 |

---

## 3. Epic 3: Quản lý Tour (Tour Management)

### US-301: Xem danh sách Tours
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xem tất cả Tours dạng lưới với thumbnail |
| **So that** | tôi có thể quản lý các tour đã tạo |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Refs** | AD-011 |

---

### US-302: Tạo Tour mới
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | tạo một Tour mới với tên và mô tả |
| **So that** | du khách có thể chọn tour để tham quan theo lộ trình |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-007 |

---

### US-303: Chỉnh sửa Tour
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | chỉnh sửa thông tin Tour (tên, mô tả, thumbnail) |
| **So that** | tôi có thể cập nhật thông tin Tour khi cần |
| **Priority** | P0 |
| **Story Points** | 2 |

---

### US-304: Thêm POIs vào Tour
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | thêm nhiều POIs vào một Tour |
| **So that** | Tour có đầy đủ các điểm tham quan |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | AD-008 |

---

### US-305: Sắp xếp thứ tự POIs trong Tour
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | thay đổi thứ tự các POIs trong Tour bằng drag & drop |
| **So that** | lộ trình tour hợp lý và tối ưu cho du khách |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Refs** | AD-009 |

---

### US-306: Xóa Tour
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xóa một Tour không còn sử dụng |
| **So that** | du khách không thấy Tour đã lỗi thời |
| **Priority** | P1 |
| **Story Points** | 2 |
| **Refs** | AD-010 |

---

## 4. Epic 4: Tourist App - Core Features

### US-401: Xem POIs trên bản đồ
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | xem tất cả POIs trên bản đồ với markers |
| **So that** | tôi biết các điểm tham quan xung quanh |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Refs** | TA-001 |

---

### US-402: Xem chi tiết POI
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | tap vào marker để xem thông tin chi tiết của POI |
| **So that** | tôi có thể đọc mô tả và xem hình ảnh |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | TA-002 |

---

### US-403: Đọc nội dung văn bản POI
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | đọc mô tả văn bản về POI |
| **So that** | tôi hiểu được lịch sử và ý nghĩa mà không cần nghe audio |
| **Priority** | P0 |
| **Story Points** | 2 |
| **Refs** | TA-003 |

---

### US-404: Xem gallery hình ảnh POI
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | swipe qua các hình ảnh của POI |
| **So that** | tôi có thể xem tất cả hình ảnh đẹp của địa điểm |
| **Priority** | P0 |
| **Story Points** | 3 |

---

### US-405: Phát audio thuyết minh
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | nghe audio thuyết minh về POI |
| **So that** | tôi có thể hiểu về lịch sử và ý nghĩa của địa điểm |
| **Priority** | P0 |
| **Story Points** | 5 |
| **Refs** | TA-004 |

---

### US-406: Điều khiển audio
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | play, pause, và seek audio |
| **So that** | tôi có thể kiểm soát việc nghe thuyết minh theo ý muốn |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | TA-008 |

---

### US-407: Chọn Tour để tham quan
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | chọn một Tour từ danh sách có sẵn |
| **So that** | tôi có thể tham quan theo lộ trình gợi ý |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Refs** | TA-010 |

---

### US-408: Theo dõi tiến trình Tour
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | xem tiến trình các POI đã tham quan trong Tour |
| **So that** | tôi biết mình đang ở đâu trong lộ trình |
| **Priority** | P1 |
| **Story Points** | 3 |
| **Refs** | TA-011 |

---

### US-409: Xem chỉ dẫn đến POI
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | xem hướng và khoảng cách đến POI tiếp theo |
| **So that** | tôi có thể di chuyển đúng hướng |
| **Priority** | P1 |
| **Story Points** | 3 |

---

## 5. Epic 5: Tourist App - Location Service

### US-501: Auto-trigger audio theo vị trí
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | audio tự động thông báo khi tôi đến gần POI |
| **So that** | tôi không cần thao tác thủ công |
| **Priority** | P0 |
| **Story Points** | 8 |
| **Refs** | TA-005 |

**Acceptance Criteria:** See AC-404

---

### US-502: Xử lý vùng giao thoa POI
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | khi ở giữa 2 POI, hệ thống chọn POI gần nhất |
| **So that** | tôi không bị nhầm lẫn giữa các nội dung |
| **Priority** | P1 |
| **Story Points** | 5 |

---

### US-503: Quét QR fallback
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | quét mã QR tại POI để mở nội dung |
| **So that** | tôi vẫn có thể truy cập nội dung khi GPS không chính xác |
| **Priority** | P1 |
| **Story Points** | 5 |
| **Refs** | TA-006 |

---

### US-504: Chế độ Offline
| Field | Value |
|-------|-------|
| **As a** | Du khách quốc tế |
| **I want to** | sử dụng app khi không có internet |
| **So that** | tôi vẫn tham quan được khi không có data roaming |
| **Priority** | P1 |
| **Story Points** | 8 |
| **Refs** | TA-012 |

---

### US-505: Background audio playback
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | audio tiếp tục phát khi tôi minimize app hoặc lock màn hình |
| **So that** | tôi có thể vừa đi vừa nghe mà không cần mở app |
| **Priority** | P0 |
| **Story Points** | 3 |

---

## 6. Epic 6: Tourist App - Settings & Preferences

### US-601: Chọn ngôn ngữ
| Field | Value |
|-------|-------|
| **As a** | Du khách quốc tế |
| **I want to** | chọn ngôn ngữ hiển thị (VN hoặc EN) |
| **So that** | tôi có thể đọc/nghe nội dung bằng ngôn ngữ tôi hiểu |
| **Priority** | P0 |
| **Story Points** | 3 |
| **Refs** | TA-007 |

---

### US-602: Bật/tắt auto-play audio
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | tắt tính năng tự động phát audio |
| **So that** | tôi có thể tham quan yên tĩnh nếu muốn |
| **Priority** | P1 |
| **Story Points** | 2 |

---

### US-603: Xem lịch sử POI đã tham quan
| Field | Value |
|-------|-------|
| **As a** | Du khách |
| **I want to** | xem danh sách POI tôi đã tham quan trong ngày |
| **So that** | tôi có thể review lại nội dung nếu cần |
| **Priority** | P2 |
| **Story Points** | 3 |

---

## 7. Epic 7: Analytics & Reports (Admin)

### US-701: Xem thống kê lượt xem POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xem thống kê lượt xem của từng POI |
| **So that** | tôi biết POI nào được quan tâm nhất |
| **Priority** | P2 |
| **Story Points** | 5 |
| **Refs** | AD-018 |

---

### US-702: Xem thống kê hoàn thành audio
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xem tỷ lệ người dùng nghe hết audio |
| **So that** | tôi đánh giá được chất lượng nội dung |
| **Priority** | P2 |
| **Story Points** | 3 |

---

### US-703: Xem dashboard tổng quan
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | xem dashboard với các metrics quan trọng |
| **So that** | tôi nắm được tình hình hoạt động của hệ thống |
| **Priority** | P2 |
| **Story Points** | 5 |

---

## 8. Story Map Overview

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                              GPS TOURS - USER STORY MAP                             │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ADMIN DASHBOARD                                                                    │
│  ════════════════════════════════════════════════════════════                       │
│                                                                                     │
│  Epic 1: Auth     Epic 2: POI Management           Epic 3: Tour       Epic 7       │
│  ─────────────    ───────────────────────          ───────────        ─────────    │
│  US-101 Login     US-201 List POIs                 US-301 List Tours  US-701 Stats │
│  US-102 Logout    US-202 Search/Filter             US-302 Create      US-702 Audio │
│  US-103 Timeout   US-203 Create POI                US-303 Edit        US-703 Dash  │
│                   US-204 Edit POI                  US-304 Add POIs                 │
│                   US-205 Delete POI                US-305 Reorder                  │
│                   US-206 Map Picker                US-306 Delete                   │
│                   US-207 Categorize                                                │
│                   US-208 Upload Images                                             │
│                   US-209 Upload Audio                                              │
│                   US-210 Multi-language                                            │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  TOURIST APP                                                                        │
│  ════════════════════════════════════════════════════════════                       │
│                                                                                     │
│  Epic 4: Core             Epic 5: Location          Epic 6: Settings               │
│  ────────────────         ─────────────────         ────────────────               │
│  US-401 View Map          US-501 Auto-trigger       US-601 Language                │
│  US-402 POI Detail        US-502 Overlap Handle     US-602 Auto-play toggle        │
│  US-403 Read Text         US-503 QR Fallback        US-603 History                 │
│  US-404 Image Gallery     US-504 Offline Mode                                      │
│  US-405 Play Audio        US-505 Background Play                                   │
│  US-406 Audio Controls                                                             │
│  US-407 Select Tour                                                                │
│  US-408 Tour Progress                                                              │
│  US-409 Directions                                                                 │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Story Points Summary

| Epic | Description | Stories | Total Points | Priority Mix |
|------|-------------|---------|--------------|--------------|
| Epic 1 | Admin Auth | 3 | 6 | P0/P1 |
| Epic 2 | POI Management | 10 | 34 | P0/P1 |
| Epic 3 | Tour Management | 6 | 16 | P0/P1 |
| Epic 4 | Tourist Core | 9 | 30 | P0/P1 |
| Epic 5 | Location Service | 5 | 29 | P0/P1 |
| Epic 6 | Settings | 3 | 8 | P0/P1/P2 |
| Epic 7 | Analytics | 3 | 13 | P2 |
| **Total** | | **39** | **136** | |

---

## 10. Priority Breakdown

| Priority | Stories | Points | % of Total |
|----------|---------|--------|------------|
| **P0** (MVP Core) | 20 | 72 | 53% |
| **P1** (MVP if time) | 14 | 48 | 35% |
| **P2** (Post-MVP) | 5 | 16 | 12% |
| **P3** (Future) | 0 | 0 | 0% |

**Velocity estimate:** 20-25 points/sprint → ~5-6 sprints for full MVP

---

## 11. MVP Scope (P0 Stories Only)

### Sprint 1-2: Foundation (40 points)
- Epic 1: US-101, US-102 (Auth)
- Epic 2: US-201, US-203, US-204, US-205, US-206, US-208, US-209 (Core POI)
- Epic 4: US-401 (Map)

### Sprint 3-4: Core Features (32 points)
- Epic 3: US-302, US-303, US-304 (Tour basics)
- Epic 4: US-402, US-403, US-404, US-405, US-406 (POI viewing/audio)
- Epic 5: US-501, US-505 (Location trigger, background)
- Epic 6: US-601 (Language)

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 5, 6
