# Frontend — Claude Code Guide

## Project Overview

Nexora's frontend is a dark-first social media platform built with React + Vite. Users can create posts, comment, and interact in real-time. The app communicates exclusively through a GraphQL API using Apollo Client.

## Tech Stack

- **React + Vite** — UI framework and build tool
- **TypeScript** — strict mode enabled
- **TailwindCSS** — utility-first styling, no custom CSS
- **Apollo Client** — GraphQL data fetching and caching
- **ShadCN UI** — base component library
- **React Hook Form** — form state management
- **React Context + Reducer** — auth/session state

## Key Documents

- **Architecture**: `docs/architecture.md` — project structure, feature-first conventions, data fetching rules, state management, form patterns, and testing setup.
- **System Design**: `docs/system_design.md` — authoritative UI/UX reference: color tokens, typography scale, spacing, component patterns, iconography, motion, accessibility, and dark mode guidelines.

Read both documents before implementing any new feature or component.

## Package Manager

Use **yarn** for all installs and scripts.

## Commands

Run from `frontend/`:

```bash
yarn dev        # Start dev server
yarn build      # Production build
yarn typecheck  # Type-check without emitting
yarn lint       # ESLint
yarn test       # Run Vitest
```

## Quick Rules

- Follow the feature-first structure: `src/features/<feature>/{api,components,hooks,state,utils}/`
- Never call GraphQL directly from components — use hooks in the feature's `api/` layer
- All forms use React Hook Form + ShadCN `Form` components
- All colors must reference CSS variable tokens — no raw hex or rgb values
- Base UI components live in `src/shared/components/ui/`
