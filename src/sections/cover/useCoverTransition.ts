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
    mastheadSlam: q(".cover__masthead-slam"),
    masthead: q(".cover__masthead"),
    credit: q(".cover__credit"),
    tagRow: q(".cover__tag-row"),
    cutoutPop: q(".cover__cutout-pop"),
    github: q(".cover__gbtn--github"),
    githubIcon: q(".cover__gbtn--github svg"),
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
    ...el.pops.map((pop) => pop.el),
  ];
  /* ---- camera anchor (rule 12) ------------------------------------------- */
  // Measured at mount, on font load, on every refresh (resize, orientation),
  // and again at the ownership and dive-commit crossings — NOT per scrub tick:
  // a getBoundingClientRect right after GSAP's style writes forces a reflow
  // every frame (measured: it alone dents the 4×-throttle budget). Parallax is
  // damped to zero well before the dive starts, so the button sits at its
  // rest position when the anchor actually matters.
  const measureOrigin = () => {
    const r = el.github.getBoundingClientRect();
    dive.style.perspectiveOrigin = `${r.left + r.width / 2}px ${r.top + r.height / 2}px`;
  };
  measureOrigin();

  let scrubOwns = false;
  const setOwnership = (on: boolean) => {
    if (on === scrubOwns) return;
    scrubOwns = on;
    if (on) gsap.set(owned, { animation: "none" });
    // Restoring the animations replays the load-in — that's the design: the
    // cover re-assembles with its own choreography on scroll-up.
    else gsap.set(owned, { clearProps: "animation,opacity,transform" });
    measureOrigin();
  };
  // The socials settle ~1.75s into the load-in and web fonts reflow the
  // column; both re-anchor. onRefresh covers resize and orientation.
  let disposed = false;
  document.fonts.ready.then(() => {
    if (!disposed) measureOrigin();
  });

  /* ---- the scrubbed timeline (positions = progress fractions) ------------ */
  // Scrub maps scroll progress onto the timeline's TOTAL duration — if the
  // last tween ended at 0.86, every position here would silently compress by
  // 0.86 and drift from the onUpdate side (this happened; the caption missed
  // its own window). This empty tween pins the duration to exactly 1 so
  // positions read as scroll-progress fractions.
  timeline.set({}, {}, 1);
  // Layer promotion for the transition, profiled at 4× CPU throttle:
  //  - `cover` pins its raster scale for the dive — without it Chrome
  //    re-rasters the whole layer every frame the scale changes (19fps);
  //    slightly soft at extreme z, which reads as motion. The approved
  //    mockup shipped the same hint.
  //  - bg/slab (the viewport-sized gradient surfaces) and the printed-fade
  //    set (the masthead's stacked text-shadows, the cutout's drop-shadow
  //    filter) each need their own pinned layers or they repaint/re-raster
  //    through the dissolve.
  //  - All of it sits at 1% — one layer-upload hiccup while the cover is
  //    still visually at rest, instead of mid-pop at the 6% handoff — and
  //    reverses below that: the resting cover holds no promoted layers, and
  //    unmount releases everything (implementation-plan §0 GPU budget).
  const promoted = [
    cover,
    el.bg,
    el.slab,
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

  // THE DIVE: the whole cover flies past the camera on Z.
  timeline.fromTo(
    cover,
    { z: 0 },
    {
      z: T.dive.z,
      ease: (t: number) => Math.pow(t, T.dive.pow),
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
  timeline.fromTo(
    [el.bg, el.slab],
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
      // Last re-anchor before the camera commits, then the interior flips.
      if (diveCommitted) measureOrigin();
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
  handlers.onRefresh = measureOrigin;

  return () => {
    disposed = true;
    handlers.onUpdate = undefined;
    handlers.onRefresh = undefined;
    setParallaxAmount(1);
    cover.classList.remove("cover--diving");
    el.github.classList.remove("cover__gbtn--dive");
    el.caption.classList.remove("cm-caption--in");
    el.caption.style.opacity = "";
    el.caption.style.transform = "";
    dive.style.perspectiveOrigin = "";
  };
}
