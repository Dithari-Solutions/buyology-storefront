import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,

  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/story/**", // only allow story images
      },
    ]
  },
};

export default nextConfig;
