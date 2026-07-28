import { useCallback, useRef, type RefObject } from "react";
import { GutterCaption, TitleBox } from "@/components/comic";
import { CameraWalkScene } from "@/components/scene/CameraWalkScene";
import {
  megaPageFade,
  useBoundaryZoom,
  type BoundaryConfig,
} from "@/hooks/useBoundaryZoom";
import { useMegaPageAssemble } from "@/hooks/useMegaPageAssemble";
import { useSceneProgress } from "@/hooks/useSceneScrub";
import interestsCollage from "@/assets/about/interests-collage.webp";
import musicCollage from "@/assets/about/music-collage.webp";
import { CollageCell } from "./CollageCell";
import { INTERESTS_PANEL, MUSIC_PANEL } from "./content";
import { FinaleCell } from "./FinaleCell";
import { GreetingCell } from "./GreetingCell";
import {
  ABOUT_ASSEMBLE,
  ABOUT_BOUNDARY,
  ABOUT_SETTLED_AT,
  ABOUT_WALK,
} from "./timing";
import "./about.css";

/**
 * The outbound boundary: the target zoom into the finale speech bubble —
 * entering the bubble IS starting the conversation ("SAY HELLOOO...") — into
 * the back cover. The bubble's settled pulse is gated off the moment the zoom
 * owns the shot.
 */
const ABOUT_DIVE: BoundaryConfig = {
  next: "backcover",
  timing: ABOUT_BOUNDARY,
  fade: megaPageFade,
  pulse: (root) => {
    const box = root.querySelector<HTMLElement>(".about__bubble-box");
    return box ? [box] : [];
  },
};

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
 * camera position, and the layer beneath is the next scene. The gutter sits
 * under that backdrop — invisible until the outbound boundary dissolves the
 * page into it.
 */
export function AboutScene() {
  const pageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // The experience boundary drives this over its final 79–100%. Registration
  // stays page-owned; the ref is shared with the camera, no property on it is.
  useMegaPageAssemble(pageRef, ABOUT_ASSEMBLE);
  useSettled(pageRef, ABOUT_SETTLED_AT);
  // The scene's own tail is the boundary out — dive, caption, and
  // driveAssemble("backcover") over the closing hold (a no-op until §6
  // registers the back cover's entrance).
  useBoundaryZoom({ root: rootRef, gutter: gutterRef }, ABOUT_DIVE);

  return (
    <>
      <GutterCaption ref={gutterRef} kicker="BACK COVER" text="SAY HELLOOO..." />
      <CameraWalkScene
        walk={ABOUT_WALK}
        folio="PAGE 03"
        className="about"
        pageClassName="about__page"
        pageRef={pageRef}
        rootRef={rootRef}
      >
        <TitleBox className="about__page-title" kicker="PAGE 03 — SUBJECT PROFILE">
          ORIGIN STORY
        </TitleBox>

        {/* Reading order is camera order: the walk's keyframes are the cells
            carrying a focus number, sorted by it. */}
        <GreetingCell focus={0} />
        <CollageCell
          at="tr"
          focus={1}
          name="music"
          side="right"
          src={musicCollage}
          {...MUSIC_PANEL}
        />
        <CollageCell
          at="br"
          focus={2}
          name="interests"
          side="left"
          src={interestsCollage}
          {...INTERESTS_PANEL}
        />

        {/* The camera's last stop and the dive's launch point (a camera stop
            since 2026-07-27, like THE GOOD PART's catalogue cell; the
            pull-back that used to follow it was cut 2026-07-28). Its furniture
            stamps on the megapage-outro gate, which fires as the camera turns
            toward the cell. */}
        <FinaleCell focus={3} />
      </CameraWalkScene>
    </>
  );
}

/**
 * "Pulsing once the camera settles" (design-doc §8, C4) — one page-owned
 * threshold on top of the engine's own gates.
 *
 * The engine's `outroAt` is the wrong signal for this: the finale has to stamp
 * in while the camera is still panning toward it — it must never arrive at
 * blank paper — which is well before the camera stops. So the page watches
 * its own progress through the documented `useSceneProgress` seam and flips one
 * class at the last pan's end — rather than teaching the shared engine a
 * second gate that only this page needs.
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
