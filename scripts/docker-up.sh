#!/usr/bin/env bash
# Bring up BachatKhata API + UI + Postgres via Docker Compose.
# Run this from Terminal.app / iTerm (not required if Cursor sandbox is disabled).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if ! docker info >/dev/null 2>&1; then
  echo "Docker daemon is not reachable."
  echo "Start Docker Desktop from Applications, wait until it says Running, then re-run."
  exit 1
fi

if [[ ! -f .env.docker ]]; then
  cp .env.docker.example .env.docker
  echo "Created .env.docker — set GEMINI_API_KEY before import flows will work."
fi

echo "Building and starting stack..."
docker compose --env-file .env.docker up --build -d

echo
echo "Waiting for API..."
for i in $(seq 1 60); do
  if curl -sf "http://localhost:3000/benefits?sort=expiring_soon" >/dev/null 2>&1; then
    echo "API OK"
    break
  fi
  sleep 2
  if [[ "$i" -eq 60 ]]; then
    echo "API did not become ready. Logs:"
    docker compose logs --tail=80 api
    exit 1
  fi
done

echo "Waiting for UI..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:8080/" >/dev/null 2>&1; then
    echo "UI OK"
    break
  fi
  sleep 1
done

echo
echo "UI      → http://localhost:8080"
echo "API     → http://localhost:3000"
echo "Swagger → http://localhost:3000/api/docs"
docker compose ps
