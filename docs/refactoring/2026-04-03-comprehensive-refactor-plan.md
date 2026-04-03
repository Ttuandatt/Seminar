# 📋 Comprehensive Project Refactoring Plan

**Date**: April 3, 2026  
**Status**: PLANNING  
**Scope**: Full Project (apps/admin, apps/mobile, apps/api, packages/localization-shared, docs/)  
**Execution Timeline**: Phase-based (can stop at any phase)

---

## 🎯 Goals

1. **Development Speed**: Easy to find where to add features, clear patterns, minimal context switching
2. **Maintainability**: Clear separation of concerns, reusable logic, easy to test, scalable structure
3. **Shared Code**: Expand `localization-shared` to prevent duplication across admin + mobile
4. **Documentation**: Clear structure for requirements, design, implementation, handoffs

---

## 📊 Current Problems

### Admin App (`apps/admin/src`)
- **Services**: 9+ service files scattered - no clear grouping by domain
- **Pages**: Admin + Shop Owner pages mixed - hard to find role-specific logic
- **Components**: No clear organization for shared vs role-specific components
- **Hooks**: Services-adjacent but no pattern (usePoiTts, useSupportedLanguages, etc.)
- **Utils**: No dedicated folder - constants/helpers mixed with pages
- **Tests**: No folder structure - tests.ts files scattered

### Mobile App (`apps/mobile`)
- **Services**: 5+ service files without clear domain boundaries
- **Context**: Only 2 contexts but no folder structure
- **Utils**: audioMedia.ts + tests at root - needs utils/ folder
- **Types**: No dedicated types folder - interfaces in services
- **Hooks**: Only 1 hook - good but could benefit from folder
- **Screens**: Good but missing shared components organization

### API (`apps/api/src`)
- **Modules**: Good structure but could add:
  - `shared/` for cross-module utilities
  - `guards/`, `decorators/`, `filters/` → each in separate folder
  - `database/` for Prisma-related code
- **Prisma**: Scripts scattered in `prisma/` root

### Docs (`docs/`)
- **Chaos**: 20+ files in multiple folders without clear hierarchy
- **No**: Clear distinction between Requirements / Design / Implementation / Handoffs

### Shared Package (`packages/localization-shared`)
- **Limited**: Should expand to include:
  - Shared types/enums
  - Common hooks (not just React, but React Native too)
  - UI component stubs (for consistency)

---

## 🏗️ NEW STRUCTURE PROPOSAL

### Phase 1: Admin App Refactor

