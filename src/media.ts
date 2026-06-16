// Media resolution for Le Régal.
//
// The curator NEVER emits URLs (it would hallucinate dead/wrong ones, which
// would betray the app's honesty rule). Instead it gives a short `mediaQuery`
// — keywords only. Here, on the client, we turn that into REAL media by hitting
// trusted, deterministic services:
//
//   • visual domains (peinture, architecture, cinéma) → the actual work image,
//     fetched from Wikipedia's CORS-enabled API and embedded.
//   • audio (musique) / motion (danse) → a guaranteed-valid YouTube search link.
//
// Wikipedia source links are added whenever a matching article resolves. If no
// image is found we always still hand back a working link, so the promise
// "embed OR link" never breaks.

import type { DomainId } from "./domains";
import type { Lang, Regal } from "./types";

/** What kind of media a domain wants alongside the words. */
export type MediaIntent = "image" | "listen" | "watch" | "none";

const DOMAIN_INTENT: Record<DomainId, MediaIntent> = {
  peinture: "image",
  architecture: "image",
  cinema: "image",
  musique: "listen",
  danse: "watch",
  phrase: "none",
  poesie: "none",
  echecs: "none",
  science: "none",
  cuisine: "none",
};

/** A small hint word appended to auto-built queries to bias the search. */
const QUERY_HINT: Partial<Record<DomainId, string>> = {
  peinture: "painting",
  architecture: "building architecture",
  cinema: "film",
};

export function mediaIntent(domain: DomainId): MediaIntent {
  return DOMAIN_INTENT[domain];
}

/** A resolved image from Wikipedia/Commons. */
export interface WikiImage {
  src: string;
  width?: number;
  height?: number;
}

/** Outcome of resolving a Wikipedia article. */
export interface WikiHit {
  image?: WikiImage;
  pageUrl?: string;
}

/** The deterministic, synchronous part of a régal's media plan. */
export interface MediaPlan {
  intent: MediaIntent;
  /** the search string we feed to Wikipedia / YouTube */
  query: string;
  /** YouTube results page (listen/watch) — always valid */
  youtubeUrl?: string;
  /** Google Images search — the always-valid image fallback */
  imagesUrl?: string;
}

// ---- query building -------------------------------------------------------

/** Strip the attribution down to the creator's name (drop year / work refs). */
function creatorName(attribution: string): string {
  return attribution
    .split(/[,—–(]/)[0] // first clause, before comma / dash / paren
    .replace(/\d+/g, "") // no stray years
    .trim();
}

/** Build the best search string we can for a régal. */
export function buildQuery(regal: Regal): string {
  const explicit = (regal.mediaQuery ?? "").trim();
  if (explicit) return explicit;
  const parts = [regal.title, creatorName(regal.attribution)].filter(Boolean);
  const hint = QUERY_HINT[regal.domain];
  if (hint) parts.push(hint);
  return parts.join(" ").trim();
}

// ---- the sync plan --------------------------------------------------------

export function mediaPlan(regal: Regal): MediaPlan {
  const intent = mediaIntent(regal.domain);
  const query = buildQuery(regal);
  // No intent, or nothing to search with → nothing to show.
  if (intent === "none" || !query) {
    return { intent: "none", query };
  }
  const enc = encodeURIComponent(query);
  const plan: MediaPlan = { intent, query };
  if (intent === "listen" || intent === "watch") {
    plan.youtubeUrl = `https://www.youtube.com/results?search_query=${enc}`;
  }
  if (intent === "image") {
    plan.imagesUrl = `https://www.google.com/search?tbm=isch&q=${enc}`;
  }
  return plan;
}

// ---- Wikipedia resolution -------------------------------------------------

const WIKI_CACHE = new Map<string, Promise<WikiHit | null>>();

function pageUrlFor(lang: string, title: string): string {
  return `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(
    title.replace(/ /g, "_"),
  )}`;
}

/**
 * One round-trip per wiki: search for the best article and pull its lead image
 * (a generous 1200px thumbnail — paintings deserve the detail) in a single
 * generator query. CORS-enabled via `origin=*`.
 */
async function queryWiki(query: string, lang: string): Promise<WikiHit | null> {
  const params = new URLSearchParams({
    action: "query",
    format: "json",
    origin: "*",
    generator: "search",
    gsrsearch: query,
    gsrlimit: "1",
    gsrnamespace: "0",
    prop: "pageimages|info",
    piprop: "thumbnail|original",
    pithumbsize: "1200",
    inprop: "url",
  });
  const url = `https://${lang}.wikipedia.org/w/api.php?${params.toString()}`;
  let data: any;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    data = await res.json();
  } catch {
    return null;
  }
  const pages = data?.query?.pages;
  if (!pages) return null;
  const page: any = Object.values(pages)[0];
  if (!page) return null;

  const hit: WikiHit = {
    pageUrl: page.fullurl ?? pageUrlFor(lang, page.title ?? query),
  };
  const original = page.original;
  const thumb = page.thumbnail;
  // Prefer the original if it isn't absurdly large; thumbnail otherwise.
  if (thumb?.source) {
    hit.image = {
      src: thumb.source,
      width: thumb.width,
      height: thumb.height,
    };
  }
  if (original?.source && (!hit.image || (original.width ?? 0) <= 2400)) {
    hit.image = {
      src: original.source,
      width: original.width,
      height: original.height,
    };
  }
  return hit;
}

/**
 * Resolve a Wikipedia article for the query, preferring the user's language but
 * falling back to English (which has the deepest art/architecture coverage and
 * the same Commons images). Returns the first hit that carries an image; if
 * none has an image, returns the first article page found (link-only).
 */
export async function resolveWiki(
  query: string,
  lang: Lang,
): Promise<WikiHit | null> {
  const key = `${lang}|${query}`;
  const cached = WIKI_CACHE.get(key);
  if (cached) return cached;

  const langs = lang === "en" ? ["en"] : [lang, "en"];
  const promise = (async () => {
    let firstPage: WikiHit | null = null;
    for (const wl of langs) {
      const hit = await queryWiki(query, wl);
      if (hit?.image) return hit;
      if (hit?.pageUrl && !firstPage) firstPage = hit;
    }
    return firstPage;
  })();

  WIKI_CACHE.set(key, promise);
  return promise;
}
