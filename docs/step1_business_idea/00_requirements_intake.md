# 📋 TÀI LIỆU THU THẬP YÊU CẦU (REQUIREMENTS INTAKE)
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Mã tài liệu:** REQ-INTAKE-001  
> **Phiên bản:** 2.1  
> **Trạng thái:** Bản nháp (Đã cải thiện + Merged)  
> **Ngày tạo:** 2026-02-07  
> **Cập nhật:** 2026-02-08

---

## 📌 Thông tin tài liệu

| Trường | Giá trị |
|--------|---------|
| **Tên dự án** | GPS Tours - Hệ thống Thuyết minh Du lịch Tự động |
| **Product Owner** | [Tên PO] |
| **Scrum Master** | [Tên SM] |
| **Các bên liên quan** | [Danh sách] |
| **Sprint** | Sprint 0 - Khám phá (Discovery) |

---

## 📑 MỤC LỤC

| # | Phần | Mô tả |
|---|------|-------|
| 0 | [Thuật ngữ & Định nghĩa](#0-thuật-ngữ--định-nghĩa) | Glossary các thuật ngữ chuyên ngành |
| 1 | [Tổng quan dự án](#1-tổng-quan-dự-án) | Vision, Scope, Success Metrics |
| 2 | [Bối cảnh nghiệp vụ](#2-bối-cảnh-nghiệp-vụ) | Problem Statement, Current State |
| 3 | [Phân tích Stakeholders](#3-phân-tích-stakeholders) | RACI Matrix, Communication Plan |
| 4 | [User Personas](#4-user-personas) | Admin, Tourist VN, Tourist Quốc tế |
| 5 | [Product Backlog](#5-product-backlog---epics--features) | Epics & Features Structure |
| 6 | [Danh sách tính năng](#6-danh-sách-tính-năng--ưu-tiên) | Feature List với Priority |
| 7 | [Yêu cầu kỹ thuật](#7-yêu-cầu-kỹ-thuật-chi-tiết) | Technical Questionnaire (190+ câu) |
| 8 | [NFRs](#8-yêu-cầu-phi-chức-năng-nfrs) | Performance, Security, Scalability... |
| 9 | [Giả định & Phụ thuộc](#9-giả-định--phụ-thuộc) | Assumptions & Dependencies |
| 10 | [Rủi ro & Biện pháp](#10-rủi-ro--biện-pháp) | Risk Register & Matrix |
| 11 | [Definition of Ready](#11-definition-of-ready-dor) | DoR Checklist |
| 12 | [Câu hỏi chưa giải đáp](#12-câu-hỏi-chưa-giải-đáp) | Open Questions |
| 13 | [Phê duyệt](#13-phê-duyệt) | Sign-off & Next Steps |

---

## 0. THUẬT NGỮ & ĐỊNH NGHĨA (GLOSSARY)

### 0.1 Thuật ngữ nghiệp vụ

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **POI** (Point of Interest) | Điểm tham quan - vị trí địa lý có thông tin thuyết minh |
| **Tour** | Tuyến tham quan - tập hợp nhiều POI theo thứ tự xác định |
| **Kiosk** | Trạm thông tin tại POI - có thể là thiết bị vật lý hoặc điểm ảo |
| **Audio Guide** | Thuyết minh bằng âm thanh tự động phát khi đến POI |
| **Geofence** | Vùng địa lý ảo xác định bởi tọa độ GPS |
| **Trigger Zone** | Vùng kích hoạt nội dung khi người dùng bước vào |

### 0.2 Thuật ngữ kỹ thuật

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **GPS** (Global Positioning System) | Hệ thống định vị toàn cầu qua vệ tinh |
| **BLE Beacon** | Thiết bị phát tín hiệu Bluetooth Low Energy để định vị trong nhà |
| **PWA** (Progressive Web App) | Ứng dụng web có thể cài đặt như app native |
| **TTS** (Text-to-Speech) | Công nghệ chuyển văn bản thành giọng nói |
| **Hysteresis** | Thuật toán tránh chuyển đổi liên tục giữa các vùng |
| **Dwell Time** | Thời gian người dùng dừng lại tại một vị trí |
| **Overlap Zone** | Vùng giao thoa giữa 2+ trigger zones |

### 0.3 Thuật ngữ quy trình

| Thuật ngữ | Định nghĩa |
|-----------|------------|
| **MVP** (Minimum Viable Product) | Phiên bản tối thiểu có thể ra mắt |
| **DoR** (Definition of Ready) | Tiêu chí để User Story sẵn sàng phát triển |
| **DoD** (Definition of Done) | Tiêu chí hoàn thành một User Story |
| **NFR** (Non-Functional Requirement) | Yêu cầu phi chức năng (performance, security...) |
| **User Story** | Mô tả tính năng từ góc độ người dùng |
| **Epic** | Nhóm các User Story liên quan |
| **Sprint** | Chu kỳ phát triển (thường 2 tuần) |

### 0.4 Quy ước ưu tiên (Priority Convention)

> **Thay vì MoSCoW phức tạp, tài liệu này sử dụng hệ thống Priority đơn giản:**

| Priority | Ý nghĩa | Mô tả | Timeline |
|----------|---------|-------|----------|
| **P0** | Critical | Bắt buộc cho MVP, không có thì không release | Sprint 1-2 |
| **P1** | High | Rất quan trọng, cần có trong MVP nếu có thể | Sprint 2-3 |
| **P2** | Medium | Nên có, có thể delay sang phase 2 | Post-MVP |
| **P3** | Low | Nice-to-have, roadmap tương lai | Future |

---

## 1. TỔNG QUAN DỰ ÁN

### 1.1 Tầm nhìn dự án

| Câu hỏi | Trả lời |
|---------|---------|
| **Vision Statement** - "Là ứng dụng ___ để ___ cho ___ bằng cách ___" | |
| **Mục tiêu kinh doanh** cụ thể là gì? | |
| **Tiêu chí thành công (OKRs)** - Đo lường thành công bằng gì? | |
| **Ngày dự kiến ra mắt MVP**? | |

### 1.2 Tổng quan phạm vi (Scope)

#### ✅ Trong phạm vi (In Scope)

| Hạng mục | Priority | Phase | Ghi chú |
|----------|----------|-------|---------|
| Admin Dashboard (Web) | P0 / P1 / P2 / P3 | MVP / Post | |
| Shop Owner Dashboard (Web) | P0 / P1 / P2 / P3 | MVP / Post | |
| Tourist App (Mobile/PWA) | P0 / P1 / P2 / P3 | MVP / Post | |
| Backend API | P0 / P1 / P2 / P3 | MVP / Post | |
| Quản lý nội dung | P0 / P1 / P2 / P3 | MVP / Post | |
| Dashboard phân tích | P0 / P1 / P2 / P3 | MVP / Post | |
| Chế độ Offline | P0 / P1 / P2 / P3 | MVP / Post | |
| Đa ngôn ngữ | P0 / P1 / P2 / P3 | MVP / Post | |

#### ❌ Ngoài phạm vi (Out of Scope) - Sẽ KHÔNG làm trong phase này

| Hạng mục | Lý do | Có thể xem xét? |
|----------|-------|-----------------|
| Tính năng AR (Augmented Reality) | Complexity cao, cần research riêng | Phase 3+ |
| Booking/Payment integration | Cần partner, legal review | Phase 2+ |
| Social features (comments, reviews) | Nice-to-have, không core | Phase 2+ |
| Chatbot AI | Cần Azure AI, separate project | Phase 3+ |
| Multi-tenant (nhiều địa điểm khác) | Cần kiến trúc riêng | Phase 2+ |
| Gamification (badges, leaderboard) | Nice-to-have | Phase 3+ |
| E-commerce (bán đồ lưu niệm) | Out of core scope | Không |
| Native iOS/Android riêng | Dùng cross-platform thay thế | Không |

### 1.3 Tiêu chí thành công (Success Metrics)

#### Metrics Nghiệp vụ

| Metric | Baseline | Target MVP | Target 6 tháng | Cách đo |
|--------|----------|------------|----------------|---------|
| Số người dùng Tourist App | 0 | ___ users | ___ users | Analytics |
| Số lượt nghe audio hoàn thành | 0 | ___ lượt | ___ lượt | Event tracking |
| Thời gian trung bình sử dụng app | N/A | ___ phút | ___ phút | Analytics |
| Tỷ lệ bounce rate | N/A | < ___% | < ___% | Analytics |
| Số POI được tạo | 0 | ___ POIs | ___ POIs | Database count |
| Số Tour được tạo | 0 | ___ Tours | ___ Tours | Database count |
| User satisfaction (NPS) | N/A | > ___ | > ___ | Survey |

#### Metrics Kỹ thuật

| Metric | Target | Cách đo |
|--------|--------|---------|
| API response time (p95) | < 500ms | APM monitoring |
| App crash rate | < 1% | Crashlytics/Sentry |
| Uptime | > 99.5% | Uptime monitoring |
| Location accuracy | ±5m (outdoor) | Field testing |
| Audio playback success rate | > 99% | Event tracking |
| Lighthouse score (PWA) | > 90 | CI/CD check |

---

## 2. BỐI CẢNH NGHIỆP VỤ

### 2.1 Mô tả vấn đề (Problem Statement)

> **Mẫu:** "[Người dùng] gặp vấn đề [vấn đề] khi [bối cảnh]. Điều này dẫn đến [hậu quả]."

| Loại người dùng | Vấn đề gặp phải | Bối cảnh | Hậu quả |
|-----------------|-----------------|----------|---------|
| **Du khách Việt Nam** | Không có thông tin chi tiết về địa điểm | Đi tham quan không có hướng dẫn viên | Bỏ lỡ những điểm thú vị |
| **Du khách quốc tế** | Rào cản ngôn ngữ | Cần thông tin bằng tiếng Anh/Trung | Không hiểu văn hóa địa phương |
| **Quản trị viên** | Khó quản lý nội dung đa địa điểm | Dùng Excel/Word thủ công | Mất thời gian, dễ lỗi |
| **Đơn vị quản lý** | Thiếu dữ liệu du khách | Không biết hành vi tham quan | Không thể cải thiện dịch vụ |

### 2.2 Phân tích hiện trạng

| Câu hỏi | Trả lời |
|---------|---------|
| Hệ thống hiện tại (nếu có) là gì? | |
| Các điểm đau (pain points) của hệ thống hiện tại? | |
| Dữ liệu/nội dung hiện có những gì? | |
| Quy trình nghiệp vụ hiện tại như thế nào? | |

### 2.3 Trạng thái mong muốn

| Câu hỏi | Trả lời |
|---------|---------|
| Hệ thống mới sẽ giải quyết vấn đề gì? | |
| Lợi ích mong đợi là gì? | |
| KPIs cụ thể? | |

---

## 3. PHÂN TÍCH STAKEHOLDERS

### 3.1 Ma trận Stakeholder (Power/Interest Grid)

| Stakeholder | Vai trò | Quyền lực | Quan tâm | Chiến lược tương tác |
|-------------|---------|-----------|----------|----------------------|
| Product Owner | | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | ☐ Quản lý chặt ☐ Giữ hài lòng ☐ Thông báo ☐ Theo dõi |
| Đội phát triển | | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | |
| Người dùng cuối | | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | |
| Nhà đầu tư | | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | |

### 3.2 Ma trận RACI

| Lĩnh vực quyết định | Responsible | Accountable | Consulted | Informed |
|--------------------|-------------|-------------|-----------|----------|
| Ưu tiên tính năng | | | | |
| Quyết định kỹ thuật | | | | |
| Thiết kế UX/UI | | | | |
| Tạo nội dung | | | | |
| Quyết định Go-Live | | | | |

---

## 4. USER PERSONAS

### 4.1 Persona 1: Quản trị viên nội dung

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên** | Admin Minh |
| **Vai trò** | Quản trị viên nội dung (Content Administrator) |
| **Thông tin nhân khẩu** | Tuổi: ___, Giới tính: ___, Vị trí: ___ |
| **Mục tiêu** | 1. ___ 2. ___ 3. ___ |
| **Điểm đau (Pain Points)** | 1. ___ 2. ___ 3. ___ |
| **Mức độ thành thạo công nghệ** | ☐ Thấp ☐ Trung bình ☐ Cao |
| **Thiết bị sử dụng** | ☐ Desktop ☐ Laptop ☐ Di động |
| **Nhiệm vụ chính** | Quản lý POIs, Tours, Nội dung |

### 4.2 Persona 2: Du khách Việt Nam

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên** | Du khách An |
| **Vai trò** | Người dùng cuối (Tourist) |
| **Thông tin nhân khẩu** | Tuổi: 25-45, Sử dụng smartphone |
| **Mục tiêu** | Khám phá địa điểm, nghe thuyết minh tự động |
| **Điểm đau** | 1. Không biết thông tin địa điểm 2. Phải thuê hướng dẫn viên 3. Tốn thời gian tìm kiếm |
| **Mức độ thành thạo công nghệ** | ☐ Thấp ☐ Trung bình ☐ Cao |
| **Thiết bị sử dụng** | ☐ iOS ☐ Android |
| **Nhiệm vụ chính** | Xem bản đồ, nghe audio, chọn Tour |

### 4.3 Persona 3: Du khách quốc tế

| Thuộc tính | Mô tả |
|------------|-------|
| **Tên** | Tourist John |
| **Vai trò** | Người dùng cuối (Du khách nước ngoài) |
| **Thông tin nhân khẩu** | Tuổi: 30-55, Cần hỗ trợ đa ngôn ngữ |
| **Mục tiêu** | Khám phá với audio tiếng Anh/Trung |
| **Điểm đau** | Rào cản ngôn ngữ, không quen địa hình |
| **Ngôn ngữ cần hỗ trợ** | ☐ EN ☐ CN ☐ KR ☐ JP ☐ Khác: ___ |
| **Thiết bị sử dụng** | ☐ iOS ☐ Android |

---

## 5. PRODUCT BACKLOG - EPICS & FEATURES

### 5.1 Cấu trúc Epic

```
EPIC 1: Xác thực Admin
├── Feature 1.1: Đăng nhập/Đăng xuất
├── Feature 1.2: Quản lý phiên làm việc (Session)
└── Feature 1.3: Phân quyền theo vai trò (Tương lai)

EPIC 2: Quản lý POI (Điểm tham quan)
├── Feature 2.1: CRUD POI
├── Feature 2.2: Đặt POI trên bản đồ
├── Feature 2.3: Phân loại POI
└── Feature 2.4: Quản lý media POI

EPIC 3: Quản lý Tour
├── Feature 3.1: CRUD Tour
├── Feature 3.2: Sắp xếp thứ tự POI (Drag & Drop)
├── Feature 3.3: Xem trước Tour
└── Feature 3.4: Xuất bản Tour

EPIC 4: Ứng dụng du khách - Core
├── Feature 4.1: Xem POIs trên bản đồ
├── Feature 4.2: Hiển thị chi tiết POI
├── Feature 4.3: Phát audio thuyết minh
├── Feature 4.4: Chọn ngôn ngữ
└── Feature 4.5: Chọn Tour

EPIC 5: Dịch vụ định vị (Location Service)
├── Feature 5.1: Phát hiện vị trí GPS
├── Feature 5.2: Tự động chuyển nội dung
├── Feature 5.3: Xử lý vùng giao thoa
└── Feature 5.4: Chế độ Offline

EPIC 6: Phân tích & Báo cáo
├── Feature 6.1: Theo dõi hoạt động người dùng
├── Feature 6.2: Thống kê tương tác nội dung
└── Feature 6.3: Dashboard quản trị
```

---

## 6. DANH SÁCH TÍNH NĂNG & ƯU TIÊN

> **Quy ước Priority:** P0 = Critical (MVP), P1 = High, P2 = Medium (Post-MVP), P3 = Low (Future)

### 6.1 Admin Dashboard Features

| ID | Tính năng | Priority | Phase | Acceptance Criteria (Tóm tắt) |
|----|-----------|----------|-------|------------------------------|
| AD-001 | Đăng nhập Admin | P0 | MVP | Admin có thể login với username/password |
| AD-002 | Tạo POI mới | P0 | MVP | Tạo POI với name, description, location, media |
| AD-003 | Chỉnh sửa POI | P0 | MVP | Update được tất cả fields của POI |
| AD-004 | Xóa POI | P0 | MVP | Soft delete POI, có confirmation dialog |
| AD-005 | Đặt POI trên bản đồ | P0 | MVP | Click hoặc nhập tọa độ để định vị POI |
| AD-006 | Phân loại POI (Chính/Phụ) | P1 | MVP | Gán loại (Primary/Secondary) cho POI |
| AD-007 | Tạo Tour mới | P0 | MVP | Tạo Tour với name, description |
| AD-008 | Thêm POIs vào Tour | P0 | MVP | Chọn nhiều POIs để thêm vào Tour |
| AD-009 | Sắp xếp lại POIs trong Tour | P1 | MVP | Drag & drop để reorder |
| AD-010 | Xóa Tour | P1 | MVP | Soft delete Tour |
| AD-011 | Xem Tour dạng lưới | P1 | MVP | Grid view tất cả Tours |
| AD-012 | Xem POI dạng gallery | P2 | Post | Gallery view POIs với thumbnail |
| AD-013 | Upload hình ảnh | P0 | MVP | Upload multiple images cho POI |
| AD-014 | Upload audio | P0 | MVP | Upload audio file cho POI |
| AD-015 | Nội dung đa ngôn ngữ | P1 | MVP | Nhập content cho VN/EN |
| AD-016 | Phiên bản nội dung | P2 | Post | Version history, rollback |
| AD-017 | Thao tác hàng loạt (Batch) | P2 | Post | Bulk select, bulk delete, bulk publish |
| AD-018 | Dashboard phân tích | P2 | Post | Xem statistics người dùng |

### 6.2 Tourist App Features

| ID | Tính năng | Priority | Phase | Acceptance Criteria (Tóm tắt) |
|----|-----------|----------|-------|------------------------------|
| TA-001 | Xem POIs trên bản đồ | P0 | MVP | Hiển thị tất cả POIs trên map |
| TA-002 | Xem chi tiết POI | P0 | MVP | Tap POI để xem details |
| TA-003 | Đọc nội dung văn bản POI | P0 | MVP | Hiển thị description text |
| TA-004 | Phát audio thuyết minh | P0 | MVP | Tap để phát audio guide |
| TA-005 | Tự động chuyển theo vị trí | P0 | MVP | Auto-trigger khi vào geofence |
| TA-006 | Quét QR thủ công (Fallback) | P1 | MVP | Backup khi GPS không hoạt động |
| TA-007 | Chọn ngôn ngữ (VN/EN) | P0 | MVP | Switch language trong settings |
| TA-008 | Điều khiển audio (Play/Pause) | P0 | MVP | Basic playback controls |
| TA-009 | Điều chỉnh tốc độ audio | P2 | Post | 0.5x, 1x, 1.5x, 2x |
| TA-010 | Chọn Tour | P1 | MVP | Browse và chọn Tour để follow |
| TA-011 | Theo dõi tuyến Tour | P1 | MVP | Xem progress trong Tour |
| TA-012 | Chế độ Offline | P1 | MVP | Cache data để dùng offline |
| TA-013 | Tải trước nội dung | P2 | Post | Pre-download Tour content |
| TA-014 | Chia sẻ vị trí/POI | P3 | Future | Share link qua social |
| TA-015 | Đăng ký người dùng | P3 | Future | Optional account creation |
| TA-016 | Lưu yêu thích | P3 | Future | Save favorite POIs |
| TA-017 | Thông báo đẩy (Push) | P3 | Future | Push notifications |
| TA-018 | Tính năng AR | P3 | Future | Augmented Reality overlay |

### 6.3 Backend/Infrastructure Features

| ID | Tính năng | Priority | Phase | Notes |
|----|-----------|----------|-------|-------|
| BE-001 | RESTful API | P0 | MVP | CRUD operations cho POI, Tour |
| BE-002 | Authentication (JWT) | P0 | MVP | Admin login/logout |
| BE-003 | File storage (S3/Azure Blob) | P0 | MVP | Store images, audio |
| BE-004 | Database (PostgreSQL) | P0 | MVP | Primary data store |
| BE-005 | Geospatial queries (PostGIS) | P0 | MVP | Location-based search |
| BE-006 | CDN cho static assets | P1 | MVP | Fast media delivery |
| BE-007 | Redis cache | P2 | Post | Performance optimization |
| BE-008 | Analytics tracking | P2 | Post | Event logging |
| BE-009 | Admin activity audit log | P2 | Post | Track admin actions |
| BE-010 | Rate limiting | P1 | MVP | API protection |

### 6.4 Tóm tắt Priority

| Priority | Admin | Tourist | Backend | Total | % của MVP |
|----------|-------|---------|---------|-------|-----------|
| **P0** | 10 | 7 | 5 | **22** | Core MVP |
| **P1** | 4 | 4 | 2 | **10** | MVP if time |
| **P2** | 4 | 2 | 3 | **9** | Post-MVP |
| **P3** | 0 | 5 | 0 | **5** | Future |

---

## 7. YÊU CẦU KỸ THUẬT CHI TIẾT

### 7.1 Kiến trúc hệ thống

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Kiểu kiến trúc** | ☐ Monolithic ☐ Microservices ☐ Serverless ☐ Modular Monolith | |
| **Mô hình triển khai** | ☐ On-premise ☐ Cloud (AWS/GCP/Azure) ☐ Hybrid | |
| **Khả năng scale** | ☐ Đơn region ☐ Đa region ☐ Global CDN | |
| **High Availability** | ☐ 99% ☐ 99.9% ☐ 99.99% | |
| **Số lượng concurrent users dự kiến?** | | |
| **Peak load (requests/second)?** | | |

### 7.2 Thiết kế Location Service (Dịch vụ định vị)

#### 7.2.1 Công nghệ định vị

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Công nghệ định vị chính** | ☐ GPS/Geofencing ☐ BLE Beacons ☐ WiFi ☐ QR Only ☐ Hybrid | |
| **Độ chính xác yêu cầu** | ☐ ±1m ☐ ±5m ☐ ±10m ☐ ±20m | |
| **Bán kính vùng mỗi kiosk** | ___ mét | |
| **Khoảng cách tối thiểu giữa 2 kiosk** | ___ mét | |
| **Tần suất cập nhật vị trí** | Mỗi ___ giây | |
| **Cần xác định hướng di chuyển không?** | ☐ Có ☐ Không | |
| **Phương án dự phòng (Fallback)** | ☐ QR Code ☐ Tìm thủ công ☐ Không | |

#### 7.2.2 Thuật toán xử lý vùng giao thoa

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Thuật toán xử lý overlap** | ☐ Nearest (gần nhất) ☐ Hysteresis (giữ kiosk cũ) ☐ Direction-based (theo hướng) ☐ Dwell Time (thời gian ở lại) | |
| **Cooldown time giữa 2 lần chuyển** | ___ giây | |
| **Thời gian ở lại tối thiểu để kích hoạt (Dwell time)** | ___ giây | |
| **Hình dạng vùng** | ☐ Tròn (Circle) ☐ Đa giác (Polygon) | |

#### 7.2.3 Xử lý tình huống đặc biệt (Edge Cases)

| Tình huống | Cách xử lý mong muốn |
|------------|---------------------|
| Người dùng di chuyển rất nhanh qua nhiều kiosk? | |
| Người dùng đứng yên ở vùng giao thoa 2 kiosk lâu? | |
| GPS drift/nhảy đột ngột? | |
| Beacon bị hỏng hoặc hết pin? | |
| Người dùng không cấp quyền location? | |
| Tín hiệu GPS/Beacon yếu hoặc không ổn định? | |
| App chạy background/bị kill? | |
| Nhiều người dùng trong cùng vùng (đông đúc)? | |
| Mất kết nối internet giữa chừng? | |
| Battery sắp hết? | |

#### 7.2.4 State Machine - Trạng thái User Session

> **Mục đích:** Xác định các trạng thái và điều kiện chuyển đổi của user khi tham quan

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Các trạng thái của user session?** | ☐ IDLE (chưa vào vùng nào) ☐ ENTERING (đang đi vào) ☐ IN_ZONE (đang trong vùng) ☐ TRANSITIONING (đang chuyển) ☐ PAUSED (tạm dừng) ☐ COMPLETED (đã nghe xong) | |
| **Điều kiện chuyển ENTERING → IN_ZONE?** | ☐ Dwell time đủ ☐ Signal strength đủ ☐ Ngay lập tức | |
| **Điều kiện chuyển IN_ZONE → TRANSITIONING?** | ☐ Ra khỏi vùng ☐ Vào vùng mới ☐ Cả hai | |
| **Xử lý khi quay lại kiosk đã nghe?** | ☐ Resume vị trí cũ ☐ Bắt đầu lại ☐ Hỏi người dùng | |
| **Session timeout sau bao lâu inactive?** | ___ phút | |
| **Lưu session state ở đâu?** | ☐ Client-side only ☐ Server-side ☐ Hybrid (sync định kỳ) | |

#### 7.2.5 Location Service Client

> **Mục đích:** Xác định cách xử lý vị trí phía client

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Location permission flow?** | ☐ Khi mở app ☐ Khi cần (just-in-time) ☐ Trong onboarding | |
| **Background location tracking?** | ☐ Bắt buộc ☐ Tùy chọn ☐ Không | |
| **Xử lý Battery optimization (Doze mode)?** | ☐ Request whitelist ☐ Giảm update frequency ☐ Dừng khi background | |
| **Location processing ở đâu?** | ☐ Client-side (compute locally) ☐ Server-side (gửi lên server) ☐ Hybrid | |
| **Geofencing API?** | ☐ Native geofencing API ☐ Custom implementation ☐ Third-party library | |
| **Smoothing algorithm cho GPS?** | ☐ Kalman filter ☐ Moving average ☐ Không smoothing | |



| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Định dạng audio** | ☐ MP3 (128kbps ~1MB/phút) ☐ AAC (96kbps ~0.7MB/phút) ☐ Opus (64kbps ~0.5MB/phút) | |
| **Phương thức phân phối** | ☐ Streaming (HLS) ☐ Progressive Download ☐ Pre-download | |
| **Nguồn audio** | ☐ TTS (AI tạo) ☐ Thu âm thực ☐ Kết hợp | |
| **Nhà cung cấp TTS (nếu dùng)** | ☐ Google TTS ☐ Amazon Polly ☐ Azure Speech ☐ On-device | |
| **Xử lý khi chuyển kiosk giữa chừng** | ☐ Fade out/in ☐ Cắt ngay ☐ Hoàn thành câu đang nói | |
| **Phát audio khi app ở background** | ☐ Bắt buộc ☐ Tùy chọn ☐ Không cần | |
| **Độ dài audio mỗi POI** | ☐ 30-60 giây ☐ 1-2 phút ☐ 3-5 phút | |
| **Điều khiển audio cần có** | ☐ Play/Pause ☐ Tua (Seek) ☐ Điều chỉnh tốc độ ☐ Bỏ qua | |

### 7.4 Thiết kế Database

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Loại database** | ☐ PostgreSQL+PostGIS ☐ MySQL ☐ MongoDB ☐ Firebase | |
| **Cấu trúc dữ liệu vị trí** | ☐ Point (lat,lng) ☐ Circle (tâm+bán kính) ☐ Polygon | |
| **Lịch sử phiên bản nội dung** | ☐ Có ☐ Không | |
| **Xóa mềm (Soft Delete)** | ☐ Có ☐ Không | |
| **Tầng cache** | ☐ Redis ☐ Memcached ☐ CDN Edge ☐ Không | |
| **Chiến lược invalidate cache** | ☐ Theo TTL ☐ Theo sự kiện ☐ Thủ công | |
| **Chính sách lưu trữ dữ liệu** | ___ | |
| **Tần suất backup** | ☐ Realtime ☐ Hàng ngày ☐ Hàng tuần | |

### 7.5 Thiết kế API

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Kiểu API** | ☐ REST ☐ GraphQL ☐ gRPC ☐ WebSocket | |
| **Đánh version API** | ☐ URL Path (/v1/) ☐ Header ☐ Query Param | |
| **Xác thực** | ☐ Không ☐ API Key ☐ JWT ☐ OAuth 2.0 | |
| **Thời gian hết hạn token** | ___ giờ/ngày | |
| **Giới hạn tần suất (Rate Limiting)** | ☐ Có (___/phút) ☐ Không | |
| **Phân trang** | ☐ Offset-based ☐ Cursor-based | |
| **Cần real-time updates không?** | ☐ Có ☐ Không | |
| **Công nghệ real-time (nếu cần)** | ☐ WebSocket ☐ Server-Sent Events ☐ Long Polling | |

#### 7.5.1 API Endpoints cốt lõi

> **Mục đích:** Liệt kê các endpoints chính cần implement

| # | Endpoint | Purpose | Real-time? |
|---|----------|---------|------------|
| 1 | `GET /kiosks` hoặc `GET /pois` | Danh sách tất cả POIs | ☐ Có ☐ Không |
| 2 | `GET /kiosks/:id` hoặc `GET /pois/:id` | Chi tiết POI + content | ☐ Có ☐ Không |
| 3 | `GET /kiosks/nearby?lat=&lng=` | Tìm POIs gần vị trí | ☐ Có ☐ Không |
| 4 | `POST /sessions` | Bắt đầu tour session | ☐ Có ☐ Không |
| 5 | `PUT /sessions/:id/location` | Cập nhật vị trí user | ☐ Có ☐ Không |
| 6 | `GET /sessions/:id/current-kiosk` | POI hiện tại dựa trên vị trí | ☐ Có ☐ Không |
| 7 | `POST /analytics/events` | Track user events | ☐ Có ☐ Không |
| 8 | `GET /tours` | Danh sách tours | ☐ Có ☐ Không |
| 9 | `GET /tours/:id` | Chi tiết tour + POIs | ☐ Có ☐ Không |
| 10 | Endpoint khác cần thêm? | | |

#### 7.5.2 Error Handling & Recovery

> **Mục đích:** Xác định chiến lược xử lý lỗi và khôi phục

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Retry policy cho failed requests?** | ☐ Không retry ☐ Fixed delay (___s) ☐ Exponential backoff | |
| **Số lần retry tối đa?** | ☐ 1 ☐ 3 ☐ 5 ☐ Vô hạn | |
| **Circuit breaker pattern?** | ☐ Có ☐ Không | |
| **Graceful degradation scenarios?** | | |
| - Location service down | ☐ Manual QR ☐ Tìm thủ công ☐ Thông báo lỗi | |
| - Audio service down | ☐ Chỉ text ☐ Thông báo lỗi | |
| - Database down | ☐ Dùng cached data ☐ Thông báo lỗi | |
| **Error reporting to users?** | ☐ Chi tiết ☐ Thân thiện (không kỹ thuật) ☐ Silent | |
| **Error tracking service?** | ☐ Sentry ☐ Bugsnag ☐ Rollbar ☐ Tự xây | |
| **Timeout cho API calls?** | ___ giây | |



| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Nền tảng** | ☐ PWA ☐ React Native ☐ Flutter ☐ Native iOS+Android | |
| **Phiên bản iOS tối thiểu** | ☐ 13 ☐ 14 ☐ 15 ☐ 16 | |
| **Phiên bản Android tối thiểu** | ☐ 8 (API 26) ☐ 10 (API 29) ☐ 11 (API 30) ☐ 12 (API 31) | |
| **Quản lý state** | ☐ Redux ☐ MobX ☐ Zustand ☐ Context API ☐ Riverpod | |
| **Lưu trữ offline** | ☐ SQLite ☐ IndexedDB ☐ AsyncStorage ☐ Hive | |
| **Dung lượng cache offline tối đa** | ___ MB | |
| **Xử lý vị trí ở đâu** | ☐ Client-side ☐ Server-side ☐ Hybrid | |
| **Chế độ Offline** | ☐ Bắt buộc ☐ Tùy chọn ☐ Không | |
| **Dữ liệu cần cache offline** | ☐ Danh sách kiosk ☐ Văn bản ☐ Audio ☐ Hình ảnh ☐ Map tiles | |

### 7.7 Yêu cầu bảo mật

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Bắt buộc xác thực người dùng** | ☐ Không ☐ Tùy chọn ☐ Bắt buộc | |
| **Nhà cung cấp xác thực** | ☐ Tự xây ☐ Social login (Google/FB) ☐ OTP điện thoại ☐ Anonymous | |
| **Mã hóa dữ liệu lưu trữ** | ☐ Có ☐ Không | |
| **Mã hóa dữ liệu truyền tải (HTTPS)** | ☐ Bắt buộc ☐ Tùy chọn | |
| **Xử lý dữ liệu vị trí** | ☐ Không lưu ☐ Lưu ẩn danh ☐ Lưu có đồng ý | |
| **Tuân thủ GDPR/PDPA** | ☐ Bắt buộc ☐ Không cần | |

### 7.8 Phân tích & Giám sát

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Sự kiện cần theo dõi** | ☐ Mở/đóng app ☐ Vào/ra kiosk ☐ Phát/dừng nội dung ☐ Lỗi | |
| **Nền tảng analytics** | ☐ Google Analytics ☐ Mixpanel ☐ Amplitude ☐ Tự xây | |
| **Dashboard realtime** | ☐ Có ☐ Không | |
| **Metrics cần giám sát** | ☐ Thời gian phản hồi ☐ Tỷ lệ lỗi ☐ Người dùng active ☐ CPU/Memory | |
| **Quy tắc cảnh báo** | | |
| **Dịch vụ theo dõi lỗi** | ☐ Sentry ☐ Bugsnag ☐ Rollbar ☐ Tự xây | |

### 7.9 CI/CD & DevOps

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Quản lý mã nguồn** | ☐ GitHub ☐ GitLab ☐ Bitbucket ☐ Azure DevOps | |
| **Chiến lược branching** | ☐ GitFlow ☐ Trunk-based ☐ Feature Branch | |
| **Nền tảng CI/CD** | ☐ GitHub Actions ☐ GitLab CI ☐ Jenkins ☐ CircleCI | |
| **Chiến lược triển khai** | ☐ Blue-Green ☐ Canary ☐ Rolling Update | |
| **Container orchestration** | ☐ Kubernetes ☐ Docker Compose ☐ ECS ☐ Không | |
| **Infrastructure as Code** | ☐ Terraform ☐ CloudFormation ☐ Pulumi ☐ Thủ công | |
| **Môi trường** | ☐ Development ☐ Staging ☐ Production | |

### 7.10 Quản lý nội dung (Content Management)

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Ai là người tạo/biên tập nội dung?** | ☐ Nội bộ ☐ Outsource ☐ Cộng đồng ☐ AI-generated | |
| **Quy trình phê duyệt nội dung?** | ☐ Không cần ☐ 1 cấp ☐ Đa cấp (Maker-Checker) | |
| **Workflow trạng thái nội dung?** | ☐ Draft → Published ☐ Draft → Review → Published ☐ Phức tạp hơn | |
| **Hỗ trợ lên lịch xuất bản (Scheduling)?** | ☐ Có ☐ Không | |
| **Cần chức năng Preview trước khi publish?** | ☐ Có ☐ Không | |
| **Lịch sử chỉnh sửa (Audit Log)?** | ☐ Có ☐ Không | |
| **Khôi phục phiên bản cũ (Rollback)?** | ☐ Có ☐ Không | |
| **Định dạng nội dung text hỗ trợ?** | ☐ Plain text ☐ Markdown ☐ Rich text (HTML) | |
| **Giới hạn kích thước file upload?** | Hình: ___ MB, Audio: ___ MB | |
| **Tự động nén/resize hình ảnh?** | ☐ Có ☐ Không | |
| **Hỗ trợ template nội dung?** | ☐ Có ☐ Không | |
| **Tìm kiếm nội dung trong Admin?** | ☐ Cơ bản ☐ Full-text search ☐ Filters nâng cao | |

### 7.11 Đa ngôn ngữ (i18n/L10n)

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Ngôn ngữ mặc định?** | ☐ Tiếng Việt ☐ Tiếng Anh | |
| **Danh sách ngôn ngữ hỗ trợ MVP?** | ☐ VN ☐ EN ☐ CN ☐ KR ☐ JP ☐ FR ☐ Khác: ___ | |
| **Chiến lược fallback khi thiếu bản dịch?** | ☐ Hiển thị ngôn ngữ mặc định ☐ Ẩn nội dung ☐ Thông báo lỗi | |
| **Ai dịch nội dung?** | ☐ Dịch thủ công ☐ AI translation ☐ Kết hợp | |
| **Có cần hỗ trợ RTL (Arabic, Hebrew)?** | ☐ Có ☐ Không | |
| **Audio mỗi ngôn ngữ riêng hay TTS?** | ☐ Thu âm riêng ☐ TTS tự động ☐ Kết hợp | |
| **Tự động detect ngôn ngữ thiết bị?** | ☐ Có ☐ Không | |
| **Cho phép người dùng đổi ngôn ngữ giữa chừng?** | ☐ Có ☐ Không | |
| **Lưu language preference?** | ☐ Local storage ☐ Server (nếu có account) ☐ Cả hai | |
| **Nội dung nào cần dịch đầu tiên?** | | |

### 7.12 Chiến lược Testing & QA

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Loại testing yêu cầu?** | ☐ Unit ☐ Integration ☐ E2E ☐ Manual | |
| **Mục tiêu code coverage?** | ☐ >60% ☐ >70% ☐ >80% ☐ Không yêu cầu | |
| **Testing framework Frontend?** | ☐ Jest ☐ Vitest ☐ Cypress ☐ Playwright | |
| **Testing framework Backend?** | ☐ Jest ☐ pytest ☐ JUnit ☐ Khác: ___ | |
| **Mobile testing approach?** | ☐ Emulator ☐ Real devices ☐ Cloud (BrowserStack/Sauce Labs) | |
| **Performance testing?** | ☐ Có ☐ Không | |
| **Load testing tool?** | ☐ k6 ☐ JMeter ☐ Artillery ☐ Không | |
| **Security testing/Pen test?** | ☐ Có ☐ Không | |
| **Accessibility testing?** | ☐ Có ☐ Không | |
| **UAT (User Acceptance Testing)?** | ☐ Có ☐ Không | |
| **Regression testing approach?** | ☐ Manual ☐ Automated ☐ Cả hai | |
| **Test data management?** | ☐ Mock data ☐ Staging data ☐ Production-like | |
| **Bug tracking tool?** | ☐ Jira ☐ Linear ☐ GitHub Issues ☐ Khác: ___ | |

### 7.13 UX/Onboarding & User Flows

| Câu hỏi | Mô tả chi tiết |
|---------|----------------|
| **First-time user experience như thế nào?** | ☐ Onboarding slides ☐ Interactive tutorial ☐ Skip to app ☐ Video hướng dẫn |
| **Cần yêu cầu permissions ngay từ đầu?** | ☐ Khi cần (Just-in-time) ☐ Ngay khi mở app ☐ Tùy chọn |
| **Có màn hình Splash screen?** | ☐ Có ☐ Không |
| **Có cần Login để sử dụng?** | ☐ Bắt buộc ☐ Tùy chọn ☐ Không cần |
| **User flow chính của Tourist App?** | (Mô tả các bước từ mở app đến hoàn thành tour) |
| **User flow chính của Admin Dashboard?** | (Mô tả các bước từ login đến tạo/quản lý POI/Tour) |
| **Xử lý empty states như thế nào?** | ☐ Illustration + CTA ☐ Text đơn giản ☐ Không xử lý |
| **Loading states design?** | ☐ Skeleton ☐ Spinner ☐ Progress bar ☐ Shimmer |
| **Error states design?** | ☐ Toast ☐ Modal ☐ Inline message ☐ Full screen |
| **Có tooltip/hints cho features phức tạp?** | ☐ Có ☐ Không |
| **Dark mode support?** | ☐ Có ☐ Không ☐ System preference |
| **Gestures nào cần hỗ trợ (mobile)?** | ☐ Swipe ☐ Pinch zoom ☐ Long press ☐ Pull to refresh |

### 7.14 Tích hợp hệ thống & Migration

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Có hệ thống cũ cần tích hợp không?** | ☐ Có ☐ Không | |
| **Nếu có, hệ thống nào?** | | |
| **Cần migrate dữ liệu từ hệ thống cũ?** | ☐ Có ☐ Không | |
| **Khối lượng dữ liệu cần migrate?** | ___ records / ___ GB | |
| **Tích hợp với hệ thống booking/payment?** | ☐ Có (Phase nào?) ☐ Không | |
| **Tích hợp với CRM?** | ☐ Có ☐ Không | |
| **Tích hợp với hệ thống quản lý du lịch khác?** | ☐ Có ☐ Không | |
| **Export data (CSV, Excel)?** | ☐ Có ☐ Không | |
| **Import data từ file?** | ☐ Có ☐ Không | |
| **Webhook notifications đến hệ thống khác?** | ☐ Có ☐ Không | |
| **Single Sign-On (SSO)?** | ☐ Có ☐ Không | |

### 7.15 Nguồn lực & Timeline

| Câu hỏi | Trả lời |
|---------|---------|
| **Timeline dự kiến cho MVP?** | ___ tuần/tháng |
| **Deadline cứng (nếu có)?** | DD/MM/YYYY |
| **Budget range?** | ☐ < 50M ☐ 50-100M ☐ 100-200M ☐ > 200M VND |
| **Số lượng developer?** | Frontend: ___, Backend: ___, Mobile: ___ |
| **Có Designer riêng?** | ☐ Có (Full-time) ☐ Có (Part-time) ☐ Không |
| **Có QA/Tester riêng?** | ☐ Có ☐ Không |
| **Có DevOps riêng?** | ☐ Có ☐ Không |
| **Có Product Owner dedicated?** | ☐ Có ☐ Không |
| **Sprint length?** | ☐ 1 tuần ☐ 2 tuần ☐ 3 tuần ☐ 4 tuần |
| **Meeting cadence?** | Daily standup: ___, Sprint Review: ___ |
| **Kênh communication chính?** | ☐ Slack ☐ Teams ☐ Discord ☐ Telegram ☐ Khác: ___ |
| **Documentation tool?** | ☐ Confluence ☐ Notion ☐ GitBook ☐ Markdown in repo |
| **Project management tool?** | ☐ Jira ☐ Linear ☐ Trello ☐ Asana ☐ GitHub Projects |

### 7.16 Pháp lý & Compliance

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Bản quyền nội dung thuyết minh?** | ☐ Tự sở hữu ☐ License từ bên thứ 3 ☐ Creative Commons | |
| **Bản quyền hình ảnh?** | ☐ Tự chụp ☐ Mua license ☐ Stock photos ☐ User-generated | |
| **Terms of Service cần không?** | ☐ Có ☐ Không | |
| **Privacy Policy cần không?** | ☐ Có ☐ Không | |
| **Cookie consent (nếu Web)?** | ☐ Có ☐ Không | |
| **Age restriction?** | ☐ Không ☐ 13+ ☐ 18+ | |
| **Data residency requirement?** | ☐ Phải lưu tại Việt Nam ☐ Không yêu cầu | |
| **Cần tuân thủ PDPA (Vietnam)?** | ☐ Có ☐ Không | |
| **Cần tuân thủ GDPR (nếu có user EU)?** | ☐ Có ☐ Không | |
| **Accessibility compliance (Section 508, WCAG)?** | ☐ Có ☐ Không | |
| **Có cần đăng ký với Bộ TT&TT?** | ☐ Có ☐ Không ☐ Chưa rõ | |

### 7.17 Hỗ trợ & Bảo trì sau Launch

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **SLA hỗ trợ (response time)?** | ☐ < 1h ☐ < 4h ☐ < 24h ☐ Không cam kết | |
| **Kênh support cho end-user?** | ☐ Email ☐ Hotline ☐ In-app chat ☐ FAQ/Help center | |
| **Kênh support cho Admin?** | ☐ Email ☐ Hotline ☐ Slack/Teams ☐ Ticketing system | |
| **Ai chịu trách nhiệm maintain sau launch?** | ☐ Team nội bộ ☐ Vendor ☐ Chưa xác định | |
| **Kế hoạch update/patch?** | ☐ Hàng tuần ☐ Hàng tháng ☐ Quarterly ☐ Khi cần | |
| **Hotfix process?** | (Mô tả quy trình vá lỗi khẩn cấp) | |
| **Monitoring 24/7?** | ☐ Có ☐ Chỉ giờ hành chính ☐ Không | |
| **On-call rotation?** | ☐ Có ☐ Không | |

### 7.18 Thu thập phản hồi người dùng

| Câu hỏi | Lựa chọn | Trả lời |
|---------|----------|---------|
| **Cơ chế thu thập feedback trong app?** | ☐ Rating/Review ☐ Feedback form ☐ Survey popup ☐ Không | |
| **Tích hợp App Store review prompt?** | ☐ Có ☐ Không | |
| **NPS (Net Promoter Score) survey?** | ☐ Có ☐ Không | |
| **Heatmap/Session recording?** | ☐ Có (Hotjar/FullStory) ☐ Không | |
| **A/B testing platform?** | ☐ Có ☐ Không | |
| **User interview/Usability testing?** | ☐ Có (khi nào?) ☐ Không | |
| **Beta testing program?** | ☐ Có ☐ Không | |
| **Feature request channel?** | ☐ In-app ☐ Email ☐ Public roadmap ☐ Không | |

---

## 8. YÊU CẦU PHI CHỨC NĂNG (NFRs)

### 8.1 Hiệu năng (Performance)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-P001 | Thời gian phản hồi API | ☐ <100ms ☐ <500ms ☐ <1s | ☐M ☐S ☐C |
| NFR-P002 | Thời gian khởi động app | ☐ <2s ☐ <3s ☐ <5s | ☐M ☐S ☐C |
| NFR-P003 | Thời gian hiển thị nội dung đầu tiên | ☐ <1s ☐ <2s ☐ <3s | ☐M ☐S ☐C |
| NFR-P004 | Độ trễ chuyển đổi vị trí | ☐ <1s ☐ <2s ☐ <3s | ☐M ☐S ☐C |
| NFR-P005 | Render bản đồ (100 POIs) | ☐ <1s ☐ <2s ☐ <3s | ☐M ☐S ☐C |
| NFR-P006 | Số lượng Concurrent Users | ___ người | ☐M ☐S ☐C |

### 8.2 Khả dụng & Độ tin cậy

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-A001 | Uptime SLA | ☐ 99% ☐ 99.9% ☐ 99.99% | ☐M ☐S ☐C |
| NFR-A002 | RTO (Thời gian phục hồi) | ☐ <1h ☐ <4h ☐ <24h | ☐M ☐S ☐C |
| NFR-A003 | RPO (Mất mát dữ liệu chấp nhận được) | ☐ 0 ☐ <1h ☐ <24h | ☐M ☐S ☐C |
| NFR-A004 | Tần suất backup | ☐ Realtime ☐ Hàng ngày ☐ Hàng tuần | ☐M ☐S ☐C |

### 8.3 Khả năng sử dụng (Usability)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-U001 | Tỷ lệ hoàn thành tác vụ | ≥ ___% | ☐M ☐S ☐C |
| NFR-U002 | Tỷ lệ lỗi | ≤ ___% | ☐M ☐S ☐C |
| NFR-U003 | Accessibility (WCAG) | ☐ 2.0 AA ☐ 2.1 AA ☐ Không yêu cầu | ☐M ☐S ☐C |
| NFR-U004 | Thiết kế responsive | ☐ Desktop ☐ Tablet ☐ Mobile | ☐M ☐S ☐C |

### 8.4 Khả năng mở rộng (Scalability)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-S001 | Horizontal Scaling | ☐ Bắt buộc ☐ Nên có | ☐M ☐S ☐C |
| NFR-S002 | Auto-scaling | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-S003 | Số POIs tối đa mỗi địa điểm | ___ POIs | ☐M ☐S ☐C |
| NFR-S004 | Số Tours tối đa | ___ tours | ☐M ☐S ☐C |
| NFR-S005 | Số users đồng thời tối đa | ___ users | ☐M ☐S ☐C |
| NFR-S006 | Số audio streams đồng thời | ___ streams | ☐M ☐S ☐C |

### 8.5 Bảo mật (Security) - Chi tiết

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-SEC001 | OWASP Top 10 compliance | ☐ Đầy đủ ☐ Một phần ☐ Không | ☐M ☐S ☐C |
| NFR-SEC002 | Penetration testing frequency | ☐ Trước mỗi release ☐ Quarterly ☐ Yearly ☐ Không | ☐M ☐S ☐C |
| NFR-SEC003 | Vulnerability scanning | ☐ Tự động (CI/CD) ☐ Thủ công ☐ Không | ☐M ☐S ☐C |
| NFR-SEC004 | Password policy | Min: ___ chars, Complexity: ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-SEC005 | Session timeout | ___ phút inactive | ☐M ☐S ☐C |
| NFR-SEC006 | Failed login lockout | Sau ___ lần, lock ___ phút | ☐M ☐S ☐C |
| NFR-SEC007 | Security headers (CSP, HSTS, X-Frame) | ☐ Đầy đủ ☐ Một phần ☐ Không | ☐M ☐S ☐C |
| NFR-SEC008 | API security (Rate limit, Input validation) | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-SEC009 | Secrets management | ☐ Vault ☐ Environment vars ☐ Khác | ☐M ☐S ☐C |
| NFR-SEC010 | Dependency vulnerability check | ☐ Dependabot ☐ Snyk ☐ Không | ☐M ☐S ☐C |

### 8.6 Dữ liệu & Tính toàn vẹn (Data Integrity)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-DI001 | Data validation (input) | ☐ Client ☐ Server ☐ Cả hai | ☐M ☐S ☐C |
| NFR-DI002 | Referential integrity | ☐ Bắt buộc ☐ Không | ☐M ☐S ☐C |
| NFR-DI003 | Transaction consistency (ACID) | ☐ Bắt buộc ☐ Eventual ☐ Không | ☐M ☐S ☐C |
| NFR-DI004 | Data deduplication | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-DI005 | Orphan data cleanup | ☐ Tự động ☐ Thủ công ☐ Không | ☐M ☐S ☐C |
| NFR-DI006 | Data consistency across services | ☐ Strong ☐ Eventual ☐ N/A | ☐M ☐S ☐C |

### 8.7 Khả năng bảo trì (Maintainability)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-MT001 | Code documentation coverage | ☐ >50% ☐ >70% ☐ >90% ☐ Không yêu cầu | ☐M ☐S ☐C |
| NFR-MT002 | Technical debt tracking | ☐ Có (tool: ___) ☐ Không | ☐M ☐S ☐C |
| NFR-MT003 | Code linting/formatting | ☐ ESLint/Prettier ☐ Khác ☐ Không | ☐M ☐S ☐C |
| NFR-MT004 | Modular architecture | ☐ Bắt buộc ☐ Nên có ☐ Không | ☐M ☐S ☐C |
| NFR-MT005 | API documentation (Swagger/OpenAPI) | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-MT006 | Max cyclomatic complexity per function | ≤ ___ | ☐M ☐S ☐C |
| NFR-MT007 | Deployment rollback capability | ☐ < 5 phút ☐ < 15 phút ☐ Thủ công | ☐M ☐S ☐C |

### 8.8 Khả năng tương thích (Compatibility)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-CP001 | Browser support | ☐ Chrome ☐ Firefox ☐ Safari ☐ Edge (Versions: last ___) | ☐M ☐S ☐C |
| NFR-CP002 | Mobile OS support | iOS: ≥___, Android: ≥___ | ☐M ☐S ☐C |
| NFR-CP003 | Screen sizes | ☐ 320px+ ☐ 375px+ ☐ 768px+ ☐ 1024px+ | ☐M ☐S ☐C |
| NFR-CP004 | API backward compatibility | ☐ Bắt buộc (deprecation notice ≥___ tháng) ☐ Không | ☐M ☐S ☐C |
| NFR-CP005 | Data format compatibility (import/export) | ☐ JSON ☐ CSV ☐ XML ☐ Excel | ☐M ☐S ☐C |
| NFR-CP006 | Third-party integration stability | API version locking: ☐ Có ☐ Không | ☐M ☐S ☐C |

### 8.9 Khả năng phục hồi (Recoverability)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-RC001 | MTTR (Mean Time To Recovery) | ☐ < 15 phút ☐ < 1h ☐ < 4h | ☐M ☐S ☐C |
| NFR-RC002 | Automatic failover | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-RC003 | Data restoration time | ☐ < 1h ☐ < 4h ☐ < 24h | ☐M ☐S ☐C |
| NFR-RC004 | Disaster recovery plan | ☐ Documented ☐ Tested ☐ Không | ☐M ☐S ☐C |
| NFR-RC005 | Graceful degradation | ☐ Có (fallback features) ☐ Không | ☐M ☐S ☐C |
| NFR-RC006 | Circuit breaker pattern | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-RC007 | Health check endpoints | ☐ Có ☐ Không | ☐M ☐S ☐C |

### 8.10 Khả năng kiểm toán (Auditability)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-AU001 | Audit log cho admin actions | ☐ Đầy đủ ☐ Critical only ☐ Không | ☐M ☐S ☐C |
| NFR-AU002 | User activity logging | ☐ Có ☐ Không | ☐M ☐S ☐C |
| NFR-AU003 | Log retention period | ___ ngày/tháng | ☐M ☐S ☐C |
| NFR-AU004 | Log format | ☐ Structured (JSON) ☐ Plain text | ☐M ☐S ☐C |
| NFR-AU005 | Log aggregation | ☐ ELK ☐ CloudWatch ☐ Datadog ☐ Khác ☐ Không | ☐M ☐S ☐C |
| NFR-AU006 | Traceability (Correlation ID) | ☐ Có ☐ Không | ☐M ☐S ☐C |

### 8.11 Bản địa hóa (Localization)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-L10N001 | Timezone support | ☐ UTC only ☐ User timezone ☐ Server timezone | ☐M ☐S ☐C |
| NFR-L10N002 | Date/Time format | ☐ ISO 8601 ☐ Locale-specific ☐ Configurable | ☐M ☐S ☐C |
| NFR-L10N003 | Number format (decimal separator) | ☐ Locale-specific ☐ Fixed | ☐M ☐S ☐C |
| NFR-L10N004 | Currency display | ☐ VND ☐ USD ☐ Multi-currency | ☐M ☐S ☐C |
| NFR-L10N005 | UI text externalization | ☐ 100% ☐ >90% ☐ Hardcoded OK | ☐M ☐S ☐C |
| NFR-L10N006 | Content unicode support (UTF-8) | ☐ Bắt buộc ☐ Không | ☐M ☐S ☐C |

### 8.12 Ràng buộc môi trường (Environmental Constraints)

| ID | Yêu cầu | Mục tiêu | MoSCoW |
|----|---------|----------|--------|
| NFR-ENV001 | Network conditions | ☐ 4G/LTE ☐ 3G ☐ Offline capable | ☐M ☐S ☐C |
| NFR-ENV002 | Battery consumption (mobile) | ☐ < 5%/h ☐ < 10%/h ☐ Không theo dõi | ☐M ☐S ☐C |
| NFR-ENV003 | Memory usage (mobile app) | ☐ < 100MB ☐ < 200MB ☐ < 500MB | ☐M ☐S ☐C |
| NFR-ENV004 | App size (download) | ☐ < 20MB ☐ < 50MB ☐ < 100MB | ☐M ☐S ☐C |
| NFR-ENV005 | Server resource constraints | CPU: ___ cores, RAM: ___ GB | ☐M ☐S ☐C |
| NFR-ENV006 | Storage growth rate | ___ GB/month estimate | ☐M ☐S ☐C |

---

## 9. GIẢ ĐỊNH & PHỤ THUỘC

### 9.1 Các giả định (Assumptions)

| ID | Giả định | Hậu quả nếu sai | Đã xác minh? |
|----|----------|-----------------|--------------|
| A001 | Backend APIs đã hoàn thiện và đúng spec | Trì hoãn lớn | ☐ Có ☐ Chưa |
| A002 | Độ chính xác GPS ±5m là đủ | Cần BLE Beacons | ☐ Có ☐ Chưa |
| A003 | Khoảng cách tối thiểu giữa kiosk > 10m | Vấn đề overlap | ☐ Có ☐ Chưa |
| A004 | Nội dung (text/audio) sẽ được cung cấp đúng hạn | Cần nội dung giả | ☐ Có ☐ Chưa |
| A005 | Người dùng có internet 4G ổn định | Chế độ offline quan trọng | ☐ Có ☐ Chưa |
| A006 | Kiosk có nguồn điện (cho Beacons) | Vấn đề pin | ☐ Có ☐ Chưa |
| A007 | | | ☐ Có ☐ Chưa |

### 9.2 Các phụ thuộc (Dependencies)

| ID | Phụ thuộc | Loại | Chủ sở hữu | Trạng thái | Tác động |
|----|-----------|------|------------|------------|----------|
| D001 | Backend API sẵn sàng | Ngoài | Backend Team | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |
| D002 | API Key Map Provider | Ngoài | Ops | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |
| D003 | Tạo nội dung | Nội dung | Content Team | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |
| D004 | Thu âm audio | Nội dung | Content Team | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |
| D005 | Thiết kế UI/UX | Nội bộ | Design | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |
| D006 | Thiết lập hạ tầng | Nội bộ | DevOps | ☐ Sẵn sàng ☐ Đang làm ☐ Bị chặn | |

---

## 10. RỦI RO & BIỆN PHÁP

### 10.1 Sổ đăng ký rủi ro (Risk Register)

| ID | Rủi ro | Xác suất | Tác động | Biện pháp giảm thiểu | Chủ sở hữu | Trạng thái |
|----|--------|----------|----------|---------------------|------------|------------|
| R001 | GPS không chính xác trong nhà/đô thị | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | QR fallback, BLE Beacons | | ☐ Mở ☐ Đã giảm thiểu |
| R002 | Vùng giao thoa gây nhấp nháy chuyển đổi | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Thuật toán Hysteresis | | ☐ Mở ☐ Đã giảm thiểu |
| R003 | Hao pin cao do GPS | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Tối ưu polling, giới hạn background | | ☐ Mở ☐ Đã giảm thiểu |
| R004 | API contract không khớp với backend | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Review API sớm, mock data | | ☐ Mở ☐ Đã giảm thiểu |
| R005 | Chậm trễ cung cấp nội dung | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Nội dung placeholder | | ☐ Mở ☐ Đã giảm thiểu |
| R006 | Mạng yếu tại khu du lịch | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Chế độ offline, tải trước | | ☐ Mở ☐ Đã giảm thiểu |
| R007 | Người dùng từ chối quyền location | ☐Cao ☐TB ☐Thấp | ☐Cao ☐TB ☐Thấp | Graceful degradation, chế độ thủ công | | ☐ Mở ☐ Đã giảm thiểu |

### 10.2 Ma trận rủi ro

```
           │ Tác động Thấp │ Tác động TB  │ Tác động Cao │
───────────┼───────────────┼──────────────┼──────────────┤
Xác suất   │               │              │ R001, R003   │
Cao        │               │              │              │
───────────┼───────────────┼──────────────┼──────────────┤
Xác suất   │               │ R002, R005   │ R004         │
Trung bình │               │              │              │
───────────┼───────────────┼──────────────┼──────────────┤
Xác suất   │               │ R007         │ R006         │
Thấp       │               │              │              │
───────────┴───────────────┴──────────────┴──────────────┘
```

---

## 11. DEFINITION OF READY (DoR) & DEFINITION OF DONE (DoD)

### 11.1 Checklist User Story sẵn sàng (DoR)

Một User Story được coi là "Ready" khi:

- [ ] User Story được viết theo format: "Với vai trò [role], tôi muốn [goal] để [benefit]"
- [ ] Acceptance Criteria rõ ràng, đo lường được (Given-When-Then)
- [ ] Story có Priority (P0/P1/P2/P3) được gán
- [ ] Story được estimate (Story Points)
- [ ] Dependencies được xác định và không bị block
- [ ] UI/UX mockups có sẵn (nếu áp dụng)
- [ ] Phương pháp kỹ thuật được thảo luận
- [ ] Story đủ nhỏ để hoàn thành trong 1 Sprint

### 11.2 Checklist Sprint sẵn sàng

- [ ] Product Backlog được ưu tiên
- [ ] Sprint Goal rõ ràng
- [ ] Năng lực nhóm được xác định
- [ ] Môi trường kỹ thuật sẵn sàng
- [ ] Stakeholders sẵn sàng cho các câu hỏi

### 11.3 Definition of Done (DoD)

Một User Story được coi là "Done" khi:

**Code & Development:**
- [ ] Code được viết và pass tất cả unit tests
- [ ] Code được review bởi ít nhất 1 developer khác
- [ ] Không có critical/high severity bugs
- [ ] Code tuân thủ coding standards (lint pass)
- [ ] Tất cả acceptance criteria được đáp ứng

**Testing:**
- [ ] Unit tests đạt coverage > ___% (tùy team quy định)
- [ ] Integration tests pass
- [ ] E2E tests pass (nếu áp dụng)
- [ ] QA sign-off (manual test pass)
- [ ] Performance không regression

**Documentation:**
- [ ] API documentation cập nhật (nếu thay đổi API)
- [ ] README/User guide cập nhật (nếu cần)
- [ ] Changelog entry added

**Deployment:**
- [ ] Feature deployed to staging environment
- [ ] Smoke test pass trên staging
- [ ] PO/Stakeholder demo và chấp nhận

---

## 12. CÂU HỎI CHƯA GIẢI ĐÁP

### 12.1 Câu hỏi nghiệp vụ

| ID | Câu hỏi | Giao cho | Hạn | Trạng thái | Trả lời |
|----|---------|----------|-----|------------|---------|
| Q001 | Timeline/deadline cho MVP là khi nào? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q002 | Ràng buộc ngân sách? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q003 | Ai cung cấp nội dung (text/audio)? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q004 | Ngôn ngữ ưu tiên cho MVP? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q005 | Đây là dự án cho đơn vị nào? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q006 | Có kế hoạch mở rộng sang địa điểm khác không? | PO | | ☐ Mở ☐ Đã trả lời | |

### 12.2 Câu hỏi kỹ thuật

| ID | Câu hỏi | Giao cho | Hạn | Trạng thái | Trả lời |
|----|---------|----------|-----|------------|---------|
| Q007 | Tài liệu Backend API ở đâu? | Backend | | ☐ Mở ☐ Đã trả lời | |
| Q008 | Quyết định GPS vs Beacon? | Tech Lead | | ☐ Mở ☐ Đã trả lời | |
| Q009 | Số lượng và vị trí các kiosk? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q010 | Khoảng cách tối thiểu giữa các kiosk? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q011 | Nhà cung cấp bản đồ (Google Maps/Mapbox)? | Tech Lead | | ☐ Mở ☐ Đã trả lời | |
| Q012 | Backend sử dụng công nghệ gì? | Backend | | ☐ Mở ☐ Đã trả lời | |

### 12.3 Câu hỏi về Shop Owner

| ID | Câu hỏi | Giao cho | Hạn | Trạng thái | Trả lời |
|----|---------|----------|-----|------------|---------|
| Q015 | Shop Owner có thể tự đăng ký tài khoản không? | PO | | ☑ Đã trả lời | Có — chọn role khi đăng ký (Tourist/Shop Owner) |
| Q016 | Mỗi Shop Owner quản lý bao nhiêu POI? | PO | | ☑ Đã trả lời | Nhiều POIs (chuỗi quán) |
| Q017 | Shop Owner có cần Admin duyệt trước khi POI lên app không? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q018 | Shop Owner có xem được analytics của POI mình không? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q019 | Shop Owner có thể tạo/quản lý Tour không? | PO | | ☑ Đã trả lời | Không — chỉ Admin |
| Q020 | Có cần xác minh thông tin Shop Owner (giấy phép kinh doanh)? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q021 | Shop Owner có thể thêm giờ mở cửa, menu, giá vào POI không? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q022 | Có phân biệt loại POI (quán ăn vs điểm tham quan) không? | PO | | ☑ Đã trả lời | Không |
| Q023 | Shop Owner có được xóa POI không hay chỉ Admin? | PO | | ☐ Mở ☐ Đã trả lời | |
| Q024 | Khi Shop Owner đăng ký, cần những thông tin gì? (Tên quán, địa chỉ, sđt...) | PO | | ☐ Mở ☐ Đã trả lời | |

### 12.4 Câu hỏi thiết kế

| ID | Câu hỏi | Giao cho | Hạn | Trạng thái | Trả lời |
|----|---------|----------|-----|------------|---------|
| Q013 | Design system đã được định nghĩa chưa? | Design | | ☐ Mở ☐ Đã trả lời | |
| Q014 | Brand guidelines có sẵn không? | Design | | ☐ Mở ☐ Đã trả lời | |

---

## 13. PHÊ DUYỆT

### 13.1 Phê duyệt tài liệu

| Vai trò | Tên | Chữ ký | Ngày |
|---------|-----|--------|------|
| **Product Owner** | | | |
| **Scrum Master** | | | |
| **Tech Lead** | | | |
| **UX Lead** | | | |

### 13.2 Các bước tiếp theo

- [ ] Review tài liệu với stakeholders
- [ ] Trả lời các câu hỏi chưa giải đáp (Section 12)
- [ ] Điền Priority (P0-P3) cho các features chưa xác định
- [ ] Điền Success Metrics targets (Section 1.3)
- [ ] Tạo Sprint 1 Backlog từ P0 features
- [ ] Pass Gate 1 → Chuyển sang Step 2 (Low-code)

---

## 📝 Lịch sử chỉnh sửa

| Phiên bản | Ngày | Tác giả | Thay đổi |
|-----------|------|---------|----------|
| 1.0 | 2026-02-07 | AI Assistant | Bản nháp đầu tiên |
| 2.0 | 2026-02-08 | AI Assistant | Thêm Glossary, Success Metrics, Out of Scope, DoD. Chuyển từ MoSCoW sang P0-P3. Thêm Backend features. |
| 2.1 | 2026-02-10 | AI Assistant | Thêm Shop Owner role, business analysis questions (Q015-Q024). Cập nhật scope. |

---

> **Trạng thái tài liệu:** ☑ Bản nháp ☐ Đang review ☐ Đã phê duyệt ☐ Thay thế
