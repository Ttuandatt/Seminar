# 📋 Executive Summary
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1
> **Ngày tạo:** 2026-02-08
> **Cập nhật:** 2026-04-04

---

## 1. Tổng quan dự án

### 1.1 Mô tả ngắn gọn

**GPS Tours** là hệ thống thuyết minh du lịch tự động, bao gồm:
- **Admin Dashboard (Web)**: Quản lý toàn bộ POIs, Tours, Users
- **Shop Owner Dashboard (Web)**: Chủ quán quản lý POI(s) của mình
- **Tourist App (Mobile)**: Ứng dụng cho du khách với audio guide tự động theo vị trí GPS

### 1.2 Vision Statement

> "Là ứng dụng **thuyết minh du lịch thông minh** để **cung cấp thông tin tự động theo vị trí** cho **du khách tham quan** bằng cách **kết hợp GPS và audio guide đa ngôn ngữ**."

---

## 2. Vấn đề cần giải quyết

| Đối tượng | Vấn đề hiện tại | Hậu quả |
|-----------|-----------------|---------|
| **Du khách Việt Nam** | Không có thông tin chi tiết về địa điểm | Bỏ lỡ những điểm thú vị |
| **Du khách quốc tế** | Rào cản ngôn ngữ | Không hiểu văn hóa địa phương |
| **Quản trị viên** | Khó quản lý nội dung đa địa điểm (dùng Excel/Word) | Mất thời gian, dễ lỗi |
| **Đơn vị quản lý** | Thiếu dữ liệu về hành vi du khách | Không thể cải thiện dịch vụ |

---

## 3. Giải pháp đề xuất

### 3.1 Admin Dashboard
- CRUD POIs và Tours
- Quản lý Users (Admin, Shop Owner)
- Đặt POI trên bản đồ (click hoặc nhập tọa độ)
- Upload hình ảnh và audio
- **Tạo audio TTS tự động** từ nội dung mô tả bằng Microsoft Edge TTS (11 ngôn ngữ)
- **Dịch tự động nội dung** (Google Translate API, 11 ngôn ngữ)
- Quản lý nội dung đa ngôn ngữ (11 ngôn ngữ: VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU)
- Duyệt cửa hàng và quản lý tài khoản Shop Owner

### 3.2 Shop Owner Dashboard
- Quản lý POI(s) của mình (Create, Edit, Delete)
- Upload hình ảnh và audio giới thiệu
- **Tạo audio TTS tự động** cho POI của mình (11 ngôn ngữ)
- Xem analytics (lượt xem, audio plays)

### 3.3 Tourist App
- **Kiểm tra cấu hình thiết bị** khi khởi động (GPS + Internet)
- Hiển thị POIs trên bản đồ
- Tự động phát audio khi đến POI (GPS trigger)
- **Criteria Engine**: chọn POI tốt nhất khi nhiều vùng âm thanh trùng nhau
- Chọn ngôn ngữ (11 ngôn ngữ: VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU)
- **Tạo Tour tùy chỉnh (Custom Tour)** từ các POI yêu thích
- Chế độ Offline
- Optional Login: đăng ký/đăng nhập để lưu favorites + sync history
- QR Code fallback khi GPS không chính xác

---

## 4. Phạm vi MVP

### ✅ Trong phạm vi (In Scope)

| Component | Priority | Phase |
|-----------|----------|-------|
| Admin Dashboard (Web) | P0 | MVP |
| Shop Owner Dashboard (Web) | P1 | MVP |
| Tourist App (Mobile) | P0 | MVP |
| Backend API (RESTful) | P0 | MVP |
| Quản lý nội dung cơ bản | P0 | MVP |
| Đa ngôn ngữ (11 ngôn ngữ) | P1 | MVP |
| TTS Audio Generation (msedge-tts) | P0 | MVP |
| Translation (Google Translate API) | P0 | MVP |
| Custom Tour (Tourist tạo tour riêng) | P1 | MVP |
| Criteria Engine (GPS overlap) | P1 | MVP |
| Device Capability Check | P1 | MVP |
| Chế độ Offline | P1 | MVP |
| Optional Login (Tourist) | P1 | MVP |
| QR Code Management | P1 | MVP |

