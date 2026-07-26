import { useCallback, useRef, type RefObject } from "react";
import { poseAt } from "@/hooks/assemble-pose";
import { useSceneAssemble } from "@/hooks/useSceneAssemble";
import { CASES_ASSEMBLE as A } from "./timing";

/**
 * The page's entrance: the projects boundary hands its last 79–100% to
 * `driveAssemble("experience")` and the header stamps in, then the docket lands
 * (implementation-plan §4.8).
 *
 * Two targets only — the title box and the stack — because the leaf scrub owns
 * every file's transform and opacity outright and a second writer would simply
 * lose (`CASES_ASSEMBLE` documents the reasoning). Attributes come off entirely
 * at rest, so a page that is never driven — a label jump, a flick past the
 * window, reduced motion — renders complete with nothing to clean up.
 */
export function useExperienceAssemble(
  headRef: RefObject<HTMLElement | null>,
  stackRef: RefObject<HTMLElement | null>,
): void {
  const poses = useRef<[number, number]>([-1, -1]);

  const assemble = useCallback(
    (progress: number) => {
      const targets: [HTMLElement | null, number][] = [
        [headRef.current, A.head],
        [stackRef.current, A.stack],
      ];
      const done = progress >= 1;

      targets.forEach(([el, at], i) => {
        if (!el) return;
        const pose = done ? -1 : poseAt(progress, at, A.window);
        if (pose === poses.current[i]) return;
        poses.current[i] = pose;
        if (pose < 0) el.removeAttribute("data-assemble");
        else el.dataset.assemble = String(pose);
      });
    },
    [headRef, stackRef],
  );

  useSceneAssemble(assemble);
}
