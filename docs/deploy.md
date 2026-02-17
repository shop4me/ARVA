# ARVA deploy (Jifcast-style deploy-by-SHA)

Repo: `git@github.com:shop4me/ARVA.git` · Domain: livearva.com · Server: 143.198.99.0 · SSH alias: `do-arva`

Local, GitHub `main`, and server always run the same commit SHA. The deploy script enforces this with a behind check, push, and REVISION verification.

---

## Deploy commands

| Command | Description |
|--------|-------------|
| `npm run deploy:prod` | Push main and deploy current SHA to server (detached tmux job) |
| `npm run deploy:prod -- --follow` | Deploy and block until OK/FAIL; verify server REVISION matches |
| `npm run deploy:prod -- --auto-commit "Deploy: ..."` | Auto-commit dirty tree with message, then deploy |
| `npm run deploy:prod -- --force` | Deploy even with dirty tree (not recommended) |
| `npm run deploy:prod -- --bootstrap --follow` | First-time: create server fingerprint + log dir, then deploy |
| `npm run deploy:status` | Show latest deploy status |
| `npm run deploy:logs` | Show latest deploy log |
| `npm run deploy:logs -- --job JOB_ID` | Show log for a specific job |
| `npm run deploy:version` | Print local / Git / server SHA; exit 1 if any mismatch |

---

## One-time server bootstrap

Run these on the server (e.g. `ssh do-arva` or root@143.198.99.0).

1. **Install base + Node 20 + nginx**
   ```bash
   apt update
   apt install -y nginx git curl ca-certificates build-essential
   curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
   apt install -y nodejs
   node -v && npm -v
   ```

2. **Create server SSH deploy key and add to GitHub**
   - On server: `ssh-keygen -t ed25519 -C "arva-server-deploy" -f ~/.ssh/id_ed25519 -N ""`
   - On server: `cat ~/.ssh/id_ed25519.pub`
   - In GitHub: repo **shop4me/ARVA** → **Settings → Deploy keys → Add deploy key**
   - Title: `arva-prod 143.198.99.0` · Paste the public key · Save
   - On server: `ssh -T git@github.com` (accept host key if prompted)

3. **Clone repo to /var/www/arva**
   ```bash
   mkdir -p /var/www/arva && cd /var/www/arva
   git clone git@github.com:shop4me/ARVA.git .
   ```

4. **Create /etc/arva.env**
   ```bash
   nano /etc/arva.env
   ```
   Minimum:
   ```
   NODE_ENV=production
   PORT=3001
   ```
   Add Stripe and other secrets here; never commit them.

5. **Create /etc/arva_server_id**
   ```bash
   echo "arva-prod 143.198.99.0" | sudo tee /etc/arva_server_id
   ```

6. **Set up systemd**
   ```bash
   sudo cp /var/www/arva/ops/arva.service /etc/systemd/system/arva.service
   sudo systemctl daemon-reload
   sudo systemctl enable arva
   ```
   Do not start `arva` until the first deploy has run (`npm run build` then restart).

7. **Set up nginx**
   ```bash
   sudo cp /var/www/arva/ops/nginx_livearva.conf /etc/nginx/sites-available/livearva.com
   sudo ln -sf /etc/nginx/sites-available/livearva.com /etc/nginx/sites-enabled/livearva.com
   sudo nginx -t
   sudo systemctl reload nginx
   ```

8. **Deploy log dir**
   ```bash
   sudo mkdir -p /var/log/arva/deploy
   ```

Then from your **local** machine run the first deploy:

```bash
npm run deploy:prod -- --bootstrap --follow
```

---

## Version parity

- **Before deploy:** Script ensures you are on `main`, origin is `git@github.com:shop4me/ARVA.git`, and local is **not behind** `origin/main` (merge-base check). Dirty tree blocks deploy unless `--auto-commit` or `--force`.
- **Deploy:** Pushes `main`, then on the server: `git checkout -f <SHA>`, `echo <SHA> > /var/www/arva/REVISION`, build, restart systemd, healthcheck.
- **After deploy (with `--follow`):** Verifies server `REVISION` equals the deployed SHA; on success prints: `OK: local, Git, and server all at <SHA>`.

Check anytime: `npm run deploy:version` — prints all three SHAs and exits 0 only if they match.
