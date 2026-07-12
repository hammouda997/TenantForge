# Deployment Guide

Deploy TenantForge to production using free-tier friendly hosts.

## Recommended stack

| Component | Host | Why |
|-----------|------|-----|
| Web (Next.js) | [Vercel](https://vercel.com) | Zero-config Next.js, CDN, SSL |
| API (NestJS) | [Railway](https://railway.app) or [Render](https://render.com) | Docker support, env vars |
| PostgreSQL | Railway / Render / [Neon](https://neon.tech) | Managed Postgres |
| Redis | [Upstash](https://upstash.com) | Serverless Redis |

## 1. Database

1. Create a PostgreSQL database (Neon or Railway).
2. Copy the connection string as `DATABASE_URL`.

```bash
pnpm db:migrate   # against production DATABASE_URL
pnpm db:seed      # optional demo data
```

## 2. API (Railway)

1. Connect GitHub repo `hammouda997/TenantForge`.
2. Set root directory to `apps/api` or use Docker:
   - Dockerfile: `docker/Dockerfile.api`
   - Build context: repository root
3. Set environment variables:

```
DATABASE_URL=
REDIS_URL=
JWT_ACCESS_SECRET=<random-32+-chars>
JWT_REFRESH_SECRET=<random-32+-chars>
CORS_ORIGIN=https://your-app.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PORT=4000
```

4. Deploy and note the public URL (e.g. `https://tenantforge-api.up.railway.app`).

## 3. Web (Vercel)

1. Import repo, set root directory to `apps/web`.
2. Framework preset: Next.js
3. Environment variables:

```
NEXT_PUBLIC_API_URL=https://tenantforge-api.up.railway.app/api/v1
NEXT_PUBLIC_WS_URL=https://tenantforge-api.up.railway.app
NEXT_PUBLIC_STRIPE_PRICE_STARTER=price_...
NEXT_PUBLIC_STRIPE_PRICE_PRO=price_...
```

4. Deploy.

## 4. Stripe webhooks

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-api-url/api/v1/billing/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## 5. Live demo checklist

- [ ] Landing page loads
- [ ] Register / login works
- [ ] Org switcher shows organizations
- [ ] Projects CRUD works
- [ ] Billing checkout redirects to Stripe (test mode)
- [ ] Swagger docs accessible at `/api/docs`
- [ ] Health check at `/api/v1/health`

## GitHub setup

Repo: https://github.com/hammouda997/TenantForge

1. Code is on `main` — clone with `git clone https://github.com/hammouda997/TenantForge.git`
2. Pin on your profile when ready: `TenantForge` (and satellite repos if published)
3. Confirm GitHub Actions is enabled (CI workflow is in `.github/workflows/ci.yml`)
4. Add repo topics: `saas`, `multi-tenant`, `nestjs`, `nextjs`, `typescript`, `stripe`
