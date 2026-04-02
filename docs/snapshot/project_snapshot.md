# Project Snapshot: Seminar GPS Tours

> **Last updated**: 2026-03-15 14:00
> **Monorepo root**: `D:\IT\Projects\Seminar`

---

## 1. Backend API (Phase 1) — `apps/api`

| Item | Detail |
|------|--------|
| **Framework** | NestJS 11 + TypeScript |
| **ORM** | Prisma 5 + PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Auth** | JWT (Access 15min + Refresh 7d), bcrypt 12 rounds, Passport.js |
| **Security** | 5-attempt lockout (30min), refresh token rotation, token revocation |
| **API Docs** | Swagger at `http://localhost:3000/api` |
| **Base URL** | `http://localhost:3000/api/v1` |
| **Port** | 3000 (configurable via `.env`) |

### Modules (10)

| Module | Prefix | Chức năng | Endpoints |
|--------|--------|-----------|-----------|
| `AuthModule` | `/auth` | Register, Login, Refresh, Forgot/Reset Password, Logout | 6 |
| `PoisModule` | `/pois` | Admin CRUD cho POI + status workflow | 6 |
| `ToursModule` | `/tours` | Admin CRUD cho Tour + ordered POI sequences | 6 |
| `MediaModule` | `/pois/:id/media` | Upload/Delete hình ảnh & audio (max 50MB) | 2 |
| `PublicModule` | `/public` | POIs, Tours, Nearby (Haversine), QR validate, Trigger log | 7 |
| `TouristModule` | `/tourist` | Profile, Favorites, History (JWT required) | 7 |
| `MerchantsModule` | `/merchants` | Admin quản lý Shop Owner accounts | 5 |
| `ShopOwnerModule` | `/shop-owner` | Profile, POIs, Media upload, Analytics portal | 7 |
| `ProfileModule` | `/me` | Unified profile (mọi role), avatar upload | 3 |
| `AnalyticsModule` | `/admin/analytics` | KPI overview, top POIs, trigger stats | 1 |
| | | **Tổng** | **~50** |

### Key Endpoints

**Public (No Auth)**
- `GET /public/pois` — All active POIs with media
- `GET /public/pois/nearby?lat=&lng=&radius=` — Nearby POIs (Haversine formula)
- `GET /public/pois/:id` — POI detail + all media
- `GET /public/tours` — All active tours
- `GET /public/tours/:id` — Tour detail + ordered POIs
- `POST /public/trigger-log` — Log GPS/QR/MANUAL trigger (anonymous, deviceId-based)
- `POST /public/qr/validate` — Validate QR code format `gpstours:poi:{id}`

**Auth**
- `POST /auth/register` — Register (any role)
- `POST /auth/login` — Login → accessToken + refreshToken
- `POST /auth/refresh` — Refresh access token (rotation)
- `POST /auth/forgot-password` — Request password reset email
- `POST /auth/reset-password` — Reset with token
- `POST /auth/logout` — Revoke tokens (protected)

**Tourist (JWT Required)**
- `GET/PATCH /tourist/me` — Profile + settings (languagePref, autoPlayAudio)
- `GET/POST/DELETE /tourist/me/favorites` — Favorites management
- `GET/POST /tourist/me/history` — View history with pagination

**Shop Owner (JWT + SHOP_OWNER)**
- `GET/PATCH /shop-owner/me` — Shop profile
- `GET/POST/PUT /shop-owner/pois` — Own POIs CRUD
- `POST /shop-owner/pois/:id/media` — Upload media (owner only)
- `GET /shop-owner/analytics` — View/audio play stats per POI

**Admin (JWT + ADMIN)**
- Full CRUD: `/pois`, `/tours`, `/merchants`
- `POST /pois/:poiId/media` — Media upload
- `PATCH /pois/:id/status` — Status workflow (DRAFT/ACTIVE/ARCHIVED)
- `GET /admin/analytics/overview` — Platform KPIs

**Profile (Any authenticated)**
- `GET/PUT /me` — Unified profile
- `POST /me/avatar` — Avatar upload (5MB max)

