export const locales = ["tr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "tr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const site = {
  name: "Developer Turkey",
  // Vercel serves www as production; the apex 308s to it. Canonicals must not point at a redirect.
  url: "https://www.developerturkey.com",
  person: {
    name: "Enes Şahin",
    givenName: "Enes",
    familyName: "Şahin",
    email: "enessahin25545425@gmail.com",
    phone: "+905446080469",
    location: { city: "İstanbul", country: "TR" },
  },
  social: {
    github: "https://github.com/enes-sahin-eng",
    linkedin: "https://www.linkedin.com/in/enes-sahin-eng",
  },
  cv: {
    tr: "/cv/Enes-Sahin-CV-TR.pdf",
    en: "/cv/Enes-Sahin-CV-EN.docx",
  },
  portrait: "/media/portrait.png",
  education: {
    institution: "İstanbul Sabahattin Zaim Üniversitesi",
    url: "https://www.izu.edu.tr",
  },
} as const;

export const ogLocale: Record<Locale, string> = {
  tr: "tr_TR",
  en: "en_US",
};

export const htmlLang: Record<Locale, string> = {
  tr: "tr-TR",
  en: "en-US",
};

export function localePath(locale: Locale, path = "") {
  return `/${locale}${path}`;
}

export function absoluteUrl(path: string) {
  return `${site.url}${path}`;
}

/** A WhatsApp chat with the number above, the first message already written. */
export function whatsappUrl(message: string) {
  return `https://wa.me/${site.person.phone.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}
