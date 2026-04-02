# WS4 Mobile Localization Design (2026-04-02)

## 1. Overview

WS4 delivers mobile POI localization for the POI detail screen only. The goal is to let users switch the displayed language for a POI, preserve the last-selected language on the device, and surface a lightweight request-translation flow when content is missing.

This work is intentionally UI-first:
- lock the POI detail interaction model first
- then connect the data hook and caching layer
- then add AsyncStorage-backed pending-request state

The mobile app keeps its current visual language and does not introduce a new design system.

## 2. Goals and Non-Goals

### 2.1 Goals

1. Add a language selector to the POI detail screen.
2. Show translated content when available.
3. Fall back predictably when the selected language is missing content.
4. Persist the selected POI language locally on the device.
5. Persist translation-request pending state locally by `poiId + language`.
6. Show subtle stale/outdated messaging when cached content may be old.
7. Keep the implementation isolated to the mobile app.

### 2.2 Non-Goals

- Do not expand WS4 to POI list cards, favorites cards, or other preview surfaces.
- Do not sync selected language to the account.
- Do not add a backend translation-request workflow.
- Do not redesign the mobile app visual language.
- Do not add automatic translation generation.

### 2.3 Success Criteria

- POI detail screen can switch languages without leaving the page.
- The last selected language is restored on the same device for the same POI.
- Missing content always resolves using the documented fallback rule.
- Pending request state survives reload/navigation on the device.
- Cached content can show a subtle stale notice without blocking the UI.

## 3. Current State Summary

- `apps/mobile/app/poi/[id].tsx` already renders the POI detail screen and currently relies on the existing language context for base POI text.
- `apps/mobile/context/LanguageContext.tsx` currently persists the app language and exposes helpers such as `getPoiName` and `getPoiDescription`.
- `apps/mobile/app/language.tsx` already exists as a language settings screen for the app shell.
- The mobile app already uses AsyncStorage and Expo Router, so the new work can stay aligned with existing patterns.

## 4. Design Principles

1. Keep the UI readable before optimizing the data layer.
2. Make the selected language explicit and recoverable.
3. Prefer silent refresh over disruptive loading states.
4. Treat pending request state as local UI state, not as a backend sync problem.
5. Avoid cross-surface scope creep.

## 5. Proposed Architecture

### 5.1 Layer 1: UI

The POI detail screen owns the language selector and the display of localized content.

Recommended surface:
- a pill-style selector placed near the top of the content block on the POI detail screen
- opening the selector shows a bottom sheet with enabled languages
- the content area shows translated text, fallback notes, and request status

The UI should show:
- current language label in the closed pill
- language status chips inside the selector list (`Default`, `Translated`, `Missing`, `Pending`)
- a fallback note when displayed content comes from a fallback language
- a `Request translation` CTA when the selected language has no content
- a `Pending` badge when a request already exists

Status chip definitions (normative):
- `Default`: the app/default language configured for this session (not the currently active row marker).
- `Translated`: the selected language has a localization record with both `name` and `description` displayable.
- `Missing`: either `name` or `description` is missing for that language.
- `Pending`: a pending request exists for `poiId + language` in local pending storage.

### 5.2 Layer 2: Data Hook

Create a mobile-focused hook, `usePoiLocalization(poiId)`, that owns the POI localization resource.

The hook should expose:
- `availableLanguages`
- `activeLanguage`
- `setLanguage(language)`
- `getContent(language)` returning `{ name, description, fallback }`

The hook is responsible for:
- loading POI localizations
- loading enabled supported languages
- choosing the active language
- resolving fallback content
- keeping cached content in sync with the latest fetch metadata

### 5.3 Layer 3: AsyncStorage Persistence

AsyncStorage handles two separate concerns:
- per-POI selected language persistence
- per-POI per-language pending translation requests

These concerns stay isolated from rendering logic so UI code can remain simple and easy to test.

## 6. Mobile POI Detail UX

### 6.1 Selector Placement

Use the existing POI detail screen and place the selector above the description/content block, near the top of the content card.

Closed state:
- pill/button showing the current language code and label
- a chevron or sheet affordance so the interaction is obvious

Open state:
- bottom sheet listing all enabled languages
- each item shows its current status
- the currently selected language is visually highlighted

Selector visibility rule:
- show all `enabled` languages, including languages with `Missing` status
- do not hide missing languages from the selector

### 6.2 Active Language Priority

When a POI detail screen opens, resolve the initial active language in this order:

1. last selected language for this POI on this device
2. app language
3. English
4. Vietnamese

This order is for the initial language choice only. Once a language is chosen, content fallback uses the rule in Section 6.3 and does not walk the initial selection list again.

Guard condition:
- each candidate language above is only valid if it exists in `enabled` languages
- if not enabled, skip to the next candidate

### 6.3 Fallback Behavior

If the selected language has no displayable content:

1. fall back to Vietnamese
2. if Vietnamese is missing, fall back to English

Always show a fallback note when a fallback is used. Use dynamic copy tied to the actual fallback language label.

Example pattern:

> Showing {fallbackLanguageLabel} - translation not available yet

Do not use nearest-language heuristics or any similarity-based fallback.

### 6.4 Missing-Content State

If the selected language is missing content, the content area should show:
- the fallback content when available
- a visible fallback note
- a `Request translation` CTA

