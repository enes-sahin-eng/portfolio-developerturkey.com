import Link from "next/link";
import { localePath, site, type Locale } from "@/lib/site";
import { getContent } from "@/lib/content";
import { blogPath } from "@/lib/blog";
import { LanguageSwitch } from "@/components/LanguageSwitch";

/*
  Links back to the home page are plain anchors on purpose: the 3D journey is
  set up by a head script on a full page load, which a client side route change
  would skip.
*/

export function BlogHeader({
  locale,
  hrefs,
  onIndex = false,
}: {
  locale: Locale;
  hrefs: Partial<Record<Locale, string>>;
  onIndex?: boolean;
}) {
  const c = getContent(locale);
  return (
    <header className="blog-header">
      <a href={localePath(locale)} className="blog-mark">
        {site.name}
      </a>
      <Link href={blogPath(locale)} className="blog-nav-link" aria-current={onIndex ? "page" : undefined}>
        {c.blog.navLabel}
      </Link>
      <LanguageSwitch locale={locale} label={c.nav.languageLabel} hrefs={hrefs} />
    </header>
  );
}

export function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale;
  items: { label: string; href?: string; fullLoad?: boolean }[];
}) {
  const c = getContent(locale);
  return (
    <nav aria-label={c.blog.breadcrumbLabel} className="breadcrumbs">
      <ol>
        {items.map((item) => (
          <li key={item.label}>
            {!item.href ? (
              <span aria-current="page">{item.label}</span>
            ) : item.fullLoad ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <Link href={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function BlogFooter({ locale }: { locale: Locale }) {
  const c = getContent(locale);
  return (
    <footer className="blog-footer">
      <a href={localePath(locale)}>{c.footer.rights}</a>
      <span className="tabular">{new Date().getFullYear()}</span>
    </footer>
  );
}
