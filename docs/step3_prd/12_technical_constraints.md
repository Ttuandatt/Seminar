# ⚙️ Technical Constraints
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 3.1  
> **Ngày tạo:** 2026-02-08  
> **Cập nhật:** 2026-04-04

---

## 1. Technology Stack

### 1.1 Admin + Shop Owner Dashboard (Web)

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | React | 19.2.0 | Hooks-based |
| Language | TypeScript | 5.x | Strict mode |
| Build Tool | Vite | 7.3.x | Fast dev server |
| Styling | Tailwind CSS | 4.1.x | Utility-first |
| State | TanStack Query + React Context | 5.90.x | Server state + lightweight client state |
| Forms | React Hook Form + Zod | Latest | Validation |
| Maps | Leaflet + React Leaflet | 1.9 / 5.0 | OpenStreetMap tiles |
| UI Components | Custom (Tailwind-based) | - | Không dùng UI library đóng gói |
| HTTP Client | Axios | 1.13.x | API communication |
| Auth | JWT (Admin) / JWT (Shop Owner) | - | Role-based routing |

> **Note:** Admin và Shop Owner dùng chung cùng 1 web app với role-based routing. Shop Owner chỉ thấy dashboard và POI management của mình.

### 1.2 Tourist App (Mobile)

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | React Native (Expo) | SDK 54 | Cross-platform iOS/Android |
| Navigation | expo-router | 6.x | File-based routing |
| Maps | react-native-maps | 1.20+ | GPS integration (default provider) |
| Audio | expo-audio | 1.x | Global Singleton Context |
| Offline DB | expo-sqlite | 16.x | QR Offline Fallback (TH1/TH2) |
| i18n | i18next + react-i18next | 25.x / 16.x | UI localization |
| Camera | expo-camera | 17.x | QR scanner |
| Icons | lucide-react-native | Latest | SVG icons |
| Storage | AsyncStorage | Latest | JWT token storage |
| Auth | JWT (Optional) | - | Login/Register for Tourist |
| Distribution | EAS Build | Latest | Standalone APK/AAB |

> **Quyết định:** Chọn React Native (Expo) thay vì PWA vì cần background GPS tracking, offline audio, và native UX. Dùng expo-router (file-based) thay vì React Navigation để đồng bộ với cấu trúc Expo hiện đại.

### 1.3 Backend

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Runtime | Node.js | 24 LTS | TypeScript only |
| Framework | NestJS | 11.x | Modular architecture |
| Language | TypeScript | 5.x | Strict mode, shared types |
| Database | PostgreSQL | 15+ | Float latitude/longitude (không PostGIS) |
| ORM | Prisma | 5.x | Type-safe queries |
| Cache | Redis | - | Chưa implement trong MVP (planned Phase 2) |
| Auth | Passport.js + JWT | Latest | Role-based (Admin, Shop Owner, Tourist) |
| TTS Engine | msedge-tts | 2.x | Microsoft Edge Text-to-Speech |
| Translation | google-translate-api-x | 10.x | Multi-language translation |
| QR Library | qrcode | 1.5.x | QR generation |
| Password Hashing | bcrypt | 6.x | cost factor 12 |
| Storage | Cloud Storage / Local | - | Media files (UPLOAD_DIR or cloud) |
| API Docs | Swagger (OpenAPI) | 3.0 | Auto-generated from decorators |

> **Quyết định:** Chọn NestJS + Prisma thay vì FastAPI/SQLAlchemy để giữ thống nhất TypeScript stack và type safety từ DB đến frontend.

### 1.4 DevOps

| Tool | Purpose | Notes |
|------|---------|-------|
| Git | Version control | GitHub |
| CI/CD | Automation | GitHub Actions |
| Containers | Docker | Docker Compose for local |
| **Cloud Hosting** | **Render.com** | **API + PostgreSQL + Static** |
| Mobile Build | EAS Build (Expo) | APK/AAB cloud build |
| Monitoring | Sentry | Planned (chưa tích hợp trong codebase hiện tại) |
| APM | New Relic / Datadog | Performance (P2) |

---

## 2. Infrastructure Constraints

### 2.1 Hosting Requirements

| Constraint | Requirement | Notes |
|------------|-------------|-------|
| Region | Southeast Asia | Latency requirements |
| Compute | 2 vCPU, 4GB RAM minimum | API servers |
| Database | Managed PostgreSQL | Auto-backup |
| Storage | Object storage | Unlimited scale |
| CDN | Global edge | Media delivery |
| SSL | Required | All traffic |

