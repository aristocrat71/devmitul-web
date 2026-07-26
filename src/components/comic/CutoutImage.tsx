import { useId } from "react";
import { cn } from "@/lib/utils";
import type { CSSVarStyle } from "@/lib/css-vars";
import { toneVar, type Tone } from "./tone";

/** Stand-in silhouette, straight from the approved cover mockup. */
const PLACEHOLDER_VIEWBOX = "0 0 300 340";
const PLACEHOLDER_BUST =
  "M150 30 C185 30 210 58 210 96 C210 122 200 142 186 154 C230 168 262 205 268 340 L32 340 C38 205 70 168 114 154 C100 142 90 122 90 96 C90 58 115 30 150 30 Z";
const PLACEHOLDER_HAIR =
  "M92 92 C92 52 118 26 150 26 C182 26 208 52 208 92";

/** The stand-in's headphone band and ear cups — drawn over the halftone. */
function PlaceholderDetail({ edge, edgeTone }: { edge: number; edgeTone: Tone }) {
  const cup = { fill: "var(--cyn)", stroke: toneVar(edgeTone) };
  return (
    <>
      <path
        d={PLACEHOLDER_HAIR}
        fill="none"
        strokeLinecap="round"
        style={{ stroke: "var(--cyn)", strokeWidth: 9 }}
      />
      <rect x="80" y="84" width="20" height="34" rx="8" strokeWidth={edge * 0.57} style={cup} />
      <rect x="200" y="84" width="20" height="34" rx="8" strokeWidth={edge * 0.57} style={cup} />
    </>
  );
}

type CutoutImageProps = {
  /** The photo. Omit to render the stand-in silhouette. */
  src?: string;
  alt?: string;
  /**
   * SVG path `d` tracing the subject. With it, the die-cut edge is a real
   * stroke and the halftone clips to the body — and A1 later gets a path to
   * hit-test against. Without it we fall back to outlining an alpha PNG.
   */
  silhouette?: string;
  /** Required alongside `silhouette`. */
  viewBox?: string;
  /** Width of the die-cut paper edge. */
  edge?: number;
  /**
   * Colour of that edge. Paper by default — a die cut lifted off the void.
   * A cutout printed directly ON paper stock needs `"ink"` instead, or the
   * edge is invisible against the page (ORIGIN STORY's finale figure).
   */
  edgeTone?: Tone;
  halftone?: {
    tone?: Tone;
    /** Grid pitch in user units. */
    size?: number;
    /** Dot radius in user units. */
    radius?: number;
    opacity?: number;
  };
  /** The hard, unblurred print-offset shadow. */
  shadow?: { x?: number; y?: number; tone?: Tone; alpha?: number };
  /** Caption printed across the stand-in until the real asset lands. */
  placeholder?: string;
  className?: string;
  style?: CSSVarStyle;
};

/**
 * A halftone-treated photo cut out of the page, with a die-cut paper edge and
 * a magenta print-offset shadow.
 *
 * The container is `pointer-events: none` and stays that way — its bounding
 * box overlaps the social buttons on the cover, and re-enabling it here has
 * already killed a button once (CLAUDE.md rule 2). A1's hover greeting will
 * put `pointer-events: auto` on the silhouette *path* only, where SVG
 * hit-tests real geometry.
 */
export function CutoutImage({
  src,
  alt = "",
  silhouette,
  viewBox,
  edge = 7,
  edgeTone = "paper",
  halftone,
  shadow,
  placeholder,
  className,
  style,
}: CutoutImageProps) {
  // useId emits colons, which are awkward inside url(#…) references.
  const uid = useId().replace(/:/g, "");
  const clipId = `cut-${uid}`;
  const patternId = `ht-${uid}`;

  const dotTone = toneVar(halftone?.tone ?? "mag");
  const dotSize = halftone?.size ?? 9;
  const dotRadius = halftone?.radius ?? 2;
  const dotOpacity = halftone?.opacity ?? 0.65;

  const shadowAlpha = shadow?.alpha ?? 0.55;
  const vars = {
    "--cm-edge": `${edge}px`,
    "--cm-edge-color": toneVar(edgeTone),
    "--cm-shadow-x": `${shadow?.x ?? 6}px`,
    "--cm-shadow-y": `${shadow?.y ?? 6}px`,
    "--cm-shadow-color": `color-mix(in srgb, ${toneVar(shadow?.tone ?? "mag")} ${Math.round(shadowAlpha * 100)}%, transparent)`,
    ...style,
  } satisfies CSSVarStyle;

  // A plain alpha PNG with no traced silhouette: fake the die-cut edge with
  // stacked zero-blur shadows around the opaque pixels.
  if (src && !silhouette) {
    return (
      <div className={cn("cm-cutout", "cm-cutout--alpha", className)} style={vars}>
        <img src={src} alt={alt} decoding="async" />
      </div>
    );
  }

  const path = silhouette ?? PLACEHOLDER_BUST;
  const box = silhouette ? (viewBox ?? PLACEHOLDER_VIEWBOX) : PLACEHOLDER_VIEWBOX;

  return (
    <div className={cn("cm-cutout", "cm-cutout--pathed", className)} style={vars}>
      <svg viewBox={box} xmlns="http://www.w3.org/2000/svg" role={alt ? "img" : "presentation"} aria-label={alt || undefined}>
        <defs>
          <clipPath id={clipId}>
            <path d={path} />
          </clipPath>
          <pattern id={patternId} width={dotSize} height={dotSize} patternUnits="userSpaceOnUse">
            <circle
              cx={dotSize / 2}
              cy={dotSize / 2}
              r={dotRadius}
              opacity={dotOpacity}
              style={{ fill: dotTone }}
            />
          </pattern>
        </defs>

        {/* Layered exactly as the mockups draw it: body and die-cut edge
            first, subject over it, halftone over that. The edge is a centred
            stroke, so the halftone covering its inner half is what makes the
            paper rim read as a die cut rather than an outline. */}
        <path
          d={path}
          style={{
            fill: "var(--ink-panel)",
            stroke: toneVar(edgeTone),
            strokeWidth: edge,
          }}
        />
        {src ? (
          <g clipPath={`url(#${clipId})`}>
            <image
              href={src}
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        ) : null}
        <path d={path} fill={`url(#${patternId})`} />

        {src ? null : <PlaceholderDetail edge={edge} edgeTone={edgeTone} />}
      </svg>

      {placeholder ? <div className="cm-cutout__note">{placeholder}</div> : null}
    </div>
  );
}
