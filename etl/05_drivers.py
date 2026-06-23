"""05 · Drivers / gentrificación → public/data/drivers.json

Entrada (tidy, ver input/SOURCES.md):
  input/drivers_long.csv  inec_code, plusvalia, airbnb_density, tourist_zone(0/1), displacement

`plusvalia` = proxy ONT (valor de terreno por zona homogénea). `airbnb_density`
= Inside Airbnb. Índice compuesto = media de los tres normalizados (0–100).
Capa NARRATIVA: ninguno de estos es una medida oficial de gentrificación.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402
import numpy as np  # noqa: E402
import config  # noqa: E402
from lib.util import meta, require_input, write_json  # noqa: E402


def _num(v):
    return None if pd.isna(v) else float(v)


def _norm(series: pd.Series) -> pd.Series:
    v = series.astype(float)
    mn, mx = v.min(), v.max()
    return (v - mn) / (mx - mn if mx > mn else 1)


def main() -> None:
    df = pd.read_csv(require_input(config.INPUT / "drivers_long.csv"), dtype={"inec_code": str})
    cols = ("plusvalia", "airbnb_density", "displacement")
    norm = {c: _norm(df[c]) for c in cols}  # conserva NaN donde falta la fuente
    present = sum(norm[c].notna().astype(int) for c in cols)
    total = sum(norm[c].fillna(0) for c in cols)
    # Promedia SÓLO los drivers presentes; NaN (→ null) cuando no hay ninguno,
    # para no fabricar un 0 de "baja gentrificación" donde no hay dato.
    composite = (total / present.replace(0, np.nan) * 100).round(1)

    districts = {}
    for i, r in df.reset_index(drop=True).iterrows():
        tz = r.get("tourist_zone")
        districts[str(r["inec_code"])] = {
            "plusvalia": _num(r.get("plusvalia")),
            "airbnbDensity": _num(r.get("airbnb_density")),
            "touristZone": None if pd.isna(tz) else bool(int(tz)),
            "displacement": _num(r.get("displacement")),
            "compositeIndex": None if pd.isna(composite.iloc[i]) else float(composite.iloc[i]),
        }

    write_json(
        config.OUT / "drivers.json",
        {
            "_meta": meta(
                source="ONT-Hacienda (plusvalía) · Inside Airbnb · flag zona turística",
                granularity="distrito",
                coverage="snapshot",
                caveat="Capa narrativa: proxies, no medidas oficiales de gentrificación. El ícono cultural acompaña la cifra, nunca la sustituye.",
            ),
            "districts": districts,
        },
    )
    print(f"  → {len(districts)} distritos")


if __name__ == "__main__":
    print("05 · drivers / gentrificación")
    main()
