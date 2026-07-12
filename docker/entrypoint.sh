#!/bin/sh
set -eu

PORT="${PORT:-8080}"
API_PORT="${API_PORT:-4000}"
WEB_PORT="${WEB_PORT:-3000}"

echo "Running database migrations..."
cd /app/api
if [ -x /app/node_modules/.bin/prisma ]; then
  /app/node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma
else
  node /app/node_modules/prisma/build/index.js migrate deploy --schema=./prisma/schema.prisma
fi

echo "Starting API on :${API_PORT}"
API_PORT="${API_PORT}" node /app/api/dist/main.js &

echo "Starting Web on :${WEB_PORT}"
cd /app
PORT="${WEB_PORT}" HOSTNAME=0.0.0.0 node apps/web/server.js &

sed "s/LISTEN_PORT/${PORT}/g" /etc/nginx/nginx.conf.template > /etc/nginx/http.d/default.conf

echo "Starting nginx on :${PORT}"
exec nginx -g 'daemon off;'
