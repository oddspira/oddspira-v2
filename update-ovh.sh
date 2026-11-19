#!/usr/bin/env bash
# ==============================================================================
# ODDSPIRA 1-COMMAND ZERO-DATA-LOSS UPDATE SCRIPT FOR OVHCLOUD VPS
# Usage: bash update-ovh.sh
# ==============================================================================
set -e

echo "🛡️ [1/4] Създаване на защитен бекъп на SQLite базата (data/oddspira.db)..."
mkdir -p data/backups
if [ -f "data/oddspira.db" ]; then
  STAMP=$(date -u +"%Y-%m-%dT%H-%M-%SZ")
  cp "data/oddspira.db" "data/backups/pre-update-$STAMP.db"
  echo "✅ Бекъпът е записан: data/backups/pre-update-$STAMP.db"
fi

echo "⬇️ [2/4] Изтегляне на най-новите промени от GitHub (без да се пипат .env и data/)..."
git fetch origin main
git reset --hard origin/main

echo "⚙️ [3/4] Обновяване на пакетите и компилиране на новия дизайн (vite build)..."
npm install --legacy-peer-deps
npm run build

echo "🚀 [4/4] Рестартиране на сървъра за 0.5 секунди чрез PM2..."
NODE_ENV=production pm2 restart oddspira --update-env

echo "✅ ГОТОВО! Новата версия на Oddspira вече е онлайн без загуба на данни или потребители!"
