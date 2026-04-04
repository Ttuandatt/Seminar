# 📋 Scope Definition
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-04-04

---

## 1. Project Boundaries

### 1.1 Các thành phần hệ thống

```
┌─────────────────────────────────────────────────────────────┐
│                      GPS TOURS SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌─────────────────┐            │
│  │ Admin Dashboard │◄───────►│   Backend API   │            │
│  │     (Web)       │         │   (REST/JSON)   │            │
│  └─────────────────┘         └────────┬────────┘            │
│                                       │                     │
│                              ┌────────▼────────┐            │
│                              │    Database     │            │
│                              │  (PostgreSQL)   │            │
│                              └────────┬────────┘            │ 
│                                       │                     │
│  ┌─────────────────┐         ┌────────▼────────┐            │
│  │   Tourist App   │◄───────►│  File Storage   │            │
│  │  (Mobile/PWA)   │         │ (Images/Audio)  │            │
│  └─────────────────┘         └─────────────────┘            │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. In Scope (MVP)

### 2.1 Admin Dashboard

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| AD-001 | Đăng nhập Admin | P0 | Login với username/password |
| AD-002 | Tạo POI mới | P0 | CRUD POI với name, description, location |
| AD-003 | Chỉnh sửa POI | P0 | Update tất cả fields |
| AD-004 | Xóa POI | P0 | Soft delete với confirmation |
| AD-005 | Đặt POI trên bản đồ | P0 | Click hoặc nhập tọa độ |
| AD-006 | Phân loại POI | P1 | Primary/Secondary |
| AD-007 | Tạo Tour | P0 | CRUD Tour |
| AD-008 | Thêm POIs vào Tour | P0 | Select multiple POIs |
| AD-009 | Sắp xếp POIs | P1 | Drag & drop |
| AD-010 | POI Draft/Publish | P1 | Status workflow (Draft → Published) |
| AD-011 | Password Reset | P1 | Forgot password via email |
| AD-012 | Preview POI | P1 | Preview as Tourist before publish |
| AD-013 | Upload hình ảnh | P0 | Multiple images/POI |
| AD-014 | Upload audio | P0 | Audio file/POI |
| AD-015 | Nội dung đa ngôn ngữ | P1 | 11 ngôn ngữ (VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU) |
| AD-016 | TTS Audio Generation | P1 | Tạo audio từ mô tả văn bản bằng msedge-tts (11 ngôn ngữ) |
| AD-017 | Criteria Engine (Admin config) | P1 | Xem/cấu hình thuật toán chọn POI khi vùng phát âm thanh trùng nhau |
| AD-018 | Map View tổng quan | P1 | Leaflet map hiển thị tất cả POIs, filter status, xem route Tour, legend categories |
| AD-019 | Analytics Dashboard | P1 | User statistics, lượt xem/audio plays, export CSV |

### 2.2 Shop Owner Dashboard

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| SO-001 | Đăng ký Shop Owner | P1 | Self-registration với thông tin quán |
| SO-002 | Đăng nhập Shop Owner | P1 | Login với email/password |
| SO-003 | Quản lý POI của mình | P1 | CRUD POI(s) thuộc sở hữu (Create, Edit, Delete) |
| SO-004 | Upload media | P1 | Ảnh + audio (11 ngôn ngữ) giới thiệu quán |
| SO-005 | Xem analytics | P1 | Lượt xem, audio plays của POI(s) mình |
| SO-006 | Cập nhật profile | P1 | Thông tin shop owner (tên, địa chỉ, SĐT) |
| SO-007 | TTS Audio Generation | P1 | Tạo audio TTS từ nội dung mô tả POI (VI/EN) |

### 2.3 Tourist App (Mobile)

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| TA-001 | Xem POIs trên bản đồ | P0 | Map với markers |
| TA-002 | Xem chi tiết POI | P0 | Detail page |
| TA-003 | Đọc nội dung POI | P0 | Text description |
| TA-004 | Phát audio | P0 | Audio player |
| TA-005 | Auto-trigger theo GPS | P0 | Geofence enter |
| TA-006 | Quét QR fallback | P1 | Manual trigger |
| TA-007 | Chọn ngôn ngữ | P0 | 11 ngôn ngữ switch — thay đổi cả text và audio |
| TA-008 | Điều khiển audio | P0 | Play/Pause/Seek |
| TA-009 | Onboarding flow | P1 | First-time user guide |
| TA-010 | Chọn Tour | P1 | Tour selection |
| TA-011 | Đăng ký/Đăng nhập | P1 | Chọn role (Tourist/Shop Owner) khi register |
| TA-012 | Chế độ Offline | P1 | Cached data |
| TA-013 | Favorites | P1 | Save/unsave POIs |
| TA-014 | View History | P1 | Xem lịch sử POIs đã xem |
| TA-015 | Landing Page | P1 | Trang đón khách full-screen với background image, nút “Bắt đầu hành trình” + “Đã có tài khoản” |
| TA-016 | Device Capability Check | P1 | Kiểm tra GPS và Internet khi khởi động — chặn nếu thiếu yêu cầu |
| TA-017 | Criteria Engine (Mobile) | P1 | Khi nhiều POI trùng vùng GPS, chọn POI tốt nhất theo thuật toán scoring (priority + distance + not-played + autoPlay) |
| TA-018 | Audio Queue (Singleton) | P0 | Global AudioContext quản lý 1 audio player duy nhất, auto-stop khi chuyển POI, seek/pause/resume |
| TA-019 | i18n UI Strings | P1 | Quốc tế hóa giao diện app (i18next) — labels, buttons, messages chuyển ngôn ngữ cùng POI content |
| TA-020 | Custom Tour CRUD | P1 | Tạo/Xem/Sửa/Xóa tour tùy chỉnh (2-15 POI, auto-duration via Haversine) |
| TA-021 | Runtime Translation | P1 | Dịch nội dung POI sang ngôn ngữ khác tại thời gian thực trên mobile |

### 2.4 Backend

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| BE-001 | RESTful API | P0 | CRUD operations |
| BE-002 | Admin Authentication | P0 | JWT tokens (Admin) |
| BE-003 | File storage | P0 | S3/Azure Blob |
| BE-004 | PostgreSQL + PostGIS | P0 | Geospatial queries |
| BE-005 | Tourist Auth (Optional) | P1 | JWT + Social Login (Google/Facebook/Apple) |
| BE-005b | Shop Owner Auth | P1 | JWT + Email-based registration |
| BE-006 | CDN | P1 | Media delivery |
| BE-007 | QR Code Management | P1 | Generate, validate, track scans |
| BE-008 | Trigger Logging | P1 | GPS/QR trigger event logging |
| BE-009 | Password Reset | P1 | Email-based reset flow |
| BE-010 | Rate limiting | P1 | API protection |
| BE-011 | TTS Service | P1 | msedge-tts: synthesize audio VI (vi-VN-HoaiMyNeural) / EN (en-US-AriaNeural) / ZH (zh-CN-XiaoxiaoNeural) |
| BE-012 | Translation Service | P1 | Google Translate API - translate, batch translate, list languages (11 ngôn ngữ) |
| BE-013 | TTS Auto-Translate | P1 | Sinh audio TTS kèm dịch tự động (text → translate → synthesize) |
| BE-014 | Merchant Management | P1 | Admin CRUD tài khoản Shop Owner |
| BE-015 | Custom Tour API | P1 | Tourist CRUD tour tùy chỉnh với tự tính thời gian |

---

## 3. Out of Scope (MVP)

### 3.1 Explicitly Excluded

| Feature | Reason | Future Phase |
|---------|--------|--------------|
| AR (Augmented Reality) | High complexity, research needed | Phase 3+ |
| Booking/Payment | Requires partners, legal | Phase 2+ |
| Social features (comments/reviews) | Nice-to-have | Phase 2+ |
| Chatbot AI | Separate project scope | Phase 3+ |
| Multi-tenant | Requires different architecture | Phase 2+ |
| Gamification | Nice-to-have | Phase 3+ |
| E-commerce | Out of core scope | Never |
| Native iOS/Android separate | Cross-platform preferred | Never |

### 3.2 Deferred (Post-MVP)

| Feature | Priority | Notes |
|---------|----------|-------|
| Content versioning | P2 | Version history, rollback |
| Batch operations | P2 | Bulk CRUD |
| Audio speed control | P2 | 0.5x-2x |
| Pre-download content | P2 | Offline Tour download |
| Push notifications | P3 | Future |

---

## 4. Feature Priority Matrix

### 4.1 Priority Definition

| Priority | Meaning | Timeline |
|----------|---------|----------|
| **P0** | Critical - MVP must have | Sprint 1-2 |
| **P1** | High - MVP if time allows | Sprint 2-3 |
| **P2** | Medium - Post-MVP | Phase 2 |
| **P3** | Low - Future roadmap | Phase 3+ |

### 4.2 Summary

| Priority | Admin | Tourist | Backend | Total |
|----------|-------|---------|---------|-------|
| **P0** | 10 | 7 | 5 | **22** |
| **P1** | 10 | 10 | 8 | **28** |
| **P2** | 4 | 2 | 3 | **9** |
| **P3** | 0 | 1 | 0 | **1** |

**MVP Core (v3.1):** 22 P0 features + 28 P1 features = **50 features**

---

## 5. Assumptions

| ID | Assumption | If False |
|----|------------|----------|
| A001 | Backend APIs sẽ ready đúng hạn | Frontend delay |
| A002 | GPS accuracy ±5m là đủ | Cần BLE beacons |
| A003 | Khoảng cách POIs > 10m | Xử lý overlap phức tạp |
| A004 | Content sẽ được cung cấp đúng hạn | Dùng mock content |
| A005 | Users có 4G ổn định | Offline mode quan trọng hơn |

---

## 6. Constraints

### Technical Constraints

| Constraint | Description |
|------------|-------------|
| **Frontend** | React 19, TypeScript 5, Vite 7, Tailwind CSS 4 |
| **Mobile** | Expo SDK 54, React Native 0.81 |
| **Backend** | NestJS 11 (Node.js + TypeScript) |
| **ORM** | Prisma 5 |
| **Database** | PostgreSQL 15 + PostGIS |
| **Maps** | react-native-maps (Mobile), Google Maps (Admin) |
| **Hosting** | Docker (local dev) |

### Business Constraints

| Constraint | Description |
|------------|-------------|
| Timeline | MVP trong 8-10 tuần |
| Team size | Small team (2-3 devs) |
| Budget | Limited |
| Languages | VI/EN/ZH |

---

## 7. Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Backend API | Internal | Dev team | ✅ Complete (10 modules, ~50 endpoints) |
| Map API Key | External | Ops | ✅ Using default provider (Google Maps on Android) |
| Content creation | Content | Content Team | 🔲 Pending (using test data) |
| Audio recording | Content | Content Team | 🔲 Pending (AudioPlayer component ready) |
| UI/UX Design | Internal | Design | ✅ Implemented (Admin + Mobile) |
| Infrastructure | Internal | DevOps | ✅ Docker (PostgreSQL + Redis) |

---

## 8. Scope Change Management

### 8.1 Change Request Process

```
┌────────────────┐    ┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ Request Change │───►│ Impact Analysis│───►│ PO Decision    │───►│ Update Docs    │
│ (Any member)   │    │ (Tech Lead)    │    │ (Approve/Deny) │    │ (BA/PM)        │
└────────────────┘    └────────────────┘    └────────────────┘    └────────────────┘
```

### 8.2 Change Authority

| Change Type | Approver | Timeline Impact |
|-------------|----------|-----------------|
| **P0 Feature removal** | Product Owner + Stakeholder | Major |
| **P1 Feature change** | Product Owner | Medium |
| **P2/P3 Deferral** | Tech Lead | Minor |
| **Bug fix thêm scope** | Tech Lead | None |

### 8.3 Change Evaluation Criteria

| Factor | Weight | Questions |
|--------|--------|-----------|
| Timeline impact | 30% | Delay bao nhiêu? |
| Resource impact | 25% | Cần thêm người? |
| Technical debt | 20% | Tạo tech debt? |
| User value | 25% | User benefit cao? |

---

## 9. MVP Completion Criteria

### 9.1 Definition of Done (DoD)

| Category | Criteria |
|----------|----------|
| **Code** | Code review passed, unit tests >70% |
| **Testing** | E2E tests passed, UAT completed |
| **Docs** | API docs updated, README updated |
| **Deploy** | Staging deployment successful |
| **Security** | No Critical/High vulnerabilities |

### 9.2 MVP Feature Checklist

| Component | P0 Done | P1 Done | Total |
|-----------|---------|---------|-------|
| Admin Dashboard | 10/10 ✅ | 4/4 ✅ | 14/14 |
| Shop Owner Dashboard | 0/0 ✅ | 6/6 ✅ | 6/6 |
| Tourist App | 7/7 ✅ | 4/4 ✅ | 11/11 |
| Backend | 5/5 ✅ | 2/2 ✅ | 7/7 |
| **Total** | **22/22** ✅ | **16/16** ✅ | **38/38** ✅ |

### 9.3 MVP Success Metrics (Launch Ready)

| Metric | Target | Actual |
|--------|--------|--------|
| All P0 features complete | 22/22 | 22/22 (100%) ✅ |
| All P1 features complete | 16/16 | 16/16 (100%) ✅ |
| Critical bugs | 0 | 0 ✅ |
| API response time p95 | <500ms | ~100ms (local) |
| Test coverage | >70% | TBD |
| Security scan clean | Pass | TBD |

---

## 10. Data Scope (MVP)

### 10.1 Geographic Scope

| Parameter | Value |
|-----------|-------|
| **Địa điểm MVP** | Phố Ẩm thực Vĩnh Khánh, Quận 4, TP.HCM |
| **Phạm vi địa lý** | ~1km² |
| **Số khu vực (zones)** | 1 zone |

### 10.2 Content Volume

| Entity | MVP Target | Max Capacity |
|--------|------------|--------------|
| **POIs** | 20-50 | 500 |
| **Tours** | 3-5 | 50 |
| **Audio files** | 220-550 (11 lang × POIs) | 5,500 |
| **Images** | 60-150 (3/POI) | 5,000 |

### 10.3 User Scope

| Parameter | MVP Target |
|-----------|------------|
| **Admin users** | 3-5 |
| **Tourist users** | 100-500 |
| **Concurrent users** | 50 |
| **Languages** | 11 ngôn ngữ (VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU) |

---

## 11. Cross-References

| Document | Section | Relationship |
|----------|---------|--------------|
| `00_requirements_intake.md` | Section 1, 6 | Input requirements |
| `03_user_personas_roles.md` | All | User definitions |
| `04_user_stories.md` | Epic 1-4 | Feature details |
| `05_functional_requirements.md` | All | Technical specs |
| `07_non_functional_requirements.md` | All | Performance targets |
| `12_technical_constraints.md` | All | Tech limitations |
| `13_dependencies_risks.md` | All | Risk assessment |

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 1.2, 6

