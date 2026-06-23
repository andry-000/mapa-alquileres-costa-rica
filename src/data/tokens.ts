// Design tokens that also need to exist at runtime (map paint, SVG, charts).
// Kept in sync with tailwind.config.js. Source of truth for *data* ramps.
import type { LensId, Party } from "./types";

export const COLORS = {
  bg: "#0e1013",
  bgAlt: "#101317",
  surface: "#14171c",
  panel: "#15181d",
  chip: "#23272f",
  nd: "#2a2f37",
  ink: "#e8eaed",
  inkSoft: "#c5cad1",
  muted: "#9aa0a8",
  faint: "#686e76",
  dim: "#4f555d",
  accent: "#cdbb8e",
  accentInk: "#0e1013",
  editorial: "#bfa890",
  white: "#ffffff",
} as const;

// Perceptually-ordered, colorblind-safe data ramps — one per lens.
export const RAMPS: Record<LensId, string[]> = {
  // diverging RdBu → RdOr, anchored to the national IPC at the midpoint
  growth: ["#2c6fb0", "#5b96c4", "#9fb9c4", "#d8cdbc", "#dd9b6e", "#cf6a44", "#b03326"],
  rentals: ["#13354a", "#22576f", "#2f8f80", "#5fbf6a", "#c7e85a"], // viridis-ish
  foreign: ["#2a1a3d", "#4d2f6b", "#7a4f9e", "#a877c4", "#d9b6e6"], // single-hue purple
  access: ["#08293c", "#125f72", "#1f96a8", "#54c7cf", "#9fe6ea"], // cyan sequential
  drivers: ["#1a0a22", "#48156b", "#8c2981", "#cf4763", "#f3884e", "#f9d96a"], // magma narrative
};

// Party identity colors — desaturated, deliberately *separate* from the data
// ramps (a regional/political hue must never be read as a data value).
export const PARTY_COLOR: Record<Party, string> = {
  PLN: "#3a8f5a", // verde
  PUSC: "#3f6fb0", // azul
  PAC: "#d8b13a", // amarillo
  PPSD: "#3aa3b3", // turquesa
  PPSO: "#9a6cc0", // morado
  "—": "#62666d", // sin partido / periodo entrante
};

// "Sin dato" diagonal-hatch — generated once as a canvas image for MapLibre.
export const ND_HATCH = {
  base: COLORS.nd,
  stroke: "rgba(255,255,255,.16)",
  size: 6,
};

// National IPC anchor for the diverging growth lens (placeholder until the ETL
// writes the real BCCR/INEC series; documented in data_dictionary.md).
export const IPC_ANCHOR = 4.2;

// ± points around the IPC anchor mapped to the ends of the growth ramp.
// Used by both the normalizer (select.ts) and the legend (Legend.tsx) so the
// scale shown to the reader matches the scale actually painted.
export const GROWTH_SPAN = 6;

// Referential FX only. Never used to convert one currency series into the
// other — CRC and USD rents are stored and shown as separate series.
export const FX_USD_CRC = 525;
