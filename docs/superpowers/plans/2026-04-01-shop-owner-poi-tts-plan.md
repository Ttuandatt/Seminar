# Shop Owner POI TTS Parity Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Provide the shop-owner POI form with the same two-language Text-to-Speech controls and behavior as the admin form by extracting shared logic into a reusable hook.

**Architecture:** Introduce a `usePoiTts` hook under `apps/admin/src/hooks` that encapsulates validation, API calls, media refresh, and toast plumbing. Both admin and shop-owner forms consume the hook, wiring in their own description getters and media refreshers while reusing the same UI block from the admin panel for parity.

**Tech Stack:** React 18 + TypeScript, Vite (admin SPA), Tailwind CSS, pnpm workspaces.

---

## File Structure Overview

| File | Action | Responsibility |
| --- | --- | --- |
| `apps/admin/src/hooks/usePoiTts.ts` | **Create** | Export reusable hook that drives TTS generation state and API calls. |
| `apps/admin/src/pages/admin/POIFormPage.tsx` | Modify | Replace inline TTS logic with hook usage; ensure state + callbacks align. |
| `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx` | Modify | Add TTS panel markup (mirroring admin) and hook integration; refresh media after generation. |

---

## Chunk 1: Shared TTS Hook Foundation

### Task 1: Scaffold `usePoiTts` hook

**Files:**
- Create: `apps/admin/src/hooks/usePoiTts.ts`

- [ ] **Step 1:** Create file with imports (`useCallback`, `useState`) and the `poiService` dependency.
- [ ] **Step 2:** Define the `UsePoiTtsParams` interface (getters, optional refresh, toast callbacks) plus hook return type `{ generating, generateTts }`.
- [ ] **Step 3:** Implement hook state via `useState<{ VI?: boolean; EN?: boolean }>(() => ({}))` and memoized `setGenerating` helper for per-language toggling.
- [ ] **Step 4:** Add guards inside `generateTts(language)` to validate POI ID existence and description length ≥10, invoking `onErrorToast` with specific reasons before returning early.
- [ ] **Step 5:** Call `poiService.generateTts(id, text, language)` inside try/catch, await optional `refreshMedia?.()`, fire `onSuccessToast(language)` on success, and ensure `finally` resets the `generating` flag even when errors occur. Export hook as default.
- [ ] **Step 6:** Run `pnpm --filter admin lint` to ensure the new hook passes lint/type checks (expect PASS).

### Task 2: Unit smoke (optional, if infra exists)

**Files:**
- (Optional) `apps/admin/src/hooks/__tests__/usePoiTts.test.ts`

- [ ] **Step 1:** If hook test harness exists, add a placeholder test asserting validation guard behavior by mocking `poiService.generateTts`. Otherwise skip with TODO comment noting missing infra.

---

## Chunk 2: Integrate Hook into Admin Form

### Task 3: Replace inline TTS logic in `POIFormPage`

**Files:**
- Modify: `apps/admin/src/pages/admin/POIFormPage.tsx`

- [ ] **Step 1:** Remove `ttsGenerating` state and `handleGenerateTts` function definitions.
- [ ] **Step 2:** Import `usePoiTts` from the new hook file.
- [ ] **Step 3:** Instantiate the hook with:
  - `getPoiId: () => id`
  - `getDescriptionFor: lang => (lang === 'VI' ? formData.description : formData.descriptionEn)`
  - `refreshMedia: async () => { const poi = await poiService.getOne(id!); setExistingMedia(poi.media || []); }`
  - Toast callbacks using existing `showToast` copy.
- [ ] **Step 4:** Update the TTS button panel JSX to read loading/disabled flags from `generating` and trigger `generateTts('VI')` / `generateTts('EN')`.
- [ ] **Step 5:** Verify no regressions in TypeScript types (watch for `id` possibly undefined while editing new POI).
- [ ] **Step 6:** Run `pnpm --filter admin lint` and `pnpm --filter admin test` (if tests exist) to confirm clean state (Expect PASS, or document existing failures).

- [ ] **Step 7:** Commit checkpoint (e.g., `feat: add shared POI TTS hook`).

---

## Chunk 3: Add TTS controls to Shop Owner POI Form

### Task 4: Wire hook + UI in `ShopOwnerPOIFormPage`

**Files:**
- Modify: `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`

- [ ] **Step 1:** Import `usePoiTts` near other hooks.
- [ ] **Step 2:** Create a `refreshMedia` helper that re-fetches the POI via `shopOwnerPortalService.getOnePoi(id!)` and updates `existingMedia` state (reuse logic from initial fetch effect).
- [ ] **Step 3:** Instantiate the hook with shop-owner-specific getters and toast strings sourced from `POI_FORM_LABELS` (VI/EN copy already localized).
- [ ] **Step 4:** Insert the admin-style TTS card inside the audio section:
  - Heading, helper text, two buttons referencing `generating` and `generateTts`.
  - Disable EN button unless `formData.descriptionEn` has >=10 chars; VI button tied to Vietnamese description.
- [ ] **Step 5:** Ensure the buttons only render when `isEditMode && !readOnly`, matching admin behavior.
- [ ] **Step 6:** Double-check existing audio list refresh logic so new media from TTS appears without reload.
- [ ] **Step 7:** Run `pnpm --filter admin lint` focusing on owner pages (Expect PASS).

### Task 5: End-to-end manual verification

**Environment:** `apps/admin`

- [ ] **Step 1:** Start dev server: `pnpm --filter admin dev`.
- [ ] **Step 2:** As admin, open an existing POI, trigger both VI/EN TTS buttons, ensure spinners and toasts behave, and audio preview updates.
- [ ] **Step 3:** Login as shop owner, open an existing POI, confirm identical UX and API success; validate guard when POI unsaved or descriptions too short.
- [ ] **Step 4:** Capture screenshots or notes for QA if required.
- [ ] **Step 5:** Stop dev server.

- [ ] **Step 6:** Commit final changes `feat: add TTS controls to shop owner POI form`.

---

## Chunk 4: Documentation & Handoff

### Task 6: Update docs & finalize

**Files:**
- Modify (if needed): `docs/superpowers/specs/2026-04-01-shop-owner-poi-tts-design.md`

- [ ] **Step 1:** If implementation deviates from spec, append notes to the design doc; otherwise skip.
- [ ] **Step 2:** Update any internal changelog if required by repo conventions.
- [ ] **Step 3:** Ensure plan + spec paths are referenced in PR description.
- [ ] **Step 4:** Commit doc adjustments if made.

---

## Expected Verification Commands Summary

| Command | Purpose |
| --- | --- |
| `pnpm --filter admin lint` | Type/lint check after each major change. |
| `pnpm --filter admin test` | Run unit tests if available. |
| `pnpm --filter admin dev` | Manual UX verification in browser. |

---

## Notes
- Prefer minimal duplication when copying TTS UI into owner form; if extraction into a shared component becomes trivial, note it for future refactor but do not expand scope now.
- Guard all asynchronous calls to avoid state updates on unmounted components when navigating away mid-generation.
- If `poiService.generateTts` needs auth differences for shop owners, confirm headers via existing service layer before deploying.
