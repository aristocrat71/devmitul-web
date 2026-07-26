import type { ComponentType } from "react";
import { ScrollTrigger } from "./gsap";
import { setScrollInstant } from "./smooth-scroll";

/**
 * The spine of the issue: which scenes exist, in what order, and where each
 * one lives on the one continuous scroll timeline (implementation-plan.md §0).
 *
 * The whole mapping is arithmetic on the configured lengths — no DOM
 * measurement anywhere (CLAUDE.md rule 12: prefer mechanics that need no
 * measurement at all). A scene's scroll range is derived from the sum of the
 * lengths before it and the live viewport height, so resize/orientation/font
 * load can't break it; there is nothing to go stale.
 */

/** Fixed reading order; also the ScrollTrigger start-label set (CLAUDE.md). */
export const SCENE_LABELS = [
  "cover",
  "projects",
  "experience",
  "about",
  "backcover",
] as const;
export type SceneLabel = (typeof SCENE_LABELS)[number];

export interface SceneDef {
  label: SceneLabel;
  /**
   * Scroll distance this scene's scrub owns, in vh — its pin duration.
   * Includes the outbound transition to the next page (the transition is the
   * tail of the earlier scene's scrub). 0 = a resting page with no scrub
   * (the back cover).
   */
  lengthVh: number;
  /** The page component. Pass a `lazy()` component to code-split the scene. */
  Component: ComponentType;
}

interface Book {
  scenes: readonly SceneDef[];
  /** Cumulative scroll offset of each scene's start, in vh. */
  startsVh: number[];
  /** Wrapper height: total scrub distance + the final resting viewport. */
  totalVh: number;
}

/**
 * How far before a scene's start it becomes the *active* (interaction-owning)
 * scene, in vh. By design, the tail of every scene is transition territory —
 * furniture gone, gutter caption, next page assembling (design-doc §5:
 * assembly runs 79–100%) — so nothing interactive lives there, while the
 * incoming page is nearly complete and must be clickable (the back cover's
 * email CTA is the site's conversion moment; it can't wait for the last
 * scrolled pixel).
 */
const ACTIVATION_LEAD_VH = 20;

let book: Book | null = null;
let bookEl: HTMLElement | null = null;

export function buildBook(scenes: readonly SceneDef[]): Book {
  const startsVh: number[] = [];
  let sum = 0;
  for (const scene of scenes) {
    startsVh.push(sum);
    sum += scene.lengthVh;
  }
  return { scenes, startsVh, totalVh: sum + 100 };
}

/** Called by the SceneManager on mount. Returns the unregister function. */
export function registerBook(next: Book, el: HTMLElement): () => void {
  book = next;
  bookEl = el;
  return () => {
    if (book === next) {
      book = null;
      bookEl = null;
    }
  };
}

function vhPx(): number {
  return window.innerHeight / 100;
}

function indexOf(label: SceneLabel): number {
  const i = book?.scenes.findIndex((s) => s.label === label) ?? -1;
  if (i < 0) throw new Error(`[book] scene "${label}" is not registered`);
  return i;
}

/** Absolute scroll position (px) where a scene's scrub begins. */
export function sceneStartPx(label: SceneLabel): number {
  if (!book || !bookEl) return 0;
  return bookEl.offsetTop + book.startsVh[indexOf(label)] * vhPx();
}

/** Absolute scroll position (px) where a scene's scrub ends. */
export function sceneEndPx(label: SceneLabel): number {
  if (!book || !bookEl) return 0;
  const i = indexOf(label);
  return (
    bookEl.offsetTop + (book.startsVh[i] + book.scenes[i].lengthVh) * vhPx()
  );
}

/** Which scene owns interaction at this scroll position. */
export function activeIndexAt(scrollY: number): number {
  if (!book || !bookEl) return 0;
  const y = scrollY - bookEl.offsetTop + ACTIVATION_LEAD_VH * vhPx();
  let active = 0;
  for (let i = 1; i < book.startsVh.length; i += 1) {
    if (y >= book.startsVh[i] * vhPx()) active = i;
  }
  return active;
}

/**
 * Chapter navigation (A2): jump straight to a scene's registered start label —
 * instant set + refresh, never an animated scroll-through (CLAUDE.md).
 */
export function jumpToScene(label: SceneLabel): void {
  setScrollInstant(sceneStartPx(label));
  ScrollTrigger.refresh();
}

/* ---- assemble() seam ------------------------------------------------------
   Page scenes register an entrance hook; the outgoing scene's transition
   drives it over its final 79–100% (implementation-plan.md §2.6). The
   registry lives here so a transition timeline can reach the *next* scene's
   entrance without the two scenes knowing about each other. */

const assemblers = new Map<SceneLabel, (progress: number) => void>();

export function registerAssemble(
  label: SceneLabel,
  assemble: (progress: number) => void,
): () => void {
  assemblers.set(label, assemble);
  return () => {
    if (assemblers.get(label) === assemble) assemblers.delete(label);
  };
}

/**
 * Drive a scene's entrance from a transition scrub, 0..1. Safe to call for a
 * scene that hasn't registered (yet) — a scene mounts as the neighbor before
 * its assembly window starts, but a fast flick can outrun a lazy chunk; the
 * scene must render complete-at-rest by default so a missed early tick only
 * skips choreography, never content.
 */
export function driveAssemble(label: SceneLabel, progress: number): void {
  assemblers.get(label)?.(progress);
}
