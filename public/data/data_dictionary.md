# Diccionario de datos

Cada artefacto que el ETL escribe en `public/data/` valida contra los tipos de
[`src/data/types.ts`](../../src/data/types.ts). Todos llevan un bloque `_meta`:

| Campo `_meta` | Significado |
|---|---|
| `generated` | Fecha ISO de generación. **`null` = el ETL no ha corrido**: la app pinta todo como «sin dato». |
| `synthetic` | `true` sólo si los valores vienen del seed de demostración (`etl/99_seed_demo.py`), **no** de fuentes reales. La UI muestra un banner rojo. |
| `source` | Fuente(s) primaria(s). |
| `granularity` | Nivel geográfico/temporal real del dato. |
| `coverage` | Cobertura temporal. |
| `caveat` | Limitación que la UI muestra siempre (principio jidoka). |

> **Principios no negociables.** No se inventan valores para distritos sin dato (se renderizan «sin dato», nunca cero ni interpolados sin avisar). Se distingue **renta de oferta** (portales/scraping) de **renta efectiva** (ENAHO). No se mezclan monedas: ₡ y $ son series separadas. No se georreferencian extranjeros por debajo de la resolución censal.

---

## `distritos.geojson` — geometría
Ver [`distritos.SOURCE.md`](distritos.SOURCE.md). Clave de join: `shapeID`. El ETL la sustituye por los shapefiles SNIT/IGN con código INEC y región oficial.

| Campo | Tipo | Fuente | Caveat |
|---|---|---|---|
| `shapeID` | string | geoBoundaries | clave de join provisional (→ código INEC en el ETL) |
| `shapeName` | string | geoBoundaries | nombre del distrito; puede repetirse entre cantones |
| `region` | enum | heurística de centroide | **provisional**; el ETL aplica la tabla oficial cantón→región |

## `rent_panel.json` — Lente 1 (crecimiento) + renta media
Panel **distrito × año × moneda**. `districts[id].byCurrency[CRC|USD][año]`:

| Campo | Tipo | Unidad | Fuente | Granularidad | Cobertura | Caveat |
|---|---|---|---|---|---|---|
| `offer` | number\|null | ₡ ó $ / mes | scraping de portales | distrito · mensual→anual | ~2015+ según portal | renta de **oferta**, no transada |
| `effective` | number\|null | ₡ ó $ / mes | INEC · ENAHO | distrito (muestral) | anual desde 2010 | renta **efectiva**; error muestral a nivel distrital |
| `growthPct` | number\|null | % interanual | derivado (oferta) + ancla IPC | distrito · anual | robusto ≥ 2010 | pre-2010 = «sin serie»; ₡ y $ no se mezclan |

## `tenencia.json` — Lente 2 (propiedades en alquiler)
| Campo | Tipo | Unidad | Fuente | Granularidad | Caveat |
|---|---|---|---|---|---|
| `rentedUnits` | number\|null | unidades | INEC · Censo Vivienda | distrito(2011)/cantón(2022) | conteo absoluto |
| `rentedPct` | number\|null | % | INEC · Censo | íbid | % alquilada |
| `ownedPct` | number\|null | % | INEC · Censo | íbid | % propia |
| `wave` | 2011\|2022 | — | INEC | — | 2022 sólo cantonal; no interpolar |

## `nacionalidad.json` — Lente 3 (extranjeros vs nacionales)
| Campo | Tipo | Unidad | Fuente | Granularidad | Caveat |
|---|---|---|---|---|---|
| `foreignPct` | number\|null | % (0–100) | INEC · Censo Población | distrito (según ola) | por ola censal, no anual |
| `wave` | 2000\|2011\|2022 | — | INEC | — | no interpolar entre censos |

## `accesibilidad.json` — Lente 4 (accesibilidad estratégica)
| Campo | Tipo | Unidad | Fuente | Caveat |
|---|---|---|---|---|
| `index` | number\|null | 0–100 | compuesto | media ponderada de las 4 distancias, normalizada |
| `distSchoolM` | number\|null | m | SIGMEP | distancia al equipamiento más cercano |
| `distHealthM` | number\|null | m | CCSS/Min. Salud | EBAIS/hospitales |
| `distCommerceM` | number\|null | m | DEE-INEC/PROCOMER | comercio/zonas francas |
| `distTransitM` | number\|null | m | INCOFER/ARESEP | estaciones/paradas |

> Distancias precomputadas con `geopandas.sjoin_nearest` reproyectando a **CRTM05 (EPSG:5367)** para que sean métricas.

## `drivers.json` — Lente 5 (drivers / gentrificación)
| Campo | Tipo | Unidad | Fuente | Caveat |
|---|---|---|---|---|
| `plusvalia` | number\|null | índice | ONT-Hacienda (zona homogénea) | **proxy** de plusvalía, no medida directa |
| `airbnbDensity` | number\|null | listings/km² | Inside Airbnb | densidad short-term |
| `touristZone` | bool\|null | — | clasificación | flag de zona turística |
| `displacement` | number\|null | 0–100 | compuesto | índice de presión; acompañado del ícono cultural, nunca sustituido |
| `compositeIndex` | number\|null | 0–100 | compuesto | capa narrativa, no oficial |

## `equipamiento.geojson` — overlay de la Lente 4
Puntos (`Point`) con `properties.type` ∈ {`escuela`,`salud`,`comercio`,`transporte`} y `name`.

## `presidencias.json` — franja temporal
Array verificado de administraciones 1994–2030 (`nombre`, `inicio`, `fin`, `partido`). Espejo del embed en [`src/data/presidencias.ts`](../../src/data/presidencias.ts). Color por partido; se marca la administración vigente; al seleccionar un periodo se filtra `rent_panel` a esos años (pre-2010 → «sin serie»).
