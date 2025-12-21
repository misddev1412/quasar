#!/bin/bash

set -e

# Load environment variables from .env.build.local if it exists, otherwise .env.build
if [ -f "scripts/.env.build.local" ]; then
    source scripts/.env.build.local
elif [ -f "scripts/.env.build" ]; then
    source scripts/.env.build
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICES=("frontend" "backend" "admin" "worker" "cron")
IMAGE_TAG=${IMAGE_TAG:-"latest"}

show_usage() {
    echo "Usage: $0 [--all | --service <service_name>]"
    echo ""
    echo "Environment Variables (set in scripts/.env.build.local or scripts/.env.build or export):"
    echo "  IMAGE_TAG          Image tag (default: latest)"
    echo ""
    echo "Options:"
    echo "  --all                 Build all services"
    echo "  --service <name>      Build specific service (frontend, backend, admin, worker, cron)"
    echo ""
    echo "Examples:"
    echo "  cp scripts/.env.build scripts/.env.build.local  # Copy and edit"
    echo "  $0 --all"
    echo "  $0 --service frontend"
}

build_service() {
    local service=$1
    echo -e "${YELLOW}Building $service...${NC}"

    if [ ! -d "apps/$service" ]; then
        echo -e "${RED}Error: Service '$service' not found${NC}"
        exit 1
    fi

    if [ ! -f "apps/$service/Dockerfile" ]; then
        echo -e "${RED}Error: Dockerfile not found for service '$service'${NC}"
        exit 1
    fi

    # Use repo root as build context so Dockerfiles can access shared configs
    docker build -t $service:$IMAGE_TAG -f apps/$service/Dockerfile .

    echo -e "${GREEN}Successfully built $service${NC}"
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

case $1 in
    --all)
        echo -e "${YELLOW}Building all services...${NC}"
        for service in "${SERVICES[@]}"; do
            build_service $service
        done
        echo -e "${GREEN}All services built successfully${NC}"
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
        build_service $service
        ;;
    *)
        echo -e "${RED}Error: Invalid option '$1'${NC}"
        show_usage
        exit 1
        ;;
esac
