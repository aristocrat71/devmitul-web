import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";

type GlitchTickOwnProps = {
  /**
   * Stagger, in seconds, against the shared 5s loop. Two glitching elements
   * must never share an offset — synced ticks read as one scripted effect,
   * offset ticks read as signal interference (design-doc §3.3).
   */
  offset?: number;
  /** Horizontal shove of the torn band, in px. */
  shove?: number;
  /**
   * A resting transform the element already needs (e.g. the masthead's
   * `skew(-6deg, -2deg)`). The keyframes re-state it so the tick composes
   * instead of wiping it — see the ownership note in comic.css.
   */
  baseTransform?: string;
  style?: CSSVarStyle;
};

/**
 * One-frame slice glitch on a 5s loop. Pauses while hovered or focused within:
 * touch stabilizes the signal, and a running animation would outrank the
 * element's own hover styles anyway (CLAUDE.md rule 4).
 */
export function GlitchTick<T extends ElementType = "div">({
  as,
  offset = 0,
  shove = 9,
  baseTransform,
  className,
  style,
  ...rest
}: PolymorphicProps<T, GlitchTickOwnProps>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("cm-glitch", className)}
      style={
        {
          "--cm-delay": `${offset}s`,
          "--cm-shove": `${shove}px`,
          ...(baseTransform ? { "--cm-base": baseTransform } : null),
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
