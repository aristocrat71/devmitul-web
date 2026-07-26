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
 * The camera's reading path over the scene's 520vh — the approved mockup's
 * own segment map, verbatim (design-doc §6): hold Tablo → pan → hold OptiLife
 * → pan ↓ → hold DogVision → pull-back reveal → hold the full page. Focus
 * zoom ≈ 60% viewport width / 72% height; fit leaves 8% of void all around.
 * Do not retune without a design amendment.
 */
export const PROJECTS_WALK: CameraWalk = {
  focus: { w: 0.6, h: 0.72 },
  fitMargin: 0.92,
  segments: [
    { a: 0, b: 0.2, from: 0, to: 0 },
    { a: 0.2, b: 0.32, from: 0, to: 1 },
    { a: 0.32, b: 0.5, from: 1, to: 1 },
    { a: 0.5, b: 0.62, from: 1, to: 2 },
    { a: 0.62, b: 0.8, from: 2, to: 2 },
    { a: 0.8, b: 0.94, from: 2, to: 3 },
    { a: 0.94, b: 1, from: 3, to: 3 },
  ],
  focusUntil: [0.26, 0.56, 0.82],
  outroAt: 0.82,
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
 * Order is print order: the paper first, then the title box, then the cells
 * one at a time, then the folio — so the page reads as being printed rather
 * than faded in. Each element plays its own three stamp poses over `window`;
 * the last one lands exactly at 1.
 */
export const PROJECTS_ASSEMBLE = {
  window: 0.28,
  page: 0,
  title: 0.12,
  cells: [0.24, 0.36, 0.48, 0.6],
  folio: 0.72,
} as const;
