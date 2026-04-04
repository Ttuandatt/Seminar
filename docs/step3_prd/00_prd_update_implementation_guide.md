# PRD Update Implementation Guide
## GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Mục đích:** Hướng dẫn chi tiết để cập nhật TẤT CẢ tài liệu PRD cho khớp với code thực tế
> **Ngày phân tích:** 2026-04-04
> **Nguồn so sánh:** Codebase `apps/api`, `apps/admin`, `apps/mobile` vs `docs/step3_prd/`

---

## MỤC LỤC

1. [Tổng quan tình trạng](#1-tổng-quan-tình-trạng)
2. [Chi tiết từng tài liệu](#2-chi-tiết-từng-tài-liệu)
3. [Thứ tự thực hiện](#3-thứ-tự-thực-hiện)
4. [Hướng dẫn thực thi cho AI Agent](#4-hướng-dẫn-thực-thi-cho-ai-agent)

---

## 1. Tổng quan tình trạng

### Bảng đánh giá nhanh

| # | Tài liệu | Version hiện tại | Cập nhật lần cuối | Mức độ lỗi thời | Ưu tiên |
|---|----------|-----------------|-------------------|-----------------|---------|
| 01 | Executive Summary | 3.1 | 2026-04-04 | 🟢 Thấp | P2 |
| 02 | Scope Definition | 3.1 | 2026-04-04 | 🟢 Thấp | P2 |
| 03 | User Personas & Roles | 3.1 | 2026-04-04 | 🟢 Thấp | P2 |
| **04** | **User Stories** | **2.2** | **2026-02-18** | **🔴 Rất cao** | **P0** |
| 05 | Functional Requirements | 3.0 | 2026-03-22 | 🟡 Trung bình | P1 |
| **06** | **Acceptance Criteria** | **2.1** | **2026-03-10** | **🔴 Rất cao** | **P0** |
| **07** | **Non-Functional Requirements** | **2.0** | **2026-02-10** | **🔴 Rất cao** | **P0** |
| 08 | Data Requirements | 3.0 | 2026-03-22 | 🟡 Trung bình | P1 |
| **09** | **API Specifications** | **3.0** | **2026-03-22** | **🟠 Cao** | **P0** |
| 10 | UI/UX Specifications | 3.1 | 2026-03-22 | 🟡 Trung bình | P1 |
| 11 | Business Rules | 3.0 | 2026-03-21 | 🟡 Trung bình | P1 |
| **12** | **Technical Constraints** | **2.2** | **2026-03-07** | **🟠 Cao** | **P0** |
| **13** | **Dependencies & Risks** | **2.0** | **2026-02-10** | **🔴 Rất cao** | **P0** |
| 14 | Use Case Diagram | 3.0 | 2026-03-22 | 🟡 Trung bình | P1 |
| 15 | Sequence Diagrams | - | - | 🟡 Trung bình | P1 |
| 16 | Activity Diagrams | - | - | 🟡 Trung bình | P1 |
| 17 | Component Diagram | 2.0 | 2026-03-22 | 🟡 Trung bình | P1 |

---

## 2. Chi tiết từng tài liệu

---

### 2.1. 📄 04_user_stories.md — 🔴 CẦN CẬP NHẬT GẤP

**Version hiện tại:** 2.2 (2026-02-18) → **Cần nâng lên:** 3.1
**Lý do:** Lỗi thời 45+ ngày, thiếu nhiều feature đã implement

#### GAP ANALYSIS

| Gap ID | Loại | Mô tả | Mức độ |
|--------|------|--------|--------|
| US-G01 | **THIẾU** | Không có Epic cho TTS (Text-to-Speech) | Critical |
| US-G02 | **THIẾU** | Không có Epic cho Translation (Dịch đa ngôn ngữ) | Critical |
| US-G03 | **THIẾU** | Không có user stories cho Custom Tour (Tourist tự tạo tour) | Critical |
| US-G04 | **THIẾU** | Không có user stories cho Tourist Registration/Login | High |
| US-G05 | **THIẾU** | Không có user stories cho Tourist Favorites | High |
| US-G06 | **THIẾU** | Không có user stories cho Admin Map View (xem tổng quan POIs trên bản đồ) | High |
| US-G07 | **THIẾU** | Không có user stories cho QR Code Management (admin tạo/regenerate QR) | High |
| US-G08 | **SAI** | US-803 ghi "Không được xóa POI" — nhưng code cho phép Shop Owner soft delete POI | Medium |
| US-G09 | **THIẾU** | Không có user stories cho Merchant Management (admin CRUD merchants) | High |
| US-G10 | **SAI** | Priority US-603 (View History) = P2, nhưng đã implement và là P1 feature | Low |
| US-G11 | **THIẾU** | Không có user stories cho Profile Management (avatar upload, edit profile all roles) | Medium |
| US-G12 | **SAI** | Story Map diagram không có Shop Owner, TTS, Translation | Medium |
| US-G13 | **SAI** | Summary table ghi 57 stories / 187 points — sẽ thay đổi sau update | Low |
| US-G14 | **THIẾU** | Không có user stories cho Trigger Logging (GPS/QR/MANUAL tracking) | Medium |
| US-G15 | **THIẾU** | Không có user stories cho Shop Owner Dashboard (analytics overview) | Medium |

#### HƯỚNG DẪN CẬP NHẬT

**Thêm Epic mới:**

```markdown
## 9. Epic 9: TTS & Translation (Text-to-Speech & Dịch thuật)

### US-901: Tạo audio TTS cho POI
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | tạo audio thuyết minh tự động từ text mô tả POI bằng TTS engine |
| **So that** | không cần thu âm thủ công cho mỗi POI |
| **Priority** | P0 |
| **Story Points** | 5 |

### US-902: Tạo audio TTS đa ngôn ngữ
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | tạo audio TTS bằng nhiều ngôn ngữ cho một POI |
| **So that** | du khách quốc tế nghe được thuyết minh bằng ngôn ngữ của họ |
| **Priority** | P0 |
| **Story Points** | 5 |

### US-903: Xem danh sách giọng đọc TTS
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | chọn giọng đọc từ danh sách voices có sẵn |
| **So that** | tôi chọn được giọng phù hợp với nội dung |
| **Priority** | P1 |
| **Story Points** | 2 |

### US-904: Dịch nội dung POI sang ngôn ngữ khác
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | dịch tự động tên và mô tả POI sang nhiều ngôn ngữ |
| **So that** | du khách quốc tế đọc được nội dung bằng ngôn ngữ của họ |
| **Priority** | P0 |
| **Story Points** | 5 |

### US-905: Dịch hàng loạt (batch translation)
| Field | Value |
|-------|-------|
| **As a** | Admin |
| **I want to** | dịch nhiều trường nội dung cùng lúc |
| **So that** | tiết kiệm thời gian khi có nhiều POI cần dịch |
| **Priority** | P1 |
| **Story Points** | 3 |
```

```markdown
## 10. Epic 10: Custom Tour (Tourist tự tạo tour)

### US-1001: Tạo Custom Tour
| Field | Value |
|-------|-------|
| **As a** | Tourist (đã đăng nhập) |
| **I want to** | tạo tour riêng từ các POI tôi chọn |
| **So that** | tôi có lộ trình cá nhân phù hợp sở thích |
| **Priority** | P1 |
| **Story Points** | 5 |

### US-1002: Chỉnh sửa Custom Tour
(tương tự format...)

### US-1003: Xóa Custom Tour
### US-1004: Theo dõi Custom Tour trên bản đồ
```

```markdown
## 11. Epic 11: Merchant Management (Quản lý Merchant)

### US-1101: Xem danh sách Merchants
### US-1102: Tạo Merchant mới
### US-1103: Chỉnh sửa thông tin Merchant
### US-1104: Tìm kiếm Merchant
```

**Thêm vào Epic 4 (Tourist Core):**

```markdown
### US-410: Đăng ký tài khoản Tourist
| Priority | P1 | Story Points | 3 |

### US-411: Đăng nhập Tourist
| Priority | P1 | Story Points | 3 |

### US-412: Yêu thích POI (Favorites)
| Priority | P1 | Story Points | 3 |
```

**Thêm vào Epic 7 (Analytics):**

```markdown
### US-705: Admin Map View — Xem tổng quan POI trên bản đồ
| Priority | P1 | Story Points | 5 |
```

**Sửa lại:**
- US-803: Bỏ ghi chú "Không được xóa POI" → thêm "Shop Owner có thể soft delete POI của mình"
- Cập nhật Story Map diagram để bao gồm Epic 9, 10, 11
- Cập nhật Story Points Summary table
- Cập nhật Priority Breakdown table

---

### 2.2. 📄 06_acceptance_criteria.md — 🔴 CẦN CẬP NHẬT GẤP

**Version hiện tại:** 2.1 (2026-03-10) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| AC-G01 | Thiếu AC cho TTS generation (US-901, US-902, US-903) |
| AC-G02 | Thiếu AC cho Translation (US-904, US-905) |
| AC-G03 | Thiếu AC cho Custom Tour CRUD (US-1001-1004) |
| AC-G04 | Thiếu AC cho Tourist Registration/Login |
| AC-G05 | Thiếu AC cho Tourist Favorites |
| AC-G06 | Thiếu AC cho Admin Map View |
| AC-G07 | Thiếu AC cho QR Code Management |
| AC-G08 | Thiếu AC cho Merchant CRUD |
| AC-G09 | Thiếu AC cho Profile Management (all roles) |
| AC-G10 | Thiếu AC cho Shop Owner POI soft delete |
| AC-G11 | Thiếu AC cho Trigger Logging (GPS trigger accept/skip/dismiss) |
| AC-G12 | Thiếu AC cho Shop Owner Dashboard & Analytics |

#### HƯỚNG DẪN CẬP NHẬT

Thêm các AC mới theo format Gherkin. Ví dụ:

```gherkin
### AC-901: TTS Generation

Feature: Generate TTS Audio

Scenario: Successfully generate TTS audio for a POI
  Given I am logged in as Admin
  And a POI exists with Vietnamese description
  When I navigate to the POI edit page
  And I click "Generate TTS" for Vietnamese
  Then an audio file should be generated
  And the audio should be saved as POI media
  And I should see a success notification

Scenario: Generate translated TTS audio
  Given I am logged in as Admin
  And a POI exists with Vietnamese description
  When I select target language "English"
  And I click "Generate Translated TTS"
  Then the description should be translated to English
  And TTS audio in English should be generated
  And both text translation and audio should be saved
```

```gherkin
### AC-1001: Custom Tour Creation

Feature: Tourist Custom Tour

Scenario: Create custom tour
  Given I am logged in as Tourist
  And there are active POIs available
  When I tap "Create Custom Tour"
  And I enter tour name "My Food Tour"
  And I select 3 POIs from the list
  And I tap "Save"
  Then the custom tour should be created
  And it should appear in my tours list

Scenario: Cannot create custom tour without login
  Given I am not logged in
  When I try to access "Create Custom Tour"
  Then I should be prompted to login first
```

**Pattern cho mỗi AC mới:** Ghi ít nhất 2-3 scenarios (happy path + error cases + edge cases)

---

### 2.3. 📄 07_non_functional_requirements.md — 🔴 CẦN CẬP NHẬT GẤP

**Version hiện tại:** 2.0 (2026-02-10) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Section | Mô tả | Thay đổi cần thiết |
|--------|---------|--------|---------------------|
| NFR-G01 | Localization | Ghi "VN, EN" (2 ngôn ngữ) | Thực tế hỗ trợ 11 ngôn ngữ: VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU via Translation API |
| NFR-G02 | Performance | Thiếu TTS generation latency | Thêm: NFR-P009: TTS generation time < 5s per POI |
| NFR-G03 | Performance | Thiếu Translation API latency | Thêm: NFR-P010: Translation response < 3s per request |
| NFR-G04 | Security | Rate limiting ghi "100/200/300 req/min" | Chưa implement rate limiting — cần ghi rõ status hoặc adjust target |
| NFR-G05 | Security | Thiếu token revocation requirement | Thêm: NFR-SEC013: Revoked tokens must be rejected immediately |
| NFR-G06 | Security | Thiếu password reset token expiry | Thêm: NFR-SEC014: Password reset tokens expire after 1 hour |
| NFR-G07 | Compatibility | Chưa mention Expo SDK 54 | Update NFR-C004 với Expo SDK 54 cụ thể |
| NFR-G08 | Maintainability | Thiếu monorepo requirement | Thêm: NFR-M008: Shared packages via monorepo workspace |
| NFR-G09 | Monitoring | Chưa có Swagger/API docs requirement | Thêm: NFR-O006: Swagger/OpenAPI docs auto-generated |
| NFR-G10 | Performance | NFR-P008 ghi "1000 concurrent users" | Thực tế MVP target chỉ 50 concurrent users — cần điều chỉnh |
| NFR-G11 | Scalability | NFR-S004 ghi "500 concurrent audio streams" | Quá lớn cho MVP, điều chỉnh xuống 50-100 |
| NFR-G12 | Environmental | Thiếu TTS/Translation offline fallback | Thêm: NFR-E007: TTS/Translation requires internet connection |

#### HƯỚNG DẪN CẬP NHẬT

1. **Section 9 (Localization):** Thay `NFR-L002` supported languages từ "VN, EN" thành danh sách 11 ngôn ngữ, ghi rõ "via Google Translate API + Edge TTS"
2. **Section 1 (Performance):** Thêm NFR-P009 (TTS latency), NFR-P010 (Translation latency). Điều chỉnh NFR-P008 từ 1000 → 50 (MVP realistic target)
3. **Section 4 (Security):** Thêm NFR-SEC013 (token revocation), NFR-SEC014 (password reset expiry). Ghi note rate limiting chưa implement
4. **Section 3 (Scalability):** Điều chỉnh con số cho phù hợp MVP
5. **Section 8 (Maintainability):** Thêm monorepo, shared package requirement
6. **Section 12 (Monitoring):** Thêm Swagger docs requirement

---

### 2.4. 📄 09_api_specifications.md — 🟠 CẦN CẬP NHẬT

**Version hiện tại:** 3.0 (2026-03-22) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Mô tả | Endpoints thiếu/sai |
|--------|--------|---------------------|
| API-G01 | Thiếu Shop Owner POI endpoints chi tiết | `GET/POST/PUT/DELETE /shop-owner/pois`, `POST /shop-owner/pois/:id/media` |
| API-G02 | Thiếu Shop Owner Analytics endpoints | `GET /shop-owner/analytics/overview`, `GET /shop-owner/analytics/pois/:id` |
| API-G03 | Thiếu Shop Owner Profile endpoints | `GET/PUT /shop-owner/profile`, `POST /shop-owner/profile/avatar` |
| API-G04 | Thiếu Tourist Custom Tour endpoints | `GET/POST/PUT/DELETE /tourist/custom-tours`, stops management |
| API-G05 | Thiếu Tourist Favorites endpoints | `GET/POST/DELETE /tourist/favorites` |
| API-G06 | Thiếu Tourist View History endpoints | `GET /tourist/history` |
| API-G07 | Thiếu Tourist Profile endpoints | `GET/PUT /tourist/profile` |
| API-G08 | Thiếu Public search endpoint | `GET /public/pois/search?q=...&lat=...&lng=...` |
| API-G09 | Thiếu Public nearby endpoint | `GET /public/pois/nearby?lat=...&lng=...&radius=...` |
| API-G10 | Thiếu Public trigger log endpoint | `POST /public/trigger-log` |
| API-G11 | Thiếu Auth Register endpoint | `POST /auth/register` |
| API-G12 | Thiếu Auth Forgot/Reset Password | `POST /auth/forgot-password`, `POST /auth/reset-password` |
| API-G13 | Thiếu Merchant CRUD endpoints | `GET/POST/PUT/DELETE /merchants` |
| API-G14 | Thiếu Admin Analytics endpoints chi tiết | `GET /admin/analytics/overview`, `/top-pois`, `/trigger-stats` |
| API-G15 | Thiếu Profile endpoints | `GET/PUT /me`, `POST /me/avatar` |
| API-G16 | Thiếu QR endpoints chi tiết | `GET/POST /pois/:id/qr`, `GET /pois/:id/qr/download` |
| API-G17 | Thiếu Translation endpoints | `POST /translate`, `POST /translate/batch`, `GET /translate/languages` |
| API-G18 | Thiếu Supported Languages endpoint | `GET /tts/languages` |
| API-G19 | Thiếu Public QR validation | `GET /public/qr/validate/:code` |
| API-G20 | Thiếu Tour publish/unpublish | `PATCH /tours/:id/publish`, `PATCH /tours/:id/unpublish` |
| API-G21 | Thiếu Tour reorder stops | `PATCH /tours/:id/reorder` |

#### HƯỚNG DẪN CẬP NHẬT

Cho mỗi endpoint thiếu, document theo format sau:

```markdown
### METHOD /path

Description ngắn.

**Auth:** Bearer Token (Role: ADMIN/SHOP_OWNER/TOURIST/Public)

**Request:**
- Params: (nếu có)
- Query: (nếu có)
- Body: (JSON example)

**Response (2xx):**
```json
{ ... }
```

**Errors:**
- 4xx: mô tả
```

**Nguồn tham khảo để lấy request/response schema:**
- Backend controllers: `apps/api/src/*/**.controller.ts`
- Backend DTOs: `apps/api/src/*/dto/*.dto.ts`
- Swagger docs: Chạy `npm run start:dev` rồi vào `http://localhost:3000/api/docs`

**Ước lượng:** ~20 endpoint groups cần thêm, mỗi group ~15-30 dòng → ~400-600 dòng mới

---

### 2.5. 📄 12_technical_constraints.md — 🟠 CẦN CẬP NHẬT

**Version hiện tại:** 2.2 (2026-03-07) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Section | Sai/Thiếu | Cần sửa thành |
|--------|---------|-----------|----------------|
| TC-G01 | 1.1 Admin Web | Ghi "Google Maps" | Thực tế dùng **Leaflet + React Leaflet** (open source) |
| TC-G02 | 1.1 Admin Web | Ghi "shadcn/ui" | Thực tế **KHÔNG dùng shadcn/ui**, custom components with Tailwind |
| TC-G03 | 1.1 Admin Web | Ghi "Zustand" | Thực tế **KHÔNG dùng Zustand**, chỉ dùng TanStack Query + React Context |
| TC-G04 | 1.3 Backend | Ghi "With PostGIS extension" | Thực tế **KHÔNG dùng PostGIS**, dùng simple float lat/lng |
| TC-G05 | 1.3 Backend | Ghi "Redis 7.x" | Thực tế **KHÔNG dùng Redis** trong codebase hiện tại |
| TC-G06 | 1.3 Backend | Thiếu TTS engine | Thêm: **msedge-tts** — Microsoft Edge TTS engine |
| TC-G07 | 1.3 Backend | Thiếu Translation engine | Thêm: **google-translate-api-x** — Google Translate |
| TC-G08 | 1.3 Backend | Thiếu QR library | Thêm: **qrcode** — QR code generation |
| TC-G09 | 1.2 Mobile | Thiếu i18n framework | Thêm: **i18next + react-i18next** — internationalization |
| TC-G10 | 1.2 Mobile | Thiếu SQLite | Thêm: **expo-sqlite** — offline storage |
| TC-G11 | 1.2 Mobile | Thiếu Camera | Thêm: **expo-camera** — QR scanner |
| TC-G12 | General | Thiếu monorepo structure | Thêm: **packages/localization-shared** — shared library |
| TC-G13 | 1.4 DevOps | Ghi "Sentry" | Chưa thấy Sentry integration trong code — ghi note "Planned" |
| TC-G14 | 1.1 Admin Web | Version React ghi "19.x" | Cụ thể hóa: React **19.2.0**, Vite + Tailwind 4.1 |
| TC-G15 | 1.1 Admin Web | Thiếu Axios | Thêm: **axios 1.13** — HTTP client |
| TC-G16 | 1.3 Backend | Thiếu bcrypt | Thêm: **bcrypt** — password hashing |

#### HƯỚNG DẪN CẬP NHẬT

**Section 1.1 Admin Web — Sửa:**
```markdown
| Maps | Leaflet + React Leaflet | 1.9/5.0 | Open source maps (OpenStreetMap) |
| UI Components | Custom (Tailwind-based) | - | Không dùng component library |
| State | TanStack React Query | 5.90 | Server state management |
| HTTP Client | Axios | 1.13 | API communication |
```

**Section 1.3 Backend — Sửa:**
```markdown
| Database | PostgreSQL | 15+ | Simple float coordinates (không PostGIS) |
| Cache | ~~Redis~~ | - | Chưa implement (planned for Phase 2) |
| TTS Engine | msedge-tts | Latest | Microsoft Edge Text-to-Speech |
| Translation | google-translate-api-x | Latest | Google Translate API |
| QR Code | qrcode | Latest | QR code generation library |
| Password | bcrypt | Latest | Password hashing (cost 12) |
```

**Thêm Section 1.5 Shared Packages:**
```markdown
### 1.5 Shared Packages (Monorepo)

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| localization-shared | Reusable localization client, types, hooks | axios, @tanstack/react-query |
```

---

### 2.6. 📄 13_dependencies_risks.md — 🔴 CẦN CẬP NHẬT GẤP

**Version hiện tại:** 2.0 (2026-02-10) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Section | Mô tả |
|--------|---------|--------|
| DR-G01 | Dependencies | Hầu hết internal deps ghi "Not Started" nhưng thực tế đã DONE |
| DR-G02 | Dependencies | D001 UI/UX ghi "In Progress" → thực tế DONE |
| DR-G03 | Dependencies | D002 Backend API ghi "Not Started" → thực tế DONE (14 modules) |
| DR-G04 | Dependencies | D004 Audio ghi "Not Started" → thực tế DONE (TTS engine) |
| DR-G05 | Dependencies | D005 Infrastructure ghi "Not Started" → thực tế DONE (Render.com) |
| DR-G06 | External Deps | D101 ghi "Google/Mapbox" → Thực tế dùng OpenStreetMap (Leaflet) cho admin, native maps cho mobile |
| DR-G07 | External Deps | D102 Cloud Storage ghi "Pending" → Thực tế dùng local disk storage |
| DR-G08 | Risks | R004 ghi "PostGIS optimization" → Không dùng PostGIS |
| DR-G09 | Risks | R101 "Backend API delays" score 9 → Backend đã hoàn thành, risk resolved |
| DR-G10 | Risks | Thiếu risk cho TTS service reliability |
| DR-G11 | Risks | Thiếu risk cho Translation API quota/cost |
| DR-G12 | Risks | Thiếu risk cho msedge-tts dependency (unofficial library) |
| DR-G13 | Open Questions | OQ001 "Mapbox?" → Decided: Leaflet/OSM (admin), Native maps (mobile) |
| DR-G14 | Open Questions | OQ002 "Azure/AWS/GCP?" → Decided: Render.com |
| DR-G15 | Open Questions | Thiếu các quyết định mới: TTS engine, Translation API, QR strategy |
| DR-G16 | Critical Path | Ghi "6 weeks" → Cần update timeline thực tế |
| DR-G17 | Assumptions | A002 ghi "GPS ±5m" → Thực tế dùng configurable triggerRadius per POI |
| DR-G18 | Contingency | Outdated — nhiều scenarios đã resolve |

#### HƯỚNG DẪN CẬP NHẬT

**Section 1.1 Internal Dependencies — Update status:**
```markdown
| D001 | UI/UX Design | Design Team | Frontend | ✅ Done | 2026-03-22 |
| D002 | Backend API | Backend Team | Frontend | ✅ Done (14 modules) | 2026-03-22 |
| D003 | Content creation | Content Team | Demo | 🟡 In Progress | Seed data available |
| D004 | Audio recording | Content Team → TTS | Audio | ✅ Done (TTS engine) | 2026-03-15 |
| D005 | Infrastructure | DevOps | Deployment | ✅ Done (Render.com) | 2026-03-20 |
| D006 | Database design | Tech Lead | Backend | ✅ Done | 2026-02-15 |
```

**Section 1.2 External Dependencies — Update:**
```markdown
| D101 | Map tiles | OpenStreetMap | Maps display | ✅ Done | Free, no API key needed |
| D102 | File Storage | Local disk | Media upload | ✅ Done (local) | Cloud migration Phase 2 |
| D103 | Domain & SSL | Render.com | Production | 🟡 Pending | Using Render subdomain |
| D104 | CDN | - | Media perf | 🟡 Optional | Direct file serving for MVP |
| D105 | TTS Service | msedge-tts | Audio gen | ✅ Done | Free, unofficial library |
| D106 | Translation | google-translate-api-x | i18n | ✅ Done | Free tier, unofficial |
```

**Section 3.1 Technical Risks — Thêm mới + update:**
```markdown
| R009 | msedge-tts is unofficial library | Medium | High | 6 | Monitor for breaking changes; have fallback TTS option | Dev Lead |
| R010 | google-translate-api-x rate limiting/blocking | Medium | High | 6 | Cache translations; implement retry logic; consider official API | Backend |
| R011 | Local file storage not scalable | Low | Medium | 2 | Plan cloud migration (S3/Cloudflare R2) for Phase 2 | DevOps |
| R012 | No email service for password reset | Medium | Medium | 4 | Implement email service (SendGrid/Resend) or remove feature | Backend |
```

**Update R001 mitigation:** QR fallback đã implement ✅
**Update R004:** Bỏ "PostGIS" → "Simple lat/lng with Prisma float fields"
**Update R101:** Resolved ✅ — Backend 14 modules complete
**Update R007:** Implemented ✅ — owner_id filter active in shop-owner module

**Section 8 Open Questions — Update:**
```markdown
| OQ001 | Map provider? | ✅ Decided: Leaflet/OSM (admin), React Native Maps (mobile) |
| OQ002 | Cloud hosting? | ✅ Decided: Render.com |
| OQ007 | TTS engine? | ✅ Decided: msedge-tts (free, no API key) |
| OQ008 | Translation API? | ✅ Decided: google-translate-api-x |
| OQ009 | QR code strategy? | ✅ Decided: Auto-generate per POI, stored as URL |
| OQ010 | Offline strategy? | ✅ Decided: expo-sqlite for QR offline fallback |
| OQ011 | Email service? | 🔴 Open: Password reset generates token but no email delivery |
| OQ012 | Push notifications? | 🔴 Open: pushToken field exists but service not implemented |
```

---

### 2.7. 📄 05_functional_requirements.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 3.0 (2026-03-22) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| FR-G01 | Thiếu FR cho Custom Tour CRUD (Tourist) |
| FR-G02 | Thiếu FR cho Tourist Registration + Login flow |
| FR-G03 | Thiếu FR cho Tourist Favorites management |
| FR-G04 | Thiếu FR cho Merchant CRUD (Admin) |
| FR-G05 | Thiếu FR cho Translation service (single + batch) |
| FR-G06 | Thiếu FR cho Shop Owner Dashboard overview |
| FR-G07 | Thiếu FR cho Shop Owner POI soft delete |
| FR-G08 | Thiếu FR cho Trigger Logging (accept/skip/dismiss tracking) |
| FR-G09 | Thiếu FR cho Public API (search, nearby, QR validate) |

#### HƯỚNG DẪN CẬP NHẬT

Thêm các FR theo format hiện có (FR-xxx với Input/Process/Output/Business Rules). Tham khảo:
- `apps/api/src/tourists/tourists.controller.ts` cho Custom Tour + Favorites
- `apps/api/src/merchants/merchants.controller.ts` cho Merchant CRUD
- `apps/api/src/translate/translate.controller.ts` cho Translation
- `apps/api/src/public/public.controller.ts` cho Public APIs
- `apps/api/src/shop-owner/shop-owner.controller.ts` cho Shop Owner features

---

### 2.8. 📄 08_data_requirements.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 3.0 (2026-03-22) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| DR8-G01 | Kiểm tra entity SupportedLanguage đã document chưa — thực tế có table này |
| DR8-G02 | Kiểm tra PasswordResetToken + RevokedToken entities |
| DR8-G03 | Kiểm tra TourPoi pivot table fields mới: titleOverride, customIntro, estimatedStayMinutes, transitionNote, unlockRule |
| DR8-G04 | Kiểm tra TriggerLog entity (deviceId, poiId, triggerType, userAction) |
| DR8-G05 | Kiểm tra MediaLanguage enum values vs thực tế |
| DR8-G06 | Data volume estimates có thể cần cập nhật (11 languages × POIs = nhiều audio files hơn) |

#### HƯỚNG DẪN CẬP NHẬT

So sánh chi tiết `apps/api/prisma/schema.prisma` với nội dung file 08. Thêm/sửa mọi entity, field, enum không khớp.

---

### 2.9. 📄 10_ui_ux_specifications.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 3.1 (2026-03-22) → **Cần nâng lên:** 3.2

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| UI-G01 | Thiếu wireframe/spec cho Shop Owner Dashboard |
| UI-G02 | Thiếu wireframe/spec cho Shop Owner POI Form |
| UI-G03 | Thiếu wireframe/spec cho Shop Owner Analytics page |
| UI-G04 | Thiếu wireframe/spec cho Merchant Management pages (Admin) |
| UI-G05 | Thiếu wireframe/spec cho Custom Tour creation (Mobile) |
| UI-G06 | Thiếu wireframe/spec cho Tourist Favorites screen (Mobile) |
| UI-G07 | Thiếu wireframe/spec cho Tourist History screen (Mobile) |
| UI-G08 | Thiếu wireframe/spec cho QR Scanner screen (Mobile) |
| UI-G09 | Thiếu wireframe/spec cho Language Selection screen (Mobile) |
| UI-G10 | Thiếu wireframe/spec cho Onboarding flow (Mobile) |

#### HƯỚNG DẪN CẬP NHẬT

Thêm sections mới theo format hiện có (S## prefix). Mỗi screen cần:
- Screen name & route
- Wireframe (text-based hoặc mermaid diagram)
- Components list
- User interactions
- Responsive breakpoints (web) hoặc platform notes (mobile)

---

### 2.10. 📄 11_business_rules.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 3.0 (2026-03-21) → **Cần nâng lên:** 3.1

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| BR-G01 | Thiếu rules cho TTS generation (max length, language support, voice selection) |
| BR-G02 | Thiếu rules cho Translation (supported languages, cache policy, NER handling) |
| BR-G03 | Thiếu rules cho Custom Tour (max POIs, ownership validation) |
| BR-G04 | Thiếu rules cho Merchant-ShopOwner relationship |
| BR-G05 | Thiếu rules cho Password Reset flow (token expiry, single-use) |
| BR-G06 | Thiếu rules cho Tourist Favorites (max favorites? duplicate prevention) |

---

### 2.11. 📄 14_usecase_diagram.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 3.0 (2026-03-22)

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| UC-G01 | Thiếu use case cho TTS generation |
| UC-G02 | Thiếu use case cho Translation management |
| UC-G03 | Thiếu use case cho Custom Tour (Tourist) |
| UC-G04 | Thiếu use case cho Merchant Management |
| UC-G05 | Thiếu use case cho Tourist Registration/Login |
| UC-G06 | Thiếu use case cho Favorites/History |

---

### 2.12. 📄 15_sequence_diagrams.md + 16_activity_diagrams.md — 🟡 CẦN CẬP NHẬT

#### GAP ANALYSIS (cả 2 file)

| Gap ID | Mô tả |
|--------|--------|
| SD-G01 | Thiếu sequence diagram cho TTS generation flow |
| SD-G02 | Thiếu sequence diagram cho Translation flow |
| SD-G03 | Thiếu sequence diagram cho Custom Tour creation |
| SD-G04 | Thiếu sequence diagram cho Shop Owner POI management |
| SD-G05 | Thiếu sequence diagram cho QR scan → POI trigger |
| AD-G01 | Thiếu activity diagram cho TTS generation |
| AD-G02 | Thiếu activity diagram cho Translation workflow |
| AD-G03 | Thiếu activity diagram cho Custom Tour CRUD |

---

### 2.13. 📄 17_component_diagram.md — 🟡 CẦN CẬP NHẬT

**Version hiện tại:** 2.0 (2026-03-22)

#### GAP ANALYSIS

| Gap ID | Mô tả |
|--------|--------|
| CD-G01 | Kiểm tra TranslateModule đã có trong diagram chưa |
| CD-G02 | Kiểm tra SeedExportModule |
| CD-G03 | Kiểm tra packages/localization-shared trong architecture diagram |
| CD-G04 | Kiểm tra QR Module connections |
| CD-G05 | Update dependency diagram nếu thiếu module relationships |

---

### 2.14. 📄 01-03 (Executive Summary, Scope, Personas) — 🟢 ÍT CẦN CẬP NHẬT

Vừa cập nhật 2026-04-04, chủ yếu cần:
- Đảm bảo số liệu thống kê consistent với các file khác sau khi update
- Xác nhận feature count (43 MVP features) vẫn chính xác sau khi thêm features mới

---

## 3. Thứ tự thực hiện

### Phase 1: Critical (P0) — Làm trước

| Thứ tự | File | Ước lượng effort | Lý do ưu tiên |
|--------|------|-----------------|----------------|
| 1 | **04_user_stories.md** | Lớn (~200 dòng thêm) | Nền tảng cho mọi tài liệu khác |
| 2 | **12_technical_constraints.md** | Nhỏ (~50 dòng sửa) | Sai thông tin quan trọng (PostGIS, Redis, Maps) |
| 3 | **13_dependencies_risks.md** | Trung bình (~100 dòng sửa) | Status hoàn toàn lỗi thời |
| 4 | **07_non_functional_requirements.md** | Trung bình (~40 dòng thêm/sửa) | Targets không phù hợp MVP |
| 5 | **09_api_specifications.md** | Rất lớn (~500 dòng thêm) | Thiếu ~20 endpoint groups |

### Phase 2: High (P1) — Làm sau

| Thứ tự | File | Ước lượng effort |
|--------|------|-----------------|
| 6 | **06_acceptance_criteria.md** | Lớn (~300 dòng thêm) |
| 7 | **05_functional_requirements.md** | Trung bình (~150 dòng thêm) |
| 8 | **11_business_rules.md** | Nhỏ (~50 dòng thêm) |
| 9 | **08_data_requirements.md** | Nhỏ (~30 dòng sửa) |
| 10 | **14_usecase_diagram.md** | Trung bình (~100 dòng thêm) |

### Phase 3: Medium (P1-P2) — Làm cuối

| Thứ tự | File | Ước lượng effort |
|--------|------|-----------------|
| 11 | **17_component_diagram.md** | Nhỏ (~30 dòng sửa) |
| 12 | **15_sequence_diagrams.md** | Trung bình (~150 dòng thêm) |
| 13 | **16_activity_diagrams.md** | Trung bình (~100 dòng thêm) |
| 14 | **10_ui_ux_specifications.md** | Lớn (~200 dòng thêm) |
| 15 | **01-03 (Summary, Scope, Personas)** | Nhỏ (consistency check) |

---

## 4. Hướng dẫn thực thi cho AI Agent

### 4.1. Context cần biết

```
Project: GPS Tours & Phố Ẩm thực Vĩnh Khánh
Stack: NestJS 11 + Prisma 5 (backend), React 19 + Vite + Tailwind 4 (admin web), Expo SDK 54 (mobile)
Monorepo: apps/api, apps/admin, apps/mobile, packages/localization-shared
DB: PostgreSQL 15 (no PostGIS, simple float lat/lng)
Language: Vietnamese (tài liệu viết bằng tiếng Việt)
Version format: x.y (vd: 3.1)
All docs in: docs/step3_prd/
```

### 4.2. Quy tắc chung khi update

1. **Version bump:** Mỗi file update → tăng version lên 3.1 (hoặc +0.1 từ version hiện tại)
2. **Date update:** Đổi "Cập nhật" thành ngày hiện tại
3. **Ngôn ngữ:** Viết bằng tiếng Việt, thuật ngữ kỹ thuật giữ nguyên tiếng Anh
4. **Format:** Giữ nguyên format/style hiện có của mỗi file (tables, headings, code blocks)
5. **Cross-reference:** Khi thêm user story mới → cập nhật refs trong các file liên quan (AC, FR, UC)
6. **Consistency:** Đảm bảo số liệu (feature count, story points, endpoints) nhất quán giữa các file
7. **Source of truth:** Code trong `apps/` là source of truth. Nếu doc vs code conflict → follow code

### 4.3. Cách thực thi cho từng file

**Mỗi file cần:**
1. Đọc file hiện tại bằng Read tool
2. Đọc source code liên quan (controllers, services, DTOs, schema.prisma)
3. So sánh gaps theo danh sách trong guide này
4. Thêm nội dung mới / sửa nội dung sai
5. Update version + date
6. Cross-check references với các file khác

**Thứ tự dependencies:**
```
04_user_stories (base)
  → 06_acceptance_criteria (refs user stories)
  → 05_functional_requirements (refs user stories)
  → 14_usecase_diagram (refs user stories)
  → 15_sequence_diagrams (refs use cases)
  → 16_activity_diagrams (refs use cases)

12_technical_constraints (independent)
13_dependencies_risks (independent)
07_non_functional_requirements (independent)
09_api_specifications (refs backend controllers)
08_data_requirements (refs prisma schema)
11_business_rules (refs functional requirements)
17_component_diagram (refs technical constraints)
10_ui_ux_specifications (refs actual screens)
01-03 (final consistency check)
```

### 4.4. Verification checklist

Sau khi update xong TẤT CẢ files, verify:

- [ ] Tổng số user stories đúng ở 04, summary ở 01, scope ở 02
- [ ] Tổng số API endpoints đúng ở 09, component diagram ở 17
- [ ] Tổng số business rules đúng ở 11
- [ ] Tech stack nhất quán giữa 12 (constraints), 17 (component), 13 (deps)
- [ ] Mọi User Story ID (US-xxx) được ref đúng trong AC, FR
- [ ] Map provider = Leaflet (admin), React Native Maps (mobile) — KHÔNG phải Google Maps/Mapbox
- [ ] Database = PostgreSQL với float coordinates — KHÔNG PostGIS
- [ ] State management = TanStack Query — KHÔNG Zustand
- [ ] Cache = KHÔNG Redis (chưa implement)
- [ ] Supported languages = 11 (via Translation API) ở tất cả các file mention
- [ ] Permission matrix ở `docs/ma-tran-phan-quyen.md` consistent với roles trong 03, 11

### 4.5. Files tham khảo từ codebase

```
# Prisma Schema (database entities)
apps/api/prisma/schema.prisma

# Backend modules (API endpoints)
apps/api/src/auth/auth.controller.ts
apps/api/src/pois/pois.controller.ts
apps/api/src/tours/tours.controller.ts
apps/api/src/media/media.controller.ts
apps/api/src/tts/tts.controller.ts
apps/api/src/translate/translate.controller.ts
apps/api/src/merchants/merchants.controller.ts
apps/api/src/analytics/analytics.controller.ts
apps/api/src/qr/qr.controller.ts
apps/api/src/profile/profile.controller.ts
apps/api/src/tourists/tourists.controller.ts
apps/api/src/shop-owner/shop-owner.controller.ts
apps/api/src/public/public.controller.ts

# Admin routes
apps/admin/src/App.tsx (hoặc router config)

# Mobile routes
apps/mobile/app/ (file-based routing)

# Package.json files
apps/api/package.json
apps/admin/package.json
apps/mobile/package.json
```

---

> **Ghi chú cuối:** File này là READ-ONLY reference guide. Không cần update file này khi update các PRD files. Sau khi TẤT CẢ PRDs đã update xong, file này có thể xóa hoặc archive.
