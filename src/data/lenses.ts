import type { LensId } from "./types";
import { RAMPS } from "./tokens";

export interface LensConfig {
  id: LensId;
  num: string;
  label: string;
  kind: string; // shown right-aligned in the switcher
  ramp: string[];
  unit: string;
  diverging: boolean;
  hasOverlay: boolean; // equipamiento toggle
  source: string; // cited in the detail card + header
  caveat: string; // jidoka: the limitation is always visible
}

export const LENSES: LensConfig[] = [
  {
    id: "growth",
    num: "1",
    label: "Crecimiento anual del alquiler",
    kind: "diverging",
    ramp: RAMPS.growth,
    unit: "% interanual",
    diverging: true,
    hasOverlay: false,
    source: "INEC · IPC subíndice de alquiler + ENAHO (renta efectiva)",
    caveat:
      "Renta de oferta ≠ renta efectiva (ENAHO). La coropleta usa la variación de oferta, anclada al IPC del periodo. Separá colón y dólar: las rentas en USD no se reajustan por ley.",
  },
  {
    id: "rentals",
    num: "2",
    label: "Propiedades en alquiler",
    kind: "secuencial",
    ramp: RAMPS.rentals,
    unit: "unidades",
    diverging: false,
    hasOverlay: false,
    source: "INEC · Censo de Vivienda (2011 distrital / 2022 cantonal)",
    caveat:
      "Conteo de unidades en alquiler + % alquilada vs. propia. El Censo 2022 publica a nivel cantón; 2011 a nivel distrito — no se interpola entre olas.",
  },
  {
    id: "foreign",
    num: "3",
    label: "Extranjeros vs nacionales",
    kind: "secuencial",
    ramp: RAMPS.foreign,
    unit: "% extranjeros",
    diverging: false,
    hasOverlay: false,
    source: "INEC · Censo de Población, ola 2000 / 2011 / 2022",
    caveat:
      "Dato por ola censal, no anual — no se interpola entre censos. No se georreferencia por debajo de la resolución censal disponible.",
  },
  {
    id: "access",
    num: "4",
    label: "Accesibilidad estratégica",
    kind: "índice 0–100",
    ramp: RAMPS.access,
    unit: "índice 0–100",
    diverging: false,
    hasOverlay: true,
    source: "SIGMEP (escuelas) · CCSS/Min. Salud · PROCOMER · INCOFER/ARESEP",
    caveat:
      "Índice compuesto de distancia al equipamiento más cercano (escuelas, salud, comercio, transporte), precomputado en CRTM05 (EPSG:5367). Overlay de puntos toggleable por tipo.",
  },
  {
    id: "drivers",
    num: "5",
    label: "Drivers / gentrificación",
    kind: "narrativa",
    ramp: RAMPS.drivers,
    unit: "índice de presión",
    diverging: false,
    hasOverlay: false,
    source: "ONT-Hacienda (plusvalía) · Inside Airbnb · flag zona turística",
    caveat:
      "Capa narrativa: combina valor de terreno por zona homogénea (proxy de plusvalía), densidad short-term de Airbnb y zona turística. El ícono cultural acompaña la cifra de desplazamiento — nunca la sustituye.",
  },
];

export const LENS_BY_ID: Record<LensId, LensConfig> = Object.fromEntries(
  LENSES.map((l) => [l.id, l]),
) as Record<LensId, LensConfig>;
