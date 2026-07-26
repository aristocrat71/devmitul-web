import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import {
  activeIndexAt,
  buildBook,
  registerBook,
  type SceneDef,
} from "@/lib/book";
import { ScrollTrigger } from "@/lib/gsap";
import { acquireSmoothScroll } from "@/lib/smooth-scroll";
import { SceneContext } from "./scene-context";

/**
 * The scene manager — the master timeline of the issue.
 *
 * One sticky, full-viewport stage rides inside a wrapper tall enough for
 * every scene's scrub distance; scenes composite into the stage as absolute
 * full-frame layers. This is the approved transition mockup's architecture
 * (fixed stage + scroll spacer) made lazy: because the wrapper's height is a
 * constant of the config, scenes can mount and unmount without the document
 * ever changing size — no pin-spacers, no scroll jumps, no re-measuring.
 * ScrollTrigger `pin` would re-layout the page on every scene mount, which is
 * exactly what the memory architecture (active ± 1 mounted, everything else
 * released) cannot afford.
 *
 * Engine guarantees, so no scene has to remember them:
 * - Scene lifecycle is 80% of memory (implementation-plan.md §0): only the
 *   active scene and its neighbors exist. Unmount releases DOM, listeners,
 *   decoded images, and — via `useGSAP`'s context revert — every
 *   ScrollTrigger the scene created.
 * - Earlier pages layer above later ones (a cover dissolves to reveal the
 *   next page assembling beneath it), but only the ACTIVE scene's layer takes
 *   pointer events — an invisible flown-past cover can never eat a click
 *   (CLAUDE.md rule 2's failure mode, enforced structurally).
 */
export function SceneManager({ scenes }: { scenes: readonly SceneDef[] }) {
  const bookRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const book = useMemo(() => buildBook(scenes), [scenes]);

  useEffect(() => {
    const el = bookRef.current;
    if (!el) return;
    const unregister = registerBook(book, el);
    // Children's effects run before this one: any scene mounted on first
    // paint created its ScrollTriggers while the registry was still empty,
    // so their function-based positions evaluated to 0. Re-evaluate them now
    // that the book is registered. (Scenes mounting later hit a live
    // registry and need nothing.)
    ScrollTrigger.refresh();
    const releaseScroll = acquireSmoothScroll();

    const sync = () => {
      const index = activeIndexAt(window.scrollY);
      setActive((prev) => (prev === index ? prev : index));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);

    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      releaseScroll();
      unregister();
    };
  }, [book]);

  return (
    <div
      ref={bookRef}
      className="cm-book"
      style={{ height: `${book.totalVh}vh` }}
    >
      <div className="cm-stage">
        {scenes.map((scene, index) => {
          if (Math.abs(index - active) > 1) return null;
          const state =
            index === active ? "active" : index < active ? "prev" : "next";
          return (
            <div
              key={scene.label}
              className="cm-scene"
              style={{
                zIndex: scenes.length - index,
                pointerEvents: state === "active" ? "auto" : "none",
              }}
              data-scene={scene.label}
              data-scene-state={state}
            >
              <SceneContext.Provider
                value={{
                  label: scene.label,
                  index,
                  lengthVh: scene.lengthVh,
                }}
              >
                <Suspense fallback={null}>
                  <scene.Component />
                </Suspense>
              </SceneContext.Provider>
            </div>
          );
        })}
      </div>
    </div>
  );
}
