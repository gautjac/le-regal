// The ten domains of Le Régal — Jac's whole world, cycling through.
// Each domain carries an emblem, an accent colour token, and FR/EN labels.

import type { Lang } from "./types";

export type DomainId =
  | "peinture"
  | "musique"
  | "phrase"
  | "echecs"
  | "poesie"
  | "cinema"
  | "danse"
  | "architecture"
  | "science"
  | "cuisine";

export interface Domain {
  id: DomainId;
  /** FR label (Québécois) */
  fr: string;
  /** EN label */
  en: string;
  /** one-line FR descriptor of what a régal from this domain is */
  blurbFr: string;
  /** one-line EN descriptor of what a régal from this domain is */
  blurbEn: string;
  /** tailwind colour token suffix → domaine.<accent> */
  accent: string;
  /** a single glyph emblem */
  emblem: string;
}

export const DOMAINS: Domain[] = [
  {
    id: "peinture",
    fr: "Peinture",
    en: "Painting",
    blurbFr: "un détail d'un tableau",
    blurbEn: "a detail of a painting",
    accent: "peinture",
    emblem: "❖",
  },
  {
    id: "musique",
    fr: "Musique",
    en: "Music",
    blurbFr: "huit mesures de musique",
    blurbEn: "eight bars of music",
    accent: "musique",
    emblem: "♪",
  },
  {
    id: "phrase",
    fr: "La phrase",
    en: "The sentence",
    blurbFr: "une seule phrase parfaite",
    blurbEn: "one perfect sentence",
    accent: "phrase",
    emblem: "❝",
  },
  {
    id: "echecs",
    fr: "Échecs",
    en: "Chess",
    blurbFr: "un coup d'échecs",
    blurbEn: "a chess move",
    accent: "echecs",
    emblem: "♞",
  },
  {
    id: "poesie",
    fr: "Poésie",
    en: "Poetry",
    blurbFr: "un vers",
    blurbEn: "a single line of verse",
    accent: "poesie",
    emblem: "✶",
  },
  {
    id: "cinema",
    fr: "Cinéma",
    en: "Cinema",
    blurbFr: "un plan de film",
    blurbEn: "a single film shot",
    accent: "cinema",
    emblem: "◐",
  },
  {
    id: "danse",
    fr: "Danse",
    en: "Dance",
    blurbFr: "une phrase de danse",
    blurbEn: "a phrase of dance",
    accent: "danse",
    emblem: "❧",
  },
  {
    id: "architecture",
    fr: "Architecture",
    en: "Architecture",
    blurbFr: "un bâtiment",
    blurbEn: "a building, or one element of it",
    accent: "architecture",
    emblem: "⌂",
  },
  {
    id: "science",
    fr: "Science",
    en: "Science",
    blurbFr: "une idée scientifique",
    blurbEn: "an elegant scientific idea",
    accent: "science",
    emblem: "✷",
  },
  {
    id: "cuisine",
    fr: "Cuisine",
    en: "Cuisine",
    blurbFr: "un accord culinaire",
    blurbEn: "a culinary pairing",
    accent: "cuisine",
    emblem: "✿",
  },
];

export const DOMAIN_MAP: Record<DomainId, Domain> = Object.fromEntries(
  DOMAINS.map((d) => [d.id, d]),
) as Record<DomainId, Domain>;

export const DOMAIN_IDS: DomainId[] = DOMAINS.map((d) => d.id);

/** Localized domain name. Accepts a Domain or a DomainId. */
export function domainName(d: Domain | DomainId, lang: Lang): string {
  const dom = typeof d === "string" ? DOMAIN_MAP[d] : d;
  return lang === "fr" ? dom.fr : dom.en;
}

/** Localized one-line descriptor of what a régal from this domain is. */
export function domainBlurb(d: Domain | DomainId, lang: Lang): string {
  const dom = typeof d === "string" ? DOMAIN_MAP[d] : d;
  return lang === "fr" ? dom.blurbFr : dom.blurbEn;
}

/** Tailwind class fragments per domain accent (avoids dynamic class purging). */
export const ACCENT_CLASS: Record<
  DomainId,
  { text: string; bg: string; border: string; ring: string; hex: string }
> = {
  peinture: {
    text: "text-domaine-peinture",
    bg: "bg-domaine-peinture",
    border: "border-domaine-peinture",
    ring: "ring-domaine-peinture",
    hex: "#c2553f",
  },
  musique: {
    text: "text-domaine-musique",
    bg: "bg-domaine-musique",
    border: "border-domaine-musique",
    ring: "ring-domaine-musique",
    hex: "#7a8fc4",
  },
  phrase: {
    text: "text-domaine-phrase",
    bg: "bg-domaine-phrase",
    border: "border-domaine-phrase",
    ring: "ring-domaine-phrase",
    hex: "#cfa14d",
  },
  echecs: {
    text: "text-domaine-echecs",
    bg: "bg-domaine-echecs",
    border: "border-domaine-echecs",
    ring: "ring-domaine-echecs",
    hex: "#5e8d6e",
  },
  poesie: {
    text: "text-domaine-poesie",
    bg: "bg-domaine-poesie",
    border: "border-domaine-poesie",
    ring: "ring-domaine-poesie",
    hex: "#a86ca8",
  },
  cinema: {
    text: "text-domaine-cinema",
    bg: "bg-domaine-cinema",
    border: "border-domaine-cinema",
    ring: "ring-domaine-cinema",
    hex: "#5d7fa0",
  },
  danse: {
    text: "text-domaine-danse",
    bg: "bg-domaine-danse",
    border: "border-domaine-danse",
    ring: "ring-domaine-danse",
    hex: "#cf7f8e",
  },
  architecture: {
    text: "text-domaine-architecture",
    bg: "bg-domaine-architecture",
    border: "border-domaine-architecture",
    ring: "ring-domaine-architecture",
    hex: "#9a8a6a",
  },
  science: {
    text: "text-domaine-science",
    bg: "bg-domaine-science",
    border: "border-domaine-science",
    ring: "ring-domaine-science",
    hex: "#5fa0a4",
  },
  cuisine: {
    text: "text-domaine-cuisine",
    bg: "bg-domaine-cuisine",
    border: "border-domaine-cuisine",
    ring: "ring-domaine-cuisine",
    hex: "#c98a4a",
  },
};

/**
 * Deterministic rotation: which domain is "today's" default for a given
 * day index (days since epoch). The order is chosen so consecutive days feel
 * varied (art → music → words → game → ...).
 */
const ROTATION: DomainId[] = [
  "peinture",
  "musique",
  "phrase",
  "echecs",
  "poesie",
  "cinema",
  "danse",
  "architecture",
  "science",
  "cuisine",
];

export function domainForDay(dayIndex: number): DomainId {
  const i = ((dayIndex % ROTATION.length) + ROTATION.length) % ROTATION.length;
  return ROTATION[i];
}

export function todayDayIndex(): number {
  // local-day index
  const now = new Date();
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.floor(local.getTime() / 86_400_000);
}

export function todayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
