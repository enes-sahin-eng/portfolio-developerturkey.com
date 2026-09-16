import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { htmlLang, isLocale, locales, localePath } from "@/lib/site";
import { getContent } from "@/lib/content";
import { blogPath, findByKey, findPost, languageAlternates, posts, readPostSource, translations } from "@/lib/blog";
import { buildPostGraph } from "@/lib/schema";
import { pageMetadata } from "@/lib/metadata";
import { BlogFooter, BlogHeader, Breadcrumbs } from "@/components/blog/BlogChrome";
import { ReadingProgress } from "@/components/blog/ReadingProgress";

type Params = { locale: string; slug: string };

// Only posts listed in src/lib/blog.ts exist; anything else is a 404.
export const dynamicParams = false;

/**
 * Returns every post with its own locale instead of filtering by the parent
 * layout's locale. If this returned an empty list for any locale (a language
 * with no posts yet), Next would keep that locale without a slug, decide the
 * params are incomplete, and prerender none of the posts in any language.
 */
export function generateStaticParams() {
  return posts.map((post) => ({ locale: post.locale, slug: post.slug }));
}

async function resolvePost(params: Promise<Params>) {
  const { locale, slug } = await params;
  return isLocale(locale) ? findPost(locale, slug) : undefined;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = await resolvePost(params);
  if (!post) return {};

  return pageMetadata({
    locale: post.locale,
    path: blogPath(post.locale, post.slug),
    title: post.title,
    description: post.description,
    languages: languageAlternates(translations(post)),
    indexable: true,
    article: { publishedTime: post.publishedAt, modifiedTime: post.updatedAt },
  });
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const post = await resolvePost(params);
  if (!post) notFound();

  const { locale } = post;
  const c = getContent(locale);
  const { default: Body } = await post.load();
  const { minutes, headings } = readPostSource(post);
  const date = new Intl.DateTimeFormat(htmlLang[locale], { dateStyle: "long", timeZone: "UTC" });
  const pillar = post.pillar ? findByKey(locale, post.pillar) : undefined;
  const contactId = c.nav.chapters[c.nav.chapters.length - 1].id;

  // A language this post was not written in falls back to that language's blog index.
  const written = translations(post);
  const switchHrefs = Object.fromEntries(locales.map((l) => [l, written[l] ?? blogPath(l)]));

  return (
    <div className="blog-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(buildPostGraph(post)) }} />
      <ReadingProgress />
      <BlogHeader locale={locale} hrefs={switchHrefs} />

      <main className="blog-main">
        <Breadcrumbs
          locale={locale}
          items={[
            { label: c.blog.breadcrumbHome, href: localePath(locale), fullLoad: true },
            { label: c.blog.navLabel, href: blogPath(locale) },
            { label: post.title },
          ]}
        />

        <article>
          <header className="post-header">
            <h1 className="display post-title">{post.title}</h1>
            <p className="post-meta tabular">
              <span>
                {c.blog.published} <time dateTime={post.publishedAt}>{date.format(new Date(post.publishedAt))}</time>
              </span>
              {post.updatedAt !== post.publishedAt && (
                <span>
                  {c.blog.updated} <time dateTime={post.updatedAt}>{date.format(new Date(post.updatedAt))}</time>
                </span>
              )}
              <span>{c.blog.readingTime.replace("{minutes}", String(minutes))}</span>
            </p>
          </header>

          <div className="post-layout">
            <div className="post-body">
              <Body />
            </div>

            {headings.length >= 3 && (
              <aside className="post-toc" aria-labelledby="post-toc-label">
                <p id="post-toc-label">{c.blog.toc}</p>
                <ol>
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      {/* replace: a click here does not add a back-button stop for every heading. */}
                      <Link href={`#${heading.id}`} replace>
                        {heading.text}
                      </Link>
                    </li>
                  ))}
                </ol>
              </aside>
            )}
          </div>

          <footer className="post-end">
            {pillar && pillar.slug !== post.slug && (
              <div className="post-pillar">
                <p>{c.blog.pillar}</p>
                <Link href={blogPath(locale, pillar.slug)}>{pillar.title}</Link>
              </div>
            )}

            <section className="post-contact" aria-labelledby="post-contact-title">
              <h2 id="post-contact-title" className="display">
                {c.blog.contact.heading}
              </h2>
              <p>{c.blog.contact.line}</p>
              <a href={`${localePath(locale)}#${contactId}`} className="accent-button">
                {c.blog.contact.label}
              </a>
            </section>

            <Link href={blogPath(locale)} className="post-back">
              {c.blog.allPosts}
            </Link>
          </footer>
        </article>
      </main>

      <BlogFooter locale={locale} />
    </div>
  );
}
