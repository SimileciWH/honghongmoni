#!/bin/bash
set -Eeuo pipefail


PORT=5002
COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"
DEPLOY_RUN_PORT=5002


cd "${COZE_WORKSPACE_PATH}"

get_port_pids() {
    if command -v lsof >/dev/null 2>&1; then
      lsof -tiTCP:"${DEPLOY_RUN_PORT}" -sTCP:LISTEN 2>/dev/null | paste -sd' ' - || true
      return 0
    fi

    ss -H -lntp 2>/dev/null | awk -v port="${DEPLOY_RUN_PORT}" '$4 ~ ":"port"$"' | grep -o 'pid=[0-9]*' | cut -d= -f2 | paste -sd' ' - || true
    return 0
}

kill_port_if_listening() {
    local pids related_pids
    pids=$(get_port_pids)
    if [[ -z "${pids}" ]]; then
      echo "Port ${DEPLOY_RUN_PORT} is free."
      return
    fi

    related_pids=$(ps -eo pid=,command= | awk -v workspace="${COZE_WORKSPACE_PATH}" 'index($0, workspace) && index($0, "tsx") && index($0, "src/server.ts") {print $1}' | paste -sd' ' - || true)
    pids="${pids} ${related_pids}"
    pids=$(echo "${pids}" | tr ' ' '\n' | grep -E '^[0-9]+$' | sort -u | paste -sd' ' - || true)

    echo "Port ${DEPLOY_RUN_PORT} in use by PIDs: ${pids} (SIGKILL)"
    echo "${pids}" | xargs -n 1 kill -9
    sleep 1
    pids=$(get_port_pids)
    if [[ -n "${pids}" ]]; then
      echo "Warning: port ${DEPLOY_RUN_PORT} still busy after SIGKILL, PIDs: ${pids}"
    else
      echo "Port ${DEPLOY_RUN_PORT} cleared."
    fi
}

echo "Clearing port ${PORT} before start."
kill_port_if_listening
echo "Starting HTTP service on port ${PORT} for dev..."

PORT=$PORT npx tsx watch src/server.ts
