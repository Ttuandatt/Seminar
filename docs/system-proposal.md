# GPS Tours — System Proposal
## Hệ Thống Hướng Dẫn Du Lịch Ẩm Thực GPS — Phố Vĩnh Khánh, Quận 4

> Tài liệu thuyết trình tổng thể hệ thống — bao gồm kiến trúc, cơ chế xử lý, luồng tiêu biểu, và các kỹ thuật áp dụng.

---

## 1. Tổng Quan Hệ Thống

### 1.1 Mục tiêu

Xây dựng hệ thống hướng dẫn du lịch ẩm thực tự động dựa trên GPS, cho phép:
- **Tourist** (du khách): Mở app → đi bộ → hệ thống tự phát audio thuyết minh khi đến gần quán ăn
- **Shop Owner** (chủ quán): Đăng ký quán → nhập mô tả text → hệ thống tự tạo audio thuyết minh
- **Admin**: Duyệt quán, quản lý nội dung, giám sát hệ thống real-time

### 1.2 Tech Stack

| Layer | Công nghệ | Vai trò |
|-------|-----------|---------|
| Backend API | NestJS 11, Prisma 5, PostgreSQL 15, Redis 7 | REST API, auth, business logic |
| Admin Dashboard | React 19, Vite, Tailwind CSS, shadcn/ui | Quản trị web cho Admin & Shop Owner |
| Mobile App | Expo SDK 54, React Native 0.81, expo-router | App du khách (Android/iOS) |
| Audio Engine | Google Cloud TTS / Edge TTS | Text-to-Speech đa ngôn ngữ |
| Map Tiles | Google Maps (online) + PMTiles (offline) | Bản đồ cloud/offline/hybrid |
| Payment | MoMo, VNPay SDK | Thanh toán premium features |
| Cache/Queue | Redis 7 | Session, rate limit, job queue |
| Storage | Local disk + CDN (production) | Media files (image, audio) |

### 1.3 Kiến Trúc Hệ Thống

#### Kiến trúc tổng thể: Modular Monolith

Hệ thống sử dụng kiến trúc **Modular Monolith** (Monolith phân theo mô-đun), kết hợp với tổ chức **Layered Architecture (N-tier)** bên trong.

**Modular Monolith là gì?**
- Toàn bộ backend chạy trên **1 NestJS process duy nhất**, deploy thành **1 ứng dụng**
- Bên trong chia thành các **module độc lập** (Auth, POI, Tour, TTS...) với ranh giới rõ ràng
- Tất cả module **dùng chung 1 database** (PostgreSQL) và **1 cache layer** (Redis)
- Giao tiếp giữa các module thông qua **dependency injection** trong cùng process, không qua mạng

**Tại sao chọn Modular Monolith thay vì Microservice?**

| Tiêu chí | Modular Monolith (chọn) | Microservice |
|----------|------------------------|--------------|
| Độ phức tạp triển khai | Thấp — 1 server, 1 DB | Cao — nhiều server, service discovery, API gateway |
| Phù hợp quy mô dự án | Seminar/startup, team nhỏ (2-5 người) | Doanh nghiệp lớn, team 10+ |
| Hiệu suất giao tiếp | Nhanh — gọi hàm trong process | Chậm hơn — qua HTTP/gRPC/message queue |
| Debug & testing | Dễ — 1 codebase, 1 log stream | Khó — distributed tracing, nhiều log |
| Chi phí vận hành | Thấp — 1 server (Render free/starter) | Cao — nhiều container, orchestration |
| Khả năng mở rộng | Tốt cho < 5.000 CCU | Cần khi > 10.000 CCU |

> **Kết luận**: Với quy mô seminar (< 200 CCU), Modular Monolith là lựa chọn tối ưu về chi phí, độ phức tạp, và tốc độ phát triển. Kiến trúc module hóa cho phép tách thành microservice trong tương lai nếu cần mở rộng.

#### Sơ đồ kiến trúc tổng thể

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────────┐  ┌───────────────────┐ │
│  │ Mobile   │  │ Admin Web    │  │ Shop Owner Web    │ │
│  │ (Expo)   │  │ (React+Vite) │  │ (React+Vite)      │ │
│  └────┬─────┘  └──────┬───────┘  └────────┬──────────┘ │
└───────┼────────────────┼───────────────────┼────────────┘
        │                │                   │
        ▼                ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│          MODULAR MONOLITH (1 NestJS process)            │
│                                                         │
│  ┌───────────────────────────────────────────────────┐  │
│  │  API LAYER — JWT Auth — RBAC Guard — Rate Limiter │  │
│  └────────────────────────┬──────────────────────────┘  │
│                           │                             │
│  ┌────────────────────────┼──────────────────────────┐  │
│  │              SERVICE LAYER (Modules)              │  │
│  │  ┌────────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │  │
│  │  │  Auth  │ │ POI  │ │ Tour │ │Media │ │ TTS  │ │  │
│  │  ├────────┤ ├──────┤ ├──────┤ ├──────┤ ├──────┤ │  │
│  │  │Tourist │ │Public│ │S.Own │ │Merch │ │Trans.│ │  │
│  │  └────────┘ └──────┘ └──────┘ └──────┘ └──────┘ │  │
│  └────────────────────────┬──────────────────────────┘  │
│                           │                             │
│  ┌────────────────────────┼──────────────────────────┐  │
│  │                   DATA LAYER                      │  │
│  │    ┌────────────┐   ┌───────┐   ┌──────────────┐ │  │
│  │    │ PostgreSQL │   │ Redis │   │ File Storage │ │  │
│  │    │  (Prisma)  │   │(Cache)│   │ (uploads/)   │ │  │
│  │    └────────────┘   └───────┘   └──────────────┘ │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

