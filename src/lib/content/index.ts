import type { Locale } from "@/lib/site";
import type { Content } from "./types";
import { tr } from "./tr";
import { en } from "./en";

const dictionaries: Record<Locale, Content> = { tr, en };

export function getContent(locale: Locale): Content {
  return dictionaries[locale];
}

export type { Content };
