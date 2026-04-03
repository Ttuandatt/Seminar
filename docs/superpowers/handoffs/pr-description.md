> Reviewer tip: You can review WS2 (admin) and WS3 (shop owner) independently.

## Overview

This PR delivers Workstream 2 (Admin Portal) and Workstream 3 (Shop Owner Portal) for the localization feature.

- WS2 introduces full localization management for admin users.
- WS3 adds a restricted shop-owner experience (view + request only).
- Includes test coverage, analytics wiring, and a fix for an unrelated Vitest issue.

---

## Scope

### Workstream 2 - Admin Localization
- Full CRUD for POI localizations
- Multi-language accordion UI
- Conflict detection with resolution modal (reload vs overwrite)
- Integration with POI form lifecycle (prevent data loss)
- Analytics tracking for:
  - save / delete / discard
  - language selection
  - conflict resolution
  - panel view

---

### Workstream 3 - Shop Owner Localization
- Reuses LocalizationPanel with capability-based restrictions
- Shop owner permissions:
  - View only
  - Request translation
  - Cannot edit or delete

Behavior rules:
- enabled=false -> hidden completely
- shopOwnerEditable=false:
  - show readonly if translation exists
  - show Request translation if missing
- Pending request:
  - disable request button
  - show Pending badge
  - show note: Yeu cau dang cho admin xu ly

Persistence:
- Pending requests stored locally by poiId + language
- Survives navigation and reload
- No backend integration yet (UI + state + analytics only)

---

## Testing And Verification

### Localization scope
- Component tests for shop-owner flow
- Pending-request persistence tests
- All localization-related tests passing

### Full admin verification
- pnpm exec tsc --noEmit -> no errors
- pnpm exec vitest run -> all tests passing

### Fix included
- Fixed Vitest hoisting issue in:
  - apps/admin/src/hooks/usePoiTts.test.ts using vi.hoisted

---

## Key Files

Admin (WS2):
- apps/admin/src/components/localization/LocalizationPanel.tsx
- apps/admin/src/components/localization/LocalizationPanelAccordion.tsx
- apps/admin/src/components/localization/ConflictModal.tsx
- apps/admin/src/hooks/useSupportedLanguages.ts
- apps/admin/src/services/localization-analytics.ts

Shop Owner (WS3):
- apps/admin/src/services/localizationPendingRequests.ts
- apps/admin/src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx

Docs:
- docs/superpowers/handoffs/2026-04-02-localization-ws2-ws3-handoff.md
- docs/superpowers/checklists/2026-04-02-localization-pr-review-checklist.md
- docs/superpowers/prompts/2026-04-02-ws4-mobile-localization-prompt.md

---

## Notes And Limitations

- Translation request API is not implemented yet
  - Current flow is UI + local state only
  - Designed for easy backend integration later

---

## Next Steps

- Workstream 4 (Mobile localization flow)
- Backend endpoint for translation requests
- Sync pending requests with server state

---

## Review Focus

- Permission boundaries (admin vs shop owner)
- Pending state persistence logic
- Reuse of LocalizationPanel without duplication
- Analytics event coverage