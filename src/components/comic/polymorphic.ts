import type { ComponentPropsWithoutRef, ElementType } from "react";

/**
 * Kit wrappers each own exactly one transform, so callers frequently want the
 * wrapper to *be* the semantic element (an `h1`, an `a`) rather than another
 * `div` around it. `as` gives them that without losing prop typing.
 */
export type PolymorphicProps<T extends ElementType, OwnProps> = OwnProps & {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, keyof OwnProps | "as">;
