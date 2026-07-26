/**
 * §0 engine smoke test — drives the book in headless Chromium and verifies
 * the scene manager's guarantees: mount lifecycle (active ± 1), pointer-event
 * discipline, scrub reversibility, label jumps, DOM-baseline memory check,
 * 4× CPU-throttle fps, and reduced-motion behavior.
 *
 * Run:  bun run dev   (in another terminal, port 5173)
 *       bun run smoke
 *
 * One-time setup: bunx playwright install chromium
 * Screenshots land in node_modules/.cache/engine-smoke/.
 */
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";

const BASE = "http://localhost:5173";
const SHOTS = "node_modules/.cache/engine-smoke/";
mkdirSync(SHOTS, { recursive: true });
const VH = 9; // viewport 1440×900 → 1vh = 9px

let failures = 0;
function check(name: string, ok: boolean, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  [${detail}]` : ""}`);
  if (!ok) failures += 1;
}

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const consoleErrors: string[] = [];
page.on("console", (m) => {
  if (m.type() === "error") consoleErrors.push(m.text());
});
page.on("pageerror", (e) => consoleErrors.push(String(e)));

await page.goto(BASE);
await page.waitForTimeout(1200);

interface Snap {
  scrollY: number;
  docH: number;
  lenis: boolean;
  nodes: number;
  layers: { label?: string; state?: string; pointer: string; opacity: string }[];
  markers: (string | null)[];
}
const snap = (): Promise<Snap> =>
  page.evaluate(() => ({
    scrollY: Math.round(window.scrollY),
    docH: document.documentElement.scrollHeight,
    lenis: document.documentElement.classList.contains("lenis"),
    nodes: document.querySelectorAll("*").length,
    layers: [...document.querySelectorAll(".cm-scene")].map((el) => ({
      label: (el as HTMLElement).dataset.scene,
      state: (el as HTMLElement).dataset.sceneState,
      pointer: getComputedStyle(el).pointerEvents,
      opacity: getComputedStyle(el.firstElementChild as Element).opacity,
    })),
    markers: [...document.querySelectorAll(".cm-scene")].map((el) => {
      const m = el.querySelector("p + div");
      return m ? getComputedStyle(m).transform : null;
    }),
  }));

// Instant scroll through the engine's own sanctioned path.
await page.evaluate(async () => {
  const book = await import("/src/lib/book.ts");
  const scroll = await import("/src/lib/smooth-scroll.ts");
  Object.assign(window as never, { __book: book, __scroll: scroll });
});
const jump = (label: string) =>
  page.evaluate((l) => (window as never as { __book: { jumpToScene(l: string): void } }).__book.jumpToScene(l), label);
const setScroll = (y: number) =>
  page.evaluate(
    (v) =>
      (window as never as { __scroll: { setScrollInstant(y: number): void } }).__scroll.setScrollInstant(v),
    y,
  );

/** Wait until scroll stops moving (two identical samples 150ms apart). */
async function settle(maxMs = 5000): Promise<void> {
  let last = -1;
  const start = Date.now();
  for (;;) {
    const y = await page.evaluate(() => window.scrollY);
    if (y === last || Date.now() - start > maxMs) return;
    last = y;
    await page.waitForTimeout(150);
  }
}

/* 1 ── initial state */
let s = await snap();
check(
  "initial: layers are [cover(active), projects(next)]",
  s.layers.length === 2 &&
    s.layers[0].label === "cover" &&
    s.layers[0].state === "active" &&
    s.layers[1].label === "projects" &&
    s.layers[1].state === "next",
  s.layers.map((l) => `${l.label}:${l.state}`).join(","),
);
check(
  "initial: only the active layer takes pointer events",
  s.layers[0].pointer !== "none" && s.layers[1].pointer === "none",
);
check("initial: lenis smooth scroll engaged", s.lenis);
check("initial: document height = 1930vh", s.docH === 1930 * VH, String(s.docH));
const baselineNodes = s.nodes;
await page.screenshot({ path: `${SHOTS}1-cover-at-rest.png` });

/* 2 ── scrub responds to real wheel input and reverses */
const markerAtRest = s.markers[0];
await page.mouse.wheel(0, 3000);
await page.waitForTimeout(1400);
s = await snap();
check("scrub: cover marker moved under wheel scroll", s.scrollY > 0 && s.markers[0] !== markerAtRest, `y=${s.scrollY}`);
await page.mouse.wheel(0, -5000);
await settle();
s = await snap();
check(
  "scrub: fully reversible back to rest pose",
  s.scrollY === 0 && s.markers[0] === markerAtRest,
  `y=${s.scrollY}`,
);