### Database Schema

**Models (10):** User, ShopOwner, TouristUser, Poi, PoiMedia, Tour, TourPoi, Favorite, ViewHistory, TriggerLog + PasswordResetToken, RevokedToken

**Enums:** Role (ADMIN, SHOP_OWNER, TOURIST), UserStatus, PoiCategory (8 types), PoiStatus (DRAFT, ACTIVE, ARCHIVED), TourStatus, MediaType (IMAGE, AUDIO), MediaLanguage (VI, EN, ALL), TriggerType (GPS, QR, MANUAL), UserAction (ACCEPTED, SKIPPED, DISMISSED)

### Database (Docker)

```yaml
# apps/api/docker-compose.yml
PostgreSQL 15: port 5432, user: postgres, pass: 123, db: seminar_gpstour
Redis 7:       port 6379
```

---

## 2. Admin Dashboard (Phase 2) — `apps/admin`

| Item | Detail |
|------|--------|
| **Framework** | React 19 + Vite 7 + TypeScript |
| **Styling** | Tailwind CSS 4 |
| **State** | TanStack Query 5 (server state) |
| **HTTP** | Axios with JWT interceptors |
| **Maps** | Leaflet + React Leaflet 5 (MapPicker) |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **URL** | `http://localhost:5173` |

### Admin Pages (10)

| Page | File | Chức năng |
|------|------|-----------|
| Login | `LoginPage.tsx` | JWT authentication |
| Register | `RegisterPage.tsx` | User registration (ADMIN/SHOP_OWNER) |
| Dashboard | `DashboardPage.tsx` | KPI cards, recent activity, quick actions |
| POI List | `POIListPage.tsx` | Table + search + status filter + category filter |
| POI Form | `POIFormPage.tsx` | Create/Edit/View POI + bilingual + media + MapPicker |
| Tour List | `TourListPage.tsx` | Table + search + status filter + pagination |
| Tour Form | `TourFormPage.tsx` | Create/Edit Tour + POI ordering |
| Merchant List | `MerchantListPage.tsx` | Shop owners card layout + search |
| Merchant Form | `MerchantFormPage.tsx` | Create/Edit merchant + status control |
| Analytics | `AnalyticsPage.tsx` | KPI cards, weekly chart, top POIs, trends |
| Profile | `ProfilePage.tsx` | Personal info, shop info, opening hours, avatar |
| Settings | `PlaceholderPage.tsx` | Under development |

### Shop Owner Portal Pages (4)

| Page | File | Chức năng |
|------|------|-----------|
| Dashboard | `ShopOwnerDashboardPage.tsx` | My POIs overview, stats, quick actions |
| Analytics | `ShopOwnerAnalyticsPage.tsx` | Date range, daily chart, per-POI breakdown |
| Profile | `ShopOwnerProfilePage.tsx` | Business info, avatar |
| POI Form | `ShopOwnerPOIFormPage.tsx` | Create POI + bilingual + media + MapPicker |

### Services (6)

| Service | Endpoints |
|---------|-----------|
| `auth.service.ts` | login, register, refresh, logout, forgot/reset password |
| `poi.service.ts` | CRUD POIs + media upload/delete + filtering |
| `tour.service.ts` | CRUD Tours + POI sequences |
| `merchant.service.ts` | CRUD Merchants |
| `profile.service.ts` | Get/Update admin profile + avatar |
| `shopOwnerPortal.service.ts` | Shop owner portal APIs |

### Key Components

| Component | Chức năng |
|-----------|-----------|
| `DashboardLayout.tsx` | Admin sidebar + header wrapper |
| `ShopOwnerLayout.tsx` | Shop owner header + nav tabs |
| `MapPicker.tsx` | Leaflet map + Nominatim geocoding + coordinate picker |
| `POIPreviewModal.tsx` | POI preview with audio player |
| `ConfirmDialog.tsx` | Delete confirmation |
| `ProtectedRoute.tsx` | Auth guard for admin routes |

