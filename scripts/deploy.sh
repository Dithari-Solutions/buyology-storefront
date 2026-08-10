#!/usr/bin/env bash
# One-command build + (re)deploy of the Next.js storefront under pm2 on the VPS.
#
# Fixes the deploy mistakes seen in the wild:
#   1) install/build run SEQUENTIALLY. Never `npm ci & npm run build` — the single `&`
#      backgrounds install so the build races a half-reinstalled node_modules.
#   2) Next's `output: 'standalone'` build does NOT bundle .next/static or public/.
#      They are copied next to server.js here, or every asset 404s while the server runs.
#   3) The static target is WIPED before copying so a re-deploy can't nest the new build
#      under .next/standalone/.next/static/static/ (which 404s the new page/lazy chunks
#      while stale/shared chunks still load — a ChunkLoadError).
#   4) A fresh `.next` each run (no stale artifacts) + a pm2 restart onto the new build +
#      an origin self-check that proves the server serves its own chunks.
#
# Usage (from the repo root, e.g. /opt/buyology-web):
#   NEXT_PUBLIC_API_BASE_URL=https://api.buyology.online ./scripts/deploy.sh
#
# Deploys origin/main by default. Override with DEPLOY_BRANCH=some-branch for a test deploy.
#
# NEXT_PUBLIC_* are inlined at BUILD time — set the right API base before running.
set -euo pipefail

cd "$(dirname "$0")/.."   # repo root

# NEXT_PUBLIC_API_BASE_URL may come from the shell env OR a .env* file `next build` reads.
if [ -z "${NEXT_PUBLIC_API_BASE_URL:-}" ] \
   && ! grep -qsE '^NEXT_PUBLIC_API_BASE_URL=' .env .env.production .env.local; then
  echo "ERROR: NEXT_PUBLIC_API_BASE_URL is not set. Export it, pass it inline, or add it to .env" >&2
  exit 1
fi

# Branch to deploy. This was pinned to phase-2 while that branch was ahead; phase-2 has since
# been merged into main and is now behind it, so a pinned checkout would silently roll the
# storefront back — losing the merge, the SEO/legal pages and the phone-field work. Defaults to
# main; override only for a deliberate test of another branch.
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"

echo "▶ Sync ${DEPLOY_BRANCH}"
git fetch origin
git checkout "${DEPLOY_BRANCH}"
git reset --hard "origin/${DEPLOY_BRANCH}"
echo "  now at $(git log --oneline -1)"

echo "▶ Install dependencies (sequential — NOT backgrounded)"
npm ci

echo "▶ Clean build (remove stale .next so no old chunks linger)"
rm -rf .next
npm run build

echo "▶ Copy static + public into the standalone bundle (wipe target first — no nesting)"
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static  .next/standalone/.next/static
cp -r public        .next/standalone/public

# Guard: assets must land at .next/standalone/.next/static/chunks, never nested.
if [ ! -d .next/standalone/.next/static/chunks ] || [ -d .next/standalone/.next/static/static ]; then
  echo "ERROR: standalone static is wrong (missing chunks/ or nested static/static/). Aborting." >&2
  exit 1
fi

echo "▶ (Re)start under pm2 onto the fresh build"
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

# Origin self-check: hit the running server directly (bypasses nginx + Cloudflare).
sleep 2
CHUNK="$(ls .next/standalone/.next/static/chunks/*.js 2>/dev/null | head -1 | xargs -r basename)"
if [ -n "$CHUNK" ]; then
  CODE="$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:3000/_next/static/chunks/$CHUNK" || echo 000)"
  echo "▶ Origin self-check: /_next/static/chunks/$CHUNK -> HTTP $CODE (expect 200)"
  if [ "$CODE" != "200" ]; then
    echo "  ⚠ The pm2 server is NOT serving its own chunk. Check ecosystem.config.js cwd/script and 'pm2 logs buyology-web'." >&2
  fi
fi

echo
echo "✅ Build + serve done. If the origin self-check was 200 but the browser still 404s,"
echo "   it's the CDN cache — PURGE Cloudflare for dev.buyology.online (or Development Mode) and hard-refresh."
