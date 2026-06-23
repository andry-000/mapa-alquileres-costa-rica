/** @type {import('tailwindcss').Config} */
// Design tokens mapped 1:1 from the "Atlas del Alquiler · sistema" handoff.
// Principle: el dato es el protagonista — la decoración se subordina al valor.
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg: "#0e1013",
        "bg-alt": "#101317",
        surface: "#14171c",
        panel: "#15181d",
        chip: "#23272f",
        nd: "#2a2f37", // "sin dato" base (always paired with diagonal texture)
        // Text
        ink: "#e8eaed",
        "ink-soft": "#c5cad1",
        muted: "#9aa0a8",
        faint: "#686e76",
        dim: "#4f555d",
        // Accent (gold) — selección / vigente / controles activos
        accent: "#cdbb8e",
        "accent-ink": "#0e1013",
        // Editorial annotation (Newsreader italic)
        editorial: "#bfa890",
      },
      fontFamily: {
        sans: ["Archivo", "system-ui", "sans-serif"],
        narrow: ["'Archivo Narrow'", "Archivo", "sans-serif"],
        serif: ["Newsreader", "Georgia", "serif"],
      },
      borderColor: {
        hair: "rgba(255,255,255,.08)",
        "hair-strong": "rgba(255,255,255,.12)",
      },
      transitionTimingFunction: {
        atlas: "cubic-bezier(.4,0,.2,1)",
      },
    },
  },
  plugins: [],
};
