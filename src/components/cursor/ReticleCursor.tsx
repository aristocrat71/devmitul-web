import { useEffect, useRef, useState } from "react";

/**
 * The interactive set the reticle locks onto (design-doc §10/A3). Anything
 * decorative is `pointer-events: none` (CLAUDE.md rule 2), so it never
 * receives the `mouseover` in the first place — the hit test does most of the
 * filtering for free. `.cm-cursor-target` is the opt-in for things that are
 * interactive without being a button, such as A1's cutout silhouette path.
 */
const TARGETS =
  'a[href], button:not(:disabled), [role="button"], .cm-cursor-target';

/** Pointer follow, per frame. Snappier than the parallax's 0.08 — this one is
 *  a cursor, and lag on a cursor reads as broken rather than as weight. */
const EASE = 0.32;
/** Below this the lerp has visually arrived: snap and park the loop. */
const SETTLED = 0.4;
/** How far outside the target's box the brackets sit, in px. */
const BLEED = 5;
/** Long enough for a target's own hover transition (80ms, stepped) to land. */
const HOVER_SETTLE_MS = 130;
/** Quiet time after the last scroll tick before the reticle looks again. */
const SCROLL_IDLE_MS = 140;

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Lock-on reticle cursor (design-doc §10/A3).
 *
 * Re-skinned from ReactBits' Target Cursor, which arrives as a white ring that
 * spins forever and glides its corners onto a target with `power3.out`. Three
 * things changed, and they are the whole re-skin:
 *
 * 1. **The spin is gone.** Nothing on this site moves continuously except
 *    cameras (CLAUDE.md conventions) — a perpetually rotating cursor is the
 *    single most conspicuous violation of that rule the site could ship. The
 *    arrow's 2s glitch tick is the one exception, and it is the same idiom as
 *    `<GlitchTick>`: a signal that drops for ~150ms and is otherwise still.
 * 2. **The snap is stepped.** `steps(2)` on the brackets is the "touch
 *    stabilizes the signal" beat the design asks for: two discrete poses, not
 *    a glide.
 * 3. **It measures once per lock, not once per frame.** The base component
 *    keeps four GSAP tweens and a ticker alive re-deriving corner positions
 *    from the cursor's own coordinates. Here the brackets are a box of their
 *    own, so a lock is four custom-property writes and the browser does the
 *    rest on the compositor; the only rAF running is the one easing the arrow,
 *    and it parks the moment the pointer stops.
 *
 * Desktop `pointer: fine` only, off under `prefers-reduced-motion`, and both
 * conditions are re-evaluated live so plugging in a mouse or flipping the OS
 * setting takes effect without a reload (the same contract as `lib/parallax`).
 */
