/**
 * ORIGIN STORY's choreography table (design-doc §8), one constants module per
 * section (CLAUDE.md conventions).
 *
 * The values here are the ones the JSX writes as CSS variables, because they're
 * computed per index — stamp delays, caption stagger, the twelve skill tickets.
 * Beats that are identical for every instance (durations, the stepped eases)
 * live in `about.css`, in the one place they're used, rather than being
 * mirrored here and drifting.
 */
import type { CameraWalk } from "@/components/scene/CameraWalkScene";
import type { BoundaryTiming } from "@/hooks/useBoundaryZoom";
import type { MegaPageAssemble } from "@/hooks/useMegaPageAssemble";

/**
 * The camera's reading path (design-doc §8): hold C1 WASSUPPP → pan → hold C2
 * THE ORIGIN → pan ↓ → hold C3 POWERS → pull-back reveal → hold the full page,
 * with C4's finale bubble stamped in as the page lifts away.
 *
 * This is deliberately the same table as `PROJECTS_WALK`: §8 specifies ORIGIN
 * STORY as the structural twin of THE GOOD PART — same page dimensions, same
 * 2×2 coordinates, same reading path — so an identical walk is the spec, not a
 * copy-paste. It stays a per-section constant rather than a shared one because
 * the two pages' pacing is free to diverge (their closing holds host different
 * dives), and a shared table would couple them silently.
 *
 * **Inherited amendment (2026-07-26):** the opening hold is 5%, not the
 * mockup's 20%, for the reason THE GOOD PART was amended — in the book the
 * camera is already parked on the first cell through the whole of the previous
 * boundary's assembly window while the page prints in around it, so the
 * mockup's own opening hold double-counts and the first panel ends up held
 * nearly twice as long as the others. Every later segment keeps its exact
 * duration; the 15% that frees up goes to the closing hold, which is where the
 * About → Contact dive will live.
 */
export const ABOUT_WALK: CameraWalk = {
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
  // Focus hands over at each pan's midpoint; past the last window the
  // pull-back has begun and every cell performs (design-doc §8's global rule).
  focusUntil: [0.11, 0.41, 0.67],
  outroAt: 0.67,
} as const;

/**
 * Where the pull-back ends and the camera comes to rest on the whole page —
 * "pulsing once the camera settles" (design-doc §8, C4). It is the last
 * segment's start on purpose: the finale bubble stamps in during the pull-back
 * so it's never revealed empty, and only starts pulsing once the camera has
 * actually stopped, so the pulse reads as the page inviting a reply rather than
 * as one more thing moving while the camera is still travelling.
 */
export const ABOUT_SETTLED_AT = 0.79;

/** Camera arrival → the cell performs (design-doc §8). */
export const ABOUT_FOCUS = {
  /** C1: the greeting pops first, then the three stamps slam around the frame. */
  tagDelays: [0.35, 0.47, 0.59],
  /** C1: the margin scribble lands last, after the stamps. */
  scribbleDelay: 0.7,
  /** C2: narration captions, one after another down the panel. */
  capStagger: 0.18,
  /** C2: the optional gag inset, after the captions. */
  gagDelay: 0.7,
  /** C3: twelve punched tickets, 60ms apart — the approved appendix stagger. */
  powerStagger: 0.06,
} as const;

/** C4's furniture, stamped in as the pull-back reveals it. */
export const ABOUT_OUTRO = {
  figure: 0.05,
  bubble: 0.2,
} as const;

/**
 * The page's entrance, driven by the *previous* boundary's scrub over its final
 * 79–100% (`driveAssemble`). Values are fractions of that window.
 *
 * Same shape and reasoning as THE GOOD PART's: print order is also camera
 * order, so the paper, the title box and C1 print in frame while everything
 * after them stamps in off-camera — packed tightly and overlapping, running
 * right up to the boundary, because nothing the reader can see is waiting on
 * them. By the time the camera pans to C2 its destination has been complete
 * for a while.
 */
export const ABOUT_ASSEMBLE: MegaPageAssemble = {
  window: 0.3,
  page: 0,
  title: 0.08,
  cells: [0.18, 0.42, 0.52, 0.62],
  folio: 0.7,
} as const;

/**
 * About → Contact: the target zoom into the finale speech bubble — entering
 * the bubble IS starting the conversation, under "SAY HELLOOO..."
 * (design-doc §8). The same table as `PROJECTS_BOUNDARY` for the same reason
 * the walks match: the two pages are structural twins with identical closing
 * holds, and this one stays a per-section constant so their boundaries stay
 * free to diverge. Phases are fractions of the scene's scrub.
 *
 * The bubble pulses from `ABOUT_SETTLED_AT` (0.79) and keeps pulsing through
 * the early fade — the gate is the zoom's start, so the page invites right up
 * until the reader commits.
 */
export const ABOUT_BOUNDARY: BoundaryTiming = {
  fade: { at: 0.81, duration: 0.05 },
  zoom: { at: 0.82, duration: 0.079 },
  ink: { at: 0.85, duration: 0.03 },
  worldFade: { at: 0.875, duration: 0.028 },
  worldOff: 0.905,
  captionIn: 0.91,
  captionExit: { at: 0.955, duration: 0.02 },
  gutterFade: { at: 0.958, duration: 0.03 },
  /** Drives `driveAssemble("backcover")` — a no-op until §6 registers its
      entrance; the window (0.94–1.0, 18vh) is the back cover's to spend. */
  assembleFrom: 0.94,
} as const;
