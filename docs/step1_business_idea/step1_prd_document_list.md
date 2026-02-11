# 📋 Step 1: Danh sách Documents cần có

> **Dự án:** GPS Tours - Hệ thống quản lý POIs và Tours
> 
> **Phạm vi:** Admin Dashboard (Web) + Tourist App (Mobile/PWA)
> 
> **Ngày tạo:** 2026-02-07

---

## 🗂️ Tổng quan quy trình Step 1

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP 1: BUSINESS IDEA                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   PHASE 0: REQUIREMENTS INTAKE (Thu thập & Tổng hợp yêu cầu)              │
│   ════════════════════════════════════════════════════════                 │
│   ┌───────────────────────────────────────────────────┐                    │
│   │ 📋 00_requirements_intake.md                      │                    │
│   │    • Câu hỏi phỏng vấn + Câu trả lời             │                    │
│   │    • Problem Statement                            │                    │
│   │    • Target Users                                 │                    │
│   │    • MVP Scope (In/Out)                           │                    │
│   │    • Chi tiết yêu cầu theo chủ đề                 │                    │
│   │    • Assumptions & Risks                          │                    │
│   └───────────────────────────────────────────────────┘                    │
│                              ↓                                              │
│   PHASE 1: PRD DOCUMENTS (Chi tiết hóa)                                    │
│   ════════════════════════════════════════════════════                     │
│   ┌───────────────────────────────────────────────────┐                    │
│   │ 📁 01_executive_summary.md                        │                    │
│   │ 📁 02_scope_definition.md                         │                    │
│   │ 📁 03_user_personas_roles.md                      │                    │
│   │ 📁 04_user_stories.md                             │                    │
│   │ 📁 05_functional_requirements.md                  │                    │
│   │ 📁 06_acceptance_criteria.md                      │                    │
│   │ 📁 07_non_functional_requirements.md              │                    │
│   │ 📁 08_data_requirements.md                        │                    │
│   │ 📁 09_api_specifications.md                       │                    │
│   │ 📁 10_ui_ux_specifications.md                     │                    │
│   │ 📁 11_business_rules.md                           │                    │
│   │ 📁 12_technical_constraints.md                    │                    │
│   │ 📁 13_dependencies_risks.md                       │                    │
│   └───────────────────────────────────────────────────┘                    │
│                              ↓                                              │
│   PHASE 2: DIAGRAMS (Mô hình hóa)                                          │
│   ════════════════════════════════════════════════════                     │
│   ┌───────────────────────────────────────────────────┐                    │
│   │ 📊 14_usecase_diagram.md                          │                    │
│   │ 📊 15_sequence_diagrams.md                        │                    │
│   │ 📊 16_activity_diagrams.md                        │                    │
│   │ 📊 17_component_diagram.md                        │                    │
│   └───────────────────────────────────────────────────┘                    │
│                              ↓                                              │
│   ✅ GATE 1: Stakeholder Approval                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Document Structure

```
docs/
├── 00_requirements_intake.md        ← PHASE 0: Thu thập & Tổng hợp yêu cầu (MERGED)
│
├── 01_executive_summary.md          ← PHASE 1: PRD Documents
├── 02_scope_definition.md           
├── 03_user_personas_roles.md        
├── 04_user_stories.md               
├── 05_functional_requirements.md    
├── 06_acceptance_criteria.md        
├── 07_non_functional_requirements.md
├── 08_data_requirements.md          
├── 09_api_specifications.md         
├── 10_ui_ux_specifications.md       
├── 11_business_rules.md             
├── 12_technical_constraints.md      
├── 13_dependencies_risks.md         
│
├── diagrams/                        ← PHASE 2: DIAGRAMS
│   ├── 14_usecase_diagram.md        ← Use Case Diagram + Đặc tả
│   ├── 15_sequence_diagrams.md      ← Sequence Diagrams
│   ├── 16_activity_diagrams.md      ← Activity Diagrams
│   └── 17_component_diagram.md      ← Component Diagram
│
└── appendix/
    └── open_questions.md
```

