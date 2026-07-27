import { lazy } from "react";
import { ReticleCursor } from "@/components/cursor/ReticleCursor";
import { ContentsMenu } from "@/components/nav/ContentsMenu";
import { SceneManager } from "@/components/scene/SceneManager";
import type { SceneDef } from "@/lib/book";
import { CoverScene } from "@/sections/cover/CoverScene";

// Every scene after the entry point is code-split: a page's chunk loads when
// the scene manager mounts it as the active scene's neighbor, well before it
// is on screen.
const ProjectsScene = lazy(() => import("@/sections/projects/ProjectsScene"));
const ExperienceScene = lazy(
  () => import("@/sections/experience/ExperienceScene"),
);
const AboutScene = lazy(() => import("@/sections/about/AboutScene"));
const BackCoverScene = lazy(
  () => import("@/sections/backcover/BackCoverScene"),
);

/**
 * The spine of Issue #01. Lengths are each scene's pin duration in vh —
 * cover/projects/experience/about per implementation-plan §§1–5 (a scene's
 * length includes its outbound transition); the back cover is a resting page
 * with no internal scrub (§6). Stages tune their own numbers as they land.
 *
 * Tightened ~22% on 2026-07-26 (330/520/460/520 → 260/400/360/400): the issue
 * read as too much scrolling end to end. Every scene came down by the same
 * proportion on purpose — each one's choreography is expressed in progress
 * fractions, so a uniform cut tightens the whole book without retuning a
 * single phase, and the relative pacing between pages is preserved.
 *
 * Projects came down again the same day, 400 → 300vh: the camera walk was
 * still the longest read in the issue. Its segment map is untouched — the
 * approved reading path keeps its proportions, every hold and pan just covers
 * less scroll. Note ~21% of the range (≈63vh) is the closing hold, reserved
 * for the Projects → Experience dive that hasn't been built yet; until it
 * lands, that tail is a static full-page view.
 *
 * About followed projects down to 300vh when §5 landed, for the same reason and
 * to the same number: ORIGIN STORY is THE GOOD PART's structural twin and runs
 * an identical camera walk, so the two were always the same length (520 each
 * originally, 400 each after the uniform cut). Leaving about at 400 would have
 * made the same walk read a third slower than the one that was just tightened
 * for reading a beat too long.
 *
 * Experience came down 360 → 280vh on 2026-07-27 (Mitul: moving through the
 * case files took too long). Unlike the earlier cuts this one is NOT
 * fraction-neutral: the leaf's windows and the outbound boundary were
 * re-balanced with it so the reading holds absorb the whole cut while the
 * tosses and the dive keep their absolute scroll (the boundary was already
 * the tightest in the book) — see CASES_LEAF / CASES_BOUNDARY.
 */
const BOOK: readonly SceneDef[] = [
  // Scene 0 is the entry point and always mounts first, so it is imported
  // eagerly — code-splitting it would only add a waterfall before first paint.
  // §3 onward should use `lazy()`.
  { label: "cover", lengthVh: 260, Component: CoverScene },
  { label: "projects", lengthVh: 300, Component: ProjectsScene },
  { label: "experience", lengthVh: 280, Component: ExperienceScene },
  { label: "about", lengthVh: 300, Component: AboutScene },
  // The book ends here: a resting page with no scrub of its own. The boundary
  // INTO it lives in about's tail. Nothing on it is interactive any more — the
  // contact block moved to ORIGIN STORY's C4 (Mitul, 2026-07-27).
  { label: "backcover", lengthVh: 0, Component: BackCoverScene },
];

export default function App() {
  return (
    <>
      <SceneManager scenes={BOOK} />
      {/* Persistent UI, outside the stage on purpose: the stage is a sticky
          stacking context whose scenes mount and unmount, and the index has to
          survive all of that (design-doc §10/A2). */}
      <ContentsMenu />
      {/* Last, so it paints over the index too — it is the cursor. Mounts only
          on a fine pointer with motion allowed; on touch it renders nothing
          and the native cursor is never touched (design-doc §10/A3). */}
      <ReticleCursor />
    </>
  );
}
