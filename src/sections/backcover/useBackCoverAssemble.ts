import { useCallback, useRef, type RefObject } from "react";
import { poseAt } from "@/hooks/assemble-pose";
import { useSceneAssemble } from "@/hooks/useSceneAssemble";
import { BACKCOVER_ASSEMBLE as A } from "./timing";

/**
 * Selector → its start fraction in the assembly window, in print order.
 *
 * Every element left on this page is inert, so each is posed directly. The
 * `__slot` wrappers this table used to go through existed because the CTA, the
 * résumé burst and the two bookend buttons each own a `transform` on `:hover`
 * that a pose on the same element would fight (CLAUDE.md rule 10) — those moved
 * to ORIGIN STORY's C4 (Mitul, 2026-07-27) and took the problem with them.
 */
const TARGETS: readonly (readonly [string, number])[] = [
  [".backcover__stamp", A.stamp],
  [".backcover__blurb", A.blurb],
  [".backcover__next-issue", A.nextIssue],
  [".backcover__barcode", A.barcode],
];

/**
 * The back cover's entrance (implementation-plan §6.4): the about boundary
 * hands its last 94–100% to `driveAssemble("backcover")` and the page prints
 * itself in under the fading gutter caption — the wall sliding in row by row,
 * then the contact furniture stamping down on top of it.
 *
 * Mechanically identical to the camera pages' driver, and deliberately so: one
 * `data-assemble` attribute per element, written only when its pose actually
 * changes, and stripped entirely at rest. What differs is only the target set
 * — this page has no mega page, no title box and no folio — which is why it
 * has its own table rather than bending `useMegaPageAssemble` around a third
 * shape it shares nothing with.
 *
 * The page renders complete with this never being called: the reader can land
 * here by chapter jump, by flicking past the window, or with reduced motion on.
 */
export function useBackCoverAssemble(
  rootRef: RefObject<HTMLElement | null>,
): void {
  const targets = useRef<{ el: HTMLElement; at: number }[] | null>(null);
  const poses = useRef<number[]>([]);

  const assemble = useCallback(
    (progress: number) => {
      const root = rootRef.current;
      if (!root) return;

      if (!targets.current) {
        const rows = [
          ...root.querySelectorAll<HTMLElement>(".backcover__row"),
        ].map((el, i) => ({
          el,
          at: A.rows[i] ?? A.rows.at(-1) ?? 0,
        }));
        const furniture = TARGETS.flatMap(([selector, at]) => {
          const el = root.querySelector<HTMLElement>(selector);
          return el ? [{ el, at }] : [];
        });
        targets.current = [...rows, ...furniture];
        poses.current = targets.current.map(() => -1);
      }

      const done = progress >= 1;
      targets.current.forEach((target, i) => {
        const pose = done ? -1 : poseAt(progress, target.at, A.window);
        if (pose === poses.current[i]) return;
        poses.current[i] = pose;
        if (pose < 0) target.el.removeAttribute("data-assemble");
        else target.el.dataset.assemble = String(pose);
      });
    },
    [rootRef],
  );

  useSceneAssemble(assemble);
}
