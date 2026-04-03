# Workstream 3: Shop Owner Localization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship shop-owner localization support in the admin app so shop owners can view readonly translations, request missing translations, and see locally persisted pending state by `poiId + language`.

**Architecture:** Reuse the WS2 `LocalizationPanel` as the shared rendering surface, but add shop-owner capability rules on top: hide unsupported languages, show locked readonly entries for non-editable languages that already exist, and persist request state locally in a small store keyed by `poiId + language`. Keep the request flow UI-only for now, with analytics hooks and a clean abstraction so a future backend endpoint can replace the local-only request action without restructuring the panel.

**Tech Stack:** React 19, Vite 7, TypeScript, React Query v5, localStorage, lucide-react, existing admin app components and utilities.

---

## Chunk 1: Local Pending Request Store

### Task 1: Add persistent pending-request store

**Files:**
- Create: `apps/admin/src/services/localizationPendingRequests.ts`
- Test: `apps/admin/src/services/__tests__/localizationPendingRequests.test.ts`

- [ ] **Step 1: Write the failing store tests**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  isTranslationRequestPending,
  markTranslationRequestPending,
  clearTranslationRequestPending,
  listPendingTranslationRequests,
} from '../localizationPendingRequests';

describe('localization pending request store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists pending state by poiId and language', () => {
    markTranslationRequestPending('poi-1', 'EN');

    expect(isTranslationRequestPending('poi-1', 'EN')).toBe(true);
    expect(isTranslationRequestPending('poi-1', 'VI')).toBe(false);
  });

  it('survives reload via localStorage', () => {
    markTranslationRequestPending('poi-1', 'EN');

    vi.resetModules();
    expect(isTranslationRequestPending('poi-1', 'EN')).toBe(true);
  });

  it('can clear one pending entry without affecting others', () => {
    markTranslationRequestPending('poi-1', 'EN');
    markTranslationRequestPending('poi-1', 'VI');

    clearTranslationRequestPending('poi-1', 'EN');

    expect(isTranslationRequestPending('poi-1', 'EN')).toBe(false);
    expect(isTranslationRequestPending('poi-1', 'VI')).toBe(true);
  });

  it('lists all pending entries for a POI', () => {
    markTranslationRequestPending('poi-1', 'EN');
    markTranslationRequestPending('poi-1', 'VI');

    expect(listPendingTranslationRequests('poi-1')).toEqual(['EN', 'VI']);
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `cd apps/admin && pnpm exec vitest run src/services/__tests__/localizationPendingRequests.test.ts`
Expected: FAIL because the store module does not exist yet.

- [ ] **Step 3: Implement the minimal store**

Create a small localStorage-backed module with:
- a versioned storage key
- helpers to normalize `poiId + language`
- read/write/clear/list operations
- defensive handling for unavailable `localStorage`

- [ ] **Step 4: Re-run the store tests**

Run: `cd apps/admin && pnpm exec vitest run src/services/__tests__/localizationPendingRequests.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/services/localizationPendingRequests.ts apps/admin/src/services/__tests__/localizationPendingRequests.test.ts
git commit -m "feat: add persistent pending translation request store"
```

---

## Chunk 2: Shop Owner Localization Panel Behavior

### Task 2: Extend LocalizationPanel for shop-owner rules

**Files:**
- Modify: `apps/admin/src/components/localization/LocalizationPanel.types.ts`
- Modify: `apps/admin/src/components/localization/LocalizationPanel.tsx`
- Modify: `apps/admin/src/components/localization/LocalizationPanelAccordion.tsx`
- Create: `apps/admin/src/components/localization/LocalizationRequestDialog.tsx`

- [ ] **Step 1: Write the failing component tests**

Create `apps/admin/src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx` and cover:
- `enabled=false` languages are hidden for shop owners
- `shopOwnerEditable=false` languages render readonly when they exist
- missing `shopOwnerEditable=false` languages show `Request translation`
- pending entries disable the request button and show `Pending`
- shop owner never sees edit/delete controls

Use React Testing Library + Vitest with mocked `usePoiLocalizations`, `useSupportedLanguages`, and the pending store.

- [ ] **Step 2: Run the failing component test file**

Run: `cd apps/admin && pnpm exec vitest run src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx`
Expected: FAIL until the shop-owner capabilities are wired into the panel.

- [ ] **Step 3: Implement the minimal UI changes**

Update the panel contract so it can represent shop-owner capability state without branching the entire component tree:
- reuse `LocalizationPanel` for both admin and shop owner
- keep admin editing path intact
- add readonly rendering for existing non-editable translations
- add request CTA for missing non-editable translations
- hide delete and edit controls for shop owner
- render pending badge + note when the local store says the `poiId + language` request is pending

Add `LocalizationRequestDialog.tsx` only if the request flow needs a dedicated confirmation or note input; keep it small and scoped to the shop-owner path.

- [ ] **Step 4: Re-run the component test file**

Run: `cd apps/admin && pnpm exec vitest run src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add apps/admin/src/components/localization/LocalizationPanel.types.ts apps/admin/src/components/localization/LocalizationPanel.tsx apps/admin/src/components/localization/LocalizationPanelAccordion.tsx apps/admin/src/components/localization/LocalizationRequestDialog.tsx apps/admin/src/components/localization/__tests__/LocalizationPanel.shop-owner.test.tsx
git commit -m "feat: adapt localization panel for shop owner view and request flow"
```

---

## Chunk 3: Shop Owner Page Integration and Analytics

### Task 3: Wire the shop-owner form to the localization panel

**Files:**
- Modify: `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`
- Modify: `apps/admin/src/hooks/useSupportedLanguages.ts`
- Modify: `apps/admin/src/services/localization-analytics.ts`

- [ ] **Step 1: Add integration tests or page-focused assertions**

Add a focused test file if needed, or extend the component tests to verify the page passes the correct `role="shopOwner"` behavior into the localization panel and preserves the local pending badge state across navigation/reopen.

- [ ] **Step 2: Update role-based language filtering**

Change `useSupportedLanguages('shopOwner')` so it only hides `enabled=false` entries.
Keep the `shopOwnerEditable` flag available to the panel so the panel can decide between readonly vs request-only behavior.

- [ ] **Step 3: Add pending/request analytics hooks**

Extend `localizationAnalytics` with shop-owner-friendly events such as:
- request translation clicked
- pending state shown
- request re-click prevented because pending exists

Keep the payload minimal and aligned with the current analytics shape.

- [ ] **Step 4: Update `ShopOwnerPOIFormPage` integration**

Mount the localization panel in the shop-owner POI form, pass the shop-owner role, and ensure the surrounding form keeps working with the new readonly/request-only behavior.
Use the local pending store when rendering the panel so a reopened POI shows the saved `Pending` state immediately.

- [ ] **Step 5: Run typecheck and tests**

Run: `cd apps/admin && pnpm exec tsc --noEmit --skipLibCheck`
Expected: PASS.

Run: `cd apps/admin && pnpm exec vitest run`
Expected: PASS for the new WS3 tests and no regressions in the existing admin tests.

- [ ] **Step 6: Commit**

```bash
git add apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx apps/admin/src/hooks/useSupportedLanguages.ts apps/admin/src/services/localization-analytics.ts
git commit -m "feat: integrate shop owner localization request flow"
```

---

## Chunk 4: Verification and Handoff

### Task 4: Final validation

**Files:**
- Inspect: changed WS3 files above

- [ ] **Step 1: Review the final diff for scope control**

Confirm that the final diff only covers the shop-owner localization path, the local pending store, and analytics updates.

- [ ] **Step 2: Run a final admin build check**

Run: `cd apps/admin && pnpm exec tsc --noEmit --skipLibCheck`
Expected: PASS.

- [ ] **Step 3: Summarize behavior for handoff**

Document:
- what shop owners can view
- when `Request translation` appears or is disabled
- how `Pending` is persisted locally
- what remains for future backend sync

- [ ] **Step 4: Commit if any final doc/test cleanup is needed**

```bash
git add docs/superpowers/plans/2026-04-02-shop-owner-localization-implementation.md
git commit -m "docs: add ws3 shop owner localization implementation plan"
```
