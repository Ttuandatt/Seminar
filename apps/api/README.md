# Seminar API

NestJS + Prisma backend powering POI management, translation, and TTS flows for the Seminar platform.

## Prerequisites

- Node.js 20+
- pnpm 8+
- PostgreSQL 15 (local instance or Docker)

Copy `.env.example` to `.env` if needed and set `DATABASE_URL` to your database connection string.

## Local Setup

```bash
cd apps/api
pnpm install
pnpm prisma migrate dev
pnpm prisma db seed
pnpm start:dev
```

`pnpm prisma db seed` runs `prisma/seed.ts`, which now bootstraps the Supported Language registry before inserting demo users/POIs.

## Supported Language Registry

`SupportedLanguage` centralizes every language exposed through the admin portal, mobile app, translation service, and TTS pipeline. Each row exposes:

| Field | Description |
| --- | --- |
| `code` | Lowercase ISO code (e.g., `vi`, `en`, `de`). Serves as primary key. |
| `label` | Friendly name shown in dropdowns. |
| `enabled` | Toggle to hide/show a language in clients without deleting data. |
| `supportsText` | Whether translation APIs can generate localized text. |
| `supportsTts` | Whether TTS providers have a matching voice. |
| `requiresPack` | Indicates that a downloadable offline pack is required before playback. |
| `allowOffline` | Controls whether the client may cache media/text locally. |
| `defaultVoice` / `fallbackVoice` | Provider-specific identifiers used by `TtsService`. |
| `priority` | Sort order for dropdowns (lower number = higher priority). |
| `description` / `region` | Optional metadata rendered in admin dashboards. |

To add or edit languages, update `prisma/seed/languages.seed.ts` (or use the upcoming admin UI) and rerun `pnpm prisma db seed`.

## Helpful Scripts

```bash
pnpm start          # production build
pnpm start:dev      # watch mode
pnpm test           # unit tests
pnpm db:setup       # migrate + seed
pnpm db:reset       # reset database
```

## Testing

```bash
pnpm test         # unit tests
pnpm test:e2e     # e2e tests (requires running API)
pnpm test:cov     # coverage report
```

## Deployment

Run `pnpm build` to emit compiled files in `dist/`, then deploy with your preferred Node.js hosting provider. Ensure database migrations are applied before switching traffic.
