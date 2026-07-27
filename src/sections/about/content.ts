/**
 * ORIGIN STORY's copy inventory — verbatim from the design-doc §8 sign-off and
 * `about-page-mockup.html` v3. The page renders what's here; changing a line is
 * a design change, not a content edit.
 */

/** C1 — the subject introduces himself, in the bubble hanging off the frame. */
export const GREETING =
  "WASSUPPP! I AM MITUL SHETH — SLEEPYHEAD ENGINEER, READY TO SPEND SLEEPLESS NIGHTS WHEN COMMITTED TO A PROJECT!";

/* The handwritten photography gag that used to sit in C1's margin was cut
   (Mitul, 2026-07-27). It was the only sanctioned use of `--font-hand` on the
   site, so nothing renders in the handwritten face any more. */

/**
 * Personality stamps, slammed around C1's frame. Order is stamp order; each
 * one's angle, tint and corner are its own in `about.css`, because they're
 * layout and print decisions rather than content.
 */
export const TAGS = ["PHILOMATH", "AESTHETE", "WORKAHOLIC"] as const;

/** C2 — the origin narration, read top to bottom. */
export interface Caption {
  text: string;
  /** The ink/acid monospace code box — the motto, which opens the panel. */
  code?: boolean;
  /** Captions alternate sides down the panel. */
  right?: boolean;
}

export const CAPTIONS: readonly Caption[] = [
  { text: "while(True) { Design; Code; Refine; }", code: true },
  { text: "TEACHING MACHINES TO SEE, HEAR, AND THINK..." },
  {
    text: "...WHILE ALSO GIVING THEM A PLATFORM TO EXPRESS THEMSELVES.",
    right: true,
  },
  { text: "LIKE A WEBPAGE, MAYBE.", right: true },
] as const;

/** C3 — the skills appendix, stamped in as punched evidence tickets. */
export const POWERS = [
  "PYTHON",
  "C++",
  "TENSORFLOW",
  "KERAS",
  "PYTORCH",
  "REACT",
  "NODEJS",
  "POSTGRESQL",
  "MYSQL",
  "DOCKER",
  "GIT / GITHUB",
  "LINUX",
] as const;

/** C4 — the finale bubble, which is also the dive target into the back cover. */
export const FINALE = {
  line: "YOUR TURN. SAY SOMETHING ▸",
  next: "DIVE ▸ BACK COVER",
} as const;

/* ---- C4's contact block --------------------------------------------------
   Moved here from the back cover (Mitul, 2026-07-27). design-doc §9 printed the
   address, the résumé link and the two bookend buttons as back-cover furniture;
   they now answer the finale bubble in the same cell, and the back cover keeps
   only its blurb. The strings are unchanged. */

/** The conversion moment. Copied to the clipboard, never opened as a mailto. */
export const EMAIL = "sheth.mitul.71@gmail.com";

export const RESUME_URL =
  "https://drive.google.com/file/d/1eUYpN-34oYDib99id6B1CtPAyxouc4Es/view?usp=sharing";

/** Framing: the site is the real résumé, so the formal one is the boring one. */
export const RESUME_LABEL = "WANT A (BORING) FORMAL RESUME?";

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
