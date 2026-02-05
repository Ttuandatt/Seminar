# 📋 THU THẬP YÊU CẦU - Ứng dụng Thuyết minh Phố Ẩm thực Vĩnh Khánh

> **Mục đích:** Tài liệu này chứa các câu hỏi phỏng vấn để thu thập và xác định rõ ràng yêu cầu dự án.
> 
> **Hướng dẫn:** Điền câu trả lời vào cột "Trả lời" hoặc đánh dấu ☑ vào các checkbox phù hợp.

---

## PHẦN A: YÊU CẦU NGHIỆP VỤ (BUSINESS REQUIREMENTS)

### A1. 🎯 Tổng quan & Phạm vi

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| A1.1 | Mục tiêu chính của ứng dụng là gì? | |
| A1.2 | Đây là dự án cho đơn vị nào? (UBND, tổ chức du lịch, startup...) | |
| A1.3 | Có kế hoạch mở rộng sang địa điểm khác không? | |
| A1.4 | Số lượng user đồng thời dự kiến cao nhất? | |

### A2. 🏪 Đặc điểm Kiosk

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| A2.1 | Tổng số kiosk hiện tại? | |
| A2.2 | Khoảng cách trung bình giữa 2 kiosk? (mét) | |
| A2.3 | Khoảng cách ngắn nhất giữa 2 kiosk? (mét) | |
| A2.4 | Chiều dài tổng thể con phố? (mét) | |
| A2.5 | Các kiosk có cố định hay thay đổi? | |

---

## PHẦN B: THIẾT KẾ HỆ THỐNG (SYSTEM DESIGN)

### B1. 🏗️ Kiến trúc Tổng thể (System Architecture)

| # | Câu hỏi | Mục đích xác định |
|---|---------|-------------------|
| B1.1 | Hệ thống cần hỗ trợ bao nhiêu concurrent users? | Sizing, scaling strategy |
| B1.2 | Peak load dự kiến? (requests/second) | Load balancing design |
| B1.3 | Yêu cầu về latency tối đa cho response? | Performance requirements |
| B1.4 | Kiến trúc ưu tiên? | Architecture decision |
| | ☐ Monolithic (đơn giản, nhanh triển khai) | |
| | ☐ Microservices (scale độc lập) | |
| | ☐ Serverless (pay-per-use) | |
| | ☐ Hybrid | |
| B1.5 | Cần high availability không? (99.9% uptime?) | HA strategy |
| B1.6 | Có yêu cầu disaster recovery không? | DR planning |
| B1.7 | Multi-region deployment cần không? | Infrastructure design |

### B2. 📍 Thiết kế Module Định vị (Location Service Design)

#### B2.1 Công nghệ định vị

| # | Câu hỏi | Trade-offs cần xem xét |
|---|---------|------------------------|
| B2.1.1 | Công nghệ định vị chính? | |
| | ☐ **GPS/Geofencing** | Accuracy ±5-10m, free, battery drain |
| | ☐ **BLE Beacons** | Accuracy ±1-3m, hardware cost ~$15-30/beacon |
| | ☐ **WiFi Fingerprinting** | Accuracy ±3-5m, cần WiFi APs |
| | ☐ **UWB (Ultra-Wideband)** | Accuracy ±10cm, expensive hardware |
| | ☐ **QR only** (manual scan) | No auto-switch, cheapest |
| | ☐ **Hybrid** (kết hợp) | Best accuracy, highest complexity |
| B2.1.2 | Fallback strategy khi công nghệ chính fail? | |
| B2.1.3 | Có cần xác định hướng di chuyển (heading)? | Direction-based switching |

#### B2.2 Thuật toán xác định vùng (Zone Detection Algorithm)

