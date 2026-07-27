import { useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { driveAssemble, type SceneLabel } from "@/lib/book";
import { useSceneScrub } from "@/hooks/useSceneScrub";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The interior-boundary transition — the target zoom every page join after the
 * cover reuses (design-doc §5, amended 2026-07-26: the outgoing page holds
 * perfectly still and fades; the dive target scales about its own centre until
 * its ink interior fills the frame).
 *
 * The cover's boundary (`useCoverTransition`) is the original: it owns a whole
 * scene and choreographs a dozen cover-specific elements. The three interior
 * boundaries share one shape — a page already at rest, one target already
 * announcing itself, and only the scene's closing hold to spend — so the
 * mechanism lives here once and each section passes a config: which scene is
 * next, its phase table, what fades early, and which pulse to gate off.
 *
 * The pieces, in scroll order (fractions of the scene's scrub):
 *  - `fade`: the page empties around the target — furniture first, printed
 *    elements after, per the design grammar. The scrub takes `animation: none`
 *    ownership of these elements at the same moment (rule 11): the outro
 *    stamps hold their poses in `forwards` fills, which outrank the fade's
 *    inline opacity. Below the threshold everything is cleared and CSS
 *    re-owns — scroll-up re-performs the stamps, which is the design.
 *  - `zoom`: the target grows about its own centre. The magnification curve
 *    is the approved dive's (perspective 1200, z = pow(f, 1.6) × 1163),
 *    re-expressed onto scale — identical acceleration, nothing anchored.
 *  - `ink`: mid-zoom, the shared `[data-dive-target]::after` flood fades in
 *    (driven through `--cm-dive-ink`), so the target's printed face dissolves
 *    under solid ink exactly like the cover button's octocat, and the zoom
 *    ends on a full frame of ink.
 *  - `worldFade` / `worldOff`: the ink frame dissolves into the gutter
 *    beneath — near-identical darks, so the cut reads as the glow blooming
 *    in — then the whole outgoing layer goes `visibility: hidden`.
 *  - `captionIn` / `captionExit`: the gutter caption glitches in (time-based
 *    tear, the boundary's one glitch moment), holds wide, exits upward.
 *    Driven per tick like the cover's: its resting opacity is 0, which a
 *    scrub-reversed tween from-value would clobber.
 *  - `gutterFade` + `assembleFrom`: the gutter hands the frame to
 *    `driveAssemble(next)` and the next page prints itself in.
 *
 * ZOOM MEASUREMENT (rule 12). The zoom itself needs no anchor — the target is
 * its own fixed point — only "how big is big enough", which needs the
 * target's *rendered* size and position. Those live under ancestor transforms
 * (the parked camera on the mega-pages, the resting stamp angles), so pure
 * layout offsets aren't enough — but reading the target's own rect would
 * measure it through the very transform this measurement drives, the exact
 * refresh-mid-zoom bug rule 12 exists for. The split: rect the target's
 * `offsetParent` (a descendant's transform never reaches an ancestor's rect,
 * and nothing this boundary drives sits above it — the camera above is parked
 * on a constant pose through the whole window), then place the target inside
 * it from layout offsets. Small knowable errors — a stamp's few degrees of
 * rotation inflating the reference rect, the mega-page border's ~6px origin
 * offset — all land on the "zoom slightly deeper than needed" side, and the
 * fill margin absorbs them.
 */
export interface BoundaryTiming {
  /** The page empties around the target; the scrub owns from here (rule 11). */
  readonly fade: { readonly at: number; readonly duration: number };
  /**
   * The target zoom. The approved curve is hyperbolic — the last few percent
   * of the window do most of the magnification — and the cover never plays
   * that tail visibly: its button fades out around 4.5× while the curve blows
   * up behind the fade. Same here: `worldFade` must span the zoom window's
   * last ~30% (cover ratios: ink at 0.38–0.76 of the window, the dissolve
   * from 0.7 to ~1.05, the cut at ~1.08) so the reader sees a 1→5× dive into
   * ink and never the snap.
   */
  readonly zoom: { readonly at: number; readonly duration: number };
  /** The ink flood over the target's face (`--cm-dive-ink` 0 → 1). */
  readonly ink: { readonly at: number; readonly duration: number };
  /** The outgoing layer dissolves into the gutter beneath. */
  readonly worldFade: { readonly at: number; readonly duration: number };
  /** Past this the outgoing layer is gone entirely (visibility, not opacity). */
  readonly worldOff: number;
  /** The caption glitches in here and holds until its exit. */
  readonly captionIn: number;
  readonly captionExit: { readonly at: number; readonly duration: number };
  /** The gutter hands the frame to the assembling page. */
  readonly gutterFade: { readonly at: number; readonly duration: number };
  /** driveAssemble(next) maps this window onto 0..1. */
  readonly assembleFrom: number;
}

export interface BoundaryConfig {
  /** The incoming scene: names the `[data-dive-target]` and the assemble seam. */
  readonly next: SceneLabel;
  readonly timing: BoundaryTiming;
  /**
   * What empties out around the target when the boundary begins. Elements
   * only — the mechanism handles ownership; resolvers live at module level in
   * the section that knows its own class names.
   */
  readonly fade: (root: HTMLElement, target: HTMLElement) => HTMLElement[];
  /**
   * The dive target's announce pulse (an infinite stepped loop on the
   * target's child), gated off while the zoom owns the shot — a ±5% pulse
   * under a 15× magnification reads as the frame shaking. Gated at zoom
   * start, not fade start, so the pulse keeps inviting until the reader
   * actually commits.
   */
  readonly pulse?: (root: HTMLElement, target: HTMLElement) => HTMLElement[];
}

interface BoundaryRefs {
  /** The outgoing scene's own content layer — what fades into the gutter. */
  root: RefObject<HTMLElement | null>;
  /** The `<GutterCaption>` beneath it. */
  gutter: RefObject<HTMLElement | null>;
}

interface BoundaryHandlers {
  onUpdate?: (progress: number) => void;
}

/**
 * The shared fade set for a camera-walk page: everything printed on the
 * mega-page except the dive target's own branch — title box, the other three
 * cells, the target's cell-mates, the folio. The paper itself is not here: it
 * fades with the layer in `worldFade`, carrying the target's last surroundings
 * into the gutter.
 */
export function megaPageFade(
  root: HTMLElement,
  target: HTMLElement,
): HTMLElement[] {
  const page = root.querySelector<HTMLElement>(".cm-megapage");
  if (!page) return [];
  const out: HTMLElement[] = [];
  const title = page.querySelector<HTMLElement>(".cm-title-box");
  if (title) out.push(title);
  for (const cell of page.querySelectorAll<HTMLElement>(".cm-cell")) {
    if (!cell.contains(target)) {
      out.push(cell);
      continue;
    }
    // The target's own cell: fade its other children (the catalogue box, the
    // finale figure), never the branch the target lives in.
    for (const child of cell.children) {
      if (child instanceof HTMLElement && !child.contains(target)) {
        out.push(child);
      }
    }
  }
  const folio = page.querySelector<HTMLElement>(".cm-megapage__folio");
  if (folio) out.push(folio);
  return out;
}

export function useBoundaryZoom(
  refs: BoundaryRefs,
  config: BoundaryConfig,
): void {
  // The trigger is created before the builder runs, so its callbacks reach
  // the builder's closures through this box (the cover transition's pattern:
  // the builder mutates its own locals, which the React Compiler rightly
  // refuses in a render-scope closure, so it lives at module level).
  const handlers = useRef<BoundaryHandlers>({});

  useSceneScrub((timeline) => build(timeline, refs, config, handlers.current), {
    onUpdate: (progress) => handlers.current.onUpdate?.(progress),
  });
}

/** The approved dive's magnification curve, re-expressed onto scale (§2). */
const PERSPECTIVE = 1200;
const DIVE_Z = 1163;
const DIVE_POW = 1.6;
const zoomEase = (t: number) => {
  const z = Math.pow(t, DIVE_POW) * DIVE_Z;
  const magnify = PERSPECTIVE / (PERSPECTIVE - z);
  const peak = PERSPECTIVE / (PERSPECTIVE - DIVE_Z);
  return (magnify - 1) / (peak - 1);
};

/**
 * Covers the measurement's known small errors (reference-rect inflation from
 * a stamp's rotation, the mega-page's border-origin offset) plus the target
 * arriving a few degrees rotated — all in the safe direction: a touch deeper
 * into the ink than strictly needed.
 */
const FILL_MARGIN = 1.25;

function build(
  timeline: gsap.core.Timeline,
  refs: BoundaryRefs,
  config: BoundaryConfig,
  handlers: BoundaryHandlers,
): void | (() => void) {
  const root = refs.root.current;
  const gutter = refs.gutter.current;
  if (!root || !gutter) return;

  const T = config.timing;
  const target = root.querySelector<HTMLElement>(
    `[data-dive-target="${config.next}"]`,
  );
  const caption = gutter.querySelector<HTMLElement>(".cm-caption");
  if (!target) {
    throw new Error(`[boundary] missing [data-dive-target="${config.next}"]`);
  }
  if (!caption) throw new Error("[boundary] gutter has no .cm-caption");

  const fadeEls = config.fade(root, target);
  const pulseEls = config.pulse?.(root, target) ?? [];

  /* ---- how far the target has to grow (rule 12, header note) ------------- */
  const fillScale = () => {
    const ref = target.offsetParent as HTMLElement | null;
    if (!ref || target.offsetWidth === 0) return 30;
    const refRect = ref.getBoundingClientRect();
    const k = ref.offsetWidth > 0 ? refRect.width / ref.offsetWidth : 1;
    // The target's centre in the reference's layout space, then rendered.
    let cx = target.offsetWidth / 2;
    let cy = target.offsetHeight / 2;
    for (
      let node: HTMLElement | null = target;
      node && node !== ref;
      node = node.offsetParent as HTMLElement | null
    ) {
      cx += node.offsetLeft;
      cy += node.offsetTop;
    }
    const x = refRect.left + cx * k;
    const y = refRect.top + cy * k;
    const halfW = (target.offsetWidth / 2) * k;
    const halfH = (target.offsetHeight / 2) * k;
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    return Math.max(dx / halfW, dy / halfH) * FILL_MARGIN;
  };

  /* ---- ownership handoff (rule 11) --------------------------------------- */
  // The fade set includes outro stamps whose poses live in `forwards` fills,
  // which outrank the fade tween's inline opacity. Above the threshold the
  // scrub owns them: animation off — and ONLY animation. The fade tween
  // re-writes inline opacity on every render, so re-stating it here would be
  // redundant at best; at worst it lands after the same tick's timeline
  // render (onUpdate runs second) and a single coarse step — an instant jump,
  // reduced motion's native scroll — parks the elements at the stomped value
  // with no next tick to repair it. Below the threshold everything clears and
  // CSS re-owns — the stamps re-perform on the way back down, by design.
  let scrubOwns = false;
  const setOwnership = (on: boolean) => {
    if (on === scrubOwns) return;
    scrubOwns = on;
    if (on) gsap.set(fadeEls, { animation: "none" });
    else {
      gsap.set(fadeEls, { clearProps: "animation,opacity" });
      // The reversed zoom leaves an identity transform and the flood var
      // behind; below the boundary the target owns nothing inline at all.
      gsap.set(target, { clearProps: "all" });
      gsap.set(root, { clearProps: "opacity" });
    }
  };

  // The announce pulse keeps running through the early fade — it's the page
  // still inviting — and stops the moment the zoom owns the shot.
  let pulseGated = false;
  const setPulseGate = (on: boolean) => {
    if (on === pulseGated || pulseEls.length === 0) return;
    pulseGated = on;
    if (on) gsap.set(pulseEls, { animation: "none" });
    else gsap.set(pulseEls, { clearProps: "animation" });
  };

  /* ---- the scrubbed timeline (positions = progress fractions) ------------ */
  // Pin the total to 1 so positions read as scroll-progress fractions
  // (CLAUDE.md convention — this silently compressed once, in §2).
  timeline.set({}, {}, 1);

  // Layer promotion, boundary-scoped: the zooming target re-rasters per frame
  // without a pinned layer (§2 lesson 3), and the two full-frame dissolves
  // (the outgoing layer, the gutter) each get their own. All of it lands at
  // the boundary's start — the camera is parked and nothing else is moving,
  // so the upload hiccup is invisible — and reverses below it.
  timeline.set(target, { willChange: "transform" }, T.fade.at);
  timeline.set(root, { willChange: "opacity" }, T.zoom.at);
  timeline.set(gutter, { willChange: "opacity" }, T.worldFade.at);

  // The page empties around the target, furniture first (design-doc §5).
  timeline.fromTo(
    fadeEls,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.fade.duration,
      immediateRender: false,
    },
    T.fade.at,
  );

  // THE ZOOM. The page never moves — the target is the one thing that
  // travels, and it is its own fixed point by construction (§2, amended).
  timeline.fromTo(
    target,
    { scale: 1 },
    {
      // Function-based, so `invalidateOnRefresh` re-evaluates it on resize
      // and orientation change rather than holding a stale viewport's number.
      scale: () => fillScale(),
      ease: zoomEase,
      duration: T.zoom.duration,
      immediateRender: false,
    },
    T.zoom.at,
  );

  // The printed face dissolves under the ink flood mid-zoom — the shared
  // `[data-dive-target]::after` reads this variable.
  timeline.fromTo(
    target,
    { "--cm-dive-ink": 0 },
    {
      "--cm-dive-ink": 1,
      ease: "none",
      duration: T.ink.duration,
      immediateRender: false,
    },
    T.ink.at,
  );

  // The outgoing layer prints OUT through the same poses it printed in —
  // the mega-page entrance is opacity 0 → 0.5 → 1 over the void (the shared
  // `[data-assemble]` states), and `steps(2)` walks exactly those values in
  // reverse. A continuous fade here reads as a translucent ghost (a white
  // paper page held at 50% over the void is a grey wash, screenshot-caught);
  // discrete print-pass drops are the book's own exit grammar. The growing
  // ink face rides above it and the cut lands dark-on-dark in the gutter.
  timeline.fromTo(
    root,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "steps(2)",
      duration: T.worldFade.duration,
      immediateRender: false,
    },
    T.worldFade.at,
  );
  timeline.set(root, { visibility: "hidden" }, T.worldOff);

  // The gutter hands the frame to the assembling page. (Its resting opacity
  // is 1, so the reversed from-value is harmless — unlike the caption's,
  // which is why the caption is driven per tick instead.)
  timeline.fromTo(
    gutter,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.gutterFade.duration,
      immediateRender: false,
    },
    T.gutterFade.at,
  );

  /* ---- imperative side, once per scrub tick ------------------------------ */
  let lastAssemble = -1;
  handlers.onUpdate = (p: number) => {
    setOwnership(p > T.fade.at);
    setPulseGate(p > T.zoom.at);
    // Past the zoom's start the outgoing page is scenery, not UI — faded
    // links must not stay hit-testable while this is still the active layer.
    root.classList.toggle("cm-boundary-gone", p > T.zoom.at);

    // Caption: glitch-in (time-based tear via the class), wide hold, then a
    // scrubbed exit upward — the cover's math verbatim.
    const exit = clamp01((p - T.captionExit.at) / T.captionExit.duration);
    caption.classList.toggle("cm-caption--in", p > T.captionIn);
    caption.style.opacity = String((p > T.captionIn ? 1 : 0) * (1 - exit));
    caption.style.transform = exit > 0 ? `translateY(${exit * -40}vh)` : "";

    const assemble = clamp01((p - T.assembleFrom) / (1 - T.assembleFrom));
    if (assemble !== lastAssemble) {
      lastAssemble = assemble;
      driveAssemble(config.next, assemble);
    }
  };

  return () => {
    handlers.onUpdate = undefined;
    root.classList.remove("cm-boundary-gone");
    caption.classList.remove("cm-caption--in");
    caption.style.opacity = "";
    caption.style.transform = "";
    // The imperative sets live outside the GSAP context's revert; clear them
    // by hand so a remounting scene starts from CSS truth.
    if (scrubOwns) gsap.set(fadeEls, { clearProps: "animation,opacity" });
    if (pulseGated) gsap.set(pulseEls, { clearProps: "animation" });
  };
}
