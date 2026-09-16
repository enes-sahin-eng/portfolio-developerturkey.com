import type { MetadataRoute } from "next";
import { absoluteUrl, defaultLocale, locales, localePath, type Locale } from "@/lib/site";
import { blogPath, languageAlternates, latestUpdate, posts, postsFor, translations } from "@/lib/blog";

// Bump only when home page content changes. A date that moves on every deploy teaches crawlers to ignore it.
const homeModified = "2026-09-15";

function absoluteLanguages(paths: Record<string, string> | undefined) {
  return paths && Object.fromEntries(Object.entries(paths).map(([language, path]) => [language, absoluteUrl(path)]));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const home = locales.map((locale) => ({
    url: absoluteUrl(localePath(locale)),
    lastModified: homeModified,
    priority: 1,
    alternates: {
      languages: {
        ...Object.fromEntries(locales.map((l) => [l, absoluteUrl(localePath(l))])),
        "x-default": absoluteUrl(localePath(defaultLocale)),
      },
    },
  }));

  // An index with no posts is noindex, so it stays out of the sitemap.
  const blogLocales = locales.filter((locale) => postsFor(locale).length > 0);
  const indexPaths: Partial<Record<Locale, string>> = {};
  for (const locale of blogLocales) indexPaths[locale] = blogPath(locale);

  const blogIndexes = blogLocales.map((locale) => ({
    url: absoluteUrl(blogPath(locale)),
    lastModified: latestUpdate(postsFor(locale)),
    priority: 0.8,
    alternates: { languages: absoluteLanguages(languageAlternates(indexPaths)) },
  }));

  const articles = posts.map((post) => ({
    url: absoluteUrl(blogPath(post.locale, post.slug)),
    lastModified: post.updatedAt,
    priority: 0.7,
    alternates: { languages: absoluteLanguages(languageAlternates(translations(post))) },
  }));

  return [...home, ...blogIndexes, ...articles];
}
