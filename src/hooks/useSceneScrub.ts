import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneEndPx, sceneStartPx } from "@/lib/book";
import { useScene } from "@/components/scene/scene-context";

gsap.registerPlugin(useGSAP);

export interface SceneScrubOptions {
  /**
   * ScrollTrigger `scrub`. `true` (default) rides Lenis's already-eased
   * scroll 1:1; a number adds extra catch-up seconds on top — rarely wanted,
   * the site's smoothing lives in Lenis alone.
   */
  scrub?: boolean | number;
}

/**
 * A scene's scrubbed timeline: built once on mount, mapped over the scene's
 * slice of the one continuous scroll. Start/end are function-based lookups
 * into `book.ts`, re-evaluated on every `ScrollTrigger.refresh()` — resize,
 * orientation, font load — so positions are never stale (CLAUDE.md rule 12).
 *
 * `useGSAP` scopes everything the builder creates and reverts it on unmount:
 * the ScrollTrigger is killed and inline styles are cleared, which is the
 * memory rule — leaked triggers are leaked scenes (implementation-plan.md §0).
 * A remounting scene therefore always rebuilds from a clean slate.
 *
 * The builder runs once per mount. Give the timeline `ease: "none"` steps and
 * quantized `steps()`-style poses per the motion language; the camera
 * exceptions own their own eases.
 */
export function useSceneScrub(
  build: (timeline: gsap.core.Timeline) => void,
  options?: SceneScrubOptions,
): void {
  const { label, lengthVh } = useScene();
  useGSAP(() => {
    // A scene with no scrub distance (back cover) has no timeline to drive.
    if (lengthVh === 0) return;
    const timeline = gsap.timeline({
      scrollTrigger: {
        start: () => sceneStartPx(label),
        end: () => sceneEndPx(label),
        scrub: options?.scrub ?? true,
        invalidateOnRefresh: true,
      },
    });
    build(timeline);
  }, []);
}

/**
 * Raw progress (0..1) over the scene's scroll range, for imperative
 * consumers — the transition system feeding `driveAssemble()` or damping
 * `setParallaxAmount()`. The callback runs outside React; never set state
 * per frame with it.
 */
export function useSceneProgress(
  onProgress: (progress: number) => void,
): void {
  const { label, lengthVh } = useScene();
  useGSAP(() => {
    if (lengthVh === 0) return;
    ScrollTrigger.create({
      start: () => sceneStartPx(label),
      end: () => sceneEndPx(label),
      onUpdate: (self) => onProgress(self.progress),
    });
  }, []);
}
