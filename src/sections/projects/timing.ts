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
