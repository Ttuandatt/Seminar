# 🛠️ CLI Commands Log
## Step 4: POC Implementation

> Ghi lại tất cả lệnh CLI đã chạy trong quá trình phát triển, cùng giải thích tác dụng.

---

## Phase 1A: Project Setup

### 1. Khởi tạo NestJS project
```bash
npx -y @nestjs/cli@latest new api --directory apps/api --package-manager npm --language ts --skip-git --strict
```
**Tác dụng:** Tạo project NestJS mới trong `apps/api/` với TypeScript strict mode. `--skip-git` vì đã có git ở root. `--package-manager npm` chọn npm thay vì yarn/pnpm.

### 2. Cài đặt dependencies cho Backend
```bash
cd apps/api

# Prisma ORM — type-safe database client
npm install prisma @prisma/client

# Authentication — Passport + JWT
npm install @nestjs/passport passport passport-local passport-jwt @nestjs/jwt
npm install -D @types/passport-local @types/passport-jwt

# Validation — class-validator cho DTO validation
npm install class-validator class-transformer

# Security — bcrypt để hash password
npm install bcrypt
npm install -D @types/bcrypt

# File upload — Multer middleware
npm install @nestjs/platform-express
npm install -D @types/multer

# Config — đọc .env files
npm install @nestjs/config

# Swagger — API documentation
npm install @nestjs/swagger
```
**Tác dụng:** Cài tất cả packages cần thiết cho backend. Chia thành nhóm: ORM, Auth, Validation, Security, Upload, Config, Docs.

### 3. Khởi tạo Prisma
```bash
npx prisma init
```
**Tác dụng:** Tạo folder `prisma/` với file `schema.prisma` và `.env` chứa `DATABASE_URL`.

### 4. Docker Compose — PostgreSQL + Redis
```bash
docker compose up -d
```
**Tác dụng:** Khởi chạy PostgreSQL 15 (port 5432) và Redis 7 (port 6379) trong Docker containers.

---

## Phase 1B: Prisma Schema & Migration

### 5. Tạo Migration từ Schema
```bash
cd apps/api
npx prisma migrate dev --name init
```
**Tác dụng:** Đọc `prisma/schema.prisma`, tạo migration SQL, áp dụng lên PostgreSQL. Tạo các bảng: User, POI, Tour, TourStop, Media, Review, Visit.

### 6. Generate Prisma Client
```bash
npx prisma generate
```
**Tác dụng:** Sinh ra Prisma Client TypeScript types từ schema. Phải chạy lại mỗi khi thay đổi schema.

---

## Phase 1C–1H: Build & Run Backend

### 7. Build Production
```bash
cd apps/api
npm run build
```
**Tác dụng:** Compile TypeScript sang JavaScript trong folder `dist/`. Cần thiết trước khi chạy production mode.

### 8. Chạy Backend (Production Mode)
```bash
npm run start:prod
```
**Tác dụng:** Khởi chạy NestJS server tại `http://localhost:3000` từ compiled code. API sẵn sàng nhận request.

### 9. Chạy Prisma Studio (Database Viewer)
```bash
npx prisma studio
```
**Tác dụng:** Mở Prisma Studio tại `http://localhost:5555` — giao diện GUI để xem/sửa dữ liệu trong database trực tiếp.

---

## Phase 2A: Admin Dashboard Setup

### 10. Khởi tạo Vite + React + TypeScript
```bash
npx -y create-vite@latest apps/admin --template react-swc-ts
```
**Tác dụng:** Tạo project React mới với Vite bundler, SWC compiler (nhanh hơn Babel), và TypeScript.

### 11. Cài đặt dependencies cho Admin Dashboard
```bash
cd apps/admin

# UI Dependencies
npm install react-router-dom axios lucide-react clsx tailwind-merge

# Form & Validation
npm install react-hook-form @hookform/resolvers zod

# Data Fetching
npm install @tanstack/react-query

# Tailwind CSS v4 (PostCSS)
npm install -D tailwindcss @tailwindcss/postcss autoprefixer postcss
```
**Tác dụng:** Cài đặt các packages cho Admin Dashboard:
- `react-router-dom` — Client-side routing
- `axios` — HTTP client kết nối Backend API
- `lucide-react` — Icon library (nhẹ, tree-shakable)
- `clsx` + `tailwind-merge` — Utility để merge className
- `react-hook-form` + `zod` — Form management + validation
- `@tanstack/react-query` — Server state management, caching
- `tailwindcss` v4 + `@tailwindcss/postcss` — CSS framework (v4 cần plugin riêng cho PostCSS)

### 12. Chạy Admin Dashboard (Dev Server)
```bash
cd apps/admin
npm run dev
```
**Tác dụng:** Khởi chạy Vite dev server tại `http://localhost:5173` với Hot Module Replacement (HMR).

---

## Tóm tắt các service đang chạy

| Service | URL | Lệnh |
|---------|-----|-------|
| Backend API | `http://localhost:3000` | `npm run start:prod` (trong `apps/api`) |
| Prisma Studio | `http://localhost:5555` | `npx prisma studio` (trong `apps/api`) |
| Admin Dashboard | `http://localhost:5173` | `npm run dev` (trong `apps/admin`) |
| PostgreSQL | `localhost:5432` | `docker compose up -d` |
| Redis | `localhost:6379` | `docker compose up -d` |

---

## 🚀 Hướng dẫn chạy nhanh (Quick Start)

### Bước 1: Khởi động Database (PostgreSQL + Redis)
```bash
# Tại thư mục root của project
docker compose up -d
```
> Kiểm tra: `docker ps` — phải thấy 2 container `gpstours-db` và `gpstours-cache` đang chạy.

### Bước 2: Chạy Backend API
```bash
cd apps/api

# Lần đầu tiên hoặc sau khi đổi schema:
npx prisma migrate dev --name init
npx prisma generate

# Build và chạy:
npm run build
npm run start:prod
```
> Backend sẽ chạy tại: **http://localhost:3000**
> Swagger API docs tại: **http://localhost:3000/api**

### Bước 3: Chạy Admin Dashboard (Frontend)
```bash
cd apps/admin

# Lần đầu tiên:
npm install

# Chạy dev server:
npm run dev
```
> Frontend sẽ chạy tại: **http://localhost:5173**

### Bước 4 (Tùy chọn): Mở Prisma Studio để xem Database
```bash
cd apps/api
npx prisma studio
```
> Prisma Studio tại: **http://localhost:5555**

