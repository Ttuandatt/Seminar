# Dev Onboarding Guide

This note is aimed at new team members who need to run the project locally for the first time.

## 1. Prerequisites
- Node.js 20 LTS (npm 10+) installed globally.
- Git, VS Code (or another editor), and PowerShell (default on Windows).
- Docker Desktop for Postgres + Redis (strongly recommended for parity with other devs).
- Ports 3000 (API), 5173 (frontend), 5432 (Postgres), and 6379 (Redis) must be free.

> All commands below assume you run them from the repo root `d:\IT\Projects\Seminar` inside PowerShell.

## 2. Backend API (`apps/api`)

### First-time setup
```powershell
cd apps\api
npm install
Copy-Item .env.example .env
```
- Update `.env` with real secrets if needed. Default values work with the provided Docker services.
- Important keys: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `PORT`, `UPLOAD_DIR`.

### Start infrastructure (Postgres + Redis)
```powershell
cd apps\api
docker compose up -d
```
- Containers: `gpstours-db` on 5432 and `gpstours-cache` on 6379.
- Stop them anytime with `docker compose down`.

### Apply Prisma schema + seed
```powershell
cd apps\api
npx prisma migrate dev
npx prisma db seed
```
- `migrate dev` runs the SQL migrations in `prisma/migrations`.
- `db seed` executes `prisma/seed.ts` to insert baseline data.

### Run the API server
```powershell
cd apps\api
npm run start:dev
```
- Watches file changes and serves REST endpoints on `http://localhost:3000` (the frontend points to `http://localhost:3000/api/v1`).
- Other helpful scripts:
  - `npm run start` (no watch).
  - `npm run lint`, `npm run test`, `npm run test:e2e`.
  - `npm run build` + `npm run start:prod` for a production-like run.

## 3. Frontend Admin (`apps/admin`)

### First-time setup
```powershell
cd apps\admin
npm install
```

### Run the Vite dev server
```powershell
cd apps\admin
npm run dev
```
- Opens on `http://localhost:5173` (press `o` in the terminal to launch a browser).
- The API base URL is hard-coded in `src/lib/api.ts` (`http://localhost:3000/api/v1`). Update this file or introduce a `VITE_API_URL` helper if you need to target another backend instance.
- Useful scripts:
  - `npm run lint` (static checks).
  - `npm run build` followed by `npm run preview` to test the production bundle locally.

## 4. Typical daily workflow
1. `docker compose up -d` in `apps/api` to ensure Postgres/Redis are running.
2. `npm run start:dev` in `apps/api` to boot the NestJS server with hot reload.
3. `npm run dev` in `apps/admin` (new terminal) to boot the React app with HMR.
4. Code, refresh the browser, and watch both terminals for lint/runtime errors.
5. When done, stop services with `Ctrl+C` in each terminal and `docker compose down` if you do not need the databases.

## 5. Troubleshooting
- **Ports in use**: change `PORT` in `.env` and update `src/lib/api.ts`, or free the conflicting process.
- **Database schema drift**: rerun `npx prisma migrate dev` or `npx prisma db push` after editing `schema.prisma`.
- **Need a clean database**: `docker compose down -v` removes Postgres/Redis volumes (data loss!).
- **Uploads**: backend stores files under `apps/api/uploads`. Ensure the folder exists or adjust `UPLOAD_DIR`.
- **Node version mismatch**: use `nvm use 20` (or `nvs use 20`) to align with the team baseline.

Following these steps gets both the NestJS API and the Vite React admin running locally so you can continue feature development immediately.
