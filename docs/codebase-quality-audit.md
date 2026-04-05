# Codebase Quality Audit — GPS Tours

> **Ngay danh gia:** 2026-04-05
> **Pham vi:** API (NestJS) · Admin (React + Vite) · Mobile (Expo / React Native)
> **Nhanh:** `develop` @ commit `f467e2c`

---

## Muc luc

1. [Tinh mo rong (Scalability)](#1-tinh-mo-rong-scalability)
2. [Kha nang bao tri (Maintainability)](#2-kha-nang-bao-tri-maintainability)
3. [Kha nang kiem thu (Testability)](#3-kha-nang-kiem-thu-testability)
4. [Hieu nang (Performance)](#4-hieu-nang-performance)
5. [Tinh tich hop (Integration)](#5-tinh-tich-hop-integration)
6. [Tong ket & Uu tien trien khai](#6-tong-ket--uu-tien-trien-khai)

---

## 1. Tinh mo rong (Scalability)

### Da tot

- Kien truc module NestJS tach biet ro rang (15 modules).
- Prisma schema co index tren cac field hay query (`status`, `category`, `ownerId`).
- Pagination pattern nhat quan voi `PaginationDto`.
- File-based routing (Expo Router) giup them screen de dang.

### Chua dap ung

| Van de | Anh huong | De xuat |
|--------|-----------|---------|
| **Khong co caching layer** — moi request deu hit DB | Khi user tang, DB qua tai | Them Redis cache cho public endpoints (POI list, Tour list), hoac dung `@nestjs/cache-manager` |
| **File upload luu tren disk local** (`/uploads/`) | Khong scale horizontal, mat data khi deploy lai | Chuyen sang S3/Cloudinary voi CDN. Giu disk cho dev, them `StorageService` abstract |
| **Khong co rate limiting** | API de bi spam/abuse | Them `@nestjs/throttler` — config global + override per-endpoint |
| **API base URL hardcode** `localhost:3000` trong admin | Khong deploy duoc len staging/prod | Dung `VITE_API_BASE_URL` env variable |
| **Khong co queue system** cho TTS/email | Fire-and-forget mat job khi server restart | Dung BullMQ + Redis cho background jobs (TTS generation, email) |

---

## 2. Kha nang bao tri (Maintainability)

### Da tot

- TypeScript strict mode bat o ca 3 apps.
- DTO validation voi `class-validator` + global `ValidationPipe`.
- RBAC pattern ro rang voi `@Roles()` decorator + `RolesGuard`.
- Service layer tach biet khoi controller.
- Global exception filter chuan hoa error response.

### Chua dap ung

| Van de | Anh huong | De xuat |
|--------|-----------|---------|
| **Khong co shared types giua 3 apps** | Admin, mobile, API define cung interface 3 lan — de lech | Tao package `@seminar/shared-types` trong monorepo, export Prisma generated types + DTOs |
| **Business logic nam trong controller** o mot so cho (media upload) | Kho test, kho reuse | Tach het logic vao service, controller chi goi service |
| **Khong co logger thong nhat** — dung lan `console.error` va `Logger` | Kho trace loi o production | Dung `Logger` cua NestJS nhat quan, them request ID cho moi log |
| **Mobile thieu error boundary** | App crash khi component loi — white screen | Them React Error Boundary o root `_layout.tsx` |
| **Config hardcode** (API URL, map center coords, trigger radius defaults) | Kho thay doi khi deploy khac moi truong | Centralize vao env/config file |

---

## 3. Kha nang kiem thu (Testability)

### Da tot

- Jest (API) + Vitest (admin, mobile) da setup.
- Mot so unit test co san (localizationResolver, audioMedia, usePoiTts).

### Chua dap ung — **day la diem yeu lon nhat**

| Van de | Anh huong | De xuat |
|--------|-----------|---------|
| **API gan nhu khong co test** — chi co 1 sample test | Khong phat hien regression khi refactor | Viet unit test cho moi service (mock PrismaService). Uu tien: `AuthService`, `PoisService`, `ToursService` |
| **Khong co E2E test thuc te** | Deploy ma khong biet flow nao broken | Dung `@nestjs/testing` + test DB de test API flow end-to-end |
| **Admin chi co 3 test files** | UI regression khong phat hien duoc | Them test cho: auth flow, protected route redirect, form validation |
| **Khong co CI pipeline chay test** | Test co nhung khong ai chay | Them GitHub Actions: `npm test` on PR — block merge neu fail |
| **PrismaService inject truc tiep — kho mock** | Phai mock ca Prisma client | Tao repository pattern hoac dung `PrismaService` provider override trong test module |

**De xuat cau truc test toi thieu:**

```
apps/api/src/modules/auth/auth.service.spec.ts       <- unit test
apps/api/src/modules/pois/pois.service.spec.ts       <- unit test
apps/api/test/auth.e2e-spec.ts                       <- e2e test
apps/admin/src/pages/auth/__tests__/LoginPage.test.tsx
apps/admin/src/contexts/__tests__/AuthContext.test.tsx
```

---

## 4. Hieu nang (Performance)

### Da tot

- Debounced search (400ms) trong MapPicker.
- Fire-and-forget cho TTS/email (khong block response).
- Haversine distance tinh toan nhanh o client.
- Soft delete pattern (khong full scan khi query).

### Chua dap ung

| Van de | Anh huong | De xuat |
|--------|-----------|---------|
| **N+1 query** — nhieu cho query poi roi lai query media rieng | Cham khi co nhieu POI | Dung Prisma `include` nhat quan, review query patterns |
| **Khong co response compression** | Payload lon (dac biet POI list + media URLs) | Them `compression` middleware trong `main.ts` |
| **Mobile load tat ca POI cung luc** (`getAllPois`) | Cham khi co 100+ POI | Them viewport-based loading: chi fetch POI trong vung map dang hien thi |
| **Khong co image optimization** | Anh upload nguyen size, load cham tren mobile | Them thumbnail generation khi upload (sharp), serve nhieu size |
| **TTS generate dong bo trong request** (mot so endpoint) | User phai cho TTS xong moi nhan response | Can nhat quan — tat ca TTS qua queue |
| **SQLite sync mobile** xoa het roi insert lai | Cham, mat data neu sync fail giua chung | Dung delta sync (so sanh `updatedAt`) thay vi full replace |

---

## 5. Tinh tich hop (Integration)

### Da tot

- Brevo API cho email (HTTP, khong dependency ngoai).
- Google Translate API (free tier).
- msedge-tts cho text-to-speech.
- Leaflet / react-native-maps cho ban do.
- QR code generation + scanning.
- Swagger/OpenAPI docs tu sinh (`/api/docs`).

### Chua dap ung

| Van de | Anh huong | De xuat |
|--------|-----------|---------|
| **Khong co API versioning strategy** | Khi mobile can API moi nhung chua update — crash | Prefix `/api/v1` da co, nhung can plan cho v2 migration |
| **Mobile khong co token refresh interceptor** | Token het han — user bi kick ra login | Them 401 interceptor + refresh logic nhu admin da co |
| **Khong co health check endpoint** | Kho monitor, CI/CD khong biet app san sang chua | Them `GET /health` tra DB status + uptime |
| **Khong co webhook/event system** | Khi can notify real-time (POI moi, tour update) — phai polling | Can nhac WebSocket hoac SSE cho admin dashboard real-time |
| **Admin API URL hardcode** | Khong the point sang staging/prod API | Dung Vite env `import.meta.env.VITE_API_BASE_URL` |

---

## 6. Tong ket & Uu tien trien khai

| Uu tien | Viec can lam | Effort | Impact |
|---------|-------------|--------|--------|
| **P0** | Viet unit test cho AuthService + PoisService | 1-2 ngay | Cao |
| **P0** | Mobile token refresh interceptor | 0.5 ngay | Cao |
| **P0** | API URL dung env variable (admin + mobile) | 0.5 ngay | Cao |
| **P1** | Them `@nestjs/throttler` rate limiting | 0.5 ngay | Cao |
| **P1** | Shared types package trong monorepo | 1 ngay | Trung binh |
| **P1** | Health check endpoint + compression | 0.5 ngay | Trung binh |
| **P1** | GitHub Actions CI chay test | 0.5 ngay | Cao |
| **P2** | Redis cache cho public endpoints | 1 ngay | Trung binh |
| **P2** | Image thumbnail generation | 1 ngay | Trung binh |
| **P2** | BullMQ queue cho TTS + email | 2 ngay | Trung binh |
| **P3** | S3/Cloudinary file storage | 2 ngay | Thap (hien tai) |
| **P3** | Viewport-based POI loading | 1 ngay | Trung binh |
