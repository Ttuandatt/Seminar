# Auth Inline Error Handling & UI Refresh — Final Spec

## 1. Overview
- **Goal:** Replace modal Alert-based error handling in register/login with inline, field-centric error chips and a top banner for system errors, using the existing ocean theme colors.
- **Scope:** `apps/mobile/app/register.tsx`, `apps/mobile/app/login.tsx`, shared error/banner components, i18n updates.

## 2. UI Structure
- Each input (Full Name, Email, Password) manages its own error state.
- On validation or server error, the field border color changes to `#F97316` (warning) or `#EF4444` (error), and a small error caption appears below the input.
- Duplicate email (409) → email field shows: “Email đã được sử dụng. Đăng nhập?” with a clickable “Đăng nhập” action.
- System/network errors show a small banner at the top of the form, not a modal.
- All error captions and border colors follow the current ocean theme palette.

## 3. Validation & Error Mapping
- **Client-side:**
  - Empty fields: error under field on blur/submit.
  - Password: regex for at least 1 uppercase, 1 lowercase, 1 number, min 8 chars.
- **Server-side:**
  - 409 (duplicate email): inline under email, with CTA.
  - 401 (invalid login): inline under password.
  - 500/network: top banner, form remains editable.
- **Helper:** `normalizeAuthError(error): AuthFormError[]` returns `{field, message, action?}` for UI.

## 4. Components
- **FormFieldError.tsx:**
  - Props: `message`, `actionLabel?`, `onAction?`.
  - Renders below input, red text, optional CTA.
- **FormBanner.tsx:**
  - Props: `message`, `type` (error/warning/info).
  - Renders at top of form, rounded, theme color.

## 5. i18n
- Fix `register.hasAccount`, `register.loginNow`, `login.noAccount`, `login.registerNow`.
- Add error messages for duplicate email, weak password, network retry.

## 6. Technical Notes
- No new form libraries; keep React state per field.
- Add `trimAndNormalizeEmail(email: string)` helper.
- Use `router.replace('/login')` for login CTA.

## 7. Testing
- Register: blank fields, weak password, duplicate email, network down.
- Login: wrong password, locked account, network down.

## 8. Risks
- Server message format changes → fallback to generic inline text.
- Navigation stack for login CTA → use replace.
- Bundle size: new components are minimal and shared.
