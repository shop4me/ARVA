#!/usr/bin/env bash
set -euo pipefail

APP_NAME="arva"
BRANCH="main"
EXPECTED_REMOTE="git@github.com:shop4me/ARVA.git"

SSH_HOST="do-arva"

SERVER_APP_DIR="/var/www/arva"
SERVER_ENV_FILE="/etc/arva.env"
SERVER_FINGERPRINT_FILE="/etc/arva_server_id"
EXPECTED_FINGERPRINT="arva-prod 143.198.99.0"

SERVER_LOG_DIR="/var/log/arva/deploy"
SYSTEMD_SERVICE="arva"
HEALTHCHECK_URL="http://127.0.0.1:3001/"

FOLLOW=0
FORCE=0
AUTO_COMMIT_MSG=""
BOOTSTRAP=0

MODE_DEPLOY=1
MODE_STATUS=0
MODE_LOGS=0
LOG_JOB_ID=""

usage() { echo "Use npm run deploy:prod / deploy:status / deploy:logs"; }

log() { echo "[$(date -Is)] $*"; }

while [[ $# -gt 0 ]]; do
  case "$1" in
    --follow) FOLLOW=1; shift ;;
    --force) FORCE=1; shift ;;
    --bootstrap) BOOTSTRAP=1; shift ;;
    --auto-commit) AUTO_COMMIT_MSG="${2:-}"; shift 2 ;;
    --status) MODE_DEPLOY=0; MODE_STATUS=1; shift ;;
    --logs) MODE_DEPLOY=0; MODE_LOGS=1; shift ;;
    --job) LOG_JOB_ID="${2:-}"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ensure_branch_and_remote() {
  local cur_branch
  cur_branch="$(git rev-parse --abbrev-ref HEAD)"
  [[ "$cur_branch" == "$BRANCH" ]] || { echo "ERROR: Must deploy from $BRANCH (current: $cur_branch)"; exit 1; }

  local remote
  remote="$(git remote get-url origin)"
  [[ "$remote" == "$EXPECTED_REMOTE" ]] || {
    echo "ERROR: origin remote mismatch."
    echo "Expected: $EXPECTED_REMOTE"
    echo "Found:    $remote"
    exit 1
  }
}

require_clean_or_override() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    if [[ -n "$AUTO_COMMIT_MSG" ]]; then
      log "Auto-committing: $AUTO_COMMIT_MSG"
      git add -A
      git commit -m "$AUTO_COMMIT_MSG"
    elif [[ "$FORCE" -eq 1 ]]; then
      log "--force: continuing with dirty tree"
    else
      echo "ERROR: Dirty tree. Commit or use --auto-commit or --force."
      exit 1
    fi
  fi
}

push_and_get_sha() {
  log "Pushing $BRANCH..."
  git push origin "$BRANCH"
  LOCAL_SHA="$(git rev-parse HEAD)"
  log "SHA to deploy: $LOCAL_SHA"
}

