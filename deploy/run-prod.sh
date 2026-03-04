#!/usr/bin/env sh
set -eu

# One-command production deploy from GHCR.
# Required env vars:
#   GITHUB_USERNAME
#   GITHUB_TOKEN (PAT with read:packages)
# Optional env vars:
#   IMAGE_NAME      (default: quasar)
#   IMAGE_TAG       (default: latest)
#   CONTAINER_NAME  (default: quasar)
#   HOST_PORT       (default: 80)
#   CONTAINER_PORT  (default: 80)
#   ENV_FILE        (default: .env)

REGISTRY="ghcr.io"
IMAGE_NAME="${IMAGE_NAME:-quasar}"
IMAGE_TAG="${IMAGE_TAG:-latest}"
CONTAINER_NAME="${CONTAINER_NAME:-quasar}"
HOST_PORT="${HOST_PORT:-80}"
CONTAINER_PORT="${CONTAINER_PORT:-80}"
ENV_FILE="${ENV_FILE:-.env}"

if [ -z "${GITHUB_USERNAME:-}" ]; then
  echo "Error: GITHUB_USERNAME is required." >&2
  exit 1
fi

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "Error: GITHUB_TOKEN is required (PAT with read:packages)." >&2
  exit 1
fi

if [ ! -f "${ENV_FILE}" ]; then
  echo "Error: env file not found: ${ENV_FILE}" >&2
  exit 1
fi

IMAGE_REF="${REGISTRY}/${GITHUB_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
IMAGE_REF_LC=$(printf '%s' "${IMAGE_REF}" | tr '[:upper:]' '[:lower:]')

echo "Logging into ${REGISTRY}..."
printf '%s' "${GITHUB_TOKEN}" | docker login "${REGISTRY}" --username "${GITHUB_USERNAME}" --password-stdin >/dev/null

echo "Pulling ${IMAGE_REF_LC}..."
docker pull "${IMAGE_REF_LC}"

echo "Replacing container ${CONTAINER_NAME}..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

docker run -d \
  --name "${CONTAINER_NAME}" \
  --restart unless-stopped \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --env-file "${ENV_FILE}" \
  "${IMAGE_REF_LC}"

echo "Deploy complete: ${CONTAINER_NAME} -> ${IMAGE_REF_LC}"
