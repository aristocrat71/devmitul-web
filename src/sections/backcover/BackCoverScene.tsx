import { useRef } from "react";
import { LetteringWall } from "./LetteringWall";
import { useBackCoverAssemble } from "./useBackCoverAssemble";
import { BARCODE, BLURB, NEXT_ISSUE, STAMP } from "./content";
import "./backcover.css";

/**
 * The BACK COVER — the last page of Issue #01.
 *
 * A port of the approved `backcover-mockup.html`: the maximalist BUILD | LOVE |
 * BELIEVE lettering wall with the contact block printed on top of it as back-cover
 * furniture (design-doc §9). The book ends the way it began, as a printed
 * object.
 *
 * The simplest scene in the issue and the highest-stakes one. It has no scrub
 * of its own — `lengthVh: 0`, a resting viewport the reader arrives on — and no
 * dive target or gutter caption, because there is no page after it. Its whole
 * scroll-linked life is its entrance, which ORIGIN STORY's boundary drives as
 * the reader falls through the finale speech bubble under "SAY HELLOOO...".
 * The page never repeats that setup line itself.
 *
 * As of 2026-07-27 the page is decorative: the contact block it was built
 * around now lives in ORIGIN STORY's C4, and what remains is the lettering
 * wall, the blurb and the closing furniture. Nothing here is interactive.
 */
export function BackCoverScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  // The about boundary drives this over its final 94–100%.
  useBackCoverAssemble(rootRef);

  return (
    <div className="backcover" ref={rootRef}>
      <LetteringWall />

      {/* The page's own name, and — with the wall decorative — its heading. */}
      <h2 className="backcover__stamp">{STAMP}</h2>

      {/* All that's left of the contact block: the address, the résumé link and
          the two bookend buttons moved to ORIGIN STORY's finale cell (Mitul,
          2026-07-27), so the blurb now stands alone in the middle of the wall
          rather than as the last line under a stack. */}
      <p className="backcover__blurb">{BLURB}</p>

      <div className="backcover__next-issue">
        <div className="backcover__ni-kicker">{NEXT_ISSUE.kicker}</div>
        <div className="backcover__ni-teaser">{NEXT_ISSUE.teaser}</div>
      </div>

      <div className="backcover__barcode">
        <span>{BARCODE}</span>
      </div>
    </div>
  );
}

export default BackCoverScene;