```
apps/admin/src/
├── constants/                      # NEW: Centralized constants
│   ├── form-labels.ts
│   ├── validation-rules.ts
│   └── api-endpoints.ts
│
├── types/                          # NEW: Centralized types
│   ├── admin.ts                    # Admin-specific types
│   ├── shop-owner.ts               # Shop Owner-specific types
│   ├── common.ts                   # Shared types
│   └── index.ts
│
├── services/                       # REORGANIZED
│   ├── api/                        # NEW folder for API clients
│   │   ├── admin/                  # Admin domain
│   │   │   ├── poi.service.ts
│   │   │   ├── tour.service.ts
│   │   │   ├── merchant.service.ts
│   │   │   └── analytics.service.ts
│   │   ├── shop-owner/             # Shop Owner domain
│   │   │   ├── poi.service.ts
│   │   │   ├── dashboard.service.ts
│   │   │   └── analytics.service.ts
│   │   └── shared/                 # Shared across roles
│   │       ├── profile.service.ts
│   │       └── auth.service.ts
│   │
│   ├── domain/                     # NEW: Business logic
│   │   ├── poi/
│   │   │   ├── localization-analytics.ts
│   │   │   └── poi-utils.ts
│   │   ├── tour/
│   │   │   └── tour-utils.ts
│   │   └── localization/
│   │       ├── localizationPendingRequests.ts
│   │       └── localization-sync.ts
│   │
│   ├── translate.service.ts        # Keep - special service
│   └── index.ts                    # Barrel export
│
├── hooks/                          # REORGANIZED
│   ├── usePoiTts.ts
│   ├── useSupportedLanguages.ts
│   ├── useLocalization.ts          # NEW: composed from domain logic
│   └── index.ts                    # Barrel export
│
├── components/                     # REORGANIZED
│   ├── shared/                     # Shared across roles
│   │   ├── ui/                     # Base UI components
│   │   ├── form/                   # Form components (input, picker, etc)
│   │   ├── preview/                # Preview components
│   │   ├── map/                    # Map utilities
│   │   └── layout/                 # Layout (Dashboard, Nav, etc)
│   │
│   ├── admin/                      # NEW: Admin-only components
│   │   ├── dashboard/
│   │   ├── poi-form/
│   │   ├── tour-form/
│   │   └── merchant-form/
│   │
│   ├── shop-owner/                 # NEW: Shop Owner-only components
│   │   ├── dashboard/
│   │   └── poi-form/
│   │
│   └── localization/               # Localization-specific
│       ├── LocalizationPanel.tsx
│       ├── ConflictModal.tsx
│       └── LocalizationPanelAccordion.tsx
│
├── pages/                          # REORGANIZED
│   ├── admin/                      # Admin pages
│   │   ├── dashboard.tsx
│   │   ├── poi/
│   │   │   ├── list.tsx
│   │   │   ├── form.tsx
│   │   │   └── detail.tsx
│   │   ├── tour/
│   │   │   ├── list.tsx
│   │   │   ├── form.tsx
│   │   │   └── detail.tsx
│   │   ├── merchant/
│   │   │   ├── list.tsx
│   │   │   ├── form.tsx
│   │   │   └── detail.tsx
│   │   ├── map.tsx
│   │   ├── analytics.tsx
│   │   └── profile.tsx
│   │
│   ├── shop-owner/                 # Shop Owner pages
│   │   ├── dashboard.tsx
│   │   ├── poi/
│   │   │   ├── list.tsx
│   │   │   ├── form.tsx
│   │   │   └── detail.tsx
│   │   ├── map.tsx
│   │   ├── analytics.tsx
│   │   └── profile.tsx
│   │
│   ├── auth/                       # Auth pages (shared)
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   │
│   └── not-found.tsx
│
├── utils/                          # NEW: Utilitiy functions
│   ├── language-display.ts
│   ├── validation.ts
│   └── format.ts
│
├── lib/                            # Keep: API setup
│   └── api.ts
│
├── context/                        # NEW: React Context
│   └── auth.tsx
│
├── App.tsx                         # CLEAN: Minimal routing
├── main.tsx
└── index.css
```

### Phase 2: Mobile App Refactor