| # | Câu hỏi | Ảnh hưởng đến thiết kế |
|---|---------|------------------------|
| B2.2.1 | Bán kính vùng của mỗi kiosk? (mét) | Zone overlap calculation |
| B2.2.2 | Hình dạng vùng: tròn hay polygon? | Geofence complexity |
| B2.2.3 | Tần suất update vị trí? (mỗi bao nhiêu giây) | Battery vs accuracy trade-off |
| B2.2.4 | Thuật toán xử lý vùng giao thoa? | |
| | ☐ **Nearest kiosk** (khoảng cách ngắn nhất) | Simple, may flicker |
| | ☐ **Hysteresis** (giữ kiosk cũ trừ khi vượt threshold) | Stable, delayed switch |
| | ☐ **Direction-based** (theo hướng di chuyển) | Smart, complex implementation |
| | ☐ **Dwell time** (ở đủ lâu mới chuyển) | Stable, may miss quick visits |
| | ☐ **Signal strength decay** (beacon RSSI) | Accurate, beacon-only |
| B2.2.5 | Cooldown time giữa 2 lần chuyển? (seconds) | Prevent rapid switching |
| B2.2.6 | Minimum dwell time để trigger thuyết minh? | Filter accidental entries |

#### B2.3 Xử lý Edge Cases định vị

| # | Câu hỏi | Kịch bản |
|---|---------|----------|
| B2.3.1 | User đi nhanh qua nhiều kiosk (running/biking)? | Speed threshold? Skip? |
| B2.3.2 | User đứng yên ở vùng giao thoa lâu? | Hold current? Show both? |
| B2.3.3 | GPS drift/jump đột ngột? | Smoothing algorithm? |
| B2.3.4 | Beacon bị hỏng hoặc hết pin? | Fallback, alert admin? |
| B2.3.5 | User không cho phép location permission? | Degraded mode? |
| B2.3.6 | Signal interference (nhiễu tín hiệu)? | Filtering strategy? |

### B3. 🔄 Thiết kế State Machine (User Session State)

| # | Câu hỏi | State transition design |
|---|---------|-------------------------|
| B3.1 | Các trạng thái của user session? | |
| | ☐ IDLE (chưa vào vùng nào) | |
| | ☐ ENTERING (đang đi vào vùng) | |
| | ☐ IN_ZONE (đang trong vùng, nghe thuyết minh) | |
| | ☐ TRANSITIONING (đang chuyển vùng) | |
| | ☐ PAUSED (user tạm dừng) | |
| | ☐ COMPLETED (đã nghe xong) | |
| B3.2 | Điều kiện chuyển từ ENTERING → IN_ZONE? | Dwell time? Signal strength? |
| B3.3 | Điều kiện chuyển từ IN_ZONE → TRANSITIONING? | Exit zone detection |
| B3.4 | Xử lý khi user quay lại kiosk đã nghe? | Resume position? Restart? |
| B3.5 | Session timeout sau bao lâu inactive? | Resource cleanup |
| B3.6 | Lưu session state ở đâu? | |
| | ☐ Client-side only (localStorage) | |
| | ☐ Server-side (Redis/DB) | |
| | ☐ Hybrid (sync định kỳ) | |

### B4. 🎵 Thiết kế Audio/Media Service

#### B4.1 Audio Playback

| # | Câu hỏi | Technical decision |
|---|---------|-------------------|
| B4.1.1 | Audio format? | File size vs quality |
| | ☐ MP3 (128kbps) - ~1MB/min | |
| | ☐ AAC (96kbps) - ~0.7MB/min | |
| | ☐ Opus (64kbps) - ~0.5MB/min | |
| B4.1.2 | Audio streaming hay download trước? | Latency vs data usage |
| | ☐ Progressive download | |
| | ☐ Streaming (HLS/DASH) | |
| | ☐ Pre-download all | |
| B4.1.3 | Xử lý khi chuyển kiosk giữa chừng? | |
| | ☐ Fade out → Fade in | |
| | ☐ Immediate cut | |
| | ☐ Complete current sentence first | |
| B4.1.4 | Background audio playback (khi app minimized)? | Platform-specific handling |
| B4.1.5 | Audio controls cần có? | |
| | ☐ Play/Pause | |
| | ☐ Seek (tua) | |
| | ☐ Speed adjustment (0.5x-2x) | |
| | ☐ Skip to next section | |

#### B4.2 Text-to-Speech (nếu dùng TTS)

