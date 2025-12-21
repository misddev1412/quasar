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
REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
GITHUB_USERNAME=${GITHUB_USERNAME:-""}
GITHUB_REPO=${GITHUB_REPO:-""}
IMAGE_NAME_PREFIX=${IMAGE_NAME_PREFIX:-""}
IMAGE_PACKAGE_PREFIX=${IMAGE_PACKAGE_PREFIX:-""}

determine_image_prefix() {
    local prefix="$IMAGE_NAME_PREFIX"

    if [ -z "$prefix" ] && [ -n "$REGISTRY" ] && [ -n "$GITHUB_USERNAME" ] && [ -n "$GITHUB_REPO" ]; then
        prefix="$REGISTRY/$GITHUB_USERNAME/$GITHUB_REPO/"
    fi

    if [ -n "$prefix" ]; then
        echo "${prefix%/}/"
    else
        echo ""
    fi
}

IMAGE_PREFIX=$(determine_image_prefix)

resolve_package_name() {
    local service=$1
    if [ -n "$IMAGE_PACKAGE_PREFIX" ]; then
        echo "${IMAGE_PACKAGE_PREFIX}${service}"
    else
        echo "$service"
    fi
}

resolve_image_name() {
    local service=$1
    local package=$(resolve_package_name "$service")
    if [ -n "$IMAGE_PREFIX" ]; then
        echo "${IMAGE_PREFIX}${package}:$IMAGE_TAG"
    else
        echo "${package}:$IMAGE_TAG"
    fi
}

show_usage() {
    echo "Usage: $0 [--all | --service <service_name>]"
    echo ""
    echo "Environment Variables (set in scripts/.env.build.local or scripts/.env.build or export):"
    echo "  IMAGE_TAG          Image tag (default: latest)"
    echo "  IMAGE_NAME_PREFIX  Optional image name prefix (e.g., registry/user/repo/)"
    echo "  IMAGE_PACKAGE_PREFIX  Optional prefix for the package name (e.g., quasar-frontend)"
    echo "  DOCKER_REGISTRY    Registry host used when deriving the prefix (default: ghcr.io)"
    echo "  GITHUB_USERNAME    Used with DOCKER_REGISTRY when IMAGE_NAME_PREFIX is not set"
    echo "  GITHUB_REPO        Used with DOCKER_REGISTRY when IMAGE_NAME_PREFIX is not set"
    echo ""
    echo "Options:"
    echo "  --all                 Build all services"
    echo "  --service <name>      Build specific service (frontend, backend, admin, worker, cron)"
    echo ""
    echo "Examples:"
    echo "  cp scripts/.env.build.example scripts/.env.build.local  # Copy and edit"
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

    local image_name=$(resolve_image_name "$service")
    local default_image="$service:$IMAGE_TAG"

    echo -e "${YELLOW}Tagging image as $image_name${NC}"

    docker build -t "$image_name" -f "apps/$service/Dockerfile" .

    if [ "$image_name" != "$default_image" ]; then
        docker tag "$image_name" "$default_image"
    fi

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
