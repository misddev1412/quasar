#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-80}"

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

verify_build_artifacts() {
  local required_files=(
    "dist/apps/backend/main.js"
    "dist/apps/frontend/.next/standalone/server.js"
    "dist/apps/admin/index.html"
  )

  local missing_artifacts=()
  for file in "${required_files[@]}"; do
    if [[ ! -e "${file}" ]]; then
      missing_artifacts+=("${file}")
    fi
  done

  if [[ "${SKIP_RUNTIME_BUILD:-0}" == "1" ]]; then
    echo "SKIP_RUNTIME_BUILD=1 -> skipping build artifact verification."
    return
  fi

  if [[ "${#missing_artifacts[@]}" -gt 0 ]]; then
    echo "Missing build artifacts detected:"
    printf '  - %s\n' "${missing_artifacts[@]}"
    echo "Runtime containers should already contain compiled assets. Run deploy/build.sh or rebuild the image in CI before deploying."
    exit 1
  fi
}

verify_build_artifacts

if [[ "${SKIP_RUNTIME_SERVERS:-0}" == "1" ]]; then
  echo "SKIP_RUNTIME_SERVERS=1 -> build artifacts prepared, skipping nginx/pm2 startup."
  exit 0
fi

start_nginx() {
  if ! command -v nginx >/dev/null 2>&1; then
    echo "Warning: nginx not found in PATH, skipping reverse proxy startup."
    return 1
  fi

  local possible_dirs=(
    "${TEMPLATE_DIR:-}"
    "${SCRIPT_DIR}"
    "${REPO_ROOT}/deploy"
    "/deploy"
    "/app/deploy"
    "./deploy"
  )

  local template=""
  for dir in "${possible_dirs[@]}"; do
    if [[ -n "${dir}" && -f "${dir}/nginx.conf.template" ]]; then
      template="${dir}/nginx.conf.template"
      break
    fi
  done

  if [[ -z "${template}" ]]; then
    echo "Warning: nginx.conf.template not found. Skipping nginx startup." >&2
    return 1
  fi

  local nginx_conf_dir="/etc/nginx"
  local nginx_conf_extra=()

  if [[ ! -d "${nginx_conf_dir}" || ! -w "${nginx_conf_dir}" ]]; then
    nginx_conf_dir="${REPO_ROOT}/tmp/nginx"
    mkdir -p "${nginx_conf_dir}"
    nginx_conf_extra=(-c "${nginx_conf_dir}/nginx.conf")
  fi

  local nginx_conf="${nginx_conf_dir}/nginx.conf"
  envsubst '${PORT}' < "${template}" > "${nginx_conf}"

  echo "Starting nginx on port ${PORT}..."
  nginx "${nginx_conf_extra[@]}"
}

BACKEND_PID=""
FRONTEND_PID=""
ADMIN_PID=""

start_backend_process() {
  local port="${1}"
  local backend_entry="dist/apps/backend/main.js"
  if [[ ! -f "${backend_entry}" ]]; then
    echo "Backend artifact missing (${backend_entry}); skipping backend start." >&2
    return
  fi
  echo "Starting API server on port ${port}..."
  PORT="${port}" NODE_ENV=production node "${backend_entry}" &
  BACKEND_PID=$!
}

start_admin_process() {
  local port="${1}"
  local admin_dir="dist/apps/admin"
  if [[ ! -d "${admin_dir}" ]]; then
    echo "Admin build not found (${admin_dir}); skipping admin server." >&2
    return
  fi
  echo "Starting admin static server on port ${port}..."
  ADMIN_PORT="${port}" PORT="${port}" NODE_ENV=production node deploy/serve-static.js "${admin_dir}" &
  ADMIN_PID=$!
}

start_frontend_process() {
  local port="${1}"
  local entry="dist/apps/frontend/.next/standalone/server.js"
  if [[ ! -f "${entry}" ]]; then
    echo "Frontend server entry missing (${entry})." >&2
    return 1
  fi
  echo "Starting storefront server on port ${port}..."
  PORT="${port}" HOSTNAME="0.0.0.0" NODE_ENV=production node "${entry}" &
  FRONTEND_PID=$!
  return 0
}

terminate_processes() {
  echo "Shutting down child processes..."
  for pid in "${FRONTEND_PID:-}" "${ADMIN_PID:-}" "${BACKEND_PID:-}"; do
    if [[ -n "${pid}" ]]; then
      kill "${pid}" >/dev/null 2>&1 || true
    fi
  done
}

if command -v pm2-runtime >/dev/null 2>&1; then
  start_nginx || true
  echo "Starting PM2 processes..."
  exec pm2-runtime ecosystem.config.cjs
else
  echo "pm2-runtime not found. Starting processes manually."
  INTERNAL_BACKEND_PORT="${BACKEND_PORT:-3000}"
  INTERNAL_ADMIN_PORT="${ADMIN_PORT:-4000}"
  INTERNAL_FRONTEND_PORT="${FRONTEND_PORT:-3000}"

  start_backend_process "${INTERNAL_BACKEND_PORT}"
  start_admin_process "${INTERNAL_ADMIN_PORT}"

  if command -v nginx >/dev/null 2>&1; then
    start_frontend_process "${INTERNAL_FRONTEND_PORT}" || exit 1
    start_nginx || true
    echo "Proxy configured: '/' → frontend:${INTERNAL_FRONTEND_PORT}, '/admin' → admin:${INTERNAL_ADMIN_PORT}, '/api' → backend:${INTERNAL_BACKEND_PORT}"
  else
    DIRECT_PORT="${PORT:-80}"
    echo "Warning: nginx unavailable. Serving storefront directly on port ${DIRECT_PORT}; admin remains on port ${INTERNAL_ADMIN_PORT}."
    start_frontend_process "${DIRECT_PORT}" || exit 1
  fi

  trap terminate_processes EXIT
  wait -n
fi
