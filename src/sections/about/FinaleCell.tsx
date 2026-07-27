import { MegaCell, SocialButton } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { EmailCTA } from "./EmailCTA";
import { FINALE, RESUME_LABEL, RESUME_URL } from "./content";
import { ABOUT_OUTRO } from "./timing";

const BUBBLE_STAMP: CSSVarStyle = {
  "--cm-rot": "1deg",
  "--cm-delay": `${ABOUT_OUTRO.bubble}s`,
};
const CONTACT_STAMP: CSSVarStyle = {
  "--cm-rot": "-0.6deg",
  "--cm-delay": `${ABOUT_OUTRO.contact}s`,
};
/** Each action prints on its own beat; the rotation is the element's own. */
const actionStamp = (index: number, rotate: string): CSSVarStyle => ({
  "--cm-rot": rotate,
  "--cm-delay": `${ABOUT_OUTRO.actions[index]}s`,
});

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
 *
 * The contact block under it replaced the placeholder cutout figure that used
 * to stand to the bubble's left (Mitul, 2026-07-27). The cell asks the reader
 * to say something; it now also shows them how, instead of spending its only
 * furniture on a stand-in silhouette and leaving the rest of the cell blank.
 */
export function FinaleCell() {
  return (
    <MegaCell at="bl" className="about__finale">
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

      <div className="about__outro-el about__contact" style={CONTACT_STAMP}>
        <EmailCTA />
      </div>

      <div className="about__actions">
        {/* Each action is its own stamp owner, so the hover transform each one
            carries stays its own (CLAUDE.md rule 10). */}
        <div
          className="about__outro-el about__action"
          style={actionStamp(0, "3deg")}
        >
          <a
            className="about__resume"
            href={RESUME_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            {RESUME_LABEL}
          </a>
        </div>
        {/* The cover's buttons, reprised. */}
        <div
          className="about__outro-el about__action"
          style={actionStamp(1, "-2deg")}
        >
          <SocialButton
            network="github"
            className="about__gbtn about__gbtn--github"
          />
        </div>
        <div
          className="about__outro-el about__action"
          style={actionStamp(2, "2deg")}
        >
          <SocialButton
            network="linkedin"
            className="about__gbtn about__gbtn--linkedin"
          />
        </div>
      </div>
    </MegaCell>
  );
}
