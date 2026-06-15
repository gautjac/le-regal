import type { Lang } from "./types";

type Dict = Record<string, { fr: string; en: string }>;

const T: Dict = {
  tagline: {
    fr: "Une chose exquise par jour. Et pourquoi elle l'est.",
    en: "One exquisite thing a day. And why it is.",
  },
  todaysRegal: { fr: "Le régal du jour", en: "Today's régal" },
  serve: { fr: "Servir le régal", en: "Serve the régal" },
  serveAnother: { fr: "Un autre régal", en: "Another régal" },
  chooseDomain: { fr: "Choisir un domaine", en: "Choose a domain" },
  anyDomain: { fr: "Au hasard", en: "Surprise me" },
  theThing: { fr: "Le régal", en: "The régal" },
  pourquoi: { fr: "Le pourquoi", en: "Why it works" },
  geste: { fr: "Le geste", en: "The move" },
  save: { fr: "Garder au cabinet", en: "Keep in the cabinet" },
  saved: { fr: "Au cabinet ✓", en: "In the cabinet ✓" },
  cabinet: { fr: "Le cabinet", en: "The cabinet" },
  cabinetSub: {
    fr: "Votre cabinet de curiosités — les régals que vous avez aimés.",
    en: "Your cabinet of curiosities — the régals you loved.",
  },
  home: { fr: "Le jour", en: "Today" },
  todaysCabinet: { fr: "le cabinet du jour", en: "today's cabinet" },
  aRegalOf: { fr: "un régal de…", en: "a régal of…" },
  searchCabinet: {
    fr: "Chercher par titre, domaine ou geste…",
    en: "Search by title, domain or move…",
  },
  allDomains: { fr: "Tous", en: "All" },
  emptyCabinet: {
    fr: "Votre cabinet est vide. Gardez un régal qui vous a saisi.",
    en: "Your cabinet is empty. Keep a régal that struck you.",
  },
  emptySearch: {
    fr: "Aucun régal ne correspond.",
    en: "No régal matches.",
  },
  remove: { fr: "Retirer", en: "Remove" },
  note: { fr: "Note", en: "Note" },
  addNote: { fr: "Ajouter une note…", en: "Add a note…" },
  thinking: { fr: "On choisit avec soin…", en: "Choosing with care…" },
  errorTitle: { fr: "Un pépin", en: "A snag" },
  retry: { fr: "Réessayer", en: "Retry" },
  savedAt: { fr: "Gardé le", en: "Kept on" },
  count: { fr: "régals", en: "régals" },
  // onboarding
  obTitle: { fr: "Bienvenue au Régal", en: "Welcome to Le Régal" },
  obP1: {
    fr: "Chaque jour, un seul régal — un détail d'un tableau, huit mesures de musique, une phrase parfaite, un coup d'échecs — tiré d'un domaine qui tourne.",
    en: "Each day, a single régal — a detail of a painting, eight bars of music, a perfect sentence, a chess move — drawn from a rotating domain.",
  },
  obP2: {
    fr: "On vous montre la chose, puis « le pourquoi » : soixante secondes serrées sur ce qui la rend exceptionnelle. C'est là que l'œil s'éduque.",
    en: "We show you the thing, then «the why»: a tight sixty seconds on what makes it exceptional. That's where the eye sharpens.",
  },
  obP3: {
    fr: "Gardez vos préférés au cabinet. Demandez un domaine précis si l'envie vous prend.",
    en: "Keep your favourites in the cabinet. Ask for a specific domain whenever you like.",
  },
  obStart: { fr: "Ouvrir le cabinet", en: "Open the cabinet" },
  obSkip: { fr: "Passer", en: "Skip" },
  langName: { fr: "Français", en: "English" },
};

export function t(key: keyof typeof T, lang: Lang): string {
  return T[key]?.[lang] ?? key;
}

export { T };
