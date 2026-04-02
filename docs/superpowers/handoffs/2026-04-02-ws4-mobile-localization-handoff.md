# WS4 Mobile Localization Handoff (POI Detail)

Date: 2026-04-02  
Branch: `feature/ws4-mobile-localization`

## Scope Delivered

Implemented WS4 for mobile POI detail only:
- Bottom-sheet language selector with status chips.
- Hook-driven localization state and content resolution.
- AsyncStorage persistence for per-POI selected language.
- AsyncStorage local pending-request queue per `poiId + language`.
- Deterministic fallback and stale/empty state rendering behavior.

Out of scope (unchanged):
- POI list/favorites card localization.
- Backend endpoint expansion.

## Commits

- `d1acbc3` feat(mobile): implement ws4 poi detail localization flow
- `dcfe277` fix(mobile): map offline poi type to category for type safety

## Changed Files

- `apps/mobile/app/poi/[id].tsx`
- `apps/mobile/app/components/PoiLanguageSelector.tsx`
- `apps/mobile/app/hooks/usePoiLocalization.ts`
- `apps/mobile/app/services/localizationAdapter.ts`
- `apps/mobile/app/services/localizationCopy.ts`
- `apps/mobile/app/services/localizationPendingRequests.ts`
- `apps/mobile/app/services/localizationResolver.ts`
- `apps/mobile/app/services/localizationSelectionStorage.ts`

## Behavior Summary

### Initial Selection Priority
Applied with enabled-language guard:
1. Last selected language for this POI (if still enabled)
2. App language (if enabled)
3. `EN` (if enabled)
4. `VI` (if enabled)

### Fallback Rules
When selected language has missing content:
- Keep selected language unchanged in selector.
- Resolve display content by fallback order: `VI` -> `EN`.
- Show fallback note indicating displayed fallback language.

### Missing/Pending/CTA Rules
- If selected translation exists: no request CTA.
- If missing and not pending: show request CTA.
- If missing and pending: show pending indicators and disable repeat request.
- Pending note text: `Yeu cau dang cho xu ly`.

### Stale and Empty States
- Stale notice appears only when rendering cached POI content during refresh.
- Empty state appears only when no displayable content is available after fallback resolution.

## Verification Evidence

Executed in `apps/mobile`:
- `npm install` (with temp/cache redirected to D drive due C drive ENOSPC)
- `npx tsc --noEmit`

Results:
- TypeScript error found and fixed (`category` missing in offline POI mapping).
- Final `npx tsc --noEmit` completed without reported errors.
- IDE diagnostics on touched WS4 files: no errors.

Android command-flow attempt:
- `npm run android` started Expo/Metro successfully.
- Launch step failed with `No Android connected device found, and no emulators could be started automatically`.
- `where.exe adb` and `where.exe emulator` both returned not found on PATH.

Not executed in this session:
- Automated unit tests for resolver/storage (test harness not added in this change set).

Manual checklist status:
- Blocked by environment (no Android device and no emulator binaries available on PATH).
- Ready to execute once emulator/device is available.

## Notes

Because system drive `C:` is full in this environment, npm commands require redirected `TEMP`, `TMP`, and `npm_config_cache` to a D-drive path for successful execution.
