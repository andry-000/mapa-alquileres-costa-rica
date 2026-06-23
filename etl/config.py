"""Rutas, CRS y tablas de referencia del ETL.

El ETL lee archivos crudos de `etl/input/` (ver input/SOURCES.md) y escribe
artefactos limpios en `public/data/`. Nada de `input/` se versiona (.gitignore):
sólo los artefactos documentados terminan en el repo.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
INPUT = ROOT / "input"
WORK = ROOT / "work"
OUT = ROOT.parent / "public" / "data"

# ── Proyecciones ───────────────────────────────────────────────────────────
CRS_CRTM05 = "EPSG:5367"  # CRTM05 — shapefiles SNIT/IGN; métrico para distancias
CRS_WEB = "EPSG:4326"      # WGS84 — geometría para web (MapLibre)

# La serie de renta sólo es robusta a partir de este año (antes: "sin serie").
ROBUST_RENT_FROM_YEAR = 2010

# Simplificación de geometría (Douglas–Peucker en grados; ~80% menos vértices).
SIMPLIFY_TOLERANCE_DEG = 0.0008

# ── Regiones de planificación (MIDEPLAN) ─────────────────────────────────────
# La asignación AUTORITATIVA es a nivel CANTÓN. Dos rutas, en orden de preferencia:
#   1) Si existe input/regiones_mideplan.geojson, 00_geometry.py hace un sjoin
#      espacial del centroide de cada distrito contra esos polígonos.
#   2) Si no, usa esta pista por PROVINCIA (aproximada — varios cantones de San
#      José/Alajuela/Puntarenas caen en más de una región). Completá la tabla
#      cantón→región desde el decreto oficial antes de publicar como definitivo.
REGION_BY_PROVINCE_HINT = {
    "San José": "central",
    "Alajuela": "central",   # salvo San Carlos/Upala/Los Chiles/Guatuso → norte
    "Cartago": "central",
    "Heredia": "central",    # salvo Sarapiquí → norte
    "Guanacaste": "chorotega",
    "Puntarenas": "pacifico",  # salvo Coto Brus/Osa/Golfito/Corredores/Buenos Aires → brunca
    "Limón": "caribe",
}

# Claves de región válidas (deben coincidir con src/data/regions.ts).
REGION_KEYS = ["central", "chorotega", "pacifico", "brunca", "caribe", "norte"]