export function ReticleCursor() {
  const [enabled, setEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Live gate. Kept separate from the loop effect so flipping either media
  // query tears the whole thing down rather than leaving a stale listener.
  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(fine.matches && !reduced.matches);
    sync();
    fine.addEventListener("change", sync);
    reduced.addEventListener("change", sync);
    return () => {
      fine.removeEventListener("change", sync);
      reduced.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!enabled || !root) return;

    // The native cursor goes away only while the reticle is actually up, and
    // it comes back on cleanup — a site that hides the pointer and then fails
    // to draw one is unusable.
    document.documentElement.classList.add("cm-reticle-on");

    /** Where the pointer is, and where the eased arrow has got to. */
    let px = 0;
    let py = 0;
    let cx = 0;
    let cy = 0;
    let frame = 0;
    /** Last values pushed to CSS, so an unchanged frame costs nothing. */
    let wroteX = Number.NaN;
    let wroteY = Number.NaN;

    let locked: Element | null = null;
    /** The box currently written to CSS, so a release knows where to implode. */
    let held: Box | null = null;
    let settle = 0;
    let idle = 0;
    /**
     * Whether the pointer has been seen yet. A plain boolean, not the
     * `data-live` attribute it mirrors: `dataset.live` is the empty string
     * when present, so reading it as a flag is always false.
     */
    let live = false;

    const setBox = ({ x, y, w, h }: Box) => {
      root.style.setProperty("--rt-bx", `${x}px`);
      root.style.setProperty("--rt-by", `${y}px`);
      root.style.setProperty("--rt-bw", `${w}px`);
      root.style.setProperty("--rt-bh", `${h}px`);
    };

    const measure = (target: Element) => {
      // A rect, not `offsetLeft` — deliberately. CLAUDE.md rule 12 bans rects
      // for anchors that sit *under* the transform they drive; this is the
      // opposite case. The reticle needs the target's on-screen box, camera
      // zoom and all, and it drives nothing the target can see.
      const r = target.getBoundingClientRect();
      held = {
        x: r.left - BLEED,
        y: r.top - BLEED,
        w: r.width + BLEED * 2,
        h: r.height + BLEED * 2,
      };
      setBox(held);
    };

    const lock = (target: Element) => {
      if (locked === target) return;
      locked = target;
      measure(target);
      root.dataset.lock = "";
      // Most targets on this site lift 2px on hover, and that lift starts on
      // the same event that starts the lock — so the first measurement is of
      // where the element *was*. Take a second one once the lift has landed.
      clearTimeout(settle);
      settle = window.setTimeout(() => {
        if (locked === target && target.isConnected) measure(target);
      }, HOVER_SETTLE_MS);
    };

    const release = () => {
      if (!locked) return;
      locked = null;
      clearTimeout(settle);
      delete root.dataset.lock;
      if (!held) return;
      // Implode into the middle of the box we were holding. Not the pointer:
      // the browser fires `mouseout` *before* the `mousemove` that caused it,
      // so `px`/`py` here are still the old position anyway — and the target's
      // own centre is both deterministic and the better read, the brackets
      // folding shut on the thing you just left rather than flying after you.
      setBox({ x: held.x + held.w / 2, y: held.y + held.h / 2, w: 0, h: 0 });
      held = null;
    };

    /**
     * Look again at wherever the pointer is sitting. Needed because the two
     * events that would normally start a lock — `mouseover` and a move onto a
     * new element — don't fire when the page moves underneath a stationary
     * pointer, which is most of this site.
     */
    const reacquire = () => {
      if (locked || !live) return;
      const under = document.elementFromPoint(px, py)?.closest(TARGETS);
      if (under) lock(under);
    };

    const tick = () => {
      frame = 0;
      cx += (px - cx) * EASE;
      cy += (py - cy) * EASE;
      const restX = Math.abs(px - cx) < SETTLED;
      const restY = Math.abs(py - cy) < SETTLED;
      if (restX) cx = px;
      if (restY) cy = py;

      const qx = Math.round(cx * 10) / 10;
      const qy = Math.round(cy * 10) / 10;
      if (qx !== wroteX) {
        wroteX = qx;
        root.style.setProperty("--rt-x", `${qx}px`);
      }
      if (qy !== wroteY) {
        wroteY = qy;
        root.style.setProperty("--rt-y", `${qy}px`);
      }

      if (!restX || !restY) frame = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      px = event.clientX;
      py = event.clientY;
      if (!live) {
        // First sighting: put the arrow where the pointer already is instead of
        // flying it in from the top-left corner. The box is only parked here
        // if nothing is locked — the browser fires `mouseover` *before* the
        // `mousemove` that caused it, so a pointer whose very first move lands
        // on a button has already locked by the time we get here, and
        // resetting the box would erase that lock's measurement.
        cx = px;
        cy = py;
        if (!locked) setBox({ x: px, y: py, w: 0, h: 0 });
        live = true;
        root.dataset.live = "";
      }
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onOver = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest(TARGETS);
      if (target) lock(target);
      else if (locked && !locked.contains(event.target as Node)) release();
    };

    const onOut = (event: MouseEvent) => {
      if (!locked) return;
      const to = event.relatedTarget as Node | null;
      if (to && locked.contains(to)) return;
      release();
    };

    // The page is one long scrub: while it moves, every target moves with a
    // camera under it. Holding a lock through that would drag the brackets
    // across the screen every frame, so the signal simply destabilizes — which
    // is the fiction anyway — and re-acquires once the page is still again.
    // The idle timer is what makes that automatic: the reader's hand is
    // usually on the wheel, not the mouse, so waiting for a pointer move would
    // leave the reticle unlocked over a button it is sitting right on top of.
    const onScroll = () => {
      release();
      clearTimeout(idle);
      idle = window.setTimeout(reacquire, SCROLL_IDLE_MS);
    };

    const onResize = () => {
      release();
      clearTimeout(idle);
      idle = window.setTimeout(reacquire, SCROLL_IDLE_MS);
    };

    // Pointer left the window entirely: take the reticle down with it.
    const onDocLeave = () => {
      release();
      clearTimeout(idle);
      live = false;
      delete root.dataset.live;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mouseout", onOut, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("mouseleave", onDocLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mouseout", onOut);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mouseleave", onDocLeave);
      if (frame) cancelAnimationFrame(frame);
      clearTimeout(settle);
      clearTimeout(idle);
      document.documentElement.classList.remove("cm-reticle-on");
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="cm-reticle" ref={rootRef} aria-hidden="true">
      {/* Tip at (2,2) in the viewBox, which reticle.css pulls back onto the
          pointer's own coordinate with a negative margin — a cursor whose
          hotspot is its centre points at the wrong thing. */}
      <svg className="cm-reticle__arrow" viewBox="0 0 24 32">
        <path d="M2 2 L2 25.2 L7.6 19.8 L11.3 28.7 L15.5 26.9 L11.7 18.2 L19.6 17.7 Z" />
      </svg>
      <span className="cm-reticle__box">
        <span className="cm-reticle__corner cm-reticle__corner--tl" />
        <span className="cm-reticle__corner cm-reticle__corner--tr" />
        <span className="cm-reticle__corner cm-reticle__corner--br" />
        <span className="cm-reticle__corner cm-reticle__corner--bl" />
      </span>
    </div>
  );
}
