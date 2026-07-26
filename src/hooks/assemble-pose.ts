/**
 * Which of the three assembly poses an element is in, given the boundary's
 * assembly progress and the fraction of the window at which the element starts.
 *
 * Shared because the thresholds are not free parameters: they carve the window
 * into the exact three poses `transition.css` declares — gone → overshoot →
 * landed. A page that split them differently would stamp through poses that
 * don't exist.
 */
export function poseAt(progress: number, at: number, window: number): number {
  const t = (progress - at) / window;
  if (t < 0.34) return 0;
  if (t < 0.67) return 1;
  return 2;
}
