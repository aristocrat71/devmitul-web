import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";
import { toneVar, type Tone } from "./tone";
import { toTime, type TimeValue } from "./time";

type BannerOwnProps = {
  /** Resting angle, degrees. The cover tagline sits at -3. */
  rotate?: number;
  /** Slab fill. */
  tone?: Tone;
  /** The outer of the two hard offset shadows. */
  shadowTone?: Tone;
  /** Wipe on from the left in four steps, like a press roller. */
  wipe?: boolean;
  /** Seconds before the wipe starts, or a CSS `<time>`. */
  delay?: TimeValue;
  style?: CSSVarStyle;
};

/**
 * The rotated acid slab — tagline banners and section callouts. Double hard
 * offset shadow, never blurred (design-doc §2, texture kit).
 */
export function Banner<T extends ElementType = "span">({
  as,
  rotate = -3,
  tone = "acid",
  shadowTone = "mag",
  wipe = false,
  delay = 0,
  className,
  style,
  ...rest
}: PolymorphicProps<T, BannerOwnProps>) {
  const Tag = (as ?? "span") as ElementType;
  return (
    <Tag
      className={cn("cm-banner", wipe && "cm-banner--wipe", className)}
      style={
        {
          "--cm-rot": `${rotate}deg`,
          "--cm-tone": toneVar(tone),
          "--cm-shadow-color": toneVar(shadowTone),
          "--cm-delay": toTime(delay),
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
