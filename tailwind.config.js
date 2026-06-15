/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Le Régal — a cabinet de curiosités. Deep lacquered night, gold leaf, warm vellum.
        night: {
          DEFAULT: "#15110f",
          deep: "#0e0b0a",
          raised: "#1f1916",
          velvet: "#241c19",
        },
        gold: {
          DEFAULT: "#c9a24a",
          leaf: "#e7c873",
          dim: "#9c7c39",
          deep: "#6f5727",
        },
        vellum: {
          DEFAULT: "#efe4cf",
          soft: "#e3d6bd",
          dim: "#bcae93",
          faint: "#8d8169",
        },
        // domain accents — each régal-domain gets its jewel tone
        domaine: {
          peinture: "#c2553f",
          musique: "#7a8fc4",
          phrase: "#cfa14d",
          echecs: "#5e8d6e",
          poesie: "#a86ca8",
          cinema: "#5d7fa0",
          danse: "#cf7f8e",
          architecture: "#9a8a6a",
          science: "#5fa0a4",
          cuisine: "#c98a4a",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "Garamond", "serif"],
        body: ['"Spectral"', "Georgia", "serif"],
        sans: ['"Inter"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        cabinet: "0 24px 60px -24px rgba(0,0,0,0.75), 0 0 0 1px rgba(201,162,74,0.12)",
        leaf: "0 0 0 1px rgba(201,162,74,0.35), 0 8px 30px -12px rgba(0,0,0,0.6)",
        inset: "inset 0 1px 0 0 rgba(231,200,115,0.08)",
      },
      backgroundImage: {
        "gold-rule": "linear-gradient(90deg, transparent, rgba(201,162,74,0.5), transparent)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        shimmer: { "0%, 100%": { opacity: "0.45" }, "50%": { opacity: "1" } },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 1px rgba(201,162,74,0.25)" },
          "50%": { boxShadow: "0 0 22px 1px rgba(231,200,115,0.35)" },
        },
      },
      animation: {
        riseIn: "riseIn 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        fadeIn: "fadeIn 0.7s ease-out both",
        shimmer: "shimmer 1.4s ease-in-out infinite",
        glow: "glow 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
