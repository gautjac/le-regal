import type { DomainId } from "./domains";
import type { Lang, Regal } from "./types";

export interface RegalRequest {
  /** specific domain, or "any" to let the rotation/engine choose */
  domain: DomainId | "any";
  lang: Lang;
  /** titles already seen (to avoid repeats) */
  avoid: string[];
}

/**
 * /api/regal streams NDJSON: keepalive heartbeats (bare newlines) keep the
 * connection alive during the long Opus reasoning, then a final JSON line
 * carries { result } or { error }. We read to end-of-stream and parse the last
 * non-empty line. Falls back to plain-JSON for non-streamed responses.
 */
export async function fetchRegal(req: RegalRequest): Promise<Regal> {
  const en = req.lang === "en";
  const res = await fetch("/api/regal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  const raw = await res.text();
  const lines = raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const last = lines[lines.length - 1] ?? "";

  let parsed: { result?: Regal; error?: string } | Regal | null = null;
  try {
    parsed = last ? JSON.parse(last) : null;
  } catch {
    parsed = null;
  }

  const invalid = en ? "Invalid response from the server." : "Réponse invalide du serveur.";

  if (!res.ok) {
    const fallback = en ? `Error ${res.status}` : `Erreur ${res.status}`;
    const msg = parsed && "error" in parsed && parsed.error ? parsed.error : fallback;
    throw new Error(msg);
  }
  if (!parsed) throw new Error(invalid);
  if ("error" in parsed && parsed.error) throw new Error(parsed.error);
  if ("result" in parsed && parsed.result) return parsed.result;
  if ("theThing" in parsed) return parsed as Regal;
  throw new Error(invalid);
}