```
apps/mobile/
├── src/                            # NEW: Move existing app code here
│   ├── types/                      # NEW: Centralized types
│   │   ├── poi.ts
│   │   ├── tour.ts
│   │   ├── user.ts
│   │   └── index.ts
│   │
│   ├── services/                   # REORGANIZED
│   │   ├── api/                    # API clients grouped by domain
│   │   │   ├── public.service.ts   # POIs, Tours, QR validate
│   │   │   ├── tourist.service.ts  # Profile, Favorites, History
│   │   │   ├── auth.service.ts     # Auth for Tourist
│   │   │   └── index.ts            # Barrel export
│   │   │
│   │   ├── storage/                # NEW: Local storage logic
│   │   │   ├── database.ts
│   │   │   └── cache.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── context/                    # REORGANIZED
│   │   ├── auth/
│   │   │   └── AuthContext.tsx
│   │   ├── localization/
│   │   │   └── LanguageContext.tsx
│   │   ├── audio/
│   │   │   ├── AudioContext.tsx
│   │   │   └── useAudioPlayer.ts   # Extracted from context
│   │   └── index.ts
│   │
│   ├── hooks/                      # NEW: Custom hooks
│   │   ├── usePoiLocalization.ts
│   │   ├── useAudioPlayback.ts
│   │   ├── useLocation.ts
│   │   ├── useTourNavigation.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # REORGANIZED (from root)
│   │   ├── audioMedia.ts
│   │   ├── audioMedia.test.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   ├── services/localization/      # NEW: Localization logic
│   │   ├── localizationResolver.ts
│   │   ├── localizationCopy.ts
│   │   ├── runtimeLocalizationService.ts
│   │   └── index.ts
│   │
│   ├── screens/                    # REORGANIZED (from app/)
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   │
│   │   ├── main/                   # Tab screens
│   │   │   ├── MapScreen.tsx
│   │   │   ├── TourListScreen.tsx
│   │   │   └── MoreScreen.tsx
│   │   │
│   │   ├── poi/
│   │   │   ├── POIDetailScreen.tsx
│   │   │   └── FavoritesScreen.tsx
│   │   │
│   │   ├── tour/
│   │   │   ├── TourDetailScreen.tsx
│   │   │   └── TourFollowScreen.tsx
│   │   │
│   │   ├── scanner/
│   │   │   └── QRScannerScreen.tsx
│   │   │
│   │   └── settings/
│   │       ├── LanguageScreen.tsx
│   │       ├── ProfileScreen.tsx
│   │       └── AboutScreen.tsx
│   │
│   ├── components/                 # REORGANIZED
│   │   ├── shared/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   └── ...
│   │   │   ├── audio/
│   │   │   │   └── AudioPlayer.tsx
│   │   │   ├── map/
│   │   │   │   ├── MapControls.tsx
│   │   │   │   └── BottomSheet.tsx
│   │   │   └── navigation/
│   │   │       └── TabBar.tsx
│   │   │
│   │   └── poi/
│   │       ├── POICard.tsx
│   │       ├── POIImageCarousel.tsx
│   │       └── POIPreview.tsx
│   │
│   ├── i18n/                       # Move from root
│   │   ├── locales/
│   │   │   ├── vi.json
│   │   │   └── en.json
│   │   └── config.ts
│   │
│   ├── config/                     # NEW: App config
│   │   ├── constants.ts
│   │   ├── theme.ts
│   │   └── env.ts
│   │
│   ├── App.tsx                     # Main App entry
│   ├── RootLayout.tsx              # Root navigation
│   └── index.ts
│
├── app/                            # DEPRECATED: Migrate to src/
│   └── ... (will be replaced by src/screens/)
│
├── vitest.config.ts                # Keep at root
├── package.json
└── tsconfig.json
```

### Phase 3: API Refactor

```
apps/api/src/
├── common/                         # ENHANCE
│   ├── decorators/                 # NEW folder
│   │   ├── roles.decorator.ts
│   │   ├── current-user.decorator.ts
│   │   └── index.ts
│   │
│   ├── guards/                     # NEW folder
│   │   ├── jwt-auth.guard.ts
│   │   ├── roles.guard.ts
│   │   └── index.ts
│   │
│   ├── filters/                    # NEW folder
│   │   ├── http-exception.filter.ts
│   │   └── index.ts
│   │
│   └── types/                      # NEW folder
│       ├── jwt.ts
│       ├── auth.ts
│       └── index.ts
│
├── database/                       # NEW folder for Prisma
│   ├── prisma.module.ts
│   ├── prisma.service.ts
│   └── seeds/
│       ├── languages.seed.ts
│       ├── pois.seed.ts
│       └── index.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── auth.controller.ts
│   │   ├── strategies/              # NEW folder
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── local.strategy.ts
│   │   │   └── index.ts
│   │   ├── dto/
│   │   └── interfaces/
│   │
│   ├── pois/
│   │   ├── poi.module.ts
│   │   ├── poi.service.ts
│   │   ├── poi.controller.ts
│   │   ├── dto/
│   │   ├── interfaces/
│   │   └── utils/                  # NEW folder for poi-specific logic
│   │
│   ├── tours/
│   │   ├── tour.module.ts
│   │   ├── tour.service.ts
│   │   ├── tour.controller.ts
│   │   ├── dto/
│   │   └── interfaces/
│   │
│   ├── media/
│   │   ├── media.module.ts
│   │   ├── media.service.ts
│   │   ├── media.controller.ts
│   │   └── ...
│   │
│   ├── localization/               # NEW module
│   │   ├── localization.module.ts
│   │   ├── localization.service.ts
│   │   ├── localization.controller.ts
│   │   ├── dto/
│   │   └── interfaces/
│   │
│   └── ... (other modules retain structure)
│
├── config/                         # NEW folder
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── env.ts
│   └── index.ts
│
├── utils/                          # NEW folder for shared utilities
│   ├── hash.ts
│   ├── validators.ts
│   └── format.ts
│
├── app.module.ts
└── main.ts
```

### Phase 4: Localization-Shared Package EXPANSION

