# Implementation Plan — GPS Tours Phase 2+

> **Created**: 2026-03-15
> **Last updated**: 2026-03-15
> **Baseline**: Phase 1 complete (10 modules, ~50 endpoints, Admin dashboard, Mobile app)

---

## Legend

- [ ] Chưa làm
- [x] Đã hoàn thành
- [~] Đang làm dở / làm một phần

---

## Phase 2A — Core Features (Ưu tiên CAO)

### 2A.1 TTS Engine ✅ DONE

> Module `apps/api/src/modules/tts/` — đã implement xong.

- [x] `TtsService` — msedge-tts, hỗ trợ VI/EN
- [x] `POST /tts/generate/:poiId` — tạo audio từ text
- [x] `GET /tts/voices` — liệt kê giọng đọc
- [x] Archive audio cũ (orderIndex: -1), cleanup sau 30 ngày
- [x] Guard: JWT + ADMIN/SHOP_OWNER only
- [ ] **2A.1.1** — Tích hợp TTS vào Admin Dashboard
  - File: `apps/admin/src/pages/admin/POIFormPage.tsx`
  - Thêm nút "Tạo Audio TTS" bên cạnh phần upload audio
  - Khi nhấn: gọi `POST /tts/generate/:poiId` với `descriptionVi` hoặc `descriptionEn`
  - Hiện loading spinner + thông báo thành công/thất bại
  - Sau khi tạo xong, refresh danh sách media
- [ ] **2A.1.2** — Tích hợp TTS vào Shop Owner Portal
  - File: `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`
  - Tương tự Admin nhưng chỉ cho POI của mình
- [ ] **2A.1.3** — Thêm TTS service vào admin frontend
  - File mới: `apps/admin/src/services/tts.service.ts`
  - Functions: `generateTts(poiId, language, text)`, `getVoices()`

---

### 2A.2 Shop Registration Flow (Quy trình đăng ký cửa hàng)

> Hiện tại: ShopOwner được Admin tạo thủ công. Cần thêm luồng đăng ký + duyệt pháp lý.

#### Database Changes

- [ ] **2A.2.1** — Cập nhật Prisma Schema
  - File: `apps/api/prisma/schema.prisma`
  - Thêm enum `ShopStatus`:
    ```
    enum ShopStatus {
      PENDING_REVIEW
      DOCUMENTS_REQUESTED
      APPROVED
      REJECTED
      SUSPENDED
    }
    ```
  - Thêm fields vào model `ShopOwner`:
    ```
    status          ShopStatus @default(PENDING_REVIEW)
    businessLicense String?    // URL file giấy phép kinh doanh
    rejectionReason String?
    reviewedAt      DateTime?
    reviewedBy      String?    // Admin userId
    submittedAt     DateTime   @default(now())
    ```
  - Chạy: `npx prisma migrate dev --name add-shop-registration-flow`

#### Backend API

- [ ] **2A.2.2** — Cập nhật Auth Module — cho phép SHOP_OWNER tự đăng ký
  - File: `apps/api/src/modules/auth/auth.service.ts`
  - Khi register với role=SHOP_OWNER:
    - Tạo User + ShopOwner profile với status=PENDING_REVIEW
    - Không cho phép tạo POI cho đến khi APPROVED
  - Endpoint hiện có: `POST /auth/register` — chỉ cần cập nhật logic

- [ ] **2A.2.3** — Thêm endpoints quản lý shop status
  - File: `apps/api/src/modules/merchants/merchants.controller.ts`
  - Endpoints mới (Admin only):
    ```
    PATCH /merchants/:id/approve     — Duyệt shop
    PATCH /merchants/:id/reject      — Từ chối + lý do
    PATCH /merchants/:id/suspend     — Đình chỉ
    PATCH /merchants/:id/request-docs — Yêu cầu bổ sung giấy tờ
    GET   /merchants?status=PENDING_REVIEW — Lọc theo status
    ```
  - File: `apps/api/src/modules/merchants/merchants.service.ts`
  - Cập nhật logic: validate state transitions (PENDING → APPROVED/REJECTED, etc.)

