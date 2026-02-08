# 📋 Scope Definition
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

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
| AD-013 | Upload hình ảnh | P0 | Multiple images/POI |
| AD-014 | Upload audio | P0 | Audio file/POI |
| AD-015 | Nội dung đa ngôn ngữ | P1 | VN/EN |

### 2.2 Tourist App

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| TA-001 | Xem POIs trên bản đồ | P0 | Map với markers |
| TA-002 | Xem chi tiết POI | P0 | Detail page |
| TA-003 | Đọc nội dung POI | P0 | Text description |
| TA-004 | Phát audio | P0 | Audio player |
| TA-005 | Auto-trigger theo GPS | P0 | Geofence enter |
| TA-006 | Quét QR fallback | P1 | Manual trigger |
| TA-007 | Chọn ngôn ngữ | P0 | VN/EN switch |
| TA-008 | Điều khiển audio | P0 | Play/Pause/Seek |
| TA-010 | Chọn Tour | P1 | Tour selection |
| TA-012 | Chế độ Offline | P1 | Cached data |

### 2.3 Backend

| ID | Feature | Priority | Description |
|----|---------|----------|-------------|
| BE-001 | RESTful API | P0 | CRUD operations |
| BE-002 | Authentication | P0 | JWT tokens |
| BE-003 | File storage | P0 | S3/Azure Blob |
| BE-004 | PostgreSQL + PostGIS | P0 | Geospatial queries |
| BE-006 | CDN | P1 | Media delivery |
| BE-010 | Rate limiting | P1 | API protection |

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
| Analytics dashboard | P2 | User statistics |
| Audio speed control | P2 | 0.5x-2x |
| Pre-download content | P2 | Offline Tour download |
| Push notifications | P3 | Future |
| User accounts | P3 | Optional registration |
| Favorites | P3 | Save POIs |

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
| **P1** | 4 | 4 | 2 | **10** |
| **P2** | 4 | 2 | 3 | **9** |
| **P3** | 0 | 5 | 0 | **5** |

**MVP Core:** 22 P0 features + 10 P1 features = **32 features**

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
| **Frontend** | React, TypeScript, Vite, Tailwind CSS |
| **Mobile** | React Native / PWA |
| **Backend** | FastAPI (Python) hoặc Node.js |
| **Database** | PostgreSQL + PostGIS |
| **Maps** | Google Maps hoặc Mapbox |
| **Hosting** | Azure / AWS / GCP |

### Business Constraints

| Constraint | Description |
|------------|-------------|
| Timeline | MVP trong 8-10 tuần |
| Team size | Small team (2-3 devs) |
| Budget | Limited |
| Languages | VN/EN initially |

---

## 7. Dependencies

| Dependency | Type | Owner | Status |
|------------|------|-------|--------|
| Backend API | External | Backend Team | TBD |
| Map API Key | External | Ops | TBD |
| Content creation | Content | Content Team | TBD |
| Audio recording | Content | Content Team | TBD |
| UI/UX Design | Internal | Design | TBD |
| Infrastructure | Internal | DevOps | TBD |

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
| Admin Dashboard | 0/10 | 0/4 | 0/14 |
| Tourist App | 0/7 | 0/4 | 0/11 |
| Backend | 0/5 | 0/2 | 0/7 |
| **Total** | **0/22** | **0/10** | **0/32** |

### 9.3 MVP Success Metrics (Launch Ready)

| Metric | Target | Actual |
|--------|--------|--------|
| All P0 features complete | 22/22 | TBD |
| Critical bugs | 0 | TBD |
| API response time p95 | <500ms | TBD |
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
| **Audio files** | 40-100 (2 lang × POIs) | 1,000 |
| **Images** | 60-150 (3/POI) | 5,000 |

### 10.3 User Scope

| Parameter | MVP Target |
|-----------|------------|
| **Admin users** | 3-5 |
| **Tourist users** | 100-500 |
| **Concurrent users** | 50 |
| **Languages** | 2 (VN, EN) |

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

