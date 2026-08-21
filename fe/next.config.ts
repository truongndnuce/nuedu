import path from "node:path";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

// Guest chat relies on an httpOnly cookie. In production the frontend and
// backend live on different domains, and modern browsers block third-party
// cookies on cross-site fetches (SameSite=None no longer saves it — see
// guest.controller.ts). Proxying through the frontend's own origin makes the
// request same-site from the browser's perspective, so the cookie is treated
// as first-party and actually gets sent back.
const BACKEND_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api/v1";

const nextConfig: NextConfig = {
  // Standalone output keeps the runtime image to only the files actually
  // needed to run `node server.js` (no full node_modules copy), so deploy
  // image push/pull stays fast regardless of how big devDependencies get.
  output: "standalone",
  // Without this, Next.js infers the workspace root by walking up for the
  // nearest lockfile and can lock onto an unrelated one outside this repo
  // (e.g. a stray package-lock.json in a parent directory), which throws off
  // where `output: standalone` places server.js. Pinning it keeps output
  // structure identical across machines, CI, and the Docker build context.
  turbopack: {
    root: path.join(__dirname),
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: "/api/proxy/:path*", destination: `${BACKEND_URL}/:path*` },
      ],
    };
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.nuedu.vn" },
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // Disable the persistent webpack filesystem cache for production builds.
  // The deploy (nixpacks/Dokploy) reuses a `.next/cache` Docker mount between
  // builds; a stale cache there poisons the server bundle and surfaces as
  // "Cannot read properties of null (reading 'useContext')" while prerendering
  // /_global-error — a crash that never reproduces on a clean build.
  webpack: (config, { dev }) => {
    if (!dev) {
      config.cache = false;
    }
    return config;
  },
};

export default withNextIntl(nextConfig);
