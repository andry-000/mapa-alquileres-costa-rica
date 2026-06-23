"""03 · Equipamiento → public/data/equipamiento.geojson

Entrada (ver input/SOURCES.md):
  input/equipamiento_points.csv  columnas: type, name, lng, lat
  type ∈ {escuela, salud, comercio, transporte}

Fuentes: SIGMEP (escuelas, REST/ArcGIS) · CCSS/Min. Salud (EBAIS/hospitales) ·
DEE-INEC/PROCOMER (comercio/zonas francas) · INCOFER/ARESEP (transporte).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402
import config  # noqa: E402
from lib.util import meta, require_input, write_json  # noqa: E402

VALID = {"escuela", "salud", "comercio", "transporte"}


def main() -> None:
    df = pd.read_csv(require_input(config.INPUT / "equipamiento_points.csv"))
    bad = set(df["type"].unique()) - VALID
    if bad:
        raise SystemExit(f"  ! tipos no válidos en equipamiento: {bad} (esperado {VALID})")

    features = [
        {
            "type": "Feature",
            "properties": {"type": str(r["type"]), "name": str(r.get("name", ""))},
            "geometry": {"type": "Point", "coordinates": [float(r["lng"]), float(r["lat"])]},
        }
        for _, r in df.iterrows()
    ]
    fc = {
        "type": "FeatureCollection",
        "_meta": meta(
            source="SIGMEP · CCSS/Min. Salud · DEE-INEC/PROCOMER · INCOFER/ARESEP",
            granularity="punto",
            coverage="snapshot a la fecha de descarga (ver input/SOURCES.md)",
            caveat="Puntos de equipamiento por tipo; insumo del índice de accesibilidad.",
        ),
        "features": features,
    }
    write_json(config.OUT / "equipamiento.geojson", fc)
    print(f"  → {len(features)} puntos")


if __name__ == "__main__":
    print("03 · equipamiento")
    main()
