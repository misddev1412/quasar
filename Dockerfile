# Builder stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable

ARG REACT_APP_API_URL="http://localhost:3000/api"
ARG NEXT_PUBLIC_API_URL="http://localhost:3000/api"
ARG NEXT_PUBLIC_SITE_URL="http://localhost:3001"

ENV \
  REACT_APP_API_URL="${REACT_APP_API_URL}" \
  NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}"

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1
COPY . .

RUN SKIP_BUILD_INSTALL=1 bash deploy/build.sh

# Production dependencies stage
FROM node:20-bookworm-slim AS deps-prod
WORKDIR /app
RUN corepack enable
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 300000 --network-concurrency 1 --production

# Runner stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext-base ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

COPY --from=builder /app/dist ./dist
# Copy production dependencies only
COPY --from=deps-prod /app/node_modules ./node_modules
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
