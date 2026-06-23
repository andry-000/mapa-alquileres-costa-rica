// Ramp interpolation helpers shared by the map, legend and charts.

function hexToRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Sample a ramp at t∈[0,1], returning an "rgb(r,g,b)" string. */
export function rampColor(ramp: string[], t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  const n = ramp.length - 1;
  const f = clamped * n;
  const i = Math.floor(f);
  const r = f - i;
  if (i >= n) return ramp[n];
  const a = hexToRgb(ramp[i]);
  const b = hexToRgb(ramp[i + 1]);
  const mix = (k: number) => Math.round(a[k] + (b[k] - a[k]) * r);
  return `rgb(${mix(0)},${mix(1)},${mix(2)})`;
}

/** CSS gradient for the legend bar. */
export function rampGradient(ramp: string[]): string {
  return `linear-gradient(90deg, ${ramp.join(", ")})`;
}
