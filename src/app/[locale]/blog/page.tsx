import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { htmlLang, isLocale, locales, localePath, type Locale } from "@/lib/site";
import { getContent } from "@/lib/content";
import { blogPath, languageAlternates, postsFor, readPostSource } from "@/lib/blog";
import { buildBlogGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";
import { BlogFooter, BlogHeader, Breadcrumbs } from "@/components/blog/BlogChrome";

/** Only languages that actually have posts: an empty index is noindex and must not be an alternate. */
function indexAlternates() {
  const paths: Partial<Record<Locale, string>> = {};
  for (const locale of locales) if (postsFor(locale).length) paths[locale] = blogPath(locale);
  return languageAlternates(paths);
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);

  return pageMetadata({
    locale,
    path: blogPath(locale),
    title: c.blog.title,
    description: c.blog.description,
    languages: indexAlternates(),
    indexable: postsFor(locale).length > 0,
  });
}

export default async function BlogIndex({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const list = postsFor(locale);
  const date = new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "long", timeZone: "UTC" });
  const switchHrefs = Object.fromEntries(locales.map((l) => [l, blogPath(l)]));

  return (
    <div className="blog-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBlogGraph(locale, list)) }}
      />
      <BlogHeader locale={locale} hrefs={switchHrefs} onIndex />

      <main className="blog-main">
        <Breadcrumbs
          locale={locale}
          items={[{ label: c.blog.breadcrumbHome, href: localePath(locale), fullLoad: true }, { label: c.blog.navLabel }]}
        />

        <h1 className="display blog-title">{c.blog.heading}</h1>
        <p className="blog-intro">{c.blog.intro}</p>

        {list.length ? (
          <ol className="post-list">
            {list.map((post) => {
              const { minutes } = readPostSource(post);
              return (
                <li key={post.slug}>
                  <Link href={blogPath(locale, post.slug)} className="post-row">
                    <span className="post-row-meta tabular">
                      <time dateTime={post.publishedAt}>{date.format(new Date(post.publishedAt))}</time>
                      <span>{c.blog.readingTime.replace("{minutes}", String(minutes))}</span>
                    </span>
                    <span className="post-row-body">
                      <span className="display post-row-title">{post.title}</span>
                      <span className="post-row-desc">{post.description}</span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="blog-empty">
            <p>{c.blog.empty.line}</p>
            <a href={localePath(locale)}>{c.blog.empty.homeLabel}</a>
          </div>
        )}
      </main>

      <BlogFooter locale={locale} />
    </div>
  );
}
