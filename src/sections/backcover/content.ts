/**
 * The back cover's copy — design-doc §9, verbatim. Every string on the page is
 * here so the approved wording is reviewable in one screen and nothing gets
 * "improved" in JSX.
 */

/** The conversion moment. Copied to the clipboard, never opened as a mailto. */
export const EMAIL = "sheth.mitul.71@gmail.com";

export const RESUME_URL =
  "https://drive.google.com/file/d/1eUYpN-34oYDib99id6B1CtPAyxouc4Es/view?usp=sharing";

/** Framing: the site is the real résumé, so the formal one is the boring one. */
export const RESUME_LABEL = "WANT A (BORING) FORMAL RESUME?";

export const BLURB = "ALWAYS OPEN TO DISCOVERIES AND COLLABORATIONS!";

/** Closing furniture. The stamp is also this page's heading (see the scene). */
export const STAMP = "BACK COVER ・ ISSUE #01";
export const BARCODE = "DEV-MITUL-01 ・ END";
export const NEXT_ISSUE = { kicker: "NEXT ISSUE", teaser: "???" } as const;

/** The email CTA's subline, in its three states. */
export const CTA = {
  /** At rest: the bold word is the instruction. */
  idleLead: "CLICK",
  idleRest: " TO COPY",
  copied: "IN YOUR CLIPBOARD ▸",
  /** Both copy paths refused (no clipboard API, no execCommand): show it. */
  manualBurst: "SELECT & COPY!",
  copiedBurst: "COPIED!",
} as const;

/**
 * The lettering wall — three viewport-spanning rows, each one word repeated
 * past both edges of the frame. Order is the reading order top to bottom, and
 * the treatments are fixed per row (hollow paper / solid acid / hollow cyan).
 *
 * LOVE's offset is frozen in CSS at `translateX(-9vw)`; the other two are
 * placed by measurement so a whole word lands where the composition wants it
 * (see `place-wall.ts`). Eight repeats overflow any viewport up to ~4K at the
 * approved type size.
 */
export const WALL_ROWS = [
  { word: "BUILD", place: "center" },
  { word: "LOVE", place: "frozen" },
  { word: "BELIEVE", place: "left" },
] as const;

export const WALL_REPEATS = 8;

/** The separator printed between repeats, magenta on the outer rows. */
export const WALL_SEPARATOR = "✦";
