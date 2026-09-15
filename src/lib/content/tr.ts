import { site } from "@/lib/site";
import type { Content } from "./types";

export const tr: Content = {
  meta: {
    title: "Enes Şahin, Full Stack Developer",
    titleTemplate: "%s | Enes Şahin",
    description:
      "Enes Şahin, İstanbul'da full stack web geliştirici. Node.js, Next.js ve PostgreSQL ile ölçeklenebilir web uygulamaları geliştiriyorum. Hemen iletişime geç!",
    keywordsNote: "",
  },
  nav: {
    chapters: [
      { id: "hakkimda", label: "Hakkımda" },
      { id: "isler", label: "İşler" },
      { id: "deneyim", label: "Deneyim" },
      { id: "yetenekler", label: "Yetenekler" },
      { id: "iletisim", label: "İletişim" },
    ],
    languageLabel: "Dil",
  },
  hero: {
    name: "Enes Şahin",
    role: "Full Stack Developer",
    line: "Node.js ve Next.js ile ölçeklenebilir web uygulamaları geliştiriyorum. Şu anda backend tarafımı C# ve .NET Core ile genişletiyorum.",
    primary: { label: "CV indir", href: site.cv.tr },
    secondary: { label: "İletişim", href: "#iletisim" },
    portraitAlt: "Enes Şahin'in siyah beyaz portresi",
  },
  about: {
    heading: "Framework'ten önce, altındaki mantık",
    paragraphs: [
      "Yazılım Mühendisliği son sınıf öğrencisiyim. Ocak 2022'den beri gerçek bir e-ticaret işletmesinin backend'ini sıfırdan geliştiriyorum. Temmuz 2026'dan beri de bir dijital ajansta full stack stajyer olarak kurumsal ölçekli projelerde çalışıyorum.",
      "Bir teknolojiyi kullanmadan önce altındaki mantığı anlamayı önemsiyorum. Bir veritabanını neden ilişkisel seçtiğimi, bir yetkilendirme katmanını neden middleware'e koyduğumu anlatabilmek benim için bildiğim kütüphane sayısından daha değerli.",
      "Sağlam bir backend ve veri modelleme temelini, gerçek bir ürün geliştirme sürecinde mentorluk eşliğinde derinleştirebileceğim bir pozisyon arıyorum.",
    ],
  },
  work: {
    heading: "Neler geliştirdim",
    intro:
      "Üretimde çalışan işler ve arkalarındaki kararlar. Müşteri projelerinde kurum adları paylaşılmıyor; bazı projelerde yalnızca mimari anlatılıyor ve görseller temsilidir.",
    projects: [
      {
        slug: "pnr-eticaret",
        title: "PNR, çanta ve aksesuar e-ticaret platformu",
        kind: "Uçtan uca geliştirme, 2022'den beri",
        summary:
          "Gerçek bir işletme için sıfırdan geliştirdiğim e-ticaret sistemi. Ürün, kategori, sipariş ve kullanıcı varlıklarını kapsayan ilişkisel bir veri modeli, kendi yazdığım REST API ve Next.js App Router ile iki dilli bir arayüz. Ziyaretçinin tabanı seçip aksesuarlarla kendi çantasını kurduğu Tasarım Atölyesi bölümü de bu sistemin üstünde çalışıyor.",
        decisions: [
          {
            question: "Neden PostgreSQL ve Prisma?",
            answer:
              "Sipariş ile stok arasındaki ilişki transaction bütünlüğü istiyor: yarım kalan bir sipariş stoktan düşmemeli. Bu kısıt, ilişkisel bir veritabanını NoSQL'e tercih ettirdi. Prisma'yı da şema ile kod arasında tek bir doğruluk kaynağı olsun diye seçtim.",
          },
          {
            question: "Neden JWT ve rol bazlı yetkilendirme?",
            answer:
              "Yönetici, tasarımcı ve müşteri rollerinin farklı yetkilere ihtiyacı vardı. Yetkilendirmeyi controller'lara dağıtmak yerine middleware katmanında (isAuth, isRole) merkezileştirdim; yeni bir uç nokta eklerken yetki kararı tek yerde kalıyor.",
          },
        ],
        stack: ["Next.js (App Router)", "Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
        image: {
          src: "/media/work-pnr.jpg",
          alt: "PNR e-ticaret platformunun ana sayfası: tam genişlikte ürün görseli üzerinde koleksiyon başlığı, üstte kategori menüsü ve sepet",
          width: 1440,
          height: 900,
        },
      },
      {
        slug: "egitim-kurumu-cok-dilli-site",
        title: "Çok şubeli bir eğitim kurumu için üç dilli site, 200'den fazla sayfa",
        kind: "Ajans projesi, 2026",
        summary:
          "Next.js App Router ve TypeScript ile sıfırdan geliştirdiğim, birden fazla şubesi olan bir eğitim kurumunun sitesi. SSR mimarisini, TR, EN ve AR dillerini kapsayan çoklu dil altyapısını ve design token tabanlı tema sistemini kurdum. Ziyaretçi hangi sayfadan girerse girsin şubesini seçip ön kayıt bırakabiliyor; program kategorileri ve WhatsApp üzerinden anlık iletişim aynı akışın parçası. Three.js ile etkileşimli bir 3D arayüz bileşeni tasarladım ve sitenin arama motoru görünürlüğünden uçtan uca sorumlu oldum.",
        decisions: [
          {
            question: "Arama görünürlüğü neden ayrı bir iş kalemi oldu?",
            answer:
              "Birbirine yakın konularda yazılmış 200'ü aşkın sayfa, aynı sorgu için birbiriyle yarışmaya başlıyor. Google Search Console analizinde bu keyword cannibalization sorununu tespit edip sayfa niyetlerini ayrıştırdım.",
          },
          {
            question: "Yapay zeka aramaları için ne yapıldı?",
            answer:
              "Course, FAQPage ve BreadcrumbList formatlarında JSON-LD şemaları kurdum, canonical ve hreflang yapılandırmasını üç dil için tamamladım, dil modellerinin siteyi doğru okuyabilmesi için llms.txt dokümantasyonu hazırladım.",
          },
        ],
        stack: ["Next.js", "TypeScript", "SSR", "Three.js", "JSON-LD", "i18n", "Form akışı"],
        image: {
          src: "/media/work-school.jpg",
          alt: "Eğitim kurumu sitesinin ana ekranı: sağda ön kayıt formu ve şube seçimi, altta program kategorileri",
          width: 1440,
          height: 900,
        },
      },
      {
        slug: "oto-lastik-yonetim-panelli-site",
        title: "Bir oto lastik işletmesi için panelden yönetilen site",
        kind: "Müşteri projesi, 2026",
        summary:
          "Sitedeki metinler, blog yazıları ve sıkça sorulan sorular işletmenin kendi yönetim panelinden değişiyor; içerik güncellemek için koda dokunmak gerekmiyor. Arkada kendi yazdığım bir Express API, önde bu içeriği her istekte sunucuda render eden bir Next.js uygulaması çalışıyor.",
        architecture: [
          "Express ve TypeScript ile REST API, Prisma üzerinden PostgreSQL. Blog, SSS ve anahtar değer yapısındaki site metinleri ayrı modeller; okuma uç noktaları herkese açık, yazma uç noktaları isAuth middleware'inin arkasında.",
          "Yönetici girişi bcrypt ile doğrulanıyor. JWT, httpOnly ve sameSite ayarlı bir çerezde taşınıyor ve tarayıcıdaki JavaScript'e hiç açılmıyor. Panel, istekleri bu çerezle gönderen ayrı bir API istemcisi kullanıyor.",
          "API, Coolify üzerinde Traefik reverse proxy arkasında çalışıyor. Express'in trust proxy ayarı sayesinde rate limit, proxy'nin değil gerçek ziyaretçinin IP'sine göre uygulanıyor.",
          "Arayüz önce statik export olarak kuruldu. Panelden yapılan her değişiklik yeniden deploy istediği için sunucu render'a geçirildi: içerik ham HTML'de kalıyor, güncellemeler build beklemeden yansıyor.",
          "Sitemap ve llms.txt blog yazılarını API'den okuyor, JSON-LD işletme bilgisini panel metinlerinden alıyor. Yayınlanan yazılar IndexNow ile Bing ve Yandex'e anında bildiriliyor.",
        ],
        stack: ["Next.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "JWT", "Coolify"],
        image: {
          src: "/media/work-tire.jpg",
          alt: "Temsili görsel: koyu zeminli bir oto lastik sitesinin ana ekranı, sağda jant ve lastik görseli, solda başlık ve arama butonu",
          width: 1440,
          height: 900,
          illustrative: true,
        },
      },
      {
        slug: "psikolog-icerik-yonetimli-site",
        title: "Bir psikoloğun kliniği için içerik yönetimli site",
        kind: "Müşteri projesi, 2026",
        summary:
          "Terapi alanları, yerel arama sayfaları, blog, videolar ve danışan yorumları tek bir yönetim panelinden besleniyor. Laravel API ile Next.js arayüzü ayrı servisler olarak çalışıyor; arayüz sayfaları API'den gelen içerikle sunucuda render ediyor.",
        architecture: [
          "Laravel 13 ile REST API ve Filament yönetim paneli. Terapiler, terapi sayfaları, SEO sayfaları, blog yazıları, videolar, yorumlar, iletişim mesajları ve bülten aboneleri panelde ayrı kaynaklar olarak yönetiliyor.",
          "Danışan yorumları Google Business Profile API'sinden her gün zamanlanmış bir komutla içeri aktarılıyor; erişim token'ı önbellekte tutuluyor.",
          "WhatsApp, telefon ve form etkileşimleri anonim bir ziyaretçi kimliğiyle API'ye olay olarak yazılıyor. Form gönderimleri referrer, UTM ve giriş sayfası bilgisiyle birlikte kaydediliyor.",
          "Next.js tarafında her terapi alanı ve yerel arama için ayrı açılış sayfaları var. Laravel storage'daki görseller next/image ile AVIF ve WebP olarak sunuluyor; güvenlik başlıkları ve 301 yönlendirmeleri yapılandırmada tanımlı.",
          "Sitemap, robots ve llms.txt arayüz uygulamasında üretiliyor; arayüz Coolify üzerinde yayında.",
        ],
        stack: ["Next.js", "TypeScript", "Laravel", "Filament", "Google Business Profile API", "Coolify"],
        image: {
          src: "/media/work-therapy.jpg",
          alt: "Temsili görsel: açık tonlarda bir psikolojik danışmanlık sitesinin ana ekranı, gün ışığı alan sakin bir oda ve randevu butonu",
          width: 1440,
          height: 900,
          illustrative: true,
        },
      },
      {
        slug: "ulasim-hizmeti-sitesi",
        title: "Bir ulaşım hizmeti için rezervasyon odaklı site",
        kind: "Müşteri projesi, 2026",
        summary:
          "Tek bir amaca kurulmuş bir site: ziyaretçiyi rezervasyona götürmek. Hizmet anlatımı kısa tutuldu, rezervasyon çağrısı sayfanın her noktasından erişilebilir durumda. Mobil öncelikli kuruldu, çünkü trafiğin tamamına yakını sosyal medyadan telefonla geliyor.",
        stack: ["Next.js", "TypeScript", "Mobil öncelikli"],
        image: {
          src: "/media/work-transport.jpg",
          alt: "Ulaşım hizmeti sitesinin ana ekranı: tam genişlikte sahil fotoğrafı üzerinde başlık ve rezervasyon butonu",
          width: 1440,
          height: 900,
        },
      },
    ],
    architectureHeading: "Mimari",
    illustrativeNote: "temsili görsel",
    alsoHeading: "Temelleri çalıştığım projeler",
    also: [
      {
        title: "React Movie Explorer",
        note: "TMDB REST API ile asenkron veri çekme, URL tabanlı durum yönetimi ve dinamik sayfalama. React Router v6.",
        href: "https://github.com/enes-sahin-eng/react-movie-explorer",
      },
      {
        title: "WhereAmI-Earth",
        note: "Geolocation, OpenCage Geocode ve REST Countries API'lerini birleştiren, ters coğrafi kodlama yapan asenkron uygulama. Vanilla JavaScript.",
        href: "https://github.com/enes-sahin-eng/WhereAmI-Earth",
      },
      {
        title: "Personel Yönetim Sistemi",
        note: "Nesne yönelimli programlama prensipleriyle C++ dilinde yazılmış konsol uygulaması. Rol ayrımı ve kayıt yönetimi.",
        href: "https://github.com/enes-sahin-eng/Employee-Management-System-C--Console-Application",
      },
    ],
  },
  experience: {
    heading: "Nerede çalıştım",
    roles: [
      {
        period: "Temmuz 2026, devam ediyor",
        title: "Full Stack Developer Stajyeri",
        org: "ideaZone Digital",
        place: "Avcılar, İstanbul",
        figures: [
          { value: "200+", label: "sayfa" },
          { value: "3", label: "dil" },
          { value: "4", label: "eş zamanlı müşteri projesi" },
        ],
        points: [
          "Next.js App Router ve TypeScript ile üç dilli, 200'den fazla sayfalık kurumsal bir siteyi sıfırdan geliştirdim.",
          "Dinamik metadata, canonical, hreflang, sitemap ve robots yapılandırmasını; Course, FAQPage ve BreadcrumbList JSON-LD şemalarını kurdum.",
          "Lighthouse ve Core Web Vitals metriklerini, görsel optimizasyonunu ve WCAG erişilebilirlik uyumunu iyileştirdim.",
          "Devraldığım kod tabanlarını inceleyip kaldıkları yerden geliştirdim, Laravel tabanlı bir projeye kısa sürede adapte oldum.",
          "Yayına alma sürecini uçtan uca yürüttüm: Hostinger VPS, Coolify ile CI/CD, Cloudflare DNS, Vercel önizlemeleri ve cPanel.",
        ],
      },
      {
        period: "Ocak 2022, devam ediyor",
        title: "E-ticaret Operasyon Uzmanı ve Web Geliştirici",
        org: "Pnrcantaksesuar",
        place: "Serbest çalışan",
        points: [
          "Node.js, Express, TypeScript, Prisma ORM ve PostgreSQL ile şirketin e-ticaret backend'ini sıfırdan geliştiriyorum.",
          "Ürün, kategori, sipariş ve kullanıcı varlıkları arasında ilişkisel veri modelini kurdum.",
          "JWT tabanlı kimlik doğrulama, şifre hashleme ve rol bazlı yetkilendirme içeren özel middleware katmanını (isAuth, isRole) tasarladım.",
          "Stok ve kategori yönetimini otomatikleştirmek için MongoDB tabanlı bir envanter yönetim sistemi geliştiriyorum.",
          "Sanal POS ve kargo API entegrasyonlarını test edip bakımını üstlendim.",
        ],
      },
    ],
    educationHeading: "Eğitim",
    education: {
      period: "Eylül 2022, devam ediyor",
      title: "Yazılım Mühendisliği, Lisans",
      org: "İstanbul Sabahattin Zaim Üniversitesi",
    },
  },
  skills: {
    heading: "Neler kullanıyorum",
    groups: [
      {
        name: "Backend",
        items: ["Node.js", "Express.js", "RESTful API", "JWT", "RBAC", "Prisma ORM"],
      },
      {
        name: "Veritabanı",
        items: ["PostgreSQL", "MongoDB", "İlişkisel veri modelleme", "Sorgu optimizasyonu"],
      },
      {
        name: "Frontend",
        items: ["TypeScript", "React", "Next.js (App Router)", "Three.js", "HTML5", "CSS3"],
      },
      {
        name: "DevOps",
        items: ["Git", "Docker", "Coolify (CI/CD)", "Vercel", "Hostinger VPS", "Cloudflare", "Linux"],
      },
      {
        name: "SEO ve GEO",
        items: ["Dinamik metadata", "hreflang, canonical", "JSON-LD", "Core Web Vitals", "WCAG", "llms.txt"],
      },
    ],
    learningLabel: "Şu anda öğreniyorum",
    learning: ["C#", ".NET Core"],
  },
  contact: {
    heading: "Konuşalım",
    line: "Gerçek bir ürün geliştirme sürecinde backend ve veri modelleme tarafında derinleşebileceğim bir ekip arıyorum.",
    emailLabel: "E-posta",
    links: [
      { label: "LinkedIn", href: site.social.linkedin },
      { label: "GitHub", href: site.social.github },
    ],
    cvLabel: "CV indir",
    cvHref: site.cv.tr,
    aside: "Küçük bir işletme için siteye ihtiyacınız varsa WhatsApp'tan da yazabilirsiniz.",
    whatsapp: {
      label: "WhatsApp'tan yazın",
      message: "Merhaba Enes, web siteniz üzerinden ulaşıyorum.",
    },
  },
  ledger: {
    heading: "Okuduklarınız",
    note: "Bu özet siz okudukça dolar. Sonunda indirilebilir CV ile aynı şeyi anlatır.",
    entries: [
      { chapter: "hakkimda", line: "Yazılım Mühendisliği son sınıfı. 2022'den beri üretimde kod yazıyor." },
      { chapter: "isler", line: "PNR e-ticaret platformu, üç dilli bir eğitim kurumu sitesi ve üç müşteri projesi." },
      { chapter: "deneyim", line: "ideaZone Digital'de full stack stajyer. Pnrcantaksesuar'da e-ticaret backend." },
      { chapter: "yetenekler", line: "Node.js, PostgreSQL, TypeScript, Next.js. C# ve .NET Core öğreniyor." },
      { chapter: "iletisim", line: "Backend ve veri modelleme tarafında derinleşebileceği bir ekip arıyor." },
    ],
  },
  footer: {
    rights: "Enes Şahin",
  },
  a11y: {
    skipToContent: "İçeriğe geç",
    chapterNav: "Bölümler",
  },
};
