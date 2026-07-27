import { useCallback, useEffect, useRef, useState } from "react";
import { CTA, EMAIL } from "./content";
import { COPY_FEEDBACK_MS } from "./timing";

/** Idle, copied, or "we couldn't copy for you — here it is, select it". */
type CopyState = "idle" | "copied" | "manual";

/**
 * Copy the address, by whichever route the browser allows.
 *
 * The async clipboard API needs a secure context and a permission that can be
 * denied; the textarea route works where it isn't (file://, older embedded
 * webviews). Both can fail, and the caller has a visible answer for that —
 * this is the site's conversion moment, so it never fails silently.
 */
async function copyEmail(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(EMAIL);
    return true;
  } catch {
    try {
      const field = document.createElement("textarea");
      field.value = EMAIL;
      field.setAttribute("readonly", "");
      // Parked off-screen rather than appended raw: the stage is a sticky
      // 100vh viewport and a visible textarea at the end of <body> would push
      // layout for the frame it exists.
      field.style.cssText = "position:fixed;top:-1000px;left:0;opacity:0";
      document.body.appendChild(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      return copied;
    } catch {
      return false;
    }
  }
}

/**
 * The email hero CTA (design-doc §9) — a paper panel with the address skewed
 * across it, and the site's conversion moment.
 *
 * **Copy to clipboard, never mailto.** A mailto gambles the visitor's next
 * action on whatever mail client the OS decides to open; copying leaves them
 * where they are, holding the address.
 *
 * Feedback is a stepped COPIED! starburst off the corner plus the subline
 * flipping for 3s. The burst remounts on each press (its key changes) so a
 * second press replays the animation from frame one instead of finding it
 * already finished.
 */
export function EmailCTA() {
  const [state, setState] = useState<CopyState>("idle");
  const [press, setPress] = useState(0);
  const restore = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(restore.current), []);

  const onCopy = useCallback(() => {
    void copyEmail().then((ok) => {
      setState(ok ? "copied" : "manual");
      setPress((n) => n + 1);
      window.clearTimeout(restore.current);
      restore.current = window.setTimeout(
        () => setState("idle"),
        COPY_FEEDBACK_MS,
      );
    });
  }, []);

  return (
    <button
      type="button"
      className="backcover__email"
      onClick={onCopy}
      aria-label={`Copy email address: ${EMAIL}`}
    >
      <span className="backcover__email-address">{EMAIL.toUpperCase()}</span>

      {/* Announced as well as shown — the whole feedback is in this line. */}
      <span className="backcover__email-sub" aria-live="polite">
        {state === "idle" ? (
          <>
            <b>{CTA.idleLead}</b>
            {CTA.idleRest}
          </>
        ) : state === "copied" ? (
          CTA.copied
        ) : (
          <b>{EMAIL.toUpperCase()}</b>
        )}
      </span>

      {state === "idle" ? null : (
        <span key={press} className="backcover__burst" aria-hidden="true">
          {state === "copied" ? CTA.copiedBurst : CTA.manualBurst}
        </span>
      )}
    </button>
  );
}
