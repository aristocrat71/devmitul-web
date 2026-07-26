import { POLAROID } from "./content";

/**
 * The paper-clipped polaroid on CASE 001 — the dive target for the Experience →
 * About boundary (design-doc §7). It sits on the *oldest* file for two reasons:
 * the target has to be on screen before the transition can begin, and entering
 * the origin story through the oldest photo in the record is what the gutter
 * caption "LET'S DO THIS ONE LAST TIME...." is about.
 *
 * Geometry is the approved mockup's; colours come from tokens (CLAUDE.md rule
 * 5), applied through `style` because SVG presentation attributes don't reliably
 * resolve `var()`.
 *
 * Three nested elements, one transform each: the outer holds the resting angle,
 * the middle is what the boundary's zoom will scale (`data-dive-target`), and
 * the card carries the pulse. Stacking those on one element is the bug family in
 * CLAUDE.md rule 10 — and the mockup does stack them, which is why its pulse
 * keyframes have to restate `rotate(6deg)` to avoid flattening the photo.
 */
export function Polaroid() {
  return (
    <div className="experience__polaroid">
      <div data-dive-target="about">
        <div className="experience__polaroid-card">
          <svg viewBox="0 0 100 116" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* The cyan paper clip, hooked over the top edge. */}
            <rect
              x="22" y="-6" width="56" height="14" rx="3"
              fill="none" strokeWidth="4" style={{ stroke: "var(--cyn)" }}
            />
            {/* Aged white frame. */}
            <rect
              x="2" y="2" width="96" height="112"
              strokeWidth="3"
              style={{ fill: "var(--paper-doc)", stroke: "var(--ink)" }}
            />
            {/* The photo: a figure too faded to make out — "EST. ???". */}
            <rect x="10" y="10" width="80" height="80" style={{ fill: "var(--ink-panel)" }} />
            <circle cx="50" cy="38" r="15" opacity=".85" style={{ fill: "var(--mag)" }} />
            <path d="M26 90 C30 62 70 62 74 90 Z" style={{ fill: "var(--cyn)" }} />
            <text
              x="50" y="106" textAnchor="middle"
              fontFamily="Courier New, monospace" fontWeight="bold" fontSize="8" letterSpacing="2"
              style={{ fill: "var(--ink)" }}
            >
              {POLAROID.caption}
            </text>
          </svg>
          <p className="experience__pl-note">
            NEXT: <b>{POLAROID.next}</b>
          </p>
        </div>
      </div>
    </div>
  );
}
