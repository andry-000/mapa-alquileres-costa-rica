import type { Administration, Period } from "./types";
import { PARTY_COLOR } from "./tokens";

// Verified presidential dataset (1994–2030). Embedded per the brief
// ("embebé este dataset verificado"). Mirrored as public/data/presidencias.json.
export const ADMINISTRATIONS: Administration[] = [
  { nombre: "José María Figueres Olsen", inicio: 1994, fin: 1998, partido: "PLN" },
  { nombre: "Miguel Ángel Rodríguez", inicio: 1998, fin: 2002, partido: "PUSC" },
  { nombre: "Abel Pacheco", inicio: 2002, fin: 2006, partido: "PUSC" },
  { nombre: "Óscar Arias Sánchez", inicio: 2006, fin: 2010, partido: "PLN" },
  { nombre: "Laura Chinchilla Miranda", inicio: 2010, fin: 2014, partido: "PLN" },
  { nombre: "Luis Guillermo Solís", inicio: 2014, fin: 2018, partido: "PAC" },
  { nombre: "Carlos Alvarado Quesada", inicio: 2018, fin: 2022, partido: "PAC" },
  { nombre: "Rodrigo Chaves Robles", inicio: 2022, fin: 2026, partido: "PPSD" },
  { nombre: "Laura Fernández Delgado", inicio: 2026, fin: 2030, partido: "PPSO" },
];

/** Year of the rent series' first robust observation. Before it: "sin serie". */
export const ROBUST_RENT_FROM_YEAR = 2010;

/** Enrich the verified dataset with UI fields, marking the administration in
 *  office at `currentYear` as `current`. */
export function buildPeriods(
  admins: Administration[],
  currentYear: number,
): Period[] {
  return admins.map((a, index) => ({
    ...a,
    index,
    color: PARTY_COLOR[a.partido],
    current: a.inicio <= currentYear && currentYear < a.fin,
    years: `${a.inicio}–${a.fin}`,
  }));
}

/** Index of the current administration (or the last one if `year` is past it). */
export function currentPeriodIndex(periods: Period[]): number {
  const i = periods.findIndex((p) => p.current);
  return i >= 0 ? i : periods.length - 1;
}

/** A period's robust rent years (intersection of its term with the series). */
export function periodYears(p: Period): number[] {
  const start = Math.max(p.inicio, ROBUST_RENT_FROM_YEAR);
  const years: number[] = [];
  for (let y = start; y < p.fin; y++) years.push(y);
  return years;
}

/** True when an entire administration predates the robust rent series. */
export function periodHasNoSeries(p: Period): boolean {
  return p.fin <= ROBUST_RENT_FROM_YEAR;
}
