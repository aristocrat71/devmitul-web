import { MegaCell, SocialIcon, type CellSlot } from "@/components/comic";
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

      {/* The slot's aspect ratio is the panel's, not the image's — 1.84:1 at
          1440 wide, 0.55:1 on mobile — so the capture is `contain`ed and the
          slot's own diagonal weave letterboxes it. `cover` would crop three
          quarters off OptiLife, which is a portrait phone screen. */}
      <div className="projects__shot">
        <img
          className="projects__shot-img"
          src={project.shot.src}
          alt={project.shot.alt}
          loading="lazy"
          decoding="async"
        />
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
          {/* The label element survives the sweep it used to sit above (removed
              2026-07-27): it is the shared line box that keeps this button and
              the text one exactly the same height. The mark replaces the word
              (Mitul, 2026-07-27); the link's `aria-label` above is what still
              says GitHub, so nothing is lost when the icon is. */}
          <span className="projects__abtn-label">
            <SocialIcon network="github" className="projects__abtn-icon" />
          </span>
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
