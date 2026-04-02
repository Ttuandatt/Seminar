# PR Summary - WS4 Mobile Localization (POI Detail)

## Title
feat(ws4): mobile POI detail localization with selector, fallback, and local pending state

## Context
This PR delivers WS4 for mobile POI detail localization only. It adds a bottom-sheet language selector, deterministic fallback behavior, and AsyncStorage-backed local state for selected language and translation pending requests.

## Scope Included
- POI detail language selector UI with status chips.
- Localization hook and resolver flow for active language and fallback.
- AsyncStorage persistence for per-POI language preference.
- AsyncStorage local pending-request tracking by poiId + language.
- Stale notice and empty-state behavior in POI detail.
- WS4 implementation handoff and verification notes.

## Out of Scope
- POI list/favorites card localization.
- Backend API expansion for translation requests.
- Automated test harness addition for mobile WS4 services in this PR.

## Main Commits
- d1acbc3 feat(mobile): implement ws4 poi detail localization flow
- dcfe277 fix(mobile): map offline poi type to category for type safety
- 99e2308 docs(ws4): add mobile localization handoff
- e46f443 docs(ws4): record simulator verification blocker evidence

## Changed Files (Implementation)
- apps/mobile/app/poi/[id].tsx
- apps/mobile/app/components/PoiLanguageSelector.tsx
- apps/mobile/app/hooks/usePoiLocalization.ts
- apps/mobile/app/services/localizationAdapter.ts
- apps/mobile/app/services/localizationCopy.ts
- apps/mobile/app/services/localizationPendingRequests.ts
- apps/mobile/app/services/localizationResolver.ts
- apps/mobile/app/services/localizationSelectionStorage.ts

## Verification Evidence
Completed:
- npm install completed successfully after redirecting TEMP/TMP/npm cache to D drive.
- npx tsc --noEmit completed with no reported TypeScript errors.
- IDE diagnostics on touched WS4 files: no errors.

Command-level manual attempt:
- npm run android started Expo/Metro successfully.
- Android launch failed because no device/emulator runtime was available.
- where.exe adb and where.exe emulator both returned not found on PATH.

## Manual Verification Blocker
Manual simulator walkthrough is currently blocked by environment setup, not by WS4 code behavior:
- Missing Android runtime tools (adb/emulator) on PATH.
- No connected Android device.

## Risk Note
Remaining risk is UI behavior not yet validated on a live simulator/device in this environment. The implementation is type-safe and command-verified, but runtime interaction proof is pending Android environment availability.

## Reviewer Checklist
- Validate POI detail selector UX and status chips on device/emulator.
- Validate fallback note and fallback language rendering path.
- Validate pending state persistence after app reload for same poiId + language.
- Validate selected language restore priority on revisit.
- Validate stale notice behavior during cached-content refresh path.
