/**
 * The five print passes, by name. Components take a `Tone` rather than a
 * colour so no hex can enter a component file (CLAUDE.md rule 5).
 */
export type Tone = "ink" | "paper" | "mag" | "cyn" | "acid";

export function toneVar(tone: Tone): string {
  return `var(--${tone})`;
}
