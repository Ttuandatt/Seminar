# Context Snapshot — 2026-02-20

## Project Overview
- Monorepo structure: `apps/admin` (React + Vite dashboard & shop-owner portal), `apps/api` (NestJS backend with Prisma), extensive requirements docs under `docs/`.
- Active sprint goals: unify toast/confirm UX, enable shop-owner self-service (registration + POI authoring), and keep spec/business-rule docs in sync.

## Recent Progress
1. **Global Notifications**
   - Added `ToastProvider` + `ConfirmDialog` components and wrapped the React tree so both admin and owner surfaces use consistent feedback.
   - Replaced native `alert/confirm` usage in POI/Tour lists, profile forms, analytics exports, etc.
2. **Shop-Owner Experience**
   - Consolidated register flow (`/register`, `/owner/register`) with role-specific UI and API payloads; removed the bespoke owner register page.
   - Hooked login to redirect per `UserRole`, storing `ownerAccessToken` for shop owners.
   - Implemented full `/owner/pois/new` form (bilingual copy, media queues, MapPicker, preview modal) and linked CTA from owner dashboard.
   - Extended mock `shopOwnerPortalService` with `createPoi` + `deletePoi`, updated dashboard + analytics to call it, and reflected new privileges in docs/business rules.
3. **Backend Alignment**
   - `apps/api` auth module now requires `shopName`+`phone` for shop-owner registration and returns the same token envelope as login.
   - `pois` controller/service allow owners to soft-delete their own POIs (guards + authorization checks updated).

## Documentation Sync
- `docs/step3_prd/10_ui_ux_specifications.*` updated with toast/dialog patterns, owner delete messaging, and new POI form/dash behavior.
- `docs/step3_prd/11_business_rules.*` reflects owner delete permission (BR-1004) and self-registration constraints.

## Outstanding / Next Steps
- Run `npm run dev` (was failing previously) or equivalent lint/test suites for both admin and api apps to ensure new flows compile.
- Smoke test critical routes: `/admin/pois`, `/admin/tours`, `/admin/profile`, `/owner/dashboard`, `/owner/pois/new`, `/owner/profile`.
- Search for any remaining `alert(` / `confirm(` usage outside already touched files.
- Plan backend persistence for shop-owner POI creation (current owner form still relies on mock service).

## Operational Notes
- Current git status: multiple staged/unstaged changes across admin frontend, api backend, and docs (see last `git diff` snapshot if needed).
- Context window nearing limit (~65.8k/128k tokens); use this snapshot to resume work in a new session without losing track.
