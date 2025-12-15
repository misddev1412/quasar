# Multi-stage build for admin frontend app
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