# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

Nexora is a social media platform split into two independent packages:

```
nexora/
├── backend/   # Node.js + Express 5 + Apollo Server 5 + MongoDB
└── frontend/  # React 19 + Vite + Apollo Client + TailwindCSS
```

Each package has its own `CLAUDE.md` with detailed conventions:

- `backend/CLAUDE.md` — GraphQL schema, service/repository patterns, auth utilities, env vars, feature checklist
- `frontend/CLAUDE.md` — feature-first structure, data fetching rules, state management, form patterns

Always read the relevant package CLAUDE.md before working on that package.

## Package Manager

Use **yarn** in both packages. Never use npm.

## Commands

All commands run from inside the respective package directory.

### Backend (`cd backend`)

```bash
yarn dev          # tsx watch + .env.development
yarn build        # tsc + tsc-alias → dist/
yarn typecheck    # tsc --noEmit
yarn lint         # eslint
yarn format       # prettier --write
```

### Frontend (`cd frontend`)

```bash
yarn dev          # Vite dev server
yarn build        # tsc -b + vite build
yarn typecheck    # tsc -b
yarn lint         # eslint
yarn test:unit    # vitest run
yarn format       # prettier --write
```

## Full-Stack Architecture

The frontend communicates **exclusively via GraphQL** — there are no REST endpoints consumed by the React app. Apollo Client on the frontend maps directly to Apollo Server on the backend.

**Backend request flow**: GraphQL Resolver → Service → Repository → Mongoose Model

**Frontend data flow**: Component → Feature Hook → Apollo operation (`features/<feature>/api/`) → GraphQL API

The `@/` path alias maps to `src/` in both packages.

## Key Design Decisions

- **DataLoaders** (`backend/src/graphql/loaders.ts`) batch all N+1 field resolver queries. Any new field resolver that fetches related data by foreign key must use a loader — never query the model directly from a field resolver.
- **Auth** uses short-lived access tokens (15 min, HS512 JWT) and hashed refresh tokens stored in the DB. Never store raw refresh tokens.
- **Frontend state**: Apollo Client owns all server state; React Context + Reducer (`features/auth/state/`) owns only auth/session state.
- **Env vars** are validated at startup via Zod in `backend/src/config/environment.ts`. Access via the `env` export, never `process.env` directly.