---

## 3. Tourist Mobile App (Phase 3) — `apps/mobile`

| Item | Detail |
|------|--------|
| **Framework** | Expo SDK 54 + React Native 0.81 + TypeScript |
| **Navigation** | expo-router (file-based) |
| **Maps** | react-native-maps (default provider) |
| **Audio** | expo-audio (global AudioContext singleton) |
| **Camera** | expo-camera (QR scanner) |
| **Location** | expo-location (foreground + background tracking) |
| **Offline** | expo-sqlite (gpstours.db) |
| **Storage** | @react-native-async-storage/async-storage |
| **Icons** | lucide-react-native + react-native-svg |
| **HTTP** | Axios (auto-detect LAN IP via expo-constants) |

### Screens (12)

| Screen | File | Chức năng |
|--------|------|-----------|
| Map | `app/(tabs)/index.tsx` | Bản đồ + POI markers + GPS trigger + bottom sheet |
| Tours | `app/(tabs)/tours.tsx` | Danh sách tours + badges |
| More | `app/(tabs)/more.tsx` | Login/Logout, Settings, Favorites/History links |
| POI Detail | `app/poi/[id].tsx` | Image carousel, AudioPlayer, language toggle, favorite |
| Tour Detail | `app/tour/[id].tsx` | Route map (Polyline), POI timeline |
| Tour Follow | `app/tour/follow/[id].tsx` | Real-time navigation, live tracking |
| QR Scanner | `app/scanner.tsx` | Camera QR scan + offline/online validation |
| Language | `app/language.tsx` | Language selection (VI/EN) |
| Favorites | `app/favorites.tsx` | Bookmarked POIs (logged-in only) |
| History | `app/history.tsx` | View history (logged-in only) |
| Onboarding | `app/onboarding.tsx` | 3-slide tutorial |
| Login/Register | `app/login.tsx`, `app/register.tsx` | Tourist auth |

### Components & Context

| Item | Chức năng |
|------|-----------|
| `AudioPlayer.tsx` | Play/Pause, progress bar, time display, auto-play, language-aware |
| `AudioContext.tsx` | Global audio singleton: play, pause, resume, seek, stop |

### Services (4)

| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios instance, auto LAN IP, JWT from AsyncStorage, `getMediaUrl()` |
| `publicService.ts` | POIs, Tours, QR validate, Trigger log (no auth) |
| `touristService.ts` | Profile, Favorites, History (JWT required) |
| `authService.ts` | Login, Register |
| `database.ts` | SQLite offline: syncOfflinePois(), getOfflinePoi() |

### Key Technical Details

- **GPS Trigger**: `watchPositionAsync` every 2s / 5m threshold → Haversine distance check → auto-play audio within `triggerRadius` (default 50m)
- **Audio Selection**: Language preference → MediaLanguage match → fallback to any available audio
- **Offline**: SQLite stores text POI data; `hasLargeAudio` flag marks POIs needing network
- **Map Styling**: Custom `organicMapStyle` for cleaner visuals
- **Marker Colors**: `#F97316` (orange) default, `#EF4444` (red) for CULTURAL_LANDMARKS

---

## 4. Environment & Tooling

| Tool | Chi tiết |
|------|----------|
| **Node.js** | v24+ |
| **PostgreSQL** | 15 (Docker: `gpstours-db`, port 5432) |
| **Redis** | 7 (Docker: `gpstours-cache`, port 6379) |
| **Prisma Studio** | `http://localhost:5555` |
| **Swagger** | `http://localhost:3000/api` |

### Running Commands

```bash
# 1. Docker (PostgreSQL + Redis)
cd apps/api && docker compose up -d

# 2. Database setup
cd apps/api && npx prisma migrate dev && npx prisma db seed

# 3. Backend API (keep terminal open)
cd apps/api && npm run start:dev     # → http://localhost:3000

# 4. Admin / Shop Owner Dashboard (keep terminal open)
cd apps/admin && npm run dev         # → http://localhost:5173

# 5. Mobile App (keep terminal open)
cd apps/mobile && npx expo start --clear  # → Scan QR with Expo Go

# Database tools
cd apps/api && npx prisma studio     # → http://localhost:5555
```

