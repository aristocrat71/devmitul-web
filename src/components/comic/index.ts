/**
 * The comic kit — shared motion primitives reused across every page.
 * Extend these rather than duplicating effect code in a section
 * (CLAUDE.md conventions).
 *
 * Each wrapper owns exactly one transform, so they compose by nesting:
 *
 *   <Parallax depth={16}>          // pointer depth
 *     <StampIn delay={1.15} rotate={-7}>  // entrance + resting angle
 *       <GlitchTick offset={3}>    // the 5s tick
 *         …
 *
 * Stacking two of them on one element makes the last one win — see the
 * ownership note at the top of comic.css.
 */
export { Banner } from "./Banner";
export { CutoutImage } from "./CutoutImage";
export { EvidenceTag } from "./EvidenceTag";
export { FadeUp } from "./FadeUp";
export { GlitchTick } from "./GlitchTick";
export { GutterCaption } from "./GutterCaption";
export { HalftoneBackground } from "./HalftoneBackground";
export { MegaCell, MegaPage, type CellSlot } from "./MegaPage";
export { Onomatopoeia } from "./Onomatopoeia";
export { PaperLabel } from "./PaperLabel";
export { Parallax } from "./Parallax";
export { SocialButton, type SocialNetwork } from "./SocialButton";
export { StampIn } from "./StampIn";
export { TitleBox } from "./TitleBox";
export { toTime, type TimeValue } from "./time";
export { toneVar, type Tone } from "./tone";
