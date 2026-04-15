# Nexora Backend — CLAUDE.md

## Documentation References

Before implementing any new feature, read the relevant docs:

- **Architecture patterns, layers, and conventions** → [`docs/architecture.md`](docs/architecture.md)
- **Environment variables, validation rules, and naming** → [`docs/environment.md`](docs/environment.md)

---

## Tech Stack

- **Runtime**: Node.js 22, TypeScript (strict mode, ES2022, CommonJS)
- **Framework**: Express 5 + Apollo Server 5 (`@apollo/server`)
- **Database**: MongoDB via Mongoose 9
- **Auth**: JWT (`jsonwebtoken`), bcrypt 6, SHA-256 pre-hashing
- **Validation**: Zod 4
- **Logging**: Winston with daily-rotate-file
- **Tooling**: tsx (dev), tsc + tsc-alias (build), ESLint + Prettier

---

## Project Structure

```
src/
├── config/           # environment.ts (zod), database.ts, settings.ts
├── dtos/             # Request/Response data transfer objects
├── exceptions/       # AppException hierarchy (index.ts re-exports all)
├── graphql/
│   ├── mutations/    # Mutation implementations
│   ├── queries/      # Query implementations
│   ├── resolvers/    # Resolver maps (merged in mutation.resolver.ts)
│   ├── context.ts    # GraphQL context type + createContext factory
│   ├── typeDefs.ts   # Full GraphQL schema string
│   └── with-error-handling.ts  # HOF wrapping resolvers
├── models/           # Mongoose schemas and models
├── repositories/     # (future) Repository pattern implementations
├── services/
│   ├── interfaces/   # IService interfaces
│   └── *.service.ts  # Implementations
├── types/            # api-response.ts and shared TS types
├── utils/            # auth.ts (JWT), crypto.ts (hashing), logger.ts
└── server.ts         # Entry point
```

---

## Key Conventions

### Path Alias
All internal imports use the `@/` alias (maps to `src/`). Never use relative paths like `../../`.

### Package Manager
Use **yarn** for all installs and scripts. Never use npm.

### Naming Conventions
| Layer | File pattern | Example |
|---|---|---|
| Model | `src/models/<entity>.model.ts` | `user.model.ts` |
| Repository | `src/repositories/<entity>.repository.ts` | `user.repository.ts` |
| Service impl | `src/services/<name>.service.ts` | `auth.service.ts` |
| Service interface | `src/services/interfaces/<name>.service.interface.ts` | `auth.service.interface.ts` |
| DTO | `src/dtos/<action>-<type>.dto.ts` | `login-request.dto.ts` |
| Exception | `src/exceptions/<name>.exception.ts` | `not-found.exception.ts` |

---

## Architecture Layers (summary — see `docs/architecture.md` for full detail)

**Request flow**: GraphQL Resolver → Service → Model (Mongoose)

- **Resolvers** are thin controllers — they read from `context.dataSources` and delegate to services.
- **Services** hold all business logic and implement a typed interface.
- **Models** define the Mongoose schema. No raw `mongoose.model` calls outside `models/`.
- **Repositories** (planned) will abstract data access. Use them once introduced.

---

## GraphQL Context

Defined in `src/graphql/context.ts`. The `GraphQLContext` type exposes:
- `res` — Express response (used for setting cookies)
- `dataSources` — all service instances: `authService`, `userService`, …

To add a new service, instantiate it inside `createContext` and add it to `dataSources`. Update the `GraphQLContext` type accordingly.

---

## Error Handling

Always wrap resolver bodies with `withErrorHandling` from `@/graphql/with-error-handling.ts`.

Throw typed exceptions from `@/exceptions`:

```typescript
import { NotFoundException, ConflictException } from '@/exceptions';

someResolver: withErrorHandling(async (_, args, context) => {
  const item = await context.dataSources.someService.findById(args.id);
  if (!item) throw new NotFoundException('Item not found');
  return item;
});
```

Available exceptions: `BadRequestException (400)`, `UnauthorizedException (401)`, `ForbiddenException (403)`, `NotFoundException (404)`, `ConflictException (409)`.

Never catch and manually map errors in resolvers — that is `withErrorHandling`'s job.

---

## Environment Variables

All env vars are validated at startup via Zod in `src/config/environment.ts`. Access them through the exported `env` object — **never use `process.env` directly** in business logic.

Rules (see `docs/environment.md` for full list):
- Never hardcode env values.
- Add every new variable to `.env.example`.
- Validate required variables in the Zod schema with `.min(1)` or the appropriate type.

Current variables: `MONGODB_URI`, `NODE_ENV`, `APP_PORT`, `LOG_LEVEL`, `LOG_SILENT`, `CORS_ORIGIN`, `ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`.

---

## Authentication Utilities (`src/utils/auth.ts`)

- `createAccessToken(info)` — HS512 JWT, 15-min expiry (configured in `src/config/settings.ts`)
- `createRefreshToken(info)` — HS512 JWT, 7-day expiry
- `createHashForRefreshToken(token)` — SHA-512 HMAC; always store this hash, never the raw token

Password hashing (`src/utils/crypto.ts`):
- `hashPassword(plain)` — SHA-256 pre-hash → bcrypt 12 rounds (prevents 72-byte truncation)
- `comparePassword(plain, stored)` — use this; never roll your own comparison

---

## Logging (`src/utils/logger.ts`)

Use the exported `logger` instance:

```typescript
import logger from '@/utils/logger';

logger.info('User registered', { userId });
logger.error('Unexpected failure', error);
```

Levels (highest → lowest): `error`, `warn`, `info`, `http`, `verbose`, `query`, `debug`, `silly`. Controlled by `LOG_LEVEL` env var.

---

## Adding a New Feature — Checklist

1. **Model** (if new entity): `src/models/<entity>.model.ts` — define Mongoose schema, export default model.
2. **DTO(s)**: `src/dtos/<action>-<type>.dto.ts` for request and response shapes.
3. **Service interface**: `src/services/interfaces/<name>.service.interface.ts`.
4. **Service implementation**: `src/services/<name>.service.ts` — imports model directly (or repository if available).
5. **Register service**: Add to `createContext` in `src/graphql/context.ts` and type in `GraphQLContext`.
6. **typeDefs**: Extend `src/graphql/typeDefs.ts` with new types, inputs, queries, or mutations.
7. **Mutation/Query**: Create `src/graphql/mutations/<name>.mutation.ts` or `src/graphql/queries/<name>.query.ts`. Wrap with `withErrorHandling`.
8. **Resolver map**: Import and spread into the appropriate resolver file (`mutation.resolver.ts` for mutations, etc.).
9. **Env vars** (if needed): Add to `environment.ts` Zod schema and `.env.example`.

---

## Scripts

```bash
yarn dev           # tsx watch + inspect, loads .env.development
yarn build         # tsc + tsc-alias path resolution → dist/
yarn start         # node, loads .env.production
yarn typecheck     # tsc --noEmit
yarn lint          # eslint
yarn lint:fix      # eslint --fix
yarn format        # prettier --write
```
