import { useAtlasStore } from "../store/useAtlasStore";
import { LENS_BY_ID } from "../data/lenses";
import { REGIONS } from "../data/regions";
import { IPC_ANCHOR } from "../data/tokens";
import {
  formatRent,
  rentForDisplay,
  resolveValue,
} from "../data/select";
import type { Currency, DataBundle, LensId, Period } from "../data/types";
import type { DistrictInfo } from "../data/loaders";
import { RegionIconRow } from "./RegionIcon";
import { LinkedChart } from "./LinkedChart";

type Row = [string, string];

function rowsFor(
  bundle: DataBundle,
  lens: LensId,
  info: DistrictInfo,
  period: Period,
  currency: Currency,
): Row[] {
  const id = info.id;
  const rows: Row[] = [];
  if (lens === "growth") {
    const { offer, effective } = rentForDisplay(bundle, id, period, currency);
    rows.push(["Renta de oferta", formatRent(offer, currency)]);
    rows.push(["Renta efectiva (ENAHO)", formatRent(effective, currency)]);
  } else if (lens === "rentals") {
    const t = bundle.tenencia.districts[id];
    rows.push([
      "Unidades en alquiler",
      t?.rentedUnits != null ? Math.round(t.rentedUnits).toLocaleString("es-CR") : "—",
    ]);
    rows.push([
      "% alquilada / propia",
      t?.rentedPct != null && t?.ownedPct != null
        ? `${t.rentedPct.toFixed(0)}% / ${t.ownedPct.toFixed(0)}%`
        : "—",
    ]);
    rows.push(["Ola censal", t?.wave != null ? String(t.wave) : "—"]);
  } else if (lens === "foreign") {
    const n = bundle.nacionalidad.districts[id];
    rows.push(["Población extranjera", n?.foreignPct != null ? `${n.foreignPct.toFixed(1)}%` : "—"]);
    rows.push(["Nacional", n?.foreignPct != null ? `${(100 - n.foreignPct).toFixed(1)}%` : "—"]);
    rows.push(["Ola censal", n?.wave != null ? String(n.wave) : "—"]);
  } else if (lens === "access") {
    const a = bundle.accesibilidad.districts[id];
    rows.push(["Índice 0–100", a?.index != null ? String(Math.round(a.index)) : "—"]);
    rows.push(["Escuela más cercana", a?.distSchoolM != null ? `${Math.round(a.distSchoolM)} m` : "—"]);
    rows.push(["Salud más cercana", a?.distHealthM != null ? `${Math.round(a.distHealthM)} m` : "—"]);
  } else {
    const d = bundle.drivers.districts[id];
    rows.push(["Plusvalía (proxy ONT)", d?.plusvalia != null ? String(Math.round(d.plusvalia)) : "—"]);
    rows.push(["Densidad Airbnb", d?.airbnbDensity != null ? String(Math.round(d.airbnbDensity)) : "—"]);
    rows.push(["Zona turística", d?.touristZone == null ? "—" : d.touristZone ? "Sí" : "No"]);
  }
  // Renta media always present (currency-aware, honest about source).
  const { offer } = rentForDisplay(bundle, id, period, currency);
  rows.push([`Renta media · ${currency}`, formatRent(offer, currency)]);
  return rows;
}