#### Tổ chức thư mục (phản ánh kiến trúc)

```
apps/
├── api/                          ← Modular Monolith backend
│   └── src/
│       ├── modules/              ← Mỗi module = 1 thư mục riêng
│       │   ├── auth/             ← Module Auth
│       │   ├── pois/             ← Module POI
│       │   ├── tours/            ← Module Tour
│       │   ├── media/            ← Module Media
│       │   ├── tts/              ← Module TTS (Giai đoạn 2)
│       │   ├── translation/      ← Module Translation (Giai đoạn 2)
│       │   └── ...
│       ├── common/               ← Shared utilities, guards, decorators
│       └── app.module.ts         ← Root module — đăng ký tất cả modules
├── admin/                        ← React SPA (Admin + Shop Owner)
└── mobile/                       ← Expo app (Tourist)
```

#### Design Patterns áp dụng

| Pattern | Nơi áp dụng | Mục đích |
|---------|-------------|----------|
| **Repository Pattern** | Prisma Service layer | Tách biệt data access logic |
| **Strategy Pattern** | Audio playback criteria | Chọn audio theo priority/distance/language |
| **Observer Pattern** | WebSocket real-time dashboard | Admin theo dõi user online |
| **Factory Pattern** | TTS Engine selection | Chọn TTS provider theo ngôn ngữ/chất lượng |
| **Singleton Pattern** | Audio Player Context (mobile) | 1 audio player toàn app, tránh conflict |
| **Circuit Breaker** | External API calls (TTS, Payment) | Fallback khi 3rd party service down |
| **Cache-Aside** | Redis + POI data | Giảm DB load cho dữ liệu ít thay đổi |

---

## 2. Tổng Hợp Modules

### 2.1 Backend — 10 Modules

| # | Module | Prefix | Xử lý | Endpoints |
|---|--------|--------|--------|-----------|
| 1 | **Auth** | `/auth` | Đăng ký, đăng nhập, refresh token, reset password, logout | 6 |
| 2 | **POIs** | `/pois` | CRUD điểm tham quan (Admin only) | 6 |
| 3 | **Tours** | `/tours` | CRUD tour, gán POI vào tour theo thứ tự | 6 |
| 4 | **Media** | `/pois/:id/media` | Upload/delete image & audio cho POI | 2 |
| 5 | **Public** | `/public` | API công khai: POIs, Tours, trigger log, QR validate | 7 |
| 6 | **Tourist** | `/tourist` | Profile, favorites, view history | 7 |
| 7 | **Merchants** | `/merchants` | Admin quản lý Shop Owner accounts | 5 |
| 8 | **Shop Owner** | `/shop-owner` | Tự quản lý profile, POIs, media, analytics | 7 |
| 9 | **Analytics** | `/admin/analytics` | Dashboard KPIs, top POIs, trigger stats | 1 |
| 10 | **Profile** | `/me` | Profile chung (mọi role), upload avatar | 3 |
| | **Tổng** | | | **~50** |

### 2.2 Modules Cần Bổ Sung (theo yêu cầu giảng viên)

| # | Module mới | Xử lý | Ưu tiên |
|---|-----------|--------|---------|
| 11 | **TTS Engine** | Text → Audio tự động, đa ngôn ngữ, giọng vùng miền | Cao |
| 12 | **Translation Intelligence** | NER cho địa danh, dịch thông minh, giọng vùng miền premium | Cao |
| 13 | **Payment** | Tích hợp MoMo/VNPay, quản lý subscription premium | Trung bình |
| 14 | **Real-time Dashboard** | WebSocket: số user online theo role, heatmap | Trung bình |
| 15 | **Offline Sync** | Đồng bộ dữ liệu offline, conflict resolution | Cao |
| 16 | **Shop Registration** | Quy trình đăng ký quán, duyệt pháp lý, trạng thái | Cao |
| 17 | **Geocoding** | Địa chỉ → tọa độ GPS tự động | Thấp |

---

## 3. Luồng Xử Lý Tiêu Biểu

### 3.1 Luồng Tourist: Mở App → Phát Audio Tự Động

```
Tourist mở app
    │
    ▼
Request GPS permission ──(denied)──> Hiển thị bản đồ ở chế độ browse-only
    │ (granted)
    ▼
Lấy vị trí hiện tại (watchPositionAsync, interval 3s)
    │
    ▼
Fetch danh sách POI từ /public/pois
    │
    ▼
Render markers trên bản đồ
    │
    ▼
╔═══════════════════════════════════════════════╗
║  GPS TRIGGER LOOP (mỗi 3 giây)               ║
║                                               ║
║  Với mỗi POI:                                 ║
║    distance = haversine(user, poi)             ║
║                                               ║
║    if distance <= poi.triggerRadius (15m):     ║
║      ┌─────────────────────────────────┐      ║
║      │ AUDIO CRITERIA ENGINE           │      ║
║      │                                 │      ║
║      │ 1. Priority: MAIN > SUB        │      ║
║      │ 2. Distance: gần nhất ưu tiên  │      ║
║      │ 3. Trigger: chưa phát > đã phát│      ║
║      │ 4. Autoplay: user setting ON?   │      ║
║      │                                 │      ║
║      │ → Chọn 1 POI tốt nhất          │      ║
║      └──────────┬──────────────────────┘      ║
║                 ▼                              ║
║      Highlight POI trên bản đồ (pulse anim)   ║
║      Hiện bottom sheet preview                 ║
║      Auto-play audio (nếu autoplay ON)         ║
║      Log trigger event → /public/trigger-log   ║
║                                               ║
╚═══════════════════════════════════════════════╝
```

