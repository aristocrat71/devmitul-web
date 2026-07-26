import { useEffect } from "react";
import { acquireParallax } from "@/lib/parallax";

/**
 * Joins the site's shared pointer-parallax loop for as long as the component
 * is mounted. Refcounted, so any number of scenes may call it and exactly one
 * rAF loop and one listener exist.
 *
 * The hook returns nothing on purpose: values reach the DOM as the `--px` and
 * `--py` custom properties, which `<Parallax>` reads in CSS. Nothing about
 * this re-renders React.
 *
 * @param enabled pass `false` while a scene is unmounted or off-screen.
 */
export function useParallax(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    return acquireParallax();
  }, [enabled]);
}

export { setParallaxAmount, getParallaxAmount } from "@/lib/parallax";
