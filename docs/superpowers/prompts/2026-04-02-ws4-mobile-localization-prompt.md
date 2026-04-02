# Prompt - WS4 Mobile Localization

Implement Workstream 4 (Mobile Localization) for POI detail.

Scope:
- Reuse localization contract/data shape from WS2/WS3
- Add language selector on POI detail
- Load poi, localizations, supportedLanguages on mount
- Expose usePoiLocalization(poiId) with:
  - availableLanguages
  - activeLanguage
  - setLanguage(lang)
  - getContent(lang) -> { name, description, fallback }

Behavior:
- Show translated content when available
- If missing, fallback to Vietnamese or English
- Show fallback note and Request translation action

Pending request:
- Persist by poiId + language in AsyncStorage
- While pending: disable action, show Pending badge and waiting note

Language rules:
- Hide enabled=false
- Show all enabled languages including missing translations
- Mark each language as Default / Translated / Missing

State and caching:
- Cache by poiId
- Track updatedAt and stale refetch
- Persist selected language per device
- Offline mode uses cache and shows outdated warning when stale

Constraints:
- No backend request endpoint integration yet
- Keep abstractions ready for future sync
- Keep all changes isolated to mobile app

Expected deliverables:
- Language selector UI
- usePoiLocalization hook
- AsyncStorage pending persistence layer
- POI detail integration
- Typecheck pass
- Clear changed-files summary
