#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage: deploy/push-local.sh <local-image-tag> [remote-tag]

Example:
  DOCKER_REGISTRY=ghcr.io GITHUB_USERNAME=my-org GITHUB_REPO=quasar \
  GITHUB_TOKEN=ghp_xxx \
    deploy/push-local.sh quasar:local 1a2b3c4

Environment:
  DOCKER_REGISTRY              Container registry domain (default: ghcr.io).
  IMAGE_NAME or DOCR_IMAGE     Remote repository name (e.g. owner/repo or repo).
  GITHUB_USERNAME              Registry username/owner.
  GITHUB_REPO                  Repository name (used when IMAGE_NAME is not set).
  GITHUB_TOKEN                 Required for registry login.
  PUSH_LATEST=1                Also tag/push :latest.
EOF
  exit 1
}

if [[ $# -lt 1 || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
fi

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"

find_repo_root() {
  local candidates=(
    "${REPO_ROOT:-}"
    "${SCRIPT_DIR}"
    "$(cd "${SCRIPT_DIR}/.." && pwd)"
    "/workspace"
    "/workspace/app"
    "/workspace/src"
    "/app"
    "/code"
    "/src"
    "$(pwd)"
  )

  for dir in "${candidates[@]}"; do
    if [[ -n "${dir}" && -f "${dir}/package.json" ]]; then
      echo "${dir}"
      return 0
    fi
  done

  echo "Unable to locate repository root (package.json not found)" >&2
  exit 1
}

REPO_ROOT="$(find_repo_root)"

load_env_file() {
  local env_file="${1:-.env}"
  if [[ -f "${env_file}" ]]; then
    echo "Loading environment variables from ${env_file}"
    # shellcheck disable=SC2046
    set -a
    # shellcheck disable=SC1090
    source "${env_file}"
    set +a
  fi
}

load_env_file "${REPO_ROOT}/.env"

cd "${REPO_ROOT}"

LOCAL_IMAGE="$1"
REMOTE_TAG="${2:-$(git rev-parse --short HEAD 2>/dev/null || date +%s)}"
REMOTE_IMAGE="${DOCR_IMAGE:-${IMAGE_NAME:-}}"
REGISTRY="${DOCKER_REGISTRY:-ghcr.io}"
USERNAME="${GITHUB_USERNAME:-${GITHUB_ACTOR:-}}"
ACCESS_TOKEN="${GITHUB_TOKEN:-${CR_PAT:-}}"
GITHUB_REPO_NAME="${GITHUB_REPO:-}"

if [[ -z "${REMOTE_IMAGE}" && -n "${USERNAME}" && -n "${GITHUB_REPO_NAME}" ]]; then
  REMOTE_IMAGE="${USERNAME}/${GITHUB_REPO_NAME}"
fi

if [[ -z "${REMOTE_IMAGE}" ]]; then
  echo "Error: set IMAGE_NAME/DOCR_IMAGE or provide GITHUB_USERNAME + GITHUB_REPO." >&2
  exit 1
fi

if [[ "${REMOTE_IMAGE}" != */* ]]; then
  if [[ -z "${USERNAME}" ]]; then
    echo "Error: GITHUB_USERNAME is required when IMAGE_NAME has no owner prefix." >&2
    exit 1
  fi
  REMOTE_IMAGE="${USERNAME}/${REMOTE_IMAGE}"
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: docker CLI not found." >&2
  exit 1
fi

if [[ -z "${ACCESS_TOKEN}" ]]; then
  echo "Error: GITHUB_TOKEN (or CR_PAT) env var is required for registry login." >&2
  exit 1
fi

if [[ "${SKIP_DOCKER_BUILD:-0}" == "1" ]]; then
  echo "SKIP_DOCKER_BUILD=1 -> skipping docker build step."
else
  BUILD_CONTEXT="${DOCKER_BUILD_CONTEXT:-.}"
  DOCKERFILE_PATH="${DOCKERFILE_PATH:-Dockerfile}"
  echo "Building ${LOCAL_IMAGE} from ${DOCKERFILE_PATH} (context: ${BUILD_CONTEXT})..."
  docker build -t "${LOCAL_IMAGE}" -f "${DOCKERFILE_PATH}" "${BUILD_CONTEXT}"
fi

if ! docker image inspect "${LOCAL_IMAGE}" >/dev/null 2>&1; then
  echo "Error: local image '${LOCAL_IMAGE}' not found after build." >&2
  exit 1
fi

echo "Logging into ${REGISTRY}..."
echo "${ACCESS_TOKEN}" | docker login "${REGISTRY}" --username "${USERNAME}" --password-stdin >/dev/null

remote_image_lc="${REMOTE_IMAGE,,}"
REMOTE_REF="${REGISTRY}/${remote_image_lc}:${REMOTE_TAG}"
echo "Tagging ${LOCAL_IMAGE} → ${REMOTE_REF}"
docker tag "${LOCAL_IMAGE}" "${REMOTE_REF}"

echo "Pushing ${REMOTE_REF}..."
docker push "${REMOTE_REF}"

if [[ "${PUSH_LATEST:-0}" == "1" ]]; then
  LATEST_REF="${REGISTRY}/${remote_image_lc}:latest"
  echo "Tagging ${LOCAL_IMAGE} → ${LATEST_REF}"
  docker tag "${LOCAL_IMAGE}" "${LATEST_REF}"
  echo "Pushing ${LATEST_REF}..."
  docker push "${LATEST_REF}"
fi

echo "Push complete."
