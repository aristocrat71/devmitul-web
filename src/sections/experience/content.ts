/**
 * CASE FILES' inventory — the approved public-safe wording from design-doc §7
 * and `experience-page-mockup.html`. Reading order is reverse-chronological:
 * CASE 003 → 002 → 001, leafing backward through time.
 */

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
 * ========================= TEMPORARY PLACEHOLDER =========================
 * Added at Mitul's request (2026-07-27) so the attachments strip can be
 * reviewed with both slots filled. REPLACE with the real supplied quote per
 * file, or delete the three `witness:` lines below to return to the
 * design-doc §7 behaviour (slot omitted, exhibit widened).
 * =========================================================================
 *
 * Deliberately unmistakable — lorem text and an obviously fake name — so it
 * cannot be read as a real recommendation or ship unnoticed. It lives in one
 * constant on purpose: one place to delete, and one grep to prove the site has
 * no invented testimony left in it.
 */
const PLACEHOLDER_WITNESS: Witness = {
  quote: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
  attribution: "John Doe",
};

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
  evidence: readonly string[];
  /** Dashed attachment slot until the real image lands (design-doc §7 assets). */
  exhibit: { label: string; note: string };
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
    evidence: ["TAURI", "REACT", "TYPESCRIPT", "SQLITE", "AWS / RAILWAY", "PYTHON"],
    exhibit: { label: "EXHIBIT A", note: "ATTACH WORK PHOTO / SCREENSHOT" },
    witness: PLACEHOLDER_WITNESS,
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
    evidence: ["REACT", "TYPESCRIPT", "EXPRESS", "MONGODB", "LINUX"],
    exhibit: { label: "EXHIBIT B", note: "ATTACH PRODUCT SCREENSHOT" },
    witness: PLACEHOLDER_WITNESS,
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
    evidence: ["SCIKIT-LEARN", "PANDAS", "NUMPY", "MATPLOTLIB", "SEABORN"],
    exhibit: { label: "EXHIBIT C", note: "ATTACH SATELLITE / FIELD VISUAL" },
    witness: PLACEHOLDER_WITNESS,
  },
] as const;

/** The polaroid's caption tease, on the oldest file (design-doc §7). */
export const POLAROID = { caption: "EST. ???", next: "DIVE ▸ ABOUT" } as const;
