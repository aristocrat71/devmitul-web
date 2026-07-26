/**
 * The CREW PASS badge — an employee card, and the dive target for the
 * Projects → Experience boundary (design-doc §6): the next gutter reads
 * "WORKED WITH...", and you enter employment through the employee card.
 *
 * Geometry is the approved mockup's; colours come from tokens (CLAUDE.md rule
 * 5), applied through `style` because SVG presentation attributes don't
 * reliably resolve `var()`.
 *
 * `data-dive-target` is how the boundary's transition finds it to anchor
 * `perspective-origin`, re-measured at rest and on every refresh (rule 12).
 */
const ink = { fill: "var(--ink)" };

export function CrewPass() {
  return (
    <div className="projects__crew-pass" data-dive-target="experience">
      <svg viewBox="0 0 170 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Lanyard loop */}
        <rect
          x="79" y="0" width="12" height="10" rx="3"
          fill="none" strokeWidth="3" style={{ stroke: "var(--ink)" }}
        />
        {/* Card + magenta header band */}
        <rect
          x="4" y="8" width="162" height="98" rx="8"
          strokeWidth="4" style={{ fill: "var(--paper)", stroke: "var(--ink)" }}
        />
        <rect x="4" y="8" width="162" height="20" rx="8" style={{ fill: "var(--mag)" }} />
        <text
          x="85" y="23" textAnchor="middle"
          fontFamily="Courier New, monospace" fontWeight="bold" fontSize="10" letterSpacing="3"
          style={{ fill: "var(--paper)" }}
        >
          CREW PASS
        </text>

        {/* Portrait block */}
        <rect x="14" y="36" width="40" height="46" style={ink} />
        <circle cx="34" cy="50" r="8" opacity=".8" style={{ fill: "var(--mag)" }} />
        <path d="M20 82 C22 66 46 66 48 82 Z" style={{ fill: "var(--cyn)" }} />

        {/* Redacted detail lines */}
        <rect x="62" y="40" width="92" height="7" style={ink} />
        <rect x="62" y="53" width="70" height="6" opacity=".65" style={ink} />
        <rect x="62" y="65" width="80" height="6" opacity=".65" style={ink} />

        {/* Clearance chip */}
        <rect
          x="62" y="80" width="52" height="12"
          strokeWidth="2" style={{ fill: "var(--acid)", stroke: "var(--ink)" }}
        />
        <text
          x="88" y="89" textAnchor="middle"
          fontFamily="Courier New, monospace" fontWeight="bold" fontSize="7" letterSpacing="1"
          style={{ fill: "var(--ink)" }}
        >
          ALL ACCESS
        </text>
      </svg>
      <div className="projects__cp-note">
        NEXT: <b>DIVE ▸ EXPERIENCE</b>
      </div>
    </div>
  );
}
