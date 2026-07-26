import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";

type OnomatopoeiaProps = {
  children: ReactNode;
  /** Angle of the burst, degrees. */
  rotate?: number;
  /** Seconds before it pops. */
  delay?: number;
  /**
   * Opacity it settles to after the pop, so it stops competing with whatever
   * it's hugging. Pass `false` to hold full strength.
   */
  ghost?: number | false;
  /** Seconds before the ghost fade begins. */
  ghostDelay?: number;
  className?: string;
  style?: CSSVarStyle;
  /**
   * Bursts are decorative lettering and usually sit inside a heading, where
   * they would otherwise land in its accessible name — "dev/Mitul THWAK!".
   * Hidden by default; pass `false` when the burst really is content.
   */
  decorative?: boolean;
};

/**
 * The acid-yellow sound burst (`THWAK!`). Pops in over two steps, then fades
 * to a ghost. Always `pointer-events: none` — it overlaps interactive
 * elements by design (CLAUDE.md rule 2).
 */
export function Onomatopoeia({
  children,
  rotate = 9,
  delay = 0,
  ghost = 0.28,
  ghostDelay = 1.6,
  className,
  style,
  decorative = true,
}: OnomatopoeiaProps) {
  const vars = {
    "--cm-rot": `${rotate}deg`,
    "--cm-delay": `${delay}s`,
    ...(ghost !== false
      ? { "--cm-ghost": ghost, "--cm-ghost-delay": `${ghostDelay}s` }
      : null),
    ...style,
  } satisfies CSSVarStyle;

  return (
    <span
      aria-hidden={decorative || undefined}
      className={cn("cm-burst", ghost !== false && "cm-burst--ghost", className)}
      style={vars}
    >
      {children}
    </span>
  );
}
