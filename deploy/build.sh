#!/usr/bin/env bash
set -euo pipefail

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

export NX_DAEMON=false

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

trap stop_temp_backend_for_frontend_build EXIT

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

install_dependencies() {
  if [[ "${SKIP_BUILD_INSTALL:-0}" == "1" ]]; then
    echo "SKIP_BUILD_INSTALL=1 -> skipping dependency installation."
    return
  fi

  echo "Installing dependencies..."
  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
  fi
  yarn install --frozen-lockfile
}

prepare_frontend_artifacts() {
  local standalone_dir="dist/apps/frontend/.next/standalone"
  local nested_server="${standalone_dir}/apps/frontend/server.js"
  local expected_server="${standalone_dir}/server.js"

  mkdir -p dist/apps/frontend
  rm -rf dist/apps/frontend/.next
  mkdir -p dist/apps/frontend/.next
  cp -R "${REPO_ROOT}/apps/frontend/.next/." "dist/apps/frontend/.next"

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
}

build_artifacts() {
  install_dependencies

  build_with_fallback "Building backend" "dist/apps/backend/main.js" bash -c "npx nx build backend --configuration=production"

  build_with_fallback "Building admin" "dist/apps/admin/index.html" bash -c "npx nx build admin --configuration=production"

  start_temp_backend_for_frontend_build
  local frontend_status=0
  if run_build_step "Building frontend (Next.js)" bash -c 'npx nx build frontend --configuration=production'; then
    frontend_status=0
  else
    frontend_status=$?
  fi
  stop_temp_backend_for_frontend_build

  if [[ ${frontend_status} -ne 0 && ! -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]]; then
    echo "Error: Frontend build failed and no previous build found." >&2
    exit 1
  fi

  prepare_frontend_artifacts

  local required_files=(
    "dist/apps/backend/main.js"
    "dist/apps/frontend/.next/standalone/server.js"
    "dist/apps/admin/index.html"
  )

  local missing=0
  for file in "${required_files[@]}"; do
    if [[ ! -f "${file}" ]]; then
      echo "Required build artifact missing after build: ${file}" >&2
      missing=1
    fi
  done

  if [[ ${missing} -eq 1 ]]; then
    exit 1
  fi

  echo "Build artifacts generated:"
  printf '  - %s\n' "${required_files[@]}"
}

build_artifacts
