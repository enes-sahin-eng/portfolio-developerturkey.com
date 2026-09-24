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
  {
    key: "seo-geo-aeo-aio",
    locale: "tr",
    slug: "seo-geo-aeo-aio-nedir-farklari",
    title: "SEO, GEO, AEO ve AIO Nedir? Aralarındaki Farklar Neler?",
    description:
      "SEO, GEO, AEO ve AIO ne demek, farkları neler? Google'ın resmi rehberi ve bu sitede uyguladıklarımla terim karmaşasını sadeleştirip anlatıyorum. Hemen oku!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "GEO, SEO'nun yerini alacak mı?",
        a: "Google'a göre hayır. Google'ın üretken yapay zeka optimizasyon rehberi, yapay zeka aramasına optimizasyonun Google Arama açısından hâlâ SEO olduğunu söylüyor. Google'ın yapay zeka cevaplarındaki kaynak linkler arama dizinindeki sayfalardan geldiği için dizine eklenmemiş bir sayfa kaynak olamaz.",
      },
      {
        q: "AIO ile GEO aynı şey mi?",
        a: "AIO'nun tek bir standart anlamı yok. Bazı kaynaklarda Google AI Bakışı (AI Overviews) optimizasyonu, bazılarında AEO ve GEO'yu kapsayan genel yapay zeka optimizasyonu anlamına geliyor. Karışıklığı önlemek için AIO derken neyin kastedildiğini açıkça yazmak gerekir.",
      },
      {
        q: "llms.txt eklemek gerekli mi?",
        a: "Google aramada görünmek için gerekli değil. Google, llms.txt gibi yapay zeka metin dosyalarının arama görünürlüğüne ne yardımı ne zararı olduğunu söylüyor. Diğer sağlayıcılar için de etkisi kanıtlanmış değil; maliyeti düşük olduğu için eklenebilir ama bir strateji sayılmamalı.",
      },
      {
        q: "Yapay zeka görünürlüğü nasıl ölçülür?",
        a: "Google AI Bakışı ve AI Modu için Search Console'daki üretken yapay zeka performans raporu gösterim sayısını verir. ChatGPT, Claude ve Perplexity için böyle bir panel yok; aynı soru listesini farklı günlerde tekrar sorup sonuçları tarihiyle kaydetmek gerekir.",
      },
    ],
    load: () => import("@/content/blog/tr/seo-geo-aeo-aio-nedir-farklari.mdx"),
  },
  {
    key: "seo-geo-aeo-aio",
    locale: "en",
    slug: "seo-geo-aeo-aio-differences",
    title: "SEO vs GEO vs AEO vs AIO: What Are the Differences?",
    description:
      "What do SEO, GEO, AEO and AIO mean, and how do they differ? I explain it with Google's official docs and what I set up while building this site. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "Will GEO replace SEO?",
        a: "According to Google, no. Google's generative AI optimization guide says that, from Google Search's perspective, optimizing for AI search is still SEO. Supporting links in Google's AI answers come from pages in the search index, so a page that isn't indexed can't be cited.",
      },
      {
        q: "Are AIO and GEO the same thing?",
        a: "AIO has no single standard meaning. Some sources use it for Google AI Overviews optimization, others for general AI optimization that covers AEO and GEO. To avoid confusion, state clearly what AIO refers to.",
      },
      {
        q: "Do I need an llms.txt file?",
        a: "Not to appear in Google Search. Google says AI text files such as llms.txt neither help nor hurt visibility in Search. Their effect on other providers isn't proven either; the file costs little to add, but it shouldn't be counted as a strategy.",
      },
      {
        q: "How do you measure AI visibility?",
        a: "For Google AI Overviews and AI Mode, the generative AI performance report in Search Console shows impressions. ChatGPT, Claude and Perplexity offer no such panel; you ask the same list of questions on different days and record each result with its date.",
      },
    ],
    load: () => import("@/content/blog/en/seo-geo-aeo-aio-differences.mdx"),
  },
  {
    key: "nodejs-jwt-rbac",
    locale: "en",
    slug: "nodejs-express-jwt-role-based-authorization",
    title: "Role-Based Authorization in Node.js and Express with JWT",
    description:
      "I explain authentication and role-based authorization with Express and JWT through code examples, including the common ownership check mistake. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "What is JWT and how is it used in Express?",
        a: "A JWT is a piece of text the server signs and embeds information such as the user id and role in. When the user logs in, the server issues a token, the client sends it in the Authorization header on every request, and a middleware in Express verifies the signature.",
      },
      {
        q: "What is the difference between an access token and a refresh token?",
        a: "An access token is short-lived (for example 15 minutes) and sent with every API request. A refresh token is long-lived and used only to get a new access token; storing it in an httpOnly cookie is recommended.",
      },
      {
        q: "Should a JWT be stored in localStorage?",
        a: "It isn't recommended. Because localStorage can be read with JavaScript, an XSS hole leads to token theft. Keeping the access token in memory and the refresh token in an httpOnly cookie is safer.",
      },
      {
        q: "Isn't a role check enough? Why is an ownership check needed?",
        a: "A role check looks at whether the user is a customer or an admin, but it doesn't check whether a record belongs to that user. Without an ownership check, any logged-in customer can see someone else's order by changing the id in the URL.",
      },
    ],
    load: () => import("@/content/blog/en/nodejs-express-jwt-role-based-authorization.mdx"),
  },
  {
    key: "nextjs-i18n-seo",
    locale: "en",
    slug: "nextjs-multilingual-site-hreflang-canonical",
    title: "Multilingual Next.js Site: Setting Up hreflang and Canonical",
    description:
      "I explain a TR/EN setup in the Next.js App Router, and the hreflang and canonical mistakes to avoid, starting from my own www redirect mistake. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "What is hreflang and why is it needed?",
        a: "hreflang is a tag that links the different language versions of the same content. Without it, Google may treat the language versions as unrelated pages, or even take one for a duplicate and hide it.",
      },
      {
        q: "How do you add hreflang in the Next.js App Router?",
        a: "By listing the path of each language and the x-default value in the alternates.languages field inside generateMetadata. Every language page should list all alternates, including itself.",
      },
      {
        q: "What does x-default do?",
        a: "x-default sets the default page for visitors who match no language. On this site it points to the Turkish version.",
      },
      {
        q: "Which address should the canonical point to?",
        a: "The site's real live address, the one that doesn't redirect. If the host redirects the apex to www, the canonical, hreflang and sitemap should use the www address. A request to the canonical address with curl -I should return 200.",
      },
    ],
    load: () => import("@/content/blog/en/nextjs-multilingual-site-hreflang-canonical.mdx"),
  },
  {
    key: "nodejs-prisma-postgresql",
    locale: "en",
    slug: "nodejs-prisma-postgresql-schema-design",
    title: "Database Schema Design in Node.js with Prisma and PostgreSQL",
    description:
      "I explain designing a relational schema with Prisma and PostgreSQL through an e-commerce example, including migrations, indexes and transactions. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "Why store money as an Int instead of a Float in the database?",
        a: "Floating point numbers can produce rounding errors; an amount like 10.10 can be stored as 10.099999999. Storing the amount as a whole number of cents removes this error.",
      },
      {
        q: "Does Prisma create indexes for foreign keys automatically?",
        a: "No, Prisma doesn't add indexes for foreign key fields automatically. You need to define indexes on frequently queried fields yourself with @@index.",
      },
      {
        q: "What is the N+1 query problem in Prisma?",
        a: "It is running a separate query for each record inside a loop; for 100 records, 101 queries run. It is avoided by fetching related data in a single query with include.",
      },
      {
        q: "When is $transaction used in Prisma?",
        a: "For operations with several steps where all of them must be rolled back if one fails, such as decreasing stock while creating an order. If one of the steps throws, the changes made up to that point are rolled back.",
      },
    ],
    load: () => import("@/content/blog/en/nodejs-prisma-postgresql-schema-design.mdx"),
  },
  {
    key: "junior-portfolyo",
    locale: "en",
    slug: "junior-developer-portfolio-projects",
    title: "Junior Developer Portfolio: Which Projects Should Go In?",
    description:
      "Which projects belong in a portfolio, how to show client work, how to organize GitHub? I explain it all with real decisions from my own portfolio. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "Which projects should a junior developer portfolio include?",
        a: "What each project shows matters more than the number: finished, working projects that solve a real problem and involve an architectural decision you can defend. A few strong projects leave a better impression than many weak ones.",
      },
      {
        q: "What should you watch when showing client projects in a portfolio?",
        a: "Name the organization only with permission; otherwise use a general description. Screenshots should contain no real customer data; use a test account and sample data.",
      },
      {
        q: "What should you pay attention to on a GitHub profile?",
        a: "The first sentence of the README should say what the project does, the commit history should show a real development process, and pinned repos should be chosen from the ones that say the most, not at random.",
      },
      {
        q: "Should I put a project that doesn't work in my portfolio?",
        a: "Instead of a demo link that doesn't work, it's better to show it with screenshots and an architecture description. A broken link leaves a half-finished impression.",
      },
    ],
    load: () => import("@/content/blog/en/junior-developer-portfolio-projects.mdx"),
  },
  {
    key: "nodejs-dotnet-gecis",
    locale: "en",
    slug: "nodejs-developer-moving-to-dotnet-core",
    title: "Moving to .NET Core Through a Node.js Developer's Eyes",
    description:
      "Moving from Node.js to C# and .NET Core, I describe where the two ecosystems are alike and where they differ. Not a guide, but a learning note. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "Is moving to .NET Core hard for someone who knows Node.js?",
        a: "The layered architecture and ORM logic feel familiar; dependency injection and a stricter type system bring a different way of working. This post is a learning note and doesn't give a definite level of difficulty.",
      },
      {
        q: "How does dependency injection work in ASP.NET Core?",
        a: "Dependency injection is part of the framework. You write the interface (for example IOrderService) in the controller's constructor and define once in Program.cs, with builder.Services.AddScoped, which class gets injected.",
      },
      {
        q: "What is the difference between Prisma and Entity Framework Core?",
        a: "Conceptually they do the same job: they define the model in code, generate migrations and fetch related data in a single query. The difference is in syntax; Prisma uses a schema.prisma file while EF Core uses C# classes and the DbContext configuration.",
      },
      {
        q: "What is the difference between the type systems of C# and TypeScript?",
        a: "In TypeScript, loosenings like any can leave some errors until runtime. C# is stricter and catches errors such as a wrongly typed parameter or an unchecked null reference at compile time.",
      },
    ],
    load: () => import("@/content/blog/en/nodejs-developer-moving-to-dotnet-core.mdx"),
  },
  {
    key: "local-ai-visibility",
    locale: "en",
    slug: "local-business-ai-answers-visibility",
    title: "How Does a Local Business Show Up in AI Search Answers?",
    description:
      "A bag shop's website started showing up in ChatGPT and Google AI answers. I share what I observed, what I don't know and what I recommend. Read it now!",
    publishedAt: "2026-09-25",
    updatedAt: "2026-09-25",
    faq: [
      {
        q: "What do you do to show up in AI answers?",
        a: "There is no definite method. Commonly recommended steps: not blocking AI bots in robots.txt, filling in the Google Business Profile completely, writing the business details the same everywhere, describing the site in a clear sentence and adding structured data. The observation in this post covers only three days.",
      },
      {
        q: "Does llms.txt make a site show up in AI answers?",
        a: "It isn't proven. llms.txt isn't an official standard, and no official statement confirming that the major providers read it is known. It costs little to add, but it doesn't count as a strategy on its own.",
      },
      {
        q: "Does ChatGPT show the same result every time?",
        a: "No. AI answers can change even for the same question; for example, the same search didn't show up in Claude every time. That's why you should try the search in a private window several times on different days and record each result with its date.",
      },
      {
        q: "Do you need to allow AI bots in robots.txt?",
        a: "Blocking these bots can make it harder to appear in the related products. For example, OAI-SearchBot is used by ChatGPT's search. Google-Extended only controls whether Gemini can use the content and doesn't affect Google's AI summaries.",
      },
    ],
    load: () => import("@/content/blog/en/local-business-ai-answers-visibility.mdx"),
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
