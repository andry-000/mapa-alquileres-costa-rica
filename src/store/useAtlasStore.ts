import { create } from "zustand";
import type { Currency, LensId, ViewLevel } from "../data/types";
import {
  ADMINISTRATIONS,
  buildPeriods,
  currentPeriodIndex,
} from "../data/presidencias";

// Default the strip to the administration in office today.
const CURRENT_YEAR = new Date().getFullYear();
const DEFAULT_PERIOD = currentPeriodIndex(
  buildPeriods(ADMINISTRATIONS, CURRENT_YEAR),
);

const prefersReducedMotion =
  typeof matchMedia !== "undefined" &&
  matchMedia("(prefers-reduced-motion: reduce)").matches;

export interface AtlasState {
  lens: LensId;
  period: number; // index into ADMINISTRATIONS
  currency: Currency;
  view: ViewLevel;
  hoverId: string | null;
  locks: string[]; // pinned districts, max 2 (compare)
  reducedMotion: boolean;

  setLens: (lens: LensId) => void;
  setPeriod: (period: number) => void;
  setCurrency: (currency: Currency) => void;
  setView: (view: ViewLevel) => void;
  setHover: (id: string | null) => void;
  toggleLock: (id: string) => void;
  clearLocks: () => void;
}

export const useAtlasStore = create<AtlasState>((set) => ({
  lens: "growth",
  period: DEFAULT_PERIOD,
  currency: "CRC",
  view: "distrito",
  hoverId: null,
  locks: [],
  reducedMotion: prefersReducedMotion,

  setLens: (lens) => set({ lens }),
  setPeriod: (period) => set({ period }),
  setCurrency: (currency) => set({ currency }),
  setView: (view) => set({ view }),
  setHover: (hoverId) => set({ hoverId }),
  toggleLock: (id) =>
    set((s) => {
      const locks = s.locks.slice();
      const at = locks.indexOf(id);
      if (at >= 0) {
        locks.splice(at, 1);
      } else {
        locks.push(id);
        if (locks.length > 2) locks.shift(); // keep at most two for comparison
      }
      return { locks };
    }),
  clearLocks: () => set({ locks: [] }),
}));
