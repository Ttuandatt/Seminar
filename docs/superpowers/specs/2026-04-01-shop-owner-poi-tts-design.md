# Shop Owner POI TTS Parity Design (2026-04-01)

## Goal & Success Criteria
- Give shop-owner POI form the same Text-to-Speech (TTS) generation UX as the admin form (Vietnamese + English buttons, validation, loading states, toast feedback).
- Centralize TTS logic so both admin and shop-owner flows share the same implementation, minimizing drift.
- Preserve existing APIs (`poiService.generateTts`) and media-refresh behavior; shop-owner portal continues to call its own media fetcher after generation.

Success is achieved when a shop owner opens an existing POI, sees the TTS block, can generate VI/EN audio (after saving content), and the behavior matches the admin interface in validation and toast messaging.

## Current State & Gaps
- Admin form already exposes TTS controls alongside manual audio upload. The logic (state + handler) lives inline in `POIFormPage` and calls `poiService.generateTts(id, text, language)` before reloading media.
- Shop-owner form (`apps/admin/src/pages/owner/ShopOwnerPOIFormPage.tsx`) has audio upload UI but no TTS generation. It already refreshes media after uploads via `shopOwnerPortalService.getOnePoi`.
- Duplicating admin logic would work but creates maintenance debt.

## Proposed Architecture
1. **Shared hook (`usePoiTts`)**
   - Location: `apps/admin/src/hooks/usePoiTts.ts` (new file)
   - Signature:
     ```ts
     interface UsePoiTtsParams {
       getPoiId: () => string | undefined;
       getDescriptionFor: (language: 'VI' | 'EN') => string;
       refreshMedia?: () => Promise<void>;
       onSuccessToast: (lang: 'VI' | 'EN') => void;
       onErrorToast: (lang: 'VI' | 'EN', message: string) => void;
     }
     ```
   - Returns `{ generating: { VI?: boolean; EN?: boolean }, generateTts(language) }`.
   - Internally guards on POI ID and description length (>=10 chars), mirroring existing validation. Errors bubble through `onErrorToast` so screens retain localized copy.

2. **Admin Form Integration**
   - Replace inline `handleGenerateTts` + `ttsGenerating` state with hook usage.
   - Provide `refreshMedia` that refetches via `poiService.getOne(id)` (current behavior).
   - Toast copy stays the same because admin page provides the messages to the hook via callbacks.

3. **Shop Owner Form Integration**
   - Import the same hook and wire it up with shop-owner descriptions + `shopOwnerPortalService.getOnePoi(id)` for refresh.
   - Render the same JSX block that currently exists in admin TTS panel (or extract to shared component if time allows later). Buttons use hook state for disabled/loading.
   - Validations (POI saved, description length) surface identical to admin experience.

4. **UI/UX**
   - Shop-owner page adds the existing admin TTS card (heading, helper text, two primary buttons).
   - Buttons show spinner icon while `generating[lang]` is true; disabled if lacking description text for that language.
   - Toast copy uses existing `POI_FORM_LABELS` strings for localization.

## Data Flow
1. User clicks "Generate VI audio".
2. Hook checks `getPoiId()` and `getDescriptionFor('VI')`.
3. Calls `poiService.generateTts(id, text, 'VI')`.
4. On success, `refreshMedia?.()` runs; page state updates with new audio list.
5. Hook toggles loading state off; invoking `onSuccessToast('VI')` for consistent messaging.

## Edge Cases & Validation
- Prevent generation when POI not yet saved (`getPoiId()` returns undefined) → show error toast.
- Require ≥10 characters for each description to avoid empty TTS.
- Handle API failure (network, validation) with descriptive error toast from response payload when available.

## Testing Strategy
- Manual verification for both admin and shop-owner forms: generate VI & EN audio, confirm loading state, confirm audio list updates.
- (Optional) Unit-test hook with mocked `poiService.generateTts` if time permits, ensuring state toggles and callbacks fire correctly.

## Open Questions / Follow-ups
- Future iteration could also centralize manual audio upload UI, but out of scope.
- Hook currently lives in admin app; if mobile or other apps eventually need TTS, consider shared package.
