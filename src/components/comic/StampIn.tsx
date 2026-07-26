import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";

type StampInOwnProps = {
  /** Seconds before the stamp lands. Furniture stamps sit ~80ms apart. */
  delay?: number;
  /** Resting angle in degrees — the stamp settles here and stays. */
  rotate?: number;
  style?: CSSVarStyle;
};

/**
 * The rubber-stamp entrance: oversized, overshoot, land — in two discrete
 * poses. Owns the element's transform outright, so give it its own wrapper
 * rather than adding it to something already transformed.
 */
export function StampIn<T extends ElementType = "div">({
  as,
  delay = 0,
  rotate = 0,
  className,
  style,
  ...rest
}: PolymorphicProps<T, StampInOwnProps>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("cm-stamp-in", className)}
      style={
        {
          "--cm-delay": `${delay}s`,
          "--cm-rot": `${rotate}deg`,
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