- [ ] **2A.2.4** — Upload giấy phép kinh doanh
  - File: `apps/api/src/modules/shop-owner/shop-owner.controller.ts`
  - Endpoint mới: `POST /shop-owner/me/documents` — upload file giấy phép
  - Lưu vào `uploads/documents/{userId}/`
  - Cập nhật `ShopOwner.businessLicense` URL

- [ ] **2A.2.5** — Guard: chặn tạo POI khi chưa APPROVED
  - File: `apps/api/src/modules/shop-owner/shop-owner.service.ts`
  - Kiểm tra `shopOwner.status === 'APPROVED'` trước khi cho tạo POI
  - Throw `ForbiddenException('Shop chưa được duyệt')`

#### Admin Dashboard

- [ ] **2A.2.6** — Trang quản lý đăng ký shop
  - File: `apps/admin/src/pages/admin/MerchantListPage.tsx`
  - Thêm tab/filter theo status: Chờ duyệt | Đã duyệt | Từ chối | Đình chỉ
  - Badge đếm số shop chờ duyệt
  - Nút actions: Duyệt / Từ chối / Yêu cầu giấy tờ / Đình chỉ

- [ ] **2A.2.7** — Chi tiết shop + review panel
  - File: `apps/admin/src/pages/admin/MerchantFormPage.tsx`
  - Hiện thông tin shop + giấy phép + timeline trạng thái
  - Form nhập lý do từ chối
  - Xem preview giấy phép kinh doanh (PDF/ảnh)

#### Shop Owner Portal

- [ ] **2A.2.8** — Hiện trạng thái pháp lý
  - File: `apps/admin/src/pages/owner/ShopOwnerDashboardPage.tsx`
  - Banner trạng thái: PENDING (vàng), APPROVED (xanh), REJECTED (đỏ)
  - Nếu REJECTED: hiện lý do + nút "Nộp lại"
  - Nếu DOCUMENTS_REQUESTED: hiện form upload giấy tờ
  - Nếu PENDING: thông báo "Đang chờ Admin duyệt"

---

### 2A.3 Translation Intelligence (Dịch thuật thông minh NER)

> Dịch text VI → EN, giữ nguyên danh từ riêng (Hai Bà Trưng ≠ Two Lady Trung).

#### Backend API

- [ ] **2A.3.1** — Tạo Translation Module
  - Thư mục mới: `apps/api/src/modules/translation/`
  - Files:
    ```
    translation.module.ts
    translation.controller.ts
    translation.service.ts
    dto/translate.dto.ts
    ```

- [ ] **2A.3.2** — TranslationService — Core logic
  - File: `apps/api/src/modules/translation/translation.service.ts`
  - Method `translateForPoi(poiId, sourceText, sourceLang, targetLang)`:
    1. **NER Pass**: Dùng regex/dictionary để detect danh từ riêng VN
       - Dictionary file: `apps/api/src/modules/translation/data/vietnamese-proper-nouns.json`
       - Chứa: tên đường, quận, chợ, địa danh HCMC phổ biến
       - Pattern: "Hai Bà Trưng", "Bến Thành", "Vĩnh Khánh", "Quận 4"...
    2. **Placeholder**: Thay danh từ riêng bằng `{{ENTITY_1}}`, `{{ENTITY_2}}`
    3. **Translate**: Gọi translation API (DeepL free hoặc Google Translate)
    4. **Restore**: Thay `{{ENTITY_N}}` về danh từ riêng gốc (romanized)
    5. **Post-process**: Sửa "chợ Bến Thành" → "Ben Thanh Market" (generic noun dịch, proper noun giữ)
  - Config provider trong `.env`:
    ```
    TRANSLATION_PROVIDER=deepl  # hoặc google
    DEEPL_API_KEY=xxx
    ```

- [ ] **2A.3.3** — Translation Controller
  - File: `apps/api/src/modules/translation/translation.controller.ts`
  - Endpoints:
    ```
    POST /translation/translate          — Dịch text (Admin/ShopOwner)
    POST /translation/translate-poi/:id  — Dịch description của POI, tự điền descriptionEn
    ```

