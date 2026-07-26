import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";

/**
 * A punched evidence ticket — courier caps on ink stock, one corner cut to a
 * point with a punched hole through it (implementation-plan §4.1).
 *
 * Two approved pages print the same device: ORIGIN STORY's POWERS & ABILITIES
 * appendix (design-doc §8, C3) and CASE FILES' evidence rows (§7). The two
 * mockups draw it identically apart from a 1px of type and padding, so the
 * shape lives here once and a page that wants the smaller size overrides
 * `.cm-tag` from its own stylesheet.
 *
 * The stamp-in itself is the *page's* to trigger, because only the page knows
 * what "arrived" means — the camera reaching a cell here, a folder reaching
 * the top of the stack in §4. Consumers write the gate and reuse the shared
 * `cm-tag-in` keyframes:
 *
 *   .cm-cell--on .cm-tag { animation: cm-tag-in .16s steps(2) both var(--cm-delay); }
 */
export function EvidenceTag({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  /** Seconds into the gate's stagger. The page's timing table owns the number. */
  delay?: number;
  className?: string;
}) {
  // Assigned to a typed local first: a fresh object literal carrying only
  // custom properties trips the excess-property check on `style`.
  const style: CSSVarStyle | undefined =
    delay === undefined ? undefined : { "--cm-delay": `${delay}s` };

  return (
    <span className={cn("cm-tag", className)} style={style}>
      {children}
    </span>
  );
}
