import { useRef, type RefObject } from "react";
import { useSceneScrub } from "@/hooks/useSceneScrub";
import { CASES_LEAF as L } from "./timing";

/**
 * The leaf-through docket (design-doc §7): three case folders stacked on the
 * void, fanned so all three tabs show, and scroll leafs the top one away to
 * reveal the next. Reverse-chronological — CASE 003 → 002 → 001.
 *
 * Written as a pure function of progress applied imperatively per tick, not a
 * chain of scrubbed tweens: the toss is quantized to three discrete poses, so
 * tweening it would be wrong by construction, and it makes reversibility free
 * while leaving no tween from-values to clobber the resting stack (the §2
 * lesson; `<CameraWalkScene>` is built the same way). Every write is
 * change-tracked and nothing allocates inside the tick.
 *
 * **This scrub owns each file's `transform` AND `opacity` outright** (CLAUDE.md
 * rule 10) — it writes them inline every tick, so nothing else can have them:
 * no hover lift on a file, and the page's entrance stamps the *stack*, not the
 * files (see `CASES_ASSEMBLE`).
 *
 * Reduced motion keeps the leafing but removes the motion: one step instead of
 * three and no travel, so a file swaps for the next at the threshold. The
 * alternative — parking the stack — would bury two of the three files under an
 * opaque third with no way to reach them, and this page's content is only
 * reachable *through* the leaf. The stepped choreography inside each file
 * (status stamp, evidence tickets) collapses to its end state through
 * `tokens.css`, so nothing animates and nothing is hidden.
 */

interface LeafHandlers {
  onUpdate?: (progress: number) => void;
}

/** Promote the three big folder layers only while they're actually moving. */
const PROMOTE_AT = 0.01;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** Floor to n discrete poses — the mockup's `quant`. */
const quant = (v: number, n: number) => Math.floor(v * n) / n;

export function useCaseLeaf(
  rootRef: RefObject<HTMLElement | null>,
  stackRef: RefObject<HTMLElement | null>,
): void {
  const handlers = useRef<LeafHandlers>({});

  useSceneScrub(
    (timeline) =>
      buildLeaf(timeline, rootRef.current, stackRef.current, handlers.current),
    { onUpdate: (progress) => handlers.current.onUpdate?.(progress) },
  );
}

function buildLeaf(
  timeline: gsap.core.Timeline,
  root: HTMLElement | null,
  stack: HTMLElement | null,
  handlers: LeafHandlers,
): void | (() => void) {
  if (!root || !stack) return;

  // The timeline carries no tweens — the leaf is applied imperatively — but the
  // scrub still maps scroll onto its duration, so pin it (convention).
  timeline.set({}, {}, 1);

  // DOM order is bottom-of-stack first, so later files paint above earlier ones
  // and no z-index is needed. Reading order is the reverse: index 0 is the top
  // file, and only the first two ever toss.
  const files = [
    ...stack.querySelectorAll<HTMLElement>(".experience__file"),
  ].reverse();

  /* ---- change-tracked writers -------------------------------------------
     Holds are most of the read; nothing below touches the DOM unless its
     value actually crossed. */
  const lastTransform = files.map(() => "");
  const lastOpacity = files.map(() => "");
  const lastOn = files.map(() => false);

  const writeFile = (
    index: number,
    transform: string,
    opacity: string,
    on: boolean,
  ) => {
    const el = files[index];
    if (transform !== lastTransform[index]) {
      lastTransform[index] = transform;
      el.style.transform = transform;
    }
    if (opacity !== lastOpacity[index]) {
      lastOpacity[index] = opacity;
      el.style.opacity = opacity;
    }
    if (on !== lastOn[index]) {
      lastOn[index] = on;
      el.classList.toggle("experience__file--on", on);
    }
  };

  let promoted: boolean | null = null;
  const setPromoted = (on: boolean) => {
    if (on === promoted) return;
    promoted = on;
    for (const el of files) el.style.willChange = on ? "transform, opacity" : "";
  };

  let outro: boolean | null = null;
  const setOutro = (on: boolean) => {
    if (on === outro) return;
    outro = on;
    root.classList.toggle("experience--outro", on);
  };

  /* ---- the leaf as a pure function of progress --------------------------- */
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  const apply = (p: number) => {
    // One step means the swap happens at the window's end with no travel.
    const steps = reduced.matches ? 1 : L.steps;
    const travels = !reduced.matches;

    // Only the tossing files have a leaf progress; the last one never leaves.
    const q = L.tosses.map((w) => quant(clamp01((p - w.a) / (w.b - w.a)), steps));
    const gone = q.map((v) => v >= 1);

    for (let i = 0; i < files.length; i += 1) {
      if (i < q.length && q[i] > 0) {
        // Being leafed away: up-left, rotating, then cut.
        const t = q[i];
        const transform = travels
          ? `translate(${L.toss.xPercent * t}%, ${L.toss.yVh * t}vh) rotate(${L.toss.rotate * t}deg)`
          : "";
        writeFile(i, transform, gone[i] ? "0" : "1", false);
        continue;
      }
      // Still stacked: fanned once per file remaining above it, so every tab
      // stays readable.
      let above = 0;
      for (let j = 0; j < q.length; j += 1) {
        if (i > j && !gone[j]) above += 1;
      }
      const d = L.depth;
      const transform = `translate(${above * d.x}px, ${above * d.y}px) rotate(${above * d.rotate}deg) scale(${1 - above * d.scale})`;
      // The top of the remaining stack performs. A file mid-toss is nobody's
      // top, which is why this is not simply "the first file left".
      const onTop = above === 0 && (i >= q.length || q[i] === 0);
      writeFile(i, transform, "1", onTop);
    }

    setPromoted(travels && p > PROMOTE_AT);
    setOutro(p > L.outroAt);
  };

  /* ---- wiring ------------------------------------------------------------ */
  const trigger = timeline.scrollTrigger;
  let lastP = 0;
  const sync = () => {
    // Pull, don't trust the last push: a scene can mount with the reader
    // already inside it and no scroll event will ever deliver that progress.
    lastP = trigger?.progress ?? lastP;
    apply(lastP);
  };

  // The scene mounts as its neighbor's understudy, and the previous boundary
  // reveals this stack mid-assembly — so the first application can't wait for
  // a scroll event.
  sync();

  handlers.onUpdate = (p) => {
    lastP = p;
    apply(p);
  };
  // Live, like the rest of the engine: flipping the OS setting mid-read
  // switches between leafing and swapping without a reload.
  reduced.addEventListener("change", sync);

  return () => {
    handlers.onUpdate = undefined;
    reduced.removeEventListener("change", sync);
    for (const el of files) {
      el.style.transform = "";
      el.style.opacity = "";
      el.style.willChange = "";
      el.classList.remove("experience__file--on");
    }
    root.classList.remove("experience--outro");
  };
}
