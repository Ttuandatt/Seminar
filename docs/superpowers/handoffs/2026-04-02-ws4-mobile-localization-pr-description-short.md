# WS4 Draft PR Description (Short)

## Title
feat(ws4): mobile poi detail localization with selector and fallback

## Body
### Summary
- Implemented WS4 for mobile POI detail localization only.
- Added language selector bottom sheet, fallback resolution, and local pending-request state.
- Added AsyncStorage persistence for per-POI selected language and pending request by poiId + language.

### Verification
- npx tsc --noEmit passed.
- IDE diagnostics on WS4 touched files showed no errors.
- npm run android started Expo/Metro, but launch was blocked by missing Android runtime (no device/emulator).

### Blocker / Risk
- Manual UI walkthrough on simulator/device is not yet completed due to environment blocker.
- adb and emulator are not available on PATH in current machine.

### Scope Notes
- Included: POI detail screen only.
- Not included: POI list/favorites localization, backend translation-request expansion.

### Main Commits
- d1acbc3 feat(mobile): implement ws4 poi detail localization flow
- dcfe277 fix(mobile): map offline poi type to category for type safety
- 99e2308 docs(ws4): add mobile localization handoff
- e46f443 docs(ws4): record simulator verification blocker evidence
- 6c0c433 docs(ws4): add pull request summary draft
