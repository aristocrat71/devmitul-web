/**
 * ORIGIN STORY's choreography table (design-doc §8), one constants module per
 * section (CLAUDE.md conventions).
 *
 * The values here are the ones the JSX writes as CSS variables, because they're
 * computed per index or per cell — stamp delays, the collage captions' beat.
 * Beats that are identical for every instance (durations, the stepped eases)
 * live in `about.css`, in the one place they're used, rather than being
 * mirrored here and drifting.
 */
import type { CameraWalk } from "@/components/scene/CameraWalkScene";
import type { BoundaryTiming } from "@/hooks/useBoundaryZoom";
import type { MegaPageAssemble } from "@/hooks/useMegaPageAssemble";

/**
 * The camera's reading path (design-doc §8): hold C1 WASSUPPP → pan → hold C2
 * THE ORIGIN → pan ↓ → hold C3 POWERS → pan ← → hold C4 YOUR TURN → dive.
 *
 * This is deliberately the same table as `PROJECTS_WALK`: §8 specifies ORIGIN
 * STORY as the structural twin of THE GOOD PART — same page dimensions, same
 * 2×2 coordinates, same reading path — so an identical walk is the spec, not
 * a copy-paste. It stays per-section so the two remain free to diverge.
 *
 * **Amendment 2026-07-27 (Mitul's call):** C4 is now a real camera stop, the
 * same amendment THE GOOD PART got earlier the same day — the walk visits the
 * finale bubble before pulling back, instead of leaving it to be met only in
 * the zoomed-out reveal. This reverses the earlier call that the dive's
 * invitation needed the reveal to land first. Same scroll math as the twin
 * (both scenes are 300vh): every beat gives up a little to pay for the new
 * stop, the closing hold keeps 0.79–1.0 untouched because the boundary's
 * table owns it, and `outroAt` sits at the pan's START so the cell prints in
 * while the camera is still travelling toward it — arriving at blank paper
 * would break the never-reveal-empty rule in spirit.
 *
 * **Inherited amendment (2026-07-26):** the opening hold is 5%, not the
 * mockup's 20%, for the reason THE GOOD PART was amended — in the book the
 * camera is already parked on the first cell through the whole of the previous
 * boundary's assembly window while the page prints in around it, so the
 * mockup's own opening hold double-counts and the first panel ends up held
 * nearly twice as long as the others.
 *
 * **Amendment 2026-07-28 (Mitul's call, same table as the twin):** the
 * pull-back is CUT — the walk ends parked on C4 and the boundary dives into
 * the bubble from that close-up instead of zooming out first. Its 11% went
 * back to the beats that paid for the fourth stop; the boundary table is
 * untouched (`useBoundaryZoom` measures the target's rendered pose). The fit
 * pose stays in the keyframe set for reduced motion's park only.
 */
export const ABOUT_WALK: CameraWalk = {
  focus: { w: 0.6, h: 0.72 },
  fitMargin: 0.92,
  segments: [
    { a: 0, b: 0.06, from: 0, to: 0 },
    { a: 0.06, b: 0.16, from: 0, to: 1 },
    { a: 0.16, b: 0.31, from: 1, to: 1 },
    { a: 0.31, b: 0.41, from: 1, to: 2 },
    { a: 0.41, b: 0.56, from: 2, to: 2 },
    { a: 0.56, b: 0.66, from: 2, to: 3 },
    { a: 0.66, b: 1, from: 3, to: 3 },
  ],
  // Focus hands over at each pan's midpoint; the last window closes where the
  // boundary's table takes over (0.79), past which every cell performs — so
  // reverse entry from the back cover lands on a fully-performed page.
  focusUntil: [0.11, 0.36, 0.61, 0.79],
  outroAt: 0.56,
} as const;

/**
 * Where the last pan ends and the camera comes to rest on C4 — "pulsing once
 * the camera settles" (design-doc §8, C4). It is the last segment's start on
 * purpose: the finale bubble stamps in as the camera turns toward it (the
 * walk's `outroAt`), but it only starts pulsing once the camera has actually
 * stopped, so the pulse reads as the page inviting a reply rather than as one
 * more thing moving while the camera is still travelling. (0.79 before the
 * 2026-07-28 pull-back cut — the rest point moved with the walk.)
 */
export const ABOUT_SETTLED_AT = 0.66;

/** Camera arrival → the cell performs (design-doc §8). */
export const ABOUT_FOCUS = {
  /** C1: the greeting pops first, then the three stamps slam around the frame. */
  tagDelays: [0.35, 0.47, 0.59],
  /**
   * C2 and C3: the one caption under each collage (2026-07-28). Both cells
   * used to stagger a stack — four narration captions 180ms apart in C2, five
   * capability rows 130ms apart in C3 — and neither has a stack any more. The
   * collage itself doesn't perform: it prints with the cell, so the caption is
   * the only beat, and it lands where the second item of the old stack did so
   * the panel still reads picture-then-line rather than both at once.
   */
  collageCap: 0.22,
} as const;

/**
 * C4's furniture, stamped in as the camera turns toward it (`outroAt` = the
 * pan's start since the 2026-07-27 amendment) — printed and settled by the
 * time the camera arrives.
 */
export const ABOUT_OUTRO = {
  bubble: 0.05,
  /** The contact block answers the bubble, so it lands after it. */
  contact: 0.2,
  /** Résumé, then the two bookend buttons — print order, 90ms apart. */
  actions: [0.3, 0.39, 0.48],
} as const;

/**
 * How long the copied state holds before the subline restores itself
 * (mockup: 3s). The burst's own animation is shorter and runs independently —
 * it finishes while the subline is still reading IN YOUR CLIPBOARD.
 */
export const COPY_FEEDBACK_MS = 3000;

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
 * The bubble pulses from `ABOUT_SETTLED_AT` (0.66) and keeps pulsing through
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
