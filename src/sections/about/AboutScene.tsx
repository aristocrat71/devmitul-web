import { useCallback, useRef, type RefObject } from "react";
import { TitleBox } from "@/components/comic";
import { CameraWalkScene } from "@/components/scene/CameraWalkScene";
import { useInterimExit } from "@/hooks/useInterimExit";
import { useMegaPageAssemble } from "@/hooks/useMegaPageAssemble";
import { useSceneProgress } from "@/hooks/useSceneScrub";
import { FinaleCell } from "./FinaleCell";
import { GreetingCell } from "./GreetingCell";
import { OriginCell } from "./OriginCell";
import { PowersCell } from "./PowersCell";
import { ABOUT_ASSEMBLE, ABOUT_SETTLED_AT, ABOUT_WALK } from "./timing";
import "./about.css";

/**
 * Page 03 — ORIGIN STORY.
 *
 * A port of the approved `about-page-mockup.html` v3: the subject profile
 * printed as four cells on one big comic page, read panel by panel by the
 * shared camera (design-doc §8). Structurally it is THE GOOD PART's twin — same
 * paper page, same 2×2 grid, same reading path — so this file is a
 * configuration of `<CameraWalkScene>` and holds no camera code of its own.
 *
 * The void behind the page is this scene's own backdrop, not the stage's: the
 * design requires the void to stay visible around the page's edges at every
 * camera position, and the layer beneath is the next scene.
 */
export function AboutScene() {
  const pageRef = useRef<HTMLDivElement>(null);

  // The experience boundary drives this over its final 79–100%. Registration
  // stays page-owned; the ref is shared with the camera, no property on it is.
  useMegaPageAssemble(pageRef, ABOUT_ASSEMBLE);
  useSettled(pageRef, ABOUT_SETTLED_AT);
  // TEMPORARY — remove with the about → contact transition. See the hook.
  useInterimExit(pageRef);

  return (
    <CameraWalkScene
      walk={ABOUT_WALK}
      folio="PAGE 03"
      className="about"
      pageClassName="about__page"
      pageRef={pageRef}
    >
      <TitleBox className="about__page-title" kicker="PAGE 03 — SUBJECT PROFILE">
        ORIGIN STORY
      </TitleBox>

      {/* Reading order is camera order: the walk's keyframes are the cells
          carrying a focus number, sorted by it. */}
      <GreetingCell focus={0} />
      <OriginCell focus={1} />
      <PowersCell focus={2} />

      {/* No focus number — the pull-back reveals this one. */}
      <FinaleCell />
    </CameraWalkScene>
  );
}

/**
 * "Pulsing once the camera settles" (design-doc §8, C4) — one page-owned
 * threshold on top of the engine's own gates.
 *
 * The engine's `outroAt` is the wrong signal for this: the finale has to stamp
 * in *during* the pull-back so the reveal never shows an empty cell (the global
 * pull-back rule), which is well before the camera stops. So the page watches
 * its own progress through the documented `useSceneProgress` seam and flips one
 * class at the point the last segment begins — rather than teaching the shared
 * engine a second gate that only this page needs.
 */
function useSettled(pageRef: RefObject<HTMLElement | null>, at: number): void {
  const settled = useRef<boolean | null>(null);

  const onProgress = useCallback(
    (progress: number) => {
      const on = progress >= at;
      if (on === settled.current) return;
      settled.current = on;
      pageRef.current?.classList.toggle("about__page--settled", on);
    },
    [pageRef, at],
  );

  useSceneProgress(onProgress);
}

export default AboutScene;