```
packages/localization-shared/
├── src/
│   ├── types/                      # NEW: Shared types
│   │   ├── media.ts                # MediaLanguage, audio/image enums
│   │   ├── poi.ts                  # POI types with localization
│   │   ├── tour.ts
│   │   ├── common.ts
│   │   └── index.ts
│   │
│   ├── enums/                      # NEW: Shared enums
│   │   ├── languages.ts            # BCP47Language enum
│   │   ├── media-type.ts
│   │   └── index.ts
│   │
│   ├── utils/                      # REORGANIZED
│   │   ├── audio-media.ts          # audioMedia.ts → here
│   │   ├── language-helpers.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   │
│   ├── react/                      # Keep: React hooks
│   │   ├── index.ts
│   │   ├── usePoiLocalizations.ts
│   │   └── useLocalizedText.ts     # NEW
│   │
│   ├── react-native/               # NEW: React Native hooks
│   │   ├── index.ts
│   │   ├── usePoiLocalizations.ts  # RN-specific usePoiLocalizations
│   │   └── useAudioFallback.ts     # NEW: RN-specific audio fallback
│   │
│   ├── client.ts                   # Keep: API client setup
│   ├── index.ts                    # Main barrel export
│   └── package.json
│
└── dist/
    ├── types.d.ts
    ├── enums.d.ts
    ├── utils.d.ts
    ├── react/
    ├── react-native/
    └── ...
```

### Phase 5: Docs Refactor

```
docs/
├── README.md                       # NEW: Docs navigation
│
├── 00-project-overview/            # NEW folder
│   ├── vision.md
│   ├── tech-stack.md
│   └── team.md
│
├── 01-requirements/                # NEW folder: PRD
│   ├── executive-summary.md        # moved from step3_prd/
│   ├── scope.md
│   ├── user-personas.md
│   ├── user-stories.md
│   ├── functional-requirements.md
│   └── ...
│
├── 02-design/                      # NEW folder
│   ├── ui-ux/
│   │   ├── user-flows.md           # from step2_lowcode/
│   │   ├── screen-designs.md
│   │   └── design-system.md
│   │
│   ├── data/
│   │   ├── data-model.md
│   │   ├── data-fields.md          # from step2_lowcode/
│   │   └── er-diagram.md
│   │
│   ├── api/
│   │   └── api-specifications.md   # from step3_prd/
│   │
│   └── architecture/
│       ├── system-architecture.md
│       ├── backend-structure.md
│       ├── frontend-structure.md
│       └── mobile-structure.md
│
├── 03-implementation/              # NEW folder
│   ├── backend/
│   │   ├── setup-guide.md
│   │   ├── module-structure.md
│   │   ├── database-setup.md
│   │   └── testing-guide.md
│   │
│   ├── web-admin/
│   │   ├── setup-guide.md
│   │   ├── component-structure.md
│   │   └── testing-guide.md
│   │
│   ├── mobile/
│   │   ├── setup-guide.md
│   │   ├── screen-structure.md
│   │   └── testing-guide.md
│   │
│   ├── shared/
│   │   └── localization-package.md
│   │
│   └── devops/
│       ├── docker-setup.md
│       └── deployment.md
│
├── 04-handoffs/                    # NEW folder: For phase transitions
│   ├── 2026-04-03-project-refactor/
│   │   ├── migration-checklist.md
│   │   ├── breaking-changes.md
│   │   └── rollback-plan.md
│   │
│   └── ... (future handoffs)
│
├── 05-troubleshooting/             # NEW folder
│   ├── setup-issues.md
│   ├── common-errors.md
│   └── debugging-guide.md
│
├── dev-notes/                      # KEEP: WIP & experiments
├── superpowers/                    # KEEP: AI handoffs & plans
└── context_snapshot.md             # KEEP: Current state
```

---

## 🔄 Migration Strategy

### Step 1: Prepare (No Breaking Changes Yet)