---

## 5. Project Structure

```
Seminar/
├── apps/
│   ├── api/                     # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── modules/         # 10 feature modules
│   │   │   │   ├── auth/        # Register, Login, JWT, Password reset
│   │   │   │   ├── pois/        # Admin POI CRUD
│   │   │   │   ├── tours/       # Admin Tour CRUD
│   │   │   │   ├── media/       # File upload/delete
│   │   │   │   ├── public/      # Public APIs (no auth)
│   │   │   │   ├── tourist/     # Tourist profile, favorites, history
│   │   │   │   ├── merchants/   # Admin manage shop owners
│   │   │   │   ├── shop-owner/  # Shop owner portal
│   │   │   │   ├── profile/     # Unified profile (all roles)
│   │   │   │   └── analytics/   # Admin KPI dashboard
│   │   │   ├── common/          # Guards, Filters, Decorators
│   │   │   └── main.ts          # Bootstrap + Swagger
│   │   ├── prisma/              # Schema + migrations + seed
│   │   ├── uploads/             # Media file storage
│   │   ├── docker-compose.yml   # PostgreSQL + Redis
│   │   └── .env                 # Environment variables
│   │
│   ├── admin/                   # Admin + Shop Owner Dashboard (React)
│   │   └── src/
│   │       ├── pages/admin/     # 10 admin pages
│   │       ├── pages/owner/     # 4 shop owner pages
│   │       ├── pages/auth/      # Login, Register, Forgot/Reset
│   │       ├── services/        # 6 API services
│   │       ├── components/      # Layout, Forms, UI components
│   │       ├── contexts/        # AuthContext
│   │       └── lib/api.ts       # Axios config
│   │
│   └── mobile/                  # Tourist App (Expo)
│       ├── app/
│       │   ├── (tabs)/          # 3 tab screens (Map, Tours, More)
│       │   ├── poi/[id].tsx     # POI detail
│       │   ├── tour/[id].tsx    # Tour detail
│       │   ├── tour/follow/     # Tour following mode
│       │   ├── scanner.tsx      # QR scanner
│       │   └── ...              # Auth, Settings, Favorites, History
│       ├── components/          # AudioPlayer
│       ├── context/             # AudioContext (singleton)
│       ├── services/            # 4 API services + SQLite
│       ├── utils/               # distance.ts, mapStyle.ts
│       └── app.json             # Expo config
│
├── docs/                        # Documentation (6 steps)
│   ├── system-proposal.md       # Master architecture document
│   ├── context_snapshot.md      # Current project status
│   ├── QnA_Lecturer_Notes.md    # Q&A defense notes
│   ├── step1_business_idea/     # Requirements intake
│   ├── step2_lowcode/           # Screens, flows, rules, data
│   ├── step3_prd/               # 13 PRD documents + diagrams
│   ├── step4_implementation_plan/ # Tech stack + API testing
│   ├── snapshot/                # Project snapshot
│   └── cloud_deployment_guide.md
├── README.md                    # Setup & run instructions
└── .gitignore
```

---

## 6. Phase 2+ Roadmap (Post-MVP)

| Phase | Modules | Status |
|-------|---------|--------|
| **Phase 1** (Done) | Auth, POI CRUD, Tour CRUD, Media, Public API, Tourist API, ShopOwner Portal, Admin Dashboard, Mobile App | ✅ |
| **Phase 2A** (Next) | TTS Engine, Audio Criteria Engine, Shop Approval Flow, Frontend Highlight, QR Generator | Planning |
| **Phase 2B** (After) | Translation NER, Offline Map (PMTiles), Language Package, WebSocket Dashboard, Geocoding API, Heatmap UI | Planning |
| **Phase 3** (Future) | Payment (MoMo/VNPay), Load Testing, Premium Voices, STT (Speech-to-Text) | Planning |
