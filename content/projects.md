# THE GOOD PART — PAGE 01

The single source of truth for §3's featured builds. Edit this file and the page
changes; no copy about a project is stored anywhere else. The code beside it
(`src/sections/projects/schema.ts`) only checks the shape and swaps each `shot:`
filename for the built asset URL.

- **back issues:** https://github.com/aristocrat71?tab=repositories

**Every `##` heading is a project and nothing else is.** They are read in the
order they appear here, which is the order the camera walks them. There must be
**exactly three**: the page is a 2×2 grid holding three panels plus the
catalogue furniture in the fourth cell, so a fourth project evicts that
furniture and needs a third page row, a taller page, a fifth camera stop and a
longer scene. Adding one is a design change, not a content edit — swapping one,
which has happened twice, is not. Each project carries **exactly three
spotlights** for the same class of reason: a fourth does not fit the panel at
the camera's focus zoom. Both counts are enforced, so a miscount fails loudly
instead of printing a broken panel.

**Spotlights are claims about code, not blurbs.** Each was read off the
project's own repo and the `Notes` under each project record where — this page
does not carry invented ones, the same rule the witness statements on §7 are
held to. Keep them short and in caps: they are display type, stamped one at a
time when the camera arrives, and they are the panel's second-ranked element
after the name.

**The remaining fields.** `hook:` is the masthead's kicker, one line. `stack:`
is comma-separated and prints as one dim line on the footer rail — four entries
is the practical maximum before it wraps. `repo:` and `live:` must be http(s)
links; they become the two footer buttons. `shot:` is a filename inside
`src/assets/projects/`, never a path. `alt:` describes what the capture shows,
not that it is a screenshot — a reader who can't see it should learn the same
thing about the project that a reader who can does.

---

## TABLO

- **hook:** YOUR AI CODING SESSIONS, BABYSAT BY A CAT.
- **stack:** TAURI 2, SVELTE, TYPESCRIPT
- **repo:** https://github.com/aristocrat71/tablo
- **live:** https://tablo-cat.netlify.app/
- **shot:** tablo.webp
- **alt:** Tablo's landing page: the wordmark beside a pixel-art black cat with cyan eyes, above the line “a desktop cat that watches your AI coding agents for you”.

### Spotlights

1. A CAT-WIDGET THAT FLOATS ON YOUR SCREEN, DISPLAYS ALL AGENT ACTIVITY
2. RUST-BACKEND MAKES IT EXTREMELY LIGHTWEIGHT AND MEMORY EFFICIENT
3. TINY - SERVERLESS - SECURE

### Notes

Copy is Mitul's own (2026-07-28). Sources for the three claims:

