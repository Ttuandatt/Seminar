# 📋 Executive Summary
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08  
> **Trạng thái:** Draft

---

## 1. Tổng quan dự án

### 1.1 Mô tả ngắn gọn

**GPS Tours** là hệ thống thuyết minh du lịch tự động, bao gồm:
- **Admin Dashboard (Web)**: Quản lý POIs (Points of Interest) và Tours
- **Tourist App (Mobile/PWA)**: Ứng dụng cho du khách với audio guide tự động theo vị trí GPS

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
- Đặt POI trên bản đồ (click hoặc nhập tọa độ)
- Upload hình ảnh và audio
- Quản lý nội dung đa ngôn ngữ (VN/EN)

### 3.2 Tourist App
- Hiển thị POIs trên bản đồ
- Tự động phát audio khi đến POI (GPS trigger)
- Chọn ngôn ngữ (VN/EN)
- Chế độ Offline

---

## 4. Phạm vi MVP

### ✅ Trong phạm vi (In Scope)

| Component | Priority | Phase |
|-----------|----------|-------|
| Admin Dashboard (Web) | P0 | MVP |
| Tourist App (Mobile/PWA) | P0 | MVP |
| Backend API (RESTful) | P0 | MVP |
| Quản lý nội dung cơ bản | P0 | MVP |
| Đa ngôn ngữ (VN/EN) | P1 | MVP |
| Chế độ Offline | P1 | MVP |

### ❌ Ngoài phạm vi (Out of Scope)

| Feature | Lý do | Xem xét? |
|---------|-------|----------|
| Tính năng AR | Complexity cao | Phase 3+ |
| Booking/Payment | Cần partner, legal | Phase 2+ |
| Chatbot AI | Separate project | Phase 3+ |
| Social features | Nice-to-have | Phase 2+ |

---

## 5. Stakeholders

| Vai trò | Trách nhiệm |
|---------|-------------|
| Product Owner | Quyết định scope, priorities |
| Scrum Master | Facilitate team, remove blockers |
| Dev Team | Implementation |
| Content Team | Tạo nội dung POI, audio |
| QA Team | Testing & validation |

---

## 6. Timeline dự kiến

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 0 | 1 tuần | Requirements Intake ✅ |
| Phase 1 | 1 tuần | PRD Documents |
| Step 2-4 | 4-6 tuần | MVP Development |
| Step 5-6 | 1-2 tuần | Refactor & Delivery |

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

1. ☐ Hoàn thành PRD Documents (Phase 1)
2. ☐ Tạo Diagrams (Phase 2)
3. ☐ Gate 1 Approval từ Stakeholders
4. ☐ Chuyển sang Step 2: Low-code (UI + Flow)

---

> **Tài liệu tham khảo:** `PRDs/00_requirements_intake.md`
