import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";

type ParallaxOwnProps = {
  /**
   * Depth in px — how far this layer travels across the full pointer sweep.
   * Negative moves against the pointer (background), positive moves with it
   * (foreground). Cover depths: bg -8, masthead column -14, character +16
   * (design-doc §4; its speaker +10 went with the sticker on 2026-07-28).
   */
  depth?: number;
  /** Vertical depth, when it differs from the horizontal one. */
  depthY?: number;
  style?: CSSVarStyle;
};

/**
 * Carries one parallax layer. Reads the `--px`/`--py` the shared rAF loop
 * writes on <html> — no React state, no per-frame render. Owns its element's
 * transform, so nest entrance and glitch wrappers inside it rather than
 * stacking their effects here.
 */
export function Parallax<T extends ElementType = "div">({
  as,
  depth = 0,
  depthY,
  className,
  style,
  ...rest
}: PolymorphicProps<T, ParallaxOwnProps>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("cm-parallax", className)}
      style={
        {
          "--cm-depth-x": `${depth}px`,
          "--cm-depth-y": `${depthY ?? depth}px`,
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
