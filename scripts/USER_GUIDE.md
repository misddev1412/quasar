# User Guide: Docker Scripts for Containerized Services

This guide provides step-by-step instructions for using the build, deploy, and run scripts to manage your containerized application services.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Building Images](#building-images)
4. [Deploying to Registry](#deploying-to-registry)
5. [Running Locally](#running-locally)
6. [Complete Workflow](#complete-workflow)
7. [Troubleshooting](#troubleshooting)
8. [Advanced Usage](#advanced-usage)

## Prerequisites

Before using these scripts, ensure you have:

- **Docker**: Installed and running on your system
- **GitHub Account**: With access to create and manage packages
- **GitHub Personal Access Token**: With `write:packages` and `read:packages` permissions
- **Bash Shell**: For running the scripts
- **Internet Connection**: For pulling/pushing images

### Installing Docker

**On Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install docker.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
# Log out and back in for group changes to take effect
```

**On macOS:**
```bash
brew install --cask docker
# Or download from https://www.docker.com/products/docker-desktop
```

**On Windows:**
Download Docker Desktop from https://www.docker.com/products/docker-desktop

## Initial Setup

### 1. Clone and Navigate to Project

```bash
git clone <your-repo-url>
cd <your-project-directory>
```

### 2. Configure Environment Variables

Copy the environment templates and customize them:

```bash
# For build script
cp scripts/.env.build scripts/.env.build.local

# For deploy script
cp scripts/.env.deploy scripts/.env.deploy.local

# For run script
cp scripts/.env.run scripts/.env.run.local
```

### 3. Edit Environment Files

Edit each `.local` file with your specific values:

**`scripts/.env.build.local`:**
```bash
# Image tag for builds (default: latest)
IMAGE_TAG=v1.0.0
```

**`scripts/.env.deploy.local`:**
```bash
# GitHub Container Registry Configuration
GITHUB_USERNAME=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_TOKEN=ghp_your_token_here

# Optional: Custom registry (default: ghcr.io)
DOCKER_REGISTRY=ghcr.io

# Optional: Image tag (should match build tag)
IMAGE_TAG=v1.0.0
```

**`scripts/.env.run.local`:**
```bash
# Registry configuration (should match deploy settings)
DOCKER_REGISTRY=ghcr.io
GITHUB_USERNAME=your-github-username
GITHUB_REPO=your-repo-name
IMAGE_TAG=v1.0.0

# Runtime environment
NODE_ENV=production
```

### 4. Create GitHub Personal Access Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Select scopes:
   - `write:packages`
   - `read:packages`
   - `delete:packages` (optional, for cleanup)
4. Copy the token and paste it into `scripts/.env.deploy.local`

## Building Images

### Build All Services

```bash
./scripts/build.sh --all
```

**Expected Output:**
```
Building frontend...
[+] Building 120.5s (14/14) FINISHED
Successfully built frontend
Building backend...
[+] Building 85.3s (12/12) FINISHED
Successfully built backend
...
All services built successfully
```

### Build Specific Service

```bash
./scripts/build.sh --service frontend
./scripts/build.sh --service backend
```

### Verify Built Images

```bash
docker images | grep -E "(frontend|backend|admin|worker|cron)"
```

## Deploying to Registry

### Deploy All Services

```bash
./scripts/deploy.sh --all
```

**Expected Output:**
```
Logging in to GitHub Container Registry...
Successfully logged in
Deploying frontend...
Tagging frontend:latest as ghcr.io/username/repo/frontend:latest
Pushing ghcr.io/username/repo/frontend:latest
Successfully deployed frontend
...
All services deployed successfully
```

### Deploy Specific Service

```bash
./scripts/deploy.sh --service frontend
```

### Verify Deployment

Check your GitHub repository's Packages section to see the uploaded images.

## Running Locally

### Run All Services

```bash
./scripts/run.sh --all
```

**Expected Output:**
```
Starting all services...
Running frontend...
Starting frontend on port 3000...
Frontend running at http://localhost:3000
Running backend...
Starting backend on port 3001...
Backend running at http://localhost:3001
...
All services started!
Services running:
  Frontend: http://localhost:3000
  Backend:  http://localhost:3001
  Admin:    http://localhost:8080
```

### Run Specific Service

```bash
./scripts/run.sh --service frontend
./scripts/run.sh --service backend
```

### Access Running Services

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Admin**: http://localhost:8080
- **Worker/Cron**: Background services (no direct access)

### Check Running Containers

```bash
docker ps
```

### View Logs

```bash
docker logs frontend
docker logs backend
```

### Stop Services

```bash
# Stop specific service
docker stop frontend

# Stop all services
docker stop frontend backend admin worker cron

# Remove containers
docker rm frontend backend admin worker cron
```

## Complete Workflow

Here's the complete process from development to deployment:

```bash
# 1. Initial setup (one-time)
cp scripts/.env.build scripts/.env.build.local
cp scripts/.env.deploy scripts/.env.deploy.local
cp scripts/.env.run scripts/.env.run.local
# Edit .local files with your values

# 2. Build all services
./scripts/build.sh --all

# 3. Deploy to GitHub Container Registry
./scripts/deploy.sh --all

# 4. Run locally (for testing)
./scripts/run.sh --all

# 5. Access your application
# Frontend: http://localhost:3000
# Backend:  http://localhost:3001
# Admin:    http://localhost:8080
```

## Troubleshooting

### Build Issues

**"Dockerfile not found"**
- Ensure you're running from the project root directory
- Check that the service name is correct: `frontend`, `backend`, `admin`, `worker`, `cron`

**Build failures**
```bash
# Check Docker build logs
docker build -t debug ./apps/frontend 2>&1 | tee build.log

# Clean Docker cache
docker system prune -f
```

### Deployment Issues

**"denied: permission_denied"**
- Check your GitHub token has correct permissions
- Verify the token hasn't expired
- Ensure you're using the correct username and repository name

**Network issues**
```bash
# Test registry access
docker login ghcr.io -u yourusername
```

### Runtime Issues

**Port conflicts**
```bash
# Check what's using ports
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :8080

# Change ports in scripts/run.sh if needed
```

**Container won't start**
```bash
# Check container logs
docker logs <service-name>

# Debug container
docker run -it --rm <image-name> /bin/sh
```

### Environment Issues

**Scripts can't find .env files**
- Ensure you're running from the project root
- Check file permissions: `ls -la scripts/.env.*`
- Verify environment variables are set correctly

## Advanced Usage

### Custom Image Tags

```bash
# In scripts/.env.build.local and scripts/.env.deploy.local
IMAGE_TAG=v1.2.3

# Build with version tag
./scripts/build.sh --all

# Deploy with version tag
./scripts/deploy.sh --all
```

### Using Different Registries

```bash
# For Docker Hub
DOCKER_REGISTRY=docker.io
GITHUB_USERNAME=your-dockerhub-username

# For AWS ECR
DOCKER_REGISTRY=your-account.dkr.ecr.region.amazonaws.com
```

### Environment-Specific Configurations

Create multiple `.local` files for different environments:

```bash
cp scripts/.env.deploy scripts/.env.deploy.staging
cp scripts/.env.deploy scripts/.env.deploy.production
```

### CI/CD Integration

These scripts can be used in GitHub Actions or other CI/CD pipelines:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Build
        run: ./scripts/build.sh --all
      - name: Deploy
        run: ./scripts/deploy.sh --all
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Monitoring and Maintenance

```bash
# View resource usage
docker stats

# Clean up unused images
docker image prune -f

# View container logs with follow
docker logs -f frontend
```

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the script output for error messages
3. Verify your environment configuration
4. Check GitHub repository permissions
5. Ensure Docker is running and accessible

For additional help, refer to the individual script help:

```bash
./scripts/build.sh --help
./scripts/deploy.sh --help
./scripts/run.sh --help
```