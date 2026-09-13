"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll } from "motion/react";
import { CROSSINGS, flashAt, smooth } from "@/lib/journey";

type Chapter = { id: string; label: string; at: number };
type Panel = {
  element: HTMLElement;
  from: number;
  to: number;
  clip: HTMLElement | null;
  scroller: HTMLElement | null;
};

/** Width of the fade at each edge of a copy window, in journey progress. */
const FADE = 0.012;

type LenisLike = { scrollTo: (target: number, options?: { duration?: number }) => void };

function scrollToProgress(progress: number) {
  const root = document.documentElement;
  const top = Math.max(0, Math.min(1, progress)) * (root.scrollHeight - window.innerHeight);
  const lenis = (window as Window & { __lenis?: LenisLike }).__lenis;
  if (lenis) lenis.scrollTo(top, { duration: 2.2 });
  else window.scrollTo({ top, behavior: "smooth" });
}

/**
 * Drives the HTML half of the journey from the same progress the camera uses:
 * which panel is on screen, long panels scrolling inside themselves, the flash
 * that hides each cut through the screen, and the chapter HUD. Styles are
 * written directly, so nothing re-renders per frame.
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

    const panels: Panel[] = Array.from(document.querySelectorAll<HTMLElement>("[data-from]")).map((element) => ({
      element,
      from: Number(element.dataset.from),
      to: Number(element.dataset.to),
      clip: element.querySelector<HTMLElement>("[data-panel-clip]"),
      scroller: element.querySelector<HTMLElement>("[data-panel-scroll]"),
    }));

    const render = (p: number) => {
      for (const panel of panels) {
        const enter = panel.from <= 0 ? 1 : smooth(panel.from, panel.from + FADE, p);
        const leave = 1 - smooth(panel.to - FADE, panel.to, p);
        const v = Math.min(enter, leave);
        panel.element.style.setProperty("--v", v.toFixed(4));
        panel.element.style.visibility = v <= 0.001 ? "hidden" : "visible";
        panel.element.style.pointerEvents = v > 0.6 ? "auto" : "none";

        // Copy longer than the panel scrolls inside it across the window's hold.
        if (panel.clip && panel.scroller) {
          const span = panel.to - panel.from - FADE * 3;
          const local = span > 0 ? Math.min(1, Math.max(0, (p - panel.from - FADE * 1.5) / span)) : 0;
          const overflow = Math.max(0, panel.scroller.scrollHeight - panel.clip.clientHeight + 8);
          panel.scroller.style.transform = `translate3d(0, ${(-local * overflow).toFixed(1)}px, 0)`;
        }
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

    render(scrollYProgress.get());
    const unsubscribe = scrollYProgress.on("change", render);

    // Pinned panels have no scroll offset of their own, so in-page links jump
    // along the journey instead of to the element.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;
      const jump = link.dataset.jump;
      const id = link.getAttribute("href")!.slice(1);
      const chapter = chapters.find((item) => item.id === id);
      const target = jump !== undefined ? Number(jump) : id === "top" ? 0 : chapter?.at;
      if (target === undefined) return;
      event.preventDefault();
      scrollToProgress(target);
    };
    document.addEventListener("click", onClick);

    return () => {
      unsubscribe();
      document.removeEventListener("click", onClick);
    };
  }, [chapters, scrollYProgress]);

  return (
    <>
      <div ref={flash} className="journey-flash" aria-hidden="true" />
      <nav className="journey-hud" aria-label={navLabel}>
        <a href="#top" data-jump="0" className="journey-mark">
          {name}
        </a>
        <ol className="journey-chapters">
          {chapters.map((chapter, index) => (
            <li key={chapter.id}>
              <a href={`#${chapter.id}`} data-jump={chapter.at} aria-current={active === index ? "true" : undefined}>
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
