# WS4 Mobile Localization Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship POI-detail-only mobile localization with bottom-sheet language selector, deterministic fallback behavior, and AsyncStorage-backed pending/request and selected-language persistence.

**Architecture:** Implement in three layers but execute UI-first: first lock POI detail interaction and states, then attach a hook-driven data adapter, then add isolated storage services. Keep scope constrained to `apps/mobile/app/poi/[id].tsx` and avoid list/card surfaces.

**Tech Stack:** Expo Router, React Native, TypeScript, AsyncStorage, existing `publicService`, optional Vitest for pure logic unit tests.

---

## Scope and Constraints (Execution Guards)

- POI detail only: no POI list/favorites card localization changes.
- No backend expansion in WS4.
- Do not assume localization endpoints exist.
- Fallback behavior must be exactly: selected missing -> `VI`, then `EN`.
- Initial selection priority must be exactly: last selected (enabled) -> app language (enabled) -> EN (enabled) -> VI (enabled).
- Pending state is local only (`poiId + language`), no cancel action.
- Strings in UI should come from key-based copy mapping (not hardcoded literals in screen component).

---

## File Structure and Responsibilities

### New files
- Create: `apps/mobile/app/components/PoiLanguageSelector.tsx`
- Create: `apps/mobile/app/hooks/usePoiLocalization.ts`
- Create: `apps/mobile/app/services/localizationAdapter.ts`
- Create: `apps/mobile/app/services/localizationPendingRequests.ts`
- Create: `apps/mobile/app/services/localizationSelectionStorage.ts`
- Create: `apps/mobile/app/services/localizationResolver.ts`
- Create: `apps/mobile/app/services/localizationCopy.ts`
- Create: `apps/mobile/app/services/__tests__/localizationResolver.test.ts` (if test harness available)
- Create: `apps/mobile/app/services/__tests__/localizationPendingRequests.test.ts` (if test harness available)
- Create: `apps/mobile/app/services/__tests__/localizationSelectionStorage.test.ts` (if test harness available)

### Files to modify
- Modify: `apps/mobile/app/poi/[id].tsx`
- Modify: `apps/mobile/services/publicService.ts` (only if lightweight helper extraction is needed)

### Optional test harness files (only if missing)
- Create: `apps/mobile/vitest.config.ts`
- Create: `apps/mobile/vitest.setup.ts`
- Modify: `apps/mobile/package.json`

---

## Chunk 1: UI-First POI Detail Interaction

### Task 1: Build Selector UI Shell (No Backend Dependency)

**Files:**
- Create: `apps/mobile/app/components/PoiLanguageSelector.tsx`
- Modify: `apps/mobile/app/poi/[id].tsx`

- [ ] **Step 1: Define selector props contract**

Props:
- `activeLanguage`
- `languages` (enabled list)
- `statusByLanguage`
- `onSelectLanguage`

- [ ] **Step 2: Render pill trigger above POI content card**

Expected behavior:
- closed state shows language code + label
- tap opens bottom sheet

- [ ] **Step 3: Render all enabled languages in sheet**

Expected behavior:
- include `Missing` entries (do not hide them)
- highlight active selection
- show status chips per item

- [ ] **Step 4: Integrate selector into `poi/[id].tsx` with temporary local state**

Use existing POI data (`nameVi`, `nameEn`, `descriptionVi`, `descriptionEn`) to drive a temporary two-language UI (`VI`, `EN`) while hook is not wired yet.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/components/PoiLanguageSelector.tsx apps/mobile/app/poi/[id].tsx
git commit -m "feat(ws4): add poi language selector ui shell"
```

### Task 2: Lock UI Rules for Missing/CTA/Pending/Empty State

**Files:**
- Modify: `apps/mobile/app/poi/[id].tsx`

- [ ] **Step 1: Implement status chip semantics in screen state**

- `App default` (rename from ambiguous `Default`)
- `Translated`
- `Missing`
- `Pending`

- [ ] **Step 2: Implement normative CTA rule**

- translation exists -> no CTA
- missing + not pending -> show CTA
- missing + pending -> disable CTA + show pending badge/note

- [ ] **Step 3: Implement dedicated empty-state branch**

When no displayable content exists after fallback resolution:
- show empty state
- keep request CTA visible unless already pending

- [ ] **Step 4: Keep selected missing language stable**

Do not auto-switch selection to fallback language when user chooses a missing language.

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/poi/[id].tsx
git commit -m "feat(ws4): enforce missing pending and empty-state ui rules"
```

