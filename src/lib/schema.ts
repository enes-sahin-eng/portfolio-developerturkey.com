import { absoluteUrl, htmlLang, localePath, site, type Locale } from "@/lib/site";
import { getContent } from "@/lib/content";
import { blogPath, type Post } from "@/lib/blog";

/**
 * Every field here is also rendered on the page. Schema that claims more than
 * the page shows is a manual-action risk, so nothing is added that a reader
 * cannot verify by scrolling.
 */
const personId = `${site.url}/#person`;
const websiteId = `${site.url}/#website`;

const graph = (nodes: object[]) => ({ "@context": "https://schema.org", "@graph": nodes });

function personNode(locale: Locale) {
  const c = getContent(locale);
  return {
    "@type": "Person",
    "@id": personId,
    name: site.person.name,
    givenName: site.person.givenName,
    familyName: site.person.familyName,
    url: site.url,
    image: absoluteUrl(site.portrait),
    jobTitle: c.hero.role,
    description: c.meta.description,
    email: `mailto:${site.person.email}`,
    address: {
      "@type": "PostalAddress",
      addressLocality: site.person.location.city,
      addressCountry: site.person.location.country,
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: site.education.institution,
    },
    knowsLanguage: ["tr", "en"],
    knowsAbout: c.skills.groups.flatMap((g) => g.items),
    sameAs: [site.social.github, site.social.linkedin],
  };
}

function websiteNode(locale: Locale) {
  const c = getContent(locale);
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: site.name,
    alternateName: ["DeveloperTurkey", "developerturkey.com"],
    description: c.meta.description,
    publisher: { "@id": personId },
    inLanguage: htmlLang[locale],
  };
}

/** The last item is the current page and carries no URL. */
function breadcrumb(id: string, items: { name: string; path?: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {}),
    })),
  };
}

export function buildGraph(locale: Locale) {
  const c = getContent(locale);
  const pageUrl = absoluteUrl(localePath(locale));

  return graph([
    personNode(locale),
    websiteNode(locale),
    {
      "@type": "ProfilePage",
      "@id": `${pageUrl}#profilepage`,
      url: pageUrl,
      name: c.meta.title,
      description: c.meta.description,
      isPartOf: { "@id": websiteId },
      about: { "@id": personId },
      mainEntity: { "@id": personId },
      inLanguage: htmlLang[locale],
    },
  ]);
}

export function buildBlogGraph(locale: Locale, list: Post[]) {
  const c = getContent(locale);
  const url = absoluteUrl(blogPath(locale));

  return graph([
    personNode(locale),
    websiteNode(locale),
    {
      "@type": "Blog",
      "@id": `${url}#blog`,
      url,
      name: c.blog.title,
      description: c.blog.description,
      inLanguage: htmlLang[locale],
      isPartOf: { "@id": websiteId },
      publisher: { "@id": personId },
      blogPost: list.map((post) => ({ "@id": `${absoluteUrl(blogPath(locale, post.slug))}#article` })),
    },
    breadcrumb(`${url}#breadcrumb`, [
      { name: c.blog.breadcrumbHome, path: localePath(locale) },
      { name: c.blog.navLabel },
    ]),
  ]);
}

export function buildPostGraph(post: Post) {
  const { locale } = post;
  const c = getContent(locale);
  const url = absoluteUrl(blogPath(locale, post.slug));

  return graph([
    personNode(locale),
    websiteNode(locale),
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      url,
      headline: post.title,
      description: post.description,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      inLanguage: htmlLang[locale],
      author: { "@id": personId },
      publisher: { "@id": personId },
      image: absoluteUrl(site.portrait),
      mainEntityOfPage: url,
      isPartOf: { "@id": `${absoluteUrl(blogPath(locale))}#blog` },
    },
    breadcrumb(`${url}#breadcrumb`, [
      { name: c.blog.breadcrumbHome, path: localePath(locale) },
      { name: c.blog.navLabel, path: blogPath(locale) },
      { name: post.title },
    ]),
  ]);
}
