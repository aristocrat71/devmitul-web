import { CutoutImage, MegaCell } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { FINALE } from "./content";
import { ABOUT_OUTRO } from "./timing";

const FIGURE_STAMP: CSSVarStyle = {
  "--cm-rot": "-2deg",
  "--cm-delay": `${ABOUT_OUTRO.figure}s`,
};
const BUBBLE_STAMP: CSSVarStyle = {
  "--cm-rot": "1deg",
  "--cm-delay": `${ABOUT_OUTRO.bubble}s`,
};

/**
 * C4 — YOUR TURN: the finale, unvisited until the pull-back reveals it
 * (design-doc §8).
 *
 * The bubble is the dive target into the back cover — entering the speech
 * bubble IS starting the conversation, and the next gutter reads
 * "SAY HELLOOO...". `data-dive-target` is how that boundary finds it; the
 * target zoom scales it about its own centre, so nothing here is measured
 * (CLAUDE.md rule 12).
 *
 * Three nested elements, one transform each, because three different things
 * want to move this bubble: the pull-back stamp, the boundary's zoom, and the
 * settled pulse. Stacking them on one element is what makes the mockup have to
 * re-declare `opacity: 1` to survive its own pulse (see about.css).
 */
export function FinaleCell() {
  return (
    <MegaCell at="bl" className="about__finale">
      <div className="about__outro-el about__figure" style={FIGURE_STAMP}>
        {/* Printed directly on paper stock, so the die cut is inked — a paper
            edge would be invisible against the page. */}
        <CutoutImage edgeTone="ink" shadow={{ x: 5, y: 5, alpha: 0.45 }} />
      </div>

      <div
        className="about__outro-el about__finale-bubble"
        style={BUBBLE_STAMP}
      >
        <div className="about__bubble" data-dive-target="backcover">
          <div className="about__bubble-box">
            <p className="about__bb-line">{FINALE.line}</p>
            <p className="about__bb-note">
              NEXT: <b>{FINALE.next}</b>
            </p>
          </div>
        </div>
      </div>
    </MegaCell>
  );
}
