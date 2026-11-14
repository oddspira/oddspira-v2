#!/usr/bin/env bash
# ==============================================================================
# ODDSPIRA 1-COMMAND PRODUCTION INSTALLER FOR OVHCLOUD VPS (Ubuntu 24.04 LTS)
# Usage: sudo bash deploy-ovh.sh oddspira.com
# ==============================================================================
set -e

DOMAIN="${1:-oddspira.com}"
APP_DIR="/var/www/oddspira"

echo "🚀 [1/6] Обновяване на Ubuntu 26.04 пакетите и инсталиране на Nginx, Git, Certbot и SQLite3..."
apt-get update -y
apt-get install -y curl git nginx certbot python3-certbot-nginx sqlite3 ufw ca-certificates

echo "🚀 [2/6] Инсталиране на Node.js 22 LTS & PM2 (Съвместимо с Ubuntu 26.04)..."
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt-get install -y nodejs || {
    apt-get install -y nodejs npm
    npm install -g n
    n 22
    hash -r
  }
fi
npm install -g pm2 tsx

echo "🚀 [3/6] Подготовка на директорията и зависимостите..."
mkdir -p "$APP_DIR/data/backups"
if [ ! -f ".env" ] && [ -f ".env.example" ]; then
  cp .env.example .env
  echo "✅ Създаден е .env файл от .env.example (попълнете вашите ключове с: nano .env)"
fi

npm install
npm run build

echo "🚀 [4/6] Стартиране на Oddspira Full-Stack сървъра с PM2 (24/7 авто-рестарт)..."
NODE_ENV=production PORT=3000 pm2 start "npx tsx server.ts" --name oddspira --update-env || NODE_ENV=production PORT=3000 pm2 restart oddspira --update-env
pm2 save
pm2 startup systemd -u root --hp /root || true

echo "🚀 [5/6] Конфигуриране на Nginx Reverse Proxy за $DOMAIN..."
cat > /etc/nginx/sites-available/oddspira <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    client_max_body_size 10M;

    # Gzip compression for instant loading
    gzip on;
    gzip_types text/plain text/css application/json application/javascript image/svg+xml;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

ln -sf /etc/nginx/sites-available/oddspira /etc/nginx/sites-enabled/oddspira
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "🚀 [6/6] Конфигуриране на UFW защитна стена (портове 22, 80, 443)..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=============================================================================="
echo "✅ ODDSPIRA Е ОНЛАЙН НА: http://$DOMAIN"
echo "🔒 За безплатен HTTPS (SSL сертификат), изпълнете:"
echo "   sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo "🔑 За да добавите API ключове (API-Football, Stripe, Telegram, Brevo):"
echo "   nano .env && pm2 restart oddspira --update-env"
echo "=============================================================================="
