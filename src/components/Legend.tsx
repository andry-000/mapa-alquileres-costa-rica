import { LENS_BY_ID } from "../data/lenses";
import { rampGradient } from "../data/color";
import { GROWTH_SPAN, IPC_ANCHOR } from "../data/tokens";
import type { Currency, LensId } from "../data/types";

/**
 * Tick labels in ramp order (left → right). Positions are derived from the
 * index in render so the label always sits at the point it describes. For the
 * diverging growth lens the endpoints are the exact values normalize() maps to
 * 0 and 1 (IPC ± GROWTH_SPAN), so the scale shown matches the scale painted.
 */
function buildTicks(
  lens: LensId,
  domain: [number, number] | null,
): { labels: string[]; anchor: number | null } {
  switch (lens) {
    case "growth":
      return {
        labels: [
          `${(IPC_ANCHOR - GROWTH_SPAN).toFixed(1)}%`,
          "IPC",
          `+${(IPC_ANCHOR + GROWTH_SPAN).toFixed(1)}%`,
        ],
        anchor: 50,
      };
    case "access":
      return { labels: ["0", "100"], anchor: null };
    case "drivers":
      return { labels: ["bajo", "alto"], anchor: null };
    case "rentals":
    case "foreign": {
      const fmt = (n: number) =>
        lens === "foreign" ? `${n.toFixed(0)}%` : Math.round(n).toLocaleString("es-CR");
      return { labels: domain ? [fmt(domain[0]), fmt(domain[1])] : ["—", "—"], anchor: null };
    }
  }
}

export function Legend({
  lens,
  domain,
  currency,
}: {
  lens: LensId;
  domain: [number, number] | null;
  currency: Currency;
}) {
  const cfg = LENS_BY_ID[lens];
  const { labels, anchor } = buildTicks(lens, domain);

  return (
    <div className="border-b border-hair px-[18px] py-3.5">
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[.08em] text-faint">
          Leyenda
        </span>
        <span className="text-[11px] text-muted">
          {cfg.unit}
          {cfg.id === "growth" ? ` · ${currency}` : ""}
        </span>
      </div>

      <div className="relative">
        <div
          className="h-3 rounded-[3px] border border-white/10"
          style={{ background: rampGradient(cfg.ramp) }}
        />
        {anchor != null && (
          <div
            className="absolute top-[-2px] h-4 w-0.5 bg-ink"
            style={{ left: `${anchor}%` }}
            aria-hidden
          />
        )}
      </div>

      <div className="relative mt-1.5 h-4">
        {labels.map((label, i) => {
          const n = labels.length;
          const pos = n === 1 ? 50 : (i / (n - 1)) * 100;
          const transform =
            i === 0 ? "translateX(0)" : i === n - 1 ? "translateX(-100%)" : "translateX(-50%)";
          return (
            <span
              key={i}
              className="tnum absolute whitespace-nowrap text-[10.5px] text-muted"
              style={{ left: `${pos}%`, transform }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-muted">
        <span
          className="h-3 w-4 flex-none rounded-[3px] border border-white/10"
          style={{
            backgroundColor: "#2a2f37",
            backgroundImage:
              "repeating-linear-gradient(45deg,transparent 0 3px,rgba(255,255,255,.16) 3px 4px)",
          }}
          aria-hidden
        />
        <span>Sin dato</span>
        {cfg.diverging && (
          <span className="ml-auto flex items-center gap-1.5">
            <span className="h-3 w-0.5 bg-ink" aria-hidden />
            IPC nacional · {IPC_ANCHOR.toFixed(1)}%
          </span>
        )}
        {cfg.hasOverlay && (
          <span className="ml-auto flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full border-[1.5px] border-accent"
              aria-hidden
            />
            Equipamiento
          </span>
        )}
      </div>
    </div>
  );
}
