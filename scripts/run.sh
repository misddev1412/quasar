#!/bin/bash

set -e

# Load environment variables from .env.run.local if it exists, otherwise .env.run
if [ -f "scripts/.env.run.local" ]; then
    source scripts/.env.run.local
elif [ -f "scripts/.env.run" ]; then
    source scripts/.env.run
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVICES=("frontend" "backend" "admin" "worker" "cron")

# Default values
DOCKER_REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
GITHUB_USERNAME=${GITHUB_USERNAME:-""}
GITHUB_REPO=${GITHUB_REPO:-""}
IMAGE_TAG=${IMAGE_TAG:-"latest"}

show_usage() {
    echo "Usage: $0 [--all | --service <service_name>]"
    echo ""
    echo "Environment Variables (set in scripts/.env.run.local or scripts/.env.run or export):"
    echo "  DOCKER_REGISTRY    Docker registry (default: ghcr.io)"
    echo "  GITHUB_USERNAME    Your GitHub username"
    echo "  GITHUB_REPO        Your GitHub repository name"
    echo "  IMAGE_TAG          Image tag (default: latest)"
    echo ""
    echo "Options:"
    echo "  --all                 Run all services"
    echo "  --service <name>      Run specific service (frontend, backend, admin, worker, cron)"
    echo ""
    echo "Examples:"
    echo "  cp scripts/.env.run scripts/.env.run.local  # Copy and edit"
    echo "  $0 --all"
    echo "  $0 --service frontend"
    echo ""
    echo "Note: Make sure Docker is running and you have access to the registry"
}

check_env() {
    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}Error: GITHUB_USERNAME is required${NC}"
        exit 1
    fi

    if [ -z "$GITHUB_REPO" ]; then
        echo -e "${RED}Error: GITHUB_REPO is required${NC}"
        exit 1
    fi
}

run_service() {
    local service=$1
    local registry_image="$DOCKER_REGISTRY/$GITHUB_USERNAME/$GITHUB_REPO/$service:$IMAGE_TAG"

    echo -e "${BLUE}Running $service...${NC}"

    # Check if image exists locally
    if ! docker image inspect $registry_image > /dev/null 2>&1; then
        echo -e "${YELLOW}Image not found locally, pulling $registry_image...${NC}"
        docker pull $registry_image
    fi

    # Stop and remove existing container if it exists
    if docker ps -a --format 'table {{.Names}}' | grep -q "^${service}$"; then
        echo -e "${YELLOW}Stopping existing $service container...${NC}"
        docker stop $service > /dev/null 2>&1
        docker rm $service > /dev/null 2>&1
    fi

    # Run the container based on service type
    case $service in
        frontend)
            echo -e "${YELLOW}Starting frontend on port 3000...${NC}"
            docker run -d --name $service -p 3000:3000 \
                -e NODE_ENV=$NODE_ENV \
                $registry_image
            echo -e "${GREEN}Frontend running at http://localhost:3000${NC}"
            ;;
        backend)
            echo -e "${YELLOW}Starting backend on port 3001...${NC}"
            docker run -d --name $service -p 3001:3001 \
                -e NODE_ENV=$NODE_ENV \
                $registry_image
            echo -e "${GREEN}Backend running at http://localhost:3001${NC}"
            ;;
        admin)
            echo -e "${YELLOW}Starting admin on port 8080...${NC}"
            docker run -d --name $service -p 8080:80 \
                $registry_image
            echo -e "${GREEN}Admin running at http://localhost:8080${NC}"
            ;;
        worker)
            echo -e "${YELLOW}Starting worker service...${NC}"
            docker run -d --name $service \
                -e NODE_ENV=$NODE_ENV \
                $registry_image
            echo -e "${GREEN}Worker service started${NC}"
            ;;
        cron)
            echo -e "${YELLOW}Starting cron service...${NC}"
            docker run -d --name $service \
                -e NODE_ENV=$NODE_ENV \
                $registry_image
            echo -e "${GREEN}Cron service started${NC}"
            ;;
        *)
            echo -e "${RED}Unknown service: $service${NC}"
            exit 1
            ;;
    esac

    echo -e "${GREEN}Successfully started $service${NC}"
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

check_env

case $1 in
    --all)
        echo -e "${BLUE}Starting all services...${NC}"
        for service in "${SERVICES[@]}"; do
            run_service $service
        done
        echo -e "${GREEN}All services started!${NC}"
        echo -e "${BLUE}Services running:${NC}"
        echo -e "  Frontend: http://localhost:3000"
        echo -e "  Backend:  http://localhost:3001"
        echo -e "  Admin:    http://localhost:8080"
        ;;
    --service)
        if [ $# -lt 2 ]; then
            echo -e "${RED}Error: --service requires a service name${NC}"
            show_usage
            exit 1
        fi
        service=$2
        if [[ ! " ${SERVICES[@]} " =~ " ${service} " ]]; then
            echo -e "${RED}Error: Invalid service '$service'. Valid services: ${SERVICES[*]}${NC}"
            exit 1
        fi
        run_service $service
        ;;
    *)
        echo -e "${RED}Error: Invalid option '$1'${NC}"
        show_usage
        exit 1
        ;;
esac

echo -e "${GREEN}Run completed!${NC}"