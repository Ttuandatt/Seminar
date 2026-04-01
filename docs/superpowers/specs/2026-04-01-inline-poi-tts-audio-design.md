# Inline POI TTS Audio Preview Design (2026-04-01)

## Overview
Admin and shop-owner POI forms already support generating text-to-speech audio clips via `usePoiTts`, but the audio list lives in the media gallery, so users cannot immediately preview or replace audio alongside the description they just edited. We also need to guarantee that each language keeps only one "draft" TTS clip that always mirrors the current description text.

This design ensures that:
- Generating TTS automatically exposes the resulting audio player directly beneath the relevant description field.
- Editing the description removes the outdated TTS clip both UI-side and via existing delete APIs.
- The flow remains in parity between the admin portal and the shop-owner form, sharing the same UX expectations.
- `usePoiTts` grows safe extension points so forms can run cleanup logic before/after the generation call without duplicating code.

## Goals & Non-Goals
- **Goals**
  - One audio clip per language that always reflects the latest saved or auto-saved description text.
  - Inline playback (audio controls + delete button) immediately below the textarea.
  - Draft auto-save path stays unchanged; we only hook into the ensure logic to delete stale clips.
  - Admin + shop-owner forms keep identical UX patterns.
- **Non-Goals**
  - Backend API changes (reuse current `poiService` / `shopOwnerPortalService`).
  - New media types or bulk upload flows.
  - Persisting additional metadata beyond existing `POIMedia` fields.

## Detailed Design
### 1. Media Tracking & Derived State
- Add a memoized helper inside each form that maps `existingMedia` into `{ VI?: MediaResource; EN?: MediaResource }` by checking `language`/`lang` fields and `type === 'AUDIO'`.
- Introduce `lastSavedDescription` state per language (two strings). Whenever `existingMedia` updates (fetch, refresh, delete, or TTS success), sync the snapshot to the current textarea value so the "does description differ from audio" checks stay accurate.

### 2. Description Change Handling
- Wrap `handleChange` for description fields to call `handleDescriptionChange(language, value)`.
- If the new value differs from the stored `lastSavedDescription[language]` **and** we have an audio clip for that language, immediately call `deleteAudioForLanguage(language)`.
  - Optimistically remove the media entry from `existingMedia` so the inline player disappears.
  - If the delete API fails, push a toast error and restore the entry.
- Update `lastSavedDescription[language] = value` after the delete request resolves (success or failure) to avoid repeat deletions while the user is still typing.

### 3. TTS Generation Flow
- Extend `usePoiTts` to accept optional hooks: `beforeGenerate(language)` and `afterGenerate(language, poiId)`.
  - `beforeGenerate` runs after ensure/save logic but before calling `poiService.generateTts`. The forms will use it to delete any lingering clip for that language (defensive cleanup if description change missed a case).
  - `afterGenerate` allows logging or side-effects; for now forms can no-op, but the hook keeps the API symmetric.
- Both forms pass `beforeGenerate` that awaits `deleteAudioForLanguage(language)`; errors are swallowed so TTS still proceeds.
- Existing `refreshMedia` already re-fetches the POI after successful TTS, ensuring the inline player has the latest URL.

### 4. Inline Audio UI
- In the description block:
  - Keep the helper text + TTS button row.
  - Directly underneath, render a capsule when `audioByLanguage[activeLang]` exists.
    - Contents: language badge (`VI`/`EN`), `<audio controls>` sourced from `getImageUrl(media.url)`, duration info if available, and a trash icon button (hidden in read-only mode) that calls `deleteAudioForLanguage(activeLang)`.
    - Style: rounded border, subtle background, matches existing Indigo accent colors.
- Remove the duplicate "Generate TTS" card in the media section since controls now live inline; keep existing upload slots for manual audio files.

### 5. Shop-Owner Parity
- Mirror all admin changes in [apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx](apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx): description watcher, inline player, delete calls via `shopOwnerPortalService.deleteMedia`.
- Ensure translation strings reused (L.*). Where admin hardcodes Vietnamese copy, owner form already uses localized text.

## Error & Edge Cases
- **Draft creation fails**: handled by existing `ensurePoiExists`; no change.
- **Delete fails**: optimistic removal reversed + toast.
- **User switches languages quickly**: inline capsule only renders when media exists; state per language keeps them independent.
- **External media uploads**: manual audio uploads (drag/drop) still appear in the media gallery; inline capsule only shows the latest auto-generated clip per language.

## Testing Strategy
- Manual: 
  - Create new POI, type description VI, click generate → ensure draft auto-saves, audio appears under textarea, and gallery still lists it under Audio Guide.
  - Edit description text → audio capsule disappears instantly; refresh page to confirm backend deletion.
  - Generate EN audio separately; verify toggling tabs swaps the inline player.
  - Owner form: repeat the same flow via shop owner dashboard.
- Automated: none (forms lack existing tests). Future enhancement could add integration tests around `usePoiTts` hooks.
