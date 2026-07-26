/**
 * ORIGIN STORY's copy inventory — verbatim from the design-doc §8 sign-off and
 * `about-page-mockup.html` v3. The page renders what's here; changing a line is
 * a design change, not a content edit.
 */

/** C1 — the subject introduces himself, in the bubble hanging off the frame. */
export const GREETING =
  "WASSUPPP! I AM MITUL SHETH — SLEEPYHEAD ENGINEER, READY TO SPEND SLEEPLESS NIGHTS WHEN COMMITTED TO A PROJECT!";

/**
 * The photography gag, scribbled inside C1. This is the ONE place in the whole
 * site where the handwritten face is permitted (CLAUDE.md conventions), which
 * is also why it is lowercase — it's a margin note, not printed copy.
 */
export const SCRIBBLE =
  "yeah... is it just me or do I need to work on my photography skills?";

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
