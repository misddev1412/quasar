# Scripts

This directory contains scripts for building, deploying, and running the containerized services.

📖 **For detailed usage instructions, see [USER_GUIDE.md](USER_GUIDE.md)**

## Setup

1. Copy the appropriate environment file for each script:
   ```bash
   # For build script
   cp scripts/.env.build scripts/.env.build.local

   # For deploy script
   cp scripts/.env.deploy scripts/.env.deploy.local

   # For run script
   cp scripts/.env.run scripts/.env.run.local
   ```

2. Edit the copied `.local` files with your actual values:
   - `scripts/.env.build.local`: Configure build settings (e.g., custom image tag)
   - `scripts/.env.deploy.local`: Configure deployment settings (GitHub credentials, registry)
   - `scripts/.env.run.local`: Configure runtime settings (registry, ports)

## Scripts

### `build.sh`

Builds Docker images for the services.

```bash
# Build all services
./scripts/build.sh --all

# Build specific service
./scripts/build.sh --service frontend
```

### `deploy.sh`

Deploys built Docker images to GitHub Container Registry.

```bash
# Deploy all services
./scripts/deploy.sh --all

# Deploy specific service
./scripts/deploy.sh --service frontend
```

### `run.sh`

Pulls and runs Docker containers from the registry locally.

```bash
# Run all services
./scripts/run.sh --all

# Run specific service
./scripts/run.sh --service frontend
```

## Services

- `frontend`: Next.js frontend application (port 3000)
- `backend`: Node.js backend API (port 3001)
- `admin`: Admin frontend application (port 8080, mapped to container port 80)
- `worker`: Background worker service (no exposed port)
- `cron`: Cron job service (no exposed port)

## Prerequisites

- Docker installed and running
- GitHub Personal Access Token with `write:packages` and `read:packages` permissions
- Repository must be public or token must have access to private repos

## Workflow

```bash
# 1. Configure environment
cp scripts/.env.build scripts/.env.build.local
cp scripts/.env.deploy scripts/.env.deploy.local
cp scripts/.env.run scripts/.env.run.local
# Edit the .local files with your values

# 2. Build images
./scripts/build.sh --all

# 3. Deploy to registry
./scripts/deploy.sh --all

# 4. Run locally (optional)
./scripts/run.sh --all
```

Images will be tagged as `{registry}/{username}/{repo}/{service}:{tag}` and pushed to the specified registry.