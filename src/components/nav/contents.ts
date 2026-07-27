import type { SceneLabel } from "@/lib/book";
import type { CSSVarStyle } from "@/lib/css-vars";

/**
 * The contents page of Issue #01 (design-doc §10/A2).
 *
 * Titles and folios are the ones actually printed on each page — the interior
 * pages' `<TitleBox>` kickers and `<MegaPage folio>` stamps — so the index can
 * never drift from the book it indexes. The two covers carry no folio (they
 * never do, in print), hence the em dash: an index that invented "00" and "04"
 * would number pages the reader can see are unnumbered.
 */
export interface Chapter {
  /** The scene's registered ScrollTrigger start label (CLAUDE.md). */
  label: SceneLabel;
  /** As printed on the page; `—` where the page carries no folio. */
  folio: string;
  title: string;
}

export const CHAPTERS: readonly Chapter[] = [
  { label: "cover", folio: "—", title: "COVER" },
  { label: "projects", folio: "01", title: "THE GOOD PART" },
  { label: "experience", folio: "02", title: "CASE FILES" },
  { label: "about", folio: "03", title: "ORIGIN STORY" },
  { label: "backcover", folio: "—", title: "BACK COVER" },
];

/**
 * The panel's choreography, in seconds (CLAUDE.md: timings live in one
 * constants module per section, mirroring the design doc's table).
 *
 * Re-timed from ReactBits' Staggered Menu, whose numbers are roughly 3× these
 * and glide on `power4.out`. Every duration here is short enough that a
 * `steps()` ease reads as a stamp rather than a stutter, which is the point of
 * the re-skin (CLAUDE.md rule 3 + the third-party convention).
 */
export const CONTENTS_OPEN = {
  /** Each colour pre-layer's slide, and the gap between them. */
  layer: 0.16,
  layerStagger: 0.05,
  /** The paper panel follows the last layer in. */
  panel: 0.24,
  panelDelay: 0.1,
  /** Entries stamp in one at a time once the panel is most of the way home. */
  item: 0.16,
  itemDelay: 0.26,
  itemStagger: 0.05,
  /** Closing is one move for everything — no reverse stagger. */
  close: 0.18,
} as const;

/** The nth entry's stamp-in delay, as the CSS variable its keyframes read. */
export function itemStamp(index: number): CSSVarStyle {
  return {
    "--cm-delay": `${CONTENTS_OPEN.itemDelay + index * CONTENTS_OPEN.itemStagger}s`,
  };
}