1. **Create new folder structure** alongside existing code (don't delete)
2. **Duplicate key files** in new locations (keep old files)
3. **Update imports gradually** in isolated test files
4. **Create barrel exports** (index.ts) for new folder structure
5. **Document new patterns** in a STYLE_GUIDE.md

### Step 2: Migrate Core Services (Low Risk)

**Admin App:**
1. Move `services/` → `services/api/` (with subfolder structure)
2. Move `constants/` to new folder
3. Migrate `hooks/` with barrel export
4. Update App.tsx imports (minimal change)

**Mobile App:**
1. Move `utils/` → `src/utils/`
2. Create `services/api/` structure
3. Organize context folders

### Step 3: Migrate Pages & Components (Medium Risk)

**Admin App:**
1. Reorganize `pages/` by role (admin/, shop-owner/, auth/)
2. Organize `components/` by type (shared/, admin/, shop-owner/)
3. Update all page imports (bulk find & replace)

**Mobile App:**
1. Move `app/` → `src/screens/` (gradual, route by route)
2. Reorganize `components/` structure
3. Update Expo Router config

### Step 4: Test & Validate (High Importance)

1. **Run full test suite** for each app
2. **Run TypeScript compiler** to catch import errors
3. **Manual testing** of key workflows
4. **Performance check** (bundle size, load time)

### Step 5: Clean Up Old Files

1. Delete old duplicate files
2. Update documentation
3. Create MIGRATION_LOG.md
4. Final git commit with all changes

---

## ⚠️ Breaking Changes & Mitigation

### Breaking Changes:

| Change | Impact | Mitigation |
|--------|--------|-----------|
| Service paths (api.service.ts → services/api/admin/poi.service.ts) | All imports in admin app | Use find & replace, test thoroughly |
| Component organization | Page imports | Update page imports in App.tsx |
| Mobile app/ → src/screens/ | Expo Router config | Create compatibility layer first |
| types/ placement changes | All TS files | Centralize before migrating |

### Mitigation Strategy:

1. **Branch for each phase** (feature/refactor-admin-phase1, etc.)
2. **Feature flags** for gradual rollout (if needed)
3. **Automated tests** for every migrated module
4. **Peer review** before merging each phase
5. **Rollback plan** (git revert, revert imports)

---

## ✅ Testing Strategy

### Phase 1-5 Testing (Parallel to Migration):

1. **Unit Tests**
   - Existing tests must pass after migration
   - No new test logic, only import path updates

2. **Integration Tests**
   - Admin workflows (create POI, edit POI, etc.)
   - Mobile workflows (view POI, play audio, etc.)
   - API endpoints for each module

3. **E2E Tests**
   - Full user flows
   - Cross-app communication

4. **Type Safety**
   - `tsc --noEmit` for each app
   - No `any` types introduced

---

## 📅 Execution Timeline

| Phase | Duration | Complexity |
|-------|----------|-----------|
| **Phase 1: Admin Refactor** | 2-3 days | HIGH |
| **Phase 2: Mobile Refactor** | 2-3 days | HIGH |
| **Phase 3: API Refactor** | 1-2 days | MEDIUM |
| **Phase 4: Localization-Shared** | 1 day | LOW |
| **Phase 5: Docs Refactor** | 1 day | LOW |
| **Phase 6: Testing & Validation** | 2-3 days | HIGH |
| **Phase 7: Cleanup & Documentation** | 1 day | LOW |
| **TOTAL** | **10-14 days** | — |

---

## 🎯 Success Criteria

After refactoring, project should:

- ✅ Pass all tests (unit, integration, e2e)
- ✅ No TypeScript errors (`tsc --noEmit`)
- ✅ Clear folder structure (easy to navigate)
- ✅ Reusable services/hooks (< 5 lines of duplication)
- ✅ Well-organized components (< 3 levels deep)
- ✅ Updated README + style guide
- ✅ All imports working (no 404 imports)
- ✅ Performance metrics stable (bundle size, load time)

---

## 📝 Next Steps

1. **Review this plan** with team
2. **Choose implementation approach**:
   - **Option A**: Do all phases at once (faster, higher risk)
   - **Option B**: Do phases 1-2 (admin + mobile), pause for testing, then 3-5
   - **Option C**: Do one phase per week (safest, slower)
3. **Create feature branches** for each phase
4. **Start Phase 1: Admin Refactor**

---

## 👤 Owner & Reviewers

- **Proposed by**: GitHub Copilot
- **Approved by**: [TO BE FILLED]
- **Implementation Lead**: [TO BE FILLED]
- **Reviewer**: [TO BE FILLED]

