import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type {
  StyleSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
  CircleLayerSpecification,
  MapGeoJSONFeature,
} from "maplibre-gl";
import { COLORS } from "../data/tokens";
import { REGIONS, REGION_KEYS } from "../data/regions";
import { CR_ICONS, type IconDomain } from "../data/icons";
import { useAtlasStore } from "../store/useAtlasStore";
import type { DistrictFC, EquipmentFC } from "../data/loaders";
import type { LensId, RegionKey, ViewLevel } from "../data/types";

const SRC = "distritos";
const EQUIP = "equipamiento";
const CR_BOUNDS: [[number, number], [number, number]] = [
  [-86.05, 7.95],
  [-82.45, 11.3],
];

const BASE_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [{ id: "bg", type: "background", paint: { "background-color": COLORS.bg } }],
};

/** 8×8 diagonal-hatch tile for the "sin dato" pattern. */
function makeHatch(): ImageData {
  const s = 8;
  const c = document.createElement("canvas");
  c.width = s;
  c.height = s;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = COLORS.nd;
  ctx.fillRect(0, 0, s, s);
  ctx.strokeStyle = "rgba(255,255,255,.18)";
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-2, 2);
  ctx.lineTo(2, -2);
  ctx.moveTo(0, s);
  ctx.lineTo(s, 0);
  ctx.moveTo(s - 2, s + 2);
  ctx.lineTo(s + 2, s - 2);
  ctx.stroke();
  return ctx.getImageData(0, 0, s, s);
}

const DOMAINS: IconDomain[] = ["fauna", "flora", "cultura"];

function buildRegionLabel(rk: RegionKey): HTMLDivElement {
  const r = REGIONS[rk];
  const ic = CR_ICONS[rk];
  const el = document.createElement("div");
  el.style.cssText = "pointer-events:none";
  const box = document.createElement("div");
  box.style.cssText =
    "background:rgba(14,16,19,.85);border:1px solid rgba(255,255,255,.12);border-radius:7px;padding:5px 9px;display:flex;flex-direction:column;align-items:center;gap:4px";
  const name = document.createElement("div");
  name.textContent = r.short;
  name.style.cssText = "color:#e8eaed;font:600 11.5px Archivo,system-ui,sans-serif";
  const icons = document.createElement("div");
  icons.style.cssText = "display:flex;gap:8px";
  icons.innerHTML = DOMAINS.map(
    (d) =>
      `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${r.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ic[d]}</svg>`,
  ).join("");
  box.appendChild(name);
  box.appendChild(icons);
  el.appendChild(box);
  return el;
}

interface Props {
  geojson: DistrictFC;
  equipment: EquipmentFC;
  colorById: Map<string, string | null>;
  lens: LensId;
  view: ViewLevel;
  footnote: string;
}

