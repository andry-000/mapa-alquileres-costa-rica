import type { RegionKey } from "./types";

export interface RegionMeta {
  name: string;
  short: string;
  accent: string; // tenue, desaturado — separado de las rampas de datos
  /** Approx [lng, lat] for placing the region label on the map. */
  labelAt: [number, number];
}

// 6 regiones de planificación (MIDEPLAN). Accents mirror the design system.
export const REGIONS: Record<RegionKey, RegionMeta> = {
  central: { name: "Central", short: "Central", accent: "#7d8aa6", labelAt: [-84.05, 9.98] },
  chorotega: { name: "Chorotega · Guanacaste", short: "Chorotega", accent: "#b39e6e", labelAt: [-85.45, 10.4] },
  pacifico: { name: "Pacífico Central", short: "Pacífico C.", accent: "#5f9690", labelAt: [-84.62, 9.7] },
  brunca: { name: "Brunca · Pacífico Sur", short: "Brunca", accent: "#7d9168", labelAt: [-83.2, 8.92] },
  caribe: { name: "Huetar Caribe · Limón", short: "H. Caribe", accent: "#b08470", labelAt: [-83.2, 10.02] },
  norte: { name: "Huetar Norte", short: "H. Norte", accent: "#86997e", labelAt: [-84.4, 10.62] },
};

export const REGION_KEYS = Object.keys(REGIONS) as RegionKey[];

/**
 * PROVISIONAL region classification by district centroid. This is a coarse
 * geographic heuristic used only so the app is meaningful out of the box; it
 * WILL misclassify districts near region borders. The authoritative mapping is
 * the official cantón → región table applied by etl/00_geometry.py, which
 * overwrites `properties.region` with the real value. Do not treat this as
 * source-of-truth.
 */
export function provisionalRegion(lng: number, lat: number): RegionKey {
  if (lng > -83.55) return "caribe";
  if (lat < 9.45) return "brunca";
  if (lng < -85.0) return "chorotega";
  if (lat > 10.3) return "norte";
  if (lng < -84.3) return "pacifico";
  return "central";
}
