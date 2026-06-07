<div align="center">
  <img src="docs/assets/logo.png" alt="Nexora" width="100" />

  # Nexora

  A full-stack social media platform built with a GraphQL API, React 19, and Node.js 22.

  [**Live Demo →**](https://nexora.kiiler.com/)

  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## Tech Stack

**Backend** &nbsp; [![Node.js](https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white)](https://nodejs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)](https://expressjs.com/) [![Apollo Server](https://img.shields.io/badge/Apollo_Server-311C87?logo=apollographql&logoColor=white)](https://www.apollographql.com/docs/apollo-server/) [![GraphQL](https://img.shields.io/badge/GraphQL-E10098?logo=graphql&logoColor=white)](https://graphql.org/) [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/) [![AWS](https://img.shields.io/badge/AWS-232F3E?logo=amazonwebservices&logoColor=white)](https://aws.amazon.com/)

**Frontend** &nbsp; [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/) [![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/) [![Apollo Client](https://img.shields.io/badge/Apollo_Client-311C87?logo=apollographql&logoColor=white)](https://www.apollographql.com/docs/react/) [![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) [![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-000000?logo=shadcnui&logoColor=white)](https://ui.shadcn.com/)

---

## Preview

![Nexora Feed](docs/assets/screenshot.png)

---

## Features

- **Authentication** — register, login, logout, and a full password-reset flow via email
- **Feed** — infinite-scroll timeline of posts with cursor-based pagination
- **Posts** — create text and media posts (images); delete your own
- **Real-time** — new posts appear live via GraphQL Subscriptions
- **Interactions** — like and comment on posts
- **Profiles** — bio, position, avatar upload, and per-user media storage quota
- **Settings** — light / dark / system theme preference persisted per account

---

## Architecture

Key engineering decisions behind Nexora:

- **DataLoaders** — all GraphQL field resolvers batch database queries through DataLoader, eliminating N+1 query problems across nested types (`Post → comments`, `Post → likes`, `Comment → author`)
- **JWT + hashed refresh tokens** — access tokens expire in 15 minutes; refresh tokens are SHA-512 HMAC-hashed before storage so a database breach never exposes raw tokens
- **S3 presigned uploads + CloudFront CDN** — media is uploaded directly from the client to S3 via presigned POST URLs and served through signed CloudFront URLs, with per-user storage quota enforcement at the API layer
- **GraphQL Codegen** — TypeScript resolver and client types are generated from the GraphQL schema at build time, ensuring full-stack type safety without manual synchronization between packages
- **AWS Secrets Manager** — all production credentials are fetched from Secrets Manager at runtime; no secrets live in environment files or the repository

See [`backend/README.md`](./backend/README.md) and [`frontend/README.md`](./frontend/README.md) for a deeper dive into each layer.

---

## Getting Started

```bash
git clone https://github.com/your-username/nexora.git
cd nexora
```

Then follow the setup guides for each package:

- [Backend setup →](./backend/README.md#getting-started)
- [Frontend setup →](./frontend/README.md#getting-started)

---

## License

Distributed under the MIT License. See [`LICENSE`](./LICENSE) for details.
