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

run_database_migrations() {
  if [[ "${SKIP_DB_MIGRATIONS:-0}" == "1" ]]; then
    echo "SKIP_DB_MIGRATIONS=1 -> skipping database migrations."
    return
  fi

  local backend_dir="${REPO_ROOT}/apps/backend"
  if [[ ! -d "${backend_dir}" ]]; then
    echo "Backend directory not found at ${backend_dir}; skipping migrations." >&2
    return
  fi

  if [[ ! -f "${backend_dir}/migration-data-source.ts" ]]; then
    echo "migration-data-source.ts not found in ${backend_dir}; skipping migrations." >&2
    return
  fi

  echo "Running database migrations..."
  (
    cd "${backend_dir}"
    if ! npx typeorm-ts-node-commonjs migration:run -d migration-data-source.ts; then
      echo "Database migrations failed." >&2
      exit 1
    fi
  )
  echo "Database migrations completed."
}

INTERNAL_BACKEND_PORT="${BACKEND_PORT:-3000}"
INTERNAL_ADMIN_PORT="${ADMIN_PORT:-4000}"
INTERNAL_FRONTEND_PORT="${FRONTEND_PORT:-3000}"

build_host_block() {
  local host="$1"
  local upstream="$2"
  local label="$3"
  local block
  block=$(cat <<'EOF'
  server {
    listen __PORT__;
    server_name __HOST__;

    # Host-based routing for __LABEL__
    proxy_set_header Host              $host;
    proxy_set_header X-Real-IP         $remote_addr;
    proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;

    location / {
      proxy_http_version 1.1;
      proxy_set_header Upgrade    $http_upgrade;
      proxy_set_header Connection "upgrade";
      proxy_pass __UPSTREAM__;
    }
  }

EOF
)
  block="${block//__PORT__/${PORT}}"
  block="${block//__HOST__/${host}}"
  block="${block//__UPSTREAM__/${upstream}}"
  block="${block//__LABEL__/${label}}"
  printf '%s' "${block}"
}

ADMIN_SERVER_BLOCK=""
if [[ -n "${ADMIN_HOST:-}" ]]; then
  ADMIN_SERVER_BLOCK="$(build_host_block "${ADMIN_HOST}" "http://127.0.0.1:${INTERNAL_ADMIN_PORT}/" "admin")"
fi

API_SERVER_BLOCK=""
if [[ -n "${API_HOST:-}" ]]; then
  API_SERVER_BLOCK="$(build_host_block "${API_HOST}" "http://127.0.0.1:${INTERNAL_BACKEND_PORT}/" "api")"
fi

FRONTEND_SERVER_BLOCK=""
if [[ -n "${FRONTEND_HOST:-}" ]]; then
  FRONTEND_SERVER_BLOCK="$(build_host_block "${FRONTEND_HOST}" "http://127.0.0.1:${INTERNAL_FRONTEND_PORT}" "storefront")"
fi

export ADMIN_SERVER_BLOCK API_SERVER_BLOCK FRONTEND_SERVER_BLOCK
export INTERNAL_BACKEND_PORT INTERNAL_ADMIN_PORT INTERNAL_FRONTEND_PORT

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

run_database_migrations

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
  envsubst '${PORT} ${INTERNAL_BACKEND_PORT} ${INTERNAL_ADMIN_PORT} ${INTERNAL_FRONTEND_PORT} ${ADMIN_SERVER_BLOCK} ${API_SERVER_BLOCK} ${FRONTEND_SERVER_BLOCK}' < "${template}" > "${nginx_conf}"

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
  ADMIN_PORT="${port}" PORT="${port}" NODE_ENV=production node deploy/serve-static.js &
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
