import { useRef, type ReactNode, type RefObject } from "react";
import { MegaPage } from "@/components/comic";
import { useSceneScrub } from "@/hooks/useSceneScrub";

/**
 * The camera-walk engine (implementation-plan §3/§5): one big comic page on
 * the void, read panel by panel by a camera that scroll scrubs. THE GOOD PART
 * and ORIGIN STORY are both configurations of this component — two hand-rolled
 * copies of the camera would be a bug farm, so everything the pages share
 * lives here and only the walk table and the cell contents come from outside.
 *
 * The engine's side of the page contract (`<MegaPage>`/`<MegaCell>` own the
 * markup side):
 *  - Camera stops are the cells carrying `data-cell`, walked in stop order.
 *    A cell without it (the furniture cell) is never a camera stop.
 *  - The page element's `transform` is the camera's ALONE (CLAUDE.md rule 10
 *    and conventions) — assembly fades the page, cells scale themselves; if
 *    anything else ever writes this transform, one of them silently wins.
 *  - Arrival toggles `cm-cell--on` on the focused cell; leaving removes it
 *    (scroll-up re-performs, like the mockup). Past `outroAt` the page gets
 *    `cm-megapage--outro`. Both are pure CSS gates: the page decides what
 *    performing looks like, the engine only decides when.
 *  - PULL-BACK RULE (design-doc §8, global): past the last focus window
 *    every cell performs — a zoom-out must never show unperformed panels.
 *    (Both current walks cut their pull-back on 2026-07-28 and end parked on
 *    the last stop; the gate still runs so reverse entry from the next scene
 *    lands on a fully-performed page.)
 *  - Reduced motion parks the camera on the fit-page pose with everything
 *    performed: the complete static page, no walk (design-doc §6 acceptance).
 *
 * Keyframes are measured from untransformed layout offsets — offsetLeft/
 * offsetTop, the safe measurement class — and re-measured on every
 * ScrollTrigger.refresh() (resize, orientation) and on font load, never
 * load-time-only (CLAUDE.md rule 12). The fit pose needs no measurement in
 * practice (the page is vw/vh-sized, so the ratio is a constant), but it is
 * computed from the same offsets so a future page shape can't break it.
 *
 * The camera is a pure function of scroll progress, applied imperatively per
 * tick — not a chain of scrubbed tweens. It's the approved mockup's own math
 * ported verbatim (Lenis replaces the mockup's hand-rolled scroll lerp,
 * implementation-plan §2.1), it makes reversibility trivial, and it leaves no
 * tween from-values to clobber resting states (§2's lesson). Holds write
 * nothing: every style write is change-tracked, and nothing allocates per
 * tick. Pans use cubic ease-in-out — THE camera exception to the stepped
 * motion language (design-doc §6).
 */

/** A point on the page the camera centres, and the scale it reads it at. */
interface CameraPose {
  x: number;
  y: number;
  s: number;
}

/** One window of the walk: hold a keyframe (from === to) or pan between two. */
export interface CameraSegment {
  /** Progress window over the scene's scrub, 0..1. Must not be empty. */
  readonly a: number;
  readonly b: number;
  /** Keyframe indices: the camera stops in order, then the fit-page pose. */
  readonly from: number;
  readonly to: number;
}

/**
 * A page's walk table — the section's constants module owns the numbers,
 * mirroring its design-doc choreography table (CLAUDE.md conventions).
 */
export interface CameraWalk {
  /** The focused cell's share of the viewport (approved: 0.60 × 0.72). */
  readonly focus: { readonly w: number; readonly h: number };
  /** Fit-page margin — void visible all around (approved: 0.92). */
  readonly fitMargin: number;
  /** The reading path: holds and pans covering the scene's 0..1. */
  readonly segments: readonly CameraSegment[];
  /**
   * Focus windows: stop i performs while progress < focusUntil[i]; past the
   * last window every cell performs (the pull-back rule).
   */
  readonly focusUntil: readonly number[];
  /** Past this progress the page carries `cm-megapage--outro`. */
  readonly outroAt: number;
}

/**
 * Promote the page's layer once the reader starts scrubbing, while the camera
 * is still parked — crossing the promotion mid-pan costs a visible GPU-upload
 * hiccup, at rest it's invisible (§2, profiled). One promoted camera layer
 * per camera-walk scene is the GPU budget (implementation-plan §0); it
 * releases below this progress and on unmount. CSS must never promote the
 * page — a 104vw × 138vh surface is exactly what the budget forbids pinning
 * permanently.
 */
