# Procedencia de `distritos.geojson`

**Qué es:** límites administrativos de distrito (ADM3) de Costa Rica — 472 features.

**Fuente:** [geoBoundaries](https://www.geoboundaries.org/) (gbOpen), proyecto del William & Mary geoLab.
- Dataset: `geoBoundaries-CRI-ADM3_simplified.geojson`
- Commit fijado: `9469f09`
- URL: <https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CRI/ADM3/geoBoundaries-CRI-ADM3_simplified.geojson>
- Descargado: 2026-06-22
- CRS: EPSG:4326 (WGS84), listo para web.
- Licencia: **CC BY 4.0** (Open). Cita: Runfola, D. et al. (2020) *geoBoundaries: A global database of political administrative boundaries.* PLoS ONE.

**Propiedades por feature:** `shapeID` (clave de join usada por la app), `shapeName` (nombre del distrito), `shapeGroup` (CRI), `shapeISO`, `shapeType` (ADM3).

## Por qué esta geometría es provisional

geoBoundaries ADM3 **no** trae el código oficial INEC de distrito (provincia-cantón-distrito) ni la
provincia/cantón. La app, por ahora:

- usa `shapeID` como clave de join, y
- asigna la **región de planificación por una heurística de centroide** (ver `src/data/regions.ts`),
  claramente marcada como provisional.

El pipeline reproducible en [`etl/00_geometry.py`](../../etl/00_geometry.py) reemplaza esta geometría por
los **shapefiles distritales oficiales de SNIT/IGN** (EPSG:5367 → reproyectados a EPSG:4326), con el código
INEC como clave de join y la tabla oficial cantón → región. Hasta entonces, este archivo permite que el
mapa renderice geografía real de inmediato.
