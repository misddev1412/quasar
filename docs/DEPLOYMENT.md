# Deployment Guide

This guide covers deploying the tRPC application to various environments including development, staging, and production.

## Table of Contents

- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Production Deployment](#production-deployment)
- [Database Setup](#database-setup)
- [Environment Variables](#environment-variables)
- [Security Considerations](#security-considerations)
- [Monitoring & Logging](#monitoring--logging)

## Environment Setup

### Prerequisites

- **Node.js**: 18.x or higher
- **Yarn**: 1.22.x or higher
- **PostgreSQL**: 13.x or higher
- **Docker**: 20.x or higher (optional)

### Development Dependencies

```bash
# Install global dependencies
npm install -g @nx/cli

# Install project dependencies
yarn install
```

## Local Development

### Database Setup

1. **Install PostgreSQL locally**:
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

2. **Create database and user**:
```sql
-- Connect to PostgreSQL as superuser
sudo -u postgres psql

-- Create database
CREATE DATABASE quasar_dev;

-- Create user
CREATE USER quasar_user WITH PASSWORD 'your_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE quasar_dev TO quasar_user;

-- Exit
\q
```

### Environment Configuration

Create environment files:

```bash
# Backend environment
cp apps/backend/.env.example apps/backend/.env
```

Edit `apps/backend/.env`:
```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=quasar_user
DATABASE_PASSWORD=your_password
DATABASE_NAME=quasar_dev

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Application
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:4200,http://localhost:4201
```

### Run Development Servers

```bash
# Terminal 1: Backend
yarn nx serve backend

# Terminal 2: Client App
yarn nx serve client

# Terminal 3: Admin App
yarn nx serve admin
```

### Database Migrations

```bash
# Run initial migrations
yarn nx run backend:migration:run

# Generate new migration
yarn nx run backend:migration:generate --name=AddNewFeature

# Revert last migration
yarn nx run backend:migration:revert
```

## Docker Deployment

### Dockerfile Configuration

**Backend Dockerfile** (`apps/backend/Dockerfile`):
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build backend
RUN yarn nx build backend --prod

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist/apps/backend ./
COPY --from=builder /app/node_modules ./node_modules

USER nestjs

EXPOSE 3001

ENV PORT 3001

CMD ["node", "main.js"]
```

**Frontend Dockerfile** (`apps/client/Dockerfile`):
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build client
RUN yarn nx build client --prod

# Production image
FROM nginx:alpine AS runner
COPY --from=builder /app/dist/apps/client /usr/share/nginx/html
COPY apps/client/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

**development** (`docker-compose.dev.yml`):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: quasar_dev
      POSTGRES_USER: quasar_user
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: quasar_user
      DATABASE_PASSWORD: password
      DATABASE_NAME: quasar_dev
      JWT_SECRET: dev-secret-key
      JWT_REFRESH_SECRET: dev-refresh-secret
    depends_on:
      - postgres
    volumes:
      - ./apps/backend:/app
      - /app/node_modules

  client:
    build:
      context: .
      dockerfile: apps/client/Dockerfile
    ports:
      - "4200:80"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    ports:
      - "4201:80"
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:3001

volumes:
  postgres_data:
```

**Production** (`docker-compose.prod.yml`):
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DATABASE_NAME}
      POSTGRES_USER: ${DATABASE_USERNAME}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backup:/backup
    restart: unless-stopped

  backend:
    build:
      context: .
      dockerfile: apps/backend/Dockerfile
    environment:
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: ${DATABASE_USERNAME}
      DATABASE_PASSWORD: ${DATABASE_PASSWORD}
      DATABASE_NAME: ${DATABASE_NAME}
      JWT_SECRET: ${JWT_SECRET}
      JWT_REFRESH_SECRET: ${JWT_REFRESH_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - client_build:/usr/share/nginx/html/client
      - admin_build:/usr/share/nginx/html/admin
    depends_on:
      - backend
    restart: unless-stopped

  client:
    build:
      context: .
      dockerfile: apps/client/Dockerfile
    volumes:
      - client_build:/app/build

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    volumes:
      - admin_build:/app/build

volumes:
  postgres_data:
  client_build:
  admin_build:
```

### Nginx Configuration

**Production Nginx** (`nginx/nginx.conf`):
```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:3001;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=auth:10m rate=5r/m;
    limit_req_zone $binary_remote_addr zone=api:10m rate=100r/m;

    server {
        listen 80;
        server_name yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains";

        # Client application
        location / {
            root /usr/share/nginx/html/client;
            try_files $uri $uri/ /index.html;
        }

        # Admin application
        location /admin {
            alias /usr/share/nginx/html/admin;
            try_files $uri $uri/ /admin/index.html;
        }

        # API endpoints
        location /api {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # tRPC endpoints
        location /trpc {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Auth endpoints (stricter rate limiting)
        location ~ ^/(auth|login|register) {
            limit_req zone=auth burst=5 nodelay;
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Production Deployment

### Cloud Providers

#### AWS Deployment with ECS

**Task Definition** (`aws-task-definition.json`):
```json
{
  "family": "quasar-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "your-registry/quasar-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:region:account:secret:jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/quasar-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

#### Heroku Deployment

**Procfile**:
```
web: cd dist/apps/backend && node main.js
release: cd dist/apps/backend && node -e "require('./src/migrations/run-migrations')"
```

**package.json scripts**:
```json
{
  "scripts": {
    "build": "nx build backend --prod",
    "heroku-postbuild": "yarn build"
  }
}
```

#### Vercel Deployment (Frontend)

**vercel.json**:
```json
{
  "builds": [
    {
      "src": "apps/client/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "apps/admin/package.json", 
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/admin/(.*)",
      "dest": "/admin/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/client/$1"
    }
  ]
}
```

### CI/CD Pipeline

**GitHub Actions** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn nx test backend
      - run: yarn nx test client
      - run: yarn nx lint backend
      - run: yarn nx lint client

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'yarn'
      
      - run: yarn install --frozen-lockfile
      - run: yarn nx build backend --prod
      - run: yarn nx build client --prod
      - run: yarn nx build admin --prod
      
      - name: Build Docker images
        run: |
          docker build -t quasar-backend -f apps/backend/Dockerfile .
          docker build -t quasar-client -f apps/client/Dockerfile .
          docker build -t quasar-admin -f apps/admin/Dockerfile .

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Deploy to production
        run: |
          # Your deployment commands here
          echo "Deploying to production..."
```

## Database Setup

### Production Database Configuration

#### PostgreSQL Production Setup

```sql
-- Create production database
CREATE DATABASE quasar_prod;

-- Create dedicated user
CREATE USER quasar_app WITH PASSWORD 'secure_random_password';

-- Grant minimal required privileges
GRANT CONNECT ON DATABASE quasar_prod TO quasar_app;
GRANT USAGE ON SCHEMA public TO quasar_app;
GRANT CREATE ON SCHEMA public TO quasar_app;

-- For existing tables (after migration)
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO quasar_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO quasar_app;

-- For future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO quasar_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO quasar_app;
```

#### Database Migration in Production

```bash
# Create migration script
cat > migrate.sh << 'EOF'
#!/bin/bash
set -e

echo "Starting database migration..."

# Backup database before migration
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Run migrations
cd /app && node -e "
const { DataSource } = require('typeorm');
const config = require('./ormconfig.js');
const dataSource = new DataSource(config);
dataSource.initialize().then(() => {
  return dataSource.runMigrations();
}).then(() => {
  console.log('Migrations completed successfully');
  process.exit(0);
}).catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});
"

echo "Migration completed successfully"
EOF

chmod +x migrate.sh
```

### Database Backup Strategy

```bash
# Daily backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup"
RETENTION_DAYS=7

# Create backup
pg_dump $DATABASE_URL | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Remove old backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: backup_$DATE.sql.gz"
EOF

# Schedule with cron
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

## Environment Variables

### Production Environment Variables

**Backend**:
```bash
# Database
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_USERNAME=quasar_app
DATABASE_PASSWORD=secure_random_password
DATABASE_NAME=quasar_prod
DATABASE_SSL=true

# JWT
JWT_SECRET=very-long-random-string-use-crypto.randomBytes(64).toString('hex')
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=another-very-long-random-string
JWT_REFRESH_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3001

# CORS
CORS_ORIGIN=https://yourdomain.com,https://admin.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
LOG_FORMAT=json
```

**Frontend**:
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_ENV=production

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_MONITORING=true
```

### Secret Management

#### Using AWS Secrets Manager

```typescript
// apps/backend/src/config/secrets.service.ts
import { Injectable } from '@nestjs/common';
import { SecretsManager } from 'aws-sdk';

@Injectable()
export class SecretsService {
  private secretsManager = new SecretsManager();

  async getSecret(secretName: string): Promise<string> {
    try {
      const result = await this.secretsManager.getSecretValue({
        SecretId: secretName
      }).promise();
      
      return result.SecretString || '';
    } catch (error) {
      throw new Error(`Failed to retrieve secret ${secretName}: ${error.message}`);
    }
  }

  async getDatabaseCredentials(): Promise<DatabaseConfig> {
    const secret = await this.getSecret('prod/database/credentials');
    return JSON.parse(secret);
  }
}
```

## Security Considerations

### Security Headers

```typescript
// apps/backend/src/main.ts
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
  }));
  
  // Rate limiting
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  }));
  
  await app.listen(process.env.PORT || 3001);
}
```

### Environment Security

```bash
# Set restrictive file permissions
chmod 600 .env*

# Use environment-specific configs
# .env.production
NODE_ENV=production
DEBUG=false

# Never commit secrets to git
echo ".env*" >> .gitignore
echo "secrets/" >> .gitignore
```

## Monitoring & Logging

### Application Monitoring

```typescript
// apps/backend/src/monitoring/monitoring.module.ts
import { Module } from '@nestjs/common';
import * as Sentry from '@sentry/node';

@Module({})
export class MonitoringModule {
  constructor() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.NODE_ENV,
      });
    }
  }
}
```

### Health Checks

```typescript
// apps/backend/src/health/health.controller.ts
import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
```

### Logging Configuration

```typescript
// apps/backend/src/config/logger.config.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerConfig = WinstonModule.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    process.env.NODE_ENV === 'production'
      ? winston.format.json()
      : winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(),
    ...(process.env.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
          }),
        ]
      : []),
  ],
});
```

This deployment guide provides comprehensive instructions for deploying the tRPC application across different environments while maintaining security and performance best practices. 