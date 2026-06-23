// Regional iconography — single-weight geometric line glyphs, ported verbatim
// from the design handoff (cr-icons.js). Each value is the inner markup of an
//   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
//        stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
// Max 3 per region: fauna / flora / cultura. Monochrome, tinted by region.
//
// Icon ethics (enforced by the components): icons appear ONLY in the legend,
// the region label (zoom-out) and the detail-card header — never painted over
// a choropleth value or a strip segment.
import type { RegionKey } from "./types";

export type IconDomain = "fauna" | "flora" | "cultura";

export interface RegionIconSet {
  faunaLabel: string;
  floraLabel: string;
  culturaLabel: string;
  fauna: string;
  flora: string;
  cultura: string;
}

export const CR_ICONS: Record<RegionKey, RegionIconSet> = {
  central: {
    faunaLabel: "Yigüirro",
    floraLabel: "Café · guaria morada",
    culturaLabel: "Boyeo y carreta",
    fauna:
      '<circle cx="8.5" cy="8" r="2.3"/><path d="M10.7 8.9c3.4-.5 7 1.4 8.3-.4-.6 3.6-3.8 5.2-6.7 4.7-1 3.2-2.9 4.6-4.8 4.8 1.4-1.7 1.1-3.6 1-4.7-1.9-.9-2.6-3.4-1.3-4.8"/><path d="M6.6 7.4 4 8.1"/><circle cx="7.7" cy="7.6" r=".5" fill="currentColor" stroke="none"/><path d="M9 18.2v2.4M11.4 17.9v2.7"/>',
    flora:
      '<path d="M12 4v16"/><path d="M12 9c-1.8-.2-3.4-1.2-4-3 2-.3 3.6.6 4 3"/><path d="M12 9c1.8-.2 3.4-1.2 4-3-2-.3-3.6.6-4 3"/><circle cx="8.6" cy="15.3" r="2"/><circle cx="15.4" cy="15.3" r="2"/>',
    cultura:
      '<circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="2"/><path d="M12 3.8v6.2M12 14v6.2M3.8 12h6.2M14 12h6.2M6.2 6.2 10.6 10.6M13.4 13.4 17.8 17.8M17.8 6.2 13.4 10.6M6.2 17.8 10.6 13.4"/>',
  },
  chorotega: {
    faunaLabel: "Venado cola blanca",
    floraLabel: "Árbol de Guanacaste",
    culturaLabel: "Marimba · sabanero",
    fauna:
      '<path d="M9.5 21c-1.2-2-1.5-4.2-1.2-6.3.2-1.4 1.6-2.4 3.7-2.4s3.5 1 3.7 2.4c.3 2.1 0 4.3-1.2 6.3"/><path d="M9.6 12.6 8.3 9.2 6 9.8M8.3 9.2 7.4 6.3M14.4 12.6l1.3-3.4 2.3.6M15.7 9.2l.9-2.9"/><circle cx="10.6" cy="16" r=".5" fill="currentColor" stroke="none"/><circle cx="13.4" cy="16" r=".5" fill="currentColor" stroke="none"/>',
    flora:
      '<path d="M3 9.5c2.4-3 6.5-3.6 9-3.6s6.6.6 9 3.6c-1.5 1.4-4 1.9-5.6 1.6"/><path d="M12 11v9"/><path d="M9 20h6"/><path d="M8.4 11.1C6.8 11.4 4.5 11 3 9.5"/>',
    cultura:
      '<path d="M4 8h16l-2 9H6Z"/><path d="M7.5 8v9M10.3 8v9M13.1 8v9M15.9 8v9"/><path d="M8 20.5 6.5 17M16 20.5 17.5 17"/><circle cx="8" cy="21" r=".6" fill="currentColor" stroke="none"/><circle cx="16" cy="21" r=".6" fill="currentColor" stroke="none"/>',
  },
  pacifico: {
    faunaLabel: "Lapa roja",
    floraLabel: "Manglar · almendro de playa",
    culturaLabel: "Pesca artesanal",
    fauna:
      '<path d="M9 6.5c-2.4.6-4 2.8-4 5.4 0 2 1 3.6 2.4 4.4"/><path d="M9 6.5c1.8-.4 3.6.4 4.4 2"/><path d="M13.4 8.5c1.4 0 2.4.9 2.4 2.1 0 1-.8 1.7-1.9 1.9"/><path d="M13.9 12.5c-.4 3-1.2 6-5.5 8.2"/><path d="M8.4 16.3c1.4 1 3 1.2 4.4.6"/><path d="M16 9.4 18.6 8"/><circle cx="10.6" cy="9.2" r=".5" fill="currentColor" stroke="none"/>',
    flora:
      '<path d="M5 9c1.8-2.4 5-3 7-3s5.2.6 7 3c-1.6 1.3-4 1.7-5.5 1.4"/><path d="M12 10.4v4M9 20l1.4-5.6M15 20l-1.4-5.6M7 20l1.8-4M17 20l-1.8-4"/>',
    cultura:
      '<path d="M3 12c2.5-3.6 7-5 11-5 1.6 0 3 .3 4.2.8-1 1.6-1 6.8 0 8.4C17 17.7 15.6 18 14 18 10 18 5.5 16 3 12Z"/><path d="M18.2 7.8 21 5.8v12.4l-2.8-2"/><circle cx="7" cy="11" r=".6" fill="currentColor" stroke="none"/>',
  },
  brunca: {
    faunaLabel: "Danta (tapir)",
    floraLabel: "Bosque lluvioso",
    culturaLabel: "Esferas Diquís · Boruca",
    fauna:
      '<path d="M6.5 16c-1.2-1-1.8-2.6-1.5-4.2C5.4 9 7.8 7.5 11 7.5c2.6 0 5 .8 6.4 2.4"/><path d="M17.4 9.9c1.4.4 2.4 1.2 2.4 2.1 0 1.2-1.4 1.6-2.6 1.5"/><path d="M17.2 13.5c-.3 1.6-1.4 2.6-2.8 2.8"/><path d="M6.5 16v3.5M9.5 17v3.2M14.4 16.3v3.2M11.5 17.2v3"/><circle cx="9.4" cy="10.4" r=".5" fill="currentColor" stroke="none"/>',
    flora:
      '<path d="M12 21V6"/><path d="M12 7.5C12 5 13.4 3.5 15.5 3.5 15.5 6 14 7.5 12 7.5Z"/><path d="M12 11c1.8 0 3.2-1.3 3.6-3.4M12 11c-1.8 0-3.2-1.3-3.6-3.4M12 15c2 0 3.6-1.4 4-3.6M12 15c-2 0-3.6-1.4-4-3.6M12 18.6c2.2 0 4-1.6 4.4-4M12 18.6c-2.2 0-4-1.6-4.4-4"/>',
    cultura:
      '<circle cx="12" cy="10.5" r="6.2"/><path d="M4 18.5h16"/><path d="M7.4 6.4C9 5 11 4.8 12.6 5.6"/>',
  },
  caribe: {
    faunaLabel: "Perezoso · tortuga",
    floraLabel: "Cacao · banano",
    culturaLabel: "Afrocaribeña · calypso",
    fauna:
      '<path d="M3 6h18"/><path d="M8 6.2c-.4 1.6.6 2.8 2 3M16 6.2c.4 1.6-.6 2.8-2 3"/><path d="M10 9c-1.8.4-3 2-3 4 0 2.6 2.2 4.6 5 4.6s5-2 5-4.6c0-2-1.2-3.6-3-4"/><circle cx="10.6" cy="13.6" r=".5" fill="currentColor" stroke="none"/><circle cx="13.4" cy="13.6" r=".5" fill="currentColor" stroke="none"/><path d="M11 15.4c.7.5 1.3.5 2 0"/>',
    flora:
      '<path d="M9 4.2c3.4-.8 7 1.4 7.6 5.6.6 4.4-2 9-6.2 10-3-1.6-4.8-5-4.4-8.8C6.4 7.4 7.4 5 9 4.2Z"/><path d="M11.4 4.4C11 8.4 10.4 15 11 19.6M8.2 6.6C8.5 10 8.8 15 8.5 18M14.6 6.6c-.3 3.4-.4 8-.1 10.8"/>',
    cultura:
      '<path d="M9 18.5V5.5l9-2v11"/><ellipse cx="6.5" cy="18.5" rx="2.6" ry="2"/><ellipse cx="15.5" cy="16.5" rx="2.6" ry="2"/><path d="M9 9.5 18 7.5"/>',
  },
  norte: {
    faunaLabel: "Rana roja venenosa",
    floraLabel: "Piña · Arenal",
    culturaLabel: "Agricultura · Fortuna",
    fauna:
      '<path d="M12 16.5c-2.6 0-4-1.8-4-4.2 0-2.8 1.8-5 4-5s4 2.2 4 5c0 2.4-1.4 4.2-4 4.2Z"/><circle cx="9.6" cy="9.4" r="1.4"/><circle cx="14.4" cy="9.4" r="1.4"/><path d="M8.2 14.5C6 15 4.5 16.6 4 19M15.8 14.5c2.2.5 3.7 2.1 4.2 4.5M9.8 16.3 8.5 20M14.2 16.3 15.5 20"/>',
    flora:
      '<path d="M8 9.5c0-1 1.8-1.8 4-1.8s4 .8 4 1.8c0 5-1.2 10-4 11.2C9.2 19.5 8 14.5 8 9.5Z"/><path d="M12 7.7c0-2 1-3.4 3-4-.3 1.8-1.2 3.2-3 4M12 7.7c0-2-1-3.4-3-4 .3 1.8 1.2 3.2 3 4M12 7.7V4"/><path d="M9.6 11 12 13.4 14.4 11M9.6 14.4 12 16.8 14.4 14.4"/>',
    cultura:
      '<path d="M12 21V8"/><path d="M12 8c-1.6-1-2.4-2.8-2.2-4.8C11.4 4 12 5.8 12 8M12 8c1.6-1 2.4-2.8 2.2-4.8C12.6 4 12 5.8 12 8"/><path d="M12 12.5c-1.6-1-2.4-2.6-2.2-4.4 1.6.8 2.2 2.4 2.2 4.4M12 12.5c1.6-1 2.4-2.6 2.2-4.4-1.6.8-2.2 2.4-2.2 4.4"/><path d="M12 17c-1.6-1-2.4-2.6-2.2-4.4 1.6.8 2.2 2.4 2.2 4.4M12 17c1.6-1 2.4-2.6 2.2-4.4-1.6.8-2.2 2.4-2.2 4.4"/>',
  },
};
