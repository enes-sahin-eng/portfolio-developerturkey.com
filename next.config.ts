import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the root so Next does not pick up an unrelated lockfile above the project.
  turbopack: { root: path.resolve(".") },
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The root layout lives under [locale], so unmatched URLs need an app wide 404.
    globalNotFound: true,
  },
};

export default nextConfig;
