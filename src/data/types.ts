// ─────────────────────────────────────────────────────────────────────────
// Domain & data-artifact types. These TypeScript types are the *contract*
// between the Python ETL (etl/) and the front-end: every file the ETL writes
// to public/data/ must validate against the shapes below.
// ─────────────────────────────────────────────────────────────────────────

export type LensId = "growth" | "rentals" | "foreign" | "access" | "drivers";
export type Currency = "CRC" | "USD";
export type ViewLevel = "distrito" | "region";
export type RegionKey =
  | "central"
  | "chorotega"
  | "pacifico"
  | "brunca"
  | "caribe"
  | "norte";

export type Party = "PLN" | "PUSC" | "PAC" | "PPSD" | "PPSO" | "—";

/** Verified presidential dataset (public/data/presidencias.json). */
export interface Administration {
  nombre: string;
  inicio: number;
  fin: number;
  partido: Party;
}

/** A presidential period enriched for the UI (color, current flag, index). */
export interface Period extends Administration {
  index: number;
  color: string;
  current: boolean;
  years: string; // "2010–2014"
}

// ── Geometry (geoBoundaries ADM3, public/data/distritos.geojson) ───────────
export interface DistrictProps {
  shapeID: string;
  shapeName: string;
  shapeGroup?: string;
  shapeISO?: string;
  shapeType?: string;
  // Enriched by the ETL with the official join key + admin hierarchy.
  inecCode?: string | null;
  provincia?: string | null;
  canton?: string | null;
  region?: RegionKey | null;
}

// ── Common artifact envelope ───────────────────────────────────────────────
/**
 * Every metric artifact carries a _meta block so the UI can be honest about
 * provenance and state. `generated: null` => the ETL has not run yet and the
 * file is an empty placeholder (the map renders everything as "sin dato").
 * `synthetic: true` => values come from the opt-in demo seed, NOT real sources.
 */
export interface ArtifactMeta {
  generated: string | null; // ISO date, or null when pending
  synthetic: boolean;
  source: string;
  granularity: string;
  coverage: string;
  caveat: string;
  /** Rent series is only robust from this year on (pre => "sin serie"). */
  robustFromYear?: number;
  /** Census wave the figures belong to. */
  censusWave?: number | "2011-distrital/2022-cantonal";
}

// ── rent_panel.json ────────────────────────────────────────────────────────
export interface RentYearCell {
  offer: number | null; // renta de OFERTA (portales/scraping)
  effective: number | null; // renta EFECTIVA (ENAHO)
  growthPct: number | null; // crecimiento interanual de la renta de oferta
}
export interface RentDistrict {
  name: string;
  byCurrency: Partial<Record<Currency, Record<string, RentYearCell>>>;
}
export interface RentPanel {
  _meta: ArtifactMeta;
  districts: Record<string, RentDistrict>;
}

// ── tenencia.json ──────────────────────────────────────────────────────────
export interface TenenciaDistrict {
  rentedPct: number | null; // % alquilada
  ownedPct: number | null; // % propia
  rentedUnits: number | null; // conteo absoluto de unidades en alquiler
  wave: number | null; // 2011 (distrital) | 2022 (cantonal)
}
export interface Tenencia {
  _meta: ArtifactMeta;
  districts: Record<string, TenenciaDistrict>;
}

// ── nacionalidad.json ──────────────────────────────────────────────────────
export interface NacionalidadDistrict {
  foreignPct: number | null;
  wave: number | null; // 2000 | 2011 | 2022
}
export interface Nacionalidad {
  _meta: ArtifactMeta;
  districts: Record<string, NacionalidadDistrict>;
}

// ── accesibilidad.json ─────────────────────────────────────────────────────
export interface AccesibilidadDistrict {
  index: number | null; // índice compuesto 0–100
  distSchoolM: number | null;
  distHealthM: number | null;
  distCommerceM: number | null;
  distTransitM: number | null;
}
export interface Accesibilidad {
  _meta: ArtifactMeta;
  districts: Record<string, AccesibilidadDistrict>;
}

// ── drivers.json (gentrification narrative) ────────────────────────────────
export interface DriversDistrict {
  plusvalia: number | null; // proxy ONT (valor de terreno z. homogénea)
  airbnbDensity: number | null; // Inside Airbnb
  touristZone: boolean | null;
  displacement: number | null; // índice de presión de desplazamiento 0–100
  compositeIndex: number | null; // índice narrativo 0–100
}
export interface Drivers {
  _meta: ArtifactMeta;
  districts: Record<string, DriversDistrict>;
}

// ── equipamiento.geojson ───────────────────────────────────────────────────
export type EquipmentType = "escuela" | "salud" | "comercio" | "transporte";
export interface EquipmentProps {
  type: EquipmentType;
  name: string;
}

// ── Bundle handed to the UI ────────────────────────────────────────────────
export interface DataBundle {
  rent: RentPanel;
  tenencia: Tenencia;
  nacionalidad: Nacionalidad;
  accesibilidad: Accesibilidad;
  drivers: Drivers;
}

/** Per-district resolved value for the active lens + period + currency. */
export type ValueStatus = "ok" | "nodata" | "noseries";
export interface ResolvedValue {
  value: number | null;
  norm: number | null; // 0..1 position on the lens ramp
  status: ValueStatus;
  label: string; // formatted for display
}