- [ ] **2A.3.4** — Vietnamese Proper Nouns Dictionary
  - File: `apps/api/src/modules/translation/data/vietnamese-proper-nouns.json`
  - Cấu trúc:
    ```json
    {
      "streets": ["Hai Bà Trưng", "Lê Lợi", "Nguyễn Huệ", "Vĩnh Khánh", ...],
      "landmarks": ["chợ Bến Thành", "Nhà thờ Đức Bà", "Bưu điện Trung tâm", ...],
      "districts": ["Quận 1", "Quận 4", "Bình Thạnh", "Thủ Đức", ...],
      "foods": ["Phở", "Bún bò Huế", "Bánh mì", "Cơm tấm", ...]
    }
    ```

- [ ] **2A.3.5** — Đăng ký module
  - File: `apps/api/src/app.module.ts` — import TranslationModule

#### Admin Dashboard

- [ ] **2A.3.6** — Nút "Dịch tự động" trên POI Form
  - File: `apps/admin/src/pages/admin/POIFormPage.tsx`
  - Bên cạnh textarea `descriptionEn`:
    - Nút "Dịch từ tiếng Việt" → gọi `POST /translation/translate-poi/:id`
    - Hiện preview bản dịch → confirm → lưu vào `descriptionEn` + `nameEn`
  - Tương tự cho `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`

---

### 2A.4 Audio Criteria Engine (Scoring khi nhiều POI trigger)

> Khi user đứng trong vùng trigger của nhiều POI, chọn POI tốt nhất để phát.

- [ ] **2A.4.1** — Implement scoring algorithm trên Mobile
  - File: `apps/mobile/utils/audioCriteria.ts` (file mới)
  - Function `scorePoi(poi, userLocation, playedPoiIds, autoPlayEnabled)`:
    ```typescript
    interface PoiScore {
      poiId: string;
      score: number;
      breakdown: {
        priority: number;    // 30% — CULTURAL > DINING > STREET_FOOD
        distance: number;    // 30% — gần hơn = điểm cao hơn
        notPlayed: number;   // 25% — chưa phát = 10, đã phát = 0
        autoplay: number;    // 15% — user setting ON = 10
      };
    }
    ```
  - Function `selectBestPoi(candidates: PoiScore[]): PoiScore`

- [ ] **2A.4.2** — Tích hợp vào GPS Trigger Loop
  - File: `apps/mobile/app/(tabs)/index.tsx`
  - Thay logic hiện tại (trigger POI gần nhất) bằng scoring engine
  - Khi có nhiều POI trong trigger range:
    1. Score tất cả candidates
    2. Chọn POI có score cao nhất
    3. Queue POI tiếp theo nếu user vẫn ở trong range

- [ ] **2A.4.3** — Track POI đã phát
  - File: `apps/mobile/context/AudioContext.tsx`
  - Thêm `playedPoiIds: Set<string>` vào context
  - Cập nhật khi audio bắt đầu phát
  - Reset khi user rời khỏi khu vực (tất cả POI out of range)

---

### 2A.5 Frontend — Highlight POI đang phát

- [ ] **2A.5.1** — Pulse animation cho marker đang phát
  - File: `apps/mobile/app/(tabs)/index.tsx`
  - Khi POI đang phát audio:
    - Marker đổi màu sang `#F97316` (cam)
    - Thêm Animated pulse ring quanh marker
    - Size marker lớn hơn 1.5x
  - Dùng `react-native Animated` API

- [ ] **2A.5.2** — Bottom sheet cải thiện
  - File: `apps/mobile/components/POITriggerSheet.tsx`
  - Hiện thông tin POI đang phát:
    - Tên + category badge
    - Mini AudioPlayer (play/pause + progress bar)
    - Nút "Xem chi tiết" → navigate to POI detail
    - Nút "Tiếp theo →" nếu có POI khác trong queue

---

## Phase 2B — Enhanced Features (Ưu tiên TRUNG BÌNH)

### 2B.1 Offline Map (PMTiles)

- [ ] **2B.1.1** — Tạo PMTiles cho khu vực Quận 4
  - Tool: `tilemaker` hoặc `pmtiles` CLI
  - Input: OpenStreetMap export cho khu vực Q4, HCMC
  - Output: `assets/maps/q4-hcmc.pmtiles` (~50MB, zoom 12-18)
  - Host file trên server: `GET /public/maps/q4-hcmc.pmtiles`

