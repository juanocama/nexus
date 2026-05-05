# Nexus - Agent Instructions

## Project Overview
Carpooling app for Universidad de La Sabana. Monorepo with NestJS backend (`api/`) and Expo frontend (`app/`).

## Essential Commands

### Backend (api/)
```bash
cd api && npm install
cp .env.example .env          # Must create .env before running
npm run start:dev             # Hot-reload dev server on :3000
```

### Frontend (app/)
```bash
cd app && npm install
npx expo start                # Expo dev server
```

### Database
```bash
psql -U postgres -c "CREATE DATABASE nexus;"
psql -U postgres -d nexus -f database/schema.sql
```

## Critical Setup Rules

1. **`synchronize: false`** — TypeORM sync is OFF. Schema is managed via `database/schema.sql`. Do NOT enable synchronize or use TypeORM migrations for now.
2. **API URL** — `app/src/utils/config.ts` has a hardcoded IP (`192.168.1.2`). Must be updated to match the dev machine's local IP.
3. **No tests** — No test suites exist in either package. Do not attempt to run tests.
4. **Auth response shape** — Backend returns flat `{ accessToken, expiresIn, id, email, full_name, ... }`, NOT `{ user: {...} }`. `AuthContext.login()` expects this flat shape.
5. **Domain validation** — Only `@unisabana.edu.co` emails allowed. Hardcoded in `auth.service.ts` and validated on register/login.

## Architecture Notes

- **DB schema**: `database/schema.sql` is the single source of truth. Contains all tables + views. Run manually on fresh installs.
- **Auth flow**: JWT only (no refresh tokens yet). Microsoft OAuth is a stub (`verifyMicrosoftToken` returns mock email).
- **Frontend screens**: All UI exists in `app/app/` using expo-router. Most screens use **mock data** — only login/register connect to the backend via `app/src/api/auth.ts`.
- **API client**: `app/src/api/auth.ts` is the only API integration. Other modules (trips, bookings, etc.) have no frontend client yet.
- **Headers**: All screens with custom headers need `Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + spacing : spacing` for paddingTop. Pattern already applied.

## Conventions

- Spanish UI text, English code identifiers
- Colors/theming in `app/src/theme/colors.ts`
- Font: Manrope (loaded via `@expo-google-fonts/manrope`)
- `*.docx` files in root are design docs, tracked but not code-relevant
