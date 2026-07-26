import type { CSSVarStyle } from "@/lib/css-vars";
import { cn } from "@/lib/utils";
import { Parallax } from "./Parallax";

type HalftoneBackgroundProps = {
  /**
   * The one-time CMYK misregistration flash that opens the issue — the cyan
   * and magenta dot fields slide into register over ~0.45s (design-doc §3.5).
   * Only the first scene the visitor sees should run it.
   */
  register?: boolean;
  /** The diagonal speedline slab across the lower third. */
  slab?: boolean;
  /** Parallax depth in px; travels against the pointer. */
  depth?: number;
  className?: string;
  style?: CSSVarStyle;
};

/**
 * The page stock every scene sits on: two-colour halftone dot field, magenta
 * and cyan colour washes, and an optional speedline slab. Entirely CSS
 * gradients — no bitmap textures anywhere in this site (implementation-plan.md
 * §0, memory architecture).
 */
export function HalftoneBackground({
  register = false,
  slab = true,
  depth = -8,
  className,
  style,
}: HalftoneBackgroundProps) {
  return (
    <>
      <Parallax
        aria-hidden="true"
        depth={depth}
        className={cn("cm-bg", register && "cm-bg--register", className)}
        style={style}
      />
      {slab ? <div aria-hidden="true" className="cm-slab" /> : null}
    </>
  );
}