If no displayable content exists in any supported fallback language, show a dedicated empty state and keep the `Request translation` CTA visible unless a pending request already exists for that POI + language.

Do not use skeleton UI as the final empty behavior.

Request CTA decision rule (normative):
- translation exists: do not show CTA
- translation missing + not pending: show CTA
- translation missing + pending: disable CTA and show pending badge/note

### 6.5 Pending Request State

When a request is already pending for the POI + language:
- disable the `Request translation` button
- show a `Pending` badge in the selector
- show a `Pending` badge or note in the content area for the active language
- show the waiting note:

> Yêu cầu đang chờ xử lý

There is no cancel action in WS4.

### 6.6 Stale Content State

If the screen is rendering cached localization content while background revalidation is in flight, show a subtle stale notice/banner such as:

> Content may be outdated

The stale message should be lightweight and non-blocking.

Do not add broader cache-retention rules in this spec; keep the freshness signal tied only to whether the current POI localization resource is being shown from cache while a refresh is in progress.

Copy note:
- strings shown in this spec are behavior examples
- production implementation should use i18n keys instead of hardcoded literals

## 7. Data Flow

### 7.1 Load Sequence

1. The screen mounts with a `poiId`.
2. `usePoiLocalization(poiId)` reads the cached selected language for that POI from AsyncStorage.
3. The hook loads supported languages and POI localizations.
4. The hook computes the active language using the priority rules in Section 6.2.
5. The UI renders the selected language, localized content, and status indicators.
6. Background refresh updates cache metadata without blocking the page.

### 7.2 Language Change Sequence

1. User opens the bottom sheet selector.
2. User picks a language.
3. The hook persists the chosen language locally for that POI.
4. The content area re-renders using the new language.
5. If the selected language is missing content, the fallback note and CTA appear.

### 7.3 Request Translation Sequence

1. User opens a language that has no content.
2. User taps `Request translation`.
3. The hook stores pending state in AsyncStorage using `poiId + language`.
4. The button becomes disabled.
5. The selector and content area both show pending state.

## 8. Data Model and Storage

### 8.1 Selected Language Storage

Store the last selected language for each POI locally on the device.

Recommended key shape:
- `poiLanguagePreference:${poiId}`

Storage payload:
- selected language code

### 8.2 Pending Request Storage

Store pending requests locally by `poiId + language`.

Recommended key shape:
- `localizationPendingRequests:v1`

Storage payload should be enough to answer:
- is this language pending for this POI?
- which languages are pending for this POI?

Minimum payload fields:
- `poiId`
- `language`
- `requestedAt`

### 8.3 Cache Metadata

The hook may retain only the minimal metadata needed to know whether the current render is backed by cached data and whether a revalidation request is in progress.

That metadata is internal to the hook and is only used to decide when to show the stale banner and when to refresh the current POI resource.

## 9. Component and File Boundaries

Recommended file split:

- `apps/mobile/app/poi/[id].tsx`
  - integrates the selector and localized content into the POI detail screen
- `apps/mobile/app/components/PoiLanguageSelector.tsx`
  - pill trigger and bottom-sheet language list
- `apps/mobile/app/hooks/usePoiLocalization.ts`
  - resource loading, active language resolution, cache metadata, and selection persistence
- `apps/mobile/app/services/localization.ts`
  - POI localization fetch helpers and normalization logic
- `apps/mobile/app/services/localizationPendingRequests.ts`
  - AsyncStorage helper for pending translation requests
- `apps/mobile/context/LanguageContext.tsx`
  - continues to own the app language, but not per-POI selection state

This separation keeps the UI simple and keeps persistence logic out of the screen.

## 10. Error Handling and Guardrails

- If localization fetch fails, keep the screen usable with any cached content.
- If pending-state storage fails, fail softly and avoid breaking rendering.
- If supported languages cannot load, fall back to cached languages and keep the UI stable.
- If no content is displayable, show a dedicated empty state instead of skeletons.
- Keep request actions disabled when pending is already recorded.

## 11. Testing Strategy

### 11.1 UI Tests

- POI detail screen shows the selector in the expected position.
- Bottom sheet lists enabled languages only.
- Pending state renders in both selector and content area.
- Fallback note appears when content is not available in the selected language.

### 11.2 Hook Tests

- `usePoiLocalization` resolves the active language in the correct priority order.
- Fallback resolution prefers Vietnamese, then English.
- Selected language persists per POI on the device.
- Cache metadata causes the stale banner to appear when appropriate.

### 11.3 Storage Tests

- Pending translation requests persist by `poiId + language`.
- Pending requests survive reloads.
- The request button remains disabled while pending.

### 11.4 Regression Checks

- POI detail behavior remains isolated from POI list or preview cards.
- App language settings continue to work independently from POI-local language selection.

## 12. Rollout Plan

1. Implement the POI detail UI shell with mocked language data.
2. Add `usePoiLocalization` and connect the selector to live data.
3. Add AsyncStorage persistence for selected language and pending requests.
4. Add stale/fallback messaging and verify the UI states.
5. Run mobile-focused tests and review the POI detail experience end to end.

## 13. Status

- Scope approved by design discussion
- UI-first approach confirmed
- Ready for implementation planning