### Phase 2+ (Mở rộng — theo yêu cầu giảng viên 2026-03-15)

| Component | Priority | Phase |
|-----------|----------|-------|
| Shop Approval Flow (duyệt pháp lý) | P0 | Phase 2A |
| Audio Criteria Engine (priority/distance scoring) | P0 | Phase 2A |
| Offline Map (PMTiles) | P1 | Phase 2B |
| Language Package (drawer per lang) | P1 | Phase 2B |
| WebSocket Real-time Dashboard | P1 | Phase 2B |
| Heatmap (thống kê vị trí du khách) | P1 | Phase 2B |
| Payment (MoMo/VNPay) | P2 | Phase 3 |
| Premium Voices (giọng vùng miền) | P2 | Phase 3 |
| Load Testing (k6 benchmark) | P2 | Phase 3 |

### ❌ Ngoài phạm vi (Out of Scope)

| Feature | Lý do | Xem xét? |
|---------|-------|----------|
| Tính năng AR | Complexity cao | Phase 4+ |
| Chatbot AI | Separate project | Phase 4+ |
| Social features | Nice-to-have | Phase 4+ |

---

## 5. Stakeholders

| Vai trò | Trách nhiệm |
|---------|-------------|
| Product Owner | Quyết định scope, priorities |
| Scrum Master | Facilitate team, remove blockers |
| Dev Team | Implementation |
| Content Team | Tạo nội dung POI, audio |
| **Shop Owners** | **Quản lý thông tin quán của mình** |
| QA Team | Testing & validation |

---

## 6. Timeline dự kiến

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 0 | 1 tuần | Requirements Intake ✅ |
| Phase 1 | 1 tuần | PRD Documents ✅ |
| Step 2-4 | 4-6 tuần | MVP Development ✅ |
| Step 5 | 1-2 tuần | Refactor & Testing |
| **Step 6** | **1 tuần** | **Cloud Deployment + APK Build** 🔄 |

**Tổng MVP estimate:** 8-10 tuần

---

## 7. Success Metrics

### Nghiệp vụ

| Metric | Target MVP | Target 6 tháng |
|--------|------------|----------------|
| Số người dùng Tourist App | 100 users | 1,000 users |
| Số lượt nghe audio hoàn thành | 500 lượt | 5,000 lượt |
| Số POI được tạo | 20 POIs | 100 POIs |
| Số Tour được tạo | 3 Tours | 10 Tours |

### Kỹ thuật

| Metric | Target |
|--------|--------|
| API response time (p95) | < 500ms |
| App crash rate | < 1% |
| Uptime | > 99.5% |
| Location accuracy | ±5m (outdoor) |

---

## 8. Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| GPS accuracy trong nhà | High | Fallback QR code, BLE beacons (future) |
| Content không đủ chất lượng | Medium | Content guidelines, review process |
| API delays | Medium | Mock APIs cho frontend development |
| Battery drain từ GPS | Medium | Optimize location tracking interval |

---

## 9. Các bước tiếp theo

1. ✅ Hoàn thành PRD Documents (Phase 1)
2. ✅ Tạo Diagrams (Phase 2)
3. ✅ Gate 1 Approval từ Stakeholders
4. ✅ Chuyển sang Step 2: Low-code (UI + Flow)
5. ✅ Step 4: POC Implementation — MVP 100% Complete
6. ✅ **TTS Engine (msedge-tts, 11 ngôn ngữ) — Đã hoàn thành**
7. ✅ **Translation (Google Translate API, 11 ngôn ngữ) — Đã hoàn thành**
8. ☐ Step 5: Refactor & Testing (Unit Test > 70%)
9. 🔄 **Step 6: Cloud Deployment (Render) + Build APK (EAS Build)**
10. 🔲 **Phase 2A: Shop Approval Flow, Audio Criteria Engine**
11. 🔲 **Phase 2B: Offline Map, Language Package, WebSocket Dashboard, Heatmap**
12. 🔲 **Phase 3: Payment, Premium Voices, Load Testing**

---

> **Tài liệu tham khảo:** `PRDs/00_requirements_intake.md`
