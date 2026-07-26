import { useRef } from "react";
import {
  Banner,
  CutoutImage,
  FadeUp,
  GlitchTick,
  GutterCaption,
  HalftoneBackground,
  Onomatopoeia,
  PaperLabel,
  Parallax,
  StampIn,
} from "@/components/comic";
import type { CSSVarStyle } from "@/lib/css-vars";
import { useParallax } from "@/hooks/useParallax";
import { SpeakerSticker } from "./SpeakerSticker";
import { useCoverTransition } from "./useCoverTransition";
import {
  beat,
  COVER_DEPTH,
  COVER_GLITCH,
  COVER_LOAD_IN,
  COVER_ROT,
} from "./timing";
import "./cover.css";

const GITHUB_URL = "https://github.com/aristocrat71";
const LINKEDIN_URL = "https://www.linkedin.com/in/mitul-sheth71/";

/* Load-in delays for the two cover-local entrances (the kit owns the rest). */
const MASTHEAD_DELAY: CSSVarStyle = {
  "--cover-delay": beat(COVER_LOAD_IN.mastheadSlam),
};
const CHARACTER_DELAY: CSSVarStyle = {
  "--cover-delay": beat(COVER_LOAD_IN.character),
};

/**
 * Page 00 — the Issue #01 cover.
 *
 * A 1:1 port of the approved `hero-cover-mockup.html`; the mockup is the
 * visual and timing spec and nothing here redesigns it. Content is the strict
 * inventory from design-doc §4 — no motto, bio, tags, skills, email or résumé
 * on the cover.
 *
 * Composition reads diagonally: cutout ↘ title ↘ tagline ↘ socials ↘ barcode,
 * with the character in FRONT of the masthead and the masthead pulled -8vw so
 * its opening letters run behind the shoulder.
 */
export function CoverScene() {
  const rootRef = useRef<HTMLDivElement>(null);
  const diveRef = useRef<HTMLDivElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  // Idle pointer parallax — desktop fine-pointers only, and the loop is shared
  // and refcounted, so mounting this scene simply joins it.
  useParallax();

  // §2 — the perspective dive into the GitHub button, the gutter caption, and
  // the handoff to the projects page. Owns the cover root's transform and
  // every element it fades; see useCoverTransition for the phase map.
  useCoverTransition({ dive: diveRef, cover: rootRef, gutter: gutterRef });

  return (
    <>
      <GutterCaption
        ref={gutterRef}
        kicker="PAGE 01"
        text="OHHH THIS IS THE GOOD PART..."
      />
      <div ref={diveRef} className="cm-dive">
        <div ref={rootRef} className="cover">
      <HalftoneBackground register depth={COVER_DEPTH.background} />

      {/* ---- Cover furniture, stamping in reverse-print order ---- */}
      <StampIn
        className="cover__issue"
        rotate={COVER_ROT.issueBox}
        delay={beat(COVER_LOAD_IN.issueBox)}
      >
        <PaperLabel variant="paper" tone="mag" className="cover__issue-label">
          <div className="cm-label__display">#01</div>
          <div className="cm-label__sub">ISSUE</div>
        </PaperLabel>
      </StampIn>

      <StampIn
        className="cover__location"
        rotate={COVER_ROT.locationStamp}
        delay={beat(COVER_LOAD_IN.locationStamp)}
      >
        <PaperLabel
          variant="outline"
          tone="acid"
          className="cover__location-label"
        >
          PUNE ・ INDIA
          <br />
          PUBLISHED 2026
        </PaperLabel>
      </StampIn>

      <StampIn
        className="cover__barcode-slot"
        rotate={COVER_ROT.barcode}
        delay={beat(COVER_LOAD_IN.barcode)}
      >
        <div className="cover__barcode">
          <span>DEV-MITUL-01</span>
        </div>
      </StampIn>

      {/* ---- Character cutout ----
          Three nested owners: parallax outside, the pop entrance inside it,
          the cutout itself innermost. The mockup stacks all three on one
          element, which kills the parallax the instant the pop lands. */}
      <Parallax
        className="cover__cutout"
        depth={COVER_DEPTH.characterX}
        depthY={COVER_DEPTH.characterY}
      >
        <div className="cover__cutout-pop" style={CHARACTER_DELAY}>
          <CutoutImage placeholder="YOUR PHOTO CUTOUT HERE" />
        </div>
      </Parallax>

      {/* ---- Right column ---- */}
      <Parallax
        className="cover__column"
        depth={COVER_DEPTH.columnX}
        depthY={COVER_DEPTH.columnY}
      >
        <div className="cover__masthead-slam" style={MASTHEAD_DELAY}>
          <GlitchTick
            as="h1"
            className="cover__masthead"
            baseTransform="skew(-6deg, -2deg)"
            offset={COVER_GLITCH.masthead}
          >
            dev<span className="cover__slash">/</span>Mitul
            <Onomatopoeia
              className="cover__thwak"
              delay={beat(COVER_LOAD_IN.thwak)}
              ghostDelay={beat(COVER_LOAD_IN.thwakGhost)}
            >
              THWAK!
            </Onomatopoeia>
          </GlitchTick>
        </div>

        <FadeUp className="cover__credit" delay={beat(COVER_LOAD_IN.credit)}>
          STARRING <b>MITUL SHETH</b>
        </FadeUp>

        <div className="cover__tag-row">
          <Banner
            className="cover__tagline"
            wipe
            delay={beat(COVER_LOAD_IN.tagline)}
          >
            SOFTWARE DEVELOPER&nbsp;//&nbsp;DATA SCIENCE
          </Banner>
        </div>

        <FadeUp className="cover__socials" delay={beat(COVER_LOAD_IN.socials)}>
          {/* The tick rides the wrapper and the hover lift rides the button,
              so the two transforms compose instead of overwriting each other.
              Hover/focus stops the tick via the kit's own rule. */}
          <GlitchTick offset={COVER_GLITCH.github} shove={6}>
            <a
              className="cover__gbtn cover__gbtn--github"
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
            </a>
          </GlitchTick>
          <GlitchTick offset={COVER_GLITCH.linkedin} shove={6}>
            <a
              className="cover__gbtn cover__gbtn--linkedin"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
              </svg>
            </a>
          </GlitchTick>
        </FadeUp>
      </Parallax>

      {/* ---- Speaker sticker ---- */}
      <Parallax
        className="cover__speaker"
        depth={COVER_DEPTH.speakerX}
        depthY={COVER_DEPTH.speakerY}
      >
        <StampIn
          className="cover__speaker-inner"
          rotate={COVER_ROT.speaker}
          delay={beat(COVER_LOAD_IN.speaker)}
        >
          <SpeakerSticker />
          <div className="cover__speaker-tag">
            <PaperLabel variant="solid" tone="mag" rotate={2}>
              AUDIO: ON
            </PaperLabel>
          </div>
        </StampIn>
      </Parallax>

      {/* ---- Scroll cue, last in ---- */}
      <div className="cover__cue">
        <FadeUp
          className="cover__cue-text"
          delay={beat(COVER_LOAD_IN.scrollCue)}
        >
          TURN THE PAGE
          <span className="cover__cue-arrow">▼</span>
        </FadeUp>
      </div>
        </div>
      </div>
    </>
  );
}

export default CoverScene;
