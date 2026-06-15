import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db, removeFromCabinet, updateNote } from "../db";
import {
  ACCENT_CLASS,
  DOMAINS,
  DOMAIN_MAP,
  type DomainId,
} from "../domains";
import { t } from "../i18n";
import type { Lang, SavedRegal } from "../types";

interface Props {
  lang: Lang;
}

export default function Cabinet({ lang }: Props) {
  const all = useLiveQuery(
    () => db.cabinet.orderBy("savedAt").reverse().toArray(),
    [],
    [] as SavedRegal[],
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<DomainId | "all">("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const present = useMemo(() => {
    const set = new Set((all ?? []).map((r) => r.domain));
    return DOMAINS.filter((d) => set.has(d.id));
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (all ?? []).filter((r) => {
      if (filter !== "all" && r.domain !== filter) return false;
      if (!q) return true;
      const hay = [
        r.title,
        r.attribution,
        r.geste,
        r.theThing,
        r.pourquoi,
        DOMAIN_MAP[r.domain]?.fr,
        DOMAIN_MAP[r.domain]?.en,
        r.note ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [all, query, filter]);

  return (
    <div className="animate-fadeIn">
      <header className="mb-6">
        <h2 className="font-display text-3xl font-semibold text-vellum sm:text-4xl">
          {t("cabinet", lang)}
        </h2>
        <p className="mt-1 font-body text-sm text-vellum-dim">{t("cabinetSub", lang)}</p>
      </header>

      {/* search + count */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gold-dim">
            ⌕
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchCabinet", lang)}
            className="w-full rounded-full border border-gold/20 bg-night-raised/70 py-2.5 pl-10 pr-4 font-sans text-sm text-vellum placeholder:text-vellum-faint focus:border-gold/50 focus:outline-none"
          />
        </div>
        <span className="font-sans text-xs text-vellum-faint tnum">
          {(all ?? []).length} {t("count", lang)}
        </span>
      </div>

      {/* domain filter chips (only domains present) */}
      {present.length > 0 && (
        <div className="mb-7 flex flex-wrap gap-2">
          <Chip
            active={filter === "all"}
            onClick={() => setFilter("all")}
            label={t("allDomains", lang)}
          />
          {present.map((d) => (
            <Chip
              key={d.id}
              active={filter === d.id}
              onClick={() => setFilter(d.id)}
              label={`${d.emblem} ${lang === "fr" ? d.fr : d.en}`}
              hex={ACCENT_CLASS[d.id].hex}
            />
          ))}
        </div>
      )}

      {(all ?? []).length === 0 ? (
        <Empty text={t("emptyCabinet", lang)} />
      ) : filtered.length === 0 ? (
        <Empty text={t("emptySearch", lang)} />
      ) : (
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((r) => (
            <CabinetItem
              key={r.id}
              regal={r}
              lang={lang}
              open={openId === r.id}
              onToggle={() => setOpenId(openId === r.id ? null : r.id)}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  hex,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  hex?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 font-sans text-xs transition ${
        active
          ? "text-night-deep"
          : "border-gold/25 text-vellum-dim hover:text-vellum"
      }`}
      style={
        active
          ? { background: hex ?? "#c9a24a", borderColor: hex ?? "#c9a24a" }
          : undefined
      }
    >
      {label}
    </button>
  );
}

function CabinetItem({
  regal,
  lang,
  open,
  onToggle,
}: {
  regal: SavedRegal;
  lang: Lang;
  open: boolean;
  onToggle: () => void;
}) {
  const d = DOMAIN_MAP[regal.domain];
  const accent = ACCENT_CLASS[regal.domain];
  const [note, setNote] = useState(regal.note ?? "");

  return (
    <li
      className="overflow-hidden rounded-xl bg-night-raised/70 shadow-leaf"
      style={{ borderLeft: `2px solid ${accent.hex}` }}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        <span className="mt-0.5 text-lg" style={{ color: accent.hex }} aria-hidden="true">
          {d.emblem}
        </span>
        <span className="min-w-0 flex-1">
          <span
            className="eyebrow block text-[0.55rem]"
            style={{ color: accent.hex }}
          >
            {lang === "fr" ? d.fr : d.en}
          </span>
          <span className="mt-0.5 block truncate font-display text-xl font-semibold text-vellum">
            {regal.title}
          </span>
          {regal.attribution && (
            <span className="block truncate font-body text-xs italic text-vellum-dim">
              {regal.attribution}
            </span>
          )}
          {!open && regal.geste && (
            <span className="mt-1.5 block truncate font-display text-sm italic text-gold-dim">
              « {regal.geste} »
            </span>
          )}
        </span>
        <span
          className={`mt-1 shrink-0 text-vellum-faint transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ⌄
        </span>
      </button>

      {open && (
        <div className="animate-fadeIn border-t border-gold/10 px-5 pb-5 pt-4">
          <p className="eyebrow mb-1.5 text-[0.55rem] text-gold-dim">
            {t("theThing", lang)}
          </p>
          <p className="font-body text-[0.97rem] leading-relaxed text-vellum/90">
            {regal.theThing}
          </p>

          <p className="eyebrow mb-1.5 mt-4 text-[0.55rem] text-gold-leaf">
            ✦ {t("pourquoi", lang)}
          </p>
          <p className="font-body text-[0.95rem] leading-relaxed text-vellum/85">
            {regal.pourquoi}
          </p>

          {regal.geste && (
            <p className="mt-4 font-display text-lg italic text-gold-leaf">
              « {regal.geste} »
            </p>
          )}

          {/* note */}
          <div className="mt-5">
            <p className="eyebrow mb-1.5 text-[0.55rem] text-gold-dim">{t("note", lang)}</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => updateNote(regal.id, note.trim())}
              placeholder={t("addNote", lang)}
              rows={2}
              className="w-full resize-none rounded-lg border border-gold/15 bg-night-deep/50 px-3 py-2 font-body text-sm text-vellum placeholder:text-vellum-faint focus:border-gold/40 focus:outline-none"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="font-sans text-[0.65rem] text-vellum-faint tnum">
              {t("savedAt", lang)}{" "}
              {new Date(regal.savedAt).toLocaleDateString(
                lang === "fr" ? "fr-CA" : "en-CA",
                { year: "numeric", month: "short", day: "numeric" },
              )}
            </span>
            <button
              onClick={() => removeFromCabinet(regal.id)}
              className="font-sans text-xs text-vellum-faint transition hover:text-domaine-peinture"
            >
              {t("remove", lang)}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gold/20 px-6 py-16 text-center">
      <p className="mx-auto max-w-sm font-body text-vellum-dim">{text}</p>
    </div>
  );
}
