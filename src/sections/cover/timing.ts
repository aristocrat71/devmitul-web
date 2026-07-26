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

/**
 * Resting rotations for the stamped furniture, in degrees. Single-sourced
 * because two owners must agree on them: the kit's entrance keyframes
 * (`rotate` props in the JSX) and the §2 transition scrub, which re-states
 * each pose inline the moment it takes `animation: none` ownership — a
 * mismatch would snap the element at the 6% handoff.
 */
export const COVER_ROT = {
  issueBox: -2,
  locationStamp: 3,
  barcode: 1.5,
  speaker: -7,
  scrollCue: 0,
} as const;

/**
 * §2 — the cover → projects transition, phases as fractions of the scene's
 * 330vh scrub. Values are the approved transition-mockup v5's timeline
 * (design-doc §5); do not retune without a design amendment.
 */
export const COVER_TRANSITION = {
  /** Above this the scrub owns entrance-animated elements (rule 11). */
  handoff: 0.06,
  /** Parallax is damped to 0 past this so idle motion never fights the dive. */
  parallaxOff: 0.1,
  /** Loose furniture pops off, staggered; each pop plays over `popWindow`. */
  pops: [
    { selector: ".cover__cue-text", rotate: COVER_ROT.scrollCue, at: 0.1 },
    { selector: ".cover__issue", rotate: COVER_ROT.issueBox, at: 0.12 },
    { selector: ".cover__location", rotate: COVER_ROT.locationStamp, at: 0.16 },
    { selector: ".cover__barcode-slot", rotate: COVER_ROT.barcode, at: 0.2 },
    { selector: ".cover__speaker-inner", rotate: COVER_ROT.speaker, at: 0.24 },
  ],
  popWindow: 0.077,
  /** Printed elements (masthead, credit, tagline, LinkedIn, character). */
  printedFade: { at: 0.3, duration: 0.15 },
  /** GitHub interior goes solid ink so the camera has ink to fly into. */
  diveSolid: 0.3,
  dive: { at: 0.3, duration: 0.32, z: 1163, pow: 1.6 },
  octoFade: { at: 0.42, duration: 0.12 },
  bgDissolve: { at: 0.46, duration: 0.12 },
  buttonFade: { at: 0.58, duration: 0.06 },
  /** Past this the cover is gone entirely (visibility, not just opacity). */
  coverOff: 0.645,
  captionIn: 0.65,
  captionExit: { at: 0.76, duration: 0.05 },
  gutterFade: { at: 0.79, duration: 0.07 },
  /** driveAssemble("projects") maps this window onto 0..1. */
  assembleFrom: 0.79,
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
