import { useRef } from "react";
import { SceneManager } from "@/components/scene/SceneManager";
import { useScene } from "@/components/scene/scene-context";
import { useSceneScrub } from "@/hooks/useSceneScrub";
import type { SceneDef } from "@/lib/book";

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
 */
const BOOK: readonly SceneDef[] = [
  { label: "cover", lengthVh: 330, Component: PlaceholderPage },
  { label: "projects", lengthVh: 520, Component: PlaceholderPage },
  { label: "experience", lengthVh: 460, Component: PlaceholderPage },
  { label: "about", lengthVh: 520, Component: PlaceholderPage },
  { label: "backcover", lengthVh: 0, Component: PlaceholderPage },
];

export default function App() {
  return <SceneManager scenes={BOOK} />;
}
