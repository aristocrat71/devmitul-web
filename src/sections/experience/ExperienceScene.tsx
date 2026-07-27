import { useRef } from "react";
import { GutterCaption, TitleBox } from "@/components/comic";
import { useBoundaryZoom, type BoundaryConfig } from "@/hooks/useBoundaryZoom";
import { CaseFile } from "./CaseFile";
import { Polaroid } from "./Polaroid";
import { CASES } from "./content";
import { CASES_BOUNDARY } from "./timing";
import { useCaseLeaf } from "./useCaseLeaf";
import { useExperienceAssemble } from "./useExperienceAssemble";
import "./experience.css";

/**
 * The outbound boundary: the target zoom into the CASE 001 polaroid, handing
 * the docket's last stretch to ORIGIN STORY ("LET'S DO THIS ONE LAST
 * TIME...."). Only the title box fades early — the docket is the printed page
 * here and exits with the world fade; the polaroid's announce pulse (running
 * since `outroAt`) is gated off the moment the zoom owns the shot.
 */
const CASES_DIVE: BoundaryConfig = {
  next: "about",
  timing: CASES_BOUNDARY,
  fade: (root) => {
    const head = root.querySelector<HTMLElement>(".experience__head");
    return head ? [head] : [];
  },
  pulse: (root) => {
    const card = root.querySelector<HTMLElement>(".experience__polaroid-card");
    return card ? [card] : [];
  },
};

/**
 * Page 02 — CASE FILES.
 *
 * A port of the approved `experience-page-mockup.html`: three paper case folders
 * stacked centre-stage on the void, fanned so all three tabs read, with scroll
 * leafing the top one away to reveal the next (design-doc §7). Reverse
 * chronological — CASE 003 → 002 → 001 — so the reader leafs backward through
 * time and arrives at the oldest file, where the dive into ORIGIN STORY waits.
 *
 * Unlike its neighbours this page is not a camera walk: the reader stays put and
 * the *documents* move. The leaf lives in `useCaseLeaf`, built the same way the
 * camera is — a pure function of progress, applied per tick.
 */
export function ExperienceScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // The projects boundary drives this over its final 79–100%.
  useExperienceAssemble(headRef, stackRef);
  useCaseLeaf(rootRef, stackRef);
  // The scene's own tail is the boundary out — dive, caption, and
  // driveAssemble("about") over the last file's rest.
  useBoundaryZoom({ root: rootRef, gutter: gutterRef }, CASES_DIVE);

  const last = CASES.length - 1;
  // `CASES` is reading order (003 → 001); the DOM wants the stack bottom-up.
  const bottomUp = [...CASES].reverse();

  return (
    <>
      <GutterCaption
        ref={gutterRef}
        kicker="PAGE 03"
        text="LET'S DO THIS ONE LAST TIME...."
      />
      <div className="experience" ref={rootRef}>
        <TitleBox
          ref={headRef}
          className="experience__head"
          kicker="PAGE 02 — PERSONNEL RECORDS"
        >
          CASE FILES
        </TitleBox>

        {/* DOM order is bottom-of-stack first, so paint order alone puts the top
            file on top and no z-index is needed. The leaf scrub reverses this
            list to get reading order. */}
        <div className="experience__stack" ref={stackRef}>
          {bottomUp.map((file, i) => {
            const position = last - i; // 0 = top of the stack, read first
            return (
              <CaseFile
                key={file.caseNo}
                file={file}
                position={position}
                // The oldest file carries the dive into ORIGIN STORY.
                dive={position === last ? <Polaroid /> : undefined}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

export default ExperienceScene;
