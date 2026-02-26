# Context Snapshot — 2026-02-25

## Project Overview
- Monorepo structure: `apps/api` (NestJS backend with Prisma), `apps/admin` (React + Vite dashboard & shop-owner portal), `apps/mobile` (Expo/React Native tourist app), extensive requirements docs under `docs/`.
- Active sprint: Phase 3 (Tourist Mobile App) completed. All 3 apps operational.

## Current Status

### Phase 1: Backend API — ✅ COMPLETE & RUNNING
- 10 modules: Auth, POIs, Tours, Media, Public, Tourist, Merchants, ShopOwner, Profile, Analytics
- ~50 endpoints fully implemented
- Running at `http://localhost:3000/api/v1`
- Docker: PostgreSQL 15 + Redis 7

### Phase 2: Admin Dashboard — ✅ COMPLETE & RUNNING
- 10 pages: Login, Dashboard, POI CRUD, Tour CRUD, Merchant CRUD, Analytics, Profile
- 6 API services with JWT interceptors
- Running at `http://localhost:5173`

### Phase 3: Tourist Mobile App — ✅ COMPLETE & RUNNING
- Framework: Expo SDK 54 + React Native 0.81
- Navigation: expo-router (file-based) with tab layout (Map, Tours, More)
- Components: AudioPlayer (expo-av), CameraView (expo-camera)
- API: Axios with auto-detect LAN IP via expo-constants

### Phase 4: Missing MVP Items — ✅ COMPLETE & RUNNING
- Auto-trigger POI (S22) using `Location.watchPositionAsync` + `getDistance` + `AudioPlayer`
- Tour Following Mode (S21) with Polyline live tracking
- QR Code Scanner (S23) validation through backend `/qr/validate`
- Favorites & History UI (S24, S25) linked to Tourist Profile

## Recent Progress (2026-02-25)
1. **Mobile App Init** — Expo project created at `apps/mobile` with blank-typescript template
2. **Dependencies resolved** — Fixed babel-preset-expo, react-native-svg, react-native-reanimated, expo-splash-screen, metro.config.js for monorepo module resolution
3. **Map Screen** — GPS location, POI markers (red/gold by type), bottom sheet preview, navigation to POI detail
4. **POI Detail** — Image carousel, AudioPlayer component, Vietnamese/English language toggle, favorite button
5. **Tour Flow** — Tour list with badges, Tour detail with route map (Polyline) and numbered POI timeline
6. **More tab** — Login/logout, auto-play audio toggle, language setting
7. **Phase 4 Features** — Implemented Auto-trigger (`getDistance`), Tour Tracking (`follow/[id]`), QR Scanner (`/scanner`), Favorites and History screens.
8. **Media URL Fix** — Added `getMediaUrl` helper to resolve relative `/uploads/` paths with backend LAN IP. Fixed audio `FileNotFoundException` and broken image rendering.
9. **Language Sync** — Audio player now handles `MediaLanguage.ALL` fallback and reads user language preference from `AsyncStorage` across all screens.
10. **API Integration** — Auto-detect LAN IP from Expo Constants for real device testing (no more localhost/10.0.2.2 issues)
11. **Documentation** — Updated README.md with Mobile App section, project snapshot at docs/snapshot/

## Documentation Sync
- `README.md` updated with Mobile App setup (Bước 7), architecture, screens, troubleshooting
- `docs/snapshot/project_snapshot.md` created with full system overview
- `docs/step2_lowcode/screens.md` annotated with implementation status

## Outstanding / Next Steps (Post-MVP / Optimization)
- `expo-av` migration to `expo-audio` (deprecated warning in SDK 54)
- Unit and E2E Tests for Backend API (>70% coverage requirement)
- Cloud deployment (Backend API + PostgreSQL + Redis)
- Build production `.apk` / `.ipa` for UAT testing
- PRD-to-Code documentation sync (in progress)

## Operational Notes
- Mobile app runs on real device via Expo Go (same Wi-Fi as dev machine)
- Hot Reload active — code changes reflect instantly on phone
- API auto-detects LAN IP from Expo Constants (no hardcoded URLs)
