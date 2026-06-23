import { CR_ICONS, type IconDomain } from "../data/icons";
import type { RegionKey } from "../data/types";

interface Props {
  region: RegionKey;
  domain: IconDomain;
  size?: number;
  color: string;
}

/** A single regional line-glyph. Decorative (aria-hidden) — it never carries a
 *  value, per the icon ethics in the design system. */
export function RegionIcon({ region, domain, size = 22, color }: Props) {
  const set = CR_ICONS[region];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: set[domain] }}
    />
  );
}

/** fauna · flora · cultura row, with labels. */
export function RegionIconRow({
  region,
  accent,
  size = 22,
}: {
  region: RegionKey;
  accent: string;
  size?: number;
}) {
  const set = CR_ICONS[region];
  const domains: { d: IconDomain; label: string }[] = [
    { d: "fauna", label: set.faunaLabel },
    { d: "flora", label: set.floraLabel },
    { d: "cultura", label: set.culturaLabel },
  ];
  return (
    <div className="flex gap-3.5">
      {domains.map(({ d, label }) => (
        <div key={d} className="flex w-16 flex-col items-center gap-1.5">
          <span style={{ color: accent }}>
            <RegionIcon region={region} domain={d} size={size} color={accent} />
          </span>
          <span className="text-center text-[9px] leading-tight text-[#7c828a]">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
