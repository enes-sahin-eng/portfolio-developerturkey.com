import { readFileSync } from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import type { MDXContent } from "mdx/types";
import { defaultLocale, locales, type Locale } from "@/lib/site";

export type Post = {
  /** Shared by every translation of the same post. */
  key: string;
  locale: Locale;
  slug: string;
  /** Topic only, 50-60 characters. The layout template appends " | Developer Turkey". */
  title: string;
  /** 150-160 characters, ending with a call to action. */
  description: string;
  /** YYYY-MM-DD */
  publishedAt: string;
  /** YYYY-MM-DD. Change only when the content really changes. */
  updatedAt: string;
  /** `key` of the guide this post supports. The post links to it. */
  pillar?: string;
  load: () => Promise<{ default: MDXContent }>;
};

/**
 * Every published post. The body lives in src/content/blog/<locale>/<slug>.mdx.
 * An entry here is what publishes a post: its route, the blog index, sitemap,
 * llms.txt and the home page link all read this list.
 *
 * {
 *   key: "nodejs-jwt",
 *   locale: "tr",
 *   slug: "nodejs-express-jwt-rol-bazli-yetkilendirme",
 *   title: "Node.js ve Express ile JWT ve Rol Bazlı Yetkilendirme",
 *   description: "...",
 *   publishedAt: "2026-09-20",
 *   updatedAt: "2026-09-20",
 *   load: () => import("@/content/blog/tr/nodejs-express-jwt-rol-bazli-yetkilendirme.mdx"),
 * },
 */
export const posts: Post[] = [
  {
    key: "nodejs-jwt-rbac",
    locale: "tr",
    slug: "nodejs-express-jwt-rol-bazli-yetkilendirme",
    title: "Node.js ve Express ile JWT ve Rol Bazlı Yetkilendirme",
    description:
      "Express ve JWT ile kimlik doğrulama ve rol bazlı yetkilendirmeyi gerçek bir projeden kod örnekleriyle anlatıyorum. Sahiplik kontrolü dahil. Hemen oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    load: () => import("@/content/blog/tr/nodejs-express-jwt-rol-bazli-yetkilendirme.mdx"),
  },
  {
    key: "nextjs-i18n-seo",
    locale: "tr",
    slug: "nextjs-cok-dilli-site-hreflang-canonical-kurulumu",
    title: "Next.js'te Çok Dilli Site: hreflang ve Canonical Kurulumu",
    description:
      "Next.js App Router'da TR/EN site kurulumunu, hreflang ve canonical hatalarını kendi www yönlendirme hatamdan yola çıkarak anlatıyorum. Hemen şimdi oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    load: () => import("@/content/blog/tr/nextjs-cok-dilli-site-hreflang-canonical-kurulumu.mdx"),
  },
  {
    key: "nodejs-prisma-postgresql",
    locale: "tr",
    slug: "nodejs-prisma-postgresql-sema-tasarimi",
    title: "Node.js Projesinde Prisma ve PostgreSQL ile Şema Tasarımı",
    description:
      "Prisma ve PostgreSQL ile ilişkili bir veritabanı şemasını gerçek bir e-ticaret projesinden örneklerle, migration ve transaction dahil anlatıyorum. Oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    load: () => import("@/content/blog/tr/nodejs-prisma-postgresql-sema-tasarimi.mdx"),
  },
  {
    key: "junior-portfolyo",
    locale: "tr",
    slug: "junior-yazilimci-portfolyosu-nasil-hazirlanir",
    title: "Junior Yazılımcı Portfolyosu: Hangi Projeler Girmeli?",
    description:
      "Hangi projeler portfolyoya girmeli, müşteri işleri nasıl gösterilmeli, GitHub nasıl düzenlenmeli? Kendi portfolyomdan gerçek kararlarla anlatıyorum. Oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    load: () => import("@/content/blog/tr/junior-yazilimci-portfolyosu-nasil-hazirlanir.mdx"),
  },
  {
    key: "nodejs-dotnet-gecis",
    locale: "tr",
    slug: "nodejs-gelistiricisinin-gozunden-dotnet-core-gecis",
    title: "Bir Node.js Geliştiricisinin Gözünden .NET Core'a Geçiş",
    description:
      "Node.js'ten C# ve .NET Core'a geçerken neyin tanıdık, neyin zor geldiğini dürüstçe anlatıyorum. Bir rehber değil, gerçek bir öğrenme günlüğü. Şimdi oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-16",
    load: () => import("@/content/blog/tr/nodejs-gelistiricisinin-gozunden-dotnet-core-gecis.mdx"),
  },
];

export function blogPath(locale: Locale, slug?: string) {
  return `/${locale}/blog${slug ? `/${slug}` : ""}`;
}

export function postsFor(locale: Locale) {
  return posts
    .filter((post) => post.locale === locale)
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function findPost(locale: Locale, slug: string) {
  return posts.find((post) => post.locale === locale && post.slug === slug);
}

export function findByKey(locale: Locale, key: string) {
  return posts.find((post) => post.locale === locale && post.key === key);
}

/** Paths of the same post in every locale it has been written in. */
export function translations(post: Post): Partial<Record<Locale, string>> {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of locales) {
    const translated = findByKey(locale, post.key);
    if (translated) paths[locale] = blogPath(locale, translated.slug);
  }
  return paths;
}

/** hreflang only for pages that exist, so no alternate points at a 404 or a noindex page. */
export function languageAlternates(paths: Partial<Record<Locale, string>>) {
  const entries = Object.entries(paths) as [Locale, string][];
  if (!entries.length) return undefined;
  return { ...Object.fromEntries(entries), "x-default": paths[defaultLocale] ?? entries[0][1] } as Record<string, string>;
}

export function latestUpdate(list: Post[]) {
  return list.reduce((latest, post) => (post.updatedAt > latest ? post.updatedAt : latest), list[0]?.updatedAt ?? "");
}

const plainText = (markdown: string) =>
  markdown
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[`*_]/g, "")
    .trim();

/**
 * Read at build time from the MDX source: reading time, and the section list
 * with the same ids rehype-slug gives the rendered headings.
 */
export function readPostSource(post: Post) {
  const file = path.join(process.cwd(), "src", "content", "blog", post.locale, `${post.slug}.mdx`);
  const slugger = new GithubSlugger();
  const headings: { id: string; text: string }[] = [];
  let inFence = false;
  let words = 0;

  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    words += line.split(/\s+/).filter(Boolean).length;

    const heading = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!heading) continue;
    const text = plainText(heading[2]);
    // Every heading advances the slugger, as rehype-slug does, so duplicate ids stay in step.
    const id = slugger.slug(text);
    if (heading[1].length === 2) headings.push({ id, text });
  }

  return { minutes: Math.max(1, Math.round(words / 200)), headings };
}
