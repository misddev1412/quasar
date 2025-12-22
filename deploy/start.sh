#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-8080}"

TEMPLATE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NGINX_TEMPLATE="${TEMPLATE_DIR}/nginx.conf.template"
NGINX_CONF="/etc/nginx/nginx.conf"

if [[ ! -f "${NGINX_TEMPLATE}" ]]; then
  echo "Nginx template not found at ${NGINX_TEMPLATE}" >&2
  exit 1
fi

envsubst '${PORT}' < "${NGINX_TEMPLATE}" > "${NGINX_CONF}"

nginx

exec pm2-runtime ecosystem.config.cjs
