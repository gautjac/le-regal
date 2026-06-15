import { useEffect, useState } from "react";
import { ACCENT_CLASS, DOMAIN_MAP, domainName } from "../domains";
import { isInCabinet, removeFromCabinet, regalId, saveToCabinet } from "../db";
import { t } from "../i18n";
import type { Lang, Regal } from "../types";

interface Props {
  regal: Regal;
  lang: Lang;
  /** show the save control (hidden in cabinet view) */
  saveable?: boolean;
}

/** The jewel-box card presenting one régal, typographically. */
export default function RegalCard({ regal, lang, saveable = true }: Props) {
  const d = DOMAIN_MAP[regal.domain];
  const accent = ACCENT_CLASS[regal.domain];
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let alive = true;
    isInCabinet(regal).then((v) => alive && setSaved(v));
    return () => {
      alive = false;
    };
  }, [regal]);

  async function toggleSave() {
    if (saved) {
      await removeFromCabinet(regalId(regal));
      setSaved(false);
    } else {
      await saveToCabinet(regal);
      setSaved(true);
    }
  }

  return (
    <article
      className="animate-riseIn relative overflow-hidden rounded-2xl bg-night-raised/80 shadow-cabinet backdrop-blur-sm"
      style={{ borderTop: `2px solid ${accent.hex}` }}
    >
      {/* faint accent glow pooled at the top edge */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50"
        style={{
          background: `radial-gradient(60% 100% at 50% 0%, ${accent.hex}22, transparent 70%)`,
        }}
        aria-hidden="true"
      />

      <div className="relative px-6 py-7 sm:px-10 sm:py-9">
        {/* domain header */}
        <div className="mb-6 flex items-center gap-3">
          <span
            className="eyebrow text-[0.62rem]"
            style={{ color: accent.hex }}
          >
            {domainName(d, lang)}
          </span>
          <span className="h-px flex-1" style={{ background: `${accent.hex}40` }} />
          <span className="text-lg" style={{ color: accent.hex }} aria-hidden="true">
            {d.emblem}
          </span>
        </div>

        {/* title + attribution */}
        <h2 className="font-display text-3xl font-semibold leading-tight text-vellum sm:text-4xl">
          {regal.title}
        </h2>
        {regal.attribution && (
          <p className="mt-1.5 font-body text-sm italic text-vellum-dim sm:text-base">
            {regal.attribution}
          </p>
        )}

        <div className="rule-gold my-6" />

        {/* the thing itself */}
        <div>
          <p className="eyebrow mb-2 text-[0.6rem] text-gold-dim">
            {t("theThing", lang)}
          </p>
          <p className="font-body text-[1.06rem] leading-relaxed text-vellum/95 sm:text-lg">
            {regal.theThing}
          </p>
        </div>

        {/* le pourquoi — the signature */}
        <div
          className="mt-7 rounded-xl border p-5 sm:p-6"
          style={{
            borderColor: `${accent.hex}33`,
            background:
              "linear-gradient(180deg, rgba(231,200,115,0.05), rgba(0,0,0,0.12))",
          }}
        >
          <p className="eyebrow mb-2 flex items-center gap-2 text-[0.62rem] text-gold-leaf">
            <span aria-hidden="true">✦</span> {t("pourquoi", lang)}
          </p>
          <p className="font-body text-[1.02rem] leading-relaxed text-vellum/90">
            {regal.pourquoi}
          </p>
        </div>

        {/* le geste */}
        {regal.geste && (
          <div className="mt-6 flex items-start gap-3">
            <span className="eyebrow mt-1 shrink-0 text-[0.6rem] text-gold-dim">
              {t("geste", lang)}
            </span>
            <p className="font-display text-xl italic leading-snug text-gold-leaf sm:text-2xl">
              « {regal.geste} »
            </p>
          </div>
        )}

        {saveable && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={toggleSave}
              className="group inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2 font-sans text-sm text-gold transition hover:border-gold hover:bg-gold/10"
              style={saved ? { borderColor: accent.hex, color: accent.hex } : undefined}
            >
              <span aria-hidden="true">{saved ? "✦" : "✧"}</span>
              {saved ? t("saved", lang) : t("save", lang)}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
