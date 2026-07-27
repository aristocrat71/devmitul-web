/**
 * Back-cover timing — the choreography tables from design-doc §9, in one place
 * (CLAUDE.md conventions). This page has no scrub of its own: it is 0vh long,
 * a resting viewport at the end of the book, so the only scroll-linked thing
 * here is its entrance, which the *about* boundary drives.
 */

/**
 * The three rows' glitch offsets against the shared 5s loop (design-doc §9:
 * 2.5 / 4.2 / 5.9s). Never equal — synced ticks read as one scripted effect
 * rather than interference, and this wall is the only motion on the page.
 */
export const WALL_GLITCH = [2.5, 4.2, 5.9] as const;

/**
 * The torn band's horizontal shove, in px. The mockup's own row glitch throws
 * +14 then −12; the kit's tick derives the second frame from the first, so one
 * number covers both (14 → −12.6).
 */
export const WALL_SHOVE = 14;

/**
 * The page's entrance, driven by the about boundary over its final 94–100%
 * (`driveAssemble("backcover")` — the window is ~18vh of scroll). Values are
 * fractions of that window; `window` is how much of it one element spends
 * travelling through the three poses.
 *
 * The order is the mockup's own load-in, rescaled: it stamps its furniture in
 * over 0.15s → 1.45s, and those delays map linearly onto this window, so the
 * wall still slides in row by row ahead of the contact block and the closing
 * furniture still lands last. What was a page-load cascade in a standalone
 * mockup is a scroll-driven assembly here — the beats and their order are the
 * approved ones either way.
 *
 * Everything renders complete with this never being called (engine contract):
 * a label jump, a fast flick past the window, or reduced motion all land on a
 * finished page.
 */
export const BACKCOVER_ASSEMBLE = {
  window: 0.3,
  /** BUILD, LOVE, BELIEVE — the wall arrives before anything printed on it. */
  rows: [0, 0.08, 0.16],
  stamp: 0.24,
  /* The email, résumé and bookend-button beats went to ORIGIN STORY with the
     contact block (Mitul, 2026-07-27). The blurb keeps its own slot rather
     than being pulled earlier — the wall still has to finish arriving before
     anything printed on it lands. */
  blurb: 0.57,
  nextIssue: 0.65,
  barcode: 0.7,
} as const;
