# Project Structure Refactor Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor the Seminar monorepo into a clearer domain-first structure with shared contracts, shared clients, and app shells that only own UI or domain-specific runtime concerns.

**Architecture:** Keep the three applications (`admin`, `api`, `mobile`) as the product entry points, but move duplicated cross-app logic into focused packages under `packages/`. The refactor should preserve behavior while tightening boundaries: API owns domain rules, apps own composition/UI, and shared packages own contracts, localization, and HTTP clients.

**Tech Stack:** TypeScript, NestJS, React + Vite, Expo/React Native, Prisma, shared package exports, workspace-based path resolution.

---

## File Structure Overview

| File / Folder | Action | Responsibility |
| --- | --- | --- |
| `package.json` | Create | Root workspace scripts, dependency orchestration, common commands. |
| `pnpm-workspace.yaml` | Create | Declare `apps/*` and `packages/*` as workspace members. |
| `packages/contracts/` | Create | Shared DTOs, enums, request/response types, and schema helpers. |
| `packages/api-client/` | Create | Typed HTTP clients for auth, poi, tours, profile, and media workflows. |
| `packages/localization-shared/` | Modify | Expand current localization package to be the single source of truth for mobile/admin localization logic. |
| `packages/config/` | Create | Shared TS/ESLint/Prettier base configs for apps and packages. |
| `apps/admin/src/` | Modify | Keep dashboard UI and local presentation state only; consume shared clients/contracts. |
| `apps/mobile/` | Modify | Keep Expo routing and native UI only; consume shared clients/contracts/localization. |
| `apps/api/src/` | Modify | Keep backend domain modules and infrastructure; import shared contracts instead of re-declaring them. |
| `docs/architecture/` | Create | Add the target tree and migration notes so the structure stays discoverable. |

---

## Target Project Structure

```text
Seminar/
├── apps/
│   ├── admin/
│   │   ├── public/
│   │   └── src/
│   │       ├── app/
│   │       ├── features/
│   │       ├── shared/
│   │       ├── components/
│   │       └── main.tsx
│   ├── api/
│   │   ├── prisma/
│   │   └── src/
│   │       ├── modules/
│   │       ├── shared/
│   │       └── main.ts
│   └── mobile/
│       ├── app/
│       ├── assets/
│       └── src/
│           ├── features/
│           ├── shared/
│           ├── components/
│           ├── services/
│           └── utils/
├── packages/
│   ├── api-client/
│   │   └── src/
│   │       ├── auth.ts
│   │       ├── poi.ts
│   │       ├── tour.ts
│   │       ├── profile.ts
│   │       └── index.ts
│   ├── contracts/
│   │   └── src/
│   │       ├── auth/
│   │       ├── poi/
│   │       ├── tour/
│   │       ├── user/
│   │       └── index.ts
│   ├── localization-shared/
│   │   └── src/
│   │       ├── client.ts
│   │       ├── react/
│   │       ├── react-native/
│   │       └── resources/
│   └── config/
│       └── src/
│           ├── eslint/
│           ├── tsconfig/
│           └── prettier/
├── docs/
│   ├── architecture/
│   ├── superpowers/
│   │   ├── plans/
│   │   └── specs/
│   └── snapshot/
└── README.md
```

---

## Chunk 1: Establish Workspace Foundation

### Task 1: Introduce a root workspace manifest

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `README.md` section for workspace commands if the current setup notes become misleading

- [ ] **Step 1:** Add a root `package.json` that exposes workspace-level scripts such as `dev`, `build`, `lint`, `typecheck`, and `test` using workspace filters.
- [ ] **Step 2:** Add `pnpm-workspace.yaml` with `apps/*` and `packages/*` members so shared packages resolve consistently.
- [ ] **Step 3:** Define a minimal root script strategy that delegates to each app instead of moving all commands into one package immediately.
- [ ] **Step 4:** Document the new workspace commands in the root README so developers know which folder owns which command.
- [ ] **Step 5:** Run workspace discovery commands from the root and verify package resolution works before touching source code.

### Task 2: Add shared base config package

