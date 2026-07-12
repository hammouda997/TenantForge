# How TenantForge Helps Your Career

This project is designed to move you from **"2 years experience, good stack"** to **"lead-level engineer with proof."**

## What recruiters and hiring managers look for

| Signal | Your CV before | With TenantForge |
|--------|----------------|------------------|
| Flagship OSS project | 16 repos, 0–1 stars | One polished monorepo with docs, CI, live demo |
| System design | Implied from job titles | Demonstrated: multi-tenancy, RBAC, billing, audit |
| Full-stack depth | Listed technologies | End-to-end: Prisma → NestJS → Next.js → Docker |
| Lead indicators | Mentoring, code reviews | Architecture docs, extracted libraries, CONTRIBUTING |
| Remote/US-EU readiness | Tunisia-based, local projects | Patterns US startups use daily (Stripe, JWT, monorepo) |

## Interview stories you can tell

1. **Tenancy model** — "Every API call is scoped by `x-organization-id`. A TenantGuard validates membership before any query runs."
2. **Stripe webhooks** — "Checkout creates a session; webhooks update subscription state idempotently with signature verification."
3. **Audit trail** — "Every mutation writes an immutable AuditLog row — enterprise buyers care about this."
4. **Component library** — "I extracted `@tenantforge/ui` with reusable StatCard, PageHeader, StatusBadge — same pattern I used at Hero Labs migrating to Next.js."
5. **DevOps** — "GitHub Actions runs migrate + typecheck + test + build on every PR."

## Salary / role impact (realistic)

| Target | Why TenantForge helps |
|--------|----------------------|
| **Senior Full-Stack** (EU remote) | Shows you ship production SaaS, not CRUD tutorials |
| **Tech Lead** (startup) | Monorepo + RBAC + billing = platform thinking |
| **US remote** (harder from TN) | OSS + live demo + English docs = credibility boost |
| **Freelance / consulting** | Fork TenantForge for client SaaS MVPs |

## What to do with it

1. **Push to GitHub** → pin on profile
2. **Deploy live demo** → put URL on CV and LinkedIn
3. **LinkedIn post** → "Built open-source multi-tenant SaaS platform" with architecture diagram
4. **In interviews** → screen-share the repo, walk through tenancy + billing
5. **Extend it** → add Playwright E2E, publish `@tenantforge/ui` to npm

## Mock data = better demos

Rich seed data means:

- Recruiters see a **real product**, not empty screens
- You can demo **org switching**, **team roles**, **tasks**, **audit log** in 2 minutes
- Screenshots/GIF for README look professional

Run `pnpm db:seed` anytime to reset demo data.
