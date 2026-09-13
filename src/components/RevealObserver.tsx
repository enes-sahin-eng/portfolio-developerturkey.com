"use client";

import { useEffect } from "react";

/** Mounted per page, so switching locale re-scans the new page's hosts. */
export function RevealObserver() {
  useEffect(() => {
    const hosts = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal-host]:not(.is-in)"),
    );
    if (!hosts.length) return;

    if (!("IntersectionObserver" in window)) {
      hosts.forEach((host) => host.classList.add("is-in"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0 },
    );

    hosts.forEach((host) => observer.observe(host));
    return () => observer.disconnect();
  }, []);

  return null;
}