---

## Chunk 2: Hook and Data Adapter (Repo-Feasible)

### Task 3: Add Resolver Utilities (Pure Logic)

**Files:**
- Create: `apps/mobile/app/services/localizationResolver.ts`
- Optional Test: `apps/mobile/app/services/__tests__/localizationResolver.test.ts`

- [ ] **Step 1: Implement `resolveInitialLanguage` with enabled-language guard**
- [ ] **Step 2: Implement `resolveContentLanguage` with `VI -> EN` fallback**
- [ ] **Step 3: Implement language-status derivation helpers**

- [ ] **Step 4: (Optional) Add/Run unit tests if harness is available**

Run (optional): `cd apps/mobile && npm run test -- localizationResolver.test.ts`

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/services/localizationResolver.ts apps/mobile/app/services/__tests__/localizationResolver.test.ts
git commit -m "feat(ws4): add localization resolver utilities"
```

### Task 4: Add AsyncStorage Services for Selection and Pending

**Files:**
- Create: `apps/mobile/app/services/localizationSelectionStorage.ts`
- Create: `apps/mobile/app/services/localizationPendingRequests.ts`
- Optional Tests:
  - `apps/mobile/app/services/__tests__/localizationSelectionStorage.test.ts`
  - `apps/mobile/app/services/__tests__/localizationPendingRequests.test.ts`

- [ ] **Step 1: Implement selected-language storage**

Key format:
- `poiLanguagePreference:${poiId}`

- [ ] **Step 2: Implement pending-request storage**

Key space:
- `localizationPendingRequests:v1`

Minimum payload fields:
- `poiId`
- `language`
- `requestedAt`

- [ ] **Step 3: (Optional) Add/Run unit tests if harness is available**

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/services/localizationSelectionStorage.ts apps/mobile/app/services/localizationPendingRequests.ts apps/mobile/app/services/__tests__/localizationSelectionStorage.test.ts apps/mobile/app/services/__tests__/localizationPendingRequests.test.ts
git commit -m "feat(ws4): add localization asyncstorage services"
```

### Task 5: Add Localization Data Adapter (No New Backend)

**Files:**
- Create: `apps/mobile/app/services/localizationAdapter.ts`
- Modify: `apps/mobile/services/publicService.ts` (only if helper extraction is needed)

- [ ] **Step 1: Implement adapter over existing POI detail shape**

Convert current POI detail fields into normalized localization entries.

Current feasible source in repo:
- `nameVi`, `descriptionVi`
- `nameEn`, `descriptionEn`

- [ ] **Step 2: Provide enabled-language list for current phase**

For current repo baseline, include enabled set from available app languages (`VI`, `EN`) and mark extension point for additional languages when endpoint becomes available.

- [ ] **Step 3: Implement stale-flag input contract**

