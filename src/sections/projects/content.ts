import dogvisionShot from "@/assets/projects/dogvision.webp";
import optilifeShot from "@/assets/projects/optilife.webp";
import tabloShot from "@/assets/projects/tablo.webp";

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
