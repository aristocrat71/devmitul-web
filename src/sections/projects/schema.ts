/**
 * What a project *is*, and how one is read out of `content/projects.md`.
 *
 * The Markdown file is the single source of truth for THE GOOD PART's copy; this
 * module is the only thing standing between it and the page, and its whole job
 * is to fail loudly on a file that would print a broken panel. It holds no copy
 * of its own — every string on §3 comes from the `.md`.
 *
 * Nothing here imports a bundler feature, so the same validation runs in the
 * browser at module load and under `bun scripts/content-check.ts` against the
 * files on disk. Screenshot resolution is the one thing it can't do alone, so it
 * takes a resolver: Vite hands it the hashed asset URL, the check script hands
 * it an existence test.
 */
import {
  ContentError,
  parseMarkdownDoc,
  rejectUnknownFields,
  requireField,
  requireList,
  type MarkdownBlock,
} from "@/lib/markdown-doc";

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
   * stamped one at a time when the camera arrives. Headlines only, by design.
   */
  spots: readonly string[];
  /** The stack, printed as one dim line on the footer rail. */
  chips: readonly string[];
  repo: string;
  live: string;
  /**
   * The panel's screenshot. `alt` describes what the capture shows, not that it
   * is a screenshot — a reader who can't see it should learn the same thing
   * about the project that a reader who can does.
   */
  shot: { src: string; alt: string };
}

/**
 * Three panels in the 2×2 grid, with the catalogue furniture in the fourth
 * cell. A fourth project evicts that furniture and needs a third page row, a
 * taller page, a fifth camera stop and a longer scene — a design change, not a
 * content edit, which is why the count is enforced here rather than trusted.
 */
const PROJECT_COUNT = 3;

/**
 * Three spotlights per panel, for the same class of reason: a fourth does not
 * fit the panel at the camera's focus zoom.
 */
const SPOT_COUNT = 3;

/** Every field a project block may carry. Anything else is a typo (see `rejectUnknownFields`). */
const FIELDS = ["hook", "stack", "repo", "live", "shot", "alt"] as const;

/** Turns `src/assets/projects/<file>` into whatever the caller can serve. */
export type ShotResolver = (fileName: string, where: string) => string;

export interface ProjectsContent {
  projects: Project[];
  /** The fourth cell's catalogue link — the full back catalogue of repos. */
  backIssues: string;
}

export function readProjects(
  source: string,
  file: string,
  resolveShot: ShotResolver,
): ProjectsContent {
  const { preamble, records } = parseMarkdownDoc(source, file);

  rejectUnknownFields(preamble, ["back issues"]);
  const backIssues = url(preamble, "back issues");

  if (records.length !== PROJECT_COUNT) {
    throw new ContentError(
      `${file}:1`,
      `${records.length} project${records.length === 1 ? "" : "s"}, and the page holds exactly ` +
        `${PROJECT_COUNT} — every \`##\` heading is one, in camera order. ` +
        `Found: ${records.map((record) => record.title).join(", ") || "none"}`,
    );
  }

  return { projects: records.map((record) => readProject(record, resolveShot)), backIssues };
}

function readProject(block: MarkdownBlock, resolveShot: ShotResolver): Project {
  rejectUnknownFields(block, FIELDS);

  const spots = requireList(block, "spotlights");
  if (spots.length !== SPOT_COUNT) {
    throw new ContentError(
      block.where,
      `\`${block.title}\` has ${spots.length} spotlights and the panel prints exactly ${SPOT_COUNT}`,
    );
  }

  const chips = requireField(block, "stack")
    .split(",")
    .map((chip) => chip.trim())
    .filter(Boolean);
  if (!chips.length) {
    throw new ContentError(block.where, `\`${block.title}\`'s \`stack:\` is comma-separated and empty`);
  }

  const fileName = requireField(block, "shot");
  if (fileName.includes("/")) {
    throw new ContentError(
      block.where,
      `\`shot: ${fileName}\` is a path — give the filename only; it is looked up in \`src/assets/projects/\``,
    );
  }

  return {
    name: block.title,
    hook: requireField(block, "hook"),
    spots,
    chips,
    repo: url(block, "repo"),
    live: url(block, "live"),
    shot: { src: resolveShot(fileName, block.where), alt: requireField(block, "alt") },
  };
}

/** A field that has to survive being written into an `href`. */
function url(block: MarkdownBlock, key: string): string {
  const value = requireField(block, key);
  if (!/^https?:\/\/\S+$/.test(value)) {
    throw new ContentError(block.where, `\`${key}: ${value}\` is not an http(s) link`);
  }
  return value;
}
