# ARVA deployment (deploy-by-SHA)

- **Repo:** git@github.com:shop4me/ARVA.git (main)
- **Server:** 143.198.99.0 (SSH alias `do-arva`)
- **App port:** 3001 (behind nginx)

## Local

- `npm run deploy:prod` — push main, deploy current SHA to server (tmux job)
- `npm run deploy:prod -- --follow` — deploy and wait for OK/FAIL
- `npm run deploy:prod -- --bootstrap --follow` — first-time: create fingerprint + log dir, then deploy
- `npm run deploy:status` — last deploy status
- `npm run deploy:logs` — last deploy log

## One-time server bootstrap (run on 143.198.99.0)

1. SSH: `ssh do-arva` (after adding deploy key to GitHub, clone once)
2. Install: Node 20, nginx, git (see `ops/bootstrap_server.sh` or run it)
3. Create `/etc/arva.env` with `NODE_ENV=production`, `PORT=3001`, and your secrets (Stripe, etc.)
4. Copy `ops/arva.service` → `/etc/systemd/system/arva.service`, `systemctl daemon-reload`, `systemctl enable arva`
5. Copy `ops/nginx_livearva.conf` → `/etc/nginx/sites-available/livearva.com`, enable site, `nginx -t`, `systemctl reload nginx`
6. Add GitHub deploy key (server `~/.ssh/id_ed25519.pub`) to repo Deploy keys

Then from local: `npm run deploy:prod -- --bootstrap --follow`

## DNS + SSL (when ready)

- A records: livearva.com, www.livearva.com → 143.198.99.0
- On server: `certbot --nginx -d livearva.com -d www.livearva.com`
