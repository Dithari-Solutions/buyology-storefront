import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "5.189.132.250",
        port: "8080",
        pathname: "/story/**",
      },
    ],
  },
};

export default nextConfig;