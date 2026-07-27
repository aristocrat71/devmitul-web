import { MegaCell } from "@/components/comic";
import actionPhoto from "@/assets/about/action.webp";
import type { CSSVarStyle } from "@/lib/css-vars";
import { GREETING, TAGS } from "./content";
import { ABOUT_FOCUS } from "./timing";

/** Stamps slam one at a time; the delays are the section's table, not the CSS. */
const tagStamp = (index: number): CSSVarStyle => ({
  "--cm-delay": `${ABOUT_FOCUS.tagDelays[index]}s`,
});

/**
 * C1 — WASSUPPP: the subject introduces himself (design-doc §8).
 *
 * The camera opens the page parked here, so this is the cell that prints in on
 * screen during the inbound boundary's assembly and then performs the moment
 * the engine adds `cm-cell--on`: the greeting pops off the frame's top edge and
 * the three personality stamps slam around it. The cell renders complete
 * without any of that happening.
 */
export function GreetingCell({ focus }: { focus: number }) {
  return (
    <MegaCell at="tl" focus={focus} className="about__greeting">
      <div className="about__frame about__frame--greeting">
        {/* The page's one required image (design-doc §8). It fills the ink
            frame and the frame's own cyan halftone prints over it — the
            treatment is the panel's, not baked into the file. Absolutely
            positioned so it can't size the cell (CLAUDE.md: an asset dropped
            into an approved slot must not size that slot). */}
        <img
          className="about__photo"
          src={actionPhoto}
          alt="Mitul leaning over a restaurant table, eyes down, taking a bite of a momo off a pair of chopsticks, with the rest of the plate and a dish of sauce in front of him."
          loading="lazy"
          decoding="async"
        />

        {TAGS.map((tag, i) => (
          <span
            key={tag}
            className={`about__tag about__tag--${i + 1}`}
            style={tagStamp(i)}
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="about__greet">{GREETING}</p>
    </MegaCell>
  );
}
