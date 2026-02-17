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
MODE_STATUS=0
MODE_LOGS=0
MODE_VERSION=0
LOG_JOB_ID=""

log() { echo "[$(date -Is)] $*"; }

usage() {
  cat <<USAGE
Usage:
  npm run deploy
  npm run deploy -- --follow
  npm run deploy -- --auto-commit "Deploy: msg"
  npm run deploy -- --force
  npm run deploy -- --bootstrap
Utilities:
  npm run deploy:status
  npm run deploy:logs [-- --job JOB_ID]
  npm run deploy:version
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --follow) FOLLOW=1; shift ;;
    --force) FORCE=1; shift ;;
    --auto-commit) AUTO_COMMIT_MSG="${2:-}"; shift 2 ;;
    --bootstrap) BOOTSTRAP=1; shift ;;
    --status) MODE_STATUS=1; shift ;;
    --logs) MODE_LOGS=1; shift ;;
    --version) MODE_VERSION=1; shift ;;
    --job) LOG_JOB_ID="${2:-}"; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

ensure_branch_and_remote() {
  local cur_branch
  cur_branch="$(git rev-parse --abbrev-ref HEAD)"
  [[ "$cur_branch" == "$BRANCH" ]] || {
    echo "ERROR: Must deploy from $BRANCH (current: $cur_branch)"
    exit 1
  }

  local remote
  remote="$(git remote get-url origin)"
  [[ "$remote" == "$EXPECTED_REMOTE" ]] || {
    echo "ERROR: origin remote mismatch."
    echo "Expected: $EXPECTED_REMOTE"
    echo "Found:    $remote"
    exit 1
  }
}

ensure_not_behind_origin() {
  log "Fetching origin/$BRANCH..."
  git fetch origin "$BRANCH" --prune
  LOCAL_SHA="$(git rev-parse HEAD)"
  REMOTE_SHA="$(git rev-parse "origin/$BRANCH")"

  if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]] && git merge-base --is-ancestor "$LOCAL_SHA" "$REMOTE_SHA"; then
    echo "ERROR: Local is behind origin/$BRANCH. Pull first so local and GitHub match."
    echo "Local:  $LOCAL_SHA"
    echo "Remote: $REMOTE_SHA"
    exit 1
  fi
}

require_clean_or_override() {
  if ! git diff --quiet || ! git diff --cached --quiet; then
    if [[ -n "$AUTO_COMMIT_MSG" ]]; then
      log "Auto-committing: $AUTO_COMMIT_MSG"
      git add -A
      git commit -m "$AUTO_COMMIT_MSG"
    elif [[ "$FORCE" -eq 1 ]]; then
      log "--force: continuing with dirty tree (NOTE: only committed SHA after push is deployed)"
    else
      echo "ERROR: Working tree is dirty. Commit or use --auto-commit or --force."
      exit 1
    fi
  fi
}

push_and_get_sha() {
  log "Pushing $BRANCH..."
  git push origin "$BRANCH"
  DEPLOY_SHA="$(git rev-parse HEAD)"
  log "Deploy SHA: $DEPLOY_SHA"
}

server_bootstrap_if_needed() {
  if [[ "$BOOTSTRAP" -eq 0 ]]; then
    return 0
  fi
  log "Bootstrapping server fingerprint + log dir..."
  ssh "$SSH_HOST" "sudo mkdir -p '$SERVER_LOG_DIR' && sudo chown -R root:root '$SERVER_LOG_DIR' || true"
  ssh "$SSH_HOST" "echo '$EXPECTED_FINGERPRINT' | sudo tee '$SERVER_FINGERPRINT_FILE' >/dev/null"
}

server_fingerprint_check() {
  log "Checking server fingerprint..."
  remote_fp="$(ssh "$SSH_HOST" "cat '$SERVER_FINGERPRINT_FILE' 2>/dev/null || true")"
  [[ "$remote_fp" == "$EXPECTED_FINGERPRINT" ]] || {
    echo "ERROR: Server fingerprint mismatch or missing."
    echo "Expected: $EXPECTED_FINGERPRINT"
    echo "Found:    ${remote_fp:-<missing>}"
    echo "Run: npm run deploy -- --bootstrap"
    exit 1
  }
}

