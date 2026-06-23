"""00 · Geometría distrital oficial → public/data/distritos.geojson

Entrada (ver input/SOURCES.md):
  input/distritos_snit/*.shp   Shapefile distrital de SNIT/IGN (EPSG:5367)
  input/regiones_mideplan.geojson   (opcional) polígonos de las 6 regiones MIDEPLAN

Salida:
  public/data/distritos.geojson  — EPSG:4326, simplificado, con código INEC como
  clave de join (shapeID), nombre, provincia, cantón y región oficial.

Reemplaza la geometría provisional de geoBoundaries (ver distritos.SOURCE.md).
Para TopoJSON: `mapshaper public/data/distritos.geojson -simplify 20% \
  -o format=topojson public/data/distritos.topojson` (o la librería `topojson`).
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

import geopandas as gpd  # noqa: E402
import config  # noqa: E402
from lib.util import meta, write_json  # noqa: E402

# Nombres de columna esperados en el shapefile SNIT — AJUSTAR a la edición usada.
COL_PROV_CODE = "COD_PROV"
COL_CANT_CODE = "COD_CANT"
COL_DIST_CODE = "COD_DIST"
COL_PROV_NAME = "NOM_PROV"
COL_CANT_NAME = "NOM_CANT"
COL_DIST_NAME = "NOM_DIST"


def inec_code(row) -> str:
    """Código INEC provincia-cantón-distrito, p.ej. '1-01-01' (zero-padded)."""
    p = str(int(row[COL_PROV_CODE]))
    c = str(int(row[COL_CANT_CODE])).zfill(2)
    d = str(int(row[COL_DIST_CODE])).zfill(2)
    return f"{p}-{c}-{d}"


def assign_region(gdf: gpd.GeoDataFrame) -> gpd.GeoDataFrame:
    regiones_path = config.INPUT / "regiones_mideplan.geojson"
    if regiones_path.exists():
        regiones = gpd.read_file(regiones_path).to_crs(config.CRS_WEB)
        cents = gdf.copy()
        cents["geometry"] = cents.geometry.centroid
        joined = gpd.sjoin(cents, regiones[["region", "geometry"]], how="left", predicate="within")
        # A centroid can match >1 region polygon on a shared border → keep first
        # and assign by aligned index (cents shares gdf's index).
        joined = joined[~joined.index.duplicated(keep="first")]
        gdf["region"] = joined["region"]
        return gdf
    # Fallback: pista por provincia (aproximada — completar con la tabla cantonal).
    print("  ! sin input/regiones_mideplan.geojson — usando pista por provincia (aprox.)")
    gdf["region"] = gdf[COL_PROV_NAME].map(config.REGION_BY_PROVINCE_HINT)
    return gdf


def main() -> None:
    shp = next((config.INPUT / "distritos_snit").glob("*.shp"), None)
    if shp is None:
        raise SystemExit(
            "\n[ETL] Falta etl/input/distritos_snit/*.shp (shapefile distrital SNIT/IGN).\n"
            "      Ver etl/input/SOURCES.md.\n"
        )

    gdf = gpd.read_file(shp)
    if gdf.crs is None:
        gdf = gdf.set_crs(config.CRS_CRTM05)
    gdf = gdf.to_crs(config.CRS_WEB)

    gdf["shapeID"] = gdf.apply(inec_code, axis=1)
    gdf["inecCode"] = gdf["shapeID"]
    gdf["shapeName"] = gdf[COL_DIST_NAME]
    gdf["provincia"] = gdf[COL_PROV_NAME]
    gdf["canton"] = gdf[COL_CANT_NAME]
    gdf = assign_region(gdf)

    missing = gdf["region"].isna().sum()
    if missing:
        print(f"  ! {missing} distritos sin región — revisar pista/joins")

    gdf["geometry"] = gdf.geometry.simplify(config.SIMPLIFY_TOLERANCE_DEG, preserve_topology=True)

    cols = ["shapeID", "shapeName", "inecCode", "provincia", "canton", "region", "geometry"]
    out = gdf[cols]

    fc = out.__geo_interface__
    # Sella el bloque _meta (no estándar en GeoJSON, pero la app lo ignora salvo doc).
    fc["_meta"] = meta(
        source="SNIT/IGN — shapefile distrital (EPSG:5367 → 4326)",
        granularity="distrito (482/492 según edición)",
        coverage="vigente a la fecha de descarga (ver input/SOURCES.md)",
        caveat="Geometría simplificada (~80% menos vértices). Clave de join = código INEC.",
    )
    write_json(config.OUT / "distritos.geojson", fc)
    print(f"  → {len(out)} distritos escritos")


if __name__ == "__main__":
    print("00 · geometría distrital")
    main()