| # | Câu hỏi | TTS implementation |
|---|---------|-------------------|
| B4.2.1 | TTS engine? | |
| | ☐ Google Cloud TTS | |
| | ☐ Amazon Polly | |
| | ☐ Azure Speech | |
| | ☐ On-device TTS | |
| B4.2.2 | Pre-generate audio hay realtime TTS? | Cost vs flexibility |
| B4.2.3 | Voice selection per language? | UX quality |
| B4.2.4 | Caching strategy cho generated audio? | Cost optimization |

### B5. 💾 Thiết kế Database

#### B5.1 Data Model

| # | Câu hỏi | Schema design |
|---|---------|---------------|
| B5.1.1 | Các entity chính cần lưu? | |
| | ☐ Kiosk (info, location, status) | |
| | ☐ Content (text, audio, images per kiosk) | |
| | ☐ Translation (multi-language content) | |
| | ☐ User (if auth required) | |
| | ☐ Session (visit history, progress) | |
| | ☐ Analytics (events, metrics) | |
| B5.1.2 | Kiosk location data structure? | |
| | ☐ Point (lat, lng) | |
| | ☐ Circle (center + radius) | |
| | ☐ Polygon (custom shape) | |
| B5.1.3 | Content versioning cần không? | Edit history, rollback |
| B5.1.4 | Soft delete hay hard delete? | Data retention policy |

#### B5.2 Database Technology

| # | Câu hỏi | Technology choice |
|---|---------|------------------|
| B5.2.1 | Database type? | |
| | ☐ **PostgreSQL** (+ PostGIS for geo) | Best for geo queries |
| | ☐ **MySQL** | Simpler, less geo support |
| | ☐ **MongoDB** | Flexible schema, geo support |
| | ☐ **Firebase/Firestore** | Realtime, serverless |
| B5.2.2 | Cần database replication không? | HA, read scaling |
| B5.2.3 | Backup frequency? | RPO requirements |
| B5.2.4 | Data retention policy? | Analytics data, GDPR |

#### B5.3 Caching Strategy

| # | Câu hỏi | Cache design |
|---|---------|--------------|
| B5.3.1 | Cần cache layer không? | Performance optimization |
| B5.3.2 | Cache technology? | |
| | ☐ Redis | |
| | ☐ Memcached | |
| | ☐ CDN edge cache | |
| | ☐ Application-level cache | |
| B5.3.3 | Cache invalidation strategy? | |
| | ☐ TTL-based | |
| | ☐ Event-based | |
| | ☐ Manual purge | |
| B5.3.4 | Client-side caching policy? | Offline support |

### B6. 📡 Thiết kế API

#### B6.1 API Architecture

| # | Câu hỏi | API design |
|---|---------|-----------|
| B6.1.1 | API style? | |
| | ☐ REST | |
| | ☐ GraphQL | |
| | ☐ gRPC | |
| | ☐ WebSocket (realtime) | |
| B6.1.2 | API versioning strategy? | v1, v2... or header-based |
| B6.1.3 | Authentication method? | |
| | ☐ None (public API) | |
| | ☐ API Key | |
| | ☐ JWT | |
| | ☐ OAuth 2.0 | |
| B6.1.4 | Rate limiting cần không? | DDoS protection |
| B6.1.5 | Pagination strategy? | |
| | ☐ Offset-based | |
| | ☐ Cursor-based | |

#### B6.2 Core API Endpoints

| # | Endpoint | Purpose | Real-time? |
|---|----------|---------|------------|
| B6.2.1 | GET /kiosks | List all kiosks | No |
| B6.2.2 | GET /kiosks/:id | Get kiosk detail + content | No |
| B6.2.3 | GET /kiosks/nearby?lat=&lng= | Find nearby kiosks | No |
| B6.2.4 | POST /sessions | Start tour session | No |
| B6.2.5 | PUT /sessions/:id/location | Update user location | Yes? |
| B6.2.6 | GET /sessions/:id/current-kiosk | Get current kiosk based on location | Yes? |
| B6.2.7 | POST /analytics/events | Track user events | No |
| B6.2.8 | Cần thêm endpoint nào khác? | |

#### B6.3 Real-time Communication

