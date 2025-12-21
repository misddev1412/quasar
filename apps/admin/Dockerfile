# Multi-stage build for admin frontend app with Ubuntu 24.04 builder

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

# Build the admin app
RUN npx nx build admin --configuration=production

# Production stage with nginx
FROM nginx:alpine

# Copy built app to nginx html directory
COPY --from=builder /app/dist/apps/admin /usr/share/nginx/html

# Copy nginx config if needed (optional)
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