---

## 📄 Chi tiết từng Document

---

## 🔴 PHASE 0: THU THẬP YÊU CẦU (Requirements Gathering)

> **Đây là bước ĐẦU TIÊN và NỀN TẢNG!**
> 
> Mục đích: Thu thập thông tin từ stakeholders trước khi viết bất kỳ document nào.

### 0️⃣ Thu thập yêu cầu (`00_thu_thap_yeu_cau.md` / `.csv`)

| Section | Nội dung | Mục đích |
|---------|----------|----------|
| **1. Bối cảnh nghiệp vụ** | Mô tả dự án, mục tiêu | Hiểu WHY |
| **2. Stakeholder Interviews** | Câu hỏi cho PO, users, tech | Hiểu pain points |
| **3. Kiến trúc hệ thống** | Câu hỏi về architecture | Xác định tech decisions |
| **4. Location Service** | Câu hỏi về định vị | GPS/Beacon/QR decisions |
| **5. Xử lý vùng giao thoa** | Câu hỏi về overlap zones | Algorithm decisions |
| **6. Media/Audio** | Câu hỏi về content | Streaming/download decisions |
| **7. Database** | Câu hỏi về data | Schema decisions |
| **8. API Design** | Câu hỏi về API | Contract decisions |
| **9. Security** | Câu hỏi về bảo mật | Auth/encryption decisions |
| **10. Analytics** | Câu hỏi về tracking | Metrics decisions |
| **11. Performance** | Câu hỏi về hiệu năng | SLA decisions |
| **12. CI/CD** | Câu hỏi về deployment | DevOps decisions |

**Files đã có:**
- ✅ `01_thu_thap_yeu_cau.md` (153+ câu hỏi)
- ✅ `01_thu_thap_yeu_cau.csv` (format spreadsheet)

**Quy trình:**
```
1. Phỏng vấn stakeholders (PO, users, tech lead)
         ↓
2. Điền câu trả lời vào form CSV
         ↓
3. Review và confirm với stakeholders
         ↓
4. Chuyển sang Phase 1
```

**Status:** ⚠️ Câu hỏi đã có, cần điền câu trả lời

---

## 🟡 PHASE 1: REQUIREMENTS INTAKE (Tổng hợp yêu cầu)

> **Mục đích:** Tổng hợp thông tin từ Phase 0 thành document có cấu trúc

### 1️⃣ Requirements Intake (`01_requirements_intake.md`)

| Section | Nội dung | Status |
|---------|----------|--------|
| **Problem Statement** | Vấn đề cần giải quyết | ✅ Draft |
| **Target Users** | Personas và characteristics | ✅ Draft |
| **MVP Scope (In/Out)** | Features trong/ngoài scope | ✅ Draft |
| **Functional Requirements Overview** | FR tổng quan | ✅ Draft |
| **Non-Functional Requirements** | NFRs tổng quan | ✅ Draft |
| **Technical Constraints** | Ràng buộc kỹ thuật | ✅ Draft |
| **Success Metrics** | Tiêu chí thành công | ✅ Draft |
| **Assumptions** | Các giả định | ✅ Draft |
| **Risks & Mitigations** | Rủi ro và giải pháp | ✅ Draft |
| **Open Questions** | Câu hỏi cần trả lời | ⚠️ Cần điền |

**File đã có:** ✅ `step1_requirements_intake.md` (draft)

**Status:** ⚠️ Draft - cần bổ sung từ câu trả lời Phase 0

---

## 🟢 PHASE 2: PRD DOCUMENTS (Chi tiết hóa)

> **Mục đích:** Chi tiết hóa requirements thành các documents chuyên biệt
> 
> **Note:** Phần lớn nội dung đã có từ `PRD_GPS_Admin_v1.0.txt`

