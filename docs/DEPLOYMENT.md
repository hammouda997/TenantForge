# Deployment Guide

Deploy TenantForge as **one website** (single Docker container) with **Neon Postgres**.

Repo: https://github.com/hammouda997/TenantForge

## Architecture

```
Browser  →  https://your-app.onrender.com
                │
              nginx (:PORT)
           ┌────┴────┐
           ▼         ▼
        Next.js    NestJS
         :3000      :4000
                      │
                      ▼
                   Neon Postgres
```

Same origin:
- Web UI: `/`
- API: `/api/v1/...`
- Swagger: `/api/docs`
- WebSockets: `/socket.io/...`

No Railway. Redis is not required for the current API.

---

## 1. Create a Neon database

1. Go to [neon.tech](https://neon.tech) and create a project.
2. Copy the connection string (`DATABASE_URL`).
3. Prefer the **pooled** connection string for serverless hosts if Neon shows both.

From your machine (once), migrate and seed:

```bash
cd TenantForge
# temporarily set production DB
# Windows PowerShell:
$env:DATABASE_URL="postgresql://...@ep-....neon.tech/neondb?sslmode=require"

pnpm --filter @tenantforge/api exec prisma migrate deploy
pnpm db:seed
```

---

## 2. Deploy one container (Render)

### Option A — Blueprint (recommended)

1. Push this repo to GitHub (already done).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect `hammouda997/TenantForge`.
4. Render reads `render.yaml` and creates one Docker web service.
5. Set `DATABASE_URL` to your Neon connection string.
6. Deploy.

### Option B — Manual Docker service

1. **New** → **Web Service** → connect GitHub repo `TenantForge`.
2. Runtime: **Docker**.
3. Dockerfile path: `docker/Dockerfile`.
4. Docker context: repository root (`.`).
5. Instance: Free.
6. Environment variables:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Neon connection string |
| `JWT_ACCESS_SECRET` | long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | long random string (32+ chars) |
| `BILLING_MOCK_MODE` | `true` |
| `SEED_ON_START` | `false` (seed once from your laptop) |
| `PORT` | `8080` (Render may override — entrypoint respects `$PORT`) |

7. Health check path: `/api/v1/health`
8. Deploy and open the public URL.

Migrations run automatically on container start (`prisma migrate deploy`).

---

## 3. Local test of the all-in-one image

```bash
docker build -f docker/Dockerfile -t tenantforge .

docker run --rm -p 8080:8080 \
  -e DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" \
  -e JWT_ACCESS_SECRET="local-access-secret-min-32-characters" \
  -e JWT_REFRESH_SECRET="local-refresh-secret-min-32-characters" \
  -e BILLING_MOCK_MODE=true \
  -e PORT=8080 \
  tenantforge
```

Open http://localhost:8080

---

## 4. After deploy checklist

- [ ] Landing page loads on the Render URL
- [ ] `/api/v1/health` returns `{ "status": "ok" }`
- [ ] `/api/docs` opens Swagger
- [ ] Login with `demo@tenantforge.dev` / `Password123!` (after seed)
- [ ] Dashboard, projects, billing (mock) work
- [ ] Add the live URL to the README

---

## 5. Stripe (optional later)

Keep `BILLING_MOCK_MODE=true` for the portfolio demo.

When you want real Stripe:

1. Set `BILLING_MOCK_MODE=false`
2. Add `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, price IDs
3. Webhook URL: `https://your-app.onrender.com/api/v1/billing/webhook`

---

## Alternative local stack (dev only)

Postgres + Redis via Compose, apps via `pnpm dev`:

```bash
docker compose -f docker/docker-compose.yml up postgres redis -d
pnpm db:migrate && pnpm db:seed && pnpm dev
```

---

## GitHub

1. Repo: https://github.com/hammouda997/TenantForge
2. Pin **TenantForge** on your profile
3. Confirm Actions CI is enabled
4. Topics: `saas`, `multi-tenant`, `nestjs`, `nextjs`, `typescript`, `stripe`
