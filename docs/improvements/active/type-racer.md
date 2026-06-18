Status: `active`
Scope: `playground`
Last updated: `2026-06-18`

# Type Racer — mini-game spec

A Monkeytype-style typing game for the **Playground** zone. Random words, sentences, or short paragraphs; WPM and accuracy scoring; guest play via localStorage with optional Supabase sync later.

## Why this game

- Showcases real-time UI, keyboard handling, and measurable game state — good portfolio demo.
- Natural fit for **Framer Motion** (caret pulse, character flip, results reveal) without needing Three.js.
- Complements Art Roulette (chance/skill mix) in the [playground backlog](../../product/backlog.md).

## Route

```text
/playground/type-racer
```

Linked from `/playground` hub alongside Art Roulette when both ship.

## Core loop

1. **Pick mode** — words (30s / 60s), sentence (single quote), or paragraph (short passage).
2. **Countdown** — 3…2…1… (skippable with Enter if already focused).
3. **Type** — user input compared character-by-character to prompt; mistakes highlighted inline.
4. **Finish** — time ends, prompt complete, or user abandons.
5. **Results** — WPM, raw WPM, accuracy %, time; option to retry or change mode.

## Modes

| Mode          | Prompt source                                       | Duration                   | Notes                                    |
| ------------- | --------------------------------------------------- | -------------------------- | ---------------------------------------- |
| **Words**     | Random word list (common English)                   | 30s or 60s timer           | Classic type racer; spaces between words |
| **Sentence**  | Curated one-liners (tech quotes, movie lines, etc.) | Until complete             | Good for quick rounds                    |
| **Paragraph** | 2–4 sentence passages                               | Until complete or 120s cap | Harder; optional “slow” badge            |

Prompt difficulty should not require external API on v1 — static JSON word banks + sentence/paragraph arrays in `lib/type-racer/`.

## Scoring

```text
WPM       = (correct_chars / 5) / (elapsed_seconds / 60)
Raw WPM   = (total_typed_chars / 5) / (elapsed_seconds / 60)
Accuracy  = correct_chars / total_typed_chars * 100
```

- **Correct char** — matches prompt at position (case-sensitive or insensitive — default insensitive for words, sensitive for quotes with punctuation).
- Store best scores per mode in localStorage; sync to Supabase when persistence ships ([backlog](../../product/backlog.md)).

## UX details

- **Focus trap** — hidden or minimal textarea; display prompt with per-char coloring (pending / correct / incorrect).
- **Backspace** — allowed; adjust stats when user corrects mistakes (standard behavior).
- **Tab / blur** — pause timer optionally (configurable; default: keep running like competitive sites).
- **Mobile** — supported but desktop-first; show note that physical keyboard is ideal.
- **Reduced motion** — skip countdown animation and char transitions; instant state updates.

## Framer Motion opportunities

| Moment            | Animation                                                   |
| ----------------- | ----------------------------------------------------------- |
| Mode select cards | Stagger enter and hover lift                                |
| Countdown         | Scale + fade per number                                     |
| Correct keystroke | Subtle green pulse on char                                  |
| Mistake           | Brief red shake on word or caret                            |
| Results panel     | Stagger stats + confetti-free celebration (scale pop on PB) |
| New personal best | Badge spring + optional achievement hook                    |

## File layout (when built)

```text
app/playground/type-racer/page.tsx
components/playground/type-racer/
  type-racer-game.tsx       # client shell
  prompt-display.tsx
  results-panel.tsx
  mode-picker.tsx
lib/type-racer/
  words.json                # or .ts export
  sentences.ts
  paragraphs.ts
  scoring.ts                # pure functions — Vitest
  use-type-racer.ts         # game state hook or reducer
  storage.ts                # localStorage high scores
```

## State shape (draft)

```ts
type TypeRacerMode = "words-30" | "words-60" | "sentence" | "paragraph";

type TypeRacerState = {
  phase: "idle" | "countdown" | "running" | "finished";
  mode: TypeRacerMode;
  prompt: string;
  input: string;
  startedAt: number | null;
  endedAt: number | null;
  errors: number;
};
```

Reducer + Vitest tests mirror Art Roulette pattern (Phase 4).

## Achievements (later)

| Id               | Trigger                           |
| ---------------- | --------------------------------- |
| `type-first-run` | Complete any run                  |
| `type-60-wpm`    | Hit 60 WPM on words mode          |
| `type-perfect`   | 100% accuracy on sentence mode    |
| `type-marathon`  | Finish a paragraph under time cap |

Category: **Playground** / **Type Racer** in cross-cutting achievement table.

## Rollout

| Step    | Status  | Deliverable                                    |
| ------- | ------- | ---------------------------------------------- |
| Spec    | Done    | This doc                                       |
| MVP     | Done    | Words 30s/60s, local high score, basic UI      |
| Polish  | Planned | Sentence/paragraph modes, motion, achievements |
| Persist | Planned | Supabase `user_stats` / leaderboard optional   |

Ship order is flexible — see [backlog](../../product/backlog.md), not roadmap phases.

## Open decisions

| Question                                     | Lean                                        |
| -------------------------------------------- | ------------------------------------------- |
| Punish mistakes (Monkeytype “stop on error”) | Off by default; optional strict mode        |
| Word list size                               | ~1k common words; expand later              |
| Quote licensing                              | Use public domain / self-written lines only |
| Leaderboard                                  | Local first; global when persistence ships  |

## Related

- [motion-and-3d.md](./motion-and-3d.md) — Framer Motion conventions
- [product/backlog.md](../../product/backlog.md) — playground games wishlist
- [product/roadmap.md](../../product/roadmap.md) — platform phases
