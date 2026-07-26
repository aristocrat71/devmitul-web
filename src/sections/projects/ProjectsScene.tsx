import { useRef } from "react";
import { MegaCell, TitleBox } from "@/components/comic";
import { CameraWalkScene } from "@/components/scene/CameraWalkScene";
import { useInterimExit } from "@/hooks/useInterimExit";
import { useMegaPageAssemble } from "@/hooks/useMegaPageAssemble";
import type { CSSVarStyle } from "@/lib/css-vars";
import { CrewPass } from "./CrewPass";
import { ProjectPanel } from "./ProjectPanel";
import { BACK_ISSUES_URL, PROJECTS } from "./content";
import { PROJECTS_ASSEMBLE, PROJECTS_OUTRO, PROJECTS_WALK } from "./timing";
import "./projects.css";

/** Grid slots in reading order: the camera walks TL → TR → BR, then pulls back. */
const SLOTS = ["tl", "tr", "br"] as const;

const BACK_ISSUES_STAMP: CSSVarStyle = {
  "--cm-rot": "-2deg",
  "--cm-delay": `${PROJECTS_OUTRO.backIssues}s`,
};
const CREW_PASS_STAMP: CSSVarStyle = {
  "--cm-rot": "4deg",
  "--cm-delay": `${PROJECTS_OUTRO.crewPass}s`,
};

/**
 * Page 01 — THE GOOD PART.
 *
 * A port of the approved `projects-page-mockup.html` v3: three featured builds
 * printed as panels on one big comic page, plus a fourth cell of furniture the
 * pull-back reveals. The page is the subject; `<CameraWalkScene>` is the
 * camera that reads it panel by panel, walking `PROJECTS_WALK` (design-doc §6).
 *
 * The void behind the page is this scene's own backdrop, not the stage's: the
 * design requires the void to stay visible around the page's edges at every
 * camera position, and the layer beneath is the next scene.
 */
export function ProjectsScene() {
  const pageRef = useRef<HTMLDivElement>(null);

  // The cover's dive drives this over its final 79–100%. Registration stays
  // page-owned; the ref is shared with the camera, no property on it is.
  useMegaPageAssemble(pageRef, PROJECTS_ASSEMBLE);
  // TEMPORARY — remove with the projects → experience transition. See the hook.
  useInterimExit(pageRef);

  return (
    <CameraWalkScene
      walk={PROJECTS_WALK}
      folio="PAGE 01"
      className="projects"
      pageClassName="projects__page"
      pageRef={pageRef}
    >
      <TitleBox className="projects__page-title" kicker="PAGE 01 — FEATURED BUILDS">
        THE GOOD PART
      </TitleBox>

      {PROJECTS.map((project, i) => (
        <ProjectPanel
          key={project.name}
          project={project}
          index={i}
          at={SLOTS[i]}
        />
      ))}

      {/* Fourth cell — unvisited until the pull-back reveals it. */}
      <MegaCell at="bl" className="projects__extra">
        <div className="projects__outro-el" style={BACK_ISSUES_STAMP}>
          {/* The stamp owns the rotation on the wrapper so this anchor keeps
              its own transform for the hover lift. Stacking both on one
              element is what kills the lift in the mockup: the stamp's
              `forwards` fill outranks `:hover` for good (CLAUDE.md rule 10). */}
          <a
            className="projects__back-issues"
            href={BACK_ISSUES_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="projects__bi-title">BROWSE THE BACK ISSUES →</span>
            <span className="projects__bi-sub">FULL CATALOGUE ・ EVERY REPO</span>
            <span className="projects__bi-bars" />
          </a>
        </div>

        <div className="projects__outro-el" style={CREW_PASS_STAMP}>
          <CrewPass />
        </div>
      </MegaCell>
    </CameraWalkScene>
  );
}

export default ProjectsScene;
