FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/web/package.json ./apps/web/

# npm ci installs exactly the versions in package-lock.json. Plain
# `npm install` re-resolves to the newest versions on every uncached build,
# and newer build tooling broke the Vite build.
RUN npm ci --workspace=packages/shared --workspace=apps/web

COPY packages/shared ./packages/shared
COPY apps/web ./apps/web

RUN npm run build --workspace=packages/shared
RUN npm run build --workspace=apps/web

# ── Nginx to serve the built SPA ──────────────────────────────────────
FROM nginx:alpine AS runner
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
# Use templates/ so nginx substitutes ${API_UPSTREAM} at container startup
COPY apps/web/nginx.conf /etc/nginx/templates/default.conf.template

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
