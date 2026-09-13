import type { MetadataRoute } from "next";
import { absoluteUrl, locales, localePath } from "@/lib/site";

/**
 * Evaluated once at build time, not per request. A date that moves on every
 * crawl teaches crawlers to stop trusting it.
 */
const lastModified = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified,
    changeFrequency: "monthly" as const,
    priority: locale === "tr" ? 1 : 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l, absoluteUrl(localePath(l))]),
      ),
    },
  }));
}
