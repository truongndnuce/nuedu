# Backend (NestJS) image — standalone project.
#   Dokploy -> Build Type: Dockerfile
#   Dockerfile Path: be/Dockerfile
#   Build Context:   be (this folder)

FROM node:22-bookworm-slim AS base
WORKDIR /app
# openssl is required by Prisma engines
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm@10

# ---- Install deps (cached on manifest changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY . .
RUN pnpm exec prisma generate
RUN pnpm run build

# ---- Runtime ----
FROM build AS runtime
ENV NODE_ENV=production
EXPOSE 4000
# Apply pending migrations, then start. prisma CLI ships in node_modules.
# nest build emits to dist/src/main.js (the prisma/ dir keeps the src/ subpath).
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/src/main"]