### 2️⃣ Executive Summary (`02_executive_summary.md`)

| Section | Nội dung | Status |
|---------|----------|--------|
| Overview | Mô tả hệ thống | ✅ Có từ PRD |
| Goals | Mục tiêu chính/phụ | ✅ Có từ PRD |
| Stakeholders | Đối tượng liên quan | ✅ Có từ PRD |
| Timeline | Milestones | ❌ Cần bổ sung |

---

### 3️⃣ Scope Definition (`03_scope_definition.md`)

| Section | Nội dung | Status |
|---------|----------|--------|
| In-Scope (MVP) | Features MVP | ✅ Có từ PRD |
| Out-of-Scope | Future phases | ✅ Có từ PRD |
| Assumptions | Giả định | ✅ Có từ PRD |

**Modules trong scope:**
- Module 1: Admin Authentication ✅
- Module 2: POI Management ✅
- Module 3: Tour Management ✅
- Module 4: Tourist App ❌ (cần bổ sung)

---

### 4️⃣ User Personas & Roles (`04_user_personas_roles.md`)

| Persona | Mô tả | Status |
|---------|-------|--------|
| Content Administrator | Quản lý POIs/Tours | ✅ Có từ PRD |
| Tourist (Việt) | Du khách Việt | ❌ Cần bổ sung |
| Tourist (International) | Du khách quốc tế | ❌ Cần bổ sung |

---

### 5️⃣ User Stories (`05_user_stories.md`)

| Module | Story IDs | Status |
|--------|-----------|--------|
| Authentication | US-001, US-002 | ✅ Có (2 stories) |
| POI Management | US-003 → US-009 | ✅ Có (7 stories) |
| Tour Management | US-010 → US-018 | ✅ Có (9 stories) |
| Tourist App | US-TOURIST-xxx | ❌ Cần bổ sung |

**Format:** As a [role], I want [goal] so that [benefit]

**Đã có:** 18 user stories từ `PRD_GPS_Admin_v1.0.txt` Section 4

---

### 6️⃣ Functional Requirements (`06_functional_requirements.md`)

| Module | FR IDs | Status |
|--------|--------|--------|
| Admin Auth | FR-AUTH-001 → 003 | ✅ Có |
| POI Management | FR-POI-001 → 005 | ✅ Có |
| Tour Management | FR-TOUR-001 → 007 | ✅ Có |
| Tourist App | FR-TOURIST-xxx | ❌ Cần bổ sung |

**Đã có:** 15 FRs từ `PRD_GPS_Admin_v1.0.txt` Section 5

---

### 7️⃣ Acceptance Criteria (`07_acceptance_criteria.md`)

| AC IDs | User Stories | Status |
|--------|--------------|--------|
| AC-001 → AC-018 | US-001 → US-018 | ✅ Có |

**Format:** Given-When-Then (Gherkin)

**Đã có:** 18 ACs từ `PRD_GPS_Admin_v1.0.txt` Section 6

---

### 8️⃣ Non-Functional Requirements (`08_non_functional_requirements.md`)

| Category | NFR IDs | Status |
|----------|---------|--------|
| Performance | NFR-PERF-001 → 003 | ✅ |
| Security | NFR-SEC-001 → 004 | ✅ |
| Usability | NFR-USE-001 → 004 | ✅ |
| Reliability | NFR-REL-001 → 003 | ✅ |
| Maintainability | NFR-MAIN-001 → 003 | ✅ |
| Accessibility | NFR-ACC-001 → 003 | ✅ |
| Browser Support | NFR-BROW-001 → 002 | ✅ |

**Đã có từ:** `PRD_GPS_Admin_v1.0.txt` Section 7

---

### 9️⃣ Data Requirements (`09_data_requirements.md`)

