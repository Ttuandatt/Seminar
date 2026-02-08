# ⚠️ Dependencies & Risks
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

---

## 1. Dependencies

### 1.1 Internal Dependencies

| ID | Dependency | Owner | Blocks | Status | Due Date |
|----|------------|-------|--------|--------|----------|
| D001 | UI/UX Design completion | Design Team | Frontend development | 🟡 In Progress | TBD |
| D002 | Backend API development | Backend Team | Frontend integration | 🔴 Not Started | TBD |
| D003 | Content creation (POI text) | Content Team | Demo/Testing | 🟡 In Progress | TBD |
| D004 | Audio recording | Content Team | Audio features | 🔴 Not Started | TBD |
| D005 | Infrastructure setup | DevOps | Deployment | 🔴 Not Started | TBD |
| D006 | Database design approval | Tech Lead | Backend development | ✅ Done | - |

### 1.2 External Dependencies

| ID | Dependency | Provider | Impact | Status | Mitigation |
|----|------------|----------|--------|--------|------------|
| D101 | Map API Key | Google/Mapbox | Maps won't work | 🔴 Pending | Apply early, have backup provider |
| D102 | Cloud Storage setup | Azure/AWS | Media upload blocked | 🔴 Pending | Use local storage for dev |
| D103 | Domain & SSL | Registrar/CA | Production deployment | 🔴 Pending | Can use staging domain first |
| D104 | CDN configuration | Cloud provider | Media performance | 🟡 Optional MVP | Direct S3 URLs temporary |

---

## 2. Technical Dependencies

### 2.1 Dependency Chain

