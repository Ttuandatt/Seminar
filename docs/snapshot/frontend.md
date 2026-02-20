# Frontend Snapshot (apps/admin)

## Stack & Entry Points
- Vite + React 19 + TypeScript; state queries via TanStack React Query, routing with React Router v7, Tailwind utility classes for styling.
- Provider stack defined in [apps/admin/src/main.tsx](apps/admin/src/main.tsx): React Query client → `AuthProvider` → `ToastProvider` → `App`.
- Central routing table in [apps/admin/src/App.tsx](apps/admin/src/App.tsx) splits between `/admin` (guarded) and `/owner` (shop-owner experience), plus shared `/login` & `/register` flows.

## Authentication Context & Flow
- `AuthContext` ([apps/admin/src/contexts/AuthContext.tsx](apps/admin/src/contexts/AuthContext.tsx)) persists access/refresh tokens + user info in `localStorage`, exposes `login()`/`logout()` helpers used by auth screens and `ProtectedRoute` ([apps/admin/src/components/routing/ProtectedRoute.tsx](apps/admin/src/components/routing/ProtectedRoute.tsx)).
- `authService` ([apps/admin/src/services/auth.service.ts](apps/admin/src/services/auth.service.ts)) wraps `/auth/*` endpoints for login/register/forgot/reset/logout; register payload now supports role + optional shop metadata.
- Shop-owner layout ([apps/admin/src/components/layout/ShopOwnerLayout.tsx](apps/admin/src/components/layout/ShopOwnerLayout.tsx)) relies on a separate `ownerAccessToken` flag to gate `/owner/*` routes.

## Layout & Navigation Systems
- Admin shell: `DashboardLayout` ([apps/admin/src/components/layout/DashboardLayout.tsx](apps/admin/src/components/layout/DashboardLayout.tsx)) composes `Sidebar`, `Header`, and renders nested outlets; all admin pages live under `/admin/*`.
- Shop-owner shell provides lightweight header/nav with analytics/profile shortcuts.

## Shared UI/UX Infrastructure
- Toast notifications managed by `ToastProvider` ([apps/admin/src/components/ui/ToastProvider.tsx](apps/admin/src/components/ui/ToastProvider.tsx)); all success/error/info messaging routes through this provider.
- Destructive confirmations centralized via `ConfirmDialog` ([apps/admin/src/components/ui/ConfirmDialog.tsx](apps/admin/src/components/ui/ConfirmDialog.tsx)) and used across admin + owner delete flows.
- Map/location tooling handled by `MapPicker` ([apps/admin/src/components/forms/MapPicker.tsx](apps/admin/src/components/forms/MapPicker.tsx)) and `POIPreviewModal` ([apps/admin/src/components/preview/POIPreviewModal.tsx](apps/admin/src/components/preview/POIPreviewModal.tsx)).

## Admin Portal Modules
- **Dashboard** ([apps/admin/src/pages/admin/DashboardPage.tsx](apps/admin/src/pages/admin/DashboardPage.tsx)): snapshot of KPIs (implementation placeholder; relies on mock data today).
- **POI Management**
  - List ([apps/admin/src/pages/admin/POIListPage.tsx](apps/admin/src/pages/admin/POIListPage.tsx)): server-backed pagination/filtering, delete via confirm + toast, uses `poiService` for CRUD.
  - Form ([apps/admin/src/pages/admin/POIFormPage.tsx](apps/admin/src/pages/admin/POIFormPage.tsx)): bilingual copy, image/audio upload queues, map picker, preview modal, inline validation, toast-driven success/error states.
  - `poiService` ([apps/admin/src/services/poi.service.ts](apps/admin/src/services/poi.service.ts)) exposes CRUD + media upload/delete endpoints.
- **Tour Management**
  - List ([apps/admin/src/pages/admin/TourListPage.tsx](apps/admin/src/pages/admin/TourListPage.tsx)): simple client state + delete confirm.
  - Form ([apps/admin/src/pages/admin/TourFormPage.tsx](apps/admin/src/pages/admin/TourFormPage.tsx)): gather metadata, attach POIs (uses `tourService.setPois`).
  - Service wrapper: [apps/admin/src/services/tour.service.ts](apps/admin/src/services/tour.service.ts).
