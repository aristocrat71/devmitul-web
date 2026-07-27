/**
 * CASE FILES' inventory — the approved public-safe wording from design-doc §7
 * and `experience-page-mockup.html`. Reading order is reverse-chronological:
 * CASE 003 → 002 → 001, leafing backward through time.
 */
import canspiritEvidence from "@/assets/experience/canspirit.webp";
import isroEvidence from "@/assets/experience/isro.webp";
import unravelEvidence from "@/assets/experience/unravel.webp";

/** One KEY OPS bullet. */
export interface Op {
  text: string;
  /**
   * The redaction gag on the Unravel file (design-doc §7, verbatim). Rendered
   * as an image to assistive tech so the block run isn't read out as sixteen
   * "black square"s.
   */
  redacted?: boolean;
}

/**
 * A testimonial slip. Ships with **real quotes only** — LinkedIn
 * recommendations, review lines, client feedback that Mitul has actually
 * supplied (CLAUDE.md conventions, design-doc §7). Where none exists the slot
 * is omitted entirely and the exhibit widens to take its place, because an
 * invented-but-plausible quote is fabricated testimony on a page whose whole
 * conceit is evidence.
 */
export interface Witness {
  quote: string;
  attribution: string;
}

/**
 * CASE 003's slip. Unravel is the ACTIVE file and no statement has been taken
 * yet, so it prints as unknown rather than absent — Mitul's call (2026-07-27),
 * and the same device the polaroid uses for its own date ("EST. ???"). Not a
 * fabricated quote: it is the file saying it doesn't have one, which on a page
 * about evidence is the honest reading of a pending witness.
 */
const WITNESS_PENDING: Witness = { quote: "???", attribution: "???" };

export interface CaseFile {
  /** Folder tab — the short name, read while the file is still buried. */
  tab: string;
  /** `CASE NO. 00n`, printed in the corner. */
  caseNo: string;
  status: "ACTIVE" | "CLOSED";
  /** Display-face heading. */
  org: string;
  role: string;
  /** One line, highlighter-treated. */
  brief: string;
  ops: readonly Op[];
  /**
   * The four headline technologies, no more (Mitul 2026-07-27). The tickets
   * share the dossier row with the exhibit now, so a fifth or sixth wraps the
   * row onto a second line and pushes the strip off the folder's base. Order is
   * prominence — the trimmed entries were the tail of each list.
   */
  evidence: readonly [string, string, string, string];
  /**
   * The evidence photo pinned into the strip. `src` + `alt` are the supplied
   * image; a file with neither falls back to the dashed "attach…" slot the
   * page shipped with, which is why `note` survives (design-doc §7 assets).
   */
  exhibit: {
    label: string;
    src?: string;
    alt?: string;
    note?: string;
  };
  witness?: Witness;
}

export const CASES: readonly CaseFile[] = [
  {
    tab: "UNRAVEL TECH",
    caseNo: "CASE NO. 003",
    status: "ACTIVE",
    org: "UNRAVEL TECH",
    role: "SOFTWARE ENGINEER (SWE-1) ・ DEC 2025 – PRESENT",
    brief: "FULL-STACK ・ AI ENGINEERING ・ PRODUCT TOOLING.",
    ops: [
      { text: "Cross-platform desktop tools in Tauri + React/SQLite" },
      { text: "Client cloud-infra migrations with zero-data-loss runbooks" },
      { text: "RL-for-LLMs strategy research guiding AI investment decisions" },
      { text: "FURTHER OPS: ████████████████ (PENDING CLEARANCE)", redacted: true },
    ],
    evidence: ["TAURI", "AWS / RAILWAY", "FASTAPI", "TYPESCRIPT"],
    exhibit: {
      label: "EXHIBIT A",
      src: unravelEvidence,
      alt: "The Unravel Tech team around a restaurant table, mid-lunch.",
    },
    witness: WITNESS_PENDING,
  },
  {
    tab: "CANSPIRIT.AI",
    caseNo: "CASE NO. 002",
    status: "CLOSED",
    org: "CANSPIRIT.AI — PUNE",
    role: "FULL STACK DEVELOPER ・ JUN–DEC 2025",
    brief: "MULTIPLE CLIENT BUILDS, END TO END.",
    ops: [
      { text: "Shipped a Docx-crafter, a wine-commerce website, and a chatbot" },
      { text: "Owned features across frontend, API, and data layers" },
    ],
    evidence: ["REACT", "TYPESCRIPT", "EXPRESS", "MONGODB"],
    exhibit: {
      label: "EXHIBIT B",
      src: canspiritEvidence,
      alt: "A property-listings web app built at Canspirit: search filters over a city skyline, with a grid of housing-development cards beneath.",
    },
    witness: {
      quote:
        "Mitul is a quick learner with a strong sense of ownership, consistently delivering quality work while collaborating effectively and maintaining a professional attitude.",
      attribution: "Arun Kumar Nair, Technical Head",
    },
  },
  {
    tab: "NRSC @ ISRO",
    caseNo: "CASE NO. 001",
    status: "CLOSED",
    org: "NRSC @ ISRO — HYDERABAD",
    role: "MACHINE LEARNING INTERN ・ MAY–JUL 2024",
    brief: "CROP-MAPPING & YIELD PREDICTION, FROM ORBIT.",
    ops: [
      { text: "API development for satellite-data crop pipelines" },
      { text: "Model development for crop-mapping & yield prediction" },
    ],
    evidence: ["SCIKIT-LEARN", "PANDAS", "NUMPY", "MATPLOTLIB"],
    exhibit: {
      label: "EXHIBIT C",
      src: isroEvidence,
      alt: "Work from the NRSC @ ISRO crop-mapping internship.",
    },
    witness: {
      quote:
        "Mitul demonstrated strong analytical skills and the ability to quickly grasp complex concepts while approaching every task with dedication.",
      attribution: "Dr. Anima Biswal, Lead Scientist",
    },
  },
] as const;

/** The polaroid's caption tease, on the oldest file (design-doc §7). */
export const POLAROID = { caption: "EST. ???", next: "DIVE ▸ ABOUT" } as const;
