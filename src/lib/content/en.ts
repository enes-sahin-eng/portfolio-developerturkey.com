import { site } from "@/lib/site";
import type { Content } from "./types";

export const en: Content = {
  meta: {
    title: "Enes Şahin, Full Stack Developer",
    titleTemplate: "%s | Enes Şahin",
    description:
      "Full stack developer building scalable APIs with Node.js, Express and PostgreSQL, and multilingual interfaces with Next.js. Based in Istanbul, shipping production work since 2022.",
    keywordsNote: "",
  },
  nav: {
    chapters: [
      { id: "about", label: "About" },
      { id: "work", label: "Work" },
      { id: "experience", label: "Experience" },
      { id: "skills", label: "Skills" },
      { id: "contact", label: "Contact" },
    ],
    languageLabel: "Language",
  },
  hero: {
    name: "Enes Şahin",
    role: "Full Stack Developer",
    line: "I build scalable web applications with Node.js and Next.js. Currently extending my backend work into C# and .NET Core.",
    primary: { label: "Download CV", href: site.cv.en },
    secondary: { label: "Contact", href: "#contact" },
    portraitAlt: "Black and white portrait of Enes Şahin",
  },
  about: {
    heading: "The logic underneath, before the framework",
    paragraphs: [
      "I am a final year Software Engineering student. Since January 2022 I have been building the backend of a real e-commerce business from the ground up, and since July 2026 I have worked as a full stack intern at a digital agency on enterprise scale projects.",
      "I care about understanding the logic beneath a technology before reaching for it. Being able to explain why a database is relational, or why an authorization layer belongs in middleware, matters more to me than the number of libraries I can name.",
      "I am looking for a position where I can deepen a solid backend and data modeling foundation through mentorship, inside a real product development process.",
    ],
  },
  work: {
    heading: "What I have built",
    intro:
      "Work running in production, and the decisions behind it. Client names are not shared on this page; some projects are described by their architecture only, with representative visuals.",
    projects: [
      {
        slug: "pnr-eticaret",
        title: "PNR, a bag and accessory e-commerce platform",
        kind: "End to end development, since 2022",
        summary:
          "An e-commerce system I built from scratch for a real business. A relational data model across product, category, order and user entities, a REST API I wrote myself, and a bilingual interface on Next.js App Router. The Design Workshop, where a visitor picks a base and builds their own bag from accessories, runs on the same system.",
        decisions: [
          {
            question: "Why PostgreSQL and Prisma?",
            answer:
              "The relationship between an order and stock needs transaction integrity: a failed order must never deduct stock. That constraint made a relational database the right call over NoSQL. I chose Prisma to keep one source of truth between the schema and the code.",
          },
          {
            question: "Why JWT and role based access control?",
            answer:
              "Admin, designer and customer roles each needed different permissions. Rather than spreading authorization across controllers, I centralised it in the middleware layer (isAuth, isRole), so adding an endpoint leaves the permission decision in one place.",
          },
        ],
        stack: ["Next.js (App Router)", "Node.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "Docker"],
        image: {
          src: "/media/work-pnr.jpg",
          alt: "Home screen of the PNR e-commerce platform: a full width product image with the collection headline over it, category menu and cart above",
          width: 1440,
          height: 900,
        },
      },
      {
        slug: "egitim-kurumu-cok-dilli-site",
        title: "A three language site for a multi branch school, more than 200 pages",
        kind: "Agency project, 2026",
        summary:
          "A site I built from scratch with Next.js App Router and TypeScript for an education institution with several branches. I set up the SSR architecture, the multilingual infrastructure covering Turkish, English and Arabic, and a design token based theming system. Whichever page a visitor lands on, they can pick a branch and leave an enrolment request; the programme categories and instant contact over WhatsApp are part of the same flow. I designed an interactive 3D interface component with Three.js and owned the site's search visibility end to end.",
        decisions: [
          {
            question: "Why did search visibility become its own workstream?",
            answer:
              "Past 200 pages written around adjacent topics, a site starts competing against itself for the same query. I found that keyword cannibalization in Google Search Console analysis and separated the pages by intent.",
          },
          {
            question: "What was done for AI driven search?",
            answer:
              "I implemented JSON-LD schemas in Course, FAQPage and BreadcrumbList formats, completed the canonical and hreflang configuration across all three languages, and wrote llms.txt documentation so language models read the site correctly.",
          },
        ],
        stack: ["Next.js", "TypeScript", "SSR", "Three.js", "JSON-LD", "i18n", "Form flow"],
        image: {
          src: "/media/work-school.jpg",
          alt: "Home screen of the school site: enrolment form and branch selector on the right, programme categories below",
          width: 1440,
          height: 900,
        },
      },
      {
        slug: "oto-lastik-yonetim-panelli-site",
        title: "A panel managed site for a car tyre business",
        kind: "Client project, 2026",
        summary:
          "The site's copy, blog posts and FAQs are edited from the business's own admin panel, so updating content never needs a code change. Behind it runs an Express API I wrote; in front, a Next.js app renders that content on the server for every request.",
        architecture: [
          "A REST API in Express and TypeScript on PostgreSQL through Prisma. Blog posts, FAQs and key value site copy are separate models; read endpoints are public, write endpoints sit behind the isAuth middleware.",
          "Admin login is verified with bcrypt. The JWT travels in an httpOnly, sameSite cookie and is never exposed to JavaScript in the browser. The panel uses its own API client that sends requests with that cookie.",
          "The API runs on Coolify behind a Traefik reverse proxy. With trust proxy set, rate limiting applies to the real visitor's IP rather than the proxy's.",
          "The front end started as a static export. Because every panel change then needed a redeploy, it moved to server rendering: content stays in the raw HTML and updates appear without waiting for a build.",
          "The sitemap and llms.txt read blog posts from the API, and the JSON-LD takes business details from the panel copy. Published posts are pushed to Bing and Yandex instantly through IndexNow.",
        ],
        stack: ["Next.js", "Express", "TypeScript", "Prisma", "PostgreSQL", "JWT", "Coolify"],
        image: {
          src: "/media/work-tire.jpg",
          alt: "Representative visual: home screen of a dark themed tyre shop site, a wheel and tyre on the right, headline and call button on the left",
          width: 1440,
          height: 900,
          illustrative: true,
        },
      },
      {
        slug: "psikolog-icerik-yonetimli-site",
        title: "A content managed site for a psychologist's practice",
        kind: "Client project, 2026",
        summary:
          "Therapy areas, local search pages, the blog, videos and client reviews are all fed from one admin panel. A Laravel API and a Next.js front end run as separate services, and the front end renders its pages on the server from the API's content.",
        architecture: [
          "A REST API and Filament admin panel on Laravel 13. Therapies, therapy pages, SEO pages, blog posts, videos, reviews, contact messages and newsletter subscribers are managed as separate resources.",
          "Client reviews are imported from the Google Business Profile API by a scheduled daily command, with the access token held in cache.",
          "WhatsApp, phone and form interactions are written to the API as events under an anonymous visitor ID. Form submissions are stored with their referrer, UTM parameters and landing page.",
          "On the Next.js side, every therapy area and local search gets its own landing page. Images from Laravel storage are served through next/image as AVIF and WebP, and security headers and 301 redirects are defined in the configuration.",
          "The sitemap, robots and llms.txt are generated by the front end application, which is deployed on Coolify.",
        ],
        stack: ["Next.js", "TypeScript", "Laravel", "Filament", "Google Business Profile API", "Coolify"],
        image: {
          src: "/media/work-therapy.jpg",
          alt: "Representative visual: home screen of a light toned counselling site, a calm sunlit room and an appointment button",
          width: 1440,
          height: 900,
          illustrative: true,
        },
      },
      {
        slug: "ulasim-hizmeti-sitesi",
        title: "A booking focused site for a transport service",
        kind: "Client project, 2026",
        summary:
          "A site built for one purpose: getting the visitor to a booking. The service description stays short and the booking call is reachable from every point on the page. It was built mobile first, because nearly all of its traffic arrives by phone from social media.",
        stack: ["Next.js", "TypeScript", "Mobile first"],
        image: {
          src: "/media/work-transport.jpg",
          alt: "Home screen of the transport service site: full width coastal photograph with the headline and booking button over it",
          width: 1440,
          height: 900,
        },
      },
    ],
    architectureHeading: "Architecture",
    illustrativeNote: "representative visual",
    alsoHeading: "Projects where I worked on fundamentals",
    also: [
      {
        title: "React Movie Explorer",
        note: "Asynchronous data fetching against the TMDB REST API, URL based state management and dynamic pagination. React Router v6.",
        href: "https://github.com/enes-sahin-eng/react-movie-explorer",
      },
      {
        title: "WhereAmI-Earth",
        note: "An asynchronous app combining the Geolocation, OpenCage Geocode and REST Countries APIs to do reverse geocoding. Vanilla JavaScript.",
        href: "https://github.com/enes-sahin-eng/WhereAmI-Earth",
      },
      {
        title: "Staff Management System",
        note: "A console application written in C++ following object oriented programming principles. Role separation and record management.",
        href: "https://github.com/enes-sahin-eng/Employee-Management-System-C--Console-Application",
      },
    ],
  },
  experience: {
    heading: "Where I have worked",
    roles: [
      {
        period: "July 2026, ongoing",
        title: "Full Stack Developer Intern",
        org: "ideaZone Digital",
        place: "Avcılar, Istanbul",
        figures: [
          { value: "200+", label: "pages" },
          { value: "3", label: "languages" },
          { value: "4", label: "concurrent client projects" },
        ],
        points: [
          "Built a three language corporate site of more than 200 pages from scratch with Next.js App Router and TypeScript.",
          "Set up dynamic metadata, canonical, hreflang, sitemap and robots configuration, plus Course, FAQPage and BreadcrumbList JSON-LD schemas.",
          "Improved Lighthouse and Core Web Vitals metrics, image optimization and WCAG accessibility compliance.",
          "Reviewed inherited codebases and continued development from where they stopped, adapting quickly to a Laravel based project.",
          "Ran the deployment pipeline end to end: Hostinger VPS, CI/CD with Coolify, Cloudflare DNS, Vercel previews and cPanel.",
        ],
      },
      {
        period: "January 2022, ongoing",
        title: "E-commerce Operations Specialist and Web Developer",
        org: "Pnrcantaksesuar",
        place: "Freelance",
        points: [
          "Building the company's e-commerce backend from scratch with Node.js, Express, TypeScript, Prisma ORM and PostgreSQL.",
          "Designed the relational data model across product, category, order and user entities.",
          "Designed a custom middleware layer (isAuth, isRole) with JWT authentication, password hashing and role based access control.",
          "Developing a MongoDB based inventory management system to automate stock and category handling.",
          "Tested and maintained virtual POS and shipping API integrations.",
        ],
      },
    ],
    educationHeading: "Education",
    education: {
      period: "September 2022, ongoing",
      title: "B.Sc. in Software Engineering",
      org: "Istanbul Sabahattin Zaim University",
    },
  },
  skills: {
    heading: "What I reach for",
    groups: [
      {
        name: "Backend",
        items: ["Node.js", "Express.js", "RESTful API", "JWT", "RBAC", "Prisma ORM"],
      },
      {
        name: "Databases",
        items: ["PostgreSQL", "MongoDB", "Relational data modeling", "Query optimization"],
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
        name: "SEO and GEO",
        items: ["Dynamic metadata", "hreflang, canonical", "JSON-LD", "Core Web Vitals", "WCAG", "llms.txt"],
      },
    ],
    learningLabel: "Currently learning",
    learning: ["C#", ".NET Core"],
  },
  contact: {
    heading: "Let's talk",
    line: "I am looking for a team where I can go deeper on backend and data modeling inside a real product development process.",
    emailLabel: "Email",
    links: [
      { label: "LinkedIn", href: site.social.linkedin },
      { label: "GitHub", href: site.social.github },
    ],
    cvLabel: "Download CV",
    cvHref: site.cv.en,
    aside: "If you need a site for a small business, you can write as well.",
    asideLinkLabel: "WhatsApp",
  },
  ledger: {
    heading: "What you have read",
    note: "This summary fills in as you read. By the end it says the same thing as the downloadable CV.",
    entries: [
      { chapter: "about", line: "Final year Software Engineering student. Writing production code since 2022." },
      { chapter: "work", line: "The PNR e-commerce platform, a three language site for a school and three client projects." },
      { chapter: "experience", line: "Full stack intern at ideaZone Digital. E-commerce backend at Pnrcantaksesuar." },
      { chapter: "skills", line: "Node.js, PostgreSQL, TypeScript, Next.js. Learning C# and .NET Core." },
      { chapter: "contact", line: "Looking for a team to go deeper on backend and data modeling." },
    ],
  },
  footer: {
    rights: "Enes Şahin",
  },
  a11y: {
    skipToContent: "Skip to content",
    chapterNav: "Chapters",
  },
};
