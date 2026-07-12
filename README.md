# TenantForge

**Production-grade multi-tenant SaaS starter** — NestJS API, Next.js App Router, Prisma, Stripe billing, RBAC, audit logs, and real-time notifications in one Turborepo.

[![CI](https://github.com/hammouda997/TenantForge/actions/workflows/ci.yml/badge.svg)](https://github.com/hammouda997/TenantForge/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-API-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs&logoColor=white)](https://nextjs.org/)

Built as an open-source **reference architecture** for full-stack engineers who want a real B2B SaaS foundation — not a toy CRUD demo.

---

## Why TenantForge?

Most SaaS starters stop at auth and a dashboard shell. TenantForge goes further:

| Capability | What you get |
|------------|--------------|
| **True multi-tenancy** | Users ↔ orgs via memberships; every org-scoped request validated with `x-organization-id` |
| **RBAC that holds up** | Owner → Admin → Member → Viewer, enforced at guard + service boundaries |
| **Billing you can demo** | Stripe Checkout, Customer Portal, webhooks — plus a local **mock billing mode** |
| **Compliance-ready trail** | Immutable audit logs on mutations (auth, billing, org changes) |
| **Live product feel** | WebSocket notifications with an in-app bell |
| **Shared contracts** | Zod schemas in a workspace package used by API and web |

Clone it, seed it, and walk through a complete multi-tenant product in under five minutes.

---

## Screenshots

> Add screenshots after deploy (landing, dashboard, billing, audit).

| Landing | Dashboard | Billing |
|---------|-----------|---------|
| _Coming soon_ | _Coming soon_ | _Coming soon_ |

---

## Tech stack

| Layer | Stack |
|-------|--------|
| Monorepo | Turborepo · pnpm workspaces |
| API | NestJS · Prisma · PostgreSQL · Redis · JWT · Socket.IO · Stripe |
| Web | Next.js 15 (App Router) · React Query · Tailwind CSS · GSAP |
| Shared | `@tenantforge/validation` (Zod) · `@tenantforge/ui` |
| Ops | Docker Compose · GitHub Actions CI · OpenAPI / Swagger |

---

## Quick start

### Prerequisites

- Node.js **20+**
- pnpm **9+**
- Docker (PostgreSQL + Redis)

### 1. Clone & install

```bash
git clone https://github.com/hammouda997/TenantForge.git
cd TenantForge
pnpm install
```

### 2. Environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Match `DATABASE_URL` / `REDIS_URL` ports to your Compose mapping if they differ from the examples (this repo often maps Postgres → `5435`, Redis → `6381` when host ports are busy).

Keep `BILLING_MOCK_MODE=true` for local Stripe-free billing demos.

### 3. Infrastructure & database

```bash
docker compose -f docker/docker-compose.yml up postgres redis -d

pnpm db:migrate
pnpm db:seed
```

### 4. Run

```bash
pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:3000 |
| API | http://localhost:4000/api/v1 |
| Swagger | http://localhost:4000/api/docs |

### Demo login

```
Email:    demo@tenantforge.dev
Password: Password123!
```

Seed includes multiple users, two organizations, projects, tasks, notifications, audit events, and a mock subscription.

---

## Features

- **Organizations & switching** — Belong to multiple orgs; switch context without re-login
- **Member invites & roles** — Invite by email; promote / demote within RBAC rules
- **Projects & tasks** — Tenant-scoped demo domain with comments and assignees
- **Stripe subscriptions** — Starter / Pro plans, checkout, portal, webhook handler
- **Mock billing** — Full subscribe / cancel flow locally without Stripe keys
- **Audit log** — Who did what, when, with metadata — per organization
- **Notifications** — Persisted + pushed over Socket.IO
- **Typed validation** — Strict Zod DTOs; unknown fields rejected on sensitive routes
- **CI pipeline** — Lint, typecheck, test, and build on every push

---

## Repository structure

```
tenantforge/
├── apps/
│   ├── api/                 # NestJS REST + WebSocket API
│   └── web/                 # Next.js customer app
├── packages/
│   ├── validation/          # Shared Zod schemas & types
│   ├── ui/                  # Shared UI primitives
│   └── config/              # Shared TypeScript / tooling configs
├── docker/                  # Compose + production Dockerfiles
├── docs/                    # Architecture & deployment guides
└── .github/workflows/       # CI
```

---

## Architecture (short)

```
Browser (Next.js)
   │  REST + JWT
   │  x-organization-id
   ▼
NestJS API ──► PostgreSQL (Prisma)
     │
     ├── Redis (sessions / cache as needed)
     ├── Socket.IO (notifications)
     └── Stripe (billing + webhooks)
```

**Tenancy model**

1. Authenticate → access + refresh tokens  
2. Send `Authorization: Bearer <token>` and `x-organization-id: <orgId>`  
3. `TenantGuard` verifies membership; `RolesGuard` enforces role hierarchy  
4. Queries are always scoped to the active organization  

Details: [docs/architecture.md](docs/architecture.md)

---

## API overview

Org-scoped routes expect:

```http
Authorization: Bearer <access_token>
x-organization-id: <organization_id>
```

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register` · `/login` · `/refresh` · `/logout` |
| Organizations | `GET/POST /organizations` |
| Members | `GET /members` · `POST /members/invite` |
| Billing | `GET /billing/subscription` · `POST /billing/checkout` · portal + webhooks |
| Audit | `GET /audit` |
| Projects / tasks | CRUD under `/projects` and `/projects/:id/tasks` |

Interactive docs: http://localhost:4000/api/docs

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Run API + web in watch mode |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | TypeScript across the monorepo |
| `pnpm test` | Unit tests |
| `pnpm db:migrate` | Prisma migrate (dev) |
| `pnpm db:seed` | Seed demo data |
| `pnpm db:studio` | Prisma Studio |

---

## Deployment

**Live demo setup:** one Docker container + [Neon](https://neon.tech) Postgres (no Railway). Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

```bash
docker build -f docker/Dockerfile -t tenantforge .

docker run --rm -p 8080:8080 \
  -e DATABASE_URL="postgresql://...@...neon.tech/neondb?sslmode=require" \
  -e JWT_ACCESS_SECRET="change-me-access-secret-min-32-chars" \
  -e JWT_REFRESH_SECRET="change-me-refresh-secret-min-32-chars" \
  -e BILLING_MOCK_MODE=true \
  tenantforge
```

Or connect GitHub → [Render](https://render.com) Blueprint (`render.yaml`) and paste your Neon `DATABASE_URL`.

Local apps only (Postgres/Redis via Compose):

```bash
docker compose -f docker/docker-compose.yml up postgres redis -d
pnpm db:migrate && pnpm db:seed && pnpm dev
```

---

## Related packages

Patterns extracted for reuse:

| Package | Purpose |
|---------|---------|
| [nestjs-tenant-guard](https://github.com/hammouda997/nestjs-tenant-guard) | Tenant isolation guards & decorators |
| [next-saas-starter-ui](https://github.com/hammouda997/next-saas-starter-ui) | SaaS UI shell for Next.js |
| [saas-docker-ci-kit](https://github.com/hammouda997/saas-docker-ci-kit) | Docker + GitHub Actions templates |

---

## Contributing

Issues and PRs are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) and the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

[MIT](LICENSE) © [Hammouda Msaad](https://github.com/hammouda997)

---

**Star the repo** if TenantForge helps you ship — or fork it as the base for your next SaaS.
