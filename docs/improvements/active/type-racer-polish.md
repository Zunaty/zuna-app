Status: `active`
Scope: `playground`
Last updated: `2026-06-22`

# Type Racer — words mode polish

Polish pass for the shipped **30s / 60s words** modes before sentence and paragraph modes. Goal: feel closer to competitive typing sites (Monkeytype-style) without new game modes or persistence work.

Parent spec: [type-racer.md](./type-racer.md) · Route: `/playground/type-racer`

## Why this pass

MVP works but feels static compared to the spec's UX targets:

- Timer runs during countdown idle time (should start on first keystroke).
- No live stats during a run.
- Countdown cannot be skipped.
- Character feedback is color-only — no motion on correct / incorrect keys.
- No quick restart shortcut.

This pass keeps scope on **words-30** and **words-60** only.

## Out of scope (later)

| Item                           | Doc / phase                                          |
| ------------------------------ | ---------------------------------------------------- |
| Sentence mode                  | [type-racer.md](./type-racer.md) — Polish rollout    |
| Paragraph mode                 | [type-racer.md](./type-racer.md) — Polish rollout    |
| Strict mode (stop on error)    | [type-racer.md](./type-racer.md) — Open decisions    |
| Case-insensitive word matching | Optional; defer unless it feels wrong in playtesting |
| Supabase score sync            | [backlog](../../product/backlog.md) — Persist        |
| Achievements                   | [type-racer.md](./type-racer.md) — Achievements      |

---

## 1. Live stats during run

### Behavior

Show **WPM** and **accuracy %** in the header while `phase === "running"`. Update on every keystroke (derived from current `prompt`, `input`, and elapsed time).

- WPM uses the same formula as results (`correct_chars / 5 / elapsed_minutes`).
- Accuracy uses `correct_chars / total_typed * 100` (100% when nothing typed yet).
- Round for display: WPM integer, accuracy one decimal (match `scoring.ts` helpers).

### UI

- Place beside or below the countdown timer slot — e.g. a compact stat row: `42 WPM · 97.5%`.
- `aria-live="polite"` on the stat region so screen readers get periodic updates (throttle not required for v1).

### Files

- `lib/type-racer/scoring.ts` — reuse `computeStats` (no duplicate math).
- `components/playground/type-racer/type-racer-game.tsx` — render live stats.
- Optional: `components/playground/type-racer/live-stats.tsx` if the header gets crowded.

---

## 2. Timer starts on first keystroke

### Behavior

After countdown, enter a **ready** sub-state (or keep `running` with `timerStarted: false`):

1. Prompt is visible and input is focused; **timer does not tick**.
2. On first character typed, set `startedAt` and begin the interval tick.
3. Elapsed time for scoring = time from first keystroke to finish (not including countdown or pre-typing idle).

### Edge cases

- Backspace to empty input: timer keeps running once started (standard behavior).
- Time runs out: same finish flow as today.
- Completing full prompt early: elapsed = first keystroke → last keystroke.

### Files

- `lib/type-racer/use-type-racer.ts` — `timerStarted` flag or `startedAt` timestamp; gate `TICK_TIMER`.
- `lib/type-racer/scoring.ts` — no change if elapsed is passed correctly at finish.

---

## 3. Skip countdown with Enter

### Behavior

During `phase === "countdown"`, pressing **Enter** immediately transitions to the ready/running state (same as countdown reaching 0).

- Only when the game area or hidden textarea has focus (or document-level listener while countdown is active).
- Space should **not** skip (avoid accidental skip).

### Accessibility

- Announce skip via existing countdown region or move focus to input on skip.

### Files

- `components/playground/type-racer/type-racer-game.tsx` — keydown handler during countdown.
- `lib/type-racer/use-type-racer.ts` — action e.g. `SKIP_COUNTDOWN` → `BEGIN_RUNNING`.

---

## 4. Motion — correct pulse & mistake shake

### Behavior

| Event               | Animation                                              | Reduced motion               |
| ------------------- | ------------------------------------------------------ | ---------------------------- |
| Correct character   | Brief green pulse on the typed char                    | Instant color only (current) |
| Incorrect character | Brief red shake on the **word** containing the mistake | Instant color only (current) |

Use existing Framer Motion patterns from [motion-and-3d.md](./motion-and-3d.md): `useReducedMotion`, `springTransition` / `instantTransition`.

### Implementation notes

- Trigger off `input.length` increase and compare `input[i]` vs `prompt[i]` for the last index.
- Shake the word `<span>` wrapper in `prompt-display.tsx`, not the whole prompt.
- Keep animations short (&lt; 200ms) so fast typists are not blocked.

### Files

- `components/playground/type-racer/prompt-display.tsx`
- Optional: `lib/motion/variants.ts` — shared shake keyframes if reused elsewhere.

---

## 5. Quick restart shortcut

### Behavior

When `phase === "finished"`, **Tab + Enter** (Tab then Enter, Monkeytype-style) calls `reset` and starts a new test (or returns to idle with focus on Start — pick one and document).

Recommended: **Tab + Enter → idle** (same as "Try again" button); user can hit Enter again on Start or add **Tab + Enter → immediate restart** if that feels better in playtesting.

When `phase === "idle"`, **Enter** on the page starts the test if focus is not in another control.

### Files

- `components/playground/type-racer/type-racer-game.tsx` — global or scoped keydown listener.

---

## 6. Small copy / UX fixes

| Fix                                                  | Where                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------ |
| Results subtitle hardcodes "words mode"              | `results-panel.tsx` — use `TYPE_RACER_MODE_LABEL[mode]` only |
| Show "Press Enter to start" on idle when appropriate | `type-racer-game.tsx` hint line                              |
| Hint during ready state: "Start typing…"             | Same hint area                                               |

---

## 7. Tests

Add Vitest coverage for scoring edge cases used by live stats:

- Zero elapsed → 0 WPM
- All correct → 100% accuracy
- Mixed errors → expected WPM / raw WPM split
- Empty input at finish → 100% accuracy, 0 WPM

File: `lib/type-racer/scoring.test.ts` (or project test convention).

---

## Rollout checklist

| Step                     | Status | Deliverable          |
| ------------------------ | ------ | -------------------- |
| Spec                     | Done   | This doc             |
| Timer on first keystroke | Done   | Reducer + hook       |
| Live WPM / accuracy      | Done   | Header stats         |
| Skip countdown (Enter)   | Done   | Key handler          |
| Char / word motion       | Done   | `prompt-display.tsx` |
| Restart shortcut         | Done   | Key handler          |
| Copy fixes               | Done   | Results + hints      |
| Scoring tests            | Done   | Vitest               |

Mark rows ✅ in this doc and update [backlog](../../product/backlog.md) when the pass ships.

---

## Related

- [type-racer.md](./type-racer.md) — full game spec, modes, scoring formulas
- [motion-and-3d.md](./motion-and-3d.md) — Framer Motion conventions
- [product/backlog.md](../../product/backlog.md) — playground wishlist
