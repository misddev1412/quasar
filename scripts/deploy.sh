#!/bin/bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

SERVICES=("frontend" "backend" "admin" "worker" "cron")

# Load environment variables from .env.deploy.local if it exists, otherwise .env.deploy
if [ -f "scripts/.env.deploy.local" ]; then
    source scripts/.env.deploy.local
elif [ -f "scripts/.env.deploy" ]; then
    source scripts/.env.deploy
fi

# Docker registry configuration
REGISTRY=${DOCKER_REGISTRY:-"ghcr.io"}
IMAGE_TAG=${IMAGE_TAG:-"latest"}
GITHUB_USERNAME=${GITHUB_USERNAME:-""}
GITHUB_REPO=${GITHUB_REPO:-""}
GITHUB_TOKEN=${GITHUB_TOKEN:-""}
IMAGE_NAME_PREFIX=${IMAGE_NAME_PREFIX:-""}
IMAGE_PACKAGE_PREFIX=${IMAGE_PACKAGE_PREFIX:-""}
DEPLOY_ALLOW_PUSH=${DEPLOY_ALLOW_PUSH:-"false"}

determine_local_image_prefix() {
    local prefix="$IMAGE_NAME_PREFIX"

    if [ -z "$prefix" ] && [ -n "$GITHUB_USERNAME" ] && [ -n "$GITHUB_REPO" ]; then
        prefix="$REGISTRY/$GITHUB_USERNAME/$GITHUB_REPO/"
    fi

    if [ -n "$prefix" ]; then
        echo "${prefix%/}/"
    else
        echo ""
    fi
}

LOCAL_IMAGE_PREFIX=$(determine_local_image_prefix)

resolve_package_name() {
    local service=$1
    if [ -n "$IMAGE_PACKAGE_PREFIX" ]; then
        echo "${IMAGE_PACKAGE_PREFIX}${service}"
    else
        echo "$service"
    fi
}

resolve_local_image_name() {
    local service=$1
    local package=$(resolve_package_name "$service")
    if [ -n "$LOCAL_IMAGE_PREFIX" ]; then
        echo "${LOCAL_IMAGE_PREFIX}${package}:$IMAGE_TAG"
    else
        echo "${package}:$IMAGE_TAG"
    fi
}

show_usage() {
    echo "Usage: $0 [--all | --service <service_name>]"
    echo ""
    echo "Environment Variables (set in scripts/.env.deploy.local or scripts/.env.deploy or export):"
    echo "  GITHUB_USERNAME    Your GitHub username"
    echo "  GITHUB_REPO        Your GitHub repository name"
    echo "  GITHUB_TOKEN       Your GitHub personal access token (required if DEPLOY_ALLOW_PUSH=true)"
    echo "  DOCKER_REGISTRY    Docker registry (default: ghcr.io)"
    echo "  IMAGE_TAG          Image tag (default: latest)"
    echo "  IMAGE_NAME_PREFIX  Optional local image prefix (overrides auto ghcr path)"
    echo "  IMAGE_PACKAGE_PREFIX  Optional prefix for the package name (e.g., quasar-frontend)"
    echo "  DEPLOY_ALLOW_PUSH  Set to true to force a legacy single-arch push (default: false)"
    echo ""
    echo "Options:"
    echo "  --all                 Deploy all services"
    echo "  --service <name>      Deploy specific service (frontend, backend, admin, worker, cron)"
    echo ""
    echo "Examples:"
    echo "  cp scripts/.env.deploy.example scripts/.env.deploy.local  # Copy and edit"
    echo "  $0 --all"
    echo "  $0 --service frontend"
}

check_env() {
    if [ -z "$GITHUB_USERNAME" ]; then
        echo -e "${RED}Error: GITHUB_USERNAME environment variable is required${NC}"
        exit 1
    fi

    if [ -z "$GITHUB_REPO" ]; then
        echo -e "${RED}Error: GITHUB_REPO environment variable is required${NC}"
        exit 1
    fi

    if [ "$DEPLOY_ALLOW_PUSH" = "true" ] && [ -z "$GITHUB_TOKEN" ]; then
        echo -e "${RED}Error: GITHUB_TOKEN environment variable is required${NC}"
        exit 1
    fi
}

login_to_ghcr() {
    echo -e "${YELLOW}Logging in to GitHub Container Registry...${NC}"
    echo "$GITHUB_TOKEN" | docker login $REGISTRY -u $GITHUB_USERNAME --password-stdin
    echo -e "${GREEN}Successfully logged in${NC}"
}

deploy_service() {
    local service=$1
    local package=$(resolve_package_name "$service")
    local image_name=$(resolve_local_image_name "$service")
    local fallback_image="$service:$IMAGE_TAG"
    local registry_image="$REGISTRY/$GITHUB_USERNAME/$GITHUB_REPO/$package:$IMAGE_TAG"
    local package_url=""

    if [ "$REGISTRY" = "ghcr.io" ]; then
        package_url="https://github.com/$GITHUB_USERNAME/$GITHUB_REPO/pkgs/container/$package"
    else
        package_url="$registry_image"
    fi

    echo -e "${YELLOW}Deploying $service...${NC}"

    if [ "$DEPLOY_ALLOW_PUSH" != "true" ]; then
        echo -e "${YELLOW}Skipping push (DEPLOY_ALLOW_PUSH != true).${NC}"
        echo -e "${GREEN}Image reference: $registry_image${NC}"
        echo -e "${GREEN}Package: $package_url${NC}"
        return
    fi

    # Check if local image exists
    if ! docker image inspect "$image_name" > /dev/null 2>&1; then
        if [ "$image_name" != "$fallback_image" ] && docker image inspect "$fallback_image" > /dev/null 2>&1; then
            image_name="$fallback_image"
        else
            echo -e "${RED}Error: Local image '$image_name' not found. Please build it first.${NC}"
            exit 1
        fi
    fi

    # Tag the image
    echo -e "${YELLOW}Tagging $image_name as $registry_image${NC}"
    docker tag "$image_name" "$registry_image"

    # Push the image
    echo -e "${YELLOW}Pushing $registry_image${NC}"
    docker push "$registry_image"

    echo -e "${GREEN}Successfully deployed $service${NC}"
    echo -e "${GREEN}Package: $package_url${NC}"
}

# Parse arguments
if [ $# -eq 0 ]; then
    show_usage
    exit 1
fi

check_env

if [ "$DEPLOY_ALLOW_PUSH" = "true" ]; then
    login_to_ghcr
fi

case $1 in
    --all)
        echo -e "${YELLOW}Deploying all services...${NC}"
        for service in "${SERVICES[@]}"; do
            deploy_service $service
        done
        echo -e "${GREEN}All services deployed successfully${NC}"
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
        deploy_service $service
        ;;
    *)
        echo -e "${RED}Error: Invalid option '$1'${NC}"
        show_usage
        exit 1
        ;;
esac

echo -e "${GREEN}Deployment completed!${NC}"
