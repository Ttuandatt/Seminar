# Plan – Post UAT Fixes (2026-04-01)

## Problem & Approach
Execution focus: close eight issues raised after the latest pilot run across admin dashboard, backend API, and mobile app. For each item we will (1) analyze current implementation, (2) design/implement the fix following repo conventions, (3) validate with targeted tests/manual verification, and (4) document any behavior changes. Parallelize frontend/backend/mobile streams where possible but keep shared contracts coordinated.

## Workplan
- [ ] Audio playback surface on Admin/Shop Owner POI detail
- [ ] Synchronize POI multilingual fields (name/description) across API + admin/mobile
- [ ] Redesign/customize tour creation feedback panel (replace Windows log style)
- [ ] Improve Map tab search UX (input feedback + address-based lookup)
- [ ] Make QR-based mobile onboarding network-agnostic (universal access)
- [ ] Add password visibility toggles to auth forms (login/register)
- [ ] Resolve Shop Owner registration 409 conflict error
- [ ] Derive & implement unit tests based on PRDs (backend + frontend as applicable)

## Notes & Considerations
- Confirm audio assets availability/format per POI; may need backend media endpoint tweaks.
- Multilingual fix likely requires both data model support (per-language fields) and UI state sync; watch for caching.
- Tour creation panel should align with design system (Tailwind tokens, semantic colors).
- Map search may reuse geocoding service—evaluate existing utilities before adding new deps.
- QR issue might stem from Expo LAN mode; consider switching to Tunnel/Custom QR instructions plus API URL auto-detect fallback.
- Password toggle must meet accessibility (keyboard focus, ARIA).
- Registration 409: inspect server logs for duplicate email/slug; handle gracefully in UI.
- Unit tests should trace PRD acceptance criteria; prioritize regression-prone flows (auth, POI CRUD, tour creation).
