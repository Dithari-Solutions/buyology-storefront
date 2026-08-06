# ── Stage 1: Install dependencies ─────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# ── Stage 2: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars must be available at build time
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Deterministic Next build ID. next.config.ts pins the build ID to the git commit so
# that the two web instances behind the nginx LB generate identical /_next/static/<id>
# chunk paths. But `.git` is excluded from the Docker build context (.dockerignore), so
# `git rev-parse` inside the build fails and Next would fall back to a RANDOM id per
# build — instances then serve mismatched chunks → ChunkLoadError / 404 across the LB.
# Pass the same NEXT_BUILD_ID to every instance's build to keep them consistent, e.g.
#   docker build --build-arg NEXT_BUILD_ID="$(git rev-parse --short HEAD)" ...
ARG NEXT_BUILD_ID
ENV NEXT_BUILD_ID=$NEXT_BUILD_ID

RUN npm run build

# ── Stage 3: Production runner (standalone output) ─────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Copy standalone server and static assets produced by output: 'standalone'
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static   ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public         ./public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