- [ ] **2B.1.2** — Tích hợp MapLibre vào mobile
  - Package: `@maplibre/maplibre-react-native`
  - File mới: `apps/mobile/components/OfflineMap.tsx`
  - Logic chuyển đổi:
    - Có internet → Google Maps (hiện tại)
    - Không internet → MapLibre + PMTiles local
  - File: `apps/mobile/utils/networkStatus.ts` — detect online/offline

- [ ] **2B.1.3** — Download manager
  - File mới: `apps/mobile/services/downloadManager.ts`
  - Function `downloadMapTiles()`:
    - Kiểm tra bộ nhớ (cần ~100MB free)
    - Download với progress callback
    - Lưu vào `FileSystem.documentDirectory`
    - Verify file integrity (checksum)

- [ ] **2B.1.4** — UI download trong Settings
  - File: `apps/mobile/app/(tabs)/more.tsx`
  - Section "Bản đồ offline":
    - Status: Chưa tải / Đang tải (60%) / Đã tải (50MB)
    - Nút Tải / Xóa
    - Thông tin phiên bản + ngày cập nhật

---

### 2B.2 Language Package (Gói ngôn ngữ offline)

- [ ] **2B.2.1** — API endpoint tải gói ngôn ngữ
  - File mới: `apps/api/src/modules/public/dto/language-pack.dto.ts`
  - File: `apps/api/src/modules/public/public.controller.ts`
  - Endpoint mới:
    ```
    GET /public/language-pack/:lang       — Metadata (danh sách audio files + sizes)
    GET /public/language-pack/:lang/download — ZIP toàn bộ audio files cho ngôn ngữ
    ```
  - Response metadata:
    ```json
    {
      "language": "VI",
      "totalFiles": 45,
      "totalSizeBytes": 52428800,
      "version": "2026-03-15",
      "files": [
        { "poiId": "xxx", "url": "/uploads/tts/xxx_vi.mp3", "sizeBytes": 123456 }
      ]
    }
    ```

- [ ] **2B.2.2** — Download manager cho audio trên mobile
  - File mới: `apps/mobile/services/languagePackService.ts`
  - Functions:
    - `getInstalledPacks()` — đọc từ SQLite
    - `downloadPack(lang)` — tải từng file + progress
    - `deletePack(lang)` — xóa files + DB records
    - `getLocalAudioPath(poiId, lang)` — trả path local nếu đã tải
  - Quy tắc:
    - Max 300 files/ngôn ngữ
    - Max 3 ngôn ngữ trên device
    - Quá 3 → hỏi user xóa ngôn ngữ nào (LRU suggestion)

- [ ] **2B.2.3** — UI quản lý gói ngôn ngữ
  - File: `apps/mobile/app/language.tsx`
  - Cập nhật UI:
    - Danh sách ngôn ngữ + trạng thái (Đã tải / Chưa tải / Đang tải)
    - Progress bar khi đang tải
    - Dung lượng mỗi gói
    - Nút Tải / Xóa / Cập nhật
    - Cảnh báo khi đạt giới hạn 3 ngôn ngữ

- [ ] **2B.2.4** — Cập nhật AudioContext để ưu tiên audio local
  - File: `apps/mobile/context/AudioContext.tsx`
  - Logic:
    1. Kiểm tra local audio file → play offline
    2. Không có → stream từ server
    3. Không có internet → hiện thông báo

---

### 2B.3 WebSocket Real-time Dashboard

- [ ] **2B.3.1** — Tạo WebSocket Gateway trên NestJS
  - File mới: `apps/api/src/modules/realtime/realtime.module.ts`
  - File mới: `apps/api/src/modules/realtime/realtime.gateway.ts`
  - Package: `@nestjs/websockets`, `@nestjs/platform-socket.io`
  - Events:
    ```
    connection     — Client kết nối (track bằng userId/role)
    disconnect     — Client ngắt kết nối
    users_online   — Broadcast mỗi 10s: { total, byRole, activeAudio }
    trigger_event  — Broadcast khi có GPS/QR trigger mới
    ```
  - Max 50 connections, heartbeat 30s

