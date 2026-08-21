# Frontend (Next.js) image — standalone project.
#   Dokploy -> Build Type: Dockerfile
#   Dockerfile Path: fe/Dockerfile
#   Build Context:   fe (this folder)

FROM node:20-bookworm-slim AS base
WORKDIR /app
RUN npm install -g pnpm@10

# ---- Install deps (cached on manifest changes) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- Build ----
FROM deps AS build
COPY . .
# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so they
# must be supplied as Docker build args in Dokploy, not just runtime env vars.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_DEFAULT_LOCALE
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_DEFAULT_LOCALE=$NEXT_PUBLIC_DEFAULT_LOCALE
RUN pnpm run build

# ---- Runtime ----
FROM base AS runtime
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
EXPOSE 3000
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
CMD ["node", "server.js"]
