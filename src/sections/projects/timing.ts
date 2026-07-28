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
import type { BoundaryTiming } from "@/hooks/useBoundaryZoom";
import type { MegaPageAssemble } from "@/hooks/useMegaPageAssemble";

/**
 * The camera's reading path (design-doc §6): hold Tablo → pan → hold
 * Unhallucinate → pan ↓ → hold OptiLife → pan ← → hold the catalogue cell →
 * pull-back reveal → hold the full page. _The three panels are whatever
 * `PROJECTS` holds in order — the trio changed on 2026-07-28 and this table
 * did not, because it addresses camera stops, not projects._ Focus zoom ≈ 60% viewport width / 72% height;
 * fit leaves 8% of void all around. Do not retune without a design amendment.
 *
 * **Amendment 2026-07-26:** the opening hold is 5%, not the mockup's 20%. The
 * mockup was a standalone page whose camera started the moment you did; here
 * the camera is already parked on Tablo for the whole of the previous scene's
 * assembly window while the page prints in around it, so the mockup's own
 * opening hold double-counted and Tablo held nearly twice as long as the
 * other panels.
 *
 * **Amendment 2026-07-27 (Mitul's call):** the fourth cell is now a real
 * camera stop — the walk visits BROWSE THE BACK ISSUES + the CREW PASS
 * before pulling back, instead of leaving them to be met only in the
 * zoomed-out reveal. Every beat gives up a little scroll to pay for the new
 * stop inside the same 300vh (panel holds 54 → 39vh, pans 36 → 27vh,
 * pull-back 42 → 33vh); the closing hold keeps 0.79–1.0 untouched because
 * the boundary's table owns it. `outroAt` moved to the pan's START so the
 * cell prints in while the camera is still travelling toward it — arriving
 * at blank paper would break the never-reveal-empty rule in spirit.
 */
export const PROJECTS_WALK: CameraWalk = {
  focus: { w: 0.6, h: 0.72 },
  fitMargin: 0.92,
  segments: [
    { a: 0, b: 0.05, from: 0, to: 0 },
    { a: 0.05, b: 0.14, from: 0, to: 1 },
    { a: 0.14, b: 0.27, from: 1, to: 1 },
    { a: 0.27, b: 0.36, from: 1, to: 2 },
    { a: 0.36, b: 0.49, from: 2, to: 2 },
    { a: 0.49, b: 0.58, from: 2, to: 3 },
    { a: 0.58, b: 0.68, from: 3, to: 3 },
    { a: 0.68, b: 0.79, from: 3, to: 4 },
    { a: 0.79, b: 1, from: 4, to: 4 },
  ],
  // Focus hands over at each pan's midpoint, and everything performs once the
  // pull-back starts — the same relationships the mockup had, moved with the
  // segments rather than re-derived.
  focusUntil: [0.095, 0.315, 0.535, 0.68],
  outroAt: 0.49,
} as const;

/**
 * Camera arrival → the panel performs (design-doc §6, "Focus beats").
 *
 * **Amended 2026-07-28** with the panel redesign: what stamps in on arrival is
 * the three architectural spotlights, not the tech chips — the chips are a
 * static line on the footer rail now and perform nothing. The stagger doubled
 * with them, 60 → 120ms: the old value was tuned for four small chips landing
 * in a row, and three lines of display type read as one blur at that rate.
 */
export const PROJECTS_FOCUS = {
  /** First spotlight lands here, the rest follow one stagger apart. */
  spotDelay: 0.22,
  /** 120ms apart — three display-type lines, not four chips. */
  spotStagger: 0.12,
} as const;

/**
 * The fourth cell stamps in as the camera turns toward it (`outroAt` = the
 * pan's start since the 2026-07-27 amendment) — printed and settled by the
 * time the camera arrives.
 */
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
export const PROJECTS_ASSEMBLE: MegaPageAssemble = {
  window: 0.3,
  page: 0,
  title: 0.08,
  cells: [0.18, 0.42, 0.52, 0.62],
  folio: 0.7,
} as const;

/**
 * Projects → Experience: the target zoom into the CREW PASS ("you enter
 * employment through the employee card", design-doc §6), scrubbed over the
 * closing hold — the camera is parked at the fit pose from 0.79, so the page
 * holds a beat (0.79–0.81, ~6vh) and then empties around the badge.
 *
 * The whole boundary lives in 21% of a 300vh scene (63vh of scroll) where the
 * cover's got 70% of 260vh, so every phase is proportionally tighter; the
 * caption hold (0.91–0.955, ~13.5vh) is the widest slice left after the zoom
 * reads cleanly. Phases are fractions of the scene's scrub (see
 * `useBoundaryZoom` for what each one does).
 */
export const PROJECTS_BOUNDARY: BoundaryTiming = {
  fade: { at: 0.81, duration: 0.05 },
  zoom: { at: 0.82, duration: 0.079 },
  ink: { at: 0.85, duration: 0.03 },
  worldFade: { at: 0.875, duration: 0.028 },
  worldOff: 0.905,
  captionIn: 0.91,
  captionExit: { at: 0.955, duration: 0.02 },
  gutterFade: { at: 0.958, duration: 0.03 },
  /** CASE FILES has 2 pose targets (head, docket) — 18vh is enough. */
  assembleFrom: 0.94,
} as const;
