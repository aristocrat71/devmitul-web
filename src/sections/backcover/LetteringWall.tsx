import { Fragment, useEffect, useRef } from "react";
import { GlitchTick } from "@/components/comic";
import { ScrollTrigger } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { WALL_REPEATS, WALL_ROWS, WALL_SEPARATOR } from "./content";
import { placeWall, WALL_SEP_CLASS, type WallTrack } from "./place-wall";
import { WALL_GLITCH, WALL_SHOVE } from "./timing";

/**
 * BUILD | LOVE | BELIEVE — the loudest page in the issue (design-doc §9). The
 * third row reads BELIEVE where the approved mockup read RISE (Mitul,
 * 2026-07-27) — a word swap only: same hollow cyan treatment, same left-edge
 * placement, and the placer measures whatever word it is given. Three
 * viewport-spanning rows of display type, the whole wall tilted −3° with the
 * letterforms cropping off every edge.
 *
 * **The wall is frozen.** A running marquee was built for this page and
 * rejected: nothing on this site moves continuously except cameras (CLAUDE.md
 * conventions). Its only motion is the standard one-frame slice glitch, offset
 * per row so a tick ripples across a different word every few seconds.
 *
 * Three nested elements per row, one transform each — the row slides in for
 * the page's entrance, the middle element takes the glitch tick, the track
 * carries its measured placement. Stacking them would mean the last writer
 * wins and the row would lose either its placement or its tick the moment the
 * other fired (comic.css's ownership note).
 *
 * Decorative by definition: the words are a poster, not content, so the whole
 * wall is `aria-hidden` and the page's actual heading is the corner stamp.
 */
export function LetteringWall() {
  const trackRefs = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const tracks: WallTrack[] = [];
    WALL_ROWS.forEach((row, i) => {
      const el = trackRefs.current[i];
      if (el) tracks.push({ el, word: row.word, place: row.place });
    });
    if (!tracks.length) return;

    const place = () => placeWall(tracks);
    place();

    // Never load-time-only (CLAUDE.md rule 12): the type is sized in vh and
    // the target positions in vw, so both inputs move with the viewport, and
    // the first paint may still be on the fallback face.
    let live = true;
    window.addEventListener("resize", place, { passive: true });
    ScrollTrigger.addEventListener("refresh", place);
    void document.fonts.ready.then(() => {
      if (live) place();
    });

    return () => {
      live = false;
      window.removeEventListener("resize", place);
      ScrollTrigger.removeEventListener("refresh", place);
    };
  }, []);

  return (
    <div className="backcover__wall" aria-hidden="true">
      {WALL_ROWS.map((row, i) => (
        <div
          key={row.word}
          className={cn(
            "backcover__row",
            `backcover__row--${row.word.toLowerCase()}`,
          )}
          data-wall-row={row.word}
        >
          <GlitchTick
            className="backcover__row-ink"
            offset={WALL_GLITCH[i]}
            shove={WALL_SHOVE}
          >
            <span
              className="backcover__track"
              ref={(el) => {
                trackRefs.current[i] = el;
              }}
            >
              {Array.from({ length: WALL_REPEATS }, (_, repeat) => (
                <Fragment key={repeat}>
                  {row.word}
                  <span className={WALL_SEP_CLASS}>{WALL_SEPARATOR}</span>
                </Fragment>
              ))}
            </span>
          </GlitchTick>
        </div>
      ))}
    </div>
  );
}
