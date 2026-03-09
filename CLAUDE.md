# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CodeSearching

For searching and exploring the repo use `jcodemunch-mcp` if availabe. If it fails or is not available use bash tools as a fallback.

## Repository Overview

FinoSync is a personal finance management app — a **pnpm monorepo** orchestrated by **Turborepo** with two apps:

- `apps/backend` — Rails 8 API (Ruby, SQLite, API-only mode)
- `apps/mobile` — React Native + Expo mobile app (TypeScript)

Shared packages: `packages/eslint-config`, `packages/typescript-config`

## Common Commands

### Root (Turborepo)

```bash
pnpm dev           # Start all apps in dev mode
pnpm build         # Build all workspaces
pnpm lint          # Lint all workspaces
pnpm check-types   # TypeScript type checking
pnpm format        # Prettier formatting
pnpm api:dev       # Backend only
pnpm db:generate   # Generate DB schemas
```

### Backend (apps/backend)

```bash
cd apps/backend
bundle exec rails server        # Start Rails server
bundle exec rails console       # Rails console
bundle exec rspec               # Run all tests
bundle exec rspec spec/path     # Run single test file
bundle exec rubocop             # Lint Ruby code
bundle exec brakeman            # Security scan
bundle exec rails db:migrate    # Run migrations
bundle exec rails db:seed       # Seed database
bundle exec sidekiq             # Start job queue
```

### Mobile (apps/mobile)

```bash
cd apps/mobile
pnpm start          # Start Expo dev server
pnpm android        # Run on Android
pnpm ios            # Run on iOS
pnpm web            # Run on web
pnpm test           # Run Jest tests
pnpm test path/to/file.test.ts  # Run single test
pnpm lint           # ESLint
```

## Architecture

### Backend (Rails API)

**Authentication:** Session-based via `POST /session` → returns `{ token, user }`. Token passed as Bearer header. Pundit for authorization.

**Key integrations:** Fintoc (banking), Buda (crypto exchange), Fintual (investments), CryptoCompare (crypto prices).

**Financial data:** Money-Rails gem for monetized fields (balance, income, expense, investments_return, quota on User). Paper Trail for audit trail/versioning.

**Background jobs:** Sidekiq + sidekiq-scheduler for cron tasks. Solid Queue also available.

**Response format:** JBuilder views + JSONAPI-Serializer for API responses.

**Routes structure:** `/session`, `/user/*`, `/accounts`, `/transactions`, `/transaction_categories`, `/shopping_lists`, `/charts/data`, `/dashboard`, `/currencies`

### Mobile (React Native + Expo)

**Routing:** Expo Router (file-based). Route groups:

- `(auth)/` — Pre-login: sign-in, sign-up, forgot-password
- `(app)/(drawer)/(tabs)/` — Protected: dashboard, accounts, transactions, cash-flow, budget
- `(app)/` — Protected screens: add-account, add-transaction, shopping/[id], etc.

**State management — two layers:**

1. **Zustand** (`src/utils/store/`) — Client state with slices: `RouterSlice`, `UserSlice`, `AccountSlice`, `TransactionSlice`, `CategorySlice`, `ConfigSlice`. Combined in `store/index.ts`.
2. **React Query** — Server state/caching. `QueryClientProvider` at root layout.
3. **Context API** (`src/context/`) — Supplementary: user-balance, accounts, categories, dashboard, charts, global.

**API layer:** `src/utils/api.ts` — `fetchWithAuth` (adds Bearer token, handles 401 redirects) and `fetchApi` (unauthenticated). Services in `src/services/`.

**Token storage:** `expo-secure-store` for persisting auth token across sessions.

**Styling:** NativeWind 4 (Tailwind for React Native) + Gluestack UI components. Config in `tailwind.config.js` and `gluestack-ui.config.json`.

**i18n:** i18next with English and Spanish, files in `src/app/translations/`.

### Data Flow

```
User Input → Zustand Store update
           → fetchWithAuth (Bearer token)
           → Rails API
           → React Query cache invalidation
           → UI re-render
```

### Auth Flow

```
sign-in.tsx → POST /session → token → expo-secure-store
                                    → Zustand UserSlice
                                    → redirect to dashboard
401 response → logout → clear token → redirect to (auth)/sign-in
```

## Key File Locations

| Purpose                 | Path                                       |
| ----------------------- | ------------------------------------------ |
| API routes              | `apps/backend/config/routes.rb`            |
| Zustand store           | `apps/mobile/src/utils/store/index.ts`     |
| API fetch helpers       | `apps/mobile/src/utils/api.ts`             |
| Auth service            | `apps/mobile/src/services/auth.service.ts` |
| Root layout             | `apps/mobile/src/app/_layout.tsx`          |
| App layout (auth guard) | `apps/mobile/src/app/(app)/_layout.tsx`    |
| TypeScript types        | `apps/mobile/src/types/`                   |
| Backend models          | `apps/backend/app/models/`                 |
| Backend controllers     | `apps/backend/app/controllers/`            |

## Environment Variables (Doppler)

This project uses **Doppler** for secret management. All environment variables are managed in Doppler and injected at runtime — do **not** commit `.env` files with real values.

```bash
# One-time setup
doppler setup          # Authenticate and select project/config

# Run commands with Doppler-injected env vars
doppler run -- bundle exec rails server
doppler run -- bundle exec sidekiq
doppler run -- pnpm start           # mobile (expo)
```

Key env vars (set in Doppler, never in source):

- `FINTOC_SECRET_KEY` — company-wide Fintoc secret (backend only, never expose to mobile)
- `FINTOC_API_KEY` — public key for Fintoc widget (safe to expose, only starts OAuth flow)
- `ACTIVE_RECORD_ENCRYPTION_PRIMARY_KEY` / `DETERMINISTIC_KEY` / `KEY_DERIVATION_SALT` — AR encryption keys, generate with `bundle exec rails db:encryption:init`
- `BUDA_API_KEY` / `BUDA_API_SECRET` — per-app Buda credentials
- `FINTUAL_EMAIL` / `FINTUAL_PASSWORD` — Fintual credentials

Reference: `apps/backend/.env.example` shows all required variables.

## Development Notes

- **pnpm** is the required package manager (v10.5.2+, Node >=18)
- Backend uses **RuboCop Omakase** style — run rubocop before committing Ruby changes
- Mobile uses **ESLint flat config** (`eslint.config.mjs`)
- New React Native Architecture is enabled (React Native 0.79)
- Backend deployment via **Kamal** (Docker-based), config at `apps/backend/.kamal/`
- Run `pnpm sherif` to check for dependency security issues across workspaces
