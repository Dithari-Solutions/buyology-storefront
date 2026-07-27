#!/usr/bin/env bash
# One-command build + (re)deploy of the Next.js storefront under pm2 on the VPS.
#
# Fixes the two mistakes that broke the manual deploy:
#   1) install and build run SEQUENTIALLY. Never `npm ci & npm run build` — the single
#      `&` backgrounds the install so the build races a half-reinstalled node_modules and
#      Turbopack can't find the `next` package ("couldn't find next/package.json …").
#   2) Next's `output: 'standalone'` build does NOT bundle .next/static or public/.
#      They are copied next to server.js here, or every asset 404s while the server runs.
#
# Usage (from the repo root, e.g. /opt/buyology-web):
#   NEXT_PUBLIC_API_BASE_URL=https://api-dev.dithari.com ./scripts/deploy.sh
#
# NEXT_PUBLIC_* are inlined at BUILD time — set the right API base before running.
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

: "${NEXT_PUBLIC_API_BASE_URL:?Set NEXT_PUBLIC_API_BASE_URL (baked into the build)}"

echo "▶ Sync phase-2"
git fetch origin
git checkout phase-2
git reset --hard origin/phase-2

echo "▶ Install dependencies (sequential — NOT backgrounded)"
npm ci

echo "▶ Build"
npm run build

echo "▶ Copy static + public into the standalone bundle"
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static  .next/standalone/.next/static
cp -r public        .next/standalone/public

echo "▶ (Re)start under pm2"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

echo
echo "✅ Deployed. Verify (both should be 200):"
echo "   curl -sI http://127.0.0.1:3000/logo.png"
echo "   curl -sI http://127.0.0.1:3000/_next/static/chunks/\$(ls .next/standalone/.next/static/chunks | head -1)"
echo "Then purge Cloudflare cache for dev.buyology.online and hard-refresh."
