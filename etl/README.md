# ETL · Atlas del Alquiler

Pipeline reproducible (Python + geopandas/pandas) que convierte fuentes oficiales
en los artefactos limpios que consume el front (`public/data/`). **Ningún insumo
crudo se versiona** — sólo los artefactos documentados.

## Requisitos
```bash
cd etl
python -m venv .venv
# Windows: .venv\Scripts\activate   ·   macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```
`geopandas` trae dependencias nativas (GDAL/GEOS/PROJ). En Windows lo más simple
es instalar con conda/mamba: `mamba install -c conda-forge geopandas`.

## Insumos
Colocá los archivos en `etl/input/` siguiendo [`input/SOURCES.md`](input/SOURCES.md)
(incluye la clave de join = código INEC y la fecha de descarga de cada fuente).

## Correr
```bash
python run_all.py          # todos los pasos en orden
# o uno por uno:
python 00_geometry.py      # SNIT/IGN → distritos.geojson (5367→4326, simplificado, región)
python 01_rent_panel.py    # IPC alquiler + ENAHO + oferta → rent_panel.json
python 02_census.py        # Censo → tenencia.json + nacionalidad.json
python 03_equipment.py     # SIGMEP/CCSS/PROCOMER/INCOFER → equipamiento.geojson
python 04_accessibility.py # sjoin_nearest en CRTM05 → accesibilidad.json
python 05_drivers.py       # ONT + Airbnb + turismo → drivers.json
```

Cada paso sella `_meta.generated` con la fecha de la corrida y `_meta.synthetic=false`.
Si falta un insumo, el paso aborta con un mensaje indicando qué archivo poner.

## TopoJSON (opcional, para producción)
El front carga GeoJSON tal cual. Para reducir peso aún más:
```bash
npx mapshaper public/data/distritos.geojson -simplify 20% keep-shapes \
  -o format=topojson public/data/distritos.topojson
```
(y ajustar el loader del front para preferir `.topojson`).

## Previsualizar sin datos reales (opcional)
```bash
python 99_seed_demo.py     # genera valores SINTÉTICOS (marca synthetic=true)
```
La app mostrará un banner rojo **DATOS SINTÉTICOS**. Revertí con
`git checkout public/data/*.json public/data/equipamiento.geojson`.