### 2.2 Network Requirements

| Constraint | Requirement |
|------------|-------------|
| Bandwidth | 100 Mbps minimum |
| Latency (regional) | < 50ms |
| Latency (global) | < 200ms |
| HTTPS | TLS 1.3 preferred |
| HTTP/2 | Supported |

---

## 3. Development Constraints

### 3.1 Code Standards

| Constraint | Standard |
|------------|----------|
| TypeScript | Strict mode enabled |
| Linting | ESLint + Prettier |
| Commits | Conventional commits |
| Branches | GitFlow (main, develop, feature/*) |
| PR Reviews | Required before merge |
| Tests | Required for core logic |

### 3.2 API Standards

| Constraint | Standard |
|------------|----------|
| Style | RESTful |
| Format | JSON |
| Versioning | URL path (/v1/) |
| Auth | JWT Bearer token |
| Errors | Consistent error format |
| Documentation | OpenAPI 3.0 |

### 3.3 Security Standards

| Constraint | Standard |
|------------|----------|
| Passwords | bcrypt, cost 12+ |
| Tokens | JWT, short expiry |
| Input | Server-side validation required |
| Output | Sanitized, XSS-safe |
| Dependencies | Weekly vulnerability scan |
| Secrets | Environment variables only |

---

## 4. Third-Party Dependencies

### 4.1 Required APIs

| Service | Purpose | Fallback |
|---------|---------|----------|
| OpenStreetMap + Nominatim | Maps, geocoding | Primary (web dashboard) |
| Local Disk Storage | Media storage | Current MVP implementation |
| CDN | Content delivery | Bundled with storage |

### 4.2 Optional Services

| Service | Purpose | Phase |
|---------|---------|-------|
| Firebase | Push notifications | P3 |
| SendGrid | Email notifications | P2 |
| Google Analytics | Usage tracking | P2 |
| Sentry | Error tracking | P1 |

### 4.3 Shared Monorepo Package

| Package | Purpose | Dependencies |
|---------|---------|--------------|
| packages/localization-shared | Reusable localization client/types/hooks | axios, @tanstack/react-query |

---

## 5. Performance Constraints

### 5.1 API

| Metric | Target |
|--------|--------|
| Response time (p95) | < 500ms |
| Response time (p99) | < 1s |
| Throughput | 100 req/s per instance |
| Concurrent connections | 1000 |

### 5.2 Frontend

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 2s |
| Time to Interactive | < 3s |
| Bundle size (gzipped) | < 500KB |
| Lighthouse score | > 80 |

### 5.3 Mobile

| Metric | Target |
|--------|--------|
| App size | < 50MB |
| Memory usage | < 200MB |
| Battery drain | < 10%/hour |
| Cold start | < 3s |

---

## 6. Compatibility Matrix

### 6.1 Browsers (Admin)

| Browser | Minimum Version |
|---------|-----------------|
| Chrome | 90+ |
| Firefox | 90+ |
| Safari | 14+ |
| Edge | 90+ |

### 6.2 Mobile OS (Tourist)

| OS | Minimum Version |
|----|-----------------|
| iOS | 14+ |
| Android | 10+ (API 29) |

### 6.3 Screen Sizes

| Breakpoint | Width |
|------------|-------|
| Mobile | 320px - 640px |
| Tablet | 640px - 1024px |
| Desktop | 1024px+ |

---

## 7. Data Constraints

### 7.1 Storage Limits

| Data Type | Limit |
|-----------|-------|
| POIs | 10,000 |
| Tours | 1,000 |
| Images per POI | 10 |
| Image size | 5MB |
| Audio size | 50MB |
| Total storage | 100GB initial |

### 7.2 Rate Limits

| Endpoint | Limit |
|----------|-------|
| Public API | 100 req/min/IP |
| Admin API | 300 req/min/user |
| **Shop Owner API** | **200 req/min/user** |
| Upload | 10 req/min/user |

---

## 8. Localization Constraints

| Constraint | Value |
|------------|-------|
| Default language | Vietnamese |
| MVP languages | 11 languages via Translation API (VI, EN, JA, KO, ZH-CN, ZH-TW, FR, DE, ES, TH, RU) |
| Timezone | Asia/Ho_Chi_Minh (UTC+7) |
| Date format | DD/MM/YYYY |
| Number format | 1.234,56 (locale) |
| Currency | VND (future) |

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 7.7, 7.8