- **Merchants / Shop Owners**
  - List/Form in [apps/admin/src/pages/admin/MerchantListPage.tsx](apps/admin/src/pages/admin/MerchantListPage.tsx) + [MerchantFormPage.tsx](apps/admin/src/pages/admin/MerchantFormPage.tsx); integrate with [apps/admin/src/services/merchant.service.ts](apps/admin/src/services/merchant.service.ts) to create/update partner accounts.
- **Analytics** ([apps/admin/src/pages/admin/AnalyticsPage.tsx](apps/admin/src/pages/admin/AnalyticsPage.tsx)): placeholder cards for higher-level insights (future wiring to backend TBD).
- **Profile** ([apps/admin/src/pages/admin/ProfilePage.tsx](apps/admin/src/pages/admin/ProfilePage.tsx)): complex form covering personal + shop details, inline validation, toast for change-password placeholder, `profileService` for GET/PUT.
- **Misc**: `PlaceholderPage` for routes like `/admin/settings` until specs arrive.

## Shop-Owner Portal Modules
- **Authentication**: `/owner/login` ([apps/admin/src/pages/owner/ShopOwnerLoginPage.tsx](apps/admin/src/pages/owner/ShopOwnerLoginPage.tsx)) still mock-based (calls `shopOwnerPortalService.login`). `/owner/register` reuses universal `RegisterPage` with `initialRole="SHOP_OWNER"`.
- **Dashboard** ([apps/admin/src/pages/owner/ShopOwnerDashboardPage.tsx](apps/admin/src/pages/owner/ShopOwnerDashboardPage.tsx))
  - Fetches overview via `shopOwnerPortalService.getOverview()`; lists owned POIs with edit/preview placeholders, delete action hitting new `deletePoi` mock.
  - CTA `Tạo POI mới` navigates to `/owner/pois/new`.
- **POI Creation** ([apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx](apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx))
  - Mirrors admin form but scoped to owner: bilingual tabs, media queues, MapPicker integration, preview modal, and submission to `shopOwnerPortalService.createPoi()` which currently mocks persistence and returns status `IN_REVIEW`.
- **Analytics** ([apps/admin/src/pages/owner/ShopOwnerAnalyticsPage.tsx](apps/admin/src/pages/owner/ShopOwnerAnalyticsPage.tsx))
  - Range selector (7/30/90 days), summary cards, daily chart placeholders, CSV export button triggers info toast.
- **Profile** ([apps/admin/src/pages/owner/ShopOwnerProfilePage.tsx](apps/admin/src/pages/owner/ShopOwnerProfilePage.tsx))
  - Simple shop info form using mock service; toast for change-password placeholder; logout clears `ownerAccessToken`.

## Data/Service Layer Summary
- REST client is Axios instance from [apps/admin/src/lib/api.ts](apps/admin/src/lib/api.ts) (not shown above but configures base URL + interceptors).
- Services align to backend modules (auth, POI, tours, merchants, user profile) except `shopOwnerPortalService` which remains mock/in-memory until backend endpoints arrive.
- React Query used heavily for shop-owner reads (profile, overview, analytics) and some admin pages (POI list uses `useQuery`/`useMutation`).

## Current UX Patterns & Conventions
- All destructive flows require explicit `ConfirmDialog` with danger styling + spinner feedback.
- Toast messaging standardized for success/error/info; no `window.alert` usage remains in touched screens.
- Mapping & geolocation features centralize around `MapPicker` + `POIPreviewModal` to keep admin/owner parity.

## Known Gaps / Next Steps (Frontend)
1. Dev server currently failing (`npm run dev` last exit code 1); need to rerun and capture stack trace.
2. Shop-owner portal still uses mock service; needs real API wiring once backend endpoints exist.
3. Admin analytics/tour modules still mostly placeholders; awaiting backend contracts.
4. Ensure remaining legacy components (if any) stop using native alerts/confirms; quick repo-wide search recommended.
5. Validate responsive behavior and cross-browser compatibility for new owner POI form (heavy use of custom inputs).
