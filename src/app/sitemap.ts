import type { MetadataRoute } from "next";
import { absoluteUrl, defaultLocale, locales, localePath } from "@/lib/site";

// Bump only when page content changes. A date that moves on every deploy teaches crawlers to ignore it.
const lastModified = "2026-09-15";

export default function sitemap(): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified,
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(localePath(l))])),
        "x-default": absoluteUrl(localePath(defaultLocale)),
      },
    },
  }));
}