| Entity | Fields | Status |
|--------|--------|--------|
| POI | id, name, description, lat, lng, radius, type, image | ✅ |
| Tour | id, name, description, duration, poiIds, image, createdAt | ✅ |
| AuthState | isAuthenticated, username | ✅ |
| POIType | MAIN, WC, TICKET, PARKING, BOAT | ✅ |

**Đã có từ:** `PRD_GPS_Admin_v1.0.txt` Section 8

---

### 🔟 API Specifications (`10_api_specifications.md`)

| Endpoint Group | Endpoints | Status |
|----------------|-----------|--------|
| Auth | POST /login, /logout | ✅ |
| POIs | GET, POST, PUT, DELETE /api/pois | ✅ |
| Tours | GET, POST, PUT, DELETE /api/tours | ✅ |
| Tourist | /nearby, /content/:lang | ❌ Cần bổ sung |

**Đã có từ:** `PRD_GPS_Admin_v1.0.txt` Section 9

---

### 1️⃣1️⃣ UI/UX Specifications (`11_ui_ux_specifications.md`)

| Section | Status |
|---------|--------|
| Color Palette | ✅ |
| Typography | ✅ |
| Component Patterns | ✅ |
| Responsive Behavior | ✅ |
| Loading/Empty/Error States | ✅ |

**Đã có từ:** `PRD_GPS_Admin_v1.0.txt` Section 10

---

### 1️⃣2️⃣ Business Rules (`12_business_rules.md`)

| BR ID | Rule Name | Status |
|-------|-----------|--------|
| BR-001 | Mandatory Location | ✅ |
| BR-002 | Route Logic (Min 1 POI) | ✅ |
| BR-003 | Cascade Deletion | ✅ |
| BR-004 | Single Admin Role | ✅ |
| BR-005 | Client-Side Data (MVP) | ✅ |

**Đã có từ:** `PRD_GPS_Admin_v1.0.txt` Section 11

---

### 1️⃣3️⃣ Technical Constraints (`13_technical_constraints.md`)

| Aspect | Detail | Status |
|--------|--------|--------|
| Frontend | React 18+, TypeScript, Vite, Tailwind | ✅ |
| Backend | FastAPI, MongoDB, Redis | ✅ |
| Known Limitations | No image upload, No persistence | ✅ |

**Đã có từ:** PRD + Backend design

---

### 1️⃣4️⃣ Dependencies & Risks (`14_dependencies_risks.md`)

| Type | Items | Status |
|------|-------|--------|
| External Dependencies | React, Vite, Tailwind, etc. | ✅ |
| Risks | GPS accuracy, Zone overlap, Battery | Partial |

---

## � PHASE 3: DIAGRAMS (Mô hình hóa)

> **Mục đích:** Trực quan hóa hệ thống qua các diagram chuẩn UML

### 1️⃣5️⃣ Use Case Diagram + Đặc tả (`diagrams/15_usecase_diagram.md`)

