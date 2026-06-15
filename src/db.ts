import Dexie, { type Table } from "dexie";
import type { DomainId } from "./domains";
import type { Regal, SavedRegal, SeenEntry, Settings } from "./types";

class RegalDB extends Dexie {
  cabinet!: Table<SavedRegal, string>;
  seen!: Table<SeenEntry, string>;
  settings!: Table<Settings, number>;

  constructor() {
    super("le-regal");
    this.version(1).stores({
      // cabinet keyed by id; indexes for ordering & filtering
      cabinet: "id, savedAt, domain",
      // seen-history keyed by normalized title; index domain + time
      seen: "id, domain, seenAt",
      settings: "++id",
    });
  }
}

export const db = new RegalDB();

// ---- ids ------------------------------------------------------------------

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function regalId(r: Pick<Regal, "domain" | "title">): string {
  return `${r.domain}__${slug(r.title)}`;
}

export function seenKey(r: Pick<Regal, "domain" | "title">): string {
  return `${r.domain}__${slug(r.title)}`;
}

// ---- settings -------------------------------------------------------------

export async function getSettings(): Promise<Settings> {
  const existing = await db.settings.toCollection().first();
  if (existing) return existing;
  const fresh: Settings = { onboarded: false, lang: "fr" };
  const id = await db.settings.add(fresh);
  return { ...fresh, id };
}

export async function setSettings(patch: Partial<Settings>): Promise<void> {
  const s = await getSettings();
  await db.settings.update(s.id!, patch);
}

// ---- cabinet --------------------------------------------------------------

export async function saveToCabinet(r: Regal, note?: string): Promise<string> {
  const id = regalId(r);
  const entry: SavedRegal = { ...r, id, savedAt: Date.now(), note };
  await db.cabinet.put(entry);
  return id;
}

export async function removeFromCabinet(id: string): Promise<void> {
  await db.cabinet.delete(id);
}

export async function updateNote(id: string, note: string): Promise<void> {
  await db.cabinet.update(id, { note });
}

export async function isInCabinet(r: Regal): Promise<boolean> {
  return (await db.cabinet.get(regalId(r))) != null;
}

// ---- seen-history ---------------------------------------------------------

export async function markSeen(r: Regal): Promise<void> {
  await db.seen.put({
    id: seenKey(r),
    domain: r.domain,
    title: r.title,
    attribution: r.attribution,
    seenAt: Date.now(),
  });
}

/** Recent titles seen, optionally scoped to a domain — to avoid repeats. */
export async function recentTitles(
  domain?: DomainId,
  limit = 80,
): Promise<string[]> {
  let rows: SeenEntry[];
  if (domain) {
    rows = await db.seen.where("domain").equals(domain).toArray();
  } else {
    rows = await db.seen.toArray();
  }
  rows.sort((a, b) => b.seenAt - a.seenAt);
  return rows.slice(0, limit).map((r) => r.title);
}
