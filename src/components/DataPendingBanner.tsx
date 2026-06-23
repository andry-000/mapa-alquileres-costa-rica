interface Props {
  pending: boolean;
  synthetic: boolean;
}

/**
 * Jidoka, applied to the meta-state of the build itself: when the ETL has not
 * produced real artifacts (or has produced synthetic demo data), say so loudly
 * instead of letting an empty/seeded map look authoritative.
 */
export function DataPendingBanner({ pending, synthetic }: Props) {
  if (synthetic) {
    return (
      <div
        role="status"
        className="flex flex-none items-center gap-2.5 border-b border-[#cf6a44]/40 bg-[#b03326]/15 px-6 py-2 text-[11.5px]"
      >
        <span className="rounded bg-[#cf6a44] px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-bg">
          DATOS SINTÉTICOS
        </span>
        <span className="text-[#f0b395]">
          Valores generados por el seed de demostración — sólo para previsualizar
          la UI. No representan fuentes oficiales.
        </span>
      </div>
    );
  }
  if (pending) {
    return (
      <div
        role="status"
        className="flex flex-none items-center gap-2.5 border-b border-accent/30 bg-accent/10 px-6 py-2 text-[11.5px]"
      >
        <span className="rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-accent-ink">
          DATOS PENDIENTES
        </span>
        <span className="text-editorial">
          El mapa muestra geografía real de distritos; las métricas aparecerán al
          correr el ETL con las fuentes oficiales (INEC · SNIT · CCSS · …). Ver{" "}
          <span className="font-serif italic">README · etl/</span>.
        </span>
      </div>
    );
  }
  return null;
}
