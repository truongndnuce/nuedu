# Backend (NestJS) image for the pnpm monorepo.
# IMPORTANT: build context must be the REPO ROOT, not packages/backend,
# so the workspace manifests + lockfile are available.
#   Dokploy -> Build Type: Dockerfile
#   Dockerfile Path: packages/backend/Dockerfile
#   Build Context:   . (repo root)

FROM node:22-bookworm-slim AS base
WORKDIR /app
# openssl is required by Prisma engines
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10

# ---- Install deps (cached on manifest changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/backend/package.json packages/backend/package.json
RUN pnpm install --frozen-lockfile --filter ./packages/backend...

# ---- Build ----
FROM deps AS build
COPY packages/backend ./packages/backend
RUN pnpm --filter ./packages/backend exec prisma generate
RUN pnpm --filter ./packages/backend run build

# ---- Runtime ----
FROM build AS runtime
ENV NODE_ENV=production
WORKDIR /app/packages/backend
EXPOSE 4000
# Apply pending migrations, then start. prisma CLI ships in node_modules.
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main"]