server_fingerprint_check() {
  log "Checking server fingerprint..."
  set +e
  remote_fp="$(ssh "$SSH_HOST" "cat '$SERVER_FINGERPRINT_FILE' 2>/dev/null")"
  rc=$?
  set -e

  if [[ $rc -ne 0 || -z "$remote_fp" ]]; then
    if [[ "$BOOTSTRAP" -eq 1 ]]; then
      ssh "$SSH_HOST" "echo '$EXPECTED_FINGERPRINT' | sudo tee '$SERVER_FINGERPRINT_FILE' >/dev/null"
      ssh "$SSH_HOST" "sudo mkdir -p '$SERVER_LOG_DIR'"
    else
      echo "ERROR: Missing fingerprint. Run with --bootstrap once."
      exit 1
    fi
  else
    [[ "$remote_fp" == "$EXPECTED_FINGERPRINT" ]] || {
      echo "ERROR: Fingerprint mismatch."
      exit 1
    fi
  fi
}

show_status() {
  ssh "$SSH_HOST" "ls -1t '$SERVER_LOG_DIR'/*.status 2>/dev/null | head -n 1" | while read -r f; do
    [[ -z "$f" ]] && { echo "No deploy status found."; exit 0; }
    job="$(basename "$f" .status)"
    status="$(ssh "$SSH_HOST" "cat '$f'")"
    echo "$job: $status"
  done
}

show_logs() {
  if [[ -n "$LOG_JOB_ID" ]]; then
    ssh "$SSH_HOST" "sed -n '1,260p' '$SERVER_LOG_DIR/$LOG_JOB_ID.log' 2>/dev/null || echo 'Log not found'"
    exit 0
  fi
  ssh "$SSH_HOST" "ls -1t '$SERVER_LOG_DIR'/*.log 2>/dev/null | head -n 1" | while read -r f; do
    [[ -z "$f" ]] && { echo "No deploy logs found."; exit 0; }
    ssh "$SSH_HOST" "sed -n '1,260p' '$f'"
  done
}

start_tmux_deploy_job() {
  short_sha="${LOCAL_SHA:0:7}"
  JOB_ID="deploy_$(date +%Y%m%d%H%M%S)_${short_sha}"
  log "Starting tmux job: $JOB_ID"

  ssh "$SSH_HOST" "bash -s" << REMOTE_SCRIPT
set -euo pipefail
JOB_ID='$JOB_ID'
LOCAL_SHA='$LOCAL_SHA'
SERVER_APP_DIR='$SERVER_APP_DIR'
SERVER_LOG_DIR='$SERVER_LOG_DIR'
SYSTEMD_SERVICE='$SYSTEMD_SERVICE'
HEALTHCHECK_URL='$HEALTHCHECK_URL'

mkdir -p "\$SERVER_LOG_DIR"
LOG_FILE="\$SERVER_LOG_DIR/\$JOB_ID.log"
STATUS_FILE="\$SERVER_LOG_DIR/\$JOB_ID.status"
echo RUNNING > "\$STATUS_FILE"

tmux new-session -d -s "\$JOB_ID" "bash -lc '
  set -euo pipefail
  echo \"=== ARVA deploy $JOB_ID ===\"
  echo \"SHA: $LOCAL_SHA\"
  date -Is

  cd $SERVER_APP_DIR
  git fetch --all --prune
  git checkout -f $LOCAL_SHA
  echo $LOCAL_SHA > REVISION

  if [[ -f package-lock.json ]]; then npm ci; else npm install; fi
  npm run build

  sudo systemctl restart $SYSTEMD_SERVICE
  sleep 3
  sudo systemctl is-active --quiet $SYSTEMD_SERVICE

  curl -fsS -o /dev/null $HEALTHCHECK_URL

  echo OK > $SERVER_LOG_DIR/$JOB_ID.status
  echo \"OK\"
' >> \"\$LOG_FILE\" 2>&1 || {
  echo FAIL > \"\$STATUS_FILE\"
  exit 1
}"
echo "\$JOB_ID"
REMOTE_SCRIPT
}

follow_job() {
  if [[ "$FOLLOW" -eq 0 ]]; then
    log "Deploy started ($JOB_ID). Use deploy:status or deploy:logs."
    return 0
  fi

  log "Following status..."
  while true; do
    status="$(ssh "$SSH_HOST" "cat '$SERVER_LOG_DIR/$JOB_ID.status' 2>/dev/null || true")"
    if [[ "$status" == "OK" ]]; then
      log "Deploy OK ✅ ($JOB_ID)"
      return 0
    elif [[ "$status" == "FAIL" ]]; then
      log "Deploy FAIL ❌ ($JOB_ID)"
      ssh "$SSH_HOST" "tail -n 120 '$SERVER_LOG_DIR/$JOB_ID.log' || true"
      return 1
    else
      sleep 2
    fi
  done
}

if [[ "$MODE_STATUS" -eq 1 ]]; then show_status; exit 0; fi
if [[ "$MODE_LOGS" -eq 1 ]]; then show_logs; exit 0; fi

ensure_branch_and_remote
require_clean_or_override
push_and_get_sha
server_fingerprint_check
JOB_ID="$(start_tmux_deploy_job | tr -d '\n')"
follow_job
