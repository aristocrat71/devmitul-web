import type { ReactNode, Ref } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";

/** The 2×2 grid coordinates of the approved camera-walk page. */
export type CellSlot = "tl" | "tr" | "br" | "bl";

/**
 * One big comic page — a bounded paper object floating on the void, read by a
 * camera instead of scrolled (design-doc §6). 104vw × 138vh with a print-dot
 * texture, an inked edge and a folio stamp; cells are absolutely positioned on
 * the approved 2×2 grid.
 *
 * Shared by THE GOOD PART (§3) and ORIGIN STORY (§5), which are the same page
 * object with different cell contents — the two pages must never diverge into
 * hand-rolled copies (implementation-plan §5).
 *
 * **This element's transform belongs to the camera** and to nothing else
 * (CLAUDE.md rule 10 / conventions). Cell entrances scale the cells; the page
 * itself only ever fades. Nothing here promotes a layer: a 104vw × 138vh
 * surface is an expensive one, so the camera promotes it while it moves and
 * releases it after (implementation-plan §0, GPU layer budget).
 */
export function MegaPage({
  folio,
  children,
  className,
  style,
  ref,
}: {
  /** The folio stamp printed in the page's bottom-right corner. */
  folio: string;
  children: ReactNode;
  className?: string;
  style?: CSSVarStyle;
  ref?: Ref<HTMLDivElement>;
}) {
  return (
    <div ref={ref} className={cn("cm-megapage", className)} style={style}>
      {children}
      <div className="cm-megapage__folio">{folio}</div>
    </div>
  );
}

/**
 * A cell on the page. `focus` marks it as a camera stop — the camera's
 * keyframes are the focus cells in reading order, so the fourth (`bl`) cell,
 * which both camera-walk pages keep for furniture revealed by the pull-back,
 * simply omits it.
 *
 * The engine toggles `cm-cell--on` when the camera arrives; the cell's own
 * page styles decide what performing looks like.
 */
export function MegaCell({
  at,
  focus,
  children,
  className,
  style,
  as: Tag = "div",
}: {
  at: CellSlot;
  focus?: number;
  children: ReactNode;
  className?: string;
  style?: CSSVarStyle;
  as?: "div" | "article" | "section";
}) {
  return (
    <Tag
      className={cn("cm-cell", `cm-cell--${at}`, className)}
      data-cell={focus}
      style={style}
    >
      {children}
    </Tag>
  );
}
