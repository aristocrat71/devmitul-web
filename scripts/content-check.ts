/**
 * Validates the `content/` Markdown against each section's schema, with no
 * browser and no bundler.
 *
 * The copy moved out of TypeScript and into Markdown, which bought a source of
 * truth a person can edit and cost the one thing the compiler used to do for
 * free: a typo in `content/projects.md` is no longer a type error. It's a
 * *runtime* error now — thrown as the module loads — so `vite build` would
 * happily ship a bundle that throws on open. This script closes that gap by
 * running the same schema the browser runs, against the files on disk.
 *
 * Run:  bun run check:content
 */
import { existsSync, readFileSync } from "node:fs";
import { ContentError } from "../src/lib/markdown-doc";
import { readProjects } from "../src/sections/projects/schema";

const PROJECTS_FILE = "content/projects.md";
const PROJECT_SHOTS = "src/assets/projects";

let failures = 0;

function checkFile(file: string, read: () => string[]) {
  try {
    for (const line of read()) console.log(`  ${line}`);
    console.log(`PASS  ${file}`);
  } catch (error) {
    console.error(`FAIL  ${file}`);
    console.error(`      ${error instanceof ContentError ? error.message : String(error)}`);
    failures += 1;
  }
}

checkFile(PROJECTS_FILE, () => {
  const { projects, backIssues } = readProjects(
    readFileSync(PROJECTS_FILE, "utf8"),
    PROJECTS_FILE,
    (fileName, where) => {
      const path = `${PROJECT_SHOTS}/${fileName}`;
      if (!existsSync(path)) throw new ContentError(where, `no \`${path}\``);
      return path;
    },
  );
  return [
    ...projects.map(
      (project) =>
        `${project.name} — ${project.spots.length} spotlights, ` +
        `${project.chips.length} stack entries, ${project.shot.src}`,
    ),
    `back issues → ${backIssues}`,
  ];
});

console.log(failures ? `\n${failures} file(s) failed.` : "\nContent OK.");
process.exit(failures ? 1 : 0);
