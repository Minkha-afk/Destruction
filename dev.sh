#!/usr/bin/env bash
#
# Elevana — start every service + the frontend at once (Git Bash / macOS / Linux).
#
# Usage:
#   ./dev.sh
#
# Streams all logs into this terminal. Ctrl+C stops everything.

set -euo pipefail
root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

services=(
  "auth:backend/auth-services:4000"
  "chat:backend/chat-service:5000"
  "course:backend/course-service:6100"
  "search:backend/search-service:7000"
  "web:frontend/my-app:3000"
)

pids=()
cleanup() {
  echo ""
  echo "Stopping all services..."
  for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "  Elevana launcher — starting ${#services[@]} processes"
echo "  ----------------------------------------------------"

for entry in "${services[@]}"; do
  name="${entry%%:*}"
  rest="${entry#*:}"
  path="${rest%%:*}"
  port="${rest##*:}"

  if [ ! -d "$root/$path/node_modules" ]; then
    echo "  ! $name: node_modules missing — run 'npm run install:all' first."
  fi

  # Prefix each line of the service's output with its name for readable merged logs.
  ( cd "$root/$path" && npm run dev 2>&1 | sed "s/^/[$name] /" ) &
  pids+=($!)
  echo "  -> $name  http://localhost:$port"
done

echo ""
echo "  Frontend: http://localhost:3000  (Ctrl+C to stop all)"
echo ""
wait
