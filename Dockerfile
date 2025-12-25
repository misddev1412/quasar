# syntax=docker/dockerfile:1.4
# =========================
# Builder stage - Optimized for speed
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

# ---- Install deps with BuildKit cache mount ----
# Copy only package files first for better layer caching
COPY package.json yarn.lock ./

# Use BuildKit cache mounts for faster installs
RUN --mount=type=cache,target=/root/.yarn,sharing=locked \
    --mount=type=cache,target=/root/.cache/node-gyp,sharing=locked \
    yarn install \
      --frozen-lockfile \
      --network-timeout 300000 \
      --network-concurrency 1

# ---- Copy source (separate layer for better caching) ----
COPY . .

# ---- Build all artifacts with Nx cache mount ----
RUN --mount=type=cache,target=/app/.nx/cache,sharing=locked \
    --mount=type=cache,target=/tmp/nx-cache,sharing=locked \
    SKIP_BUILD_INSTALL=1 bash deploy/build.sh

# ---- Create production node_modules in separate stage ----
FROM node:20-bookworm-slim AS prod-deps
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./

# Install only production dependencies with cache mount
RUN --mount=type=cache,target=/root/.yarn,sharing=locked \
    yarn install \
      --production \
      --frozen-lockfile \
      --ignore-scripts \
      --prefer-offline \
      --network-timeout 300000 \
      --network-concurrency 1


# =========================
# Runtime stage
# =========================
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

# ---- Runtime OS deps (cache this layer) ----
RUN --mount=type=cache,target=/var/cache/apt,sharing=locked \
    --mount=type=cache,target=/var/lib/apt/lists,sharing=locked \
    apt-get update \
  && apt-get install -y --no-install-recommends \
       nginx \
       gettext-base \
       ca-certificates

# Install pm2 globally with npm cache mount
RUN --mount=type=cache,target=/root/.npm,sharing=locked \
    npm install -g pm2

# ---- Copy runtime artifacts only ----
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
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
