/**
 * Wall composition (design-doc §9): a full BUILD sits centred and a full RISE
 * sits at the left edge, at any viewport, with the track always covering the
 * left edge so no row ever starts mid-frame. LOVE is not here — its −9vw is a
 * frozen, client-approved constant and lives in CSS.
 *
 * Measurement rules (CLAUDE.md rule 12): the wall is rotated −3° and scaled
 * 1.08, so a `getBoundingClientRect()` would read every width through that
 * transform. `offsetWidth` is layout-space and immune to it — which is also
 * why the offsets this returns are in layout px and applied *inside* the
 * rotated wall. Nothing here is load-time-only; the caller re-runs it on
 * resize, on font load, and on ScrollTrigger.refresh().
 */

/** The class the separator glyph carries — measured, so it must match. */
export const WALL_SEP_CLASS = "backcover__sep";

/** `.backcover__wall`'s side inset, as a fraction of the viewport (−8vw). */
const WALL_SIDE_INSET = 0.08;

/** Where a full RISE starts, as a fraction of the viewport. */
const RISE_LEFT = 0.03;

export type WallPlace = "center" | "left" | "frozen";

export interface WallTrack {
  /** The inline element holding the repeated word; owns only this transform. */
  el: HTMLElement;
  word: string;
  place: WallPlace;
}

/**
 * One word's width, and the width of one repeat unit (word + separator), as
 * rendered by this row's own type. Measured in a throwaway span inside the
 * row so it inherits the exact font, size and letter-spacing — sizes are in
 * vh, so every one of these changes with the viewport.
 */
function measureUnit(
  track: HTMLElement,
  word: string,
): { word: number; unit: number } | null {
  const host = track.parentElement;
  if (!host) return null;

  const probe = document.createElement("span");
  probe.style.cssText =
    "visibility:hidden;position:absolute;white-space:nowrap;display:inline-block";
  probe.textContent = word;
  host.appendChild(probe);
  const wordWidth = probe.offsetWidth;

  const sep = document.createElement("span");
  sep.className = WALL_SEP_CLASS;
  sep.textContent = "✦";
  probe.appendChild(sep);
  const unit = probe.offsetWidth;

  probe.remove();
  return { word: wordWidth, unit };
}

/**
 * Slide each measured track so the requested repeat lands where the
 * composition wants it. The offset is normalised into `(−unit, 0]` — one whole
 * repeat back — so the track always overhangs the left edge and the row reads
 * as an endless printed band rather than a string that starts somewhere.
 */
export function placeWall(tracks: readonly WallTrack[]): void {
  const vw = window.innerWidth;
  const pad = vw * WALL_SIDE_INSET;

  for (const { el, word, place } of tracks) {
    if (place === "frozen") continue;
    const measured = measureUnit(el, word);
    if (!measured || !measured.unit) continue;

    const targetLeft =
      place === "center" ? (vw - measured.word) / 2 : vw * RISE_LEFT;
    const offset = ((pad + targetLeft) % measured.unit) - measured.unit;
    el.style.transform = `translateX(${offset}px)`;
  }
}