**Files:**
- Create: `packages/config/package.json`
- Create: `packages/config/tsconfig/base.json`
- Create: `packages/config/tsconfig/react.json`
- Create: `packages/config/tsconfig/node.json`
- Create: `packages/config/eslint/base.js`
- Create: `packages/config/prettier/base.cjs`

- [ ] **Step 1:** Add a config package that exports base TS and lint rules instead of duplicating them per app.
- [ ] **Step 2:** Keep the base config intentionally small: module resolution, strictness, and shared lint defaults only.
- [ ] **Step 3:** Prepare app-level config files to extend these bases in later chunks without changing behavior yet.
- [ ] **Step 4:** Validate the new config files with a dry run of the existing linters/typecheckers after wiring them.

---

## Chunk 2: Extract Shared Contracts and Clients

### Task 3: Create shared contracts package

**Files:**
- Create: `packages/contracts/package.json`
- Create: `packages/contracts/src/index.ts`
- Create: `packages/contracts/src/auth/*.ts`
- Create: `packages/contracts/src/poi/*.ts`
- Create: `packages/contracts/src/tour/*.ts`
- Create: `packages/contracts/src/user/*.ts`

- [ ] **Step 1:** Inventory the DTOs and enums that are duplicated across admin, mobile, and API.
- [ ] **Step 2:** Move only stable request/response shapes into `packages/contracts`; leave server-only validation and persistence details in API modules.
- [ ] **Step 3:** Export contracts through a single package entrypoint so all apps import from the same source of truth.
- [ ] **Step 4:** Update backend and frontend imports to use the new package instead of local duplicate type declarations.
- [ ] **Step 5:** Run typecheck/build on the packages that consume these contracts to catch drift early.

### Task 4: Create shared API client package

**Files:**
- Create: `packages/api-client/package.json`
- Create: `packages/api-client/src/index.ts`
- Create: `packages/api-client/src/http.ts`
- Create: `packages/api-client/src/auth.ts`
- Create: `packages/api-client/src/poi.ts`
- Create: `packages/api-client/src/tour.ts`
- Create: `packages/api-client/src/profile.ts`

- [ ] **Step 1:** Extract the shared Axios setup and auth header logic into a reusable HTTP wrapper.
- [ ] **Step 2:** Split clients by domain rather than by app so admin and mobile can share the same request logic.
- [ ] **Step 3:** Type each client against `packages/contracts` to keep response shapes aligned.
- [ ] **Step 4:** Leave app-specific adapters in the apps themselves if a workflow truly differs by runtime.
- [ ] **Step 5:** Verify that the package works in both browser and React Native contexts without platform-specific imports leaking in.

### Task 5: Finish localization package consolidation

**Files:**
- Modify: `packages/localization-shared/src/index.ts`
- Modify: `packages/localization-shared/src/client.ts`
- Modify: `apps/mobile/i18n/index.ts`
- Modify: `apps/mobile/i18n/locales/en.json`
- Modify: `apps/mobile/i18n/locales/vi.json`

- [ ] **Step 1:** Make `packages/localization-shared` the only public localization API for POI language data and request flows.
- [ ] **Step 2:** Move any remaining resource files or helper logic out of `apps/mobile/i18n` only if they are not UI copy specific.
- [ ] **Step 3:** Replace mobile-local localization imports with package imports and confirm the Expo app still initializes correctly.
- [ ] **Step 4:** Remove duplicate locale wiring only after the new path is confirmed working in development.

---

## Chunk 3: Re-home App Code Around Clear Boundaries

### Task 6: Normalize admin app folder responsibilities

**Files:**
- Modify: `apps/admin/src/pages/**/*`
- Modify: `apps/admin/src/services/**/*`
- Modify: `apps/admin/src/hooks/**/*`
- Modify: `apps/admin/src/components/**/*`
- Create: `apps/admin/src/features/**`
- Create: `apps/admin/src/shared/**`

- [ ] **Step 1:** Split admin code into feature-oriented folders so page files only orchestrate UI and feature-specific state.
- [ ] **Step 2:** Move reusable service logic out of page files into `src/features/<domain>/api` or `src/shared` depending on ownership.
- [ ] **Step 3:** Keep generic UI building blocks in `src/components` and domain UI in `src/features`.
- [ ] **Step 4:** Update import paths so the admin app reads like a composition layer rather than a dumping ground.
- [ ] **Step 5:** Confirm the existing modified admin files still build after path changes.

