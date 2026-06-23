import { useAtlasStore } from "../store/useAtlasStore";
import { LENSES } from "../data/lenses";

export function LensSwitcher() {
  const lens = useAtlasStore((s) => s.lens);
  const setLens = useAtlasStore((s) => s.setLens);

  return (
    <div className="border-b border-hair px-[18px] py-3.5">
      <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[.08em] text-faint">
        Las cinco lentes
      </div>
      <div className="flex flex-col gap-1" role="group" aria-label="Selector de lente">
        {LENSES.map((l) => {
          const active = l.id === lens;
          return (
            <button
              key={l.id}
              type="button"
              aria-pressed={active}
              onClick={() => setLens(l.id)}
              className={
                "flex w-full items-center gap-2.5 rounded-md border px-2.5 py-2 text-left text-[13px] transition-colors " +
                (active
                  ? "border-accent/45 bg-accent/10 font-semibold text-ink"
                  : "border-transparent text-ink-soft hover:bg-white/5")
              }
            >
              <span
                className={
                  "tnum flex h-[22px] w-[22px] flex-none items-center justify-center rounded-[5px] text-[11px] font-bold " +
                  (active ? "bg-accent text-accent-ink" : "bg-chip text-muted")
                }
              >
                {l.num}
              </span>
              <span className="flex-1">{l.label}</span>
              <span className="text-[10.5px] text-faint">{l.kind}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
