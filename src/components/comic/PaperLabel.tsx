import type { ElementType } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import type { PolymorphicProps } from "./polymorphic";
import { toneVar, type Tone } from "./tone";

type PaperLabelOwnProps = {
  /**
   * `paper` — printed on paper stock with a hard offset shadow (#01 ISSUE).
   * `outline` — inked outline only, no fill (the location stamp).
   * `solid` — filled chip in the tone, paper text. Unused since the speaker
   *   sticker was cut (2026-07-28); kept as one of the three approved print
   *   treatments rather than as that sticker's private variant.
   */
  variant?: "paper" | "outline" | "solid";
  /** Which print pass colours it: the shadow on `paper`, the ink otherwise. */
  tone?: Tone;
  /** Resting angle, degrees. */
  rotate?: number;
  style?: CSSVarStyle;
};

/**
 * Courier stamps and tags — the issue's utility voice. Cover furniture, case
 * numbers, folio marks, barcode captions all come from here so the wide
 * letter-spaced monospace treatment stays identical across pages.
 */
export function PaperLabel<T extends ElementType = "div">({
  as,
  variant = "paper",
  tone = variant === "paper" ? "mag" : "acid",
  rotate = 0,
  className,
  style,
  ...rest
}: PolymorphicProps<T, PaperLabelOwnProps>) {
  const Tag = (as ?? "div") as ElementType;
  return (
    <Tag
      className={cn("cm-label", `cm-label--${variant}`, className)}
      style={
        {
          "--cm-tone": toneVar(tone),
          "--cm-rot": `${rotate}deg`,
          ...style,
        } satisfies CSSVarStyle
      }
      {...rest}
    />
  );
}
