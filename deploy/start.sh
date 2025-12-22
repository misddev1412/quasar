#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-8080}"

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${REPO_ROOT}"

ensure_build_artifacts() {
  local missing=false
  [[ -f "dist/apps/api/server.js" ]] || missing=true
  [[ -f "dist/apps/web/server.js" ]] || missing=true
  [[ -f "dist/apps/admin/server.js" ]] || missing=true

  if [[ "${missing}" == true ]]; then
    echo "Build artifacts missing – installing dependencies and building apps..."
    if command -v corepack >/dev/null 2>&1; then
      corepack enable >/dev/null 2>&1 || true
    fi
    yarn install --frozen-lockfile
    yarn nx run-many -t build --projects=api,web,admin --configuration=production
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
