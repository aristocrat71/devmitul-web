import { cn } from "@/lib/utils";
import type { Witness } from "./content";

/**
 * The evidence photo in a case file's dossier row, beside the tickets. With a
 * supplied image it prints as a pinned photograph, captioned with its exhibit
 * letter; without one it falls back to the dashed "attach…" slot the page
 * shipped with (design-doc §7 assets).
 *
 * The photo is positioned absolutely inside the slot so it contributes nothing
 * to layout — an `<img>` in flow hands the slot its own min-content height and
 * bursts the folder open (CLAUDE.md conventions; it cost the projects page a
 * 934px panel once). `object-fit: contain` then letterboxes it, because the
 * slot's shape is the layout's and no single crop suits every breakpoint.
 *
 * When the file has no witness statement the strip loses its bottom row, so the
 * exhibit widens into the space instead, which is the design's own instruction
 * for that case rather than a fallback.
 */
export function Exhibit({
  label,
  src,
  alt,
  note,
  wide,
}: {
  label: string;
  src?: string;
  alt?: string;
  note?: string;
  /** No witness slip on this file, so the exhibit widens to take its place. */
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "experience__exhibit",
        src && "experience__exhibit--filled",
        wide && "experience__exhibit--wide",
      )}
      // Empty, the slot is an instruction to the author and says nothing to a
      // reader; filled, the photo carries its own description.
      aria-hidden={src ? undefined : "true"}
    >
      {src ? (
        <>
          <img className="experience__ex-img" src={src} alt={alt ?? ""} />
          <span className="experience__ex-caption">{label}</span>
        </>
      ) : (
        <span>
          {label}
          <br />
          {note}
        </span>
      )}
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
