import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Archivo } from "next/font/google";
import { htmlLang, isLocale, locales, localePath, ogLocale, site } from "@/lib/site";
import { getContent } from "@/lib/content";
import { buildGraph } from "@/lib/schema";
import { MotionProvider } from "@/components/motion-parts";
import "../globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const c = getContent(locale);

  return {
    metadataBase: new URL(site.url),
    title: { default: c.meta.title, template: c.meta.titleTemplate },
    description: c.meta.description,
    applicationName: site.name,
    authors: [{ name: site.person.name, url: site.url }],
    creator: site.person.name,
    alternates: {
      canonical: localePath(locale),
      languages: {
        tr: localePath("tr"),
        en: localePath("en"),
        "x-default": localePath("tr"),
      },
    },
    openGraph: {
      type: "profile",
      url: localePath(locale),
      siteName: site.name,
      title: c.meta.title,
      description: c.meta.description,
      locale: ogLocale[locale],
      alternateLocale: locales.filter((l) => l !== locale).map((l) => ogLocale[l]),
      firstName: site.person.givenName,
      lastName: site.person.familyName,
      images: [{ url: site.portrait, width: 288, height: 357, alt: c.hero.portraitAlt }],
    },
    twitter: {
      card: "summary",
      title: c.meta.title,
      description: c.meta.description,
      images: [{ url: site.portrait, alt: c.hero.portraitAlt }],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const graph = buildGraph(locale);

  return (
    // The head script adds `js` to <html> before hydration, which React would
    // otherwise report as an attribute mismatch on this one element.
    <html lang={htmlLang[locale]} className={archivo.variable} suppressHydrationWarning>
      <head>
        {/* Runs before first paint. `js` enables reveal start states; `immersive`
            turns the page into the 3D journey when WebGL exists and motion is
            welcome. The journey removes it again if WebGL fails to start, and
            without JavaScript the page stays an ordinary readable document. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var r=document.documentElement;r.classList.add('js');try{if(window.WebGLRenderingContext&&!matchMedia('(prefers-reduced-motion: reduce)').matches){r.classList.add('immersive');r.dataset.tone='dark'}}catch(e){}})()",
          }}
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
        />
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
