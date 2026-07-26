import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";

/**
 * The one chapter-heading device (CLAUDE.md conventions): an acid box on the
 * page, rotated −1°, ink display type with a paper + magenta print shadow, and
 * a courier kicker inside. THE GOOD PART, CASE FILES and ORIGIN STORY all use
 * this component — a page never restyles its own title. The cover's masthead
 * is the only exception, because it's the logo, not a chapter.
 *
 * Owns its own rotation, so position it with `left`/`top` on the passed
 * className and let this keep the transform (CLAUDE.md rule 10).
 */
export function TitleBox({
  kicker,
  children,
  className,
  style,
}: {
  kicker: string;
  children: ReactNode;
  className?: string;
  style?: CSSVarStyle;
}) {
  return (
    <div className={cn("cm-title-box", className)} style={style}>
      <div className="cm-title-box__kicker">{kicker}</div>
      <h2 className="cm-title-box__title">{children}</h2>
    </div>
  );
}
