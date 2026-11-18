FROM node:22-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# Copy workspace manifests
COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install exactly the versions in package-lock.json (npm ci), so an uncached
# build can't silently pick up newer, breaking dependency versions.
RUN npm ci --workspace=packages/shared --workspace=apps/api

# Copy source
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared
RUN npm run build --workspace=packages/shared

# Generate Prisma client
WORKDIR /app/apps/api
RUN npx prisma generate

# ── Production image ──────────────────────────────────────────────────
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app

COPY --from=base /app /app

WORKDIR /app/apps/api

EXPOSE 3000
CMD ["npx", "tsx", "src/server.ts"]
