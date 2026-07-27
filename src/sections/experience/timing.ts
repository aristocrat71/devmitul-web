/**
 * CASE FILES' choreography table (design-doc §7 / implementation-plan §4), one
 * constants module per section (CLAUDE.md conventions).
 *
 * The leaf scrub reads all of it; the per-index delays the JSX writes as CSS
 * variables are the evidence stagger and the status stamp. Beats identical for
 * every file live in `experience.css`, in the one place they're used.
 */
import type { BoundaryTiming } from "@/hooks/useBoundaryZoom";

/**
 * The leaf-through: two toss windows, each quantized to three discrete poses,
 * with the remaining files fanned by depth so all three tabs stay visible
 * (design-doc §7). Ported from the approved mockup's own math — the toss is a
 * pure function of progress applied per tick rather than a chain of tweens,
 * which is what makes it trivially reversible and leaves no tween from-values
 * to clobber the resting stack (the §2 lesson, and how the camera works).
 */
export const CASES_LEAF = {
  /**
   * Toss window per file, in scene progress. The last file never tosses.
   *
   * **Amendment 2026-07-27 (Mitul's call — moving through the case files took
   * too long):** the scene came down 360 → 280vh, and these windows moved with
   * it so the READING HOLDS absorb the whole cut — each hold lost ~30%, while
   * a toss still covers ~31vh of scroll (was 36) and the outbound boundary
   * kept its absolute size (it was already the tightest in the book). The
   * mockup's 28–38% / 60–70% described a 460vh scene that no longer exists.
   */
  tosses: [
    { a: 0.24, b: 0.35 },
    { a: 0.55, b: 0.66 },
  ],
  /** Discrete poses per toss. Stepped, never a tween (CLAUDE.md rule 3). */
  steps: 3,
  /** The toss pose at full extent: up-left, rotating, gone. */
  toss: { xPercent: -120, yVh: -14, rotate: -24 },
  /** Applied once per file still stacked above this one. */
  depth: { x: 10, y: 12, rotate: 1.2, scale: 0.015 },
  /**
   * Past this the polaroid pulses. The dive target has to be on screen and
   * announcing itself before the About transition can begin (design-doc §7),
   * and the last file has been the top of the stack since 66%.
   */
  outroAt: 0.84,
} as const;

/**
 * A file reaching the top of the stack performs (implementation-plan §4.4).
 * Only the per-index values live here; the STATUS stamp's +0.25s is the same
 * for every file, so it lives in `experience.css` where it's used rather than
 * being mirrored here and drifting.
 */
export const CASES_FOCUS = {
  /** The first evidence ticket lands here, the rest follow a stagger apart. */
  evidence: 0.35,
  /** 60ms, per the approved sign-off. */
  evidenceStagger: 0.06,
} as const;

/**
 * The page's entrance, driven by the *previous* boundary's scrub over its final
 * 79–100% (`driveAssemble`). Values are fractions of that window.
 *
 * Only two targets, per implementation-plan §4.8 — "header + stack stamping in
 * with CASE 003 performing". The header lands first, then the whole docket
 * arrives as one object, which is also the only honest option: the leaf scrub
 * owns every file's transform AND opacity, so a file cannot carry an entrance
 * pose of its own without two writers fighting over it (CLAUDE.md rule 10). The
 * stack element is free, so the docket stamps in there and the files ride it.
 */
export const CASES_ASSEMBLE = {
  window: 0.5,
  head: 0,
  stack: 0.5,
} as const;

/**
 * Experience → About: the target zoom into the CASE 001 polaroid — entering
 * the origin story through the oldest photo in the record, under "LET'S DO
 * THIS ONE LAST TIME...." (design-doc §7).
 *
 * THE TIGHT ONE. The polaroid announces itself from `outroAt` (0.84), so the
 * boundary owns 0.84–1.0 — ~45vh of a 280vh scene, against 63vh on each
 * camera-walk page and ~180vh on the cover. The pulse gets however long the
 * reader rests at the top of the file (it's an infinite loop; the gate is
 * the zoom, not a window), and the caption hold comes out at ~8vh — a fast
 * flick can outrun it. Flagged rather than fixed: the honest fix is more
 * scene (one number in App.tsx's BOOK), and Mitul has cut these lengths
 * three times on purpose — the 2026-07-27 cut (360 → 280) re-mapped this
 * table so the boundary kept its absolute scroll while the reading holds
 * paid for the whole cut. Phases are fractions of the scene's scrub.
 */
export const CASES_BOUNDARY: BoundaryTiming = {
  /** Only the title box — the docket IS the printed page; it exits with the
      world fade rather than vanishing from under the growing polaroid. */
  fade: { at: 0.845, duration: 0.047 },
  zoom: { at: 0.858, duration: 0.085 },
  ink: { at: 0.891, duration: 0.032 },
  worldFade: { at: 0.918, duration: 0.03 },
  worldOff: 0.95,
  captionIn: 0.954,
  captionExit: { at: 0.984, duration: 0.011 },
  gutterFade: { at: 0.98, duration: 0.02 },
  /** ORIGIN STORY prints 7 targets in ~14vh — but the camera over there is
      parked zoomed into C1, so only the paper, the title's corner and the
      greeting cell are ever in frame while it happens. */
  assembleFrom: 0.949,
} as const;
