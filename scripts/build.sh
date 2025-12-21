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
BUILD_PLATFORMS=${BUILD_PLATFORMS:-"linux/amd64,linux/arm64"}

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

MULTI_PLATFORM_BUILD=false
if [[ "$BUILD_PLATFORMS" == *","* ]]; then
    MULTI_PLATFORM_BUILD=true
fi

ensure_multi_arch_builder() {
    local inspect_output driver

    if ! inspect_output=$(docker buildx inspect 2>/dev/null); then
        echo -e "${YELLOW}No active buildx builder detected. Creating 'quasar-builder'...${NC}"
        if ! docker buildx create --name quasar-builder --use --driver docker-container >/dev/null 2>&1; then
            echo -e "${RED}Failed to initialize docker buildx builder automatically. Run 'docker buildx create --name quasar-builder --use --driver docker-container --bootstrap' manually and retry.${NC}"
            exit 1
        fi
        inspect_output=$(docker buildx inspect 2>/dev/null)
    fi

    driver=$(echo "$inspect_output" | awk -F': ' '/Driver:/ {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}')

    if [ -z "$driver" ] || [ "$driver" = "docker" ]; then
        echo -e "${YELLOW}Switching buildx driver to docker-container for multi-arch builds...${NC}"
        if docker buildx inspect quasar-builder >/dev/null 2>&1; then
            docker buildx use quasar-builder >/dev/null 2>&1 || true
        else
            if ! docker buildx create --name quasar-builder --use --driver docker-container >/dev/null 2>&1; then
                echo -e "${RED}Failed to create docker buildx builder. Run 'docker buildx create --name quasar-builder --use --driver docker-container --bootstrap' manually.${NC}"
                exit 1
            fi
        fi
        inspect_output=$(docker buildx inspect 2>/dev/null)
        driver=$(echo "$inspect_output" | awk -F': ' '/Driver:/ {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}')

        if [ -z "$driver" ] || [ "$driver" = "docker" ]; then
            echo -e "${RED}Current docker buildx driver ($driver) does not support multi-arch builds. Please run 'docker buildx create --name quasar-builder --use --driver docker-container --bootstrap' and rerun this script.${NC}"
            exit 1
        fi
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
    echo "  BUILD_PLATFORMS    Target platforms (default: linux/amd64,linux/arm64)"
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
    local is_multi_platform=$MULTI_PLATFORM_BUILD

    if [ "$is_multi_platform" = true ] && [ -z "$IMAGE_PREFIX" ]; then
        echo -e "${RED}Error: Multi-arch builds require IMAGE_NAME_PREFIX or registry details (DOCKER_REGISTRY, GITHUB_USERNAME, GITHUB_REPO).${NC}"
        exit 1
    fi

    echo -e "${YELLOW}Building platforms: $BUILD_PLATFORMS${NC}"

    local build_cmd=(docker buildx build --platform "$BUILD_PLATFORMS" -f "apps/$service/Dockerfile" --tag "$image_name")

    if [ "$image_name" != "$default_image" ]; then
        build_cmd+=(--tag "$default_image")
    fi

    if [ "$is_multi_platform" = true ]; then
        build_cmd+=(--push)
        echo -e "${YELLOW}Building and pushing multi-arch image...${NC}"
    else
        build_cmd+=(--load)
    fi

    build_cmd+=(".")

    "${build_cmd[@]}"

    if [ "$is_multi_platform" = true ]; then
        echo -e "${GREEN}Multi-arch image pushed: $image_name${NC}"
    else
        echo -e "${GREEN}Successfully built $service${NC}"
    fi
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

if [ "$MULTI_PLATFORM_BUILD" = true ]; then
    ensure_multi_arch_builder
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
