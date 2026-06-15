import { DOMAINS } from "../domains";
import { t } from "../i18n";
import type { Lang } from "../types";

interface Props {
  lang: Lang;
  onLang: (l: Lang) => void;
  onDone: () => void;
}

export default function Onboarding({ lang, onLang, onDone }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night-deep/85 p-4 backdrop-blur-md">
      <div className="animate-riseIn w-full max-w-lg overflow-hidden rounded-2xl bg-night-raised shadow-cabinet">
        <div className="relative px-7 py-8 sm:px-10 sm:py-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-32 opacity-60"
            style={{
              background:
                "radial-gradient(60% 100% at 50% 0%, rgba(231,200,115,0.18), transparent 70%)",
            }}
            aria-hidden="true"
          />

          {/* lang toggle */}
          <div className="relative mb-6 flex justify-end gap-1 font-sans text-xs">
            {(["fr", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => onLang(l)}
                className={`rounded-full px-3 py-1 transition ${
                  lang === l
                    ? "bg-gold/15 text-gold-leaf"
                    : "text-vellum-faint hover:text-vellum"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>

          <p className="eyebrow text-[0.6rem] text-gold-dim">Le Régal</p>
          <h1 className="mt-2 font-display text-4xl font-semibold text-vellum sm:text-5xl">
            {t("obTitle", lang)}
          </h1>

          <div className="mt-5 space-y-3.5 font-body text-[1.02rem] leading-relaxed text-vellum/85">
            <p>{t("obP1", lang)}</p>
            <p>{t("obP2", lang)}</p>
            <p>{t("obP3", lang)}</p>
          </div>

          {/* the ten emblems, as a teaser of the rotating cabinet */}
          <div className="mt-7 flex flex-wrap gap-2.5">
            {DOMAINS.map((d) => (
              <span
                key={d.id}
                title={lang === "fr" ? d.fr : d.en}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gold/20 text-base text-vellum-dim"
              >
                {d.emblem}
              </span>
            ))}
          </div>

          <div className="mt-9 flex items-center justify-between">
            <button
              onClick={onDone}
              className="font-sans text-sm text-vellum-faint underline-offset-4 hover:text-vellum hover:underline"
            >
              {t("obSkip", lang)}
            </button>
            <button
              onClick={onDone}
              className="rounded-full bg-gold px-6 py-2.5 font-sans text-sm font-medium text-night-deep transition hover:bg-gold-leaf"
            >
              {t("obStart", lang)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
