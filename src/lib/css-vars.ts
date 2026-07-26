import type { CSSProperties } from "react";

/**
 * `CSSProperties` rejects `--custom` keys, and the whole kit drives its
 * variants through custom properties. This is the one place we widen it, so
 * components stay honestly typed everywhere else.
 */
export type CSSVarStyle = CSSProperties &
  Partial<Record<`--${string}`, string | number>>;
