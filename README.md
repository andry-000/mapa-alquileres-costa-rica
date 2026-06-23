# Atlas del Alquiler · Costa Rica

Mapa interactivo de una sola página del **mercado de alquiler en Costa Rica a nivel
distrito**. Responde cinco preguntas (lentes) sobre el mercado de vivienda y deja
**filtrar el dato temporal por administración presidencial** (1994–2030). Prioriza,
en este orden: **rigor del dato, honestidad de las limitaciones y performance**.

> **Estado de los datos.** El repo incluye **geometría real** de los 472 distritos
> (geoBoundaries) y la franja presidencial verificada. Las **métricas** (renta,
> censo, accesibilidad, drivers) se publican **vacías a propósito**: se construyen
> con el ETL a partir de fuentes oficiales. Hasta entonces la app muestra el mapa
> real con todo en «sin dato / sin serie» y un banner que lo explica. No se inventan
> valores. Para previsualizar la UI hay un seed sintético opcional, claramente
> etiquetado (ver abajo).

---

## Las cinco lentes
1. **Crecimiento anual del alquiler (%)** — coropleta *diverging* anclada al IPC nacional + serie temporal del distrito. *Renta de oferta ≠ renta efectiva (ENAHO); ₡ y $ separados.*
2. **Propiedades en alquiler** — secuencial + barra de tenencia (alquilada/propia). *Censo 2022 cantonal; 2011 distrital.*
3. **Extranjeros vs nacionales** — secuencial. *Dato por ola censal (2000/2011/2022), no anual.*
4. **Accesibilidad estratégica** — índice compuesto 0–100 + overlay de equipamiento toggleable.
5. **Drivers / gentrificación** — plusvalía (ONT) + densidad Airbnb + flag turístico, con anotación narrativa y bloque de presión de desplazamiento.

Cada lente muestra **su fuente y su caveat en la UI** (principio *jidoka*: la limitación se muestra, no se esconde).

## Stack
- **React + Vite + TypeScript**, **Tailwind** (tokens del design system en `tailwind.config.js`).
- **MapLibre GL JS** con geometría vectorial de distritos (GeoJSON; coropleta por `feature-state`, textura «sin dato», hover/lock, overlay de equipamiento).
- Estado con **Zustand** (`{ lens, period, currency, view, hoverId, locks }`).
- Charts vinculados en **SVG** (numerales tabulares).
- **ETL** aparte en **Python** (pandas/geopandas) que genera los artefactos.

## Correr el front
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # typecheck + bundle de producción
npm run preview
```
Node ≥ 18.18 (ver `.nvmrc`).

## Poblar los datos (ETL)
Ver [`etl/README.md`](etl/README.md). Resumen:
```bash
cd etl && python -m venv .venv && pip install -r requirements.txt
# colocar insumos en etl/input/ según etl/input/SOURCES.md
python run_all.py
```
Para previsualizar la UI sin fuentes reales (valores **sintéticos**, banner rojo):
```bash
python etl/99_seed_demo.py
```

## Fuentes y limitaciones

| Lente / artefacto | Fuente primaria | Granularidad real | Limitación clave |
|---|---|---|---|
| Geometría | geoBoundaries ADM3 → SNIT/IGN (ETL) | distrito | provisional sin código INEC hasta el ETL; ver `public/data/distritos.SOURCE.md` |
| Crecimiento renta | INEC · IPC alquiler (BCCR) + ENAHO + scraping | distrito × año × moneda | oferta ≠ efectiva; serie robusta ≥ 2010; ₡/$ no se mezclan |
| Propiedades alquiler | INEC · Censo Vivienda | distrito (2011) / cantón (2022) | 2022 sólo cantonal; no interpolar |
| Extranjeros | INEC · Censo Población | distrito (por ola) | por ola censal, no anual |
| Accesibilidad | SIGMEP · CCSS/Salud · PROCOMER · INCOFER/ARESEP | distrito | índice compuesto; snapshot |
| Drivers | ONT-Hacienda · Inside Airbnb · zona turística | distrito | proxies, no medidas oficiales de gentrificación |
| Presidencias | dataset verificado embebido | periodo | — |

Detalle campo por campo en [`public/data/data_dictionary.md`](public/data/data_dictionary.md).

## Estructura
```
etl/                 # Python reproducible (procedencia + fecha por fuente)
  input/             # insumos crudos (no versionados) + SOURCES.md
  00_geometry.py … 05_drivers.py · run_all.py · 99_seed_demo.py
public/data/         # artefactos generados + geometría + data_dictionary.md
src/
  data/              # tipos, tokens, lentes, regiones, íconos, selectores
  store/             # Zustand
  components/        # Header, MapView, LensSwitcher, Legend, DetailCard, PresidentialStrip, LinkedChart…
  App.tsx
```

## Accesibilidad
WCAG AA: navegación por teclado del switcher de lente y de la franja (flechas/Home/End),
`aria-pressed` en controles, foco visible, rampas *colorblind-safe*, respeto a
`prefers-reduced-motion`.

## No-goals
No inventar valores de renta para distritos sin dato. No prometer una serie histórica
distrital descargable (no existe: se construye). No mezclar monedas. No georreferenciar
extranjeros por debajo de la resolución censal disponible.

## Créditos
Límites administrativos: [geoBoundaries](https://www.geoboundaries.org/) (CC BY 4.0).
Diseño y datos de métricas: fuentes oficiales de Costa Rica (INEC, SNIT/IGN, CCSS,
PROCOMER, ONT, etc.). Código bajo licencia [MIT](LICENSE).
