export type Cta = { label: string; href: string };

export type ProjectCopy = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  /** Only written where the reasoning is genuinely known. Never invented. */
  decisions?: { question: string; answer: string }[];
  stack: string[];
  links?: { label: string; href: string }[];
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** A representative visual, not a screenshot of the delivered site. */
    illustrative?: boolean;
  };
  /** How the system is put together. Used where client names and screens stay private. */
  architecture?: string[];
  /** For work with no screenshot: a typographic panel in the 3D world. */
  visual?: { headline: string; caption: string };
};

export type Role = {
  period: string;
  title: string;
  org: string;
  place: string;
  points: string[];
  figures?: { value: string; label: string }[];
};

export type SkillGroup = { name: string; items: string[] };

export type Content = {
  meta: {
    title: string;
    titleTemplate: string;
    description: string;
    keywordsNote: string;
  };
  nav: { chapters: { id: string; label: string }[]; languageLabel: string };
  hero: {
    name: string;
    role: string;
    line: string;
    primary: Cta;
    secondary: Cta;
    portraitAlt: string;
  };
  about: { heading: string; paragraphs: string[] };
  work: {
    heading: string;
    intro: string;
    projects: ProjectCopy[];
    architectureHeading: string;
    illustrativeNote: string;
    alsoHeading: string;
    also: { title: string; note: string; href?: string }[];
  };
  experience: { heading: string; roles: Role[]; educationHeading: string; education: { period: string; title: string; org: string } };
  skills: { heading: string; groups: SkillGroup[]; learningLabel: string; learning: string[] };
  contact: {
    heading: string;
    line: string;
    emailLabel: string;
    links: { label: string; href: string }[];
    cvLabel: string;
    cvHref: string;
    aside: string;
    whatsapp: { label: string; message: string };
  };
  ledger: { heading: string; note: string; entries: { chapter: string; line: string }[] };
  footer: { rights: string };
  a11y: { skipToContent: string; chapterNav: string };
};
