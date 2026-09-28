import type { Regal, Settings } from "./types";

/**
 * The régal already served today, if any. A reload on the same local day shows
 * it again instead of spending a fresh Opus call; a new day — or a settings row
 * written before the régal itself was stored — gets null, and the app fetches.
 * «Servir un autre» / a domain pick still fetch explicitly (and become the one
 * a later reload shows).
 */
export function servedToday(settings: Settings, today: number): Regal | null {
  return settings.lastServedDay === today && settings.lastServed
    ? settings.lastServed
    : null;
}