start_tmux_job() {
  short_sha="${DEPLOY_SHA:0:7}"
  JOB_ID="deploy_$(date +%Y%m%d%H%M%S)_${short_sha}"
  log "Starting tmux deploy job: $JOB_ID"

  ssh "$SSH_HOST" "JOB_ID='$JOB_ID' DEPLOY_SHA='$DEPLOY_SHA' SERVER_APP_DIR='$SERVER_APP_DIR' SERVER_LOG_DIR='$SERVER_LOG_DIR' SYSTEMD_SERVICE='$SYSTEMD_SERVICE' HEALTHCHECK_URL='$HEALTHCHECK_URL' SERVER_ENV_FILE='$SERVER_ENV_FILE' bash -s" <<'REMOTE_SCRIPT'
set -euo pipefail

sudo mkdir -p "$SERVER_LOG_DIR"
LOG_FILE="$SERVER_LOG_DIR/$JOB_ID.log"
STATUS_FILE="$SERVER_LOG_DIR/$JOB_ID.status"
JOB_SCRIPT="/tmp/${JOB_ID}.sh"

echo RUNNING > "$STATUS_FILE"

cat > "$JOB_SCRIPT" <<JOB_EOF
#!/usr/bin/env bash
set -euo pipefail

echo "=== ARVA deploy $JOB_ID ==="
echo "SHA: $DEPLOY_SHA"
date -Is

cd "$SERVER_APP_DIR"
git fetch --all --prune
git checkout -f "$DEPLOY_SHA"
echo "$DEPLOY_SHA" > /var/www/arva/REVISION

if [[ -f package-lock.json ]]; then npm ci --include=dev; else npm install --include=dev; fi

if [[ -f "$SERVER_ENV_FILE" ]]; then
  set -a
  source "$SERVER_ENV_FILE"
  set +a
fi

npm run build

sudo systemctl restart "$SYSTEMD_SERVICE"
sleep 3
sudo systemctl is-active --quiet "$SYSTEMD_SERVICE"
curl -fsS -o /dev/null "$HEALTHCHECK_URL"

echo OK > "$STATUS_FILE"
echo "OK"
JOB_EOF

chmod +x "$JOB_SCRIPT"

# Run in tmux detached; write status FAIL on any job error
tmux new-session -d -s "$JOB_ID" "bash '$JOB_SCRIPT' > '$LOG_FILE' 2>&1 || { echo FAIL > '$STATUS_FILE'; exit 1; }"

echo "$JOB_ID"
REMOTE_SCRIPT
}

wait_for_job() {
  if [[ "$FOLLOW" -eq 0 ]]; then
    log "Deploy started ($JOB_ID)."
    echo "Check: npm run deploy:status / npm run deploy:logs"
    return 0
  fi

  log "Following deploy..."
  while true; do
    status="$(ssh "$SSH_HOST" "cat '$SERVER_LOG_DIR/$JOB_ID.status' 2>/dev/null || true")"
    if [[ "$status" == "OK" ]]; then
      server_rev="$(ssh "$SSH_HOST" "cat '$SERVER_APP_DIR/REVISION' 2>/dev/null || true" | tr -d '\n\r')"
      if [[ "$server_rev" != "$DEPLOY_SHA" ]]; then
        echo "ERROR: Deploy reported OK but REVISION mismatch."
        echo "Expected: $DEPLOY_SHA"
        echo "Found:    ${server_rev:-<missing>}"
        exit 1
      fi
      log "OK: local, Git, server all at $DEPLOY_SHA ✅"
      return 0
    elif [[ "$status" == "FAIL" ]]; then
      log "Deploy FAIL ❌ ($JOB_ID)"
      ssh "$SSH_HOST" "tail -n 140 '$SERVER_LOG_DIR/$JOB_ID.log' || true"
      exit 1
    else
      sleep 2
    fi
  done
}

cmd_status() {
  ssh "$SSH_HOST" "ls -1t '$SERVER_LOG_DIR'/*.status 2>/dev/null | head -n 1" | while read -r f; do
    [[ -z "$f" ]] && { echo "No deploy status found."; exit 0; }
    job="$(basename "$f" .status)"
    status="$(ssh "$SSH_HOST" "cat '$f'")"
    echo "$job: $status"
  done
}

cmd_logs() {
  if [[ -n "$LOG_JOB_ID" ]]; then
    ssh "$SSH_HOST" "sed -n '1,260p' '$SERVER_LOG_DIR/$LOG_JOB_ID.log' 2>/dev/null || echo 'Log not found'"
    exit 0
  fi
  ssh "$SSH_HOST" "ls -1t '$SERVER_LOG_DIR'/*.log 2>/dev/null | head -n 1" | while read -r f; do
    [[ -z "$f" ]] && { echo "No deploy logs found."; exit 0; }
    ssh "$SSH_HOST" "sed -n '1,260p' '$f'"
  done
}

cmd_version() {
  git fetch origin "$BRANCH" --prune >/dev/null 2>&1 || true
  local_sha="$(git rev-parse HEAD)"
  git_sha="$(git rev-parse "origin/$BRANCH" 2>/dev/null || echo "<missing>")"
  server_sha="$(ssh "$SSH_HOST" "cat '$SERVER_APP_DIR/REVISION' 2>/dev/null || echo '<missing>'" | tr -d '\n\r')"

  echo "local:  $local_sha"
  echo "Git:    $git_sha"
  echo "server: $server_sha"

  if [[ "$local_sha" != "$git_sha" || "$local_sha" != "$server_sha" ]]; then
    echo "MISMATCH"
    exit 1
  fi
  echo "OK: All three match."
}

if [[ "$MODE_STATUS" -eq 1 ]]; then cmd_status; exit 0; fi
if [[ "$MODE_LOGS" -eq 1 ]]; then cmd_logs; exit 0; fi
if [[ "$MODE_VERSION" -eq 1 ]]; then cmd_version; exit 0; fi

ensure_branch_and_remote
ensure_not_behind_origin
require_clean_or_override
push_and_get_sha
server_bootstrap_if_needed
server_fingerprint_check
JOB_ID="$(start_tmux_job | tail -n 1 | tr -d '\n')"
wait_for_job
