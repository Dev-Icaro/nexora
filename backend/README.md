# Nexora — Backend

GraphQL API for the Nexora social media platform. Built with Node.js 22, Express 5, Apollo Server 5, and MongoDB.

---

## Tech Stack

[![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Apollo Server](https://img.shields.io/badge/Apollo_Server-311C87?logo=apollographql&logoColor=white)](https://www.apollographql.com/docs/apollo-server/)
[![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)](https://graphql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)
[![Zod](https://img.shields.io/badge/Zod-3E67B1?logo=zod&logoColor=white)](https://zod.dev/)

---

## Architecture

### Request Flow

```
GraphQL Client → Apollo Server → Resolver → Service → Repository → Mongoose Model → MongoDB
```

Resolvers are thin controllers — they read the appropriate service from `context.dataSources` and delegate immediately. All business logic lives in the Service layer. Repositories abstract data access so services never touch Mongoose directly.

### DataLoaders

Every GraphQL field resolver that fetches related data by a foreign key uses a [DataLoader](https://github.com/graphql/dataloader). Loaders batch and deduplicate all `.load(key)` calls within a single request tick into one database query, preventing N+1 problems across nested types (`Post → author`, `Post → comments`, `Post → likes`, `Comment → author`).

All loaders are defined in `src/graphql/loaders.ts` and injected into `GraphQLContext` per request.

### Authentication

- **Access tokens** — HS512 JWT, 15-minute expiry, signed with `ACCESS_TOKEN_SECRET`
- **Refresh tokens** — HS512 JWT, 7-day expiry, stored as a SHA-512 HMAC hash in the database; the raw token is never persisted
- **Passwords** — SHA-256 pre-hashed before bcrypt (12 rounds) to prevent the 72-byte truncation limit from weakening long passwords
- **Password reset** — time-limited signed tokens delivered via email; validated and consumed in a single atomic operation

### Media Uploads

Clients request a presigned S3 POST URL from the API. The upload goes directly from the browser to S3 — the API server is never in the media path. Stored objects are served exclusively through signed CloudFront URLs. Each user has a storage quota enforced at upload-request time.

Production credentials (S3 bucket, CloudFront key pair, SMTP, etc.) are fetched from AWS Secrets Manager at startup — no secrets in environment files.

### Error Handling

All domain errors extend `AppException`, which carries an HTTP-equivalent `statusCode`. Apollo's error formatter maps these to structured GraphQL errors with consistent `code`, `message`, and `success` fields on every response type.

---

## Getting Started

### Prerequisites

- Node.js ≥ 22
- Yarn
- MongoDB instance (local or Atlas)
- AWS account (S3, CloudFront, Secrets Manager) — required for media features

### Installation

```bash
cd backend
yarn install
```

### Environment Variables

Copy the example file and fill in the values:

```bash
cp .env.example .env.development
```

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NODE_ENV` | `development` \| `production` |
| `APP_PORT` | HTTP port (default `4000`) |
| `ACCESS_TOKEN_SECRET` | Secret for signing access JWTs |
| `REFRESH_TOKEN_SECRET` | Secret for signing refresh JWTs |
| `CORS_ORIGIN` | Allowed origin for CORS |
| `LOG_LEVEL` | Winston log level (`info`, `debug`, etc.) |
| `LOG_SILENT` | Set `true` to suppress all log output |

### Run

```bash
yarn dev      # development (tsx watch + .env.development)
yarn start    # production (node + .env.production)
```

---

## Scripts

| Script | Description |
|---|---|
| `yarn dev` | Start dev server with file watching and inspector |
| `yarn build` | Compile TypeScript → `dist/` |
| `yarn start` | Run compiled output (production) |
| `yarn typecheck` | Type-check without emitting |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Run ESLint with auto-fix |
| `yarn format` | Format with Prettier |
| `yarn codegen` | Generate TypeScript types from GraphQL schema |
| `yarn test:unit` | Run unit tests |
| `yarn test:integration` | Run integration tests |
| `yarn test:coverage` | Run tests with coverage report |
