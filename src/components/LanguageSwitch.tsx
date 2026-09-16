import Link from "next/link";
import { locales, localePath, type Locale } from "@/lib/site";

const labels: Record<Locale, string> = { tr: "TR", en: "EN" };

export function LanguageSwitch({
  locale,
  label,
  hrefs,
}: {
  locale: Locale;
  label: string;
  /** Where each language lives for this page. Defaults to each language's home page. */
  hrefs?: Partial<Record<Locale, string>>;
}) {
  return (
    <div
      className="flex items-center gap-px border"
      style={{ borderColor: "var(--c-line-strong)", background: "var(--c-canvas)" }}
      role="group"
      aria-label={label}
    >
      {locales.map((value) => {
        const current = value === locale;
        return (
          <Link
            key={value}
            href={hrefs?.[value] ?? localePath(value)}
            hrefLang={value}
            aria-current={current ? "true" : undefined}
            className="px-2.5 py-1 text-[0.75rem] tracking-[0.08em] no-underline transition-colors duration-150"
            style={{
              background: current ? "var(--c-ink)" : "transparent",
              color: current ? "var(--c-canvas)" : "var(--c-ink-soft)",
            }}
          >
            {labels[value]}
          </Link>
        );
      })}
    </div>
  );
}