### 3.2 Luồng Shop Owner: Đăng Ký → Tạo POI → Audio Tự Động

```
Shop Owner đăng ký tài khoản
    │
    ▼
Nhập thông tin quán: tên, địa chỉ, giấy phép kinh doanh
    │
    ▼
[Geocoding] Địa chỉ → tọa độ GPS tự động (Google Geocoding API)
    │
    ▼
Admin nhận thông báo có quán mới chờ duyệt
    │
    ▼
Admin xét duyệt ──(reject)──> Thông báo lý do từ chối
    │ (approve)
    ▼
Quán chuyển sang trạng thái ACTIVE
Shop Owner có thể tạo POI
    │
    ▼
Shop Owner tạo POI:
    ├── Nhập text mô tả (VI) ──┐
    ├── [Tùy chọn] Nhập text EN │
    └── [Tùy chọn] Upload audio ─┤
                                  ▼
                    ┌──────────────────────────────┐
                    │   TTS ENGINE (nếu chỉ có text)│
                    │                               │
                    │  Text VI → Audio VI (TTS)     │
                    │  Text EN → Audio EN (TTS)     │
                    │                               │
                    │  File name tự động:           │
                    │  {poiId}_{lang}_{timestamp}.mp3│
                    └──────────────┬───────────────┘
                                   ▼
                    POI với audio sẵn sàng
                    Status: ACTIVE → hiện trên mobile
```

### 3.3 Luồng Admin Duyệt Quán

```
                    ┌──────────────────────────────────────┐
                    │        SHOP REGISTRATION FLOW         │
                    │                                       │
                    │  1. PENDING_REVIEW                    │
                    │     └─ Shop Owner vừa đăng ký         │
                    │     └─ Hiện trên Admin dashboard      │
                    │                                       │
                    │  2. DOCUMENTS_REQUESTED               │
                    │     └─ Admin yêu cầu bổ sung giấy tờ │
                    │                                       │
                    │  3. APPROVED ✓                        │
                    │     └─ Admin duyệt                    │
                    │     └─ Shop Owner có thể tạo POI      │
                    │                                       │
                    │  4. REJECTED ✗                        │
                    │     └─ Admin từ chối + lý do          │
                    │     └─ Shop Owner có thể sửa và nộp lại│
                    │                                       │
                    │  5. SUSPENDED ⚠                       │
                    │     └─ Vi phạm → tạm đình chỉ         │
                    │     └─ POIs bị ẩn, không tạo mới      │
                    └──────────────────────────────────────┘

Giao diện Shop Owner hiển thị:
  ┌───────────────────────────────────────┐
  │  Trạng thái pháp lý: ✅ ĐÃ DUYỆT     │
  │  Ngày duyệt: 15/03/2026              │
  │  Giấy phép: GP-2026-001234           │
  │  [Xem chi tiết] [Cập nhật giấy tờ]   │
  └───────────────────────────────────────┘
```

---

## 4. Module Audio / TTS — Chi Tiết

### 4.1 Kiến Trúc Audio

```
┌────────────────────────────────────────────────────────────┐
│                    AUDIO PIPELINE                           │
│                                                             │
│  INPUT                    PROCESSING              OUTPUT    │
│  ──────                   ──────────              ──────    │
│                                                             │
│  Shop Owner               TTS Engine              Audio File│
│  nhập text  ──────────>  (Google TTS   ────────>  .mp3      │
│  tiếng Việt               hoặc Edge TTS)         /uploads/  │
│                                                             │
│  Shop Owner               Speech-to-Text          Text      │
│  upload     ──────────>  (Whisper API) ────────>  mô tả     │
│  audio .mp3                                      tự động    │
│                                                             │
│  Text VI    ──────────>  Translation   ────────>  Text EN   │
│  (có sẵn)                (AI NER +                (dịch     │
│                          GPT/DeepL)               thông minh)│
│                                                             │
│  Text EN    ──────────>  TTS Engine    ────────>  Audio EN  │
│                          (English voice)          .mp3      │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

### 4.2 TTS — Text-to-Speech (Thuyết Minh Tự Động)

**Idea chính**: Shop Owner chỉ cần nhập text mô tả → hệ thống tự tạo audio thuyết minh.

| Tình huống | Input | Xử lý | Output |
|-----------|-------|--------|--------|
| Shop Owner không có kinh phí | Nhập text VI | TTS tự động → audio VI | Audio .mp3 |
| Shop Owner có kinh phí | Upload audio chuyên nghiệp | Lưu trực tiếp | Audio .mp3 |
| Cần audio EN | Text VI → dịch → Text EN → TTS | Pipeline tự động | Audio EN .mp3 |
| Có audio, cần text (SEO) | Upload audio | Speech-to-Text (Whisper) | Text mô tả |

**TTS Provider:**

| Provider | Ưu điểm | Nhược điểm | Chi phí |
|----------|---------|------------|---------|
| Google Cloud TTS | Chất lượng cao, nhiều giọng VI | Tốn phí | $4/1M ký tự |
| Microsoft Edge TTS | Miễn phí, giọng VI tốt | Không official API | Free |
| OpenAI TTS | Giọng tự nhiên nhất | Chưa hỗ trợ VI native | $15/1M ký tự |

**Khuyến nghị**: Dùng **Edge TTS** cho development/free tier, **Google Cloud TTS** cho production/premium.

### 4.3 Đặt Tên File Audio Tự Động

```
Format: {poiId}_{language}_{version}_{timestamp}.mp3

