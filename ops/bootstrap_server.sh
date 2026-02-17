#!/usr/bin/env bash
# Run this ON THE SERVER (143.198.99.0) as root, once.
# Or run each section manually.
set -euo pipefail

echo "=== B2: Base packages ==="
apt update
apt install -y nginx git curl ca-certificates build-essential

echo "=== B3: Node 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v

echo "=== B4: Server SSH key for GitHub (run manually if you prefer) ==="
echo "If id_ed25519 already exists, skip keygen. Otherwise:"
echo "  ssh-keygen -t ed25519 -C 'arva-server-deploy' -f ~/.ssh/id_ed25519 -N \"\""
echo "  cat ~/.ssh/id_ed25519.pub"
echo "Add that key to GitHub: repo shop4me/ARVA → Settings → Deploy keys → Add deploy key."
echo "Then: ssh -T git@github.com"
read -p "Press Enter after deploy key is added and GitHub SSH works..."

echo "=== B5: App directory and clone ==="
mkdir -p /var/www/arva
cd /var/www/arva
git clone git@github.com:shop4me/ARVA.git .

echo "=== B6: Create /etc/arva.env (edit with your secrets) ==="
cat > /etc/arva.env << 'ENVFILE'
NODE_ENV=production
PORT=3001
NEXT_PUBLIC_API_URL=http://api.livearva.com
ENVFILE
echo "Created /etc/arva.env. Add Stripe keys and other secrets: nano /etc/arva.env"

echo "=== B7: Server fingerprint ==="
echo "arva-prod 143.198.99.0" | tee /etc/arva_server_id

echo "=== B8: Deploy log dir ==="
mkdir -p /var/log/arva/deploy
chown -R root:root /var/log/arva

echo "=== B9: Systemd unit ==="
cp /var/www/arva/ops/arva.service /etc/systemd/system/arva.service
systemctl daemon-reload
systemctl enable arva
echo "Do not start arva until first deploy has run (npm run build)."

echo "=== B10: Nginx ==="
cp /var/www/arva/ops/nginx_livearva.conf /etc/nginx/sites-available/livearva.com
ln -sf /etc/nginx/sites-available/livearva.com /etc/nginx/sites-enabled/livearva.com
nginx -t
systemctl reload nginx

echo "=== Bootstrap done. From your LOCAL machine run: npm run deploy:prod -- --bootstrap --follow ==="
