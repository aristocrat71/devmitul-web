import { MegaCell } from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { APPENDIX_FOOT, DETAILS } from "./content";
import { ABOUT_FOCUS } from "./timing";

/** Entries stamp one after another; the stagger is the section's table. */
const rowStamp = (index: number): CSSVarStyle => ({
  "--cm-delay": `${index * ABOUT_FOCUS.detailStagger}s`,
});

/**
 * C3 — POWERS & ABILITIES: the appendix, printed as a document lying on the
 * page rather than a panel cut into it (design-doc §8).
 *
 * As of 2026-07-28 this prints **observed capabilities, not a tech list**
 * (Mitul's call — see `content.ts`). Each row is a claim over the evidence
 * line that backs it, numbered like exhibits, and they stamp in one at a time
 * when the camera arrives — the same gate the twelve tickets used, so the
 * cell's performance is unchanged and only what it says is different.
 */
export function PowersCell({ focus }: { focus: number }) {
  return (
    <MegaCell at="br" focus={focus}>
      <div className="about__powers">
        <h3 className="about__powers-title">POWERS &amp; ABILITIES</h3>
        <p className="about__powers-sub">
          OBSERVED IN THE FIELD ・ SUBJECT PROFILE APPENDIX
        </p>

        <ol className="about__details">
          {DETAILS.map((detail, i) => (
            <li className="about__detail" key={detail.power} style={rowStamp(i)}>
              {/* The exhibit number is decorative: an ordered list already
                  numbers itself for anyone not looking at the page. */}
              <span className="about__detail-no" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="about__detail-body">
                <span className="about__detail-power">{detail.power}</span>
                <span className="about__detail-source">{detail.source}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="about__powers-foot">{APPENDIX_FOOT}</p>
      </div>
    </MegaCell>
  );
}
