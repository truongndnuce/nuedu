import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
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
