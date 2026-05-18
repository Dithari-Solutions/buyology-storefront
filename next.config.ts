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

const nextConfig: NextConfig = {
  // Produces a self-contained server in .next/standalone — required for Docker
  output: "standalone",
  reactCompiler: true,

  // Inline critical CSS so the render-blocking stylesheet chunk doesn't
  // gate first paint. (Backed by `critters`.)
  experimental: {
    optimizeCss: true,
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
    ],
  },

  async headers() {
    // Security headers — applied to every route.
    // CSP is intentionally permissive on script-src (Next + framer-motion +
    // Apple/Google badges) but locks down frame-ancestors and base-uri.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://appleid.cdn-apple.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http:",
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

export default nextConfig;
