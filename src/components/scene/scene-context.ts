import { createContext, useContext } from "react";
import type { SceneLabel } from "@/lib/book";

/**
 * What a page knows about itself. Deliberately tiny: scroll positions are
 * looked up live from `book.ts` by label (they change with the viewport),
 * so nothing here can go stale.
 */
export interface SceneHandle {
  label: SceneLabel;
  /** Position in the reading order, 0-based. */
  index: number;
  /** This scene's scrub distance in vh; 0 means no scrub (back cover). */
  lengthVh: number;
}

export const SceneContext = createContext<SceneHandle | null>(null);

export function useScene(): SceneHandle {
  const scene = useContext(SceneContext);
  if (!scene) {
    throw new Error("useScene() only works inside a <SceneManager> scene");
  }
  return scene;
}