### Task 7: Normalize mobile app folder responsibilities

**Files:**
- Modify: `apps/mobile/app/**/*`
- Modify: `apps/mobile/services/**/*`
- Modify: `apps/mobile/components/**/*`
- Modify: `apps/mobile/context/**/*`
- Modify: `apps/mobile/utils/**/*`
- Create: `apps/mobile/src/features/**`
- Create: `apps/mobile/src/shared/**`

- [ ] **Step 1:** Move business logic and data access out of route files under `app/` into `src/features` or `src/services`.
- [ ] **Step 2:** Keep `app/` as routing and screen composition only.
- [ ] **Step 3:** Consolidate global state, API helpers, and utilities into `src/shared` where multiple screens consume them.
- [ ] **Step 4:** Replace any mobile-local duplicated client logic with the new shared packages.
- [ ] **Step 5:** Smoke-test the Expo app after each sub-move so route resolution and metro imports stay intact.

### Task 8: Tighten backend module layout

**Files:**
- Modify: `apps/api/src/modules/**/*`
- Modify: `apps/api/src/common/**/*` or `apps/api/src/shared/**/*` if present
- Modify: `apps/api/src/app.module.ts`
- Modify: `apps/api/prisma/schema.prisma` only if contract extraction reveals duplication that belongs in schema

- [ ] **Step 1:** Leave Nest modules as the primary domain boundary, but move any cross-cutting helpers into a clearly named shared backend area.
- [ ] **Step 2:** Stop re-declaring contract shapes in controllers and services when they can come from `packages/contracts`.
- [ ] **Step 3:** Keep persistence-specific logic inside Prisma service layers; keep orchestration in module services.
- [ ] **Step 4:** Update module imports and dependency wiring only after the shared contracts package is stable.
- [ ] **Step 5:** Run API tests and typecheck to confirm the refactor did not change runtime behavior.

---

## Chunk 4: Docs, Cleanup, and Verification

### Task 9: Document the target structure

**Files:**
- Create: `docs/architecture/project-structure.md`
- Modify: `README.md`

- [ ] **Step 1:** Add the final target tree and explain what belongs in each top-level folder.
- [ ] **Step 2:** Document import rules: apps import packages, packages do not import apps, backend modules own domain rules.
- [ ] **Step 3:** Update setup instructions so developers know which workspace command to run from the root.
- [ ] **Step 4:** Keep the document short enough that it will actually be read.

### Task 10: Remove obsolete duplicates and verify

**Files:**
- Delete or modify only after successful migration: duplicate service files, duplicate locale wiring, redundant config files, stale README notes.

- [ ] **Step 1:** Remove dead code only after all imports have moved and builds pass.
- [ ] **Step 2:** Delete duplicate config or helper files that no longer have callers.
- [ ] **Step 3:** Run the root workspace checks plus each app-specific build/lint/typecheck command that is affected by the migration.
- [ ] **Step 4:** Capture any remaining rough edges as follow-up work instead of expanding scope inside the same refactor.
- [ ] **Step 5:** Commit the structural cleanup in small batches so regressions are traceable.

---

## Verification Commands

| Command | Purpose |
| --- | --- |
| `pnpm install` | Resolve the new workspace graph after the root manifest exists. |
| `pnpm -r typecheck` | Catch contract drift across apps and packages. |
| `pnpm -r lint` | Verify shared config migration and import cleanup. |
| `pnpm --filter api test` | Ensure backend behavior still passes after contract extraction. |
| `pnpm --filter admin build` | Confirm the web app compiles after import path changes. |
| `pnpm --filter mobile start` | Smoke-test the Expo app routing and shared client imports. |

---

## Notes

- Keep the refactor incremental: shared packages first, then app re-homing, then cleanup.
- Do not move unrelated modified files until their owning chunk is active.
- Prefer package boundaries that are easy to explain: contracts, clients, localization, and config.
- If a folder cannot justify its own responsibility in one sentence, it probably belongs somewhere else.