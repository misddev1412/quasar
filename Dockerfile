# =========================
# Builder stage
# =========================
FROM node:20-bookworm-slim AS builder
WORKDIR /app

# ---- System / Node tuning for low-RAM CI ----
ENV CI=1 \
    NX_DAEMON=false \
    NODE_OPTIONS=--max-old-space-size=1536

RUN corepack enable

# ---- Build args (runtime-safe defaults) ----
ARG REACT_APP_API_URL="http://localhost:3000/api"
ARG NEXT_PUBLIC_API_URL="http://localhost:3000/api"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3001"

ENV \
  REACT_APP_API_URL="${REACT_APP_API_URL}" \
  NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"

# ---- Install deps (ONCE) ----
COPY package.json yarn.lock ./
RUN yarn install \
  --frozen-lockfile \
  --network-timeout 300000 \
  --network-concurrency 1

# ---- Copy source ----
COPY . .

# ---- Build all artifacts (backend + admin + frontend) ----
# deploy/build.sh already has SKIP_BUILD_INSTALL logic
RUN SKIP_BUILD_INSTALL=1 bash deploy/build.sh

# ---- Prune devDependencies for production ----
# (reuse existing node_modules + cache, MUCH lighter than a new stage)
RUN yarn install \
  --production \
  --ignore-scripts \
  --non-interactive \
  --network-timeout 300000 \
  --network-concurrency 1


# =========================
# Runtime stage
# =========================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# ---- Runtime OS deps ----
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
       nginx \
       gettext-base \
       ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

# ---- Copy runtime artifacts only ----
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/ecosystem.config.cjs ./ecosystem.config.cjs
COPY --from=builder /app/deploy ./deploy
COPY --from=builder /app/apps ./apps
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/tsconfig.base.json ./tsconfig.base.json

RUN cp ./deploy/start.sh /start.sh \
  && chmod +x /start.sh

EXPOSE 80
CMD ["/start.sh"]
