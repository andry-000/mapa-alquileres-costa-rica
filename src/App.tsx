import { useMemo, type ReactNode } from "react";
import { useAtlasData } from "./hooks/useAtlasData";
import { useAtlasStore } from "./store/useAtlasStore";
import { ADMINISTRATIONS, buildPeriods } from "./data/presidencias";
import { LENS_BY_ID } from "./data/lenses";
import { REGION_KEYS } from "./data/regions";
import { rampColor } from "./data/color";
import {
  bundleIsPending,
  bundleIsSynthetic,
  lensDomain,
  resolveValue,
} from "./data/select";
import type { ViewLevel } from "./data/types";

import { Header } from "./components/Header";
import { DataPendingBanner } from "./components/DataPendingBanner";
import { LensSwitcher } from "./components/LensSwitcher";
import { Legend } from "./components/Legend";
import { DetailCard } from "./components/DetailCard";
import { PresidentialStrip } from "./components/PresidentialStrip";
import { MapView } from "./components/MapView";

const VIEWS: { id: ViewLevel; label: string }[] = [
  { id: "distrito", label: "Distrito" },
  { id: "region", label: "Región" },
];

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen items-center justify-center bg-bg text-[13px] text-faint">
      {children}
    </div>
  );
}

export default function App() {
  const data = useAtlasData();
  const lens = useAtlasStore((s) => s.lens);
  const periodIdx = useAtlasStore((s) => s.period);
  const currency = useAtlasStore((s) => s.currency);
  const view = useAtlasStore((s) => s.view);
  const setView = useAtlasStore((s) => s.setView);

  const periods = useMemo(
    () => buildPeriods(ADMINISTRATIONS, new Date().getFullYear()),
    [],
  );
  const activePeriod = periods[Math.min(periodIdx, periods.length - 1)];
  const cfg = LENS_BY_ID[lens];

  const ready = data.status === "ready";

  const domain = useMemo(() => {
    if (!ready) return null;
    return lensDomain(
      data.bundle,
      lens,
      data.districts.map((d) => d.id),
      activePeriod,
      currency,
    );
  }, [ready, data, lens, activePeriod, currency]);

  const colorById = useMemo(() => {
    const m = new Map<string, string | null>();
    if (!ready) return m;
    const { districts, bundle } = data;

    if (view === "distrito") {
      for (const info of districts) {
        const rv = resolveValue(bundle, lens, info.id, activePeriod, currency, domain);
        m.set(info.id, rv.status === "ok" && rv.norm != null ? rampColor(cfg.ramp, rv.norm) : null);
      }
    } else {
      // region view: color every district by its region's mean normalized value
      const acc: Partial<Record<string, { sum: number; n: number }>> = {};
      for (const info of districts) {
        const rv = resolveValue(bundle, lens, info.id, activePeriod, currency, domain);
        if (rv.status === "ok" && rv.norm != null) {
          const a = (acc[info.region] ??= { sum: 0, n: 0 });
          a.sum += rv.norm;
          a.n += 1;
        }
      }
      const regionColor: Record<string, string | null> = {};
      for (const rk of REGION_KEYS) {
        const a = acc[rk];
        regionColor[rk] = a && a.n ? rampColor(cfg.ramp, a.sum / a.n) : null;
      }
      for (const info of districts) m.set(info.id, regionColor[info.region]);
    }
    return m;
  }, [ready, data, lens, activePeriod, currency, view, domain, cfg.ramp]);

  if (data.status === "loading") return <Centered>Cargando geografía…</Centered>;
  if (data.status === "error")
    return (
      <Centered>
        <div className="max-w-md text-center">
          No se pudieron cargar los datos.
          <div className="mt-2 font-serif italic text-editorial">{data.error}</div>
        </div>
      </Centered>
    );

  const pending = bundleIsPending(data.bundle);
  const synthetic = bundleIsSynthetic(data.bundle);
  const footnote =
    view === "region"
      ? "Vista agregada: el color es la media regional de la lente. Íconos = vocabulario de identidad (fauna · flora · cultura), nunca sobre un valor."
      : "Coropleta a nivel distrito. Posá para detalle, clic para fijar y comparar. Gris rayado = sin dato.";

  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      <Header />
      <DataPendingBanner pending={pending} synthetic={synthetic} />

      <div className="flex min-h-0 flex-1">
        {/* MAP */}
        <section
          className="relative flex min-w-0 flex-[0_0_64%] flex-col border-r border-hair"
          style={{
            backgroundImage:
              "radial-gradient(120% 90% at 40% 25%,#13161b 0%,#0e1013 70%)",
          }}
        >
          <div className="flex items-center justify-between px-5 pb-2 pt-3.5">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[.08em] text-faint">
                Lente activa
              </div>
              <div className="mt-0.5 text-[17px] font-semibold">{cfg.label}</div>
            </div>
            <div
              role="group"
              aria-label="Nivel de agregación"
              className="flex overflow-hidden rounded-md border border-hair-strong"
            >
              {VIEWS.map((v) => {
                const active = view === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setView(v.id)}
                    className={
                      "px-3 py-1.5 text-[11.5px] font-semibold transition-colors " +
                      (active ? "bg-accent text-accent-ink" : "text-muted hover:text-ink")
                    }
                  >
                    {v.label}
                  </button>
                );
              })}
            </div>
          </div>
          <MapView
            geojson={data.geojson}
            equipment={data.equipment}
            colorById={colorById}
            lens={lens}
            view={view}
            footnote={footnote}
          />
        </section>

        {/* PANEL */}
        <aside className="flex min-w-0 flex-1 flex-col bg-panel">
          <LensSwitcher />
          <Legend lens={lens} domain={domain} currency={currency} />
          <div className="min-h-0 flex-1 overflow-y-auto px-[18px] py-4">
            <DetailCard
              byId={data.byId}
              bundle={data.bundle}
              lens={lens}
              period={activePeriod}
              currency={currency}
              domain={domain}
            />
          </div>
        </aside>
      </div>

      <PresidentialStrip />
    </div>
  );
}