Expose a simple cached-vs-refreshing signal to drive stale banner in UI.

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/services/localizationAdapter.ts apps/mobile/services/publicService.ts
git commit -m "feat(ws4): add mobile localization adapter on existing poi data"
```

### Task 6: Implement `usePoiLocalization` and Wire into POI Detail

**Files:**
- Create: `apps/mobile/app/hooks/usePoiLocalization.ts`
- Modify: `apps/mobile/app/poi/[id].tsx`

- [ ] **Step 1: Implement hook API**

Required return:
- `availableLanguages`
- `activeLanguage`
- `setLanguage`
- `getContent`
- `isStale`
- `isPending(language)`

- [ ] **Step 2: Add app-language key reconciliation in hook**

Read app language using compatibility order:
- `app_language` first
- fallback `appLanguage`

Use this resolved app language in initial-selection priority.

- [ ] **Step 3: Connect hook to screen and remove temporary UI state glue**

- [ ] **Step 4: Ensure dynamic fallback note uses fallback language label**

Pattern:
- `Showing {fallbackLanguageLabel} - translation not available yet`

- [ ] **Step 5: Commit**

```bash
git add apps/mobile/app/hooks/usePoiLocalization.ts apps/mobile/app/poi/[id].tsx
git commit -m "feat(ws4): integrate poi detail with usePoiLocalization hook"
```

---

## Chunk 3: Copy Keys and Verification

### Task 7: Add Key-Based Copy Mapping for WS4 Strings

**Files:**
- Create: `apps/mobile/app/services/localizationCopy.ts`
- Modify: `apps/mobile/app/poi/[id].tsx`

- [ ] **Step 1: Define key-based copy map for WS4-specific strings**

Keys to include:
- `ws4.fallback.showing`
- `ws4.pending.note`
- `ws4.stale.notice`
- `ws4.request.cta`
- `ws4.empty.title`
- `ws4.empty.body`

- [ ] **Step 2: Replace inline literals in POI detail with copy keys helper**

- [ ] **Step 3: Keep pending note text aligned with approved behavior**

Approved text:
- `Yêu cầu đang chờ xử lý`

- [ ] **Step 4: Commit**

```bash
git add apps/mobile/app/services/localizationCopy.ts apps/mobile/app/poi/[id].tsx
git commit -m "feat(ws4): move poi localization copy to key-based mapping"
```

### Task 8: Verification Pass

**Files:**
- Verify all WS4 files in this plan
+
+- [ ] **Step 1: Run TypeScript check**
+
+Run: `cd apps/mobile && npx tsc --noEmit`
+Expected: no type errors in modified files
+
+- [ ] **Step 2: Run tests (if harness installed)**
+
+Run: `cd apps/mobile && npm run test`
+Expected: all WS4-added tests pass
+
+- [ ] **Step 3: Manual POI detail behavior checklist**
+
+Verify on device/simulator:
+- selector appears above content card
+- bottom sheet shows all enabled languages (including missing)
+- selecting missing language does not auto-switch selection
+- fallback note is dynamic
+- pending badge appears in selector + content area
+- empty state appears only when no displayable content exists
+- stale notice appears only when cached content is shown during refresh
+
+- [ ] **Step 4: Commit verification fixups (if any)**
+
+```bash
git add apps/mobile
git commit -m "chore(ws4): finalize mobile localization verification"
+```
+
+### Task 9: Handoff Summary
+
+**Files:**
+- Create: `docs/superpowers/handoffs/2026-04-02-ws4-mobile-localization-handoff.md`
+
+- [ ] **Step 1: Write changed-files and behavior summary**
+
+Include:
+- scope delivered
+- initial language and fallback behavior
+- pending/CTA behavior
+- verification commands and outcome
+- out-of-scope notes
+
+- [ ] **Step 2: Commit handoff document**
+
+```bash
git add docs/superpowers/handoffs/2026-04-02-ws4-mobile-localization-handoff.md
git commit -m "docs(ws4): add mobile localization handoff"
+```
+
+---
+
+## Definition of Done
+
+- POI detail has bottom-sheet language selector with status chips.
+- Initial language selection and fallback behavior match spec exactly.
+- Missing/pending/CTA behavior matches normative rules.
+- Selected language and pending request state persist in AsyncStorage.
+- Stale banner and dedicated empty state are implemented.
+- Scope remains POI-detail only.
+- Verification evidence is recorded in handoff.