| Section | Nội dung | Status |
|---------|----------|--------|
| **System Boundary** | Ranh giới hệ thống | ❌ Cần tạo |
| **Actors** | Admin, Tourist (VN), Tourist (Int'l) | ❌ Cần tạo |
| **Use Cases** | Tất cả use cases từ User Stories | ❌ Cần tạo |
| **Relationships** | Include, Extend, Generalization | ❌ Cần tạo |
| **Đặc tả Use Case** | Chi tiết từng UC theo template | ❌ Cần tạo |

**Use Case Template:**
```
UC-ID: [ID]
Tên: [Tên Use Case]
Actor: [Actor chính]
Preconditions: [Điều kiện trước]
Postconditions: [Điều kiện sau]
Main Flow: [Luồng chính]
Alternative Flows: [Luồng thay thế]
Exception Flows: [Luồng ngoại lệ]
```

**Có tham khảo:** `FocusedUseCases.txt` (sample format)

---

### 1️⃣6️⃣ Sequence Diagrams (`diagrams/16_sequence_diagrams.md`)

| Diagram | Mô tả | Status |
|---------|-------|--------|
| **SD-01: Admin Login** | Luồng đăng nhập | ❌ Cần tạo |
| **SD-02: Create POI** | Tạo POI mới | ❌ Cần tạo |
| **SD-03: Edit POI** | Chỉnh sửa POI | ❌ Cần tạo |
| **SD-04: Delete POI** | Xóa POI (cascade) | ❌ Cần tạo |
| **SD-05: Create Tour** | Tạo Tour từ POIs | ❌ Cần tạo |
| **SD-06: Tourist View POI** | Du khách xem POI | ❌ Cần tạo |
| **SD-07: Auto-switch Content** | Tự động chuyển kiosk | ❌ Cần tạo |
| **SD-08: Overlap Zone Handling** | Xử lý vùng giao thoa | ❌ Cần tạo |

**Format:** Mermaid hoặc PlantUML

---

### 1️⃣7️⃣ Activity Diagrams (`diagrams/17_activity_diagrams.md`)

| Diagram | Mô tả | Status |
|---------|-------|--------|
| **AD-01: Admin Login Flow** | Quy trình đăng nhập | ❌ Cần tạo |
| **AD-02: POI Management Flow** | CRUD POI workflow | ❌ Cần tạo |
| **AD-03: Tour Creation Flow** | Tạo và quản lý Tour | ❌ Cần tạo |
| **AD-04: Tourist Journey** | Hành trình du khách | ❌ Cần tạo |
| **AD-05: Location Detection** | Phát hiện vị trí | ❌ Cần tạo |
| **AD-06: Content Switching** | Chuyển đổi nội dung | ❌ Cần tạo |

**Format:** Mermaid hoặc PlantUML

---

### 1️⃣8️⃣ Component Diagram (`diagrams/18_component_diagram.md`)

| Section | Nội dung | Status |
|---------|----------|--------|
| **Frontend Components** | React components hierarchy | ❌ Cần tạo |
| **Backend Services** | FastAPI services/modules | ❌ Cần tạo |
| **Database Layer** | MongoDB collections | ❌ Cần tạo |
| **External Services** | Azure, Redis, Maps API | ❌ Cần tạo |
| **Communication** | REST APIs, WebSocket | ❌ Cần tạo |

**Architecture Overview:**
```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
│  ┌─────────────────┐              ┌─────────────────────────┐  │
│  │  Admin Panel    │              │   Tourist App           │  │
│  │  (React Web)    │              │   (React Native/PWA)    │  │
│  └────────┬────────┘              └────────────┬────────────┘  │
└───────────┼────────────────────────────────────┼────────────────┘
            │                                    │
            │         REST API / WebSocket       │
            │                                    │
┌───────────┼────────────────────────────────────┼────────────────┐
│           ▼                                    ▼                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY                          │   │
│  │                    (FastAPI)                            │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│       ┌──────────────────────┼──────────────────────┐          │
│       ▼                      ▼                      ▼          │
│  ┌─────────┐           ┌─────────┐           ┌─────────┐       │
│  │  Auth   │           │  POI    │           │  Tour   │       │
│  │ Service │           │ Service │           │ Service │       │
│  └────┬────┘           └────┬────┘           └────┬────┘       │
│       │                     │                     │            │
│                         BACKEND LAYER                          │
└───────┼─────────────────────┼─────────────────────┼────────────┘
        │                     │                     │
┌───────┼─────────────────────┼─────────────────────┼────────────┐
│       ▼                     ▼                     ▼            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     MongoDB                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                     Redis Cache                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          DATA LAYER                            │
└────────────────────────────────────────────────────────────────┘
```

---

## 📊 Summary Table

| Phase | # | Document | Status | Priority |
|-------|---|----------|--------|----------|
| **0** | 0 | Thu thập yêu cầu | ⚠️ Cần điền câu trả lời | P0 |
| **1** | 1 | Requirements Intake | ⚠️ Draft | P0 |
| **2** | 2 | Executive Summary | ✅ Có từ PRD | P0 |
| **2** | 3 | Scope Definition | ✅ Có từ PRD | P0 |
| **2** | 4 | User Personas | ⚠️ Cần bổ sung Tourist | P0 |
| **2** | 5 | User Stories | ⚠️ Cần bổ sung Tourist | P0 |
| **2** | 6 | Functional Requirements | ⚠️ Cần bổ sung Tourist | P0 |
| **2** | 7 | Acceptance Criteria | ⚠️ Cần bổ sung Tourist | P0 |
| **2** | 8 | Non-Functional Requirements | ✅ Có từ PRD | P1 |
| **2** | 9 | Data Requirements | ✅ Có từ PRD | P0 |
| **2** | 10 | API Specifications | ⚠️ Cần bổ sung Tourist | P0 |
| **2** | 11 | UI/UX Specifications | ✅ Có từ PRD | P1 |
| **2** | 12 | Business Rules | ✅ Có từ PRD | P0 |
| **2** | 13 | Technical Constraints | ✅ Có từ PRD | P1 |
| **2** | 14 | Dependencies & Risks | ✅ Có từ PRD | P2 |
| **3** | 15 | Use Case Diagram + Đặc tả | ❌ Cần tạo | P0 |
| **3** | 16 | Sequence Diagrams (8 diagrams) | ❌ Cần tạo | P1 |
| **3** | 17 | Activity Diagrams (6 diagrams) | ❌ Cần tạo | P1 |
| **3** | 18 | Component Diagram | ❌ Cần tạo | P0 |

---

## ❓ Gaps to Fill (Việc cần làm)

### Phase 0: Thu thập yêu cầu
- [ ] Điền câu trả lời vào `01_thu_thap_yeu_cau.csv`
- [ ] Xác nhận với stakeholders

### Phase 1: Requirements Intake
- [ ] Hoàn thiện `step1_requirements_intake.md` từ câu trả lời Phase 0
- [ ] Trả lời Open Questions

### Phase 2: PRD Documents (Tourist App)
- [ ] User Stories cho Tourist (US-TOURIST-xxx)
- [ ] Functional Requirements cho Tourist App
- [ ] Acceptance Criteria cho Tourist features
- [ ] API endpoints cho Tourist App
- [ ] Overlap zone handling logic

### Phase 3: Diagrams
- [ ] Use Case Diagram + Đặc tả chi tiết
- [ ] 8 Sequence Diagrams (Login, CRUD POI, CRUD Tour, Tourist flows)
- [ ] 6 Activity Diagrams (Admin flows, Tourist flows)
- [ ] Component Diagram (Frontend, Backend, Data layers)

---

## 📋 Next Steps

```
1. ⬜ Điền câu trả lời vào 01_thu_thap_yeu_cau.csv (Phase 0)
         ↓
2. ⬜ Hoàn thiện step1_requirements_intake.md (Phase 1)
         ↓
3. ⬜ Tách PRD_GPS_Admin thành các files riêng (Phase 2)
         ↓
4. ⬜ Bổ sung requirements cho Tourist App (Phase 2)
         ↓
5. ⬜ Review và Pass Gate 1
         ↓
6. ⬜ Chuyển sang Step 2: Low-code (UI + Flow + Rule)
```

---

## 🔗 Reference Documents

| File | Nội dung | Lines |
|------|----------|-------|
| `01_thu_thap_yeu_cau.md` | 153+ câu hỏi thu thập yêu cầu | 515 |
| `01_thu_thap_yeu_cau.csv` | Form CSV để điền câu trả lời | 154 |
| `PRD_GPS_Admin_v1.0.txt` | PRD chi tiết cho Admin Dashboard | 1953 |
| `Backend design - Chùa Linh Ứng (Draft).txt` | Kiến trúc backend | 27 |
| `Tài liệu vibe code.txt` | Vibe Coding methodology | 434 |
