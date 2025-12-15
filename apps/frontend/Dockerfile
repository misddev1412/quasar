# Multi-stage build for Next.js app
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

# Build the frontend app
RUN npx nx build frontend --configuration=production

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy built app from builder stage
COPY --from=builder /app/dist/apps/frontend ./

# Install production dependencies
RUN npm ci --only=production

# Expose port
EXPOSE 3000

# Set environment
ENV NODE_ENV=production

# Start the app
CMD ["npm", "start"]