"""02 · Censo → public/data/tenencia.json + nacionalidad.json

Entrada (tidy, ver input/SOURCES.md):
  input/tenencia_long.csv      inec_code, rented_units, rented_pct, owned_pct, wave
  input/nacionalidad_long.csv  inec_code, foreign_pct, wave

Censo 2022 publica tenencia a nivel cantón; 2011 a distrito. No se interpola.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402
import config  # noqa: E402
from lib.util import meta, require_input, write_json  # noqa: E402


def _num(v):
    return None if pd.isna(v) else float(v)


def _int(v):
    return None if pd.isna(v) else int(v)


def main() -> None:
    ten = pd.read_csv(require_input(config.INPUT / "tenencia_long.csv"), dtype={"inec_code": str})
    nac = pd.read_csv(require_input(config.INPUT / "nacionalidad_long.csv"), dtype={"inec_code": str})

    tdist = {
        str(r["inec_code"]): {
            "rentedUnits": _int(r.get("rented_units")),
            "rentedPct": _num(r.get("rented_pct")),
            "ownedPct": _num(r.get("owned_pct")),
            "wave": _int(r.get("wave")),
        }
        for _, r in ten.iterrows()
    }
    write_json(
        config.OUT / "tenencia.json",
        {
            "_meta": meta(
                source="INEC · Censo de Vivienda",
                granularity="distrito (2011) / cantón (2022)",
                coverage="olas 2011 y 2022",
                caveat="El Censo 2022 publica tenencia a nivel cantón; 2011 a distrito. No se interpola.",
                censusWave="2011-distrital/2022-cantonal",
            ),
            "districts": tdist,
        },
    )

    ndist = {
        str(r["inec_code"]): {
            "foreignPct": _num(r.get("foreign_pct")),
            "wave": _int(r.get("wave")),
        }
        for _, r in nac.iterrows()
    }
    write_json(
        config.OUT / "nacionalidad.json",
        {
            "_meta": meta(
                source="INEC · Censo de Población",
                granularity="distrito (según ola)",
                coverage="olas 2000 / 2011 / 2022",
                caveat="Dato por ola censal, no anual — no se interpola entre censos. La ola es por distrito (campo `wave`), no global.",
            ),
            "districts": ndist,
        },
    )
    print(f"  → tenencia {len(tdist)} · nacionalidad {len(ndist)}")


if __name__ == "__main__":
    print("02 · censo (tenencia + nacionalidad)")
    main()
