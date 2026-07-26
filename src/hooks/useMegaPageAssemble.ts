import { useCallback, useRef, type RefObject } from "react";
import { poseAt } from "@/hooks/assemble-pose";
import { useSceneAssemble } from "@/hooks/useSceneAssemble";

/**
 * A camera-walk page's entrance table. One module per section owns the numbers
 * (CLAUDE.md conventions); the mechanism below is shared, because THE GOOD PART
 * and ORIGIN STORY print in exactly the same order — paper, title box, cells,
 * folio — and two hand-rolled copies of that would be the same bug farm the
 * camera engine was extracted to avoid (implementation-plan §5).
 *
 * Values are fractions of the *assembly* window (the previous boundary's final
 * 79–100%), not of the scene.
 */
export interface MegaPageAssemble {
  /** How long one element takes to play its three poses. */
  readonly window: number;
  readonly page: number;
  readonly title: number;
  /** Per cell, in DOM order. Short lists reuse the last entry. */
  readonly cells: readonly number[];
  readonly folio: number;
}

/**
 * The page's entrance: the incoming boundary hands its last 79–100% to
 * `driveAssemble(<label>)`, and the page prints itself in — paper, title box,
 * cells one at a time, folio (implementation-plan §3.5).
 *
 * Writes one attribute per element, only when its pose actually changes, and
 * strips them entirely once the page is at rest. That keeps the whole entrance
 * stepped by construction, keeps every resting transform in CSS where its
 * owner can re-state it (CLAUDE.md rule 10), and means a page that is never
 * driven — a label jump, a fast flick past the window, reduced motion —
 * renders complete with no cleanup needed.
 */
export function useMegaPageAssemble(
  pageRef: RefObject<HTMLElement | null>,
  table: MegaPageAssemble,
): void {
  const targets = useRef<{ el: HTMLElement; at: number }[] | null>(null);
  const poses = useRef<number[]>([]);

  const assemble = useCallback(
    (progress: number) => {
      const page = pageRef.current;
      if (!page) return;

      if (!targets.current) {
        const cells = [...page.querySelectorAll<HTMLElement>(".cm-cell")];
        const title = page.querySelector<HTMLElement>(".cm-title-box");
        const folio = page.querySelector<HTMLElement>(".cm-megapage__folio");
        targets.current = [
          { el: page, at: table.page },
          ...(title ? [{ el: title, at: table.title }] : []),
          ...cells.map((el, i) => ({
            el,
            at: table.cells[i] ?? table.cells.at(-1) ?? 0,
          })),
          ...(folio ? [{ el: folio, at: table.folio }] : []),
        ];
        poses.current = targets.current.map(() => -1);
      }

      // At rest the attributes come off entirely rather than being parked at
      // the landed pose: a stray `[data-assemble]` would keep an inline-ish
      // transform on elements whose resting state is genuinely untransformed.
      const done = progress >= 1;
      targets.current.forEach((target, i) => {
        const pose = done ? -1 : poseAt(progress, target.at, table.window);
        if (pose === poses.current[i]) return;
        poses.current[i] = pose;
        if (pose < 0) target.el.removeAttribute("data-assemble");
        else target.el.dataset.assemble = String(pose);
      });
    },
    [pageRef, table],
  );

  useSceneAssemble(assemble);
}
