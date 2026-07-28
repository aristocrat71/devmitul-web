/**
 * ORIGIN STORY's copy inventory. C1 and C4 are still verbatim from the
 * design-doc §8 sign-off and `about-page-mockup.html` v3; C2 and C3 are not,
 * and the block above them says why. The page renders what's here; changing a
 * line is a design change, not a content edit.
 */

/** C1 — the subject introduces himself, in the bubble over the photograph. */
export const GREETING =
  "WASSUPPP! I AM MITUL SHETH — SLEEPYHEAD ENGINEER, READY TO SPEND SLEEPLESS NIGHTS WHEN COMMITTED TO A PROJECT!";

/* The handwritten photography gag that used to sit in C1's margin was cut
   (Mitul, 2026-07-27). It was the only sanctioned use of `--font-hand` on the
   site, so nothing renders in the handwritten face any more. */

/**
 * Personality stamps, slammed around C1's photograph. Order is stamp order;
 * each one's angle, tint and corner are its own in `about.css`, because
 * they're layout and print decisions rather than content.
 */
export const TAGS = ["PHILOMATH", "AESTHETE", "WORKAHOLIC"] as const;

/* ---- C2 and C3 — the two collage panels -----------------------------------
   **Amended 2026-07-28 (Mitul's call).** Both of these cells used to be text:
   C2 was the origin narration (the `while(True) { Design; Code; Refine; }`
   code box over three bio captions and a dashed placeholder for a gag inset),
   and C3 was POWERS & ABILITIES — five sourced capability rows over a
   cross-reference foot. All of it is gone. Each cell now prints one collage
   with one line under it.

   This is a change of subject, not just of format: the page's whole right-hand
   column was a second telling of the career, which PAGE 02 (the case files)
   already argues in full with evidence. What it wasn't saying was anything
   about the person. So the professional claims stay on the pages that can back
   them, and the profile page gets to be a profile — what he listens to, and
   what he does when he isn't at a desk.

   The lines below are Mitul's own words, set in the page's display face like
   every other caption on it. */

export const MUSIC_PANEL = {
  caption: "MUSIC IS MY HEART AND SOUL.",
  alt: "A collage of the albums and artists on heavy rotation — Travis Scott's ASTROWORLD and Rodeo art, Post Malone, Kanye West's The Life of Pablo, Graduation and 808s, and Linkin Park.",
} as const;

export const INTERESTS_PANEL = {
  caption:
    "LOVE GAMING WITH MY FRIENDS AND HANGING OUT WITH NATURE ONCE IN A WHILE :)",
  alt: "A collage of games and places — Dark Souls, Elden Ring, Bloodborne and Rainbow Six Siege key art above photographs of a lit-up ship at night, a city seen from a hillside at dusk, and a tree-lined road under an overcast sky.",
} as const;

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
