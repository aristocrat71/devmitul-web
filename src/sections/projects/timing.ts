/**
 * THE GOOD PART's choreography table (design-doc §6), one constants module per
 * section (CLAUDE.md conventions).
 *
 * Two owners share it. The values below are the ones the JSX writes as CSS
 * variables — per-chip stagger, per-element outro delays — because they're
 * computed per index. The beats that are the same for every panel (the bubble
 * pop at +0.15s, the LIVE pulse at 1.2s/+0.5s) live in the one place they're
 * used, `projects.css`, rather than being mirrored here and drifting.
 */
import type { CameraWalk } from "@/components/scene/CameraWalkScene";

/**
 * The camera's reading path over the scene's 520vh (design-doc §6): hold Tablo
 * → pan → hold OptiLife → pan ↓ → hold DogVision → pull-back reveal → hold the
 * full page. Focus zoom ≈ 60% viewport width / 72% height; fit leaves 8% of
 * void all around. Do not retune without a design amendment.
 *
 * **Amendment 2026-07-26:** the opening hold is 5%, not the mockup's 20%. The
 * mockup was a standalone page whose camera started the moment you did; here
 * the camera is already parked on Tablo for the whole of the previous scene's
 * assembly window — 21% of the cover's 330vh, ~69vh — while the page prints
 * in around it. Adding the mockup's own 20% on top double-counted, and Tablo
 * ended up holding 173vh against 94vh for each of the other panels: the
 * reader finished Tablo and then scrolled most of a screen with nothing
 * moving. 5% restores the balance (~95vh total, in line with the others).
 *
 * Every later segment keeps its exact duration; the 15% that frees up goes to
 * the closing hold, which is where the Projects → Experience dive will live
 * (a scene's length includes its outbound transition — see `book.ts`).
 */
export const PROJECTS_WALK: CameraWalk = {
  focus: { w: 0.6, h: 0.72 },
  fitMargin: 0.92,
  segments: [
    { a: 0, b: 0.05, from: 0, to: 0 },
    { a: 0.05, b: 0.17, from: 0, to: 1 },
    { a: 0.17, b: 0.35, from: 1, to: 1 },
    { a: 0.35, b: 0.47, from: 1, to: 2 },
    { a: 0.47, b: 0.65, from: 2, to: 2 },
    { a: 0.65, b: 0.79, from: 2, to: 3 },
    { a: 0.79, b: 1, from: 3, to: 3 },
  ],
  // Focus hands over at each pan's midpoint, and everything performs once the
  // pull-back starts — the same relationships the mockup had, moved with the
  // segments rather than re-derived.
  focusUntil: [0.11, 0.41, 0.67],
  outroAt: 0.67,
} as const;

/** Camera arrival → the panel performs (design-doc §6, "Focus beats"). */
export const PROJECTS_FOCUS = {
  /** First chip lands here, the rest follow one stagger apart. */
  chipDelay: 0.25,
  /** 60ms apart, per the approved sign-off. */
  chipStagger: 0.06,
} as const;

/** The fourth cell stamps in when the pull-back reveals it (past ~82%). */
export const PROJECTS_OUTRO = {
  backIssues: 0.05,
  crewPass: 0.2,
} as const;

/**
 * The page's entrance, driven by the *previous* boundary's scrub over its
 * final 79–100% (`driveAssemble`). Values are fractions of that window.
 *
 * Order is print order and also camera order: the paper, the title box, then
 * the cells starting with the one the camera is parked on, then the folio —
 * so the page reads as being printed rather than faded in. Each element plays
 * its own three stamp poses over `window`; the last lands exactly at 1.
 *
 * The front of the window is what the reader actually sees: the camera is
 * zoomed into the first cell, so the paper, the title and Tablo print in
 * frame while everything after them stamps in off-camera. Those later cells
 * are therefore packed tightly and overlapping — three of them in flight at
 * once — rather than queued one behind the other, and they run right up to
 * the scene boundary, which is where the camera takes over and pans to the
 * second panel. Nothing waits on anything: the pan's destination is complete
 * long before the camera starts moving.
 */
export const PROJECTS_ASSEMBLE = {
  window: 0.3,
  page: 0,
  title: 0.08,
  cells: [0.18, 0.42, 0.52, 0.62],
  folio: 0.7,
} as const;
