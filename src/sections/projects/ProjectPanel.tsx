import { MegaCell, type CellSlot } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { PROJECTS_FOCUS } from "./timing";
import type { Project } from "./content";

/** Chips stamp one at a time; the stagger is the section's table, not the CSS. */
const chipStamp = (index: number): CSSVarStyle => ({
  "--cm-delay": `${PROJECTS_FOCUS.chipDelay + index * PROJECTS_FOCUS.chipStagger}s`,
});

/**
 * One featured build, printed as a panel on the page.
 *
 * Everything below the shot is at rest until the camera arrives and the engine
 * adds `cm-cell--on`; then the hook bubble pops, the chips stamp in one by one
 * and the LIVE badge starts pulsing (design-doc §6, "Focus beats"). The panel
 * renders complete without that ever happening — the beats are performance,
 * not a precondition for the content.
 */
export function ProjectPanel({
  project,
  index,
  at,
}: {
  project: Project;
  /** Camera stop number — the keyframes are the focus cells in reading order. */
  index: number;
  at: CellSlot;
}) {
  return (
    <MegaCell as="article" at={at} focus={index} className="projects__panel">
      <p className="projects__bubble">{project.hook}</p>

      {/* Stand-in until the real screenshots land (design-doc §6, open
          items). Announcing "SCREENSHOT SLOT" would be noise; when the asset
          arrives this becomes an <img> with a real alt. */}
      <div className="projects__shot" aria-hidden="true">
        <span>SCREENSHOT SLOT</span>
      </div>

      <h3 className="projects__panel-title">{project.name}</h3>

      <div className="projects__chips">
        {project.chips.map((chip, i) => (
          <span key={chip} className="projects__chip" style={chipStamp(i)}>
            {chip}
          </span>
        ))}
      </div>

      <div className="projects__actions">
        <a
          className="projects__abtn"
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} source on GitHub`}
        >
          {/* The sweep fills the button from behind the label, so the label
              needs to be an element that can sit above it. */}
          <span className="projects__abtn-label">GITHUB</span>
        </a>
        <a
          className="projects__abtn projects__abtn--live"
          href={project.live}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${project.name} live demo`}
        >
          <span className="projects__abtn-label">▶ LIVE</span>
        </a>
      </div>
    </MegaCell>
  );
}