const PROMOTE_AT = 0.01;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** The mockup's own pan ease (cubic in-out) — the camera exception. */
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

interface CameraHandlers {
  onUpdate?: (progress: number) => void;
  onRefresh?: () => void;
}

export function CameraWalkScene({
  walk,
  folio,
  className,
  pageClassName,
  pageRef,
  rootRef,
  children,
}: {
  walk: CameraWalk;
  /** Folio stamp for the page's corner, passed through to `<MegaPage>`. */
  folio: string;
  /** The scene's backdrop element — sections style their own void here. */
  className?: string;
  pageClassName?: string;
  /**
   * The section's handle on the page element, for the seams that stay
   * page-owned (entrance assembly registration). The camera and the section
   * share the element; they must never share a property on it.
   */
  pageRef?: RefObject<HTMLDivElement | null>;
  /**
   * The section's handle on the walk's wrapper — the void-backed layer its
   * outbound boundary fades into the gutter (`useBoundaryZoom`). Same sharing
   * contract as `pageRef`: the boundary owns the wrapper's opacity and
   * visibility, the engine owns nothing on it.
   */
  rootRef?: RefObject<HTMLDivElement | null>;
  children: ReactNode;
}) {
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const setPage = (el: HTMLDivElement | null) => {
    cameraRef.current = el;
    if (pageRef) pageRef.current = el;
  };

  useCameraWalk(cameraRef, walk);

  return (
    <div className={className} ref={rootRef}>
      <MegaPage ref={setPage} className={pageClassName} folio={folio}>
        {children}
      </MegaPage>
    </div>
  );
}

function useCameraWalk(
  pageRef: RefObject<HTMLDivElement | null>,
  walk: CameraWalk,
): void {
  // The trigger exists before the builder runs; its callbacks reach the
  // builder's closures through this box (same constraint as §2's transition:
  // the builder mutates its own locals, which the React Compiler rightly
  // refuses in a render-scope closure, so it lives at module level).
  const handlers = useRef<CameraHandlers>({});

  useSceneScrub(
    (timeline) => buildCamera(timeline, pageRef.current, walk, handlers.current),
    {
      onUpdate: (progress) => handlers.current.onUpdate?.(progress),
      onRefresh: () => handlers.current.onRefresh?.(),
    },
  );
}

