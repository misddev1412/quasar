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

TEMP_BUILD_BACKEND_PID=""

is_port_in_use() {
  local port="$1"
  if command -v ss >/dev/null 2>&1; then
    ss -ltn | awk 'NR>1 {print $4}' | grep -Eq "(:|\\.)${port}$"
    return $?
  elif command -v lsof >/dev/null 2>&1; then
    lsof -iTCP -sTCP:LISTEN -Pn | grep -q ":${port} "
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -ltn | awk 'NR>2 {print $4}' | grep -Eq "(:|\\.)${port}$"
    return $?
  fi
  return 1
}

start_temp_backend_for_frontend_build() {
  local port="${BACKEND_PORT:-3000}"
  if is_port_in_use "${port}"; then
    echo "Backend port ${port} already in use. Assuming backend is running for frontend build."
    return 0
  fi
  mkdir -p "${REPO_ROOT}/tmp"
  local log_file="${REPO_ROOT}/tmp/backend-build.log"
  echo "Starting temporary backend on port ${port} for frontend build..."
  PORT="${port}" NODE_ENV=production node dist/apps/backend/main.js > "${log_file}" 2>&1 &
  TEMP_BUILD_BACKEND_PID=$!
  sleep 5
  if ! kill -0 "${TEMP_BUILD_BACKEND_PID}" >/dev/null 2>&1; then
    echo "Failed to start temporary backend. Check ${log_file} for details."
    TEMP_BUILD_BACKEND_PID=""
  else
    echo "Temporary backend started (PID ${TEMP_BUILD_BACKEND_PID}). Logs: ${log_file}"
  fi
}

stop_temp_backend_for_frontend_build() {
  if [[ -n "${TEMP_BUILD_BACKEND_PID}" ]]; then
    echo "Stopping temporary backend used for frontend build..."
    kill "${TEMP_BUILD_BACKEND_PID}" >/dev/null 2>&1 || true
    wait "${TEMP_BUILD_BACKEND_PID}" >/dev/null 2>&1 || true
    TEMP_BUILD_BACKEND_PID=""
  fi
}

ensure_build_artifacts() {
  if [[ "${SKIP_RUNTIME_BUILD:-0}" == "1" ]]; then
    echo "SKIP_RUNTIME_BUILD=1 -> skipping runtime yarn install/build."
    return
  fi

  local required_files=(
    "dist/apps/backend/main.js"
    "dist/apps/frontend/.next/standalone/server.js"
    "dist/apps/admin/index.html"
  )

  echo "Installing dependencies and rebuilding backend/frontend/admin..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
  fi
  yarn install --frozen-lockfile

  run_build_step() {
    local description="$1"
    shift
    echo "${description}..."
    if "$@"; then
      return 0
    fi
    return 1
  }

  build_with_fallback() {
    local description="$1"
    local artifact="$2"
    shift 2
    if run_build_step "${description}" "$@"; then
      return 0
    fi
    if [[ -f "${artifact}" ]]; then
      echo "Warning: ${description} failed, but existing artifact found at ${artifact}. Continuing with existing build."
      return 0
    fi
    echo "Error: ${description} failed and ${artifact} does not exist." >&2
    exit 1
  }

  build_with_fallback "Building backend" "dist/apps/backend/main.js" bash -c "cd apps/backend && NX_TASK_TARGET_PROJECT=backend NX_TASK_TARGET_TARGET=build NX_TASK_TARGET_CONFIGURATION=production npx webpack-cli build --node-env=production"

  build_with_fallback "Building admin" "dist/apps/admin/index.html" bash -c "cd apps/admin && NX_TASK_TARGET_PROJECT=admin NX_TASK_TARGET_TARGET=build NX_TASK_TARGET_CONFIGURATION=production npx webpack-cli build --node-env=production"

  start_temp_backend_for_frontend_build
  local frontend_status=0
  if run_build_step "Building frontend (Next.js)" bash -c '(cd apps/frontend && npx next build)'; then
    frontend_status=0
  else
    frontend_status=$?
  fi
  stop_temp_backend_for_frontend_build

  if [[ ${frontend_status} -ne 0 && ! -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]]; then
    echo "Error: Frontend build failed and no previous build found." >&2
    exit 1
  fi

  mkdir -p dist/apps/frontend
  rm -rf dist/apps/frontend/.next
  ln -sfn "${REPO_ROOT}/apps/frontend/.next" "dist/apps/frontend/.next"

  local standalone_dir="dist/apps/frontend/.next/standalone"
  local nested_server="${standalone_dir}/apps/frontend/server.js"
  local expected_server="${standalone_dir}/server.js"
  if [[ -f "${nested_server}" ]]; then
    cat > "${expected_server}" <<'EOF'
#!/usr/bin/env node
require('./apps/frontend/server.js');
EOF
    chmod +x "${expected_server}"
  fi

  if [[ -d "${standalone_dir}/apps/frontend/.next" ]]; then
    rm -rf "${standalone_dir}/apps/frontend/.next/static"
    if [[ -d "${REPO_ROOT}/apps/frontend/.next/static" ]]; then
      cp -R "${REPO_ROOT}/apps/frontend/.next/static" "${standalone_dir}/apps/frontend/.next/static"
    fi
  fi

  for file in "${required_files[@]}"; do
    if [[ ! -f "${file}" ]]; then
      echo "Required build artifact missing after build: ${file}" >&2
      exit 1
    fi
  done
}

ensure_build_artifacts

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
    DIRECT_PORT="${PORT:-8080}"
    echo "Warning: nginx unavailable. Serving storefront directly on port ${DIRECT_PORT}; admin remains on port ${INTERNAL_ADMIN_PORT}."
    start_frontend_process "${DIRECT_PORT}" || exit 1
  fi

  trap terminate_processes EXIT
  wait -n
fi
