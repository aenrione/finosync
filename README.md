# FinoSync

Personal finance management application with multi-account support, transaction tracking, budgeting, and financial insights.

## Features

- 📱 **Multi-Platform**: React Native mobile app with Expo
- 🏦 **Account Aggregation**: Connect bank accounts (Fintoc), crypto exchanges (Buda), and investment platforms (Fintual)
- 💰 **Transaction Management**: Track, categorize, and analyze your spending
- 📊 **Visual Analytics**: Charts for balance trends, spending by category, and account insights
- 🎯 **Budget Planning**: Create budget lists and track purchases
- 🌍 **Multi-Currency**: Support for multiple currencies with real-time conversion
- 🔐 **Secure**: Session-based authentication with bcrypt

## Tech Stack

### Backend

- Ruby on Rails 8.0.2 (API-only)
- SQLite3 database
- Sidekiq for background jobs
- Financial API integrations (Fintoc, Buda, Fintual)

### Mobile

- React Native + Expo SDK 53
- Expo Router for navigation
- Gluestack UI + NativeWind (Tailwind)
- Zustand for state management
- React Query for server state
- i18next for internationalization (EN/ES)

### Monorepo

- pnpm workspaces
- Turborepo for build orchestration
- Shared TypeScript/ESLint configs

## Project Structure

```
finosync/
├── apps/
│   ├── backend/          # Rails API
│   └── mobile/           # React Native app
├── packages/
│   ├── eslint-config/    # Shared linting config
│   └── typescript-config/# Shared TS config
└── turbo.json            # Turborepo config
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 10.5.2
- Ruby 3.x
- Bundler

### Installation

```bash
# Install dependencies
pnpm install

# Backend setup
cd apps/backend
bundle install
bin/rails db:setup

# Run development servers
pnpm dev              # All apps
pnpm api:dev          # Backend only
```

### Environment Variables

Copy `.env.example` files and configure:

- `apps/backend/.env.local` - Rails database and API keys
- `apps/mobile/.env` - Mobile app configuration

## Development

```bash
pnpm dev           # Start all apps in development mode
pnpm build         # Build all apps
pnpm lint          # Lint all workspaces
pnpm check-types   # TypeScript type checking
```

## License

MIT
