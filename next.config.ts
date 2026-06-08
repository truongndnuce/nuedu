import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/lib/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.nuedu.vn" },
      // MinIO (local dev — add after setup)
      // { protocol: "http", hostname: "localhost", port: "9000" },
    ],
  },
};

export default withNextIntl(nextConfig);
