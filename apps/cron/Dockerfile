# Dockerfile for cron service
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the cron app
RUN npx nx build cron

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app
COPY --from=builder /app/dist/apps/cron ./dist

# Set environment
ENV NODE_ENV=production

# Start the app
CMD ["node", "dist/main.js"]