Ví dụ:
  poi_abc123_vi_v1_20260315.mp3      ← TTS tự động, tiếng Việt
  poi_abc123_en_v1_20260315.mp3      ← TTS tự động, tiếng Anh
  poi_abc123_vi_v2_20260320.mp3      ← Shop Owner upload audio mới
  poi_abc123_vi-south_v1_20260315.mp3 ← Giọng miền Nam (Premium)
```

**Chiến lược quản lý:**
- Mỗi POI có tối đa 1 audio active / ngôn ngữ
- Audio cũ chuyển sang trạng thái `ARCHIVED`, không xóa ngay
- Cron job xóa audio archived > 30 ngày

### 4.4 Nơi Lưu Âm Thanh — Máy Chủ vs Thiết Bị

| Hướng tiếp cận | Ưu điểm | Nhược điểm | Kỹ thuật xử lý |
|----------------|---------|------------|-----------------|
| **Chỉ máy chủ (Phát trực tuyến)** | Tiết kiệm bộ nhớ thiết bị, luôn cập nhật mới nhất | Cần internet, tốn băng thông máy chủ khi nhiều người nghe | HTTP Range requests, CDN cache, tự động chọn bitrate (128kbps wifi / 64kbps 3G) |
| **Chỉ thiết bị (Tải về)** | Ngoại tuyến hoàn toàn, không cần internet khi dùng | Tốn bộ nhớ thiết bị, khó cập nhật | Hàng đợi tải nền, xóa theo LRU khi đầy |
| **Kết hợp (Khuyến nghị)** | Cân bằng: bộ nhớ đệm thông minh, ngoại tuyến khi cần | Phức tạp triển khai | Xem chi tiết bên dưới |

**Hướng tiếp cận Kết hợp — Chi tiết:**

```
Khi người dùng mở ứng dụng:
    │
    ▼
Kiểm tra cấu hình thiết bị:
    ├── Bộ nhớ khả dụng >= 500MB? ──(CÓ)──> Chế độ TẢI VỀ
    │                                         Tải top 20 audio POI
    │                                         Ưu tiên: gần nhất > phổ biến > mới nhất
    │
    └── Bộ nhớ < 500MB? ──(CÓ)──> Chế độ PHÁT TRỰC TUYẾN
                                    Chỉ lưu đệm audio đang phát
                                    Xóa bộ nhớ đệm khi chuyển POI

Khi đến gần POI:
    │
    ▼
Audio đã lưu đệm cục bộ? ──(CÓ)──> Phát từ thiết bị (0 độ trễ)
    │ (KHÔNG)
    ▼
Có internet không? ──(CÓ)──> Phát trực tuyến từ máy chủ
    │ (KHÔNG)                  Đồng thời lưu đệm xuống thiết bị
    ▼
Hiện thông báo: "Không có kết nối. Hãy tải audio trước khi đi."
```

### 4.5 Tối Ưu Bộ Nhớ & Lưu Trữ

**Máy chủ:**

| Kỹ thuật | Mô tả | Tiết kiệm |
|----------|-------|-----------|
| **Nén âm thanh** | MP3 64kbps mono (đủ cho giọng nói) thay vì 320kbps stereo | ~80% dung lượng |
| **Bộ nhớ đệm CDN** | CloudFront/Cloudflare lưu đệm tệp audio, giảm tải máy chủ gốc | ~90% băng thông |
| **Tạo theo yêu cầu** | Chỉ tạo TTS audio khi có người yêu cầu lần đầu, không tạo sẵn tất cả | ~60% dung lượng |
| **Loại bỏ trùng lặp** | Dựa trên hash: nếu 2 POI có cùng nội dung audio → lưu 1 tệp | ~15% dung lượng |
| **Lưu trữ phân tầng** | Nóng (SSD, audio đang dùng) / Lạnh (S3 Glacier, audio lưu trữ) | ~70% chi phí |

**Thiết bị (Di động):**

| Kỹ thuật | Mô tả | Tiết kiệm |
|----------|-------|-----------|
| **Bộ nhớ đệm LRU** | Giữ 20 audio gần nhất, xóa cũ nhất khi đầy | Giới hạn tối đa 200MB |
| **Mã hóa Opus** | Dùng Opus thay MP3 (cùng chất lượng, nhỏ hơn 30%) | ~30% dung lượng |
| **Tải từng phần** | Tải 30 giây đầu trước, phần còn lại tải nền | Phát nhanh hơn |
| **Kiểm tra dung lượng** | Kiểm tra bộ nhớ trước khi tải hàng loạt | Tránh đầy bộ nhớ |

---

## 5. Chế Độ Bản Đồ: Đám Mây / Ngoại Tuyến / Kết Hợp

### 5.1 Ba Chế Độ

| Chế độ | Khi nào dùng | Nguồn bản đồ | Kỹ thuật |
|--------|-------------|--------------|----------|
| **Đám mây** (mặc định) | Có internet ổn định | Google Maps API | react-native-maps, Google provider |
| **Ngoại tuyến** | Không internet, đã tải về | PMTiles cục bộ | MapLibre GL + tệp .pmtiles nội bộ |
| **Kết hợp** | Internet yếu/không ổn định | Bộ nhớ đệm bản đồ đã xem + PMTiles | Service Worker cache + dự phòng |

### 5.2 Offline Map — PMTiles

```
Pre-download flow:
    │
    ▼
App kiểm tra: đã có map file chưa?
    │ (CHƯA)
    ▼
Download .pmtiles file cho khu vực Quận 4
    (~50MB cho zoom 12-18, đủ cho đi bộ)
    │
    ▼
Lưu vào app storage
    │
    ▼
