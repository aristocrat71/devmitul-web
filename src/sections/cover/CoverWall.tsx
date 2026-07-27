import { LetteringWall } from "@/sections/backcover/LetteringWall";
import "@/sections/backcover/backcover.css";

/**
 * The back cover's BUILD | LOVE | BELIEVE wall, printed behind the cover
 * (design-doc §4, amended 2026-07-27 by Mitul). The issue opens on the poster
 * it closes on, so the two covers read as the same printed object — the same
 * bookend logic that already pairs the cover's social buttons with ORIGIN
 * STORY's finale.
 *
 * **This mounts the back cover's own `<LetteringWall />`, not a copy of it.**
 * One wall, one set of glitch offsets, one measured placer — CLAUDE.md rule
 * 13, in its strongest form: the approved markup is embedded, never
 * re-created. The wall therefore stays owned by `sections/backcover/`, which
 * is the page the design doc specifies it on; this is a deliberate
 * cross-section import and not an oversight to tidy up. It is also why the
 * wrapper carries `.backcover` as well as its own class: that page scopes the
 * row type (`.backcover .backcover__row-ink`) and the mobile size to its own
 * root, so without the class the rows would fall back to body type at body
 * size and mobile would print the desktop 38vh.
 *
 * Everything that makes a foreground page readable over it is subtraction in
 * `cover.css` — the back cover's opaque ink stock and its dot fields come off,
 * the rows drop to a wash. Nothing is added, so the wall cannot drift from the
 * one on §9.
 *
 * The wall arrives at rest: no `[data-assemble]` attribute here, so the back
 * cover's scroll-driven entrance never runs and this is simply printed stock
 * from first paint. Decorative throughout — `aria-hidden`, and no layer in it
 * takes a pointer event (rule 2).
 */
export function CoverWall() {
  return (
    <div className="cover__wall-bg backcover" aria-hidden="true">
      <LetteringWall />
    </div>
  );
}
