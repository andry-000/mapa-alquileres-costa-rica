// Fetch + parse + enrich the data artifacts shipped in public/data/.
import type {
  Accesibilidad,
  DataBundle,
  Drivers,
  Nacionalidad,
  RegionKey,
  RentPanel,
  Tenencia,
  DistrictProps,
} from "./types";
import { provisionalRegion } from "./regions";

// Minimal GeoJSON shapes (avoids a @types/geojson dependency).
export interface DistrictFeature {
  type: "Feature";
  id?: string | number;
  properties: DistrictProps;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][] | number[][][][];
  };
}
export interface DistrictFC {
  type: "FeatureCollection";
  features: DistrictFeature[];
}

export interface EquipmentFC {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: { type: string; name: string };
    geometry: { type: "Point"; coordinates: [number, number] };
  }>;
}

export interface DistrictInfo {
  id: string;
  name: string;
  region: RegionKey;
  regionProvisional: boolean; // true until the ETL writes the authoritative region
  lng: number;
  lat: number;
}

const base = import.meta.env.BASE_URL;

async function fetchJSON<T>(rel: string): Promise<T> {
  const r = await fetch(`${base}data/${rel}`);
  if (!r.ok) throw new Error(`No se pudo cargar ${rel} (HTTP ${r.status})`);
  return (await r.json()) as T;
}

/** Rough centroid (mean of all coordinate pairs) — enough for labels + the
 *  provisional region bucket. The ETL replaces region with the official value. */
function meanCentroid(geom: DistrictFeature["geometry"]): [number, number] {
  let sx = 0;
  let sy = 0;
  let n = 0;
  const walk = (arr: unknown): void => {
    if (
      Array.isArray(arr) &&
      arr.length >= 2 &&
      typeof arr[0] === "number" &&
      typeof arr[1] === "number"
    ) {
      sx += arr[0];
      sy += arr[1];
      n += 1;
      return;
    }
    if (Array.isArray(arr)) arr.forEach(walk);
  };
  walk(geom.coordinates);
  return n ? [sx / n, sy / n] : [-84, 9.9];
}

export interface LoadedAtlas {
  geojson: DistrictFC;
  districts: DistrictInfo[];
  byId: Map<string, DistrictInfo>;
  bundle: DataBundle;
  equipment: EquipmentFC;
}

export async function loadAtlas(): Promise<LoadedAtlas> {
  const [geojson, rent, tenencia, nacionalidad, accesibilidad, drivers, equipment] =
    await Promise.all([
      fetchJSON<DistrictFC>("distritos.geojson"),
      fetchJSON<RentPanel>("rent_panel.json"),
      fetchJSON<Tenencia>("tenencia.json"),
      fetchJSON<Nacionalidad>("nacionalidad.json"),
      fetchJSON<Accesibilidad>("accesibilidad.json"),
      fetchJSON<Drivers>("drivers.json"),
      fetchJSON<EquipmentFC>("equipamiento.geojson"),
    ]);

  const districts: DistrictInfo[] = [];
  const byId = new Map<string, DistrictInfo>();

  for (const f of geojson.features) {
    const id = String(f.properties.shapeID);
    const [lng, lat] = meanCentroid(f.geometry);
    const authoritative = f.properties.region ?? null;
    const region: RegionKey = authoritative ?? provisionalRegion(lng, lat);
    f.properties.region = region; // mirror onto the feature for map styling
    f.id = id; // belt-and-braces alongside promoteId
    const info: DistrictInfo = {
      id,
      name: f.properties.shapeName,
      region,
      regionProvisional: authoritative == null,
      lng,
      lat,
    };
    districts.push(info);
    byId.set(id, info);
  }

  const bundle: DataBundle = { rent, tenencia, nacionalidad, accesibilidad, drivers };
  return { geojson, districts, byId, bundle, equipment };
}
