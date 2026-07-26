import type { Ref } from "react";

/**
 * The gutter between pages and its caption — one per boundary, with per-page
 * text (design-doc §5): the void backdrop, the dot field, and the paper
 * caption box that glitches in via `cm-cap-glitch`.
 *
 * Purely presentational: the boundary's transition scrub owns when the
 * caption appears (`cm-caption--in`), when it exits (driving the outer
 * `.cm-caption` block), and when the whole gutter fades. Layer order is the
 * scene's business — render this beneath the diving page.
 *
 * aria-hidden: the captions are scroll-choreography flair; read linearly
 * they're noise between pages, and every page carries its own real heading.
 */
export function GutterCaption({
  kicker,
  text,
  ref,
}: {
  kicker: string;
  text: string;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className="cm-gutter" aria-hidden="true">
      <div className="cm-caption">
        <div className="cm-caption__center">
          <span className="cm-caption__inner">
            <small className="cm-caption__kicker">{kicker}</small>
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
