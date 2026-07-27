import { useRef } from "react";
import { SocialButton } from "@/components/comic";
import { EmailCTA } from "./EmailCTA";
import { LetteringWall } from "./LetteringWall";
import { useBackCoverAssemble } from "./useBackCoverAssemble";
import {
  BARCODE,
  BLURB,
  NEXT_ISSUE,
  RESUME_LABEL,
  RESUME_URL,
  STAMP,
} from "./content";
import "./backcover.css";

/**
 * The BACK COVER — the last page of Issue #01.
 *
 * A port of the approved `backcover-mockup.html`: the maximalist BUILD | LOVE |
 * BELIEVE lettering wall with the contact block printed on top of it as back-cover
 * furniture (design-doc §9). The book ends the way it began, as a printed
 * object.
 *
 * The simplest scene in the issue and the highest-stakes one. It has no scrub
 * of its own — `lengthVh: 0`, a resting viewport the reader arrives on — and no
 * dive target or gutter caption, because there is no page after it. Its whole
 * scroll-linked life is its entrance, which ORIGIN STORY's boundary drives as
 * the reader falls through the finale speech bubble under "SAY HELLOOO...".
 * The page never repeats that setup line itself.
 *
 * Interaction flips to this scene 20vh before it starts (`ACTIVATION_LEAD_VH`),
 * so the email CTA is clickable without scrolling to the last pixel.
 */
export function BackCoverScene() {
  const rootRef = useRef<HTMLDivElement>(null);

  // The about boundary drives this over its final 94–100%.
  useBackCoverAssemble(rootRef);

  return (
    <div className="backcover" ref={rootRef}>
      <LetteringWall />

      {/* The page's own name, and — with the wall decorative — its heading. */}
      <h2 className="backcover__stamp">{STAMP}</h2>

      <div className="backcover__contact">
        <div className="backcover__slot backcover__slot--email">
          <EmailCTA />
        </div>

        <div className="backcover__actions">
          <div className="backcover__slot backcover__slot--resume">
            <a
              className="backcover__resume"
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              {RESUME_LABEL}
            </a>
          </div>
          {/* The cover's buttons, reprised — the issue's bookends. */}
          <div className="backcover__slot backcover__slot--github">
            <SocialButton
              network="github"
              className="backcover__gbtn backcover__gbtn--github"
            />
          </div>
          <div className="backcover__slot backcover__slot--linkedin">
            <SocialButton
              network="linkedin"
              className="backcover__gbtn backcover__gbtn--linkedin"
            />
          </div>
        </div>

        <p className="backcover__blurb">{BLURB}</p>
      </div>

      <div className="backcover__next-issue">
        <div className="backcover__ni-kicker">{NEXT_ISSUE.kicker}</div>
        <div className="backcover__ni-teaser">{NEXT_ISSUE.teaser}</div>
      </div>

      <div className="backcover__barcode">
        <span>{BARCODE}</span>
      </div>
    </div>
  );
}

export default BackCoverScene;
