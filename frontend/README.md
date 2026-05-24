# Nexora — Frontend

React 19 client for the Nexora social media platform. Communicates exclusively via GraphQL using Apollo Client.

---

## Tech Stack

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Apollo Client](https://img.shields.io/badge/Apollo_Client-311C87?logo=apollographql&logoColor=white)](https://www.apollographql.com/docs/react/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

---

## Architecture

### Feature-First Structure

The `src/` directory is organized by domain, not by file type:

```
src/
├── app/        # Providers, layouts, router
├── pages/      # Route entry points — thin, composition only
├── features/   # Domain modules (auth, post, profile, settings)
│   └── <feature>/
│       ├── api/        # GraphQL operations
│       ├── components/ # Feature-scoped UI
│       ├── hooks/      # Orchestration logic
│       └── state/      # Local/global state (if needed)
└── shared/     # Cross-feature components, hooks, utils, types
```

Components never call GraphQL directly. Every operation is wrapped in a feature hook that lives in `features/<feature>/hooks/`.

### State Management

Two distinct layers, each owning its domain:

- **Apollo Client** — owns all server state (posts, comments, likes, profiles). The cache is the single source of truth for remote data; components never duplicate it in local state.
- **React Context + Reducer** (`features/auth/state/`) — owns only auth session state (current user, access token). Updated on login, refresh, and logout; drives protected route access.

### GraphQL Codegen

TypeScript types for all queries, mutations, and fragments are generated from the backend schema at build time via GraphQL Codegen. There are no hand-written API response types — the schema is the contract.

### Forms

All forms use `react-hook-form` with ShadCN UI `Form` components and Zod schema validation. Form state is never managed with `useState`.

### Media Uploads

Post and avatar uploads follow a two-step flow: request a presigned S3 URL from the API, then `POST` the file directly to S3 from the browser. The GraphQL mutation is called only after the upload completes, passing the resulting object key.

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- Yarn
- Nexora backend running locally (or pointed at a remote instance)

### Installation

```bash
cd frontend
yarn install
```

### Environment Variables

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend GraphQL endpoint (e.g. `http://localhost:4000/graphql`) |
| `VITE_WS_URL` | Backend WebSocket endpoint for subscriptions (e.g. `ws://localhost:4000/graphql`) |

### Run

```bash
yarn dev      # Vite dev server
yarn build    # Production build → dist/
yarn preview  # Preview production build locally
```

---

## Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start Vite dev server |
| `yarn build` | Type-check + production build |
| `yarn preview` | Preview the production build |
| `yarn typecheck` | Type-check without emitting |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with auto-fix |
| `yarn format` | Format with Prettier |
| `yarn codegen` | Generate TypeScript types from GraphQL schema |
| `yarn test:unit` | Run unit tests with Vitest |
