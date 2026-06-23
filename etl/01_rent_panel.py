"""01 · Panel de renta distrito × año × moneda → public/data/rent_panel.json

Entrada (tidy, ver input/SOURCES.md):
  input/rent_long.csv  columnas: inec_code, name, year, currency(CRC|USD), offer, effective

`offer` = renta de OFERTA (scraping de portales). `effective` = renta EFECTIVA
(ENAHO). El crecimiento interanual se calcula SOLO sobre la oferta y por moneda
(₡ y $ nunca se mezclan). Años < ROBUST_RENT_FROM_YEAR se omiten ("sin serie").
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import pandas as pd  # noqa: E402
import config  # noqa: E402
from lib.util import meta, require_input, write_json  # noqa: E402


def _num(v):
    return None if pd.isna(v) else float(v)


def main() -> None:
    df = pd.read_csv(require_input(config.INPUT / "rent_long.csv"), dtype={"inec_code": str})
    df = df[df["year"] >= config.ROBUST_RENT_FROM_YEAR]

    districts: dict = {}
    for code, g in df.groupby("inec_code"):
        name = str(g["name"].iloc[0]) if "name" in g.columns else ""
        by_cur: dict = {}
        for cur, gc in g.groupby("currency"):
            gc = gc.sort_values("year")
            years: dict = {}
            prev_offer = None
            for _, r in gc.iterrows():
                offer = _num(r.get("offer"))
                growth = None
                if offer is not None and prev_offer not in (None, 0):
                    growth = round((offer / prev_offer - 1) * 100, 2)
                years[str(int(r["year"]))] = {
                    "offer": offer,
                    "effective": _num(r.get("effective")),
                    "growthPct": growth,
                }
                if offer is not None:
                    prev_offer = offer
            by_cur[str(cur)] = years
        districts[str(code)] = {"name": name, "byCurrency": by_cur}

    out = {
        "_meta": meta(
            source="INEC · IPC subíndice de alquiler (BCCR) + ENAHO; oferta vía scraping de portales",
            granularity="distrito × año × moneda (CRC/USD)",
            coverage=f"serie robusta ≥ {config.ROBUST_RENT_FROM_YEAR}",
            caveat="Renta de oferta ≠ renta efectiva. Las rentas en USD no se reajustan por ley: no se mezclan con CRC.",
            robustFromYear=config.ROBUST_RENT_FROM_YEAR,
        ),
        "districts": districts,
    }
    write_json(config.OUT / "rent_panel.json", out)
    print(f"  → {len(districts)} distritos")


if __name__ == "__main__":
    print("01 · panel de renta")
    main()
