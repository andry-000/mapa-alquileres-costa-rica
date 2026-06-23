"""99 · Seed de DEMOSTRACIÓN (opcional, sólo stdlib).

Genera valores SINTÉTICOS deterministas para previsualizar la UI sin fuentes
reales. Marca cada artefacto con `synthetic: true`, por lo que la app muestra un
banner rojo "DATOS SINTÉTICOS". NO usar para análisis ni publicar como real.

Uso:   python 99_seed_demo.py
Revertir: `git checkout public/data/*.json public/data/equipamiento.geojson`
"""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "data"
YEARS = list(range(2010, 2026))


def _u(s: str, salt: str) -> float:
    """pseudo-aleatorio determinista en [0,1) a partir del id."""
    return (int(hashlib.md5(f"{salt}:{s}".encode()).hexdigest(), 16) % 10000) / 10000.0


def _meta(caveat: str, **extra) -> dict:
    m = {
        "generated": datetime.date.today().isoformat(),
        "synthetic": True,
        "source": "SEED DE DEMOSTRACIÓN — valores sintéticos, no fuentes oficiales",
        "granularity": "distrito",
        "coverage": "ilustrativa",
        "caveat": caveat,
    }
    m.update(extra)
    return m


def _write(name: str, obj: dict) -> None:
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  ✓ {name} (sintético)")


def main() -> None:
    geo = json.loads((OUT / "distritos.geojson").read_text(encoding="utf-8"))
    ids = [
        (str(f["properties"]["shapeID"]), str(f["properties"].get("shapeName", "")))
        for f in geo["features"]
    ]

    rent, ten, nac, acc, drv = {}, {}, {}, {}, {}
    for did, name in ids:
        if _u(did, "nd") < 0.10:  # ~10% queda "sin dato" a propósito
            continue
        base_crc = 180000 + _u(did, "rent") * 520000
        base_usd = base_crc / 525
        g0 = 2 + _u(did, "g") * 8
        by_crc, by_usd = {}, {}
        prev_c = prev_u = None
        for k, y in enumerate(YEARS):
            g = max(-3.0, g0 + (_u(did, f"d{y}") - 0.5) * 2.5)
            oc = round(base_crc * ((1 + g / 100) ** k))
            ou = round(base_usd * ((1 + (g * 0.4) / 100) ** k))
            by_crc[str(y)] = {
                "offer": oc,
                "effective": round(oc * 0.82),
                "growthPct": None if prev_c is None else round((oc / prev_c - 1) * 100, 2),
            }
            by_usd[str(y)] = {
                "offer": ou,
                "effective": round(ou * 0.85),
                "growthPct": None if prev_u is None else round((ou / prev_u - 1) * 100, 2),
            }
            prev_c, prev_u = oc, ou
        rent[did] = {"name": name, "byCurrency": {"CRC": by_crc, "USD": by_usd}}

        rp = round(20 + _u(did, "ten") * 45, 1)
        ten[did] = {
            "rentedUnits": int(200 + _u(did, "tu") * 5000),
            "rentedPct": rp,
            "ownedPct": round(100 - rp, 1),
            "wave": 2022,
        }
        nac[did] = {"foreignPct": round(2 + _u(did, "for") * 30, 1), "wave": 2022}
        acc[did] = {
            "index": round(_u(did, "acc") * 100, 1),
            "distSchoolM": int(120 + _u(did, "ds") * 3000),
            "distHealthM": int(300 + _u(did, "dh") * 8000),
            "distCommerceM": int(150 + _u(did, "dc") * 5000),
            "distTransitM": int(200 + _u(did, "dt") * 9000),
        }
        tourist = _u(did, "tz") > 0.7
        drv[did] = {
            "plusvalia": round(40 + _u(did, "pl") * 60, 1),
            "airbnbDensity": round(_u(did, "ab") * 100, 1),
            "touristZone": tourist,
            "displacement": round(_u(did, "disp") * (100 if tourist else 45), 1),
            "compositeIndex": round(_u(did, "ci") * 100, 1),
        }

    _write("rent_panel.json", {"_meta": _meta("Sintético. Oferta/efectiva inventadas.", robustFromYear=2010), "districts": rent})
    _write("tenencia.json", {"_meta": _meta("Sintético.", censusWave="2011-distrital/2022-cantonal"), "districts": ten})
    _write("nacionalidad.json", {"_meta": _meta("Sintético.", censusWave=2022), "districts": nac})
    _write("accesibilidad.json", {"_meta": _meta("Sintético."), "districts": acc})
    _write("drivers.json", {"_meta": _meta("Sintético."), "districts": drv})
    print(f"  → seed para {len(rent)} distritos. La UI mostrará el banner 'DATOS SINTÉTICOS'.")


if __name__ == "__main__":
    print("99 · seed de demostración (SINTÉTICO)")
    main()
