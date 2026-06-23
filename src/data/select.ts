// Selectors: turn the loaded artifacts + UI state into per-district values.
// All of this degrades honestly: when the ETL has not run, every district
// resolves to "nodata" (or "noseries" for pre-2010 growth) and nothing is
// ever invented or back-filled with zero.
import type {
  Currency,
  DataBundle,
  LensId,
  Period,
  ResolvedValue,
  ValueStatus,
} from "./types";
import { IPC_ANCHOR, GROWTH_SPAN } from "./tokens";
import { periodHasNoSeries, periodYears } from "./presidencias";

interface RawResult {
  value: number | null;
  status: ValueStatus;
}

function latestRentGrowth(
  bundle: DataBundle,
  distId: string,
  currency: Currency,
  years: number[],
): number | null {
  const d = bundle.rent.districts[distId];
  if (!d) return null;
  const byCur = d.byCurrency[currency];
  if (!byCur) return null;
  for (let i = years.length - 1; i >= 0; i--) {
    const cell = byCur[String(years[i])];
    if (cell && cell.growthPct != null) return cell.growthPct;
  }
  return null;
}

/** Latest rent cell (offer/effective) within a period, for the detail card. */
export function rentForDisplay(
  bundle: DataBundle,
  distId: string,
  period: Period,
  currency: Currency,
): { offer: number | null; effective: number | null } {
  const d = bundle.rent.districts[distId];
  if (!d) return { offer: null, effective: null };
  const byCur = d.byCurrency[currency];
  if (!byCur) return { offer: null, effective: null };
  const years = periodYears(period);
  for (let i = years.length - 1; i >= 0; i--) {
    const cell = byCur[String(years[i])];
    if (cell && (cell.offer != null || cell.effective != null)) {
      return { offer: cell.offer, effective: cell.effective };
    }
  }
  return { offer: null, effective: null };
}

function resolveRaw(
  bundle: DataBundle,
  lensId: LensId,
  distId: string,
  period: Period,
  currency: Currency,
): RawResult {
  switch (lensId) {
    case "growth": {
      if (periodHasNoSeries(period)) return { value: null, status: "noseries" };
      const v = latestRentGrowth(bundle, distId, currency, periodYears(period));
      return v == null ? { value: null, status: "nodata" } : { value: v, status: "ok" };
    }
    case "rentals": {
      const v = bundle.tenencia.districts[distId]?.rentedUnits ?? null;
      return v == null ? { value: null, status: "nodata" } : { value: v, status: "ok" };
    }
    case "foreign": {
      const v = bundle.nacionalidad.districts[distId]?.foreignPct ?? null;
      return v == null ? { value: null, status: "nodata" } : { value: v, status: "ok" };
    }
    case "access": {
      const v = bundle.accesibilidad.districts[distId]?.index ?? null;
      return v == null ? { value: null, status: "nodata" } : { value: v, status: "ok" };
    }
    case "drivers": {
      const v = bundle.drivers.districts[distId]?.compositeIndex ?? null;
      return v == null ? { value: null, status: "nodata" } : { value: v, status: "ok" };
    }
  }
}

/** Data domain [min,max] for sequential lenses; null for fixed-scale lenses. */
export function lensDomain(
  bundle: DataBundle,
  lensId: LensId,
  distIds: string[],
  period: Period,
  currency: Currency,
): [number, number] | null {
  if (lensId === "growth") return null; // diverging, fixed around IPC
  if (lensId === "access" || lensId === "drivers") return [0, 100]; // index scales
  let min = Infinity;
  let max = -Infinity;
  let has = false;
  for (const id of distIds) {
    const r = resolveRaw(bundle, lensId, id, period, currency);
    if (r.status === "ok" && r.value != null) {
      has = true;
      if (r.value < min) min = r.value;
      if (r.value > max) max = r.value;
    }
  }
  return has ? [min, max] : null;
}

function normalize(
  lensId: LensId,
  value: number | null,
  domain: [number, number] | null,
): number | null {
  if (value == null) return null;
  if (lensId === "growth") return (value - IPC_ANCHOR) / (2 * GROWTH_SPAN) + 0.5;
  if (lensId === "access" || lensId === "drivers") return value / 100;
  if (!domain) return null;
  const [mn, mx] = domain;
  if (mx <= mn) return 0.5;
  return (value - mn) / (mx - mn);
}

export function formatValue(lensId: LensId, value: number | null): string {
  if (value == null) return "—";
  switch (lensId) {
    case "growth":
      return (value >= 0 ? "+" : "") + value.toFixed(1) + "%";
    case "rentals":
      return Math.round(value).toLocaleString("es-CR");
    case "foreign":
      return value.toFixed(1) + "%";
    case "access":
    case "drivers":
      return String(Math.round(value));
  }
}

export function resolveValue(
  bundle: DataBundle,
  lensId: LensId,
  distId: string,
  period: Period,
  currency: Currency,
  domain: [number, number] | null,
): ResolvedValue {
  const raw = resolveRaw(bundle, lensId, distId, period, currency);
  const norm = raw.status === "ok" ? normalize(lensId, raw.value, domain) : null;
  const label =
    raw.status === "noseries" ? "sin serie" : formatValue(lensId, raw.value);
  return { value: raw.value, norm, status: raw.status, label };
}

export function formatRent(amount: number | null, currency: Currency): string {
  // `amount` is already expressed in `currency` (rent_panel stores a separate
  // series per currency). We only FORMAT — never convert — so CRC and USD stay
  // independent series and the referential FX is not silently applied.
  if (amount == null) return "—";
  if (currency === "USD") return "$" + Math.round(amount).toLocaleString("en-US");
  return "₡" + Math.round(amount).toLocaleString("es-CR");
}

// ── artifact-state helpers ─────────────────────────────────────────────────
export function bundleIsPending(bundle: DataBundle): boolean {
  return [
    bundle.rent._meta,
    bundle.tenencia._meta,
    bundle.nacionalidad._meta,
    bundle.accesibilidad._meta,
    bundle.drivers._meta,
  ].every((m) => m.generated == null);
}

export function bundleIsSynthetic(bundle: DataBundle): boolean {
  return [
    bundle.rent._meta,
    bundle.tenencia._meta,
    bundle.nacionalidad._meta,
    bundle.accesibilidad._meta,
    bundle.drivers._meta,
  ].some((m) => m.synthetic);
}