/* 3 ── mid-transition: cover fading out over the incoming page */
await setScroll(315 * VH); // 95% through cover's 330vh range, past the 20vh activation lead
await page.waitForTimeout(500);
s = await snap();
check(
  "transition tail: activation lead flips interaction to projects early",
  s.layers.find((l) => l.label === "projects")?.state === "active" &&
    s.layers.find((l) => l.label === "cover")?.state === "prev",
  s.layers.map((l) => `${l.label}:${l.state}`).join(","),
);
check(
  "transition tail: 3 layers mounted (cover, projects, experience)",
  s.layers.length === 3 && s.layers[2].label === "experience",
  s.layers.map((l) => l.label).join(","),
);
const coverOpacity = Number(s.layers[0].opacity);
check("transition tail: cover is mid-fade above projects", coverOpacity > 0 && coverOpacity < 1, s.layers[0].opacity);
check(
  "transition tail: faded cover no longer takes pointer events",
  s.layers[0].pointer === "none",
);
await page.screenshot({ path: `${SHOTS}2-boundary-fade.png` });

/* 4 ── label jumps (A2 mechanics) */
await jump("experience");
await page.waitForTimeout(500);
s = await snap();
check(
  "jump(experience): lands exactly on the scene start (850vh)",
  Math.abs(s.scrollY - 850 * VH) <= 1,
  `y=${s.scrollY}`,
);
check(
  "jump(experience): layers are [projects, experience(active), about]",
  s.layers.length === 3 &&
    s.layers.map((l) => l.label).join(",") === "projects,experience,about" &&
    s.layers[1].state === "active",
  s.layers.map((l) => `${l.label}:${l.state}`).join(","),
);

await jump("backcover");
await page.waitForTimeout(500);
s = await snap();
check(
  "jump(backcover): end of book, backcover active, about beneath",
  s.layers.map((l) => l.label).join(",") === "about,backcover" &&
    s.layers[1].state === "active" &&
    Math.abs(s.scrollY - 1830 * VH) <= 1,
  `y=${s.scrollY} layers=${s.layers.map((l) => `${l.label}:${l.state}`).join(",")}`,
);
await page.screenshot({ path: `${SHOTS}3-backcover.png` });

/* 5 ── memory: scroll home, DOM returns to baseline */
await jump("cover");
await page.waitForTimeout(500);
s = await snap();
check(
  "memory: back at cover, far scenes unmounted, DOM node count = baseline",
  s.layers.length === 2 && s.nodes === baselineNodes,
  `nodes ${s.nodes} vs baseline ${baselineNodes}`,
);

/* 6 ── rough fps probe at 4× CPU throttle while scrubbing */
const cdp = await page.context().newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
const fpsPromise = page.evaluate(
  () =>
    new Promise<number>((resolve) => {
      let frames = 0;
      const start = performance.now();
      const loop = () => {
        frames += 1;
        if (performance.now() - start < 2000) requestAnimationFrame(loop);
        else resolve(frames / 2);
      };
      requestAnimationFrame(loop);
    }),
);
for (let i = 0; i < 8; i += 1) {
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(220);
}
const fps = await fpsPromise;
check("perf: ≥55fps while scrubbing at 4× CPU throttle", fps >= 55, `${fps.toFixed(1)}fps`);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 1 });

/* 7 ── console cleanliness */
check("no console/page errors anywhere in the run", consoleErrors.length === 0, consoleErrors.join(" | "));

/* 8 ── reduced motion: native scroll, engine still functional */
const rmContext = await browser.newContext({
  reducedMotion: "reduce",
  viewport: { width: 1440, height: 900 },
});
const rmPage = await rmContext.newPage();
await rmPage.goto(BASE);
await rmPage.waitForTimeout(1000);
const rmLenis = await rmPage.evaluate(() => document.documentElement.classList.contains("lenis"));
check("reduced motion: Lenis stays off (native scroll)", !rmLenis);
await rmPage.mouse.wheel(0, 2000);
await rmPage.waitForTimeout(600);
const rmY = await rmPage.evaluate(() => Math.round(window.scrollY));
check("reduced motion: page still scrolls natively", rmY > 0, `y=${rmY}`);
await rmContext.close();

await browser.close();
console.log(`\nScreenshots: ${SHOTS}`);
console.log(failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
