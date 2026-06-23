"""Corre el ETL completo en orden. Cada paso falla con un mensaje claro si le
falta un insumo (ver input/SOURCES.md)."""
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
STEPS = [
    "00_geometry.py",
    "01_rent_panel.py",
    "02_census.py",
    "03_equipment.py",
    "04_accessibility.py",
    "05_drivers.py",
]


def main() -> None:
    for step in STEPS:
        print(f"\n=== {step} ===")
        subprocess.run([sys.executable, str(HERE / step)], check=True)
    print("\n✓ ETL completo — artefactos en public/data/")


if __name__ == "__main__":
    main()
