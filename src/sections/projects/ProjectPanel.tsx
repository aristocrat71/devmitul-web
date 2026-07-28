import { Fragment } from "react";
import { MegaCell, SocialIcon, type CellSlot } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { PROJECTS_FOCUS } from "./timing";
import type { Project } from "./content";

/** Spotlights stamp one at a time; the stagger is the section's table, not the CSS. */
const spotStamp = (index: number): CSSVarStyle => ({
  "--cm-delay": `${PROJECTS_FOCUS.spotDelay + index * PROJECTS_FOCUS.spotStagger}s`,
});

/**
 * One featured build, printed as a panel on the page.
 *
 * **Redesigned 2026-07-28 (Mitul's call — variant F, "THE COVER LOGO").** The
 * panel's four ingredients are ranked *name › image › spotlights › stack*, and
 * the layout is that ranking: the name is set oversized ACROSS the print's left
 * edge the way a comic masthead overlaps the art beneath it, the print is the
 * panel's subject, the architectural spotlights are a compact numbered list
 * under both, and the stack is one dim monospace line on the footer rail.
 *
 * What that replaced, so nobody restores half of it by accident: the hook was a
 * speech bubble hanging off the panel's top edge and is now the masthead's
 * kicker; the tech chips were stamped paper chips and are now the unstamped
 * rail; the title was a 32px line between the picture and the chips.
 *
 * Everything below the print is at rest until the camera arrives and the engine
 * adds `cm-cell--on`; then the spotlights stamp in one by one and the LIVE
 * badge starts pulsing (design-doc §6, "Focus beats"). The panel renders
 * complete without that ever happening — the beats are performance, not a
 * precondition for the content.
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
      <div className="projects__head">
        {/* The masthead is positioned against the PRINT, not against the panel,
            which is what holds the overlap constant at every breakpoint —
            anchored to the panel it sat below the print on a tall viewport and
            across its middle on a short one. */}
        <div className="projects__art">
          <div className="projects__shot">
            <img
              className="projects__shot-img"
              src={project.shot.src}
              alt={project.shot.alt}
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Decorative overlay above the print: nothing in it is interactive
              and the capture is `pointer-events: none` already, so nothing is
              hit-blocked (CLAUDE.md rule 2). */}
          <div className="projects__logo">
            <h3 className="projects__panel-title">{project.name}</h3>
            <p className="projects__hook">{project.hook}</p>
          </div>
        </div>
      </div>

      {/* A real list: three points about one project. The index badges are
          decorative — the list already tells a screen reader there are three. */}
      <ul className="projects__spots">
        {project.spots.map((spot, i) => (
          <li key={spot} className="projects__spot" style={spotStamp(i)}>
            <span className="projects__spot-n" aria-hidden="true">
              {i + 1}
            </span>
            <span className="projects__spot-head">{spot}</span>
          </li>
        ))}
      </ul>

      <div className="projects__foot">
        <p className="projects__stack">
          {project.chips.map((chip, i) => (
            <Fragment key={chip}>
              {/* The spaces inside the separator are load-bearing: joined
                  tight, the rail is one unbreakable word, and no amount of
                  `white-space: normal` will wrap it when the panel turns
                  portrait — it just clips to "TAU…". */}
              {i > 0 ? <i className="projects__stack-sep"> · </i> : null}
              {chip}
            </Fragment>
          ))}
        </p>

        <div className="projects__actions">
          <a
            className="projects__abtn"
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${project.name} source on GitHub`}
          >
            {/* The label element is the shared line box that keeps this icon
                button and the text one exactly the same height. The mark
                replaces the word (Mitul, 2026-07-27); the link's `aria-label`
                above is what still says GitHub, so nothing is lost when the
                icon is. */}
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
      </div>
    </MegaCell>
  );
}
