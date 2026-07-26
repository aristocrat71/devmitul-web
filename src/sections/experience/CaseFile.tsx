import type { ReactNode } from "react";
import { EvidenceTag } from "@/components/comic";
import { cn } from "@/lib/utils";
import { Exhibit, WitnessStatement } from "./Attachments";
import type { CaseFile as CaseFileData, Op } from "./content";
import { CASES_FOCUS } from "./timing";

/** Splits the redaction gag so the block run isn't read out glyph by glyph. */
const BLOCKS = /(█+)/;

function OpText({ op }: { op: Op }) {
  if (!op.redacted) return op.text;
  return (
    <span className="experience__redact">
      {op.text.split(BLOCKS).map((part, i) =>
        BLOCKS.test(part) ? (
          <span key={`redaction-${i}`} role="img" aria-label="redacted">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </span>
  );
}

/**
 * One paper case folder (design-doc §7): tab, case number, STATUS stamp, org and
 * role, highlighted brief, KEY OPS, evidence tickets, and the attachments strip
 * pinned to its base.
 *
 * Everything invisible at rest waits for the file to reach the top of the stack,
 * when the leaf scrub adds `experience__file--on`: the status stamp slams, then
 * the evidence tickets stagger in. The file renders complete without that ever
 * happening — the beats are performance, not a precondition for the content.
 *
 * This element's `transform` and `opacity` belong to the leaf scrub alone
 * (CLAUDE.md rule 10), which is why nothing here has a hover state.
 */
export function CaseFile({
  file,
  position,
  dive,
}: {
  file: CaseFileData;
  /** Reading position, 0 = top of the stack. Drives the tab's offset. */
  position: number;
  /** The dive target, on the last file only. Also clears room for it. */
  dive?: ReactNode;
}) {
  return (
    <article
      className={cn("experience__file", `experience__file--pos${position + 1}`)}
    >
      <div className="experience__tab">{file.tab}</div>
      <p className="experience__case-no">{file.caseNo}</p>
      <p
        className={cn(
          "experience__status",
          `experience__status--${file.status.toLowerCase()}`,
        )}
      >
        {file.status}
      </p>

      <h3 className="experience__org">{file.org}</h3>
      <p className="experience__role">{file.role}</p>
      <p className="experience__brief">{file.brief}</p>

      <ul className="experience__ops">
        {file.ops.map((op) => (
          <li key={op.text}>
            <OpText op={op} />
          </li>
        ))}
      </ul>

      <p className="experience__ev-label">EVIDENCE</p>
      <div className="experience__evidence">
        {file.evidence.map((item, i) => (
          <EvidenceTag
            key={item}
            delay={CASES_FOCUS.evidence + i * CASES_FOCUS.evidenceStagger}
          >
            {item}
          </EvidenceTag>
        ))}
      </div>

      <div
        className={cn(
          "experience__attachments",
          dive && "experience__attachments--clear-dive",
        )}
      >
        {/* A file with no `witness` omits the slot and widens the exhibit, per
            design-doc §7. All three currently carry the temporary placeholder
            marked in `content.ts`. */}
        <Exhibit {...file.exhibit} wide={!file.witness} />
        {file.witness ? <WitnessStatement {...file.witness} /> : null}
      </div>

      {dive}
    </article>
  );
}
