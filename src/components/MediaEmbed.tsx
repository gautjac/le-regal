import { useEffect, useMemo, useState } from "react";
import { ACCENT_CLASS } from "../domains";
import { mediaPlan, resolveWiki, type WikiHit } from "../media";
import { t } from "../i18n";
import type { Lang, Regal } from "../types";

interface Props {
  regal: Regal;
  lang: Lang;
  /** denser layout for the cabinet's expanded rows */
  compact?: boolean;
}

/**
 * Shows the régal's actual media beside the words:
 *  • visual domains → the real artwork image, embedded, with a source link.
 *  • audio / motion → a guaranteed-valid YouTube link (+ Wikipedia when found).
 * Renders nothing for text-only domains.
 */
export default function MediaEmbed({ regal, lang, compact = false }: Props) {
  const plan = useMemo(() => mediaPlan(regal), [regal]);
  const accent = ACCENT_CLASS[regal.domain];

  const [wiki, setWiki] = useState<WikiHit | null>(null);
  const [resolving, setResolving] = useState(plan.intent !== "none");
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    if (plan.intent === "none") {
      setWiki(null);
      setResolving(false);
      return;
    }
    let alive = true;
    setResolving(true);
    setWiki(null);
    setImgFailed(false);
    resolveWiki(plan.query, lang).then((hit) => {
      if (alive) {
        setWiki(hit);
        setResolving(false);
      }
    });
    return () => {
      alive = false;
    };
  }, [plan.intent, plan.query, lang]);

  if (plan.intent === "none") return null;

  const hasImage = plan.intent === "image" && !!wiki?.image && !imgFailed;

  // ---------- image domains ----------
  if (plan.intent === "image") {
    return (
      <div className={compact ? "mt-3" : "mt-5"}>
        {resolving ? (
          <ImagePlaceholder accent={accent.hex} compact={compact} />
        ) : hasImage ? (
          <figure
            className="overflow-hidden rounded-xl border bg-night-deep/70"
            style={{ borderColor: `${accent.hex}33` }}
          >
            <a
              href={wiki!.pageUrl ?? plan.imagesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
              aria-label={`${regal.title} — ${t("viewSource", lang)}`}
            >
              <img
                src={wiki!.image!.src}
                width={wiki!.image!.width}
                height={wiki!.image!.height}
                alt={`${regal.title}${regal.attribution ? ` — ${regal.attribution}` : ""}`}
                loading="lazy"
                decoding="async"
                onError={() => setImgFailed(true)}
                className="mx-auto block w-full object-contain transition duration-500 group-hover:scale-[1.015]"
                style={{ maxHeight: compact ? "16rem" : "30rem" }}
              />
            </a>
            <figcaption className="flex items-center justify-between gap-3 border-t border-gold/10 px-3.5 py-2">
              <span className="font-sans text-[0.62rem] text-vellum-faint">
                {t("imageCredit", lang)}
              </span>
              {wiki?.pageUrl && (
                <MediaLink
                  href={wiki.pageUrl}
                  label={t("viewSource", lang)}
                  hex={accent.hex}
                  subtle
                />
              )}
            </figcaption>
          </figure>
        ) : (
          // no embeddable image found → always offer working links
          <div className="flex flex-wrap gap-2.5">
            {plan.imagesUrl && (
              <MediaLink
                href={plan.imagesUrl}
                label={t("seeImage", lang)}
                hex={accent.hex}
                primary
              />
            )}
            {wiki?.pageUrl && (
              <MediaLink
                href={wiki.pageUrl}
                label={t("viewSource", lang)}
                hex={accent.hex}
              />
            )}
          </div>
        )}
      </div>
    );
  }

  // ---------- audio / motion domains ----------
  const playLabel =
    plan.intent === "listen" ? t("listenYouTube", lang) : t("watchYouTube", lang);
  return (
    <div className={`flex flex-wrap gap-2.5 ${compact ? "mt-3" : "mt-5"}`}>
      {plan.youtubeUrl && (
        <MediaLink
          href={plan.youtubeUrl}
          label={playLabel}
          hex={accent.hex}
          primary
          icon={plan.intent === "listen" ? "♪" : "▷"}
        />
      )}
      {!resolving && wiki?.pageUrl && (
        <MediaLink
          href={wiki.pageUrl}
          label={t("learnMore", lang)}
          hex={accent.hex}
        />
      )}
    </div>
  );
}

function MediaLink({
  href,
  label,
  hex,
  primary = false,
  subtle = false,
  icon,
}: {
  href: string;
  label: string;
  hex: string;
  primary?: boolean;
  subtle?: boolean;
  icon?: string;
}) {
  if (subtle) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 font-sans text-[0.62rem] text-vellum-faint transition hover:text-gold-leaf"
      >
        {label} ↗
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 font-sans text-sm transition"
      style={
        primary
          ? { background: `${hex}1f`, borderColor: `${hex}66`, color: "#efe4cf" }
          : { borderColor: "rgba(201,162,74,0.35)", color: "#c9a24a" }
      }
    >
      {icon && (
        <span aria-hidden="true" style={{ color: hex }}>
          {icon}
        </span>
      )}
      {label} <span aria-hidden="true" className="opacity-60">↗</span>
    </a>
  );
}

function ImagePlaceholder({
  accent,
  compact,
}: {
  accent: string;
  compact: boolean;
}) {
  return (
    <div
      className="flex items-center justify-center rounded-xl border bg-night-deep/60"
      style={{
        borderColor: `${accent}26`,
        height: compact ? "10rem" : "16rem",
      }}
    >
      <span
        className="animate-shimmer text-2xl"
        style={{ color: accent }}
        aria-hidden="true"
      >
        ❖
      </span>
    </div>
  );
}
