import type { Context } from "@netlify/functions";
import { curate, type RegalRequest } from "./lib/curator.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

export default async (req: Request, _context: Context) => {
  if (req.method !== "POST") return json({ error: "POST only" }, 405);

  let body: RegalRequest;
  try {
    body = (await req.json()) as RegalRequest;
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const lang = body.lang === "en" ? "en" : "fr";

  // The Opus curation runs long (it reasons carefully to stay truthful & specific),
  // often beyond the synchronous proxy's idle timeout. We stream NDJSON: a heartbeat
  // every 3s keeps the connection live, then a final {result|error} line carries the
  // payload. The client reads to end-of-stream and parses the last JSON line.
  const enc = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let done = false;
      const beat = setInterval(() => {
        if (!done) {
          try {
            controller.enqueue(enc.encode("\n"));
          } catch {
            /* closed */
          }
        }
      }, 3000);

      try {
        const result = await curate({
          domain: body.domain ?? "any",
          lang,
          avoid: Array.isArray(body.avoid) ? body.avoid : [],
        });
        done = true;
        clearInterval(beat);
        controller.enqueue(enc.encode(JSON.stringify({ result }) + "\n"));
      } catch (err) {
        done = true;
        clearInterval(beat);
        const message =
          err instanceof Error
            ? err.message
            : lang === "en"
              ? "Unknown error"
              : "Erreur inconnue";
        controller.enqueue(enc.encode(JSON.stringify({ error: message }) + "\n"));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
};