- [ ] **2B.3.2** — Đăng ký module
  - File: `apps/api/src/app.module.ts` — import RealtimeModule

- [ ] **2B.3.3** — Admin Dashboard hiện real-time stats
  - File: `apps/admin/src/pages/admin/DashboardPage.tsx`
  - Package: `socket.io-client`
  - Cards real-time:
    - Users online (total + by role)
    - Active audio sessions
    - Recent triggers (live feed)
  - Auto-reconnect khi mất kết nối

---

### 2B.4 Heatmap (Bản đồ nhiệt)

- [ ] **2B.4.1** — API endpoint aggregation
  - File: `apps/api/src/modules/analytics/analytics.controller.ts`
  - Endpoint mới:
    ```
    GET /admin/analytics/heatmap?from=&to=  — Trigger count per POI (7 ngày default)
    ```
  - Response:
    ```json
    [
      { "poiId": "xxx", "lat": 10.75, "lng": 106.69, "triggers": 342, "uniqueVisitors": 89, "audioPlayRate": 0.89 }
    ]
    ```

- [ ] **2B.4.2** — Heatmap visualization trên Admin
  - File: `apps/admin/src/pages/admin/AnalyticsPage.tsx`
  - Thêm tab "Bản đồ nhiệt"
  - Dùng Leaflet heatmap plugin (`leaflet.heat`)
  - Hiện circles trên bản đồ: màu đỏ = hot, xanh = cold
  - Click circle → popup với stats chi tiết

---

### 2B.5 Geocoding Auto-fill

- [ ] **2B.5.1** — Geocoding Service trên backend
  - File mới: `apps/api/src/modules/geocoding/geocoding.module.ts`
  - File mới: `apps/api/src/modules/geocoding/geocoding.service.ts`
  - Function `addressToCoordinates(address: string)`:
    - Primary: Google Geocoding API (nếu có key)
    - Fallback: Nominatim (free, rate limited)
  - Endpoint: `GET /geocoding/search?q=72+Vinh+Khanh+Quan+4`
  - Response: `{ lat: 10.756, lng: 106.699, displayName: "..." }`

- [ ] **2B.5.2** — Tích hợp vào MapPicker component
  - File: `apps/admin/src/components/MapPicker.tsx`
  - Khi Shop Owner nhập địa chỉ → auto-suggest → chọn → fill lat/lng
  - Fallback: kéo marker trên bản đồ

---

## Phase 3 — Premium Features (Ưu tiên THẤP)

### 3.1 Payment (MoMo / VNPay)

- [ ] **3.1.1** — Tạo Payment Module
  - Thư mục: `apps/api/src/modules/payment/`
  - Files:
    ```
    payment.module.ts
    payment.controller.ts
    payment.service.ts
    providers/momo.provider.ts
    providers/vnpay.provider.ts
    providers/mock.provider.ts      ← Dev/test
    dto/create-payment.dto.ts
    ```

- [ ] **3.1.2** — Database: Subscription model
  - Thêm vào `schema.prisma`:
    ```
    enum SubscriptionTier { FREE, PREMIUM, BUSINESS }
    enum PaymentStatus { PENDING, COMPLETED, FAILED, REFUNDED }

    model Subscription {
      id        String           @id @default(uuid())
      userId    String
      tier      SubscriptionTier @default(FREE)
      startDate DateTime
      endDate   DateTime
      autoRenew Boolean          @default(true)
      ...
    }

    model PaymentTransaction {
      id             String        @id @default(uuid())
      userId         String
      amount         Int           // VND
      provider       String        // "momo" | "vnpay"
      providerTxnId  String?
      status         PaymentStatus @default(PENDING)
      ...
    }
    ```

- [ ] **3.1.3** — MoMo Provider
  - File: `apps/api/src/modules/payment/providers/momo.provider.ts`
  - Implement: createPayment → redirect URL, handleCallback → verify signature

- [ ] **3.1.4** — VNPay Provider
  - File: `apps/api/src/modules/payment/providers/vnpay.provider.ts`
  - Implement: createPaymentUrl, verifyReturnUrl, handleIPN

