import { useMemo, useRef, type KeyboardEvent } from "react";
import { useAtlasStore } from "../store/useAtlasStore";
import {
  ADMINISTRATIONS,
  buildPeriods,
  periodHasNoSeries,
} from "../data/presidencias";

export function PresidentialStrip() {
  const period = useAtlasStore((s) => s.period);
  const setPeriod = useAtlasStore((s) => s.setPeriod);
  const view = useAtlasStore((s) => s.view);
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const periods = useMemo(
    () => buildPeriods(ADMINISTRATIONS, new Date().getFullYear()),
    [],
  );
  const active = periods[period] ?? periods[periods.length - 1];

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    let next = i;
    if (e.key === "ArrowRight") next = Math.min(periods.length - 1, i + 1);
    else if (e.key === "ArrowLeft") next = Math.max(0, i - 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = periods.length - 1;
    else return;
    e.preventDefault();
    setPeriod(next);
    btnRefs.current[next]?.focus();
  };

  return (
    <footer className="flex-none border-t border-hair bg-bg-alt px-6 pb-3.5 pt-2.5">
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-faint">
          Periodo presidencial · filtra el dato temporal
        </span>
        <span className="tnum text-[11px] text-muted">
          {active.nombre} · {active.years}
          {periodHasNoSeries(active) && (
            <span className="text-editorial"> · sin serie de renta</span>
          )}
          {view === "region" && " · vista por región"}
        </span>
      </div>
      <div
        className="flex items-stretch gap-[3px]"
        role="group"
        aria-label="Línea temporal de administraciones presidenciales"
      >
        {periods.map((p, i) => {
          const on = i === period;
          return (
            <button
              key={p.nombre}
              ref={(el) => {
                btnRefs.current[i] = el;
              }}
              type="button"
              aria-pressed={on}
              aria-label={`${p.nombre}, ${p.years}, ${p.partido}${p.current ? ", administración vigente" : ""}`}
              tabIndex={on ? 0 : -1}
              onClick={() => setPeriod(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={
                "flex min-w-0 flex-1 flex-col justify-center rounded-md border px-2.5 py-1.5 text-left transition-all " +
                (on
                  ? "border-accent/50 bg-gradient-to-b from-accent/15 to-accent/[.04] text-ink"
                  : "border-hair bg-panel text-muted hover:border-hair-strong")
              }
            >
              <span className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 flex-none rounded-sm"
                  style={{ background: p.color }}
                  aria-hidden
                />
                <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[12px] font-semibold">
                  {p.nombre.split(" ")[0]} {p.nombre.split(" ")[1] ?? ""}
                </span>
                {p.current && (
                  <span className="rounded-[3px] bg-accent px-1 py-px text-[8.5px] font-bold tracking-wider text-accent-ink">
                    VIGENTE
                  </span>
                )}
              </span>
              <span className="tnum mt-0.5 text-[10.5px] text-[#7c828a]">
                {p.years} · {p.partido}
              </span>
            </button>
          );
        })}
      </div>
    </footer>
  );
}
