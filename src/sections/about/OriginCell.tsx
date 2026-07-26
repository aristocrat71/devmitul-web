import { MegaCell } from "@/components/comic";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import { CAPTIONS } from "./content";
import { ABOUT_FOCUS } from "./timing";

/** Captions land one after another; the stagger is the section's table. */
const capPop = (index: number): CSSVarStyle => ({
  "--cm-delay": `${index * ABOUT_FOCUS.capStagger}s`,
});
const GAG_POP: CSSVarStyle = { "--cm-delay": `${ABOUT_FOCUS.gagDelay}s` };

/**
 * C2 — THE ORIGIN: one narration panel (design-doc §8).
 *
 * The code motto opens it, the two bio captions alternate sides, and the
 * punchline closes it — each popping in turn once the camera arrives.
 */
export function OriginCell({ focus }: { focus: number }) {
  return (
    <MegaCell at="tr" focus={focus} className="about__origin">
      <div className="about__frame about__frame--origin">
        <div className="about__narr">
          {CAPTIONS.map((caption, i) => (
            <p
              key={caption.text}
              className={cn(
                "about__cap",
                caption.code && "about__cap--code",
                caption.right && "about__cap--right",
              )}
              style={capPop(i)}
            >
              {caption.text}
            </p>
          ))}

          {/* Optional inset (design-doc §8) — a stand-in while the gag image
              doesn't exist, and deletable without a trace if it never does. */}
          <div className="about__gag" style={GAG_POP} aria-hidden="true">
            <span>
              OPTIONAL 2ND IMAGE
              <br />
              (TINY BROWSER-FRAME GAG)
            </span>
          </div>
        </div>
      </div>
    </MegaCell>
  );
}