Khi offline: MapLibre đọc tiles từ local file
    Render map không cần internet
```

**Đánh đổi:**

| | Đám mây (Google Maps) | Ngoại tuyến (PMTiles) |
|---|---|---|
| Chất lượng bản đồ | Cao nhất, giao thông thời gian thực | Tốt, nhưng tĩnh |
| Dung lượng thiết bị | 0 MB | ~50-100 MB |
| Chi phí máy chủ | Phí Google Maps API | 1 lần tải về |
| Cập nhật | Tự động | Phải tải lại |

---

## 6. Gói Ngôn Ngữ — Đa Ngôn Ngữ Thông Minh

### 6.1 Kiến Trúc "Ngăn Kéo"

```
Mỗi ngôn ngữ = 1 ngăn kéo (Language Drawer)

Device Storage:
┌──────────────────────────────────┐
│  📂 lang_vi/         (50 MB)     │  ← Mặc định, luôn có
│    ├── poi_001_vi.mp3            │
│    ├── poi_002_vi.mp3            │
│    └── ... (max 300 files)       │
│                                  │
│  📂 lang_en/         (45 MB)     │  ← User chọn tải thêm
│    ├── poi_001_en.mp3            │
│    ├── poi_002_en.mp3            │
│    └── ... (max 300 files)       │
│                                  │
│  📂 lang_ja/         (48 MB)     │  ← Premium language
│    ├── poi_001_ja.mp3            │
│    └── ...                       │
└──────────────────────────────────┘

Quy tắc:
  ✓ Max 300 files / ngôn ngữ
  ✓ Max 3 ngôn ngữ đồng thời trên device
  ✓ Quá 3 ngôn ngữ → xóa ngôn ngữ ít dùng nhất (LRU)
  ✓ User có thể chọn giữ ngôn ngữ nào
```

### 6.2 Huấn Luyện Dịch Thuật Thông Minh (NER + Context-aware)

**Vấn đề**: "Hai Bà Trưng" KHÔNG dịch thành "Two Lady Trung"

**Giải pháp: Named Entity Recognition (NER) + Translation Memory**

```
Input text: "Quán nằm trên đường Hai Bà Trưng, gần chợ Bến Thành"

Bước 1 — NER (Named Entity Recognition):
    Phát hiện entities:
    ├── "Hai Bà Trưng"    → PROPER_NOUN (street/historical figure)
    ├── "chợ Bến Thành"   → PROPER_NOUN (landmark)
    └── "Quán nằm trên đường ... gần ..." → translatable context

Bước 2 — Translation Memory lookup:
    ├── "Hai Bà Trưng"  → giữ nguyên "Hai Ba Trung" (romanized, KHÔNG dịch nghĩa)
    └── "chợ Bến Thành" → "Ben Thanh Market" (dịch từ generic "chợ" = "Market")

Bước 3 — Contextual Translation:
    Output: "The restaurant is located on Hai Ba Trung Street, near Ben Thanh Market"

Bước 4 — TTS Pronunciation Guide:
    "Hai Ba Trung"  → IPA: /haːj ɓaː ʈɨŋ/  (không đọc kiểu Anh)
    "Ben Thanh"     → IPA: /ɓen tʰaːjŋ/
```

**Tính năng cao cấp — Giọng vùng miền:**

| Gói | Giọng | Đối tượng |
|-----|-------|-----------|
| Miễn phí | Giọng chuẩn (Bắc) VI + Tiếng Anh chuẩn | Tất cả |
| Cao cấp | Giọng miền Nam, miền Trung VI | Du khách muốn trải nghiệm bản địa |
| Cao cấp+ | Giọng vùng miền + phong cách kể chuyện | Du khách cao cấp |

---

## 7. Tiêu Chí Chọn Âm Thanh — Xử Lý Khi Nhiều POI Cùng Kích Hoạt

Khi người dùng đứng tại vị trí mà bán kính kích hoạt của nhiều POI chồng nhau:

```
Candidate POIs (trong trigger range):
    POI A: Quán Bún Mắm (15m) — DINING — chưa phát
    POI B: Ốc Đào (12m) — STREET_FOOD — đã phát
    POI C: Chùa Xá Lợi (20m) — CULTURAL — chưa phát

SCORING ENGINE:
┌──────────────────────────────────────────────────────────┐
│  Criteria          │ Weight │ POI A │ POI B │ POI C      │
│────────────────────│────────│───────│───────│────────────│
│  1. Priority       │  30%   │  5    │  5    │  8 (MAIN)  │
│  2. Distance       │  30%   │  8    │  9    │  6         │
│  3. Not played yet │  25%   │  10   │  0    │  10        │
│  4. Autoplay ON    │  15%   │  10   │  10   │  10        │
│────────────────────│────────│───────│───────│────────────│
│  TOTAL SCORE       │        │  7.9  │  5.7  │  8.2 ★    │
└──────────────────────────────────────────────────────────┘

