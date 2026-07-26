import { useRef } from "react";
import { MegaCell, MegaPage, TitleBox } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { CrewPass } from "./CrewPass";
import { ProjectPanel } from "./ProjectPanel";
import { useCameraStub } from "./useCameraStub";
import { useProjectsAssemble } from "./useProjectsAssemble";
import { BACK_ISSUES_URL, PROJECTS } from "./content";
import { PROJECTS_OUTRO } from "./timing";
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
 * pull-back reveals. The page is the subject; the camera that reads it panel by
 * panel is the scene's other half (implementation-plan §3, split stage —
 * camera scrub, keyframe math and `<CameraWalkScene>` belong to Fable 5).
 *
 * The void behind the page is this scene's own backdrop, not the stage's: the
 * design requires the void to stay visible around the page's edges at every
 * camera position, and the layer beneath is the next scene.
 */
export function ProjectsScene() {
  const pageRef = useRef<HTMLDivElement>(null);

  // The cover's dive drives this over its final 79–100%.
  useProjectsAssemble(pageRef);
  // TEMPORARY — parks the page at the fit-page keyframe until §3's camera
  // (Fable 5's half) lands. See useCameraStub.
  useCameraStub(pageRef);

  return (
    <div className="projects">
      <MegaPage ref={pageRef} className="projects__page" folio="PAGE 01">
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
      </MegaPage>
    </div>
  );
}

export default ProjectsScene;
