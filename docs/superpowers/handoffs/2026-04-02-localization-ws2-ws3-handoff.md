# Localization WS2 + WS3 Handoff

## Scope Delivered

This branch completes:

### WS2 - Admin Localization Management
- Full LocalizationPanel implementation
- Multi-language editing in accordion UI
- Conflict detection and resolution modal
- Role-aware behavior and analytics events
- Integration with admin POI form flow

### WS3 - Shop Owner View + Request
- Shop owner is view + request only
- Reused LocalizationPanel architecture without duplication
- Language rules:
  - enabled=false: hidden
  - shopOwnerEditable=false + translation exists: readonly
  - missing translation: Request translation action
- No edit/delete actions for shop owner
- Pending request persisted locally by poiId + language
- Pending state disables request button and shows Pending badge + waiting note
- Backend request endpoint intentionally out of scope in this phase

## Verification
- Typecheck passed: pnpm exec tsc --noEmit --skipLibCheck
- Localization-focused suite passed
- Shop-owner panel tests passed
- Full admin Vitest suite passed: 3 files, 11 tests
- Unrelated Vitest hoisting issue in usePoiTts test fixed via vi.hoisted(...) with minimal test-only change

## Key Files Changed
- apps/admin/src/components/localization/LocalizationPanel.tsx
- apps/admin/src/components/localization/LocalizationPanelAccordion.tsx
- apps/admin/src/components/localization/LocalizationPanel.module.css
- apps/admin/src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx
- apps/admin/src/services/localizationPendingRequests.ts
- apps/admin/src/services/__tests__/localizationPendingRequests.test.ts
- apps/admin/src/services/localization-analytics.ts
- apps/admin/src/hooks/useSupportedLanguages.ts
- apps/admin/src/hooks/usePoiTts.test.ts
- apps/admin/src/setupTests.ts
- apps/admin/vite.config.ts
- apps/admin/tsconfig.app.json

## Out of Scope / Next
- Backend request endpoint and server-side pending sync
- WS4 mobile localization integration

## Status
- WS2 complete
- WS3 complete
- Verification fully green
- Ready for review/merge discussion
