"use client";

import { useEffect, useRef, useState } from "react";

type Chapter = { id: string; label: string };
type Entry = { chapter: string; line: string };

/**
 * The signature move: the rail is navigation and a record at the same time.
 * Every chapter the reader passes deposits its line here, so by the contact
 * chapter the margin holds a written summary of what was just read.
 */
export function LedgerRail({
  chapters,
  entries,
  heading,
  navLabel,
}: {
  chapters: Chapter[];
  entries: Entry[];
  heading: string;
  navLabel: string;
}) {
  const [active, setActive] = useState<string | null>(null);
  const [collected, setCollected] = useState<string[]>([]);
  const collectedRef = useRef<string[]>([]);

  useEffect(() => {
    const sections = chapters
      .map((chapter) => document.getElementById(chapter.id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (records) => {
        for (const record of records) {
          if (!record.isIntersecting) continue;
          const id = record.target.id;
          setActive(id);
          if (!collectedRef.current.includes(id)) {
            collectedRef.current = [...collectedRef.current, id];
            setCollected(collectedRef.current);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [chapters]);

  const lines = collected
    .map((id) => entries.find((entry) => entry.chapter === id))
    .filter((entry): entry is Entry => Boolean(entry));

  // At the last chapter the record is handed to the assembled document in the
  // page, so the margin lets it go rather than showing the same thing twice.
  const handedOver = active === chapters[chapters.length - 1]?.id;

  return (
    <nav
      aria-label={navLabel}
      className="pointer-events-none fixed top-0 left-0 z-20 hidden h-dvh w-[16rem] flex-col justify-center pl-[var(--gutter)] lg:flex xl:w-[18rem]"
    >
      <ol className="pointer-events-auto m-0 flex list-none flex-col gap-1 p-0">
        {chapters.map((chapter) => {
          const isActive = active === chapter.id;
          return (
            <li key={chapter.id}>
              <a
                href={`#${chapter.id}`}
                aria-current={isActive ? "true" : undefined}
                className="inline-flex items-baseline gap-2 py-0.5 text-[0.9rem] no-underline transition-colors duration-150"
                style={{ color: isActive ? "var(--c-ink)" : "var(--c-ink-soft)" }}
              >
                <span
                  aria-hidden="true"
                  className="inline-block h-px transition-all duration-300"
                  style={{
                    width: isActive ? "1.75rem" : "0.75rem",
                    background: isActive ? "var(--c-accent)" : "var(--c-line-strong)",
                    transitionTimingFunction: "var(--ease-out)",
                  }}
                />
                {chapter.label}
              </a>
            </li>
          );
        })}
      </ol>

      {lines.length > 0 && (
        <div
          aria-hidden={handedOver}
          className="pointer-events-auto mt-8 border-t pt-4 transition-all duration-500"
          style={{
            borderColor: "var(--c-line)",
            opacity: handedOver ? 0 : 1,
            transform: handedOver ? "translateY(0.75rem)" : "none",
            transitionTimingFunction: "var(--ease-out)",
          }}
        >
          <p className="m-0 text-[0.78rem]" style={{ color: "var(--c-ink-soft)" }}>
            {heading}
          </p>
          <ul className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
            {lines.map((entry) => (
              <li
                key={entry.chapter}
                className="ledger-line text-[0.78rem] leading-snug"
                style={{ color: "var(--c-ink-soft)" }}
              >
                {entry.line}
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}
