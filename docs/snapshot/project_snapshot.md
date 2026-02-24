# Project Snapshot: Seminar GPS Tours

> **Last updated**: 2026-02-24 21:43  
> **Monorepo root**: `D:\IT\Projects\Seminar`

---

## 1. Backend API (Phase 1) — `apps/api`

| Item | Detail |
|------|--------|
| **Framework** | NestJS 11 + TypeScript |
| **ORM** | Prisma 5 + PostgreSQL 15 |
| **Cache** | Redis 7 |
| **Auth** | JWT (Access + Refresh tokens), bcrypt, Passport.js |
| **API Docs** | Swagger at `http://localhost:3000/api` |
| **Base URL** | `http://localhost:3000/api/v1` |
| **Port** | 3000 (configurable via `.env`) |

### Modules (10)

| Module | Đường dẫn | Chức năng |
|--------|-----------|-----------|
| `AuthModule` | `modules/auth/` | Register, Login, Refresh Token, Change Password |
| `PoisModule` | `modules/pois/` | Admin CRUD cho POI (Points of Interest) |
| `ToursModule` | `modules/tours/` | Admin CRUD cho Tour + ordered POI sequences |
| `MediaModule` | `modules/media/` | Upload/Delete hình ảnh & audio cho POI |
| `PublicModule` | `modules/public/` | APIs công khai: POIs, Tours, QR validate, Trigger log |
| `TouristModule` | `modules/tourist/` | Profile, Favorites, History cho du khách (JWT required) |
| `MerchantsModule` | `modules/merchants/` | Admin quản lý Shop Owners |
| `ShopOwnerModule` | `modules/shop-owner/` | Shop Owner portal API |
| `ProfileModule` | `modules/profile/` | User profile management |
| `AnalyticsModule` | `modules/analytics/` | KPI: views, triggers, active users |

### Key Endpoints (~50)

**Public (No Auth)**
- `GET /public/pois` — All active POIs
- `GET /public/pois/nearby?lat=&lng=&radius=` — Nearby POIs (Haversine)
- `GET /public/pois/:id` — POI detail + all media
- `GET /public/tours` — All active tours
- `GET /public/tours/:id` — Tour detail + ordered POIs
- `POST /public/trigger-log` — Log GPS/QR trigger
- `POST /public/qr/validate` — Validate QR code → POI

**Auth**
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login → access + refresh tokens
- `POST /auth/refresh` — Refresh access token

**Tourist (JWT Required)**
- `GET/PATCH /tourist/me` — Profile
- `GET/POST/DELETE /tourist/me/favorites` — Favorites
- `GET/POST /tourist/me/history` — View history

**Admin (JWT + ADMIN role)**
- Full CRUD: `/pois`, `/tours`, `/merchants`
- Media upload: `POST /media/upload/:poiId`

### Database (Docker)

```yaml
# apps/api/docker-compose.yml
PostgreSQL 15: port 5432, container gpstours-db
Redis 7:       port 6379, container gpstours-cache
```

### Config Files
- `apps/api/.env` — DB URL, JWT secrets, ports, upload config
- `apps/api/prisma/schema.prisma` — Database schema
- `apps/api/docker-compose.yml` — PostgreSQL + Redis

---

## 2. Admin Dashboard (Phase 2) — `apps/admin`

| Item | Detail |
|------|--------|
| **Framework** | React 19 + Vite 7 + TypeScript |
| **Styling** | Tailwind CSS 4 + shadcn/ui |
| **State** | TanStack Query (server state) |
| **HTTP** | Axios with JWT interceptors |
| **URL** | `http://localhost:5173` |

### Pages (10)

| Page | File | Chức năng |
|------|------|-----------|
| Login | `LoginPage.tsx` | JWT authentication |
| Dashboard | `DashboardPage.tsx` | KPI cards, charts overview |
| POI List | `POIListPage.tsx` | Table + search + delete |
| POI Form | `POIFormPage.tsx` | Create/Edit POI + media upload |
| Tour List | `TourListPage.tsx` | Table + paginated response |
| Tour Form | `TourFormPage.tsx` | Create/Edit Tour + POI ordering |
| Merchant List | `MerchantListPage.tsx` | Shop owners list + deactivate |
| Merchant Form | `MerchantFormPage.tsx` | Create/Edit merchant accounts |
| Analytics | `AnalyticsPage.tsx` | KPI visualization |
| Profile | `ProfilePage.tsx` | Admin profile management |

### Services (6)