| # | Câu hỏi | Real-time design |
|---|---------|-----------------|
| B6.3.1 | Cần real-time updates không? | Push vs Pull |
| B6.3.2 | Real-time technology? | |
| | ☐ WebSocket | |
| | ☐ Server-Sent Events (SSE) | |
| | ☐ Long polling | |
| | ☐ Firebase Realtime | |
| B6.3.3 | Real-time cho feature nào? | |
| | ☐ Location updates to server | |
| | ☐ Kiosk switch notifications | |
| | ☐ Content updates push | |

### B7. 📱 Thiết kế Client Application

#### B7.1 Platform & Technology

| # | Câu hỏi | Client architecture |
|---|---------|-------------------|
| B7.1.1 | Platform target? | |
| | ☐ **PWA** (Web) - cross-platform, no install | |
| | ☐ **React Native** - iOS + Android, near-native | |
| | ☐ **Flutter** - iOS + Android, good performance | |
| | ☐ **Native iOS + Android** - best performance, 2x effort | |
| B7.1.2 | Minimum OS version support? | Feature availability |
| | iOS: ☐ 13 ☐ 14 ☐ 15 ☐ 16 | |
| | Android: ☐ 8 ☐ 10 ☐ 11 ☐ 12 | |
| B7.1.3 | State management approach? | |
| | ☐ Redux/MobX | |
| | ☐ Context API | |
| | ☐ Zustand | |
| | ☐ Riverpod (Flutter) | |

#### B7.2 Offline Capabilities

| # | Câu hỏi | Offline design |
|---|---------|---------------|
| B7.2.1 | Offline mode required? | |
| B7.2.2 | Data cần cache offline? | |
| | ☐ Kiosk list & basic info | |
| | ☐ Text content | |
| | ☐ Audio files | |
| | ☐ Images | |
| | ☐ Map tiles | |
| B7.2.3 | Sync strategy khi online lại? | Conflict resolution |
| B7.2.4 | Maximum offline cache size? (MB) | Storage limits |
| B7.2.5 | Pre-download option cho user? | Manual cache control |

#### B7.3 Location Service Client

| # | Câu hỏi | Client location handling |
|---|---------|-------------------------|
| B7.3.1 | Location permission flow? | UX for permission request |
| B7.3.2 | Background location tracking? | iOS/Android differences |
| B7.3.3 | Battery optimization handling? | Doze mode, app standby |
| B7.3.4 | Location processing: client hay server? | |
| | ☐ Client-side (compute locally) | |
| | ☐ Server-side (send location to server) | |
| | ☐ Hybrid | |
| B7.3.5 | Geofence setup: native hay custom? | |
| | ☐ Native geofencing API | |
| | ☐ Custom implementation | |

### B8. 🔐 Thiết kế Security

#### B8.1 Authentication & Authorization

| # | Câu hỏi | Security design |
|---|---------|----------------|
| B8.1.1 | User authentication required? | |
| | ☐ No auth (anonymous) | |
| | ☐ Optional (for saving progress) | |
| | ☐ Required | |
| B8.1.2 | Auth provider? | |
| | ☐ Custom (email/password) | |
| | ☐ Social login (Google, Facebook) | |
| | ☐ Phone OTP | |
| | ☐ Anonymous with device ID | |
| B8.1.3 | Token type? | |
| | ☐ JWT (stateless) | |
| | ☐ Session-based (stateful) | |
| B8.1.4 | Token expiration policy? | Security vs UX |
| B8.1.5 | Refresh token mechanism? | |

#### B8.2 Data Security

| # | Câu hỏi | Data protection |
|---|---------|----------------|
| B8.2.1 | Data encryption at rest? | |
| B8.2.2 | Data encryption in transit? (HTTPS) | |
| B8.2.3 | PII data handling? | GDPR/PDPA compliance |
| B8.2.4 | Location data privacy? | |
| | ☐ Not stored on server | |
| | ☐ Stored anonymized | |
| | ☐ Stored with consent | |
| B8.2.5 | Data anonymization for analytics? | |

#### B8.3 API Security

