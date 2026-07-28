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

/**
 * Rewritten 2026-07-28 (Mitul: details, not "regular ass quotes"). The arc is
 * the approved one and so is the shape — code box, two alternating bio lines,
 * punchline — but the two middle captions were abstractions of a real career
 * ("teaching machines to see, hear and think" / "giving them a platform to
 * express themselves") and now name what actually happened: the satellites are
 * NRSC @ ISRO, the dogs are DogVision, and the shift to shipping product is
 * Canspirit and Unravel. Sourced, like the appendix below.
 *
 * The motto in the code box is untouched — it's Mitul's own line, not filler.
 */
export const CAPTIONS: readonly Caption[] = [
  { text: "while(True) { Design; Code; Refine; }", code: true },
  { text: "STARTED BY TEACHING MACHINES TO SEE — SATELLITES FIRST, THEN DOGS." },
  {
    text: "...THEN STARTED BUILDING THE THINGS PEOPLE ACTUALLY CLICK ON.",
    right: true,
  },
  { text: "STILL DOING BOTH. THIS PAGE IS EXHIBIT A.", right: true },
] as const;

/* ---- C3 — the appendix ---------------------------------------------------
   The twelve tech tickets that used to live here are gone (Mitul, 2026-07-28:
   "nobody cares about that in this day and age"). What replaces them is the
   same section making a stronger claim: not the tools, but what was done with
   them and where that was observed. A dossier page should print evidence.

   **Every line below is sourced from elsewhere in this repo** — the case files
   in `sections/experience/content.ts` and the featured trio in
   `sections/projects/content.ts`. Nothing here is invented. On a page whose
   whole conceit is a case file, a detail that isn't true of one of those has
   no business being printed as an observation (the same reasoning the witness
   rule applies to quotes).

   The tech itself hasn't left the site: the projects still stamp their chips
   and every case file still prints its four evidence tickets. It just isn't
   listed as a wall of nouns any more. */

export interface Detail {
  /** The claim, set in display face — what the subject can demonstrably do. */
  power: string;
  /** Where it was observed. The evidence line, in utility face beneath it. */
  source: string;
}

/**
 * Five, and deliberately five different *kinds* of ability rather than five
 * entries from the same job: research, operations, breadth, invention, craft.
 * A sixth was cut for space — the panel is a document lying on the page, and
 * it has to stay readable at the camera's resting distance.
 */
export const DETAILS: readonly Detail[] = [
  {
    power: "TAUGHT A MODEL TO READ FARMLAND FROM ORBIT",
    source: "CROP-MAPPING & YIELD PREDICTION ・ NRSC @ ISRO, 2024",
  },
  {
    power: "MOVED A CLIENT'S CLOUD WITHOUT DROPPING A ROW",
    source: "ZERO-DATA-LOSS MIGRATION RUNBOOKS ・ UNRAVEL TECH",
  },
  {
    power: "SHIPPED A DOCX CRAFTER, A WINE STORE AND A CHATBOT",
    source: "THREE CLIENT BUILDS, END TO END ・ CANSPIRIT.AI, 2025",
  },
  {
    power: "GAVE REAL LIFE AN XP BAR",
    source: "OPTILIFE ・ SIDE QUESTS WORTH TEN XP EACH",
  },
  {
    power: "BUILT THIS ISSUE BY HAND, PAGE BY PAGE",
    source: "NO TEMPLATE, NO PAGE BUILDER ・ 60FPS UNDER 4× THROTTLE",
  },
];

/**
 * The document's closing line. It exists because dropping the tech list has
 * one fair objection — a reader looking for "does he know React" now has
 * nowhere to look — and the honest answer is that the tools are still on the
 * site, printed against the job or the project that used them, which is worth
 * more than the same words in a grid. A dossier would print the cross-
 * reference, so this one does.
 */
export const APPENDIX_FOOT =
  "TOOLS FILED WITH THE JOBS THAT USED THEM ・ SEE CASE FILES, PAGE 02";

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