| Service | Endpoints |
|---------|-----------|
| `auth.service.ts` | login, register, refresh |
| `poi.service.ts` | CRUD POIs + media |
| `tour.service.ts` | CRUD Tours + POI sequences |
| `merchant.service.ts` | CRUD Merchants |
| `profile.service.ts` | Get/Update profile |
| `shopOwnerPortal.service.ts` | Shop owner portal APIs |

### Config Files
- `apps/admin/src/lib/api.ts` — Axios instance + JWT interceptors
- `apps/admin/vite.config.ts` — Vite configuration
- `apps/admin/tailwind.config.js` — Tailwind config

---

## 3. Tourist Mobile App (Phase 3) — `apps/mobile`

| Item | Detail |
|------|--------|
| **Framework** | Expo SDK 54 + React Native 0.81 + TypeScript |
| **Navigation** | expo-router (file-based) |
| **Maps** | react-native-maps (default provider) |
| **Audio** | expo-av |
| **Icons** | lucide-react-native + react-native-svg |
| **HTTP** | Axios (auto-detect LAN IP via expo-constants) |
| **Start** | `npx expo start` → Scan QR with Expo Go |

### Screens (5)

| Screen | File | Chức năng |
|--------|------|-----------|
| 🗺️ Map | `app/(tabs)/index.tsx` | Bản đồ + POI markers + GPS + bottom sheet preview |
| 📋 Tours | `app/(tabs)/tours.tsx` | Danh sách tours + badges (số POIs, duration) |
| ⚙️ More | `app/(tabs)/more.tsx` | Login/Logout, Settings, Favorites link |
| 📍 POI Detail | `app/poi/[id].tsx` | Image carousel, AudioPlayer, language toggle, favorite |
| 🗺️ Tour Detail | `app/tour/[id].tsx` | Route map (Polyline), POI timeline, Start Tour button |

### Components (1)

| Component | Chức năng |
|-----------|-----------|
| `AudioPlayer.tsx` | Play/Pause, progress bar, time display (expo-av) |

### Services (3)

| Service | Chức năng |
|---------|-----------|
| `api.ts` | Axios instance, auto LAN IP, JWT from AsyncStorage |
| `publicService.ts` | POIs, Tours, QR validate, Trigger log (no auth) |
| `touristService.ts` | Profile, Favorites, History (JWT required) |

### Config Files
- `app.json` — Expo config, scheme `gpstours`, plugins
- `babel.config.js` — babel-preset-expo
- `metro.config.js` — Module resolution for monorepo
- `package.json` — Entry: `expo-router/entry`

---

## 4. Environment & Tooling

| Tool | Chi tiết |
|------|----------|
| **Node.js** | v24.12.0 |
| **PostgreSQL** | 15 (Docker: `gpstours-db`, port 5432) |
| **Redis** | 7 (Docker: `gpstours-cache`, port 6379) |
| **Prisma Studio** | `http://localhost:5555` |
| **Swagger** | `http://localhost:3000/api` |

### Running Commands

```bash
# Backend
cd apps/api && npm run start:dev     # Port 3000

# Admin Dashboard
cd apps/admin && npm run dev         # Port 5173

# Mobile App
cd apps/mobile && npx expo start     # Expo Go QR scan

# Database tools
cd apps/api && npx prisma studio     # Port 5555
cd apps/api && docker compose up -d  # PostgreSQL + Redis
```

---

## 5. Project Structure

```
Seminar/
├── apps/
│   ├── api/                    # Backend (NestJS)
│   │   ├── src/
│   │   │   ├── modules/        # 10 feature modules
│   │   │   ├── common/         # Guards, Filters, Decorators
│   │   │   └── main.ts         # App entry point
│   │   ├── prisma/             # Schema + migrations
│   │   ├── docker-compose.yml  # PostgreSQL + Redis
│   │   └── .env                # Environment variables
│   │
│   ├── admin/                  # Admin Dashboard (React)
│   │   └── src/
│   │       ├── pages/admin/    # 10 pages
│   │       ├── services/       # 6 API services
│   │       ├── components/     # Layout + UI components
│   │       └── lib/api.ts      # Axios config
│   │
│   └── mobile/                 # Tourist App (Expo)
│       ├── app/
│       │   ├── (tabs)/         # 3 tab screens
│       │   ├── poi/[id].tsx    # POI detail
│       │   └── tour/[id].tsx   # Tour detail
│       ├── components/         # AudioPlayer
│       ├── services/           # 3 API services
│       └── app.json            # Expo config
│
├── docs/                       # Documentation
├── README.md                   # Project README
└── .env                        # Root DB URL
```
