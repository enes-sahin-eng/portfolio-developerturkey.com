import type { CSSProperties, ReactNode } from "react";

/**
 * Server-rendered reveal markup. Nothing here is hidden in the HTML: the hidden
 * start state only applies under `.js`, which a head script sets before first
 * paint, and `RevealObserver` releases it. No JavaScript means visible content.
 *
 * The observer watches the host, which is never clipped or transparent, so it
 * cannot deadlock the way watching the animated element itself does.
 */
export function Reveal({
  children,
  kind,
  delay = 0,
}: {
  children: ReactNode;
  kind: "line" | "wipe";
  delay?: number;
}) {
  const style = delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined;

  if (kind === "line") {
    return (
      <span data-reveal-host="" className="reveal-mask block">
        <span data-reveal="line" className="block" style={style}>
          {children}
        </span>
      </span>
    );
  }

  return (
    <div data-reveal-host="">
      <div data-reveal="wipe" style={style}>
        {children}
      </div>
    </div>
  );
}
