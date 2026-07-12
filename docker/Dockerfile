FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY packages/validation/package.json ./packages/validation/
COPY packages/ui/package.json ./packages/ui/
COPY packages/config/package.json ./packages/config/
RUN pnpm install --frozen-lockfile || pnpm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps ./apps
COPY --from=deps /app/packages ./packages
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_PUBLIC_WS_URL=

RUN pnpm --filter @tenantforge/validation build
RUN pnpm --filter @tenantforge/api db:generate
RUN pnpm --filter @tenantforge/api build
RUN pnpm --filter @tenantforge/web build

FROM node:20-alpine AS runner
RUN apk add --no-cache nginx curl \
  && mkdir -p /run/nginx /etc/nginx/http.d

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV API_PORT=4000
ENV WEB_PORT=3000
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages ./packages

COPY --from=builder /app/apps/api/dist ./api/dist
COPY --from=builder /app/apps/api/package.json ./api/package.json
COPY --from=builder /app/apps/api/prisma ./api/prisma

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && printf 'user nginx;\nworker_processes auto;\nerror_log /var/log/nginx/error.log warn;\npid /run/nginx/nginx.pid;\nevents { worker_connections 1024; }\nhttp {\n  include /etc/nginx/mime.types;\n  default_type application/octet-stream;\n  sendfile on;\n  keepalive_timeout 65;\n  include /etc/nginx/http.d/*.conf;\n}\n' > /etc/nginx/nginx.conf

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD curl -fsS http://127.0.0.1:8080/api/v1/health || exit 1

CMD ["/entrypoint.sh"]
