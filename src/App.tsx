import { useCallback, useEffect, useRef, useState } from "react";
import { fetchRegal } from "./api";
import Cabinet from "./components/Cabinet";
import DomainEmblem from "./components/DomainEmblem";
import Onboarding from "./components/Onboarding";
import RegalCard from "./components/RegalCard";
import {
  ACCENT_CLASS,
  DOMAINS,
  DOMAIN_MAP,
  domainBlurb,
  domainForDay,
  domainName,
  todayDayIndex,
  type DomainId,
} from "./domains";
import { getSettings, markSeen, recentTitles, setSettings } from "./db";
import { t } from "./i18n";
import type { Lang, Regal, Settings } from "./types";

type View = "today" | "cabinet";

export default function App() {
  const [settings, setSettingsState] = useState<Settings | null>(null);
  const [lang, setLang] = useState<Lang>("fr");
  const [view, setView] = useState<View>("today");

  const [regal, setRegal] = useState<Regal | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const loadingRef = useRef(false);

  // boot settings
  useEffect(() => {
    getSettings().then((s) => {
      setSettingsState(s);
      setLang(s.lang);
    });
  }, []);

  const serve = useCallback(
    async (domain: DomainId | "any") => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      setPicker(false);
      try {
        const avoid = await recentTitles(
          domain === "any" ? undefined : domain,
          80,
        );
        const r = await fetchRegal({ domain, lang, avoid });
        setRegal(r);
        await markSeen(r);
        await setSettings({ lastServedDay: todayDayIndex() });
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [lang],
  );

  // auto-serve today's régal once onboarded & nothing shown yet
  useEffect(() => {
    if (!settings || !settings.onboarded || regal || loading || error) return;
    serve("any");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings?.onboarded]);

  async function finishOnboarding() {
    await setSettings({ onboarded: true, lang });
    const s = await getSettings();
    setSettingsState(s);
  }

  async function changeLang(l: Lang) {
    setLang(l);
    await setSettings({ lang: l });
  }

  if (!settings) {
    return <div className="min-h-screen" />;
  }

  const todayDomain = domainForDay(todayDayIndex());

  return (
    <div className="min-h-screen">
      {!settings.onboarded && (
        <Onboarding lang={lang} onLang={changeLang} onDone={finishOnboarding} />
      )}

      <div className="mx-auto max-w-2xl px-4 pb-24 pt-6 sm:pt-10">
        {/* masthead */}
        <header className="mb-8 flex items-center justify-between">
          <button
            onClick={() => setView("today")}
            className="group text-left"
            aria-label="Le Régal"
          >
            <span className="eyebrow text-[0.55rem] text-gold-dim">
              {DOMAIN_MAP[todayDomain] && t("todaysCabinet", lang)}
            </span>
            <h1 className="font-display text-3xl font-semibold leading-none text-vellum transition group-hover:text-gold-leaf sm:text-4xl">
              Le Régal
            </h1>
          </button>

          <div className="flex items-center gap-1.5 font-sans text-xs">
            <button
              onClick={() => setView("today")}
              className={`rounded-full px-3 py-1.5 transition ${
                view === "today"
                  ? "bg-gold/15 text-gold-leaf"
                  : "text-vellum-faint hover:text-vellum"
              }`}
            >
              {t("home", lang)}
            </button>
            <button
              onClick={() => setView("cabinet")}
              className={`rounded-full px-3 py-1.5 transition ${
                view === "cabinet"
                  ? "bg-gold/15 text-gold-leaf"
                  : "text-vellum-faint hover:text-vellum"
              }`}
            >
              {t("cabinet", lang)}
            </button>
            <span className="mx-1 h-4 w-px bg-gold/20" />
            {(["fr", "en"] as Lang[]).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                className={`rounded-full px-2 py-1.5 transition ${
                  lang === l ? "text-gold-leaf" : "text-vellum-faint hover:text-vellum"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {view === "cabinet" ? (
          <Cabinet lang={lang} />
        ) : (
          <main>
            {/* the day's served régal, or states */}
            {loading ? (
              <Loading lang={lang} domain={todayDomain} />
            ) : error ? (
              <ErrorPane
                lang={lang}
                message={error}
                onRetry={() => serve("any")}
              />
            ) : regal ? (
              <RegalCard regal={regal} lang={lang} />
            ) : (
              <Hero lang={lang} domain={todayDomain} onServe={() => serve("any")} />
            )}

            {/* actions */}
            {!loading && (regal || error) && (
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => serve("any")}
                  className="rounded-full bg-gold px-5 py-2.5 font-sans text-sm font-medium text-night-deep transition hover:bg-gold-leaf"
                >
                  {t("serveAnother", lang)}
                </button>
                <button
                  onClick={() => setPicker((p) => !p)}
                  className="rounded-full border border-gold/35 px-5 py-2.5 font-sans text-sm text-gold transition hover:border-gold hover:bg-gold/10"
                >
                  {t("chooseDomain", lang)}
                </button>
              </div>
            )}

            {/* domain picker */}
            {picker && !loading && (
              <div className="animate-fadeIn mt-5 rounded-2xl border border-gold/15 bg-night-raised/60 p-4">
                <p className="eyebrow mb-3 text-center text-[0.58rem] text-gold-dim">
                  {t("aRegalOf", lang)}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {DOMAINS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => serve(d.id)}
                      className="flex items-center gap-2.5 rounded-xl border border-gold/15 bg-night-deep/40 px-3 py-2.5 text-left font-body text-sm text-vellum transition hover:border-gold/40"
                      style={{ borderColor: undefined }}
                    >
                      <span
                        className="text-lg"
                        style={{ color: ACCENT_CLASS[d.id].hex }}
                        aria-hidden="true"
                      >
                        {d.emblem}
                      </span>
                      {domainName(d, lang)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>
        )}

        <footer className="mt-16 text-center">
          <p className="font-body text-xs italic text-vellum-faint">
            {t("tagline", lang)}
          </p>
        </footer>
      </div>
    </div>
  );
}

function Hero({
  lang,
  domain,
  onServe,
}: {
  lang: Lang;
  domain: DomainId;
  onServe: () => void;
}) {
  const d = DOMAIN_MAP[domain];
  return (
    <div className="animate-riseIn rounded-2xl bg-night-raised/60 px-6 py-14 text-center shadow-cabinet sm:px-10">
      <div className="mb-5 flex justify-center">
        <DomainEmblem domain={domain} size="lg" className="animate-glow" />
      </div>
      <p className="eyebrow text-[0.6rem] text-gold-dim">{t("todaysRegal", lang)}</p>
      <h2 className="mt-2 font-display text-4xl font-medium text-vellum sm:text-5xl">
        {domainName(d, lang)}
      </h2>
      <p className="mx-auto mt-3 max-w-xs font-body text-sm text-vellum-dim">
        {domainBlurb(d, lang)}
      </p>
      <button
        onClick={onServe}
        className="mt-8 rounded-full bg-gold px-7 py-3 font-sans text-sm font-medium text-night-deep transition hover:bg-gold-leaf"
      >
        {t("serve", lang)}
      </button>
    </div>
  );
}

function Loading({ lang, domain }: { lang: Lang; domain: DomainId }) {
  return (
    <div className="rounded-2xl bg-night-raised/60 px-6 py-20 text-center shadow-cabinet">
      <div className="mb-6 flex justify-center">
        <DomainEmblem domain={domain} size="lg" className="animate-shimmer" />
      </div>
      <p className="font-display text-2xl italic text-gold-leaf">
        {t("thinking", lang)}
      </p>
      <div className="mx-auto mt-6 h-px w-40 overflow-hidden rounded bg-gold/10">
        <div className="h-full w-1/3 animate-shimmer bg-gold-leaf" />
      </div>
    </div>
  );
}

function ErrorPane({
  lang,
  message,
  onRetry,
}: {
  lang: Lang;
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-domaine-peinture/40 bg-night-raised/60 px-6 py-12 text-center">
      <p className="eyebrow text-[0.6rem] text-domaine-peinture">
        {t("errorTitle", lang)}
      </p>
      <p className="mx-auto mt-3 max-w-md font-body text-vellum/80">{message}</p>
      <button
        onClick={onRetry}
        className="mt-6 rounded-full border border-gold/40 px-5 py-2 font-sans text-sm text-gold hover:bg-gold/10"
      >
        {t("retry", lang)}
      </button>
    </div>
  );
}
