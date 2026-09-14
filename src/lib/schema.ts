import { absoluteUrl, htmlLang, localePath, site, type Locale } from "@/lib/site";
import { getContent } from "@/lib/content";

/**
 * Every field here is also rendered on the page. Schema that claims more than
 * the page shows is a manual-action risk, so nothing is added that a reader
 * cannot verify by scrolling.
 */
export function buildGraph(locale: Locale) {
  const c = getContent(locale);
  const pageUrl = absoluteUrl(localePath(locale));

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${site.url}/#person`,
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
      },
      {
        "@type": "WebSite",
        "@id": `${site.url}/#website`,
        url: site.url,
        name: site.person.name,
        alternateName: [`${site.person.name}, ${c.hero.role}`, "developerturkey.com"],
        description: c.meta.description,
        publisher: { "@id": `${site.url}/#person` },
        inLanguage: htmlLang[locale],
      },
      {
        "@type": "ProfilePage",
        "@id": `${pageUrl}#profilepage`,
        url: pageUrl,
        name: c.meta.title,
        description: c.meta.description,
        isPartOf: { "@id": `${site.url}/#website` },
        about: { "@id": `${site.url}/#person` },
        mainEntity: { "@id": `${site.url}/#person` },
        inLanguage: htmlLang[locale],
      },
    ],
  };
}
