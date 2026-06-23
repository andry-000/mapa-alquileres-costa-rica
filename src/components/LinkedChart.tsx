import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import type { Currency, DataBundle, LensId, Period } from "../data/types";
import { LENS_BY_ID } from "../data/lenses";
import { IPC_ANCHOR, COLORS } from "../data/tokens";
import { periodHasNoSeries, periodYears } from "../data/presidencias";

function useWidth(): [RefObject<HTMLDivElement>, number] {
  const ref = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(260);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(e.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w];
}

function EmptyNote({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[120px] items-center justify-center rounded-md border border-hair bg-bg/40 px-4 text-center text-[11.5px] leading-relaxed text-faint">
      {children}
    </div>
  );
}

/** Paired proportion bars (e.g. alquilada vs. propia). */
function Bars({ rows }: { rows: { label: string; pct: number | null; color: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="mb-1 flex justify-between text-[11px]">
            <span className="text-muted">{r.label}</span>
            <span className="tnum font-semibold">
              {r.pct == null ? "—" : `${r.pct.toFixed(1)}%`}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-sm bg-white/5">
            <div
              className="h-full rounded-sm transition-[width]"
              style={{ width: `${r.pct ?? 0}%`, background: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function GrowthSeries({
  bundle,
  distId,
  period,
  currency,
}: {
  bundle: DataBundle;
  distId: string;
  period: Period;
  currency: Currency;
}) {
  const [ref, w] = useWidth();
  if (periodHasNoSeries(period)) {
    return (
      <div ref={ref}>
        <EmptyNote>
          Sin serie de renta antes de {2010}. La serie robusta empieza en la
          administración 2010–2014.
        </EmptyNote>
      </div>
    );
  }
  const years = periodYears(period);
  const byCur = bundle.rent.districts[distId]?.byCurrency[currency];
  const pts = years
    .map((y) => ({ year: y, v: byCur?.[String(y)]?.growthPct ?? null }))
    .filter((p): p is { year: number; v: number } => p.v != null);

  if (pts.length === 0) {
    return (
      <div ref={ref}>
        <EmptyNote>Sin dato de crecimiento para este distrito en el periodo.</EmptyNote>
      </div>
    );
  }

  const H = 120;
  const padL = 30;
  const padR = 8;
  const padT = 10;
  const padB = 18;
  const vals = pts.map((p) => p.v).concat(IPC_ANCHOR);
  const lo = Math.min(...vals) - 1;
  const hi = Math.max(...vals) + 1;
  const x = (i: number) =>
    padL + (pts.length === 1 ? 0 : (i / (pts.length - 1)) * (w - padL - padR));
  const y = (v: number) => padT + (1 - (v - lo) / (hi - lo || 1)) * (H - padT - padB);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");

  return (
    <div ref={ref}>
      <svg width={w} height={H} role="img" aria-label="Serie de crecimiento del alquiler">
        <line x1={padL} y1={H - padB} x2={w - padR} y2={H - padB} stroke="rgba(255,255,255,.12)" />
        <line
          x1={padL}
          y1={y(IPC_ANCHOR)}
          x2={w - padR}
          y2={y(IPC_ANCHOR)}
          stroke={COLORS.ink}
          strokeDasharray="3 3"
          strokeOpacity={0.5}
        />
        <text x={w - padR} y={y(IPC_ANCHOR) - 3} textAnchor="end" fontSize="9" fill={COLORS.faint}>
          IPC {IPC_ANCHOR}%
        </text>
        <path d={line} fill="none" stroke={COLORS.accent} strokeWidth={2} strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={p.year}>
            <circle cx={x(i)} cy={y(p.v)} r={2.6} fill={COLORS.accent} />
            <text x={x(i)} y={H - 5} textAnchor="middle" fontSize="9" fill={COLORS.faint} className="tnum">
              {p.year}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

export function LinkedChart({
  bundle,
  distId,
  lens,
  period,
  currency,
}: {
  bundle: DataBundle;
  distId: string;
  lens: LensId;
  period: Period;
  currency: Currency;
}) {
  const cfg = LENS_BY_ID[lens];
  let body: ReactNode;

  if (lens === "growth") {
    body = <GrowthSeries bundle={bundle} distId={distId} period={period} currency={currency} />;
  } else if (lens === "rentals") {
    const t = bundle.tenencia.districts[distId];
    body = t ? (
      <Bars
        rows={[
          { label: "Alquilada", pct: t.rentedPct, color: COLORS.accent },
          { label: "Propia", pct: t.ownedPct, color: "#5fbf6a" },
        ]}
      />
    ) : (
      <EmptyNote>Sin dato de tenencia (Censo) para este distrito.</EmptyNote>
    );
  } else if (lens === "foreign") {
    const n = bundle.nacionalidad.districts[distId];
    body =
      n && n.foreignPct != null ? (
        <Bars
          rows={[
            { label: "Extranjera", pct: n.foreignPct, color: "#a877c4" },
            { label: "Nacional", pct: 100 - n.foreignPct, color: "#4d2f6b" },
          ]}
        />
      ) : (
        <EmptyNote>Sin dato censal de nacionalidad para este distrito.</EmptyNote>
      );
  } else if (lens === "access") {
    const a = bundle.accesibilidad.districts[distId];
    body = a ? (
      <Bars
        rows={[
          { label: "Índice 0–100", pct: a.index, color: "#54c7cf" },
        ]}
      />
    ) : (
      <EmptyNote>Sin índice de accesibilidad para este distrito.</EmptyNote>
    );
  } else {
    const d = bundle.drivers.districts[distId];
    body = d ? (
      <Bars
        rows={[
          { label: "Presión compuesta", pct: d.compositeIndex, color: "#cf4763" },
          { label: "Desplazamiento", pct: d.displacement, color: "#f3884e" },
        ]}
      />
    ) : (
      <EmptyNote>Sin índice de drivers para este distrito.</EmptyNote>
    );
  }

  return (
    <div className="mt-3">
      <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[.07em] text-faint">
        {lens === "growth" ? "Serie del distrito" : "Composición"}
        <span className="ml-1.5 font-normal normal-case text-dim">· {cfg.unit}</span>
      </div>
      {body}
    </div>
  );
}
