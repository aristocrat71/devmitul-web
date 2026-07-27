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
  SocialButton,
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
            <SocialButton
              network="github"
              className="cover__gbtn cover__gbtn--github"
            />
          </GlitchTick>
          <GlitchTick offset={COVER_GLITCH.linkedin} shove={6}>
            <SocialButton
              network="linkedin"
              className="cover__gbtn cover__gbtn--linkedin"
            />
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