```
┌─────────────────────────────────────────────────────────────┐
│                     DEPENDENCY CHAIN                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                           │
│  │ UI/UX Design │                                           │
│  └──────┬───────┘                                           │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │◄───│  Backend API  │◄───│   Database   │  │
│  │  Development │    │  Development  │    │    Setup     │  │
│  └──────┬───────┘    └──────┬───────┘    └──────────────┘  │
│         │                   │                               │
│         └─────────┬─────────┘                               │
│                   ▼                                         │
│            ┌──────────────┐                                 │
│            │ Integration  │                                 │
│            │   Testing    │                                 │
│            └──────┬───────┘                                 │
│                   ▼                                         │
│            ┌──────────────┐    ┌──────────────┐            │
│            │  Deployment  │◄───│ Infrastructure│            │
│            └──────────────┘    │    Setup     │            │
│                                └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Critical Path

| Order | Task | Duration | Dependent On |
|-------|------|----------|--------------|
| 1 | Database design | 2 days | - |
| 2 | Backend API (core) | 2 weeks | Database design |
| 3 | Frontend (core) | 2 weeks | UI Design |
| 4 | Integration | 1 week | Backend + Frontend |
| 5 | Testing | 1 week | Integration |
| 6 | Deployment | 2 days | Infrastructure + Testing |

**Critical Path Duration:** ~6 weeks

---

## 3. Risk Register

### 3.1 Technical Risks

| ID | Risk | Probability | Impact | Score | Mitigation | Owner |
|----|------|-------------|--------|-------|------------|-------|
| R001 | GPS accuracy poor in dense areas | Medium | High | 6 | Fallback QR code; future BLE beacons | Dev Lead |
| R002 | Audio playback issues on different devices | Medium | Medium | 4 | Test on multiple devices early | Mobile Dev |
| R003 | Map API rate limits exceeded | Low | High | 3 | Implement caching; monitor usage | Backend |
| R004 | Database performance with geo queries | Low | Medium | 2 | Proper indexing; PostGIS optimization | DBA |
| R005 | Offline mode sync conflicts | Medium | Medium | 4 | Last-write-wins strategy; conflict UI | Frontend |
| R006 | Battery drain from GPS tracking | Medium | Medium | 4 | Optimize update frequency; user settings | Mobile Dev |

### 3.2 Project Risks

| ID | Risk | Probability | Impact | Score | Mitigation | Owner |
|----|------|-------------|--------|-------|------------|-------|
| R101 | Backend API delays | High | High | 9 | Mock APIs for frontend; parallel dev | PM |
| R102 | Content not ready on time | Medium | Medium | 4 | Use placeholder content; prioritize | Content Lead |
| R103 | Scope creep | Medium | High | 6 | Strict scope management; change process | PM |
| R104 | Key team member unavailable | Low | High | 3 | Knowledge sharing; documentation | PM |
| R105 | Third-party API changes | Low | Medium | 2 | Abstract integrations; version pinning | Tech Lead |

### 3.3 Business Risks

| ID | Risk | Probability | Impact | Score | Mitigation | Owner |
|----|------|-------------|--------|-------|------------|-------|
| R201 | Low user adoption | Medium | High | 6 | User testing; marketing; good UX | Product Owner |
| R202 | Competitor launches similar product | Low | Medium | 2 | Differentiate with unique features | Product Owner |
| R203 | Content quality issues | Medium | Medium | 4 | Content guidelines; review process | Content Lead |
| R204 | Privacy/legal concerns with GPS | Low | High | 3 | Privacy policy; user consent; legal review | Legal |

---

## 4. Risk Scoring Matrix

| | Low Impact (1) | Medium Impact (2) | High Impact (3) |
|------|----------------|-------------------|-----------------|
| **High (3)** | 3 | 6 | **9 Critical** |
| **Medium (2)** | 2 | 4 | 6 |
| **Low (1)** | 1 | 2 | 3 |

**Score Thresholds:**
- 1-2: Accept (monitor)
- 3-4: Mitigate (plan response)
- 6+: Urgent (prioritize mitigation)
- 9: Critical (immediate action required)

---

## 5. Risk Response Plan

### 5.1 R001: GPS Accuracy Issues

**Risk:** GPS không chính xác trong khu vực có nhiều tòa nhà cao

**Response Plan:**
1. **Immediate:** Implement QR code fallback (US-407)
2. **Short-term:** Add manual POI selection option
3. **Long-term:** Investigate BLE beacon integration

**Trigger:** GPS accuracy > ±10m consistently

---

### 5.2 R101: Backend API Delays

**Risk:** Backend không kịp deliver API cho frontend

**Response Plan:**
1. **Preventive:** 
   - Create API contracts upfront (OpenAPI spec)
   - Mock server for frontend development
2. **Reactive:**
   - Prioritize critical endpoints
   - Use mock data in demos
   - Parallel development with stubs

**Monitoring:** Weekly sync meetings; API delivery tracking

---

### 5.3 R103: Scope Creep

**Risk:** Thêm features ngoài scope MVP

**Response Plan:**
1. **Prevention:**
   - Clear scope document (02_scope_definition.md)
   - Change request process
   - Stakeholder sign-off
2. **Response:**
   - Evaluate against MVP goals
   - If approved: re-estimate, adjust timeline
   - Log all changes in changelog

**Gate:** Any scope change requires PM + Tech Lead approval

---

## 6. Contingency Plans

| Scenario | Trigger | Contingency |
|----------|---------|-------------|
| Backend 2+ weeks late | Sprint 2 end | Release frontend-only with mock data demo |
| Map API unavailable | API errors > 1 hour | Switch to backup provider (Google ↔ Mapbox) |
| Key developer leaves | Person unavailable | Assign backup; extend timeline 20% |
| Content not ready | Launch date - 1 week | Use lorem ipsum + stock photos; mark as beta |

---

## 7. Assumptions

| ID | Assumption | If False |
|----|------------|----------|
| A001 | Backend APIs will be ready as scheduled | Use mock APIs; delay integration |
| A002 | GPS accuracy ±5m is sufficient | Implement QR fallback more prominently |
| A003 | POIs are at least 10m apart | Handle overlapping trigger zones |
| A004 | Content will be provided on time | Use placeholder content |
| A005 | Users have 4G/LTE connection | Prioritize offline mode |
| A006 | Team has React/TypeScript experience | Training or hiring |
| A007 | Map API quotas are sufficient | Monitor and upgrade plan if needed |

---

## 8. Open Questions

| ID | Question | Owner | Status | Due |
|----|----------|-------|--------|-----|
| OQ001 | Which map provider to use? Google or Mapbox? | Tech Lead | Open | Week 1 |
| OQ002 | Hosting on Azure, AWS, or GCP? | DevOps | Open | Week 1 |
| OQ003 | Audio format: MP3 only or also WAV? | Content | Decided: Both | - |
| OQ004 | PWA or React Native for tourist app? | Tech Lead | Open | Week 1 |
| OQ005 | How to handle multi-tenant in future? | Architect | Deferred | Phase 2 |

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 9, 10, 12
