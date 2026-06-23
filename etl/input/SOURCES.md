# Playbook de fuentes — qué archivo va en `etl/input/`

Esta carpeta **no se versiona** (.gitignore). Aquí van los insumos crudos /
pre-tidiados que cada paso del ETL consume. Para cada fuente: institución, URL,
**fecha de descarga** y el archivo esperado. Los pasos `0x_*.py` fallan con un
mensaje claro si falta su insumo.

> Convención de clave de join: **código INEC de distrito** `provincia-cantón-distrito`
> (p.ej. `1-01-01`), zero-padded a 2 dígitos en cantón y distrito.

| # | Archivo esperado | Fuente | Cómo obtenerlo | Descargado |
|---|---|---|---|---|
| 00 | `distritos_snit/*.shp` (+ .dbf/.shx/.prj) | **SNIT / IGN** | Geoservicios SNIT → capa distrital (EPSG:5367). | `____-__-__` |
| 00 | `regiones_mideplan.geojson` *(opcional)* | **MIDEPLAN** | Polígonos de las 6 regiones de planificación (mejor que la pista por provincia). | `____-__-__` |
| 01 | `rent_long.csv` | **INEC** (IPC subíndice alquiler vía BCCR + ENAHO) + scraping de portales | Tidy a: `inec_code,name,year,currency,offer,effective`. `offer`=portales, `effective`=ENAHO. | `____-__-__` |
| 02 | `tenencia_long.csv` | **INEC** Censo Vivienda (2011 Redatam · 2022 tabulados Excel) | `inec_code,rented_units,rented_pct,owned_pct,wave`. 2022 sólo cantonal. | `____-__-__` |
| 02 | `nacionalidad_long.csv` | **INEC** Censo Población (2000/2011/2022) | `inec_code,foreign_pct,wave`. No interpolar entre olas. | `____-__-__` |
| 03 | `equipamiento_points.csv` | **SIGMEP** (escuelas, REST/ArcGIS) · **CCSS/Min. Salud** (EBAIS/hospitales) · **DEE-INEC/PROCOMER** (comercio/zonas francas) · **INCOFER/ARESEP** (transporte) | `type,name,lng,lat` con `type ∈ {escuela,salud,comercio,transporte}` (WGS84). | `____-__-__` |
| 05 | `drivers_long.csv` | **ONT-Hacienda** (valor de terreno por zona homogénea = proxy plusvalía) · **Inside Airbnb** · clasificación de zona turística | `inec_code,plusvalia,airbnb_density,tourist_zone,displacement`. | `____-__-__` |

## Notas de procedencia / licencia
- **INEC**: uso con cita; ENAHO es muestral → la renta efectiva a nivel distrital tiene error muestral (documentar).
- **SNIT/IGN**: shapefiles en CRTM05 (EPSG:5367); el ETL reproyecta a 4326 para web y usa 5367 para distancias.
- **Inside Airbnb**: datos derivados de scraping; densidad short-term, no oficial.
- **ONT-Hacienda**: valor de terreno por zona homogénea es un **proxy** de plusvalía, no una medida de gentrificación.

Completá las fechas de descarga `____-__-__` al bajar cada fuente: son parte de la procedencia.
