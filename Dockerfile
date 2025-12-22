# Builder stage
FROM node:20-bookworm-slim AS builder
WORKDIR /app

RUN corepack enable

COPY package.json yarn.lock ./
COPY . .

RUN yarn install --frozen-lockfile
RUN yarn build

# Runner stage
FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends nginx gettext-base ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pm2

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/yarn.lock ./yarn.lock
COPY --from=builder /app/ecosystem.config.cjs ./ecosystem.config.cjs
COPY --from=builder /app/deploy ./deploy

RUN cp ./deploy/start.sh /start.sh \
  && chmod +x /start.sh

EXPOSE 80

CMD ["/start.sh"]
