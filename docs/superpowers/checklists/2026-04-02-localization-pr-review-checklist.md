# PR Review Checklist - WS2 + WS3 Localization

## Functional
- [ ] Admin can create, edit, delete localization per language
- [ ] Conflict modal behavior is correct (reload/overwrite)
- [ ] Shop owner has no edit/delete actions
- [ ] Existing translations are readonly for shop owner
- [ ] Missing translation shows Request translation
- [ ] Pending state disables request and shows badge/note
- [ ] enabled=false languages are hidden

## State and Persistence
- [ ] Pending state key uses poiId + language
- [ ] Pending survives reload/navigation
- [ ] No duplicate request while pending

## Architecture
- [ ] WS3 reuses LocalizationPanel (no duplicated component stack)
- [ ] Role logic is centralized and maintainable
- [ ] Pending logic is isolated in dedicated service

## Analytics
- [ ] Request action emits analytics
- [ ] Pending visibility emits analytics
- [ ] Payload includes poiId, language, role

## Testing and Regression
- [ ] Localization-focused tests pass
- [ ] Full admin Vitest suite passes
- [ ] Admin flow behavior is not regressed
- [ ] No unrelated accidental files in PR
