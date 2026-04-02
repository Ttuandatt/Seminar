# Auth Inline Error Handling Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace modal Alert-based error handling in register/login with inline, field-centric error chips and a top banner for system errors, using the existing ocean theme colors.

**Architecture:**
- Add reusable error and banner components for inline and top-form error display.
- Refactor register/login screens to manage per-field error state and system error state.
- Normalize server errors to field errors or banner as appropriate.
- Update i18n resources for new error messages and CTAs.

**Tech Stack:** React Native, TypeScript, Expo, i18next

---

## File Structure
- Create: `apps/mobile/components/FormFieldError.tsx` — Inline error chip component
- Create: `apps/mobile/components/FormBanner.tsx` — Top-of-form error banner
- Modify: `apps/mobile/app/register.tsx` — Refactor to use inline errors, banner, and new error mapping
- Modify: `apps/mobile/app/login.tsx` — Refactor to use inline errors, banner, and new error mapping
- Modify: `apps/mobile/services/authService.ts` — Add error normalization helper
- Modify: `apps/mobile/i18n/[lang].json` — Add/fix error and CTA strings

---

### Task 1: Create FormFieldError Component
**Files:**
- Create: `apps/mobile/components/FormFieldError.tsx`
- [ ] Implement a styled error caption with optional CTA (e.g., "Đăng nhập")
- [ ] Add props: `message`, `actionLabel?`, `onAction?`
- [ ] Use theme error color and spacing
- [ ] Export for use in forms

### Task 2: Create FormBanner Component
**Files:**
- Create: `apps/mobile/components/FormBanner.tsx`
- [ ] Implement a top-of-form banner for system/network errors
- [ ] Add props: `message`, `type` (error/warning/info), `onDismiss?`
- [ ] Use theme colors and rounded style
- [ ] Export for use in forms

### Task 3: Add Error Normalization Helper
**Files:**
- Modify: `apps/mobile/services/authService.ts`
- [ ] Add `normalizeAuthError(error): AuthFormError[]` to map server errors to field or banner errors
- [ ] Handle 409 (duplicate email), 401 (invalid login/locked), 500/network, and fallback
- [ ] Export for use in register/login

### Task 4: Refactor Register Screen
**Files:**
- Modify: `apps/mobile/app/register.tsx`
- [ ] Replace Alert-based errors with per-field error state and FormFieldError
- [ ] Add system error/banner state and FormBanner
- [ ] Use error normalization helper for API errors
- [ ] Add loading/disabled state for submit
- [ ] Ensure email CTA navigates with `router.replace('/login')`
- [ ] Auto-focus/scroll to first error on submit
- [ ] Add accessibility props (aria, roles) to errors and banner

### Task 5: Refactor Login Screen
**Files:**
- Modify: `apps/mobile/app/login.tsx`
- [ ] Replace Alert-based errors with per-field error state and FormFieldError
- [ ] Add system error/banner state and FormBanner
- [ ] Use error normalization helper for API errors
- [ ] Add loading/disabled state for submit
- [ ] Auto-focus/scroll to first error on submit
- [ ] Add accessibility props (aria, roles) to errors and banner

### Task 6: Update i18n Resources
**Files:**
- Modify: `apps/mobile/i18n/vi.json`, `en.json`
- [ ] Add/fix: duplicate email, weak password, network retry, locked account, generic fallback
- [ ] Ensure all CTAs and error captions are present and correct

### Task 7: Manual QA & Testing
**Files:**
- Test: Expo Go/manual
- [ ] Register: blank fields, weak password, duplicate email, network down
- [ ] Login: wrong password, locked account, network down
- [ ] Check accessibility (screen reader, keyboard nav)
- [ ] Verify color and spacing match theme
- [ ] Confirm navigation stack for login CTA

### Task 8: Commit & Review
- [ ] Commit all changes with clear messages
- [ ] Request code review or run automated checks if available
