/**
 * THE GOOD PART's inventory, read from `content/projects.md` at build time.
 *
 * That file is the source of truth — the trio, the copy, the links, the alt
 * text. This module is the seam between it and Vite, and deliberately nothing
 * more: it hands the raw file to the schema and resolves each `shot:` filename
 * to a hashed asset URL. `schema.ts` owns what a valid project is; the page
 * components own how one is printed. No copy lives here.
 */
import source from "../../../content/projects.md?raw";
import { ContentError } from "@/lib/markdown-doc";
import { readProjects, type Project } from "./schema";

/** The file names itself in every error message, so use the path Mitul would open. */
const FILE = "content/projects.md";

/**
 * Every screenshot in the folder, keyed by bare filename.
 *
 * Eager and glob-shaped so the bundler still sees each import statically —
 * `shot:` names a file, it does not build a URL, which is what keeps hashing,
 * tree-shaking and a missing-asset error at build time all intact.
 */
const SHOTS: Record<string, string> = Object.fromEntries(
  Object.entries(
    import.meta.glob<string>("../../assets/projects/*", { eager: true, import: "default" }),
  ).map(([path, url]) => [path.slice(path.lastIndexOf("/") + 1), url]),
);

const content = readProjects(source, FILE, (fileName, where) => {
  const url = SHOTS[fileName];
  if (url) return url;
  throw new ContentError(
    where,
    `no \`src/assets/projects/${fileName}\` — that folder holds ${Object.keys(SHOTS).sort().join(", ")}`,
  );
});

export const PROJECTS: readonly Project[] = content.projects;
export const BACK_ISSUES_URL = content.backIssues;
export type { Project };
