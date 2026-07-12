# Architecture

## Overview

TenantForge is a multi-tenant B2B SaaS reference platform built as a Turborepo monorepo.

## Tenancy model

- Every user can belong to multiple organizations via `Membership`.
- API requests include `x-organization-id` header after authentication.
- `TenantGuard` validates membership before any org-scoped operation.
- `RolesGuard` enforces RBAC: Owner > Admin > Member > Viewer.

## Data flow

```
Browser (Next.js) → REST API (NestJS) → PostgreSQL (Prisma)
                  ↘ WebSocket (notifications)
                  ↘ Stripe (billing webhooks)
```

## Key modules

| Module | Responsibility |
|--------|----------------|
| auth | JWT access + refresh token rotation |
| organizations | Org CRUD, multi-org switching |
| members | Invites, role management |
| billing | Stripe checkout, portal, webhooks |
| audit | Immutable activity log per org |
| notifications | In-app + WebSocket delivery |
| projects/tasks | Demo domain scoped by org |

## Security

- Rate limiting on auth endpoints
- Stripe webhook signature verification
- Tenant guard on all org-scoped queries
- Zod strict validation (unknown fields rejected)
- bcrypt password hashing (cost factor 12)

## Deployment

See [docker/docker-compose.yml](../docker/docker-compose.yml) for local stack.
Production: deploy API + Web separately; use managed PostgreSQL and Redis.
