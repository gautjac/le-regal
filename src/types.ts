import type { DomainId } from "./domains";

/** The structured régal returned by /api/regal. */
export interface Regal {
  domain: DomainId;
  /** The work / piece title (e.g. "Les Ménines", "Goldberg Variations, Aria"). */
  title: string;
  /** Author / composer / architect + year, accurately attributed. */
  attribution: string;
  /**
   * The thing itself, presented vividly & typographically — quote the line,
   * name the bars, describe the shot. 2–5 sentences, FR (or EN).
   */
  theThing: string;
  /** «Le pourquoi» — the tight ~60s of why it's exceptional. The signature. */
  pourquoi: string;
  /** «Le geste» — the one transferable move, named in a phrase. */
  geste: string;
  /**
   * Optional SEARCH STRING (keywords only — never a URL) that locates this
   * exact work on Wikipedia / YouTube, e.g. "Las Meninas Velázquez". Used by
   * the client to embed a real image or a real listening/viewing link. The
   * curator only ever emits keywords here — never an invented URL.
   */
  mediaQuery?: string;
}

/** A régal saved by the user into the cabinet. */
export interface SavedRegal extends Regal {
  /** stable id (domain + slug of title) */
  id: string;
  savedAt: number;
  /** optional private note from Jac */
  note?: string;
}

/** Seen-history entry — prevents repeats. */
export interface SeenEntry {
  /** id = normalized title key */
  id: string;
  domain: DomainId;
  title: string;
  attribution: string;
  seenAt: number;
}

export type Lang = "fr" | "en";

export interface Settings {
  id?: number;
  onboarded: boolean;
  lang: Lang;
  /** the day index for which we last served the daily régal */
  lastServedDay?: number;
}
