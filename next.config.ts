// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   reactCompiler: true,

//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "127.0.0.1",
//         port: "8080",
//         pathname: "/story/**", // only allow story images
//       },
//     ]
//   },
// };

// export default nextConfig;

import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { execSync } from "node:child_process";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// Pin the build ID to the git commit (overridable via NEXT_BUILD_ID). The app is served by
// two servers behind the nginx LB; when each builds independently a random build ID makes
// their HTML reference chunk/asset paths the other can't serve → ChunkLoadError. Tying the
// build ID to the commit keeps independent builds of the same commit consistent.
function resolveBuildId(): string | null {
  if (process.env.NEXT_BUILD_ID) return process.env.NEXT_BUILD_ID;
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch {
    return null; // fall back to Next's default
  }
}

const nextConfig: NextConfig = {
  // Produces a self-contained server in .next/standalone — required for Docker
  output: "standalone",
  // Pin the Turbopack workspace root to this project dir. Without it, Turbopack
  // infers the root by walking up for a lockfile and can pick the wrong directory
  // on some hosts ("We couldn't find the Next.js package … set turbopack.root"),
  // failing the build. __dirname is this repo root (package.json has no "type", so
  // the config loads as CJS and __dirname is defined).
  turbopack: {
    root: __dirname,
  },
  reactCompiler: true,
  generateBuildId: resolveBuildId,

  // Inline critical CSS so the render-blocking stylesheet chunk doesn't
  // gate first paint. (Backed by `critters`.)
  experimental: {
    optimizeCss: true,
    // Reduce hydration cost on huge component graphs by tree-shaking these
    // packages at import-time rather than waiting for SWC to do it later.
    optimizePackageImports: [
      "framer-motion",
      "react-icons",
      "i18next",
      "react-i18next",
    ],
  },

  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "http",
        hostname: "5.189.132.250",
        port: "8080",
        pathname: "/story/**",
      },
      {
        protocol: "http",
        hostname: "5.189.132.250",
        port: "8080",
        pathname: "/product/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/product/**",
      },
      {
        protocol: "https",
        hostname: "eu2.contabostorage.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api-dev.dithari.com",
        pathname: "/**",
      },
      // Production API image host. VERIFY this matches the real prod API domain
      // (and that prod serves product/story images from it rather than the
      // Contabo public URL above) or next/image will throw "hostname not configured".
      {
        protocol: "https",
        hostname: "api.buyology.online",
        pathname: "/**",
      },
    ],
  },

  async headers() {
    // Security headers — applied to every route.
    // CSP is intentionally permissive on script-src (Next + framer-motion +
    // Apple/Google badges) but locks down frame-ancestors and base-uri.
    const csp = [
      "default-src 'self'",
      // static.cloudflareinsights.com → the Web Analytics beacon Cloudflare injects.
      // googletagmanager.com → GA4 (src/shared/components/Analytics.tsx); without
      // it the tag is blocked silently and the analytics check keeps failing.
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appleid.cdn-apple.com https://static.cloudflareinsights.com https://www.googletagmanager.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
      // Story videos are served cross-origin (Contabo / api.buyology.online); without
      // an explicit media-src they fall back to default-src 'self' and get blocked.
      "media-src 'self' blob: data: https: http:",
      "font-src 'self' data:",
      "connect-src 'self' https: wss:",
      "frame-src https://appleid.apple.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(self), geolocation=(self)" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // Long-cache the immutable Next build assets.
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Self-hosted badges are versioned by filename, safe to cache forever.
        source: "/:badge(app-store-badge.svg|google-play-badge.svg)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