1. The avatar is a transparent, always-on-top window that is click-through
   except over the cat, and it aggregates BOTH agents — Claude Code
   (`~/.claude/projects/`) and Codex (`~/.codex/sessions/`) — into one count,
   panel and dashboard (`src-tauri/src/scanner.rs`, `codex.rs`; README "The four
   surfaces", "Two agents, one cat").
2. Tauri 2 was chosen over Electron for footprint (tablo's `CLAUDE.md`,
   "Stack"), and the watching itself is cheap: byte-offset tailing that never
   re-parses a transcript, a 150ms event debounce over a 1Hz scan. _Caveat worth
   knowing before this line is quoted anywhere harder:_
   `memory-optimization-plan.md` measures released v1.0.0 at ~290MB
   phys_footprint, of which ~170MB is four WebKit `WebContent` processes. The
   Rust side is light; the webviews are not, and that plan exists to fix it.
3. "Serverless" = no cloud, not no HTTP: approvals and jump-to-session ride a
   loopback `tiny_http` server (`permission.rs`). "Secure" is earned — a per-run
   secret header on every hook request, a 4MB body cap, a bounded pending queue,
   fail-closed deny on timeout, and `~/.claude/settings.json` is only edited on
   explicit user consent.

---

## UNHALLUCINATE

- **hook:** AI LIES CONFIDENTLY. THIS ONE CALLS THE BLUFF.
- **stack:** NEXT.JS 14, FASTAPI, GROQ, TAILWIND
- **repo:** https://github.com/aristocrat71/Unhallucinate-AI
- **live:** https://unhallucinate-ai.netlify.app/
- **shot:** unhallucinate.webp
- **alt:** Unhallucinate's analysis view: the claim “The sun is cold” flagged HALLUCINATION DETECTED against a text trustworthiness score of 0%, with the reasoning “All 3 runs agree: claim contradicts scientific facts — the sun's surface temperature is around 5500°C” and three supporting source links.

### Spotlights

1. A WEB APP AND EXTENSION THAT FACT-CHECKS AI TEXT AGAINST LIVE SEARCH
2. THREE LLM RUNS VOTE, SO NO SINGLE MISREAD DECIDES A VERDICT
3. GROUNDED - VOTED - FREE TO RUN

### Notes

The three decisions that govern it, and where each one lives:

1. A verdict is never the model's opinion — it is grounded in a fresh web search
   and returns the sources it used. The pipeline is fixed: extract claims →
   search the web → compare claim against results → verdict + links
   (`backend/{claim_extractor,search_module,fact_checker}.py`, README
   "Architecture"). A Chrome extension (`hallucination-ext/`) is a second
   surface over the same FastAPI backend as the Next.js app.
2. The judge is a panel, not a single call. `backend/fact_checker.py` runs the
   same Groq model three times at temperatures 0.1 / 0.3 / 0.5 and takes the
   majority verdict via `Counter` — because an LLM asked to catch hallucination
   can hallucinate the answer, and one outlier should not decide. It is what the
   UI means by "All 3 runs agree".
3. Nothing costs anything and everything has a fallback: SerpAPI with DuckDuckGo
   behind it (`search_module.py`), Groq's free tier, Netlify static export. The
   project's own cost table totals $0. Verdicts are three-way on purpose —
   VERIFIED | HALLUCINATED | UNVERIFIABLE — so "not enough evidence" is a real
   answer rather than a forced guess.

---

## OPTILIFE

- **hook:** REAL LIFE, BUT WITH XP.
- **stack:** FLUTTER, RIVERPOD, FLAME, DRIFT
- **repo:** https://github.com/aristocrat71/OptiLife
- **live:** https://optilife-web.netlify.app/
- **shot:** optilife.webp
- **alt:** OptiLife's landing page: the headline “Tired of your main quests? Recharge your Life Energy with some side quests.” beside a phone showing the Side Quests screen — Adventure, Fitness and Creative cards, each worth ten XP.

### Spotlights

1. A LIFE TRACKER WITH A GAME ENGINE INSIDE, DRAWING THE BIOME YOU EARN
2. DRIFT OVER SQLITE MAKES EVERY SCREEN A LIVE, LOCAL QUERY
3. OFFLINE - ACCOUNTLESS - REVERSIBLE

### Notes

The three decisions that govern the app, and where each one lives:

1. A game engine runs inside a productivity app. Flame + `flame_svg` own the
   biome world (`lib/screens/biome/biome_game.dart` — a 10×10 isometric grid,
   which is exactly the 100-tree cap, foot-anchored sprites depth-sorted by
   `col + row`); Flutter owns every other screen. Both read the same store, so
   the reward is not a separate mode bolted on — it is the same data, drawn
   differently.
2. There is no server and no sync layer. Every screen is a Riverpod
   `StreamProvider` over a Drift query on an on-device SQLite file
   (`lib/state/app_providers.dart`, `lib/data/database.dart` — clean v1 schema,
   `PRAGMA foreign_keys = ON`, all screens date-scoped off one
   `selectedDateProvider` spine). The UI is a projection of the DB, so there is
   no second copy of the truth to keep in step.
3. Progression is derived, never stored, which is what makes the loop
   reversible. Only `lifetimeLe` is persisted; `currentLevel`, `leIntoLevel` and
   `leUntilNext` are pure functions of it, computed on read
   (`lib/core/le_math.dart`). Unchecking a quest can therefore cross a level
   boundary downward and pop the newest tree (`ActionOutcome.leveledDown`,
   `lib/data/game_repository.dart`) without anything drifting out of sync.
