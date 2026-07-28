import dogvisionShot from "@/assets/projects/dogvision.webp";
import optilifeShot from "@/assets/projects/optilife.webp";
import tabloShot from "@/assets/projects/tablo.webp";

/**
 * THE GOOD PART's featured trio — the approved inventory from design-doc §6.
 * Copy is verbatim from the sign-off; the page renders what's here and adding
 * a fourth project is a design change, not a content edit.
 */
export interface Project {
  /** Display name — the panel's masthead, set across the print's left edge. */
  name: string;
  /**
   * The one-line hook. Printed as the masthead's kicker since the 2026-07-28
   * panel redesign; it used to pop as a speech bubble hanging off the panel.
   */
  hook: string;
  /**
   * Architectural spotlights — what is actually interesting under the hood,
   * stamped one at a time when the camera arrives. Three per project, and
   * three is the layout: a fourth does not fit the panel at the camera's focus
   * zoom, so adding one is a design change, not a content edit.
   *
   * Headlines only, by design. Each was read off the project's own repo — see
   * the note above each — because a spotlight is a claim about the code and
   * this page does not carry invented ones.
   */
  spots: readonly string[];
  /** The stack, printed as one dim line on the footer rail. */
  chips: readonly string[];
  repo: string;
  live: string;
  /**
   * The panel's screenshot. `alt` describes what the capture shows, not that
   * it is a screenshot — a reader who can't see it should learn the same thing
   * about the project that a reader who can does.
   */
  shot: { src: string; alt: string };
}

export const PROJECTS: readonly Project[] = [
  {
    name: "TABLO",
    hook: "YOUR AI CODING SESSIONS, BABYSAT BY A CAT.",
    // Copy is Mitul's own (2026-07-28). Sources for the three claims:
    //
    // 1. The avatar is a transparent, always-on-top window that is
    //    click-through except over the cat, and it aggregates BOTH agents —
    //    Claude Code (`~/.claude/projects/`) and Codex (`~/.codex/sessions/`)
    //    — into one count, panel and dashboard (`src-tauri/src/scanner.rs`,
    //    `codex.rs`; README "The four surfaces", "Two agents, one cat").
    // 2. Tauri 2 was chosen over Electron for footprint (tablo's CLAUDE.md,
    //    "Stack"), and the watching itself is cheap: byte-offset tailing that
    //    never re-parses a transcript, a 150ms event debounce over a 1Hz scan.
    //    _Caveat worth knowing before this line is quoted anywhere harder:_
    //    `memory-optimization-plan.md` measures released v1.0.0 at ~290MB
    //    phys_footprint, of which ~170MB is four WebKit `WebContent`
    //    processes. The Rust side is light; the webviews are not, and that
    //    plan exists to fix it.
    // 3. "Serverless" = no cloud, not no HTTP: approvals and jump-to-session
    //    ride a loopback `tiny_http` server (`permission.rs`). "Secure" is
    //    earned — a per-run secret header on every hook request, a 4MB body
    //    cap, a bounded pending queue, fail-closed deny on timeout, and
    //    `~/.claude/settings.json` is only edited on explicit user consent.
    spots: [
      "A CAT-WIDGET THAT FLOATS ON YOUR SCREEN, DISPLAYS ALL AGENT ACTIVITY",
      "RUST-BACKEND MAKES IT EXTREMELY LIGHTWEIGHT AND MEMORY EFFICIENT",
      "TINY - SERVERLESS - SECURE",
    ],
    chips: ["TAURI 2", "SVELTE", "TYPESCRIPT"],
    repo: "https://github.com/aristocrat71/tablo",
    live: "https://tablo-cat.netlify.app/",
    shot: {
      src: tabloShot,
      alt: "Tablo's landing page: the wordmark beside a pixel-art black cat with cyan eyes, above the line “a desktop cat that watches your AI coding agents for you”.",
    },
  },
  {
    name: "OPTILIFE",
    hook: "REAL LIFE, BUT WITH XP.",
    // The three decisions that govern the app, and where each one lives:
    //
    // 1. A game engine runs inside a productivity app. Flame + `flame_svg`
    //    own the biome world (`lib/screens/biome/biome_game.dart` — a 10×10
    //    isometric grid, which is exactly the 100-tree cap, foot-anchored
    //    sprites depth-sorted by `col + row`); Flutter owns every other
    //    screen. Both read the same store, so the reward is not a separate
    //    mode bolted on — it is the same data, drawn differently.
    // 2. There is no server and no sync layer. Every screen is a Riverpod
    //    `StreamProvider` over a Drift query on an on-device SQLite file
    //    (`lib/state/app_providers.dart`, `lib/data/database.dart` — clean v1
    //    schema, `PRAGMA foreign_keys = ON`, all screens date-scoped off one
    //    `selectedDateProvider` spine). The UI is a projection of the DB, so
    //    there is no second copy of the truth to keep in step.
    // 3. Progression is derived, never stored, which is what makes the loop
    //    reversible. Only `lifetimeLe` is persisted; `currentLevel`,
    //    `leIntoLevel` and `leUntilNext` are pure functions of it, computed on
    //    read (`lib/core/le_math.dart`). Unchecking a quest can therefore
    //    cross a level boundary downward and pop the newest tree
    //    (`ActionOutcome.leveledDown`, `lib/data/game_repository.dart`)
    //    without anything drifting out of sync.
    spots: [
      "A LIFE TRACKER WITH A GAME ENGINE INSIDE, DRAWING THE BIOME YOU EARN",
      "DRIFT OVER SQLITE MAKES EVERY SCREEN A LIVE, LOCAL QUERY",
      "OFFLINE - ACCOUNTLESS - REVERSIBLE",
    ],
    chips: ["FLUTTER", "RIVERPOD", "FLAME", "DRIFT"],
    repo: "https://github.com/aristocrat71/OptiLife",
    live: "https://optilife-web.netlify.app/",
    shot: {
      src: optilifeShot,
      alt: "OptiLife's landing page: the headline “Tired of your main quests? Recharge your Life Energy with some side quests.” beside a phone showing the Side Quests screen — Adventure, Fitness and Creative cards, each worth ten XP.",
    },
  },
  {
    name: "DOGVISION",
    hook: "WHAT BREED IS THAT CUTE PUPPY? THERE'S AN APP FOR THAT.",
    // Sources (the repo's GitHub project page): transfer learning over the
    // Stanford Dogs dataset, trained locally and frozen to a `.h5` the server
    // loads rather than retraining on deploy; React on Netlify and the Flask
    // inference API deployed independently; an upload returns the breed with
    // the model's confidence in one round trip.
    spots: [
      "TRANSFER-LEARNED ON STANFORD DOGS",
      "TWO TIERS, DEPLOYED APART",
      "UPLOAD, PREDICT, ANSWER",
    ],
    chips: ["TENSORFLOW", "KERAS", "FLASK", "REACT"],
    repo: "https://github.com/aristocrat71/DogVision",
    live: "https://aristocrat71-dogvision.netlify.app",
    shot: {
      src: dogvisionShot,
      alt: "DogVision's web app after a prediction: an uploaded photo classified as an Old English Sheepdog at 100% confidence, over a photograph of two golden retriever puppies.",
    },
  },
] as const;

/** The fourth cell's catalogue link — the full back catalogue of repos. */
export const BACK_ISSUES_URL =
  "https://github.com/aristocrat71?tab=repositories";
