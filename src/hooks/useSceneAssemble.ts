import { useEffect } from "react";
import { registerAssemble } from "@/lib/book";
import { useScene } from "@/components/scene/scene-context";

/**
 * Register this scene's entrance choreography. The *previous* scene's
 * transition drives it over its final 79–100% of scrub — panels stamping in
 * beneath the gutter-caption fade (implementation-plan.md §2.6).
 *
 * The scene must render complete-at-rest without this ever being called: a
 * fast flick can outrun the assembly window, and reduced-motion visitors get
 * no choreography at all. `assemble(0)` = nothing entered yet;
 * `assemble(1)` = at rest.
 */
export function useSceneAssemble(assemble: (progress: number) => void): void {
  const { label } = useScene();
  useEffect(
    () => registerAssemble(label, assemble),
    [label, assemble],
  );
}