→ Winner: POI C (Chùa Xá Lợi) — phát trước
→ Queue: POI A phát sau khi C xong (nếu user vẫn ở trong range)
```

---

## 8. Giao Diện — Làm Nổi Bật POI Đang Phát Âm Thanh

```
Trên bản đồ:
    ┌──────────────────────────────┐
    │                              │
    │     📍 (marker bình thường)   │
    │                              │
    │     📍 (marker bình thường)   │
    │                              │
    │     🔊 (marker ĐANG PHÁT)    │  ← Pulse animation
    │     ╔═══════╗                │     Màu cam (#F97316)
    │     ║ ~~ ~~ ║                │     Sound wave effect
    │     ╚═══════╝                │     Larger size (1.5x)
    │                              │
    │     📍 (marker bình thường)   │
    │                              │
    └──────────────────────────────┘

Bottom sheet khi POI đang phát:
    ┌──────────────────────────────┐
    │  🔊 Đang phát: Chùa Xá Lợi  │
    │  ▶ ━━━━━━━━━━━━━━━━━━━ 2:34 │
    │  [Pause] [Tiếp theo →]       │
    └──────────────────────────────┘
```

---

## 9. Bản Đồ Nhiệt — Độ Phổ Biến POI (Kể Cả Người Dùng Chưa Đăng Ký)

**Vấn đề**: Người dùng chưa đăng ký → không có tài khoản → làm sao đo độ phổ biến?

**Giải pháp: Ghi nhật ký kích hoạt ẩn danh**

```
/public/trigger-log (KHÔNG cần auth):
{
    "deviceId": "abc-123-xyz",     ← Device fingerprint (AsyncStorage UUID)
    "poiId": "poi_001",
    "triggerType": "GPS",
    "userAction": "ACCEPTED",       ← User nhấn vào POI / nghe audio
    "userLat": 10.7568,
    "userLng": 106.6988,
    "distanceMeters": 12.5
}
```

**Tính Bản Đồ Nhiệt:**

```sql
-- Truy vấn tổng hợp cho bảng điều khiển quản trị viên
SELECT
    poi_id,
    COUNT(*) as total_triggers,
    COUNT(DISTINCT device_id) as unique_visitors,
    AVG(distance_meters) as avg_trigger_distance,
    COUNT(CASE WHEN user_action = 'ACCEPTED' THEN 1 END) as audio_plays
FROM trigger_logs
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY poi_id
ORDER BY total_triggers DESC;
```

**Hiển thị trên Bảng Điều Khiển Quản Trị:**

```
┌──────────────────────────────────────────────────┐
│  🔥 HEATMAP — Top POIs tuần này                  │
│                                                   │
│  1. 🔴 Ốc Đào              │ 342 visits │ 89% play│
│  2. 🟠 Quán Bún Mắm Tùng   │ 287 visits │ 76% play│
│  3. 🟡 Cà Phê Vợt Sài Gòn  │ 156 visits │ 92% play│
│  4. 🟢 Hải Sản Bé Mặn       │  89 visits │ 65% play│
│  5. 🔵 Chùa Xá Lợi          │  45 visits │ 71% play│
│                                                   │
│  [Xem bản đồ nhiệt]                              │
└──────────────────────────────────────────────────┘
```

---

## 10. Bảng Điều Khiển Quản Trị — Người Dùng Thời Gian Thực

### Triển Khai WebSocket

```
Client (Admin Dashboard)          Server (NestJS Gateway)
        │                                   │
        │  ws://localhost:3000/ws/dashboard  │
        │ ─────────────────────────────────> │
        │                                   │
        │  { event: "users_online",         │
        │    data: {                        │
        │      total: 47,                   │
        │      byRole: {                    │
        │        TOURIST: 38,               │
        │        SHOP_OWNER: 7,             │
        │        ADMIN: 2                   │
        │      },                           │
        │      activeAudioSessions: 12      │
        │    }                              │
        │  }                                │
        │ <───────────── (mỗi 10 giây) ──── │
        │                                   │
```

---

## 11. Mô-đun Thanh Toán — MoMo / VNPay

### 11.1 Kiến Trúc

```
┌──────────────────────────────────────────────────────┐
│              PAYMENT MODULE                           │
│                                                       │
│  Tourist                    Shop Owner                │
│  ────────                   ──────────                │
│  Premium subscription       Quảng cáo POI nổi bật    │
│  - Giọng vùng miền          - Boost POI lên top       │
│  - Offline full data        - Banner trên tour list   │
│  - Không quảng cáo          - Analytics nâng cao      │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Payment Gateway (abstract)                      │ │
│  │  ├── MoMoProvider   ← MoMo API                  │ │
│  │  ├── VNPayProvider  ← VNPay API                  │ │
│  │  └── MockProvider   ← Dev/Test                   │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  Flow:                                                │
│  User chọn gói → Redirect MoMo/VNPay → Callback →   │
│  Verify signature → Activate subscription → Webhook  │
│                                                       │
└──────────────────────────────────────────────────────┘
```

### 11.2 Mô Hình Giá (Gợi ý)

| Gói | Du khách | Chủ quán |
|-----|----------|----------|
| Miễn phí | Audio cơ bản, 2 ngôn ngữ VI/EN | 1 POI, chỉ mô tả văn bản |
| Cao cấp (49K/tháng) | Giọng vùng miền, ngoại tuyến, không quảng cáo | 5 POI, TTS tự động, thống kê cơ bản |
| Doanh nghiệp (199K/tháng) | — | Không giới hạn POI, đẩy nổi bật, thống kê nâng cao |

---

## 12. Ngoại Tuyến & Dự Phòng — Cơ Chế Phòng Ngự 4 Lớp

### 12.1 Khi Người Dùng Đang Dùng Mà Mất Internet

```
Layer 1 — CACHE HIT
    Audio/data đã cache trên device → phát bình thường
    ✅ User không biết bị mất mạng

Layer 2 — STALE DATA
    Cache hết hạn nhưng vẫn còn data cũ → dùng data cũ
    ⚠️ Hiện tag "Offline — dữ liệu có thể chưa cập nhật"

Layer 3 — OFFLINE DATABASE
    SQLite local đã sync → đọc POI từ local DB
    ⚠️ Hiện tag "Chế độ offline"
    Map chuyển sang PMTiles offline

Layer 4 — GRACEFUL DEGRADATION
    Không có data nào → hiển thị bản đồ trống + thông báo
    📢 "Không có kết nối. Kết nối Wi-Fi để tải dữ liệu."
    [Nút Retry]
```

### 12.2 Dự Phòng Cho Từng Chức Năng

| Chức năng | Trực tuyến | Dự phòng ngoại tuyến |
|-----------|-----------|---------------------|
| Bản đồ | Google Maps API | PMTiles bản đồ cục bộ |
| Dữ liệu POI | API `/public/pois` | SQLite cơ sở dữ liệu cục bộ (đã đồng bộ) |
| Âm thanh | Phát trực tuyến từ máy chủ | Tệp .mp3 đã lưu đệm cục bộ |
| Kích hoạt GPS | Xác thực trực tuyến + ghi nhật ký | Kích hoạt cục bộ (ghi nhật ký khi có mạng) |
| Hồ sơ/Yêu thích | API thời gian thực | Bản sao cục bộ AsyncStorage |
| Tạo TTS | API Cloud TTS | Hiện văn bản thay âm thanh, ghi chú "Âm thanh sẽ có khi có mạng" |
| Thanh toán | Chuyển hướng MoMo/VNPay | Hiện thông báo "Cần kết nối để thanh toán" |
| Bản đồ nhiệt/Thống kê | WebSocket thời gian thực | Ảnh chụp bộ nhớ đệm gần nhất |
| Quét QR | Xác thực trực tuyến + kích hoạt | Xác thực định dạng ngoại tuyến, ghi cục bộ |

### 12.3 Đồng Bộ Khi Có Mạng Trở Lại

```
Internet đã khôi phục!
    │
    ▼
1. Tải lên nhật ký kích hoạt chờ xử lý (hàng đợi ngoại tuyến)
2. Đồng bộ thay đổi yêu thích (thêm/xóa)
3. Kiểm tra POI mới/cập nhật (ETag/If-Modified-Since)
4. Tải âm thanh mới nếu có
5. Xóa các mục bộ nhớ đệm hết hạn
```

---

## 13. Xử Lý Tải Hệ Thống (Tải & Khả Năng Mở Rộng)

### 13.1 Điều Phối Âm Thanh Khi Nhiều Người Nghe

**Vấn đề**: 100 du khách cùng tại Ốc Đào, tất cả yêu cầu phát trực tuyến âm thanh cùng lúc

```
Không CDN:           Có CDN:
100 requests         100 requests
    │                    │
    ▼                    ▼
[API Server]         [CDN Edge — HCM]
    │                    │
  💀 100 file reads    ✅ 1 cache hit → serve 100
    │                    │
  Response: 3-5s       Response: 50-100ms
  CPU: 90%             CPU: 5%
```

**Giải pháp:**

| Tầng | Kỹ thuật | Xử lý |
|------|----------|-------|
| 1. CDN | Cloudflare/CloudFront | Lưu đệm tệp audio tại biên, TTL 24 giờ |
| 2. Bộ nhớ đệm Redis | Cụm Redis | Lưu đệm siêu dữ liệu POI, TTL 5 phút |
| 3. Nhóm kết nối | Nhóm kết nối Prisma (10-20) | Tránh cạn kiệt kết nối cơ sở dữ liệu |
| 4. Giới hạn tốc độ | Bộ giới hạn dựa trên Redis | 100 yêu cầu/phút mỗi IP, 1000 yêu cầu/phút mỗi tuyến |
| 5. Nén phản hồi | gzip/brotli | Giảm ~70% băng thông cho phản hồi JSON |
| 6. Chỉ mục cơ sở dữ liệu | Chỉ mục tổ hợp trên (lat, lng, status) | Truy vấn lân cận O(log n) |

### 13.2 Kiểm Tra Tải — Kết Quả Dự Kiến

| Cấu hình máy chủ | Số người dùng đồng thời tối đa | Thời gian phản hồi (p95) | Mức dùng CPU |
|-------------------|-------------------------------|--------------------------|-------------|
| 1 vCPU, 512MB RAM (Render miễn phí) | ~50 | < 500ms | 80% |
| 1 vCPU, 1GB RAM (Render khởi điểm) | ~200 | < 300ms | 60% |
| 2 vCPU, 2GB RAM + CDN | ~1.000 | < 200ms | 40% |
| 4 vCPU, 4GB RAM + CDN + Cụm Redis | ~5.000 | < 150ms | 30% |

**Công cụ đề xuất**: k6 (Grafana) hoặc Artillery cho kiểm tra tải.

```javascript
// k6 script mẫu
import http from 'k6/http';
export const options = {
    stages: [
        { duration: '30s', target: 50 },   // Ramp up to 50 users
        { duration: '1m', target: 200 },    // Ramp up to 200
        { duration: '30s', target: 0 },     // Ramp down
    ],
};
export default function () {
    http.get('https://api.gpstours.vn/api/v1/public/pois');
    http.get('https://api.gpstours.vn/api/v1/public/pois/nearby?lat=10.7553&lng=106.6965&radius=500');
}
```

### 13.3 Các Vấn Đề Tải Khác Cần Xử Lý

| Vấn đề | Giải pháp |
|--------|-----------|
| **Hiệu ứng bầy đàn** (100 người dùng truy vấn cùng 1 POI) | Gộp yêu cầu: 1 truy vấn CSDL, lưu đệm, phục vụ tất cả |
| **Tràn hàng đợi TTS** (nhiều chủ quán tạo audio cùng lúc) | Hàng đợi Bull (Redis) + giới hạn 5 audio/phút/người dùng |
| **Rò rỉ bộ nhớ WebSocket** (nhiều quản trị viên mở bảng điều khiển) | Tối đa 50 kết nối, nhịp tim 30 giây, tự ngắt khi nhàn rỗi |
| **Đợt tải ảnh đột biến** | Sharp.js thu nhỏ khi tải lên, tối đa 1MB đầu ra, xử lý bất đồng bộ |
| **Cạn kiệt kết nối CSDL** | Nhóm Prisma tối thiểu:2 tối đa:10, thời gian chờ truy vấn 5 giây |
| **Rò rỉ bộ nhớ trên di động** | Audio player singleton, WeakRef cho ảnh lưu đệm |

---

## 14. Mã QR — Demo Cho Buổi Thuyết Trình

### 14.1 Định Dạng Mã QR

```
gpstours:poi:{poiId}

Ví dụ: gpstours:poi:abc-123-def-456
```

### 14.2 Luồng Quét QR

```
Bạn cùng lớp quét QR bằng Expo Go
    │
    ▼
Ứng dụng mở → xác thực định dạng: /public/qr/validate
    │
    ▼
Lấy chi tiết POI: /public/pois/{poiId}
    │
    ▼
Hiện màn hình chi tiết POI với:
    - Hình ảnh quán
    - Mô tả (VI/EN)
    - Nút phát âm thanh
    - Nút chỉ đường (Google Maps)
```

### 14.3 Tạo QR Cho Buổi Thuyết Trình

Bảng điều khiển quản trị có thể in mã QR cho từng POI → dán lên poster hoặc hiển thị trên slide.

---

## 15. Chuyển Đổi Địa Chỉ — Địa Chỉ → Tọa Độ GPS Tự Động

**Tính năng**: Chủ quán chỉ cần nhập địa chỉ → hệ thống tự điền tọa độ.

```
Đầu vào:  "72 Đ. Kênh 19/5, Sơn Kỳ, Tân Phú, TP.HCM"
    │
    ▼
Google Geocoding API (hoặc Nominatim miễn phí)
    │
    ▼
Đầu ra: { lat: 10.808854, lng: 106.614830 }
    │
    ▼
Tự điền vào biểu mẫu + xem trước trên bản đồ
Chủ quán có thể kéo marker để chỉnh lại nếu sai
```

---

## 16. Các Điểm Cuối Chính (Tóm Tắt)

### Công khai (Không cần xác thực)
```
GET    /public/pois                    ← Tất cả POI đang hoạt động
GET    /public/pois/nearby?lat&lng&r   ← POI gần vị trí
GET    /public/pois/:id                ← Chi tiết 1 POI
GET    /public/tours                   ← Tất cả tour đang hoạt động
GET    /public/tours/:id               ← Chi tiết 1 tour
POST   /public/trigger-log             ← Ghi nhật ký kích hoạt GPS/QR
POST   /public/qr/validate             ← Xác thực mã QR
```

### Xác thực
```
POST   /auth/register                  ← Đăng ký
POST   /auth/login                     ← Đăng nhập → mã JWT
POST   /auth/refresh                   ← Làm mới mã truy cập
POST   /auth/logout                    ← Đăng xuất
```

### Du khách (Cần JWT)
```
GET    /tourist/me                     ← Hồ sơ cá nhân
PATCH  /tourist/me                     ← Cập nhật cài đặt
GET    /tourist/me/favorites           ← Danh sách yêu thích
POST   /tourist/me/favorites           ← Thêm yêu thích
DELETE /tourist/me/favorites/:poiId    ← Xóa yêu thích
GET    /tourist/me/history             ← Lịch sử xem
POST   /tourist/me/history             ← Ghi lịch sử
```

### Chủ quán (JWT + vai trò SHOP_OWNER)
```
GET    /shop-owner/me                  ← Hồ sơ quán
PATCH  /shop-owner/me                  ← Cập nhật quán
GET    /shop-owner/pois                ← Các POI của mình
POST   /shop-owner/pois                ← Tạo POI
PUT    /shop-owner/pois/:id            ← Sửa POI
POST   /shop-owner/pois/:id/media      ← Tải lên phương tiện
GET    /shop-owner/analytics            ← Thống kê
```

### Quản trị viên (JWT + vai trò ADMIN)
```
POST   /pois                           ← Tạo POI
GET    /pois                           ← Danh sách POI
PUT    /pois/:id                       ← Sửa POI
DELETE /pois/:id                       ← Xóa POI
POST   /pois/:id/media                 ← Tải lên phương tiện
GET    /admin/analytics/overview        ← Tổng quan KPI
POST   /merchants                      ← Tạo tài khoản chủ quán
GET    /merchants                      ← Danh sách chủ quán
```

---

## 17. Tổng Kết — Lộ Trình Phát Triển

| Giai đoạn | Các mô-đun | Trạng thái |
|-----------|-----------|-----------|
| **Giai đoạn 1** (Đã xong) | Xác thực, CRUD POI, CRUD Tour, Tải phương tiện, API công khai, API du khách, Bảng quản trị, Bản đồ di động + Âm thanh | Hoàn thành |
| **Giai đoạn 2** (Tiếp theo) | Công cụ TTS, Dịch thuật thông minh, Quy trình đăng ký cửa hàng, Đồng bộ ngoại tuyến, Chuyển đổi địa chỉ | Đang lên kế hoạch |
| **Giai đoạn 3** (Tương lai) | Thanh toán (MoMo/VNPay), Bảng điều khiển thời gian thực, Bản đồ nhiệt, Giọng vùng miền cao cấp, Kiểm tra tải | Đang lên kế hoạch |
