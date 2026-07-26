import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * The one place GSAP is configured. Every engine module and scene imports
 * `gsap`/`ScrollTrigger` from here so plugin registration and global config
 * happen exactly once, before any timeline exists.
 */
gsap.registerPlugin(ScrollTrigger);

// Mobile URL-bar show/hide fires resize constantly while scrolling; refreshing
// on those would recompute every trigger mid-read. Real orientation/size
// changes still refresh.
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
