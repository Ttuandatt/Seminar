# ⚙️ Technical Constraints
## Dự án GPS Tours & Phố Ẩm thực Vĩnh Khánh

> **Phiên bản:** 1.0  
> **Ngày tạo:** 2026-02-08

---

## 1. Technology Stack

### 1.1 Frontend (Admin Dashboard)

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | React | 18.x | Hooks-based |
| Language | TypeScript | 5.x | Strict mode |
| Build Tool | Vite | 5.x | Fast dev server |
| Styling | Tailwind CSS | 3.x | Utility-first |
| State | Zustand / TanStack Query | Latest | Server state + client state |
| Forms | React Hook Form + Zod | Latest | Validation |
| Maps | Mapbox GL JS / Google Maps | Latest | Interactive maps |
| UI Components | shadcn/ui | Latest | Radix-based |

### 1.2 Frontend (Tourist App)

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | React Native | 0.73+ | OR PWA |
| Alternative | PWA (Vite + React) | - | For wider reach |
| Maps | react-native-maps / Mapbox | Latest | GPS integration |
| Audio | react-native-track-player | Latest | Background playback |
| Storage | AsyncStorage / IndexedDB | Latest | Offline cache |
| Push | Firebase Cloud Messaging | Latest | Future (P3) |

### 1.3 Backend

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Runtime | Node.js | 20 LTS | OR Python 3.11+ |
| Framework | FastAPI (Python) | 0.100+ | OR NestJS |
| Language | Python/TypeScript | Latest | Type hints required |
| Database | PostgreSQL | 15+ | With PostGIS extension |
| ORM | Prisma / SQLAlchemy | Latest | Type-safe queries |
| Cache | Redis | 7.x | Session, rate limiting |
| Storage | AWS S3 / Azure Blob | Latest | Media files |
| CDN | CloudFront / Azure CDN | Latest | Media delivery |

### 1.4 DevOps

| Tool | Purpose | Notes |
|------|---------|-------|
| Git | Version control | GitHub |
| CI/CD | Automation | GitHub Actions |
| Containers | Docker | Docker Compose for local |
| Hosting | Azure / AWS / GCP | TBD |
| Monitoring | Sentry | Error tracking |
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
| Google Maps / Mapbox | Maps, geocoding | One or the other |
| Cloud Storage (S3/Azure) | Media storage | Required |
| CDN | Content delivery | Bundled with storage |

### 4.2 Optional Services

| Service | Purpose | Phase |
|---------|---------|-------|
| Firebase | Push notifications | P3 |
| SendGrid | Email notifications | P2 |
| Google Analytics | Usage tracking | P2 |
| Sentry | Error tracking | P1 |

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
| Upload | 10 req/min/user |

---

## 8. Localization Constraints

| Constraint | Value |
|------------|-------|
| Default language | Vietnamese |
| MVP languages | Vietnamese, English |
| Timezone | Asia/Ho_Chi_Minh (UTC+7) |
| Date format | DD/MM/YYYY |
| Number format | 1.234,56 (locale) |
| Currency | VND (future) |

---

> **Reference:** `PRDs/00_requirements_intake.md` Section 7.7, 7.8