export function MapView({ geojson, equipment, colorById, lens, view, footnote }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hoverRef = useRef<string | null>(null);
  const prevLocksRef = useRef<string[]>([]);
  const colorRef = useRef(colorById);
  colorRef.current = colorById;
  const [ready, setReady] = useState(false);

  const setHover = useAtlasStore((s) => s.setHover);
  const toggleLock = useAtlasStore((s) => s.toggleLock);
  const locks = useAtlasStore((s) => s.locks);

  // ── init map once ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: BASE_STYLE,
      bounds: CR_BOUNDS,
      fitBoundsOptions: { padding: 24 },
      attributionControl: false,
      dragRotate: false,
      pitchWithRotate: false,
      maxZoom: 11,
      minZoom: 5,
    });
    mapRef.current = map;
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "Límites: geoBoundaries (CC BY 4.0)",
      }),
    );
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.touchZoomRotate.disableRotation();

    map.on("load", () => {
      if (!map.hasImage("nd-hatch")) map.addImage("nd-hatch", makeHatch());
      map.addSource(SRC, {
        type: "geojson",
        data: geojson as unknown as GeoJSON.FeatureCollection,
        promoteId: "shapeID",
      });
      map.addSource(EQUIP, {
        type: "geojson",
        data: equipment as unknown as GeoJSON.FeatureCollection,
      });

      const fill: FillLayerSpecification = {
        id: "districts-fill",
        type: "fill",
        source: SRC,
        paint: {
          "fill-color": ["coalesce", ["feature-state", "color"], COLORS.surface],
          "fill-opacity": 1,
        },
      };
      const hatch: FillLayerSpecification = {
        id: "districts-nd",
        type: "fill",
        source: SRC,
        paint: {
          "fill-pattern": "nd-hatch",
          "fill-opacity": ["case", ["boolean", ["feature-state", "nd"], false], 1, 0],
        },
      };
      const line: LineLayerSpecification = {
        id: "districts-line",
        type: "line",
        source: SRC,
        paint: {
          "line-color": [
            "case",
            ["boolean", ["feature-state", "lock"], false],
            COLORS.accent,
            ["boolean", ["feature-state", "hover"], false],
            COLORS.white,
            "rgba(14,16,19,.65)",
          ],
          "line-width": [
            "case",
            ["boolean", ["feature-state", "lock"], false],
            2.2,
            ["boolean", ["feature-state", "hover"], false],
            1.6,
            0.5,
          ],
        },
      };
      const equipLayer: CircleLayerSpecification = {
        id: "equip-circle",
        type: "circle",
        source: EQUIP,
        layout: { visibility: lens === "access" ? "visible" : "none" },
        paint: {
          "circle-radius": 3.6,
          "circle-color": "rgba(205,187,142,.15)",
          "circle-stroke-color": COLORS.accent,
          "circle-stroke-width": 1.5,
        },
      };
      map.addLayer(fill);
      map.addLayer(hatch);
      map.addLayer(line);
      map.addLayer(equipLayer);

      map.on("mousemove", "districts-fill", (e) => {
        const f = e.features?.[0] as MapGeoJSONFeature | undefined;
        const id = f?.id != null ? String(f.id) : null;
        if (id === hoverRef.current) return;
        if (hoverRef.current)
          map.setFeatureState({ source: SRC, id: hoverRef.current }, { hover: false });
        if (id) map.setFeatureState({ source: SRC, id }, { hover: true });
        hoverRef.current = id;
        setHover(id);
        map.getCanvas().style.cursor = id ? "pointer" : "";
      });
      map.on("mouseleave", "districts-fill", () => {
        if (hoverRef.current)
          map.setFeatureState({ source: SRC, id: hoverRef.current }, { hover: false });
        hoverRef.current = null;
        setHover(null);
        map.getCanvas().style.cursor = "";
      });
      map.on("click", "districts-fill", (e) => {
        const f = e.features?.[0] as MapGeoJSONFeature | undefined;
        if (f?.id != null) toggleLock(String(f.id));
      });

      // initial paint
      colorRef.current.forEach((color, id) => {
        map.setFeatureState({ source: SRC, id }, { color: color ?? COLORS.nd, nd: color == null });
      });
      setReady(true);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
      prevLocksRef.current = [];
      hoverRef.current = null;
      setReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── recolor on lens / period / currency / view / data change ─────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    colorById.forEach((color, id) => {
      map.setFeatureState({ source: SRC, id }, { color: color ?? COLORS.nd, nd: color == null });
    });
  }, [colorById, ready]);

  // ── sync locked outlines from the store ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    prevLocksRef.current.forEach((id) => {
      if (!locks.includes(id)) map.setFeatureState({ source: SRC, id }, { lock: false });
    });
    locks.forEach((id) => map.setFeatureState({ source: SRC, id }, { lock: true }));
    prevLocksRef.current = locks.slice();
  }, [locks, ready]);

  // ── equipment overlay visibility ─────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !map.getLayer("equip-circle")) return;
    map.setLayoutProperty("equip-circle", "visibility", lens === "access" ? "visible" : "none");
  }, [lens, ready]);

  // ── region labels (only in region view) ──────────────────────────────────
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    if (view === "region") {
      REGION_KEYS.forEach((rk) => {
        const marker = new maplibregl.Marker({ element: buildRegionLabel(rk) })
          .setLngLat(REGIONS[rk].labelAt)
          .addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [view, ready]);

  return (
    <div className="relative min-h-0 flex-1">
      <div ref={containerRef} className="absolute inset-0" aria-label="Mapa de distritos de Costa Rica" role="application" />
      <div className="pointer-events-none absolute bottom-3.5 left-5 max-w-[300px] text-[10.5px] leading-relaxed text-dim">
        {footnote}
      </div>
    </div>
  );
}
