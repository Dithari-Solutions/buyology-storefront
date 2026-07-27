// PM2 process definition for the Next.js storefront (output: 'standalone').
//
// Runs .next/standalone/server.js from INSIDE the standalone dir so it resolves its
// own .next/static and public/ assets. Next's standalone build does NOT include those
// two folders — scripts/deploy.sh copies them in after `next build`, or every asset
// (chunks, images, /logo.png) 404s even though the server is up.
const path = require("path");

module.exports = {
  apps: [
    {
      name: "buyology-web",
      cwd: path.join(__dirname, ".next", "standalone"),
      script: "server.js",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
        HOSTNAME: "0.0.0.0",
      },
    },
  ],
};
