"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { CROSSINGS, flashAt, smooth } from "@/lib/journey";
import { journeyProgress } from "@/lib/journeyProgress";

type Chapter = { id: string; label: string; at: number };
type Card = { element: HTMLElement; from: number; to: number; top: number; bottom: number };
/** A scroll position paired with the journey progress it maps to. */
type Key = [scrollY: number, progress: number];

type LenisLike = { scrollTo: (target: number, options?: { duration?: number }) => void };

function scrollToY(top: number) {
  const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(Math.max(0, top), { duration: 1.6 });
  else window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
}

/** Offset from the top of the document, unaffected by the fade's transform. */
function documentTop(element: HTMLElement) {
  let top = 0;
  for (let node: HTMLElement | null = element; node; node = node.offsetParent as HTMLElement | null) {
    top += node.offsetTop;
  }
  return top;
}

/**
 * Cards scroll with the document, so journey progress comes from where they
 * actually sit. A card reaches the start of its window when its top is 60%
 * down the screen and the end when its bottom is 40% down: the camera settles
 * on a subject as a card arrives and moves on as it leaves. The space between
 * cards carries the flights.
 */
function measure(cards: Card[]): Key[] {
  const viewport = window.innerHeight;
  const end = Math.max(1, document.documentElement.scrollHeight - viewport);
  const keys: Key[] = [[0, 0]];

  cards.forEach((card, index) => {
    card.top = documentTop(card.element);
    card.bottom = card.top + card.element.offsetHeight;
    if (card.from > 0) keys.push([card.top - viewport * 0.6, card.from]);
    // The last card holds until the end of the page instead of leaving.
    if (index < cards.length - 1) keys.push([card.bottom - viewport * 0.4, Math.min(1, card.to)]);
  });
  keys.push([end, 1]);

  // Windows that touch at their edges must never run the camera backwards.
  for (let i = 1; i < keys.length; i++) {
    keys[i][0] = Math.max(keys[i][0], keys[i - 1][0] + 1);
    keys[i][1] = Math.max(keys[i][1], keys[i - 1][1]);
  }
  return keys;
}

function progressAt(keys: Key[], scrolled: number) {
  if (!keys.length || scrolled <= keys[0][0]) return keys[0]?.[1] ?? 0;
  for (let i = 1; i < keys.length; i++) {
    const [y1, p1] = keys[i];
    if (scrolled <= y1) {
      const [y0, p0] = keys[i - 1];
      return p0 + (p1 - p0) * ((scrolled - y0) / (y1 - y0));
    }
  }
  return keys[keys.length - 1][1];
}

/**
 * Drives the HTML half of the journey and writes the progress the camera
 * reads. Copy is never pinned: every card is ordinary text that scrolls at the
 * reader's own speed, fading in as it rises and out as it leaves the top.
 * Also the flash that hides each cut through the screen, and the chapter HUD.
 * Styles are written directly, so nothing re-renders per frame.
 */
export function CopyLayer({ name, chapters, navLabel }: { name: string; chapters: Chapter[]; navLabel: string }) {
  const flash = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(-1);
  const [active, setActive] = useState(-1);
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const root = document.documentElement;
    if (!root.classList.contains("immersive")) return;

    const cards: Card[] = Array.from(document.querySelectorAll<HTMLElement>("[data-from]")).map((element) => ({
      element,
      from: Number(element.dataset.from),
      to: Number(element.dataset.to),
      top: 0,
      bottom: 0,
    }));
    let keys: Key[] = [];

    const render = () => {
      const scrolled = window.scrollY;
      const viewport = window.innerHeight;
      const p = progressAt(keys, scrolled);
      journeyProgress.set(p);

      for (const card of cards) {
        const rise = smooth(viewport, viewport * 0.78, card.top - scrolled);
        const leave = smooth(0, viewport * 0.16, card.bottom - scrolled);
        card.element.style.setProperty("--v", Math.min(rise, leave).toFixed(3));
      }

      if (flash.current) flash.current.style.opacity = flashAt(p).toFixed(3);
      root.dataset.tone = p < CROSSINGS.enter ? "dark" : "light";
      if (bar.current) bar.current.style.transform = `scaleX(${p.toFixed(4)})`;

      let current = -1;
      chapters.forEach((chapter, index) => {
        if (p >= chapter.at - 0.03) current = index;
      });
      if (current !== activeRef.current) {
        activeRef.current = current;
        setActive(current);
      }
    };

    const remeasure = () => {
      keys = measure(cards);
      render();
    };

    remeasure();
    const unsubscribe = scrollYProgress.on("change", render);
    // Fonts and images settle after first paint and move every card below them.
    const resizeObserver = new ResizeObserver(remeasure);
    const main = document.querySelector("main");
    if (main) resizeObserver.observe(main);
    window.addEventListener("resize", remeasure);

    // In-page links go to the card itself, just under the HUD.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href")!.slice(1);
      if (id === "top") {
        event.preventDefault();
        scrollToY(0);
        return;
      }
      const target = document.getElementById(id);
      if (!target) return;
      const card = target.matches("[data-from]") ? target : (target.querySelector<HTMLElement>("[data-from]") ?? target);
      event.preventDefault();
      scrollToY(documentTop(card) - 88);
    };
    document.addEventListener("click", onClick);

    return () => {
      unsubscribe();
      resizeObserver.disconnect();
      window.removeEventListener("resize", remeasure);
      document.removeEventListener("click", onClick);
    };
  }, [chapters, scrollYProgress]);

  return (
    <>
      <div ref={flash} className="journey-flash" aria-hidden="true" />
      <nav className="journey-hud" aria-label={navLabel}>
        <a href="#top" className="journey-mark">
          {name}
        </a>
        <ol className="journey-chapters">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} aria-current={active === index ? "true" : undefined}>
                {chapter.label}
              </a>
            </li>
          ))}
        </ol>
        <span className="journey-progress" aria-hidden="true">
          <span ref={bar} />
        </span>
      </nav>
    </>
  );
}
