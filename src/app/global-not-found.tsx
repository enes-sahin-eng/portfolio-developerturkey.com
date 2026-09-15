import type { Metadata } from "next";
import Link from "next/link";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});

export const metadata: Metadata = {
  title: "Sayfa bulunamadı | Developer Turkey",
  description: "Aradığınız sayfa bulunamadı. The page you are looking for does not exist.",
};

/**
 * Unmatched addresses. The root layout sits under the dynamic locale segment,
 * so a segment level not-found file never receives them. This page stands on
 * its own and speaks both languages instead of guessing one.
 */
export default function GlobalNotFound() {
  return (
    <html lang="tr" className={archivo.variable}>
      <body>
        <main className="flex min-h-svh flex-col justify-center gap-16 px-[var(--gutter)] py-24">
          <section>
            <p className="tabular m-0 text-[0.85rem]" style={{ color: "var(--c-ink-soft)" }}>
              404
            </p>
            <h1 className="display mt-4 mb-0 text-[clamp(2.4rem,7vw,5rem)]">Bu sayfa yok</h1>
            <p className="mt-6 mb-0 max-w-[40ch] text-[1.05rem]" style={{ color: "var(--c-ink-soft)" }}>
              Aradığınız adres taşınmış ya da hiç var olmamış olabilir.
            </p>
            <Link
              href="/tr"
              className="mt-8 inline-flex items-center px-5 py-3 text-[0.95rem] no-underline"
              style={{ background: "var(--c-accent)", color: "var(--c-accent-ink)" }}
            >
              Ana sayfaya dön
            </Link>
          </section>

          <section lang="en" className="border-t pt-8" style={{ borderColor: "var(--c-line)" }}>
            <h2 className="display m-0 text-[clamp(1.6rem,4vw,2.4rem)]">This page does not exist</h2>
            <p className="mt-4 mb-0 max-w-[40ch] text-[1rem]" style={{ color: "var(--c-ink-soft)" }}>
              The address may have moved, or it may never have existed.
            </p>
            <Link href="/en" className="mt-5 inline-block text-[0.95rem] underline">
              Back to the English site
            </Link>
          </section>
        </main>
      </body>
    </html>
  );
}
