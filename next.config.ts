import path from "node:path";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the root so Next does not pick up an unrelated lockfile above the project.
  turbopack: { root: path.resolve(".") },
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    // The root layout lives under [locale], so unmatched URLs need an app wide 404.
    globalNotFound: true,
  },
};

// Plugins are named by string: Turbopack cannot receive JavaScript functions.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
    rehypePlugins: ["rehype-slug", ["rehype-pretty-code", { theme: "github-dark", keepBackground: false }]],
  },
});

export default withMDX(nextConfig);
