import { useAtlasStore } from "../store/useAtlasStore";
import { LENS_BY_ID } from "../data/lenses";
import type { Currency } from "../data/types";

const CURRENCIES: { id: Currency; label: string }[] = [
  { id: "CRC", label: "Colón ₡" },
  { id: "USD", label: "Dólar $" },
];

export function Header() {
  const lens = useAtlasStore((s) => s.lens);
  const currency = useAtlasStore((s) => s.currency);
  const setCurrency = useAtlasStore((s) => s.setCurrency);
  const source = LENS_BY_ID[lens].source;

  return (
    <header className="flex h-14 flex-none items-center justify-between gap-6 border-b border-hair px-6">
      <div className="flex items-baseline gap-3.5">
        <span className="text-[15px] font-bold tracking-tight">
          Atlas del Alquiler
        </span>
        <span className="text-[13px] text-dim">·</span>
        <span className="text-[13px] font-medium text-muted">
          Costa Rica · mercado de vivienda
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="hidden items-center gap-2 text-[11px] text-faint md:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-[#5fae8c]" aria-hidden />
          <span>
            Fuente: <span className="text-muted">{source}</span>
          </span>
        </div>
        <div
          role="group"
          aria-label="Moneda"
          className="flex overflow-hidden rounded-md border border-hair-strong"
        >
          {CURRENCIES.map((c) => {
            const active = currency === c.id;
            return (
              <button
                key={c.id}
                type="button"
                aria-pressed={active}
                onClick={() => setCurrency(c.id)}
                className={
                  "px-3 py-1.5 text-[11.5px] font-semibold transition-colors " +
                  (active
                    ? "bg-accent text-accent-ink"
                    : "text-muted hover:text-ink")
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
