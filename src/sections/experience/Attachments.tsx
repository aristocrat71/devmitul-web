import { cn } from "@/lib/utils";
import type { Witness } from "./content";

/**
 * The dashed attachment slot at the base of a case file — an image that hasn't
 * been supplied yet (design-doc §7 open items). When the file has no witness
 * statement it takes the whole strip, which is the design's own instruction for
 * that case rather than a fallback.
 */
export function Exhibit({
  label,
  note,
  wide,
}: {
  label: string;
  note: string;
  /** No witness slip on this file, so the exhibit widens to take its place. */
  wide?: boolean;
}) {
  return (
    <div
      className={cn("experience__exhibit", wide && "experience__exhibit--wide")}
      aria-hidden="true"
    >
      <span>
        {label}
        <br />
        {note}
      </span>
    </div>
  );
}

/**
 * A testimonial slip clipped to the file — document-white stock, magenta label,
 * italic courier quote, attribution.
 *
 * This component has no placeholder state of its own: a file with no `witness`
 * omits it entirely and widens its exhibit (CLAUDE.md conventions, design-doc
 * §7), because on a page whose whole conceit is evidence an
 * invented-but-plausible quote is the one thing that can't be filler.
 *
 * All three files currently pass `PLACEHOLDER_WITNESS` — lorem text, obviously
 * fake name — added at Mitul's request so the strip can be reviewed with both
 * slots filled. See the marker in `content.ts`; that is the one place to delete.
 */
export function WitnessStatement({ quote, attribution }: Witness) {
  return (
    <figure className="experience__witness">
      <figcaption className="experience__w-label">WITNESS STATEMENT</figcaption>
      <blockquote className="experience__w-quote">{`"${quote}"`}</blockquote>
      <p className="experience__w-attrib">— {attribution}</p>
    </figure>
  );
}
