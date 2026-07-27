import { useCallback, useEffect, useRef, useState } from "react";
import { activeIndexAt, jumpToScene, type SceneLabel } from "@/lib/book";
import { CHAPTERS, itemStamp } from "./contents";

/** Everything inside the wrapper that can hold focus while the panel is open. */
const FOCUSABLE = ".cm-contents__stamp, .cm-contents__item";

/**
 * Which chapter the reader is currently in, for the index's `aria-current`.
 *
 * Reads the engine's own answer (`activeIndexAt`) rather than keeping a second
 * opinion about where the scenes are — it is the same function the scene
 * manager uses to decide which page owns interaction, so the index can never
 * disagree with the book. React state is fine here: this changes five times in
 * the whole issue, not per frame.
 */
function useActiveChapter(): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const sync = () => {
      const next = activeIndexAt(window.scrollY);
      setIndex((prev) => (prev === next ? prev : next));
    };
    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
  return index;
}

/**
 * "CONTENTS" — the issue's chapter navigation, and the site's only persistent
 * UI (design-doc §10/A2).
 *
 * A re-skin of ReactBits' Staggered Menu: its structure survives (colour
 * pre-layers sliding in ahead of the panel, numbered entries staggering after
 * it, a toggle whose label rolls over), everything it wore does not. Colours
 * are tokens, every ease is `steps()`, the panel is paper and the entries are
 * Bangers — a `power4.out` glide reads as a different website (CLAUDE.md,
 * third-party components).
 *
 * The choreography is CSS keyed off `[data-open]`, not a JS timeline: the whole
 * thing is two slides and a stagger, and CSS keeps it off the main thread and
 * collapses correctly under `prefers-reduced-motion` for free.
 *
 * Selecting a chapter calls `jumpToScene`, which is A2's other half — instant
 * set + `ScrollTrigger.refresh()`, scene starts only, never an animated
 * scroll-through.
 */
export function ContentsMenu() {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stampRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const active = useActiveChapter();

  const close = useCallback((refocus: boolean) => {
    setOpen(false);
    if (refocus) stampRef.current?.focus();
  }, []);

  const select = useCallback(
    (label: SceneLabel) => {
      jumpToScene(label);
      // The reader has been moved to another page; the stamp is the only thing
      // still on screen that was, so focus lands back on it rather than on a
      // control that just slid away.
      close(true);
    },
    [close],
  );

  // Esc closes from anywhere, and Tab cycles inside the wrapper while open.
  // The stamp is inside that cycle on purpose: the way out of the panel is
  // always one Tab away, so the trap can never strand a keyboard reader.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab") return;
      const root = rootRef.current;
      if (!root) return;
      const stops = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!stops.length) return;
      const edge = event.shiftKey ? stops[0] : stops[stops.length - 1];
      if (document.activeElement !== edge) return;
      event.preventDefault();
      (event.shiftKey ? stops[stops.length - 1] : stops[0]).focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Click away. `pointerdown` rather than `click` so the panel is already gone
  // by the time the press lands on whatever is underneath it.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current?.contains(event.target as Node)) return;
      close(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, close]);

  // Opening moves focus into the panel — it is the skip-navigation affordance,
  // so reaching the chapters must not cost five more Tabs.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.querySelector<HTMLElement>(".cm-contents__item")?.focus();
  }, [open]);

  return (
    <div className="cm-contents" ref={rootRef} data-open={open || undefined}>
      {/* The two print passes that arrive ahead of the paper — the base
          component's signature, re-tokened. Decorative, so out of the tree. */}
      <div className="cm-contents__layers" aria-hidden="true">
        <span className="cm-contents__layer cm-contents__layer--mag" />
        <span className="cm-contents__layer cm-contents__layer--cyn" />
      </div>

      <nav
        id="cm-contents-panel"
        className="cm-contents__panel"
        ref={panelRef}
        aria-label="Contents"
        // Closed, the panel is off-screen but still in the layout: `inert`
        // keeps its five buttons out of the tab order and out of the
        // accessibility tree without needing a second hidden/visible pass.
        inert={!open}
      >
        <p className="cm-contents__kicker">ISSUE #01</p>
        <h2 className="cm-contents__heading">CONTENTS</h2>
        <ul className="cm-contents__list">
          {CHAPTERS.map((chapter, index) => (
            <li key={chapter.label}>
              <button
                type="button"
                className="cm-contents__item"
                style={itemStamp(index)}
                aria-current={index === active ? "true" : undefined}
                onClick={() => select(chapter.label)}
              >
                <span className="cm-contents__folio">{chapter.folio}</span>
                <span className="cm-contents__title">{chapter.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* The stamp. Its label rolls INDEX -> CLOSE inside a clipped box, so the
          rotation stays on the button and the roll stays on the inner element
          (CLAUDE.md rule 10). Both labels are decorative — `aria-label` and
          `aria-expanded` are what the control actually announces. */}
      <button
        type="button"
        ref={stampRef}
        className="cm-contents__stamp"
        aria-label="Contents"
        aria-expanded={open}
        aria-controls="cm-contents-panel"
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        <span className="cm-contents__stamp-clip" aria-hidden="true">
          <span className="cm-contents__stamp-roll">
            <span className="cm-contents__stamp-line">INDEX</span>
            <span className="cm-contents__stamp-line">CLOSE</span>
          </span>
        </span>
      </button>
    </div>
  );
}
