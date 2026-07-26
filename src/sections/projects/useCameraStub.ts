import { useEffect, type RefObject } from "react";

/** The mockup's own fit-page keyframe: min(vw/104vw, vh/138vh) × 0.92. */
const FIT = 0.92 / 1.38;

/**
 * TEMPORARY — belongs to §3's other half, not to this port.
 *
 * The camera scrub, the keyframe math and the `<CameraWalkScene>` API are
 * Fable 5's (implementation-plan § MODEL ASSIGNMENT, split stages). Until they
 * land, this parks the page on the mockup's own fit-page keyframe and marks
 * every cell performed, so the port is visible and verifiable instead of
 * sitting off-screen at the page's top-left corner.
 *
 * No measurement is involved: the page is sized in vw/vh, so vh/138vh is
 * always the smaller ratio and the fit scale is the constant 0.92/1.38.
 *
 * Delete this file and its one call in `ProjectsScene` when the camera lands.
 */
export function useCameraStub(pageRef: RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return;
    const cells = [...page.querySelectorAll<HTMLElement>(".cm-cell")];

    page.style.transform = `translate(calc(50vw - 52vw * ${FIT}), calc(50vh - 69vh * ${FIT})) scale(${FIT})`;
    // The pull-back state: at full page every cell renders performed and the
    // fourth cell is stamped in (design-doc §8, the global pull-back rule).
    page.classList.add("cm-megapage--outro");
    for (const cell of cells) cell.classList.add("cm-cell--on");

    return () => {
      page.style.transform = "";
      page.classList.remove("cm-megapage--outro");
      for (const cell of cells) cell.classList.remove("cm-cell--on");
    };
  }, [pageRef]);
}
