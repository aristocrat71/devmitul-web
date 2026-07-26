import { EvidenceTag, MegaCell } from "@/components/comic";
import { POWERS } from "./content";
import { ABOUT_FOCUS } from "./timing";

/**
 * C3 — POWERS & ABILITIES: the skills appendix, printed as a document lying on
 * the page rather than a panel cut into it (design-doc §8).
 *
 * The skills are punched evidence tickets — the same shared primitive CASE
 * FILES uses for its evidence rows — stamped in one at a time when the camera
 * arrives.
 */
export function PowersCell({ focus }: { focus: number }) {
  return (
    <MegaCell at="br" focus={focus}>
      <div className="about__powers">
        <h3 className="about__powers-title">POWERS &amp; ABILITIES</h3>
        <p className="about__powers-sub">
          OBSERVED CAPABILITIES ・ SUBJECT PROFILE APPENDIX
        </p>

        <div className="about__powers-grid">
          {POWERS.map((power, i) => (
            <EvidenceTag key={power} delay={i * ABOUT_FOCUS.powerStagger}>
              {power}
            </EvidenceTag>
          ))}
        </div>
      </div>
    </MegaCell>
  );
}
