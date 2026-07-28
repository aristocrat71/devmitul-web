import { MegaCell, type CellSlot } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { ABOUT_FOCUS } from "./timing";

/** The caption lands after the collage has printed. */
const CAP_POP: CSSVarStyle = { "--cm-delay": `${ABOUT_FOCUS.collageCap}s` };

/**
 * C2 and C3 — the two collage panels (amended 2026-07-28, Mitul's call; the
 * reasoning is in `content.ts`).
 *
 * They replaced the origin narration and the POWERS & ABILITIES appendix, and
 * they are the same object twice — one picture, one line about it — so they
 * are one component rather than two near-identical cells that would drift.
 *
 * Neither cell is a framed panel: the ink panel C2 used to share with C1's
 * photo and the paper document C3 used to be were both dropped on Mitul's
 * call, so each collage is printed straight onto the page at its own angle.
 * `name` picks that angle; `side` picks which two thirds of the cell the
 * picture takes, and the two cells take opposite sides — the zigzag down the
 * right-hand column is what the narration's alternating caption sides used to
 * do, kept now that the captions no longer alternate.
 *
 * Both children are positioned out of flow so neither can size the cell
 * (CLAUDE.md: an asset dropped into an approved slot must not size that slot).
 */
export function CollageCell({
  at,
  focus,
  name,
  side,
  src,
  alt,
  caption,
}: {
  at: CellSlot;
  focus: number;
  /** Which collage this is — it owns the panel's resting angle. */
  name: "music" | "interests";
  /** Which side of the panel the picture takes; the caption overlaps it. */
  side: "left" | "right";
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <MegaCell at={at} focus={focus}>
      <div className={`about__collage-panel about__collage-panel--${name}`}>
        <img
          className={`about__collage about__collage--${side}`}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
        {/* The caption's column, not the caption: it centres the box in the
            half the picture left over, which the box can't do for itself
            without a `translate` its entrance would throw away (rule 10). */}
        <div className={`about__collage-side about__collage-side--${side}`}>
          <p className="about__cap about__cap--collage" style={CAP_POP}>
            {caption}
          </p>
        </div>
      </div>
    </MegaCell>
  );
}
