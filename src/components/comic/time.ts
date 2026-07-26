/**
 * A delay expressed as seconds, or as any CSS `<time>` value.
 *
 * The string form exists so a section can route its whole load-in through a
 * tempo multiplier — e.g. `calc(1.15s * var(--cover-tempo))`, which halves the
 * cover's choreography on mobile without a media query per element or a
 * JS breakpoint read.
 */
export type TimeValue = number | string;

export function toTime(value: TimeValue): string {
  return typeof value === "number" ? `${value}s` : value;
}
