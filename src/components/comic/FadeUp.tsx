import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";
import { toTime, type TimeValue } from "./time";

type FadeUpOwnProps = {
  /** Seconds before it rises, or a CSS `<time>`. */
  delay?: TimeValue;
  style?: CSSVarStyle;
};

/**
 * The soft entrance, for copy that shouldn't slam — credit lines, button rows,
 * the scroll cue. The one place in the kit that eases rather than steps: it's
 * a 10px rise, too short for stepping to read as anything but a stutter.
 *
 * Owns its element's transform like every other kit wrapper.
 */
export function FadeUp<T extends ElementType = "div">({
  as,
  delay = 0,
  className,
  style,
  ...rest
}: PolymorphicProps<T, FadeUpOwnProps>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("cm-fade-up", className)}
      style={{ "--cm-delay": toTime(delay), ...style } satisfies CSSVarStyle}
      {...rest}
    />
  );
}
