# Inline POI TTS Audio Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface per-language TTS audio directly beneath the POI description fields, automatically replacing outdated audio whenever the description changes, in both admin and shop-owner forms.

**Architecture:** Leverage existing `usePoiTts` workflow; extend the hook with lifecycle callbacks so forms can delete old audio before generating new clips. Inline audio players live in the content section, backed by helpers that track per-language media and purge stale clips when descriptions change.

**Tech Stack:** React (Vite), TypeScript, `lucide-react` icons, existing `poiService` / `shopOwnerPortalService`, Tailwind utility classes.

---

## File Overview

- Modify: `apps/admin/src/hooks/usePoiTts.ts` (add lifecycle callbacks)
- Modify: `apps/admin/src/pages/admin/POIFormPage.tsx` (description change handling, inline audio UI, delete helpers)
- Modify: `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx` (same parity as admin form)

---

## Chunk 1: Extend usePoiTts hook

**Files:**
- Modify: `apps/admin/src/hooks/usePoiTts.ts`

- [ ] **Step 1:** Update `UsePoiTtsParams` to accept optional `beforeGenerate` and `afterGenerate` callbacks (typed with the language + poiId where relevant).
- [ ] **Step 2:** Inside `generateTts`, after ensure/save completes and before checking description length, call `beforeGenerate?.(language, poiId)` inside try/catch; ensure it doesn’t break flow if rejected.
- [ ] **Step 3:** After successful `poiService.generateTts` and `refreshMedia`, invoke `afterGenerate?.(language, poiId)`.
- [ ] **Step 4:** Export updated types, ensure default export usage elsewhere remains valid.

## Chunk 2: Admin POI form inline audio flow

**Files:**
- Modify: `apps/admin/src/pages/admin/POIFormPage.tsx`

- [ ] **Step 1:** Introduce `lastSavedDescriptions` state (`{ VI: string; EN: string }`) initialized from form data; add `useEffect` syncing snapshots whenever `existingMedia` changes.
- [ ] **Step 2:** Create memoized helpers: `getAudioByLanguage` (reduce `existingMedia`), `deleteAudioForLanguage`, and `handleDescriptionChange(language, value)` that wraps `setFormData` update and triggers delete when value differs from snapshot.
- [ ] **Step 3:** Wire textarea `onChange` to the new handler, ensuring other fields still use generic `handleChange`.
- [ ] **Step 4:** Hook `deleteAudioForLanguage` into the media delete dialog (reuse existing logic) and into a new inline delete button.
- [ ] **Step 5:** Pass `beforeGenerate` to `usePoiTts` instance so it awaits `deleteAudioForLanguage(language)` before generating.
- [ ] **Step 6:** Render inline audio capsule below the helper + TTS button row: language badge, `<audio controls src={getImageUrl(audio.url)}>` and delete icon, hidden when `readOnly`.
- [ ] **Step 7:** Remove redundant TTS section in the media card now that controls live inline; keep manual upload UI untouched.

## Chunk 3: Shop-owner form parity

**Files:**
- Modify: `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`

- [ ] **Step 1:** Mirror `lastSavedDescriptions` state, helper hooks, and memoized `audioByLanguage` map using the owner services/types.
- [ ] **Step 2:** Implement `deleteAudioForLanguage` via `shopOwnerPortalService.deleteMedia` with optimistic UI update + toast error handling.
- [ ] **Step 3:** Wrap description change handler to delete stale clips; update textarea `onChange` and snapshots accordingly.
- [ ] **Step 4:** Inject `beforeGenerate` callback when invoking `usePoiTts`.
- [ ] **Step 5:** Add the same inline audio capsule under the description helper with localized strings; include delete action when not `readOnly`.
- [ ] **Step 6:** Remove the old TTS card in the media section to prevent duplicated buttons.

## Chunk 4: Verification + polish

**Files/Commands:**
- `apps/admin/src/pages/admin/POIFormPage.tsx`, `apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`
- Commands: `cd apps/admin && pnpm lint`, optional local manual test instructions.

- [ ] **Step 1:** Run `pnpm lint` inside `apps/admin`; record/fix any issues introduced by the changes.
- [ ] **Step 2:** Manual smoke test in dev server (admin + shop-owner flow): verify inline audio appears/disappears per description edits, generation auto-saves draft, delete button works.
- [ ] **Step 3:** Prepare commit summary once verification passes (not committing automatically per instructions).
