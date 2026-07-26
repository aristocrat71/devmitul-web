/**
 * The speaker sticker — the cover's music signature, slapped over the
 * cutout's edge. Geometry is the approved mockup's; every colour comes from
 * a token rather than the mockup's literal hexes (CLAUDE.md rule 5).
 *
 * SVG presentation attributes don't reliably resolve `var()`, so token colours
 * are applied via `style` instead.
 */
const ink = { fill: "var(--ink)" };
const panel = { fill: "var(--ink-panel)", stroke: "var(--paper)" };

export function SpeakerSticker() {
  return (
    <svg viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Stepped dashed sound rings, alternating acid / magenta and offset so
          they read as two separate pulses rather than one thick ring. */}
      <circle
        className="cover__speaker-ring"
        cx="50" cy="62" r="34" fill="none" strokeWidth="3" strokeDasharray="6 7"
        style={{ stroke: "var(--acid)" }}
      />
      <circle
        className="cover__speaker-ring cover__speaker-ring--second"
        cx="50" cy="62" r="34" fill="none" strokeWidth="3" strokeDasharray="6 7"
        style={{ stroke: "var(--mag)" }}
      />

      {/* Cabinet */}
      <rect x="14" y="6" width="72" height="118" rx="8" strokeWidth="6" style={panel} />
      {/* Tweeter */}
      <circle cx="50" cy="26" r="9" strokeWidth="4" style={{ ...ink, stroke: "var(--cyn)" }} />

      {/* Woofer — the pumping group */}
      <g className="cover__speaker-cone">
        <circle cx="50" cy="62" r="26" strokeWidth="5" style={{ ...ink, stroke: "var(--paper)" }} />
        <circle cx="50" cy="62" r="14" strokeWidth="3" style={{ fill: "var(--mag)", stroke: "var(--ink)" }} />
        <circle cx="50" cy="62" r="5" style={{ fill: "var(--acid)" }} />
      </g>

      {/* Port slot */}
      <rect x="34" y="98" width="32" height="10" rx="5" strokeWidth="3" style={{ ...ink, stroke: "var(--cyn)" }} />
    </svg>
  );
}