- [ ] **3.1.5** — Payment UI trên Mobile
  - File mới: `apps/mobile/app/subscription.tsx`
  - Hiện bảng giá: Free / Premium (49K) / Business (199K)
  - Chọn gói → chọn phương thức → redirect MoMo/VNPay → callback

---

### 3.2 Load Testing

- [ ] **3.2.1** — Viết k6 scripts
  - File mới: `tests/load/scenarios/`
    ```
    public-pois.js          — GET /public/pois (basic load)
    nearby-pois.js          — GET /public/pois/nearby (compute heavy)
    tourist-flow.js         — Login → browse → trigger → audio (full flow)
    concurrent-audio.js     — 100 users stream audio cùng lúc
    ```

- [ ] **3.2.2** — Chạy và ghi kết quả
  - Target: 200 CCU, p95 < 300ms
  - Ghi kết quả vào `docs/load-testing-results.md`
  - Bao gồm: throughput, latency percentiles, error rate, CPU/memory

---

### 3.3 Premium Voices (Giọng vùng miền)

- [ ] **3.3.1** — Mở rộng VOICE_MAP
  - File: `apps/api/src/modules/tts/tts.service.ts`
  - Thêm giọng vùng miền:
    ```
    VI_SOUTH: 'vi-VN-NamMinhNeural'   // Giọng Nam
    VI_CENTRAL: TBD                     // Giọng Trung (nếu có)
    ```
  - Đánh dấu premium voices → chỉ cho PREMIUM subscribers

- [ ] **3.3.2** — Guard kiểm tra subscription
  - Middleware check `user.subscription.tier >= PREMIUM` trước khi cho dùng premium voice

---

## Thứ Tự Thực Hiện Đề Xuất

```
Sprint 1 (Tuần 1-2):
  2A.1.1 → 2A.1.3   TTS tích hợp frontend         [2 ngày]
  2A.2.1 → 2A.2.5   Shop Registration backend      [3 ngày]
  2A.2.6 → 2A.2.8   Shop Registration frontend     [2 ngày]

Sprint 2 (Tuần 3-4):
  2A.3.1 → 2A.3.5   Translation NER backend        [3 ngày]
  2A.3.6             Translation frontend           [1 ngày]
  2A.4.1 → 2A.4.3   Audio Criteria Engine          [2 ngày]
  2A.5.1 → 2A.5.2   POI highlight + bottom sheet   [2 ngày]

Sprint 3 (Tuần 5-6):
  2B.3.1 → 2B.3.3   WebSocket Dashboard            [3 ngày]
  2B.4.1 → 2B.4.2   Heatmap                        [2 ngày]
  2B.5.1 → 2B.5.2   Geocoding                      [1 ngày]

Sprint 4 (Tuần 7-8):
  2B.1.1 → 2B.1.4   Offline Map (PMTiles)          [4 ngày]
  2B.2.1 → 2B.2.4   Language Package               [4 ngày]

Sprint 5+ (Nếu còn thời gian):
  3.1.1 → 3.1.5     Payment                        [5 ngày]
  3.2.1 → 3.2.2     Load Testing                   [2 ngày]
  3.3.1 → 3.3.2     Premium Voices                 [1 ngày]
```

---

## Dependency Graph

```
TTS Engine (done) ──┬──> TTS Frontend (2A.1)
                    └──> Premium Voices (3.3) ──> Payment (3.1)

Shop Registration (2A.2) ──> độc lập, làm song song được

Translation NER (2A.3) ──> cần TTS Engine (done) để tạo audio EN sau khi dịch

Audio Criteria (2A.4) ──> POI Highlight (2A.5)

WebSocket (2B.3) ──> Heatmap (2B.4) (dùng chung realtime infrastructure)

Offline Map (2B.1) ┐
                   ├──> cần làm cùng nhau cho offline experience hoàn chỉnh
Language Pack (2B.2)┘
```

---

## Checklist Trước Khi Bắt Đầu Mỗi Task

1. Đọc lại mô tả task trong plan
2. Đọc code hiện tại của file cần sửa
3. Chạy `docker compose up -d` (PostgreSQL + Redis)
4. Chạy `npm run start:dev` để verify API đang chạy
5. Sau khi code xong → test thủ công qua Swagger / App
6. Đánh dấu checkbox [x] trong file này
