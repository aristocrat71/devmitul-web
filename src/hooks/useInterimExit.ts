import { type RefObject } from "react";
import { useSceneScrub } from "@/hooks/useSceneScrub";

/**
 * ============================ TEMPORARY SCAFFOLD ============================
 * DELETE THIS HOOK, and its three call sites, when the remaining outbound
 * transitions land (projects → experience, experience → about, about →
 * contact). It exists only so the book is readable in the meantime.
 * ===========================================================================
 *
 * Every page must be opaque over the void and gone by the time the next one is
 * assembled beneath it — earlier scenes layer ABOVE later ones, so a page that
 * never exits covers the rest of the issue for good. §2 gives the cover a real
 * exit (the target zoom fades it out), and `PlaceholderPage` fades itself over
 * its own tail for exactly this reason. The three real interior pages currently
 * have neither: measured across the book, cover → 0 at its boundary and every
 * other layer sits at opacity 1 forever, which made pages 02 and 03 unreachable
 * the moment they stopped being placeholders.
 *
 * This is deliberately NOT a transition: no dive, no gutter caption, no
 * `driveAssemble` of the next page. It is one linear fade over the tail, which
 * the real boundary replaces wholesale — a page's outbound transition owns this
 * window (implementation-plan §2, and `book.ts`: a scene's length includes it).
 */

/**
 * Fraction of the scene at which the stand-in fade begins — deliberately late.
 * With no gutter between the two pages, a cross-dissolve shows both at once,
 * which reads as a rendering fault rather than a page turn; the real boundary
 * fixes that properly by fading the outgoing page into the gutter before the
 * next one is anywhere on screen (design-doc §5). Until then, keeping the
 * overlap down to a flick is the least misleading stand-in available.
 */
const EXIT_AT = 0.96;

/**
 * The scene *layer* an element belongs to — the node `SceneManager` mounts per
 * scene, which is what has to go transparent. Fading a page's own inner content
 * isn't enough on the camera-walk pages: their backdrop is an opaque `--void`
 * fill, and that fill is what covers the next chapter.
 */
const sceneLayer = (el: HTMLElement | null): HTMLElement | null =>
  (el?.closest(".cm-scene")?.firstElementChild as HTMLElement | null) ?? null;

/** Pass a ref to anything the scene owns; the layer is resolved from it. */
export function useInterimExit(ref: RefObject<HTMLElement | null>): void {
  useSceneScrub((timeline) => {
    timeline
      // Convention: pin the total to 1 so positions are progress fractions.
      .set({}, {}, 1)
      .fromTo(
        sceneLayer(ref.current),
        { autoAlpha: 1 },
        { autoAlpha: 0, ease: "none", duration: 1 - EXIT_AT },
        EXIT_AT,
      );
  });
}
