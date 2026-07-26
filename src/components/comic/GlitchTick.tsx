import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";
import { toTime, type TimeValue } from "./time";

type GlitchTickOwnProps = {
  /**
   * Stagger, in seconds, against the shared 5s loop. Two glitching elements
   * must never share an offset — synced ticks read as one scripted effect,
   * offset ticks read as signal interference (design-doc §3.3).
   */
  offset?: TimeValue;
  /** Horizontal shove of the torn band, in px. */
  shove?: number;
  /**
   * A resting transform the element already needs (e.g. the masthead's
   * `skew(-6deg, -2deg)`). Both the resting rule and the keyframes read it, so
   * the element is correctly posed before the first tick, between ticks, and
   * under reduced motion — see the ownership note in comic.css.
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
          "--cm-delay": toTime(offset),
          "--cm-shove": `${shove}px`,
          // Always set, never left to inherit: custom properties cascade, so a
          // nested GlitchTick would otherwise pick up an ancestor's base pose.
          "--cm-base": baseTransform ?? "none",
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
