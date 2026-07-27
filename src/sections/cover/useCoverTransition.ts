import { useRef, type RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { driveAssemble } from "@/lib/book";
import { setParallaxAmount } from "@/lib/parallax";
import { useSceneScrub } from "@/hooks/useSceneScrub";
import { COVER_TRANSITION as T } from "./timing";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

interface TransitionRefs {
  /** The perspective camera (`.cm-dive`). */
  dive: RefObject<HTMLDivElement | null>;
  /** The cover root — the element that rides translateZ. */
  cover: RefObject<HTMLDivElement | null>;
  /** The `<GutterCaption>` root beneath the cover. */
  gutter: RefObject<HTMLDivElement | null>;
}

interface TransitionHandlers {
  onUpdate?: (progress: number) => void;
  onRefresh?: () => void;
}

/**
 * §2 — the cover → projects boundary: the perspective dive into the GitHub
 * button, scrubbed over the cover scene's 330vh. A 1:1 port of the approved
 * `transition-mockup.html` v5 timeline onto the engine; phases live in
 * `COVER_TRANSITION`.
 *
 * The pieces, in scroll order:
 *  - ≤6%: the cover's own load-in choreography owns everything untouched.
 *  - 6%: OWNERSHIP HANDOFF (CLAUDE.md rule 11). The entrances use `forwards`
 *    fill, which outranks inline styles — so the scrub sets `animation: none`
 *    on those elements while the timeline re-states their resting poses
 *    inline (the kit keeps poses in keyframe fills, so dropping an animation
 *    without re-stating would snap stamps upright and hide the masthead).
 *    Below 6% everything is cleared and CSS re-owns: the cover re-assembles
 *    with its proper choreography on scroll-up.
 *  - 8–31%: loose furniture pops off, stepped, reverse-print order.
 *  - 30–62%: printed elements fade; the whole cover flies past the camera on
 *    translateZ(pow(f, 1.6) × 1163) toward the GitHub button, whose centre is
 *    the perspective-origin — re-measured while at rest, on every scrub tick
 *    below 32%, on refresh, and on font load. Never load-time-only (rule 12).
 *    The cover also stops taking pointer events here: a faded-out button must
 *    not stay hit-testable (rule 2's failure mode).
 *  - 65–81%: the gutter caption glitches in (time-based tear, by design),
 *    holds wide, exits upward. The caption block is driven imperatively per
 *    tick like the mockup — its resting opacity is 0, which a reversed tween
 *    from-value would clobber.
 *  - 79–100%: the gutter fades and `driveAssemble("projects")` hands the
 *    remaining scroll to the next page's entrance.
 */
export function useCoverTransition(refs: TransitionRefs): void {
  // The trigger is created before the builder runs, so its callbacks reach
  // the builder's closures through this box. (The builder is a module-level
  // function: it runs inside the GSAP effect and mutates its own locals,
  // which the React Compiler rightly refuses in a render-scope closure.)
  const handlers = useRef<TransitionHandlers>({});

  useSceneScrub((timeline) => build(timeline, refs, handlers.current), {
    onUpdate: (progress) => handlers.current.onUpdate?.(progress),
    onRefresh: () => handlers.current.onRefresh?.(),
  });
}

function build(
  timeline: gsap.core.Timeline,
  refs: TransitionRefs,
  handlers: TransitionHandlers,
): void | (() => void) {
  const cover = refs.cover.current;
  const dive = refs.dive.current;
  const gutter = refs.gutter.current;
  if (!cover || !dive || !gutter) return;

  const q = (selector: string): HTMLElement => {
    const found =
      cover.querySelector<HTMLElement>(selector) ??
      gutter.querySelector<HTMLElement>(selector);
    if (!found) throw new Error(`[cover transition] missing ${selector}`);
    return found;
  };

  const el = {
    bg: q(".cm-bg"),
    slab: q(".cm-slab"),
    // The ghosted lettering wall (§4's 2026-07-27 amendment) is page stock,
    // so it dissolves with the stock — see the bgDissolve tween below.
    wall: q(".cover__wall-bg"),
    mastheadSlam: q(".cover__masthead-slam"),
    masthead: q(".cover__masthead"),
    credit: q(".cover__credit"),
    tagRow: q(".cover__tag-row"),
    cutoutPop: q(".cover__cutout-pop"),
    github: q(".cover__gbtn--github"),
    githubIcon: q(".cover__gbtn--github svg"),
    // The <GlitchTick> wrapper around the button. The zoom rides this rather
    // than the button itself, so the button keeps its own transform for the
    // hover lift and the two never overwrite each other (CLAUDE.md rule 10).
    githubZoom: q(".cover__socials .cm-glitch:has(.cover__gbtn--github)"),
    linkedin: q(".cover__gbtn--linkedin"),
    caption: q(".cm-caption"),
    pops: T.pops.map((pop) => ({ ...pop, el: q(pop.selector) })),
  };

  /* ---- ownership handoff (rule 11) -------------------------------------- */
  // Everything here carries a forwards-fill entrance (or, for the masthead
  // h1, the glitch tick that must pause while the scrub drives its parent).
  // The pop/fade tweens only write inline styles — which those fills would
  // override — so ownership is explicit.
  const owned = [
    el.mastheadSlam,
    el.masthead,
    el.credit,
    el.cutoutPop,
    // Its 5s tick would otherwise keep slicing the button while the zoom
    // magnifies it — a 1-frame clip-path across a 30× element is a
    // full-frame tear, which is not what the tick is for.
    el.githubZoom,
    ...el.pops.map((pop) => pop.el),
  ];
  /* ---- how far the button has to grow (rule 12) --------------------------
     The button zooms about its own centre, so the zoom itself needs no
     measurement at all — only "how big is big enough to fill this viewport",
     which is the distance from the button's centre to the furthest corner.

     That distance is taken in LAYOUT space, walked up the offsetParent chain,
     never from `getBoundingClientRect()`. A rect is measured through every
     transform above it — including the zoom's own magnification — so a
     refresh landing mid-zoom would read a button that is already 30× and
     compute nonsense. `offsetLeft`/`offsetTop`/`offsetWidth` are
     transform-immune (the safe measurement class the camera-walk pages
     already use), so the answer is the same whether the zoom has started or
     not, and it can't pick up the pointer parallax either. */
  const fillScale = () => {
    let x = el.github.offsetWidth / 2;
    let y = el.github.offsetHeight / 2;
    const half = Math.max(el.github.offsetWidth, el.github.offsetHeight) / 2;
    for (
      let node: HTMLElement | null = el.github;
      node && node !== dive;
      node = node.offsetParent as HTMLElement | null
    ) {
      x += node.offsetLeft;
      y += node.offsetTop;
    }
    const dx = Math.max(x, window.innerWidth - x);
    const dy = Math.max(y, window.innerHeight - y);
    // Corner distance, so the ink covers the frame whatever the aspect.
    return half > 0 ? (Math.hypot(dx, dy) / half) * 1.04 : 1;
  };

  let scrubOwns = false;
  const setOwnership = (on: boolean) => {
    if (on === scrubOwns) return;
    scrubOwns = on;
    if (on) gsap.set(owned, { animation: "none" });
    // Restoring the animations replays the load-in — that's the design: the
    // cover re-assembles with its own choreography on scroll-up.
    else gsap.set(owned, { clearProps: "animation,opacity,transform" });
  };

  /* ---- the scrubbed timeline (positions = progress fractions) ------------ */
  // Scrub maps scroll progress onto the timeline's TOTAL duration — if the
  // last tween ended at 0.86, every position here would silently compress by
  // 0.86 and drift from the onUpdate side (this happened; the caption missed
  // its own window). This empty tween pins the duration to exactly 1 so
  // positions read as scroll-progress fractions.
  timeline.set({}, {}, 1);
  // Layer promotion for the transition, profiled at 4× CPU throttle:
  //  - the zooming button pins its raster scale — without it Chrome re-rasters
  //    it every frame the scale changes, and by the end it is a frame-filling
  //    surface being re-rastered per tick.
  //  - bg/slab (the viewport-sized gradient surfaces) and the printed-fade
  //    set (the masthead's stacked text-shadows, the cutout's drop-shadow
  //    filter) each need their own pinned layers or they repaint/re-raster
  //    through the dissolve.
  //  - All of it sits at 1% — one layer-upload hiccup while the cover is
  //    still visually at rest, instead of mid-pop at the 6% handoff — and
  //    reverses below that: the resting cover holds no promoted layers, and
  //    unmount releases everything (implementation-plan §0 GPU budget).
  const promoted = [
    el.githubZoom,
    el.bg,
    el.slab,
    // Same argument as bg/slab, and the same lifetime: one viewport-sized
    // surface whose opacity is tweened through the dissolve. Promoted on the
    // wrapper, never on the three rows — backcover.css keeps those unpromoted
    // on purpose (a permanent layer for a 1-frame tick every 5s), and this
    // one is released again below 1% and on unmount.
    el.wall,
    el.mastheadSlam,
    el.credit,
    el.tagRow,
    el.linkedin,
    el.cutoutPop,
  ];
  timeline.set(promoted, { willChange: "transform, opacity" }, 0.01);
  timeline.set(gutter, { willChange: "opacity" }, 0.6);

  // Handoff re-statements: from here to each element's own phase, these sets
  // ARE its style (see the ownership note above).
  timeline.set(el.mastheadSlam, { opacity: 1, scale: 1, y: 0 }, T.handoff);
  timeline.set(el.credit, { opacity: 1, y: 0 }, T.handoff);
  timeline.set(el.cutoutPop, { opacity: 1, y: 0, scale: 1 }, T.handoff);
  for (const pop of el.pops) {
    timeline.set(
      pop.el,
      { opacity: 1, rotation: pop.rotate, y: 0, scale: 1 },
      T.handoff,
    );
  }

  // Loose furniture pops off — stepped, staggered, reverse-print order.
  for (const pop of el.pops) {
    timeline.fromTo(
      pop.el,
      { opacity: 1, rotation: pop.rotate, y: 0, scale: 1 },
      {
        opacity: 0,
        rotation: pop.rotate + 6,
        y: () => window.innerHeight * 0.04,
        scale: 1.15,
        ease: "steps(2)",
        duration: T.popWindow,
        immediateRender: false,
      },
      pop.at,
    );
  }

  // Printed elements fade as the dive begins.
  timeline.fromTo(
    [el.mastheadSlam, el.credit, el.tagRow, el.linkedin, el.cutoutPop],
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.printedFade.duration,
      immediateRender: false,
    },
    T.printedFade.at,
  );

  // THE ZOOM. The cover itself never moves — not a pixel — it only fades. The
  // GitHub button is the one thing that travels: it grows about its own
  // centre until its ink interior fills the frame, so the icon is the fixed
  // point of the shot by construction and everything else simply prints out.
  //
  // (Design-doc §5 specified this as a perspective dive with the WHOLE cover
  // riding translateZ toward the button. Anchored correctly that still slides
  // every part of the cover outward from the anchor — the top edge alone
  // travelled 3300px by 62% — which read as the page dropping away rather
  // than as a zoom. Amended 2026-07-26 on Mitul's call: fade only, zoom the
  // icon. It also removes a whole class of bug, because nothing is anchored
  // any more: rule 12 prefers mechanics that need no measurement at all.)
  //
  // The curve is the approved one, re-expressed. The dive's magnification was
  // perspective 1200 with z = pow(f, 1.6) × 1163; here that same magnification
  // curve is normalised onto the scale tween, so the acceleration a reader
  // sees is unchanged — only what moves is different.
  const PERSPECTIVE = 1200;
  const zoomEase = (t: number) => {
    const z = Math.pow(t, T.dive.pow) * T.dive.z;
    const magnify = PERSPECTIVE / (PERSPECTIVE - z);
    const peak = PERSPECTIVE / (PERSPECTIVE - T.dive.z);
    return (magnify - 1) / (peak - 1);
  };
  timeline.fromTo(
    el.githubZoom,
    { scale: 1 },
    {
      // Function-based, so `invalidateOnRefresh` re-evaluates it on resize and
      // orientation change rather than holding a stale viewport's number.
      scale: () => fillScale(),
      ease: zoomEase,
      duration: T.dive.duration,
      immediateRender: false,
    },
    T.dive.at,
  );

  // We fly through the octocat into the ink, then everything dissolves.
  timeline.fromTo(
    el.githubIcon,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.octoFade.duration,
      immediateRender: false,
    },
    T.octoFade.at,
  );
  // The stock dissolves — halftone, speedline slab, and the ghosted lettering
  // wall with them. The wall is in this group and not one of its own because
  // it IS stock: left out, it was the one thing still printed between the
  // dissolve finishing at 58% and `coverOff` at 64.5%, so the ghost type hung
  // alone over the projects page assembling underneath and then snapped out
  // when visibility flipped. Measured at 1440×900: ~150px of scroll where the
  // background read 0 and the wall read 1. Caught on the §4 amendment's
  // verification pass, 2026-07-27.
  timeline.fromTo(
    [el.bg, el.slab, el.wall],
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.bgDissolve.duration,
      immediateRender: false,
    },
    T.bgDissolve.at,
  );
  timeline.fromTo(
    el.github,
    { opacity: 1 },
    {
      opacity: 0,
      ease: "none",
      duration: T.buttonFade.duration,
      immediateRender: false,
    },
    T.buttonFade.at,
  );
  timeline.set(cover, { visibility: "hidden" }, T.coverOff);

  // The gutter hands the frame to the assembling page beneath. (Its resting
  // opacity is 1, so the reversed from-value is harmless — unlike the
  // caption's, which is why the caption is driven per tick instead.)
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
  let diveCommitted = false;
  handlers.onUpdate = (p: number) => {
    setOwnership(p > T.handoff);
    setParallaxAmount(p > T.parallaxOff ? 0 : 1);
    // Past the fade the cover's buttons are invisible; they must not stay
    // hit-testable while the layer is still the active scene.
    cover.classList.toggle("cover--diving", p > T.printedFade.at);
    if (p > T.diveSolid !== diveCommitted) {
      diveCommitted = p > T.diveSolid;
      // The button's interior goes solid ink, so the zoom has ink to fill with.
      el.github.classList.toggle("cover__gbtn--dive", diveCommitted);
    }

    // Caption: glitch-in past 65% (time-based tear via the class), wide
    // hold, then a scrubbed exit upward — mockup-identical math.
    const exit = clamp01((p - T.captionExit.at) / T.captionExit.duration);
    el.caption.classList.toggle("cm-caption--in", p > T.captionIn);
    el.caption.style.opacity = String((p > T.captionIn ? 1 : 0) * (1 - exit));
    el.caption.style.transform =
      exit > 0 ? `translateY(${exit * -40}vh)` : "";

    const assemble = clamp01((p - T.assembleFrom) / (1 - T.assembleFrom));
    if (assemble !== lastAssemble) {
      lastAssemble = assemble;
      driveAssemble("projects", assemble);
    }
  };

  return () => {
    handlers.onUpdate = undefined;
    handlers.onRefresh = undefined;
    setParallaxAmount(1);
    cover.classList.remove("cover--diving");
    el.github.classList.remove("cover__gbtn--dive");
    el.caption.classList.remove("cm-caption--in");
    el.caption.style.opacity = "";
    el.caption.style.transform = "";
  };
}
