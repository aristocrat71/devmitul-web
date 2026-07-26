/**
 * The cover's choreography table, mirroring design-doc §3.5 and the approved
 * `hero-cover-mockup.html`. One constants module per section (CLAUDE.md
 * conventions) — nothing here is duplicated inline in the JSX.
 *
 * Reading order of the load-in:
 *   misprint flash → masthead slam (+THWAK) → character pop →
 *   furniture stamps (~80ms apart) → banner wipe → interactive → cue last.
 */

/** Load-in delays, in seconds. Desktop total ≈ 1.6s. */
export const COVER_LOAD_IN = {
  mastheadSlam: 0.35,
  thwak: 0.55,
  /** How long after the pop the THWAK settles to its ghost. */
  thwakGhost: 1.6,
  character: 0.6,
  issueBox: 0.85,
  locationStamp: 0.95,
  credit: 1.05,
  barcode: 1.05,
  tagline: 1.15,
  speaker: 1.15,
  socials: 1.35,
  scrollCue: 1.6,
} as const;

/**
 * Slice-glitch stagger against the shared 5s loop. Deliberately coprime-ish
 * spacing: no two of these ever tick together, which is what separates
 * "signal interference" from "one scripted effect" (design-doc §3.3).
 * Not tempo-scaled — these are loop phases, not entrance delays.
 */
export const COVER_GLITCH = {
  masthead: 2.2,
  github: 3,
  linkedin: 5.5,
} as const;

/** Pointer-parallax depths in px, per design-doc §4. */
export const COVER_DEPTH = {
  background: -8,
  columnX: -14,
  columnY: -10,
  characterX: 16,
  characterY: 12,
  speakerX: 10,
  speakerY: 8,
} as const;

/**
 * Route a load-in delay through the section's tempo multiplier. `--cover-tempo`
 * is 1 on desktop and 0.5 under the 820px breakpoint, so the mobile cover runs
 * the same choreography in half the time (~0.8s, implementation-plan §1.3)
 * without a media query per element or a breakpoint read in JS.
 */
export function beat(seconds: number): string {
  return `calc(${seconds}s * var(--cover-tempo, 1))`;
}
