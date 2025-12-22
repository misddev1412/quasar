#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-8080}"

SCRIPT_PATH="${BASH_SOURCE[0]:-$0}"
SCRIPT_DIR="$(cd "$(dirname "${SCRIPT_PATH}")" && pwd)"

POSSIBLE_TEMPLATE_DIRS=(
  "${TEMPLATE_DIR:-}"
  "${SCRIPT_DIR}"
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
