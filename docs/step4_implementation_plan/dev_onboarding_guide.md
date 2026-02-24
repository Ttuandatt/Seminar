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

## 3.5 Tourist Mobile App (`apps/mobile`)

### First-time setup
```powershell
cd apps\mobile
npm install --legacy-peer-deps
```
- `--legacy-peer-deps` is required due to peer dependency conflicts between `react-native-maps` and Expo SDK 54.

### Run the Expo dev server
```powershell
cd apps\mobile
npx expo start
```
- A QR code will appear in the terminal.
- Install **Expo Go** on your phone (Play Store / App Store).
- Scan the QR code with Expo Go (Android) or Camera app (iOS). **Phone and laptop must be on the same Wi-Fi network.**
- The app auto-detects the laptop's LAN IP for API calls (no manual config needed).
- Useful commands:
  - `npx expo start -c` — clear bundler cache and restart.
  - Press `r` in the terminal to reload the app on the phone.
  - Shake the phone to open the Expo developer menu.

### Key config files
- `app.json` — Expo config (scheme `gpstours`, plugins, icons).
- `babel.config.js` — Uses `babel-preset-expo`.
- `metro.config.js` — Configured for monorepo module resolution.
- `services/api.ts` — Auto-detect LAN IP via `expo-constants`.

## 4. Typical daily workflow
1. `docker compose up -d` in `apps/api` to ensure Postgres/Redis are running.
2. `npm run start:dev` in `apps/api` to boot the NestJS server with hot reload.
3. `npm run dev` in `apps/admin` (new terminal) to boot the React app with HMR.
4. `npx expo start` in `apps/mobile` (new terminal) to boot the Expo dev server.
5. Code, refresh the browser, and watch all terminals for lint/runtime errors.
6. Mobile changes auto-refresh on the phone (Hot Reload / Fast Refresh).
7. When done, stop services with `Ctrl+C` in each terminal and `docker compose down` if you do not need the databases.

## 5. Troubleshooting
- **Ports in use**: change `PORT` in `.env` and update `src/lib/api.ts`, or free the conflicting process.
- **Database schema drift**: rerun `npx prisma migrate dev` or `npx prisma db push` after editing `schema.prisma`.
- **Need a clean database**: `docker compose down -v` removes Postgres/Redis volumes (data loss!).
- **Uploads**: backend stores files under `apps/api/uploads`. Ensure the folder exists or adjust `UPLOAD_DIR`.
- **Node version mismatch**: use `nvm use 20` (or `nvs use 20`) to align with the team baseline.
- **Mobile: Network Error**: Ensure phone and laptop are on the same Wi-Fi. The API URL is auto-detected from Expo.
- **Mobile: Cannot find module**: Run `npm install --legacy-peer-deps` then `npx expo start -c`.
- **Mobile: Bundler error**: Try `npx expo start -c` to clear the Metro bundler cache.

Following these steps gets the NestJS API, Vite React admin, and Expo mobile app running locally so you can continue feature development immediately.
