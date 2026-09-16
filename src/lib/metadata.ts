import type { Metadata } from "next";
import { ogLocale, site, type Locale } from "@/lib/site";
import { getContent } from "@/lib/content";

/**
 * Metadata for pages under the locale layout that are not the home page. The
 * layout's canonical, hreflang and Open Graph describe the home page, so every
 * other page has to replace them in full rather than inherit them.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  languages,
  indexable,
  article,
}: {
  locale: Locale;
  path: string;
  /** Topic only. The layout template appends the brand. */
  title: string;
  description: string;
  languages?: Record<string, string>;
  indexable: boolean;
  article?: { publishedTime: string; modifiedTime: string };
}): Metadata {
  const c = getContent(locale);
  const images = [{ url: site.portrait, width: 288, height: 357, alt: c.hero.portraitAlt }];
  const shared = { url: path, siteName: site.name, title, description, locale: ogLocale[locale], images };

  return {
    title,
    description,
    alternates: { canonical: path, languages },
    openGraph: article
      ? {
          ...shared,
          type: "article",
          publishedTime: article.publishedTime,
          modifiedTime: article.modifiedTime,
          authors: [site.url],
        }
      : { ...shared, type: "website" },
    twitter: { card: "summary", title, description, images: [{ url: site.portrait, alt: c.hero.portraitAlt }] },
    ...(indexable ? {} : { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } }),
  };
}