| # | Câu hỏi | API protection |
|---|---------|---------------|
| B8.3.1 | Rate limiting thresholds? | |
| B8.3.2 | DDoS protection needed? | |
| B8.3.3 | Input validation approach? | |
| B8.3.4 | SQL injection prevention? | |
| B8.3.5 | CORS policy? | |

### B9. 📊 Thiết kế Analytics & Monitoring

#### B9.1 User Analytics

| # | Câu hỏi | Analytics design |
|---|---------|-----------------|
| B9.1.1 | Events cần track? | |
| | ☐ App open/close | |
| | ☐ Kiosk enter/exit | |
| | ☐ Content play/pause/complete | |
| | ☐ Audio duration listened | |
| | ☐ Language selection | |
| | ☐ Share actions | |
| | ☐ Error occurrences | |
| B9.1.2 | Analytics platform? | |
| | ☐ Google Analytics | |
| | ☐ Mixpanel | |
| | ☐ Amplitude | |
| | ☐ Custom (self-hosted) | |
| B9.1.3 | Real-time analytics dashboard? | |
| B9.1.4 | User journey tracking/funnel? | |

#### B9.2 System Monitoring

| # | Câu hỏi | Monitoring design |
|---|---------|------------------|
| B9.2.1 | Metrics cần monitor? | |
| | ☐ API response time | |
| | ☐ Error rates | |
| | ☐ Active users | |
| | ☐ Server CPU/Memory | |
| | ☐ Database performance | |
| | ☐ Cache hit ratio | |
| B9.2.2 | Logging strategy? | |
| | ☐ Structured logging (JSON) | |
| | ☐ Log aggregation (ELK, CloudWatch) | |
| B9.2.3 | Alerting rules? | |
| | ☐ Error rate > X% | |
| | ☐ Response time > Yms | |
| | ☐ Server down | |
| B9.2.4 | Tracing (distributed tracing)? | Debug complex flows |

### B10. ⚡ Thiết kế Performance & Scalability

#### B10.1 Performance Requirements

| # | Câu hỏi | Performance targets |
|---|---------|-------------------|
| B10.1.1 | API response time target? | |
| | ☐ < 100ms (fast) | |
| | ☐ < 500ms (normal) | |
| | ☐ < 1s (acceptable) | |
| B10.1.2 | App startup time target? | |
| B10.1.3 | Time to first content display? | |
| B10.1.4 | Location detection latency? | |
| B10.1.5 | Kiosk switch latency target? | |

#### B10.2 Scalability Design

| # | Câu hỏi | Scaling strategy |
|---|---------|-----------------|
| B10.2.1 | Horizontal scaling needed? | |
| B10.2.2 | Auto-scaling rules? | |
| | ☐ CPU-based | |
| | ☐ Request count-based | |
| | ☐ Custom metrics | |
| B10.2.3 | Load balancing strategy? | |
| | ☐ Round-robin | |
| | ☐ Least connections | |
| | ☐ Geographic | |
| B10.2.4 | Database scaling strategy? | |
| | ☐ Read replicas | |
| | ☐ Sharding | |
| | ☐ Connection pooling | |
| B10.2.5 | CDN cho static assets? | |

### B11. 🚀 Thiết kế CI/CD & DevOps

| # | Câu hỏi | DevOps design |
|---|---------|--------------|
| B11.1 | Source control? | |
| | ☐ GitHub | |
| | ☐ GitLab | |
| | ☐ Bitbucket | |
| B11.2 | Branching strategy? | |
| | ☐ GitFlow | |
| | ☐ Trunk-based | |
| | ☐ Feature branching | |
| B11.3 | CI/CD platform? | |
| | ☐ GitHub Actions | |
| | ☐ GitLab CI | |
| | ☐ Jenkins | |
| | ☐ CircleCI | |
| B11.4 | Deployment strategy? | |
| | ☐ Blue-green | |
| | ☐ Canary | |
| | ☐ Rolling update | |
| B11.5 | Environment setup? | |
| | ☐ Development | |
| | ☐ Staging | |
| | ☐ Production | |
| B11.6 | Infrastructure as Code? | |
| | ☐ Terraform | |
| | ☐ CloudFormation | |
| | ☐ Pulumi | |
| | ☐ Manual | |
| B11.7 | Container orchestration? | |
| | ☐ Kubernetes | |
| | ☐ Docker Compose | |
| | ☐ ECS/Fargate | |
| | ☐ No containers | |

