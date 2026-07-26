/**
 * The site's single pointer-parallax loop.
 *
 * One rAF loop for the whole issue, refcounted by subscribers, writing exactly
 * two custom properties (`--px`, `--py`) on <html>. Components read those vars
 * through the `.cm-parallax` class and never re-render — per-frame React work
 * is what this module exists to avoid (implementation-plan.md §0, performance).
 *
 * Desktop pointers only, and off entirely under `prefers-reduced-motion`. Both
 * conditions are re-evaluated live, so plugging in a mouse or flipping the OS
 * motion setting takes effect without a reload.
 */

const EASE = 0.08;
/** Below this, the lerp has visually arrived — snap and park the loop. */
const SETTLED = 0.001;
/** Written values are quantized to this many decimals to skip no-op writes. */
const PRECISION = 1000;

let subscribers = 0;
let frame = 0;
let bound = false;

/** Where the pointer says we should be, in -1..1 per axis. */
let targetX = 0;
let targetY = 0;
/** Where the eased value actually is. */
let currentX = 0;
let currentY = 0;
/** Last values pushed to CSS, so an unchanged frame costs nothing. */
let writtenX = Number.NaN;
let writtenY = Number.NaN;

/**
 * Global 0..1 damper. The transition system pulls this to 0 once a scrub owns
 * the frame so idle parallax never fights a dive (implementation-plan.md §2.7).
 */
let amount = 1;

let finePointer: MediaQueryList | null = null;
let reducedMotion: MediaQueryList | null = null;

function enabled(): boolean {
  return !!finePointer?.matches && !reducedMotion?.matches;
}

function write(x: number, y: number): void {
  const qx = Math.round(x * PRECISION) / PRECISION;
  const qy = Math.round(y * PRECISION) / PRECISION;
  const root = document.documentElement;
  if (qx !== writtenX) {
    writtenX = qx;
    root.style.setProperty("--px", String(qx));
  }
  if (qy !== writtenY) {
    writtenY = qy;
    root.style.setProperty("--py", String(qy));
  }
}

function tick(): void {
  frame = 0;
  const goalX = targetX * amount;
  const goalY = targetY * amount;

  currentX += (goalX - currentX) * EASE;
  currentY += (goalY - currentY) * EASE;

  const restingX = Math.abs(goalX - currentX) < SETTLED;
  const restingY = Math.abs(goalY - currentY) < SETTLED;
  if (restingX) currentX = goalX;
  if (restingY) currentY = goalY;

  write(currentX, currentY);

  // Park the loop the moment it has nothing left to move.
  if (!restingX || !restingY) frame = requestAnimationFrame(tick);
}

function schedule(): void {
  if (!frame) frame = requestAnimationFrame(tick);
}

function onMouseMove(event: MouseEvent): void {
  if (!enabled()) return;
  targetX = (event.clientX / window.innerWidth - 0.5) * 2;
  targetY = (event.clientY / window.innerHeight - 0.5) * 2;
  schedule();
}

/** Ease back to centre and stop tracking — used when the mode flips off. */
function recentre(): void {
  targetX = 0;
  targetY = 0;
  schedule();
}

function onModeChange(): void {
  if (!enabled()) recentre();
}

function bind(): void {
  if (bound) return;
  bound = true;
  finePointer ??= window.matchMedia("(pointer: fine)");
  reducedMotion ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  finePointer.addEventListener("change", onModeChange);
  reducedMotion.addEventListener("change", onModeChange);
}

function unbind(): void {
  if (!bound) return;
  bound = false;
  window.removeEventListener("mousemove", onMouseMove);
  finePointer?.removeEventListener("change", onModeChange);
  reducedMotion?.removeEventListener("change", onModeChange);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
  targetX = targetY = currentX = currentY = 0;
  write(0, 0);
}

/** Start (or join) the loop. Returns the matching release function. */
export function acquireParallax(): () => void {
  if (typeof window === "undefined") return () => {};
  subscribers += 1;
  if (subscribers === 1) bind();

  let released = false;
  return () => {
    if (released) return;
    released = true;
    subscribers -= 1;
    if (subscribers === 0) unbind();
  };
}

/**
 * Scale the whole effect, 0..1. Imperative on purpose: GSAP drives this from a
 * scrub every frame, and a React state update per frame is exactly the cost
 * this module is built to avoid.
 */
export function setParallaxAmount(next: number): void {
  const clamped = next < 0 ? 0 : next > 1 ? 1 : next;
  if (clamped === amount) return;
  amount = clamped;
  schedule();
}

export function getParallaxAmount(): number {
  return amount;
}
