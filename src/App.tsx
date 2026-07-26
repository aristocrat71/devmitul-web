import { lazy, useRef } from "react";
import { SceneManager } from "@/components/scene/SceneManager";
import { useScene } from "@/components/scene/scene-context";
import { useSceneScrub } from "@/hooks/useSceneScrub";
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

/**
 * PLACEHOLDER page — §1–§6 (Opus 5) replace these with the real mockup
 * ports, one scene at a time, passing `lazy(() => import(...))` components to
 * code-split each page. This stub exists only so the §0 engine is verifiable:
 * it names its scene and scrubs one marker across the scene's range, proving
 * mount lifecycle, scrub wiring, and cleanup.
 */
function PlaceholderPage() {
  const { label, index, lengthVh } = useScene();
  const rootRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);

  // Marker scrubs across the first 90% of the range; the page fades itself
  // out over the last 10%, revealing the neighbor mounted beneath — the same
  // shape every real page follows (a scene's tail is its outbound
  // transition; the layer beneath is the next page assembling).
  useSceneScrub((timeline) => {
    timeline
      .fromTo(
        markerRef.current,
        { xPercent: 0 },
        { xPercent: 400, ease: "none", duration: 9 },
      )
      .to(rootRef.current, { autoAlpha: 0, ease: "none", duration: 1 });
  });

  return (
    <div
      ref={rootRef}
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        background: "var(--ink)",
        color: "var(--paper)",
        fontFamily: '"Courier New", monospace',
        fontWeight: 700,
        letterSpacing: "0.2em",
      }}
    >
      <div>
        <p>
          {index === 0 ? "COVER" : `PAGE 0${index}`} · {label.toUpperCase()} ·{" "}
          {lengthVh}VH
        </p>
        <div
          ref={markerRef}
          style={{ width: 40, height: 40, background: "var(--acid)" }}
        />
      </div>
    </div>
  );
}

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
 */
const BOOK: readonly SceneDef[] = [
  // Scene 0 is the entry point and always mounts first, so it is imported
  // eagerly — code-splitting it would only add a waterfall before first paint.
  // §3 onward should use `lazy()`.
  { label: "cover", lengthVh: 260, Component: CoverScene },
  { label: "projects", lengthVh: 300, Component: ProjectsScene },
  { label: "experience", lengthVh: 360, Component: ExperienceScene },
  { label: "about", lengthVh: 300, Component: AboutScene },
  { label: "backcover", lengthVh: 0, Component: PlaceholderPage },
];

export default function App() {
  return <SceneManager scenes={BOOK} />;
}