### B12. 🔧 Error Handling & Recovery

| # | Câu hỏi | Resilience design |
|---|---------|------------------|
| B12.1 | Retry policy cho failed requests? | |
| B12.2 | Circuit breaker pattern cần không? | |
| B12.3 | Graceful degradation scenarios? | |
| | ☐ Location service down → manual QR | |
| | ☐ Audio service down → text only | |
| | ☐ Database down → cached data | |
| B12.4 | Error reporting to users? | |
| B12.5 | Error tracking service? | |
| | ☐ Sentry | |
| | ☐ Bugsnag | |
| | ☐ Rollbar | |
| | ☐ Custom | |

---

## PHẦN C: YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### C1. 📱 Nền tảng & Công nghệ

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| C1.1 | Loại ứng dụng? ☐ PWA ☐ React Native ☐ Flutter ☐ Native | |
| C1.2 | Backend framework? ☐ NestJS ☐ Spring Boot ☐ FastAPI ☐ Go | |
| C1.3 | Database? ☐ PostgreSQL ☐ MySQL ☐ MongoDB | |
| C1.4 | Hosting? ☐ AWS ☐ GCP ☐ Azure ☐ VPS Vietnam | |

### C2. 🎤 Nội dung Thuyết minh

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| C2.1 | Định dạng: ☐ Text ☐ Audio ☐ Cả hai | |
| C2.2 | Audio: ☐ TTS ☐ Thu âm thật ☐ Kết hợp | |
| C2.3 | Ngôn ngữ: ☐ VN ☐ EN ☐ CN ☐ KR ☐ JP | |
| C2.4 | Độ dài: ☐ 30-60s ☐ 1-2 phút ☐ 3-5 phút | |

### C3. 👤 User Experience

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| C3.1 | Authentication: ☐ Không ☐ Optional ☐ Required | |
| C3.2 | Offline mode: ☐ Có ☐ Không | |
| C3.3 | Push notifications: ☐ Có ☐ Không | |

### C4. 👨‍💼 Admin Features

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| C4.1 | Admin dashboard: ☐ Có ☐ Không | |
| C4.2 | Analytics: ☐ Basic ☐ Advanced ☐ Custom | |
| C4.3 | Content management: ☐ Simple ☐ Full CMS | |

### C5. ⏰ Timeline & Resources

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| C5.1 | MVP deadline? | |
| C5.2 | Budget range? | |
| C5.3 | Team size? | |

---

## PHẦN D: EDGE CASES & SCENARIOS

### D1. Xử lý tình huống đặc biệt

| # | Scenario | Cách xử lý mong muốn |
|---|----------|---------------------|
| D1.1 | User di chuyển rất nhanh qua nhiều kiosk | |
| D1.2 | User quay lại kiosk đã nghe | |
| D1.3 | User đứng yên ở vùng giao thoa 2 kiosk lâu | |
| D1.4 | Mất kết nối internet giữa chừng | |
| D1.5 | Kiosk tạm đóng cửa | |
| D1.6 | Battery sắp hết | |
| D1.7 | GPS/Beacon signal yếu hoặc không ổn định | |
| D1.8 | User không cấp quyền location | |
| D1.9 | Nhiều user trong cùng vùng (crowded area) | |
| D1.10 | App chạy background/bị kill | |

---

## ✅ CHECKLIST XÁC NHẬN

- [ ] Đã xác định kiến trúc hệ thống
- [ ] Đã xác định công nghệ định vị
- [ ] Đã xác định thuật toán xử lý vùng giao thoa
- [ ] Đã xác định state management
- [ ] Đã xác định database schema
- [ ] Đã xác định API design
- [ ] Đã xác định security requirements
- [ ] Đã xác định scalability requirements
- [ ] Đã xác định edge cases handling

---

> **Ngày thu thập:** _______________
> 
> **Người thu thập:** _______________
> 
> **Reviewed by:** _______________
