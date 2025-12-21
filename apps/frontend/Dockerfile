# Multi-stage build for Next.js app using Ubuntu 24.04 base

FROM ubuntu:24.04 AS node-base

ARG NODE_MAJOR=20
ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates curl gnupg \
    && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g npm@10 \
    && rm -rf /var/lib/apt/lists/*

FROM node-base AS builder

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential python3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and npm config
COPY package*.json ./
COPY .npmrc ./
COPY nx.json ./
COPY tsconfig*.json ./

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Build the frontend app
RUN npx nx build frontend --configuration=production

# Production stage
FROM node-base AS runner

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/dist/apps/frontend ./

# Install production dependencies
COPY package*.json ./
COPY .npmrc ./
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]
