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

  build_with_fallback "Building backend" "dist/apps/backend/main.js" npx nx build backend

  build_with_fallback "Building admin" "dist/apps/admin/index.html" npx nx build admin

  run_build_step "Building frontend (Next.js)" bash -c '(cd apps/frontend && npx next build)'
  if [[ $? -ne 0 && ! -f "apps/frontend/.next/standalone/apps/frontend/server.js" ]]; then
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
NGINX_CONF_DIR="/etc/nginx"
NGINX_CONF_EXTRA_ARGS=()

if [[ ! -d "${NGINX_CONF_DIR}" || ! -w "${NGINX_CONF_DIR}" ]]; then
  NGINX_CONF_DIR="${REPO_ROOT}/tmp/nginx"
  mkdir -p "${NGINX_CONF_DIR}"
  NGINX_CONF_EXTRA_ARGS=(-c "${NGINX_CONF_DIR}/nginx.conf")
fi

NGINX_CONF="${NGINX_CONF_DIR}/nginx.conf"

if [[ -z "${NGINX_TEMPLATE}" ]]; then
  echo "Nginx template not found at ${NGINX_TEMPLATE}" >&2
  exit 1
fi

envsubst '${PORT}' < "${NGINX_TEMPLATE}" > "${NGINX_CONF}"

echo "Starting nginx on port ${PORT}..."
if command -v nginx >/dev/null 2>&1; then
  nginx "${NGINX_CONF_EXTRA_ARGS[@]}"
else
  echo "Warning: nginx not found in PATH, skipping reverse proxy startup."
fi

echo "Starting PM2 processes..."
if command -v pm2-runtime >/dev/null 2>&1; then
  exec pm2-runtime ecosystem.config.cjs
else
  echo "pm2-runtime not found. Starting storefront only on port ${PORT} (backend/admin not started)." >&2
  NODE_ENV=production node dist/apps/frontend/.next/standalone/server.js
fi