function buildCamera(
  timeline: gsap.core.Timeline,
  page: HTMLElement | null,
  walk: CameraWalk,
  handlers: CameraHandlers,
): void | (() => void) {
  if (!page) return;

  // The timeline carries no tweens — the camera is applied imperatively — but
  // the scrub still maps scroll onto its duration, so pin it (convention).
  timeline.set({}, {}, 1);

  const cells = [...page.querySelectorAll<HTMLElement>(".cm-cell")];
  const stops = cells
    .filter((cell) => cell.dataset.cell !== undefined)
    .sort((a, b) => Number(a.dataset.cell) - Number(b.dataset.cell));

  /* ---- keyframes (rule 12: measured, never load-time-only) --------------- */
  // Viewport dims are cached at measure time rather than read per tick;
  // resize reaches here through ScrollTrigger.refresh(), so they can't go
  // stale. K is the stops in order plus the fit-page pose the walk table's
  // indices point into.
  let viewW = 0;
  let viewH = 0;
  const K: CameraPose[] = [];

  const measure = () => {
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    K.length = 0;
    for (const stop of stops) {
      K.push({
        x: stop.offsetLeft + stop.offsetWidth / 2,
        y: stop.offsetTop + stop.offsetHeight / 2,
        s: Math.min(
          (walk.focus.w * viewW) / stop.offsetWidth,
          (walk.focus.h * viewH) / stop.offsetHeight,
        ),
      });
    }
    K.push({
      x: page.offsetWidth / 2,
      y: page.offsetHeight / 2,
      s: Math.min(viewW / page.offsetWidth, viewH / page.offsetHeight) *
        walk.fitMargin,
    });
    lastTransform = "";
  };

  /* ---- the camera as a pure function of progress ------------------------- */
  // One scratch pose, mutated in place — no allocation inside the tick path
  // (implementation-plan §0, leak hygiene).
  const cam: CameraPose = { x: 0, y: 0, s: 1 };
  const camAt = (p: number): CameraPose => {
    const segments = walk.segments;
    let seg = segments[segments.length - 1];
    for (let i = 0; i < segments.length; i += 1) {
      if (p >= segments[i].a && p <= segments[i].b) {
        seg = segments[i];
        break;
      }
    }
    const span = seg.b - seg.a;
    const t = span > 0 ? easeInOutCubic(clamp01((p - seg.a) / span)) : 1;
    const from = K[seg.from];
    const to = K[seg.to];
    cam.x = from.x + (to.x - from.x) * t;
    cam.y = from.y + (to.y - from.y) * t;
    cam.s = from.s + (to.s - from.s) * t;
    return cam;
  };

  const focusIndexAt = (p: number): number => {
    for (let i = 0; i < walk.focusUntil.length; i += 1) {
      if (p < walk.focusUntil[i]) return i;
    }
    return -1;
  };

  /* ---- change-tracked writers -------------------------------------------
     Holds are most of the walk; nothing below touches the DOM unless its
     value actually crossed. */
  let lastTransform = "";
  const writeCamera = (pose: CameraPose) => {
    const tx = viewW / 2 - pose.x * pose.s;
    const ty = viewH / 2 - pose.y * pose.s;
    const transform = `translate(${tx}px, ${ty}px) scale(${pose.s})`;
    if (transform === lastTransform) return;
    lastTransform = transform;
    page.style.transform = transform;
  };

  let promoted: boolean | null = null;
  const setPromoted = (on: boolean) => {
    if (on === promoted) return;
    promoted = on;
    page.style.willChange = on ? "transform" : "";
  };

  let outro: boolean | null = null;
  const setOutro = (on: boolean) => {
    if (on === outro) return;
    outro = on;
    page.classList.toggle("cm-megapage--outro", on);
  };

  // -1 = past the last focus window: everything performs (§8's global rule).
  let focusIdx: number | null = null;
  const setFocus = (idx: number) => {
    if (idx === focusIdx) return;
    focusIdx = idx;
    const focused = idx >= 0 ? stops[idx] : null;
    for (const cell of cells) {
      cell.classList.toggle("cm-cell--on", idx === -1 || cell === focused);
    }
  };

  const apply = (p: number) => {
    writeCamera(camAt(p));
    setPromoted(p > PROMOTE_AT);
    setFocus(focusIndexAt(p));
    setOutro(p > walk.outroAt);
  };

  /** Reduced motion: the complete static page — fit pose, all performed. */
  const park = () => {
    writeCamera(K[K.length - 1]);
    setPromoted(false);
    setFocus(-1);
    setOutro(true);
  };

  /* ---- wiring ------------------------------------------------------------ */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const trigger = timeline.scrollTrigger;
  let lastP = 0;
  const sync = () => {
    // Pull, don't trust the last push: a scene can mount with the reader
    // already past it (as the active scene's prev neighbor) and no scroll
    // event will ever deliver that progress.
    lastP = trigger?.progress ?? lastP;
    if (reduced.matches) park();
    else apply(lastP);
  };

  // The scene mounts as its neighbor's understudy (active ± 1): the page must
  // already sit on-camera when the previous boundary's dive reveals it, so
  // the first application can't wait for a scroll event.
  measure();
  sync();

  handlers.onUpdate = (p) => {
    lastP = p;
    if (!reduced.matches) apply(p);
  };
  handlers.onRefresh = () => {
    measure();
    sync();
  };
  // Live, like the rest of the engine (smooth-scroll, parallax): flipping the
  // OS setting mid-read parks or resumes without a reload.
  reduced.addEventListener("change", sync);
  // Cell geometry is vw/vh-sized today, but the convention is re-measure on
  // font load, and a future cell layout may earn it.
  let disposed = false;
  document.fonts.ready.then(() => {
    if (disposed) return;
    measure();
    sync();
  });

  return () => {
    disposed = true;
    handlers.onUpdate = undefined;
    handlers.onRefresh = undefined;
    reduced.removeEventListener("change", sync);
    page.style.transform = "";
    page.style.willChange = "";
    page.classList.remove("cm-megapage--outro");
    for (const cell of cells) cell.classList.remove("cm-cell--on");
  };
}
