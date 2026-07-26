/**
 * THE GOOD PART's featured trio — the approved inventory from design-doc §6.
 * Copy is verbatim from the sign-off; the page renders what's here and adding
 * a fourth project is a design change, not a content edit.
 */
export interface Project {
  /** Display name, set in the panel's title. */
  name: string;
  /** The speech-bubble hook that pops when the camera arrives. */
  hook: string;
  /** Tech chips, stamped one by one, in the approved order. */
  chips: readonly string[];
  repo: string;
  live: string;
}

export const PROJECTS: readonly Project[] = [
  {
    name: "TABLO",
    hook: "YOUR AI CODING SESSIONS, BABYSAT BY A CAT.",
    chips: ["TAURI 2", "SVELTE", "TYPESCRIPT"],
    repo: "https://github.com/aristocrat71/tablo",
    live: "https://tablo-cat.netlify.app/",
  },
  {
    name: "OPTILIFE",
    hook: "REAL LIFE, BUT WITH XP.",
    chips: ["FLUTTER", "RIVERPOD", "FLAME", "DRIFT"],
    repo: "https://github.com/aristocrat71/OptiLife",
    live: "https://optilife-web.netlify.app/",
  },
  {
    name: "DOGVISION",
    hook: "WHAT BREED IS THAT CUTE PUPPY? THERE'S AN APP FOR THAT.",
    chips: ["TENSORFLOW", "KERAS", "FLASK", "REACT"],
    repo: "https://github.com/aristocrat71/DogVision",
    live: "https://aristocrat71-dogvision.netlify.app",
  },
] as const;

/** The fourth cell's catalogue link — the full back catalogue of repos. */
export const BACK_ISSUES_URL =
  "https://github.com/aristocrat71?tab=repositories";
