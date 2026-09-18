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
  /**
   * Shown at the end of the post and emitted as FAQPage schema from this same
   * list, so the schema can never claim more than the page shows. Plain text
   * only: no markdown, no HTML. Each answer must be something the post says.
   */
  faq?: { q: string; a: string }[];
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
      "Express ve JWT ile kimlik doğrulama ve rol bazlı yetkilendirmeyi kod örnekleriyle, sık yapılan sahiplik kontrolü hatasıyla birlikte anlatıyorum. Hemen oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "JWT nedir ve Express'te nasıl kullanılır?",
        a: "JWT, sunucunun imzaladığı ve içine kullanıcı id'si ile rol gibi bilgileri gömdüğü bir metindir. Kullanıcı giriş yapınca sunucu token üretir, istemci her istekte Authorization başlığında gönderir ve Express'te bir ara katman (middleware) imzayı doğrular.",
      },
      {
        q: "Access token ile refresh token arasındaki fark nedir?",
        a: "Access token kısa ömürlüdür (örneğin 15 dakika) ve her API isteğinde gönderilir. Refresh token uzun ömürlüdür ve yalnızca yeni bir access token almak için kullanılır; httpOnly cookie'de saklanması önerilir.",
      },
      {
        q: "JWT token localStorage'da saklanmalı mı?",
        a: "Önerilmez. localStorage JavaScript ile okunabildiği için bir XSS açığı token'ın çalınmasına yol açar. Access token'ı bellekte, refresh token'ı httpOnly cookie'de tutmak daha güvenlidir.",
      },
      {
        q: "Rol kontrolü yetmiyor mu, sahiplik kontrolü neden gerekir?",
        a: "Rol kontrolü kullanıcının müşteri ya da admin olduğuna bakar, ama bir kaydın o kullanıcıya ait olup olmadığını denetlemez. Sahiplik kontrolü yoksa giriş yapmış herhangi bir müşteri URL'deki id'yi değiştirerek başkasının siparişini görebilir.",
      },
    ],
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
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "hreflang nedir, neden gerekir?",
        a: "hreflang, aynı içeriğin farklı dil sürümlerini birbirine bağlayan bir etikettir. Olmadan Google dil sürümlerini birbirinden habersiz ayrı sayfalar sayabilir, hatta birini kopya sanıp gizleyebilir.",
      },
      {
        q: "Next.js App Router'da hreflang nasıl eklenir?",
        a: "generateMetadata içinde alternates.languages alanına her dilin yolunu ve x-default değerini yazarak. Her dil sayfası kendisi dahil tüm alternatifleri listelemelidir.",
      },
      {
        q: "x-default ne işe yarar?",
        a: "x-default, hiçbir dille eşleşmeyen ziyaretçi için varsayılan sayfayı belirtir. Bu sitede varsayılan olarak Türkçe sürüme işaret eder.",
      },
      {
        q: "Canonical hangi adresi göstermeli?",
        a: "Sitenin yönlendirme yapmayan, yayındaki gerçek adresini. Hosting apex adresi www'ye yönlendiriyorsa canonical, hreflang ve sitemap www'li adresi kullanmalıdır. Canonical adresine curl -I ile istek attığında 200 dönmelidir.",
      },
    ],
    load: () => import("@/content/blog/tr/nextjs-cok-dilli-site-hreflang-canonical-kurulumu.mdx"),
  },
  {
    key: "nodejs-prisma-postgresql",
    locale: "tr",
    slug: "nodejs-prisma-postgresql-sema-tasarimi",
    title: "Node.js Projesinde Prisma ve PostgreSQL ile Şema Tasarımı",
    description:
      "Prisma ve PostgreSQL ile ilişkili bir veritabanı şemasını örnek bir e-ticaret şemasıyla, migration, indeks ve transaction dahil anlatıyorum. Hemen oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "Parayı veritabanında neden Float yerine Int tutmalıyım?",
        a: "Kayan noktalı sayılar yuvarlama hatası yapabilir; 10.10 gibi bir tutar 10.099999999 olarak saklanabilir. Tutarı kuruş (cent) cinsinden tam sayı tutmak bu hatayı ortadan kaldırır.",
      },
      {
        q: "Prisma foreign key için otomatik indeks oluşturur mu?",
        a: "Hayır, Prisma foreign key alanları için otomatik indeks eklemez. Sık sorguladığın alanlara @@index ile elle indeks tanımlaman gerekir.",
      },
      {
        q: "Prisma'da N+1 sorgu problemi nedir?",
        a: "Döngü içinde her kayıt için ayrı sorgu atmaktır; 100 kayıt için 101 sorgu çalışır. include ile ilişkili veriyi tek sorguda getirerek önlenir.",
      },
      {
        q: "Prisma'da $transaction ne zaman kullanılır?",
        a: "Birden fazla adımı olan ve biri başarısız olursa hepsinin geri alınması gereken işlemlerde, örneğin sipariş oluştururken stok düşmek gibi. Adımlardan biri hata verirse o ana kadar yapılan değişiklikler geri alınır.",
      },
    ],
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
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "Junior yazılımcı portfolyosunda hangi projeler olmalı?",
        a: "Sayıdan çok her projenin neyi gösterdiği önemlidir: gerçek bir sorunu çözen, bir mimari kararı savunabildiğin ve bitmiş, çalışan projeler. Az sayıda güçlü proje, çok sayıda zayıf projeden daha iyi bir izlenim bırakır.",
      },
      {
        q: "Müşteri projelerini portfolyoda gösterirken nelere dikkat edilmeli?",
        a: "Kurum adı yalnızca izin varsa yazılmalı, izin yoksa genel bir tanım kullanılmalıdır. Ekran görüntüsünde gerçek müşteri verisi olmamalı, test hesabı ve örnek veri kullanılmalıdır.",
      },
      {
        q: "GitHub profilinde nelere dikkat edilmeli?",
        a: "README'nin ilk cümlesi projenin ne yaptığını söylemeli, commit geçmişi gerçek bir gelişim sürecini göstermeli ve sabitlenen repolar rastgele değil, en çok şey anlatanlar arasından seçilmeli.",
      },
      {
        q: "Çalışmayan bir projeyi portfolyoya koymalı mıyım?",
        a: "Canlıda çalışmayan bir demo linki koymak yerine ekran görüntüsü ve mimari açıklamasıyla göstermek daha iyidir. Çalışmayan bir link yarım kalmış bir izlenim bırakır.",
      },
    ],
    load: () => import("@/content/blog/tr/junior-yazilimci-portfolyosu-nasil-hazirlanir.mdx"),
  },
  {
    key: "nodejs-dotnet-gecis",
    locale: "tr",
    slug: "nodejs-gelistiricisinin-gozunden-dotnet-core-gecis",
    title: "Bir Node.js Geliştiricisinin Gözünden .NET Core'a Geçiş",
    description:
      "Node.js'ten C# ve .NET Core'a geçerken iki ekosistemin nerede benzeştiğini ve nerede ayrıldığını anlatıyorum. Bir rehber değil, öğrenme notu. Hemen oku!",
    publishedAt: "2026-09-16",
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "Node.js bilen biri için .NET Core'a geçiş zor mu?",
        a: "Katmanlı mimari ve ORM mantığı tanıdık gelir; dependency injection ve daha katı tip sistemi ise farklı bir çalışma şekli getirir. Bu yazı bir öğrenme notudur, kesin bir zorluk derecesi vermez.",
      },
      {
        q: "ASP.NET Core'da dependency injection nasıl çalışır?",
        a: "Dependency injection framework'ün bir parçasıdır. Controller'ın constructor'ına arayüzü (örneğin IOrderService) yazarsın, hangi sınıfın enjekte edileceğini Program.cs içinde builder.Services.AddScoped ile bir kere tanımlarsın.",
      },
      {
        q: "Prisma ile Entity Framework Core arasındaki fark nedir?",
        a: "Kavramsal olarak aynı işi yaparlar: modeli kodda tanımlar, migration üretir ve ilişkili veriyi tek sorguda getirirler. Fark sözdizimindedir; Prisma bir schema.prisma dosyası kullanırken EF Core C# sınıflarını ve DbContext yapılandırmasını kullanır.",
      },
      {
        q: "C# ile TypeScript'in tip sistemi arasındaki fark nedir?",
        a: "TypeScript'te any gibi gevşetmeler bazı hataların çalışma zamanına kalmasına neden olabilir. C# daha katıdır ve yanlış tipli parametre ya da null kontrolü yapılmamış referans gibi hataları derleme zamanında yakalar.",
      },
    ],
    load: () => import("@/content/blog/tr/nodejs-gelistiricisinin-gozunden-dotnet-core-gecis.mdx"),
  },
  {
    key: "local-ai-visibility",
    locale: "tr",
    slug: "yerel-isletme-yapay-zeka-cevaplarinda-nasil-cikar",
    title: "Yerel Bir İşletme Yapay Zeka Cevaplarında Nasıl Çıkar?",
    description:
      "Bir çanta mağazasının sitesi ChatGPT ve Google AI cevaplarında çıkmaya başladı. Ne gözlemlediğimi, neyi bilmediğimi ve önerdiklerimi anlatıyorum. Oku!",
    publishedAt: "2026-09-19",
    updatedAt: "2026-09-19",
    faq: [
      {
        q: "Yapay zeka cevaplarında çıkmak için ne yapılır?",
        a: "Kesin bir yöntem yok. Yaygın olarak önerilenler: yapay zeka botlarını robots.txt'te engellememek, Google işletme profilini eksiksiz doldurmak, işletme bilgilerini her yerde aynı yazmak, siteyi net bir cümleyle tanımlamak ve yapısal veri eklemek. Bu yazıdaki gözlem yalnızca üç günlüktür.",
      },
      {
        q: "llms.txt yapay zekada çıkmayı sağlar mı?",
        a: "Kanıtlı değil. llms.txt resmi bir standart değil ve büyük sağlayıcıların okuduğunu doğrulayan resmi bir açıklama bilinmiyor. Eklemenin maliyeti düşüktür ama tek başına bir strateji sayılmaz.",
      },
      {
        q: "ChatGPT her seferinde aynı sonucu gösterir mi?",
        a: "Hayır. Yapay zeka cevapları aynı soruda bile değişebilir, örneğin Claude'da aynı arama her seferinde çıkmadı. Bu yüzden aramayı gizli sekmede, farklı günlerde birkaç kez denemek ve sonucu tarihiyle kaydetmek gerekir.",
      },
      {
        q: "Robots.txt'te yapay zeka botlarına izin vermek gerekli mi?",
        a: "Bu botları engellemek, ilgili ürünlerde görünmeni zorlaştırabilir. Örneğin OAI-SearchBot ChatGPT'nin arama tarafında kullanılır. Google-Extended ise yalnızca Gemini'nin içeriği kullanmasını kontrol eder, Google'ın yapay zeka özetlerini etkilemez.",
      },
    ],
    load: () => import("@/content/blog/tr/yerel-isletme-yapay-zeka-cevaplarinda-nasil-cikar.mdx"),
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
