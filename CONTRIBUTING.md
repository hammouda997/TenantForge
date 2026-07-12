# Contributing to TenantForge

Thank you for your interest in contributing.

## Development setup

```bash
git clone https://github.com/hammouda997/tenantforge.git
cd tenantforge
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
docker compose -f docker/docker-compose.yml up postgres redis -d
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## Pull request process

1. Fork the repository and create a feature branch from `main`.
2. Follow existing code style: strict TypeScript, no `any`, minimal diffs.
3. Run `pnpm typecheck` and `pnpm test` before opening a PR.
4. Update documentation if you change API contracts or environment variables.
5. Keep commits focused and write clear PR descriptions.

## Code of conduct

Be respectful and constructive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