function Column({
  info,
  bundle,
  lens,
  period,
  currency,
  domain,
  compare,
  locked,
  onUnlock,
}: {
  info: DistrictInfo;
  bundle: DataBundle;
  lens: LensId;
  period: Period;
  currency: Currency;
  domain: [number, number] | null;
  compare: boolean;
  locked: boolean;
  onUnlock: () => void;
}) {
  const region = REGIONS[info.region];
  const rv = resolveValue(bundle, lens, info.id, period, currency, domain);
  const rows = rowsFor(bundle, lens, info, period, currency);
  const lensLabel = LENS_BY_ID[lens].label;

  // Drivers ethics block — only with a real, positive displacement figure.
  const d = bundle.drivers.districts[info.id];
  const showEthics = lens === "drivers" && d?.displacement != null && d.displacement > 0;
  const dollarized =
    currency === "CRC" && d?.touristZone === true; // dollarized rents common in tourist zones

  return (
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between gap-2.5">
        <div className="min-w-0">
          <div className="truncate text-[18px] font-bold tracking-tight">{info.name}</div>
          <div className="mt-0.5 text-[11.5px] text-muted">
            {region.name}
            {info.regionProvisional && (
              <span className="text-dim"> · región provisional</span>
            )}
          </div>
        </div>
        {locked && (
          <button
            type="button"
            onClick={onUnlock}
            className="flex-none rounded-[5px] border border-accent/30 bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent"
          >
            fijado ✕
          </button>
        )}
      </div>

      <div className="mt-3 border-t border-hair pt-3">
        <RegionIconRow region={info.region} accent={region.accent} size={compare ? 18 : 22} />
      </div>

      <div className="mt-4">
        <div className="text-[10.5px] font-semibold uppercase tracking-[.07em] text-faint">
          {lensLabel}
        </div>
        <div
          className={
            "tnum mt-1.5 font-bold leading-none tracking-tight " +
            (compare ? "text-[34px]" : "text-[46px]")
          }
        >
          {rv.label}
        </div>
        {lens === "growth" && rv.status === "ok" && rv.value != null && (
          <div className="tnum mt-1 text-[11px] text-muted">
            {(rv.value - IPC_ANCHOR >= 0 ? "+" : "") + (rv.value - IPC_ANCHOR).toFixed(1)} pts vs.
            IPC
          </div>
        )}
      </div>

      <div className="mt-3.5 flex flex-col">
        {rows.map(([k, v], i) => (
          <div
            key={k}
            className={
              "flex justify-between gap-2.5 py-1.5 " +
              (i ? "border-t border-white/5" : "")
            }
          >
            <span className="text-[12px] text-muted">{k}</span>
            <span className="tnum text-[12.5px] font-semibold">{v}</span>
          </div>
        ))}
      </div>

      {showEthics && (
        <div className="mt-3.5 rounded-[7px] border border-[#cf6a44]/30 bg-[#b03326]/10 px-3 py-2.5">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#e0a487]">
              Presión de desplazamiento
            </span>
            <span className="tnum text-[18px] font-bold text-[#f0b395]">
              {Math.round(d!.displacement!)}/100
            </span>
          </div>
          <div className="mt-1.5 font-serif text-[11px] italic leading-relaxed text-editorial">
            La identidad regional se documenta junto a la cifra de alza. El ícono cultural acompaña
            el dato duro — nunca lo sustituye.
          </div>
        </div>
      )}

      {dollarized && (
        <div className="mt-2.5 text-[10.5px] leading-relaxed text-[#8a909a]">
          ⚠ Zona con rentas frecuentemente dolarizadas: el valor en ₡ es referencial.
        </div>
      )}

      <LinkedChart bundle={bundle} distId={info.id} lens={lens} period={period} currency={currency} />
    </div>
  );
}

export function DetailCard({
  byId,
  bundle,
  lens,
  period,
  currency,
  domain,
}: {
  byId: Map<string, DistrictInfo>;
  bundle: DataBundle;
  lens: LensId;
  period: Period;
  currency: Currency;
  domain: [number, number] | null;
}) {
  const hoverId = useAtlasStore((s) => s.hoverId);
  const locks = useAtlasStore((s) => s.locks);
  const toggleLock = useAtlasStore((s) => s.toggleLock);

  const ids = locks.length ? locks : hoverId ? [hoverId] : [];
  const infos = ids.map((id) => byId.get(id)).filter((x): x is DistrictInfo => !!x);

  if (infos.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-5 text-center text-dim">
        <div className="max-w-[240px] text-[13px] leading-relaxed">
          Posá el cursor sobre un distrito para ver el detalle. Hacé clic para fijarlo y comparar
          hasta dos.
        </div>
      </div>
    );
  }

  const compare = infos.length > 1;
  const cfg = LENS_BY_ID[lens];

  return (
    <div>
      <div className="flex items-start gap-[18px]">
        {infos.map((info) => (
          <Column
            key={info.id}
            info={info}
            bundle={bundle}
            lens={lens}
            period={period}
            currency={currency}
            domain={domain}
            compare={compare}
            locked={locks.includes(info.id)}
            onUnlock={() => toggleLock(info.id)}
          />
        ))}
      </div>
      <div className="mt-4 border-t border-hair pt-3">
        <div className="text-[10.5px] text-faint">Fuente · {cfg.source}</div>
        <div className="mt-1.5 font-serif text-[11px] italic leading-relaxed text-[#8a909a]">
          {cfg.caveat}
        </div>
      </div>
    </div>
  );
}
