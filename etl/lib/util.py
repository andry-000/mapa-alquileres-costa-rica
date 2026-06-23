"""Utilidades compartidas del ETL: normalización, IO, bloque _meta y validación."""
from __future__ import annotations

import datetime as _dt
import json
import unicodedata
from pathlib import Path
from typing import Any


def today_iso() -> str:
    return _dt.date.today().isoformat()


def normalize(s: Any) -> str:
    """minúsculas, sin acentos, espacios colapsados — para joins por nombre."""
    if s is None:
        return ""
    txt = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode()
    return " ".join(txt.lower().split())


def write_json(path: Path, obj: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  ✓ {path.name}")


def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))


def meta(
    source: str,
    granularity: str,
    coverage: str,
    caveat: str,
    *,
    synthetic: bool = False,
    **extra: Any,
) -> dict:
    """Bloque _meta estándar. `generated` se sella con la fecha de la corrida."""
    block = {
        "generated": today_iso(),
        "synthetic": synthetic,
        "source": source,
        "granularity": granularity,
        "coverage": coverage,
        "caveat": caveat,
    }
    block.update(extra)
    return block


def require_input(path: Path) -> Path:
    """Falla con un mensaje claro si falta un archivo de entrada."""
    if not path.exists():
        raise SystemExit(
            f"\n[ETL] Falta el archivo de entrada: {path}\n"
            f"      Colocalo en etl/input/ — ver etl/input/SOURCES.md.\n"
        )
    return path
