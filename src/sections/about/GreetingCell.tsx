import { MegaCell } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { GREETING, SCRIBBLE, TAGS } from "./content";
import { ABOUT_FOCUS } from "./timing";

/** Stamps slam one at a time; the delays are the section's table, not the CSS. */
const tagStamp = (index: number): CSSVarStyle => ({
  "--cm-delay": `${ABOUT_FOCUS.tagDelays[index]}s`,
});
const SCRIBBLE_POP: CSSVarStyle = {
  "--cm-delay": `${ABOUT_FOCUS.scribbleDelay}s`,
};

/**
 * C1 — WASSUPPP: the subject introduces himself (design-doc §8).
 *
 * The camera opens the page parked here, so this is the cell that prints in on
 * screen during the inbound boundary's assembly and then performs the moment
 * the engine adds `cm-cell--on`: the greeting pops off the frame's top edge,
 * the three personality stamps slam around it, and the margin scribble lands
 * last. The cell renders complete without any of that happening.
 */
export function GreetingCell({ focus }: { focus: number }) {
  return (
    <MegaCell at="tl" focus={focus} className="about__greeting">
      <div className="about__frame about__frame--greeting">
        {/* Stand-in until the action photo lands (design-doc §8, assets).
            Announcing the slot to a screen reader would be noise; when the
            asset arrives this becomes a <CutoutImage> with a real alt. */}
        <span className="about__slot" aria-hidden="true">
          ACTION PHOTO CUTOUT
          <br />
          (NEW ABOUT IMAGE — HALFTONE)
        </span>

        {TAGS.map((tag, i) => (
          <span
            key={tag}
            className={`about__tag about__tag--${i + 1}`}
            style={tagStamp(i)}
          >
            {tag}
          </span>
        ))}

        <span className="about__scribble" style={SCRIBBLE_POP}>
          {SCRIBBLE}
        </span>
      </div>

      <p className="about__greet">{GREETING}</p>
    </MegaCell>
  );
}
