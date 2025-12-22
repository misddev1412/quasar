#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-8080}"

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

  local parents=("/workspace" "/app" "/code" "/src")
  for parent in "${parents[@]}"; do
    for dir in "${parent}" "${parent}"/*; do
      if [[ -n "${dir}" && -f "${dir}/package.json" ]]; then
        echo "${dir}"
        return 0
      fi
    done
  done

  echo "Unable to locate repository root (package.json not found)" >&2
  exit 1
}

REPO_ROOT="$(find_repo_root)"
cd "${REPO_ROOT}"

ensure_build_artifacts() {
  local required_files=(
    "dist/apps/backend/main.js"
    "dist/apps/frontend/.next/standalone/server.js"
    "dist/apps/admin/index.html"
  )

  local needs_build=false
  for file in "${required_files[@]}"; do
    [[ -f "${file}" ]] || needs_build=true
  done

  if [[ "${needs_build}" == true ]]; then
    echo "Build artifacts missing – installing dependencies and building apps..."
    if command -v corepack >/dev/null 2>&1; then
      corepack enable >/dev/null 2>&1 || true
    fi
    yarn install --frozen-lockfile
    yarn build
    for file in "${required_files[@]}"; do
      if [[ ! -f "${file}" ]]; then
        echo "Required build artifact missing after build: ${file}" >&2
        exit 1
      fi
    done
  fi
}

ensure_build_artifacts

POSSIBLE_TEMPLATE_DIRS=(
  "${TEMPLATE_DIR:-}"
  "${SCRIPT_DIR}"
  "${REPO_ROOT}/deploy"
  "/deploy"
  "/app/deploy"
  "./deploy"
)

NGINX_TEMPLATE=""
for dir in "${POSSIBLE_TEMPLATE_DIRS[@]}"; do
  if [[ -n "${dir}" && -f "${dir}/nginx.conf.template" ]]; then
    NGINX_TEMPLATE="${dir}/nginx.conf.template"
    break
  fi
done

NGINX_TEMPLATE="${NGINX_TEMPLATE:-}"
NGINX_CONF="/etc/nginx/nginx.conf"

if [[ -z "${NGINX_TEMPLATE}" ]]; then
  echo "Nginx template not found at ${NGINX_TEMPLATE}" >&2
  exit 1
fi

envsubst '${PORT}' < "${NGINX_TEMPLATE}" > "${NGINX_CONF}"

nginx

exec pm2-runtime ecosystem.config.cjs
