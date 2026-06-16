import Anthropic from "@anthropic-ai/sdk";

const MODEL = "claude-opus-4-8";

function client(): Anthropic {
  const apiKey = process.env.CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Server missing CLAUDE_API_KEY");
  return new Anthropic({ apiKey, baseURL: "https://api.anthropic.com" });
}

export type Lang = "fr" | "en";

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

const DOMAIN_IDS: DomainId[] = [
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

export interface RegalRequest {
  domain: DomainId | "any";
  lang?: Lang;
  avoid?: string[];
}

export interface Regal {
  domain: DomainId;
  title: string;
  attribution: string;
  theThing: string;
  pourquoi: string;
  geste: string;
  /** keywords only (never a URL) to locate the work — see schema/system prompt */
  mediaQuery?: string;
}

// What a régal from each domain SHOULD be — keeps the model concrete & honest.
const DOMAIN_BRIEF: Record<DomainId, string> = {
  peinture:
    "A single DETAIL of one real, well-known painting — a passage of brushwork, a gesture, a colour relationship, a compositional decision. Name the painting and painter exactly. Describe the detail in words (NO image). E.g. the dog's reflected highlight in a Velázquez; the empty chair in a Van Gogh.",
  musique:
    "A short, specific passage of a real, well-known piece — name the bars or the moment (e.g. 'the key change at 2:43', 'the opening four notes', 'the Neapolitan chord before the recapitulation'). Classical, jazz, song, film score — anything real and attributable to a real composer/artist.",
  phrase:
    "One single, real, verifiable sentence from literature, an essay, a speech, or non-fiction — quoted EXACTLY and attributed precisely to its real author and work. The régal is the craft of that one sentence: its rhythm, its turn, its economy.",
  echecs:
    "A real, famous chess moment or move — name the game (players, year, event) and the move in standard notation if possible (e.g. Marshall's …Qg3 vs Levitsky 1912; the 'Immortal Game'; Fischer's …Bxh2). Describe what the move does. Must be a real, documented game.",
  poesie:
    "A single line (or couplet) of real, verifiable poetry, quoted exactly and attributed to its real poet and poem. The régal is what that one line DOES — its image, its sound, its break.",
  cinema:
    "One specific shot or cut from a real, well-known film — name the film and director and the moment precisely (e.g. the match-cut in Lawrence of Arabia; the bone-to-satellite cut in 2001; the long take's turn in Children of Men). Describe the shot in words.",
  danse:
    "One specific phrase, step, or moment from real, well-known choreography or a dancer (e.g. a passage from a Pina Bausch piece, a Fred Astaire sequence, the Rose Adagio balances in Sleeping Beauty). Name the work/choreographer/dancer. Describe the movement.",
  architecture:
    "One real, well-known building or a specific element of it (a stair, a light-well, a junction, a proportion) — name the building and architect exactly. Describe the spatial/material move (e.g. the oculus of the Pantheon; Aalto's undulating ceiling; the cantilever of Fallingwater).",
  science:
    "One real, elegant scientific idea, proof, experiment, or result — attributed correctly (e.g. Eratosthenes measuring the Earth; the double-slit experiment; Noether's theorem; the structure of DNA as a copying mechanism). The régal is the beauty/economy of the idea itself.",
  cuisine:
    "One real, well-established culinary pairing or technique — a classic combination or a precise move (e.g. why tomato + basil, why brown butter, the Maillard reaction in a sear, salt + caramel, the acid that lifts a fatty dish). Grounded in real gastronomy, not invented.",
};

const DOMAIN_FR: Record<DomainId, string> = {
  peinture: "peinture",
  musique: "musique",
  phrase: "la phrase",
  echecs: "échecs",
  poesie: "poésie",
  cinema: "cinéma",
  danse: "danse",
  architecture: "architecture",
  science: "science",
  cuisine: "cuisine",
};

const DOMAIN_EN: Record<DomainId, string> = {
  peinture: "painting",
  musique: "music",
  phrase: "the sentence",
  echecs: "chess",
  poesie: "poetry",
  cinema: "cinema",
  danse: "dance",
  architecture: "architecture",
  science: "science",
  cuisine: "cuisine",
};

function domainLabel(domain: DomainId, lang: Lang): string {
  return lang === "fr" ? DOMAIN_FR[domain] : DOMAIN_EN[domain];
}

const SYSTEM_BASE = `You are the curator of «Le Régal», a daily cabinet of wonders made for a Québécois filmmaker and musician with a sharp, curious eye. Each day you serve ONE exquisite small thing from one domain — and, crucially, you explain WHY it is exceptional in a tight, specific way that teaches the eye and ear.

THE NON-NEGOTIABLE HONESTY RULE:
- You may ONLY reference REAL, well-known, verifiable works, figures, games, buildings, sentences, lines, shots, ideas, or pairings — correctly attributed.
- NEVER invent a work, a quote, a painting, a game, or an attribution. If you are not confident a work and its attribution are real and accurate, choose a different, more canonical example you ARE sure of.
- Quote sentences and poetry lines EXACTLY as written; attribute to the real author and the real work. If you cannot recall the exact wording with confidence, pick a famous line you CAN quote exactly, or describe rather than misquote.
- Prefer the canonical and the famous over the obscure — it must be checkable.
- This is a TYPOGRAPHIC cabinet: you present things in WORDS only. Never claim an image is shown. Describe vividly instead.

WHAT MAKES A GREAT RÉGAL — the «pourquoi» is the signature:
- «theThing»: present the thing itself, vividly and concretely. Quote the line; name the bars or the timestamp; name the move in notation; describe the shot or the detail. 2–4 sentences. Make the reader SEE/HEAR it.
- «pourquoi»: the heart. A tight ~60-second explanation (roughly 70–130 words) of what makes it exceptional — the specific craft move, the decision, the constraint overcome, the transferable insight. Be precise and earned: name the technique, the tension, the why. No vague praise ("beautiful", "iconic", "masterful") without the mechanism behind it. Teach something the reader can carry to their own work.
- «geste»: the ONE transferable move, named in a short phrase (a maxim a maker could pin above their desk). E.g. "Laisser le vide porter le poids." / "Let the silence do the work."

LOCATING THE WORK — «mediaQuery»:
- When the régal is a locatable work (a painting, a building, a film, a musical piece, a recording, a choreography), ALSO provide «mediaQuery»: a few KEYWORDS — the work's consecrated title plus its creator — that will reliably surface it on Wikipedia or YouTube. E.g. "Las Meninas Velázquez", "J.S. Bach Goldberg Variations Aria BWV 988", "Pina Bausch Café Müller", "Fallingwater Frank Lloyd Wright".
- KEYWORDS ONLY. NEVER a URL, never a guessed link — the app resolves the real media itself from these keywords. Inventing a URL breaks the honesty rule.
- Omit «mediaQuery» for domains/régals with no single locatable work to point at (a bare sentence, a poetry line, an abstract scientific idea, a culinary principle) — there the words alone are the régal.

VOICE: cultured, warm, exact — a brilliant friend showing you one thing across a table, not a museum placard. Sentences with rhythm. Never gushing, never academic-dry.

Respond ONLY by calling report_regal with accurate, real content.`;

const LANG_DIRECTIVE: Record<Lang, string> = {
  fr: "\n\nLANGUE DE SORTIE — écris TOUT le texte destiné à l'utilisateur en FRANÇAIS QUÉBÉCOIS naturel et soigné : `theThing`, `pourquoi`, `geste`. Le `title` et l'`attribution` gardent les noms propres tels quels (titres d'œuvres dans leur langue d'origine ou consacrée, noms d'auteurs). Si tu cites une phrase ou un vers, cite-le dans SA langue d'origine exacte (ne traduis jamais une citation), puis explique en français.",
  en: "\n\nOUTPUT LANGUAGE — write ALL user-facing prose in natural, cultured ENGLISH: `theThing`, `pourquoi`, `geste`. Keep proper names as-is in `title` and `attribution`. If you quote a sentence or a line, quote it in ITS exact original language (never translate a quotation), then explain in English.",
};

function systemFor(lang: Lang): string {
  return SYSTEM_BASE + LANG_DIRECTIVE[lang];
}

const TOOL: Anthropic.Tool = {
  name: "report_regal",
  description: "Report today's single régal with its honest, specific why.",
  input_schema: {
    type: "object",
    required: ["title", "attribution", "theThing", "pourquoi", "geste"],
    properties: {
      title: {
        type: "string",
        description:
          "The real work / piece / game / building / idea title, in its consecrated form. A proper name — never invented.",
      },
      attribution: {
        type: "string",
        description:
          "Accurate attribution: author/composer/architect/players + year or work, exactly. E.g. 'Diego Velázquez, 1656' or 'J.S. Bach, Goldberg Variations BWV 988, 1741' or 'Marshall–Levitsky, Breslau 1912'.",
      },
      theThing: {
        type: "string",
        description:
          "The thing itself, vivid and concrete, 2–4 sentences. Quote/name/describe the specific detail. No image is shown — paint it in words.",
      },
      pourquoi: {
        type: "string",
        description:
          "«Le pourquoi» — ~70–130 words of precise, earned explanation of what makes it exceptional and the transferable insight. The signature of the app. No vague praise without mechanism.",
      },
      geste: {
        type: "string",
        description:
          "«Le geste» — the single transferable move, as one pinnable phrase (max ~10 words).",
      },
      mediaQuery: {
        type: "string",
        description:
          "Optional. KEYWORDS ONLY (never a URL) to locate this exact work on Wikipedia / YouTube: its consecrated title + creator, e.g. 'Las Meninas Velázquez', 'J.S. Bach Goldberg Variations Aria BWV 988', 'Pina Bausch Café Müller', 'Fallingwater Frank Lloyd Wright'. Provide for paintings, buildings, films, musical pieces/recordings and choreographies so the app can embed a real image or listening link. Omit when there is no single locatable work (a bare sentence, a poetry line, an abstract idea, a culinary principle).",
      },
    },
  },
};

function pickDomain(req: RegalRequest): DomainId {
  if (req.domain && req.domain !== "any" && DOMAIN_IDS.includes(req.domain)) {
    return req.domain;
  }
  // engine-chosen: rotate by local day to keep variety
  const dayIndex = Math.floor(Date.now() / 86_400_000);
  return DOMAIN_IDS[dayIndex % DOMAIN_IDS.length];
}

function clamp(s: unknown, max: number): string {
  return String(s ?? "").trim().slice(0, max);
}

export async function curate(req: RegalRequest): Promise<Regal> {
  const lang: Lang = req.lang === "en" ? "en" : "fr";
  const domain = pickDomain(req);
  const brief = DOMAIN_BRIEF[domain];
  const avoid = (req.avoid ?? []).filter(Boolean).slice(0, 60);

  const userText = [
    `TODAY'S DOMAIN: ${domain} — ${domainLabel(domain, lang)}.`,
    "",
    "WHAT A RÉGAL FROM THIS DOMAIN IS:",
    brief,
    "",
    avoid.length
      ? `ALREADY SERVED — do NOT repeat any of these (pick something genuinely different, ideally a different work/figure entirely):\n${avoid.map((a) => `• ${a}`).join("\n")}`
      : "Nothing served yet — choose a superb, canonical example to open with.",
    "",
    "Choose ONE real, verifiable, well-known example. Attribute it exactly. Then write its honest, specific «pourquoi» and «geste».",
    lang === "fr"
      ? "Écris `theThing`, `pourquoi` et `geste` en FRANÇAIS québécois. Cite toute phrase/vers dans sa langue d'origine."
      : "Write `theThing`, `pourquoi` and `geste` in ENGLISH. Quote any sentence/line in its original language.",
    "Respond only by calling report_regal.",
  ].join("\n");

  const res = await client().messages.create({
    model: MODEL,
    max_tokens: 1600,
    temperature: 1,
    system: systemFor(lang),
    messages: [{ role: "user", content: userText }],
    tools: [TOOL],
    tool_choice: { type: "tool", name: "report_regal" },
  });

  const tool = res.content.find((b) => b.type === "tool_use");
  if (!tool || tool.type !== "tool_use") {
    throw new Error(
      lang === "en"
        ? "The curator returned nothing. Please try again."
        : "Le conservateur n'a rien renvoyé. Réessayez.",
    );
  }
  const raw = tool.input as Partial<Regal>;

  const title = clamp(raw.title, 200);
  const theThing = clamp(raw.theThing, 1400);
  const pourquoi = clamp(raw.pourquoi, 1800);
  const geste = clamp(raw.geste, 200);
  // keywords only — defensively strip anything URL-shaped the model might emit
  let mediaQuery = clamp(raw.mediaQuery, 160);
  if (/https?:\/\/|www\.|\.\w{2,}\//i.test(mediaQuery)) mediaQuery = "";

  if (!title || !theThing || !pourquoi) {
    throw new Error(
      lang === "en"
        ? "The curator returned an incomplete régal. Please try again."
        : "Le régal renvoyé était incomplet. Réessayez.",
    );
  }

  return {
    domain,
    title,
    attribution: clamp(raw.attribution, 300),
    theThing,
    pourquoi,
    geste,
    ...(mediaQuery ? { mediaQuery } : {}),
  };
}
