import { useCallback, useRef, type RefObject } from "react";
import { useSceneAssemble } from "@/hooks/useSceneAssemble";
import { PROJECTS_ASSEMBLE as A } from "./timing";

/** Which pose an element is in, given the assembly progress. */
function poseAt(progress: number, at: number): number {
  const t = (progress - at) / A.window;
  if (t < 0.34) return 0;
  if (t < 0.67) return 1;
  return 2;
}

/**
 * The page's entrance: the cover's dive hands its last 79–100% to
 * `driveAssemble("projects")`, and the page prints itself in — paper, title
 * box, cells one at a time, folio (implementation-plan §3.5).
 *
 * Writes one attribute per element, only when its pose actually changes, and
 * strips them entirely once the page is at rest. That keeps the whole entrance
 * stepped by construction, keeps every resting transform in CSS where its
 * owner can re-state it (CLAUDE.md rule 10), and means a page that is never
 * driven — a label jump, a fast flick past the window, reduced motion —
 * renders complete with no cleanup needed.
 */
export function useProjectsAssemble(
  pageRef: RefObject<HTMLElement | null>,
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
          { el: page, at: A.page },
          ...(title ? [{ el: title, at: A.title }] : []),
          ...cells.map((el, i) => ({ el, at: A.cells[i] ?? A.cells.at(-1)! })),
          ...(folio ? [{ el: folio, at: A.folio }] : []),
        ];
        poses.current = targets.current.map(() => -1);
      }

      // At rest the attributes come off entirely rather than being parked at
      // the landed pose: a stray `[data-assemble]` would keep an inline-ish
      // transform on elements whose resting state is genuinely untransformed.
      const done = progress >= 1;
      targets.current.forEach((target, i) => {
        const pose = done ? -1 : poseAt(progress, target.at);
        if (pose === poses.current[i]) return;
        poses.current[i] = pose;
        if (pose < 0) target.el.removeAttribute("data-assemble");
        else target.el.dataset.assemble = String(pose);
      });
    },
    [pageRef],
  );

  useSceneAssemble(assemble);
}
