import Lenis from "lenis";
import { gsap, ScrollTrigger } from "./gsap";

/**
 * The site's single smooth-scroll instance (implementation-plan.md §0).
 *
 * Lenis smooths the wheel; GSAP's ticker drives Lenis; Lenis notifies
 * ScrollTrigger. Every scrub in the issue therefore rides one shared, eased
 * scroll value — the mockups' hand-rolled scroll lerp, replaced by Lenis with
 * the same feel (implementation-plan.md §2.1).
 *
 * Refcounted like `parallax.ts`: any number of components may acquire it and
 * exactly one instance exists. `prefers-reduced-motion` is re-evaluated live —
 * reduced-motion visitors get native scroll (ScrollTrigger listens to native
 * scroll on its own, so scrubs keep working; scenes collapse their motion
 * separately).
 */

let subscribers = 0;
let lenis: Lenis | null = null;
let reducedMotion: MediaQueryList | null = null;

function drive(time: number): void {
  lenis?.raf(time * 1000);
}

function startLenis(): void {
  if (lenis) return;
  lenis = new Lenis({ autoRaf: false });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add(drive);
  // Lenis is the frame source now; GSAP must not skip ticks to "catch up" or
  // scrubs visibly jump after a long frame.
  gsap.ticker.lagSmoothing(0);
}

function stopLenis(): void {
  if (!lenis) return;
  gsap.ticker.remove(drive);
  lenis.destroy();
  lenis = null;
}

function onModeChange(): void {
  if (subscribers === 0) return;
  if (reducedMotion?.matches) stopLenis();
  else startLenis();
}

/** Join the smooth-scroll loop. Returns the matching release function. */
export function acquireSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers += 1;
  if (subscribers === 1) {
    reducedMotion ??= window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotion.addEventListener("change", onModeChange);
    if (!reducedMotion.matches) startLenis();
  }

  let released = false;
  return () => {
    if (released) return;
    released = true;
    subscribers -= 1;
    if (subscribers === 0) {
      reducedMotion?.removeEventListener("change", onModeChange);
      stopLenis();
    }
  };
}

/**
 * Instant scroll set — the only sanctioned programmatic scroll (CLAUDE.md:
 * chapter navigation jumps to scene starts, never an animated scroll-through).
 * Callers follow with `ScrollTrigger.refresh()`; `jumpToScene` in `book.ts`
 * does both.
 */
export function setScrollInstant(y: number): void {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  else window.scrollTo(0, y);
}
