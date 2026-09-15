import Image from "next/image";
import { notFound } from "next/navigation";
import { isLocale, site, whatsappUrl } from "@/lib/site";
import { getContent } from "@/lib/content";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { WhatsAppButton, WhatsAppIcon } from "@/components/WhatsAppButton";
import { JourneyMount } from "@/components/world/JourneyMount";
import { CopyLayer } from "@/components/journey/CopyLayer";
import { ALSO_WINDOW, COPY_WINDOWS, WORK, projectWindow, type Window } from "@/lib/journey";

/** Ties an element to its window on the journey. Numbers come straight from journey.ts. */
const on = (window: Window) => ({ "data-from": window.from, "data-to": window.to });

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const c = getContent(locale);
  const [about, work, experience, skills, contact] = c.nav.chapters;

  const workIntroWindow: Window = { from: WORK.from + 0.004, to: projectWindow(0).from + 0.006 };

  const chapters = [
    { id: about.id, label: about.label, at: COPY_WINDOWS.about.from + 0.02 },
    { id: work.id, label: work.label, at: projectWindow(0).from + 0.012 },
    { id: experience.id, label: experience.label, at: COPY_WINDOWS.experience.from + 0.02 },
    { id: skills.id, label: skills.label, at: COPY_WINDOWS.skills.from + 0.02 },
    { id: contact.id, label: contact.label, at: 1 },
  ];

  return (
    <>
      <a
        href={`#${about.id}`}
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-3 focus:py-2"
        style={{ background: "var(--c-ink)", color: "var(--c-canvas)" }}
      >
        {c.a11y.skipToContent}
      </a>

      <JourneyMount
        projects={c.work.projects.map((project) =>
          project.image
            ? { src: project.image.src }
            : { headline: project.visual?.headline, caption: project.visual?.caption },
        )}
        skillCounts={[...c.skills.groups.map((group) => group.items.length), c.skills.learning.length]}
      />

      <CopyLayer name={site.person.name} chapters={chapters} navLabel={c.a11y.chapterNav} />

      <header className="fixed top-0 right-0 z-30 p-[max(0.75rem,calc(var(--gutter)/3))]">
        <LanguageSwitch locale={locale} label={c.nav.languageLabel} />
      </header>

      <WhatsAppButton label={c.contact.whatsapp.label} message={c.contact.whatsapp.message} />

      {/* The page is one journey. In immersive mode every panel below is a
          card scrolling over the 3D scene, tied to its window on the journey.
          Without WebGL, or with reduced motion, the same markup reads as an
          ordinary document. */}
      <main className="above-scene">
        <section className="chapter" aria-labelledby="intro-title">
          <div
            id="top"
            className="panel panel--intro"
            data-side="left"
            {...on(COPY_WINDOWS.intro)}
          >
            <div className="portrait-fallback doc-only mb-10 w-[min(60vw,15rem)]">
              <Image
                src="/media/portrait.png"
                alt={c.hero.portraitAlt}
                width={288}
                height={357}
                loading="eager"
                sizes="(max-width: 768px) 60vw, 240px"
                className="h-auto w-full"
              />
            </div>
            <div className="intro-copy">
              <h1 id="intro-title" className="display m-0 text-[clamp(3rem,8.5vw,7.25rem)] md:max-w-[6.5ch]">
                {c.hero.name}
              </h1>
              <p className="mt-5 mb-0 text-[clamp(1.05rem,2vw,1.4rem)]">{c.hero.role}</p>
              <p className="intro-soft mt-8 mb-0 max-w-[40ch] text-[1.0625rem]">{c.hero.line}</p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <a
                  href={c.hero.primary.href}
                  download
                  className="inline-flex items-center px-5 py-3 text-[0.95rem] no-underline transition-transform duration-150 active:translate-y-px"
                  style={{ background: "var(--c-accent)", color: "var(--c-accent-ink)" }}
                >
                  {c.hero.primary.label}
                </a>
                <a href={`#${contact.id}`} className="text-[0.95rem] underline">
                  {c.hero.secondary.label}
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id={about.id} className="chapter" aria-labelledby={`${about.id}-title`}>
          <div className="panel" data-side="left" data-gap="flight" {...on(COPY_WINDOWS.about)}>
            <div className="panel-surface">
              <div>
                <h2 id={`${about.id}-title`} className="display m-0 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {c.about.heading}
                </h2>
                <div className="mt-6 flex flex-col gap-4">
                  {c.about.paragraphs.map((paragraph, index) => (
                    <p
                      key={paragraph}
                      className="m-0 text-[1.02rem]"
                      style={{ color: index === 0 ? "var(--c-ink)" : "var(--c-ink-soft)" }}
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id={work.id} className="chapter" aria-labelledby={`${work.id}-title`}>
          <div className="panel" data-side="left" {...on(workIntroWindow)}>
            <div className="panel-surface panel-surface--slim">
              <div>
                <h2 id={`${work.id}-title`} className="display m-0 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {c.work.heading}
                </h2>
                <p className="mt-4 mb-0 text-[0.95rem]" style={{ color: "var(--c-ink-soft)" }}>
                  {c.work.intro}
                </p>
              </div>
            </div>
          </div>

          {c.work.projects.map((project, index) => (
            <article
              key={project.slug}
              className="panel"
              data-side={index % 2 === 0 ? "left" : "right"}
              {...on(projectWindow(index))}
            >
              <div className="panel-surface">
                <div>
                  {project.image && (
                    <div className="doc-only mb-6">
                      <Image
                        src={project.image.src}
                        alt={project.image.alt}
                        width={project.image.width}
                        height={project.image.height}
                        sizes="(max-width: 768px) 92vw, 46vw"
                        className="h-auto w-full border"
                        style={{ borderColor: "var(--c-line)" }}
                      />
                    </div>
                  )}
                  <p className="m-0 text-[0.82rem]" style={{ color: "var(--c-ink-soft)" }}>
                    {project.image?.illustrative ? `${project.kind}, ${c.work.illustrativeNote}` : project.kind}
                  </p>
                  <h3 className="display mt-3 mb-0 text-[clamp(1.35rem,2.3vw,1.85rem)]">{project.title}</h3>
                  <p className="mt-4 mb-0 text-[1rem]" style={{ color: "var(--c-ink-soft)" }}>
                    {project.summary}
                  </p>
                  {project.architecture && (
                    <div className="mt-6">
                      <h4 className="m-0 text-[0.82rem]" style={{ color: "var(--c-ink-soft)" }}>
                        {c.work.architectureHeading}
                      </h4>
                      <ul className="m-0 mt-3 flex list-none flex-col gap-3 p-0">
                        {project.architecture.map((item) => (
                          <li
                            key={item}
                            className="border-l pl-4 text-[0.94rem]"
                            style={{ borderColor: "var(--c-accent)", color: "var(--c-ink-soft)" }}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {project.decisions && (
                    <div className="mt-6 flex flex-col gap-5">
                      {project.decisions.map((decision) => (
                        <div key={decision.question} className="border-l pl-4" style={{ borderColor: "var(--c-accent)" }}>
                          <h4 className="m-0 text-[0.92rem] font-semibold">{decision.question}</h4>
                          <p className="mt-2 mb-0 text-[0.94rem]" style={{ color: "var(--c-ink-soft)" }}>
                            {decision.answer}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-5 mb-0 text-[0.8rem]" style={{ color: "var(--c-ink-soft)" }}>
                    {project.stack.join(", ")}
                  </p>
                </div>
              </div>
            </article>
          ))}

          <div className="panel" data-side="left" data-gap="short" {...on(ALSO_WINDOW)}>
            <div className="panel-surface">
              <div>
                <h3 className="m-0 text-[0.9rem] font-semibold">{c.work.alsoHeading}</h3>
                <ul className="m-0 mt-5 flex list-none flex-col gap-5 p-0">
                  {c.work.also.map((item) => (
                    <li key={item.title}>
                      <a href={item.href} target="_blank" rel="noreferrer" className="text-[0.98rem] font-semibold underline">
                        {item.title}
                      </a>
                      <p className="mt-1.5 mb-0 text-[0.86rem]" style={{ color: "var(--c-ink-soft)" }}>
                        {item.note}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section id={experience.id} className="chapter" aria-labelledby={`${experience.id}-title`}>
          <div className="panel" data-side="left" {...on(COPY_WINDOWS.experience)}>
            <div className="panel-surface">
              <div>
                <h2 id={`${experience.id}-title`} className="display m-0 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {c.experience.heading}
                </h2>
                <div className="mt-7 flex flex-col gap-9">
                  {c.experience.roles.map((role) => (
                    <div key={role.org}>
                      <p className="tabular m-0 text-[0.82rem]" style={{ color: "var(--c-ink-soft)" }}>
                        {role.period}
                      </p>
                      <h3 className="mt-1.5 mb-0 text-[1.02rem] font-semibold">{role.title}</h3>
                      <p className="m-0 text-[0.92rem]" style={{ color: "var(--c-ink-soft)" }}>
                        {role.org}, {role.place}
                      </p>
                      {role.figures && (
                        <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
                          {role.figures.map((figure) => (
                            <div key={figure.label}>
                              <p className="display tabular m-0 text-[clamp(1.6rem,2.8vw,2.2rem)]">{figure.value}</p>
                              <p className="m-0 text-[0.78rem]" style={{ color: "var(--c-ink-soft)" }}>
                                {figure.label}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                      <ul className="m-0 mt-4 flex list-none flex-col gap-2.5 p-0">
                        {role.points.map((point) => (
                          <li key={point} className="text-[0.95rem]" style={{ color: "var(--c-ink-soft)" }}>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  <div className="border-t pt-5" style={{ borderColor: "var(--c-line)" }}>
                    <h3 className="m-0 text-[0.82rem]" style={{ color: "var(--c-ink-soft)" }}>
                      {c.experience.educationHeading}
                    </h3>
                    <p className="tabular mt-2 mb-0 text-[0.82rem]" style={{ color: "var(--c-ink-soft)" }}>
                      {c.experience.education.period}
                    </p>
                    <p className="m-0 text-[0.95rem]">
                      {c.experience.education.title}, {c.experience.education.org}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id={skills.id} className="chapter" aria-labelledby={`${skills.id}-title`}>
          <div className="panel" data-side="left" {...on(COPY_WINDOWS.skills)}>
            <div className="panel-surface">
              <div>
                <h2 id={`${skills.id}-title`} className="display m-0 text-[clamp(1.8rem,3.2vw,2.6rem)]">
                  {c.skills.heading}
                </h2>
                <dl className="m-0 mt-6 grid grid-cols-1 gap-y-4">
                  {c.skills.groups.map((group) => (
                    <div key={group.name} className="border-t pt-3" style={{ borderColor: "var(--c-line)" }}>
                      <dt className="text-[0.8rem]" style={{ color: "var(--c-ink-soft)" }}>
                        {group.name}
                      </dt>
                      <dd className="m-0 mt-1 text-[0.95rem]">{group.items.join(", ")}</dd>
                    </div>
                  ))}
                  <div className="border-t pt-3" style={{ borderColor: "var(--c-accent)" }}>
                    <dt className="text-[0.8rem]" style={{ color: "var(--c-accent)" }}>
                      {c.skills.learningLabel}
                    </dt>
                    <dd className="m-0 mt-1 text-[0.95rem]">{c.skills.learning.join(", ")}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        <section id={contact.id} className="chapter" aria-labelledby={`${contact.id}-title`}>
          <div className="panel" data-side="right" data-gap="exit" {...on(COPY_WINDOWS.contact)}>
            <div className="panel-surface">
              <div>
                <h2 id={`${contact.id}-title`} className="display m-0 text-[clamp(2.2rem,4.4vw,3.4rem)]">
                  {c.contact.heading}
                </h2>
                <p className="mt-5 mb-0 text-[0.98rem]" style={{ color: "var(--c-ink-soft)" }}>
                  {c.contact.line}
                </p>
                <div className="mt-7 flex flex-col gap-3">
                  <a href={`mailto:${site.person.email}`} className="text-[1.02rem] underline">
                    {site.person.email}
                  </a>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    {c.contact.links.map((link) => (
                      <a key={link.label} href={link.href} target="_blank" rel="me noreferrer" className="text-[0.95rem] underline">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <a
                    href={c.contact.cvHref}
                    download
                    className="inline-flex items-center px-5 py-3 text-[0.95rem] no-underline transition-transform duration-150 active:translate-y-px"
                    style={{ background: "var(--c-accent)", color: "var(--c-accent-ink)" }}
                  >
                    {c.contact.cvLabel}
                  </a>
                  <a
                    href={whatsappUrl(c.contact.whatsapp.message)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-button"
                  >
                    <WhatsAppIcon className="wa-icon" />
                    {c.contact.whatsapp.label}
                  </a>
                </div>
                <p className="mt-4 mb-0 text-[0.84rem]" style={{ color: "var(--c-ink-soft)" }}>
                  {c.contact.aside}
                </p>
                <p className="mt-6 mb-0 flex justify-between border-t pt-4 text-[0.78rem]" style={{ borderColor: "var(--c-line)", color: "var(--c-ink-soft)" }}>
                  <span>{c.footer.rights}</span>
                  <span className="tabular">{new Date().getFullYear()}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
