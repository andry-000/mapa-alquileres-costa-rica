"""04 · Accesibilidad → public/data/accesibilidad.json

Distancia del centroide de cada distrito al equipamiento más cercano por tipo,
con geopandas.sjoin_nearest reproyectando a CRTM05 (EPSG:5367) para que las
distancias sean métricas. Índice compuesto 0–100 (más cerca = mayor).

Entrada: public/data/distritos.geojson (paso 00) + equipamiento.geojson (paso 03).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import geopandas as gpd  # noqa: E402
import numpy as np  # noqa: E402
import config  # noqa: E402
from lib.util import meta, require_input, write_json  # noqa: E402

TYPES = ["escuela", "salud", "comercio", "transporte"]


def main() -> None:
    dist = gpd.read_file(require_input(config.OUT / "distritos.geojson")).to_crs(config.CRS_CRTM05)
    equip = gpd.read_file(require_input(config.OUT / "equipamiento.geojson"))
    if equip.empty:
        raise SystemExit("  ! equipamiento.geojson vacío — corré 03_equipment.py primero")
    equip = equip.to_crs(config.CRS_CRTM05)

    cent = dist[["shapeID"]].copy()
    cent["geometry"] = dist.geometry.centroid
    cent = gpd.GeoDataFrame(cent, geometry="geometry", crs=config.CRS_CRTM05)

    out = cent[["shapeID"]].copy()
    for t in TYPES:
        sub = equip[equip["type"] == t][["geometry"]]
        if sub.empty:
            out[f"d_{t}"] = np.nan
            continue
        nn = gpd.sjoin_nearest(cent, sub, distance_col="dist")
        out = out.merge(
            nn.groupby("shapeID")["dist"].min().rename(f"d_{t}"), on="shapeID", how="left"
        )

    score = np.zeros(len(out))
    count = np.zeros(len(out))
    for t in TYPES:
        col = f"d_{t}"
        if col not in out.columns:
            continue
        d = out[col].astype(float)
        if d.notna().sum() == 0:
            continue
        mn, mx = d.min(), d.max()
        norm = 1 - (d - mn) / (mx - mn if mx > mn else 1)  # closer => higher
        score += norm.fillna(0).to_numpy()
        count += d.notna().astype(int).to_numpy()
    index = np.where(count > 0, score / np.where(count == 0, 1, count) * 100, np.nan)

    def _m(row, col):
        v = row.get(col)
        return None if v is None or (isinstance(v, float) and np.isnan(v)) else round(float(v))

    districts = {}
    for i, row in out.reset_index(drop=True).iterrows():
        districts[str(row["shapeID"])] = {
            "index": None if np.isnan(index[i]) else round(float(index[i]), 1),
            "distSchoolM": _m(row, "d_escuela"),
            "distHealthM": _m(row, "d_salud"),
            "distCommerceM": _m(row, "d_comercio"),
            "distTransitM": _m(row, "d_transporte"),
        }

    write_json(
        config.OUT / "accesibilidad.json",
        {
            "_meta": meta(
                source="SIGMEP · CCSS/Min. Salud · DEE-INEC/PROCOMER · INCOFER/ARESEP",
                granularity="distrito",
                coverage="snapshot de equipamiento",
                caveat="Distancias en CRTM05 (EPSG:5367); índice compuesto 0–100 (más cerca = mayor).",
            ),
            "districts": districts,
        },
    )
    print(f"  → {len(districts)} distritos")


if __name__ == "__main__":
    print("04 · accesibilidad")
    main()
