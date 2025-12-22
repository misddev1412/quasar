#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="${IMAGE_NAME:-quasar-mono}"
CONTAINER_NAME="${CONTAINER_NAME:-quasar-mono}"
HOST_PORT="${HOST_PORT:-8080}"
CONTAINER_PORT="${PORT:-8080}"

echo "Building Docker image ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

if docker ps -a --format '{{.Names}}' | grep -w "${CONTAINER_NAME}" >/dev/null 2>&1; then
  echo "Removing existing container ${CONTAINER_NAME}..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

echo "Starting container ${CONTAINER_NAME} on port ${HOST_PORT} -> ${CONTAINER_PORT}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  -e PORT="${CONTAINER_PORT}" \
  "${IMAGE_NAME}"

echo "Container ${CONTAINER_NAME} is running."
