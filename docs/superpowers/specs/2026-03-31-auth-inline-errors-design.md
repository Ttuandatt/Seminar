# Map-First Auth Inline Errors & UX Refresh

## 1. Background & Goals
- **Context:** Tourist users start on the map screen, but need to log in or register to track history/favorites. Current forms rely on modal alerts, have string bugs (e.g., `register..loginNow`), and treat server errors as generic failures (409 shown as "Registration failed").
- **Goal:** Keep dedicated login/register screens but deliver friendly inline validation, a reliable register flow, and polished copy/visual hierarchy so tourists can recover quickly if their email already exists.
- **Success Criteria:**
  1. Duplicate email (409) highlights the email field with contextual copy in < 1s, without popping the legacy alert.
  2. Validation failures (missing fields, weak password) surface inline before API calls.
  3. System/network outages show a single lightweight banner; users can retry without dismissing modals.

## 2. In-Scope
- Register (`apps/mobile/app/register.tsx`) and Login (`apps/mobile/app/login.tsx`) screens.
- `authService` and any helper to normalize Axios errors.
- i18n copy fixes for `register.hasAccount`, `register.loginNow`, etc.
- Basic visual refresh (spacing, disabled states) consistent with existing style guide.

## 3. Out of Scope
- Changing navigation stack (remain full-screen forms, not map-bottom sheets).
- Social sign-in, OTP, or multi-step onboarding.
- Server-side password/email policies (already enforced in Nest, only surfaced better).

## 4. User Flows
### 4.1 Register
1. User opens register screen from map CTA.
2. Enters full name, email, password.
3. Client validation runs on blur and submit.
4. On submit:
   - If local errors exist → inline chips + disable submit.
   - If no local errors → call `authService.register`.
5. Response handling:
   - `201 OK` → show existing success alert + route to login.
   - `409` → inline email error ("Email đã được sử dụng. Đăng nhập?" with link).
   - Network/500 → banner at top; button re-enabled.

### 4.2 Login
Similar flow; invalid credentials flag the relevant field (password) inline, while account-locked errors show both inline text and optional info link.

## 5. Experience Design
- **Layout:** Keep current headers, but add helper subtitle ("Tạo tài khoản để lưu lịch sử chuyến đi"). Inputs maintain 16px gap; error captions add 6px margin.
- **Inline Error Component:**
  - Props: `message`, `actionLabel?`, `onAction?`.
  - Renders below input inside form container, red text (#ef4444), optional CTA button.
- **System Banner:**
  - When `formError` exists, show small rounded rectangle at top (`#fef2f2` background, `#b91c1c` text) with retry hint.
- **Buttons:** Primary CTA remains `#0C4A6E` or existing blue, but disabled state reduces opacity + removes shadow. Loading state shows spinner and text "Đang xử lý…".

## 6. Validation & Error Mapping
| Case | Detection | Display |
| --- | --- | --- |
| Empty fields | On blur + submit | Inline message under field |
| Password policy (uppercase/lowercase/number, length ≥8) | RegEx client-side, mirrored from server message | Inline under password |
| Duplicate email | Axios 409 + message includes "Email already registered" | Inline under email with CTA to Login |
| Invalid credentials (login) | 401 from server | Inline under password ("Email hoặc mật khẩu không đúng") |
| Account locked | 401 with message containing "locked" | Inline summary + optional info text |
| Network/server | Axios `code === 'ECONNABORTED'` or status ≥500 | Top banner |

Implementation detail: build `normalizeAuthError(error): AuthFormError[]` returning array of `{field?: 'email'|'password'|'fullName', message, action?}`; UI consumes first matching entry per field.

## 7. Copy & i18n Updates
- Ensure `register.hasAccount`, `register.loginNow`, `login.noAccount`, `login.registerNow` have proper strings in `i18n` resources; use string interpolation instead of concatenated keys.
- Add translations for new error messages (duplicate email, weak password explanation, network retry text).

## 8. Technical Notes
- Keep `authService.register` payload unchanged except ensuring we pass trimmed values.
- Add small helper `trimAndNormalizeEmail(email: string)` to lower-case domain and strip spaces.
- Stick to existing dependencies; no new form libraries.
- Shared UI bits (error caption, banner) can live in `components/FormFieldError.tsx` and `components/FormBanner.tsx` for reuse.

## 9. Testing Plan
- Unit-ish tests via manual QA in Expo Go:
  1. Register with blank fields → inline prompts appear before network.
  2. Register with weak password (e.g., `password`) → inline constraint error.
  3. Register with existing email (seeded) → inline duplicate message + login CTA navigates correctly.
  4. Disable network → ensure banner shows and form remains editable.
  5. Login wrong password → inline error on password only.

## 10. Risks & Mitigations
- **Risk:** Server message format changes could break mapping. → Fallback to generic inline text if pattern not matched.
- **Risk:** Inline CTA to login might stack navigation history oddly. → Use `router.replace('/login')` to avoid extra stack entries.
- **Risk:** New components increasing bundle size. → Components are tiny, shared between two screens.
