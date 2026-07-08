Status: `active`
Scope: `playground`
Last updated: `2026-07-08`

# Breakout — mini-game spec

A retro brick-breaker for the **Playground** zone with two modes: **Classic** (pure retro, 5 handcrafted levels) and **Roguelite** (endless run — draft a modifier after every level to spice the game up). Paddle, ball, and chunky pixel bricks on a `<canvas>` driven by a fixed-timestep loop at a user-selectable **30 or 60 fps**. Guest play via localStorage; Supabase per-mode best-score sync following the shared playground patterns.

> **Sequencing:** Breakout ships **before** [Lunar Lander](./lunar-lander.md). It is deliberately the simpler physics game — its job is to validate the shared canvas game-loop foundation (`lib/game-canvas/`) that the lander then builds on.

## Why this game

- First game rendered **outside React's render cycle** — game loop, collision detection, delta-time physics on canvas. New skill signal vs Type Racer (DOM/keyboard) and Prompt Run (state machine + AI API).
- Establishes the **shared canvas engine** (`lib/game-canvas/`) reused by Lunar Lander — pays into the roadmap's "Playground shared patterns" priority.
- Retro CRT aesthetic is a strong visual-polish showcase with near-zero design risk — everyone knows how Breakout should feel.
- The **Roguelite mode** adds game-design depth (draft choices, risk/reward, stacking modifiers) and reuses the rarity language players already know from Prompt Run — a shared design vocabulary across the Playground.

## Route

```text
/playground/breakout
```

Linked from `/playground` hub alongside Type Racer and Prompt Run.

## Modes

| Mode          | Structure                                               | Win/end condition                  | Personality                                     |
| ------------- | ------------------------------------------------------- | ---------------------------------- | ----------------------------------------------- |
| **Classic**   | 5 handcrafted levels, fixed difficulty ramp             | Clear level 5 or lose all lives    | Pure retro — no modifiers, no drafts            |
| **Roguelite** | Endless levels; draft 1 of 3 modifiers after each clear | Lose all lives (score/depth chase) | Dynamic — stacking boons and risk/reward curses |

Both modes share the same physics, controls, and juice; the roguelite layer is purely additive on top of the classic core. Per-mode best scores follow the Type Racer per-mode convention.

## Core loop

1. **Start** — mode select (Classic / Roguelite) + rules; runs start at level 1 (no mid-run save in v1).
2. **Serve** — ball rests on paddle; launch with click/tap/Space.
3. **Play** — ball bounces off walls, paddle, and bricks; bricks break and score; ball past paddle costs a life.
4. **Level clear** — all breakable bricks gone. Classic: short interstitial, next layout, slightly faster ball. Roguelite: **draft screen** — pick 1 of 3 modifiers (or skip for flat points), then next level.
5. **Game over** — 0 lives (either mode) or level 5 cleared (Classic); results panel with score, per-mode best, modifiers taken (Roguelite), retry.

## Roguelite draft

After every level clear, the player is offered **3 modifiers drawn from a weighted pool**; pick one or **skip for +250 flat points**. Modifiers stack for the rest of the run. Rarity tiers reuse the Prompt Run color language (common / uncommon / rare / epic).

### Modifier pool (v1 draft — tune in playtesting)

**Boons:**

| Modifier      | Rarity   | Effect                                                                |
| ------------- | -------- | --------------------------------------------------------------------- |
| Wide paddle   | Common   | +25% paddle width                                                     |
| Slow ball     | Common   | −10% ball speed (floor at 70% of base)                                |
| Extra life    | Uncommon | +1 life immediately                                                   |
| Sticky paddle | Rare     | Ball sticks on paddle catch; aim and re-launch                        |
| Piercing      | Rare     | Ball breaks through the first brick of each volley without bouncing   |
| Multiball     | Epic     | +1 permanent extra ball (lose a life only when the _last_ ball drops) |
| Combo keeper  | Epic     | Volley combo halves on paddle touch instead of resetting              |

**Curses (risk/reward — each adds a permanent score multiplier):**

| Modifier      | Rarity   | Effect                                           | Reward          |
| ------------- | -------- | ------------------------------------------------ | --------------- |
| Narrow paddle | Uncommon | −20% paddle width                                | +25% score mult |
| Turbo ball    | Uncommon | +15% ball speed                                  | +25% score mult |
| Hard bricks   | Rare     | All bricks +1 HP                                 | +30% score mult |
| Blackout      | Epic     | Bricks invisible until first ball hit each level | +50% score mult |

### Design & implementation notes

- **Modifiers are data, not code branches** — each is `{ id, rarity, apply }` where `apply` is a pure transform on derived run config (paddle width, ball speed, brick HP, score multiplier) plus a small set of flags (`sticky`, `piercing`, `blackout`) checked in `update.ts`. Keeps the update function pure and each modifier Vitest-testable in isolation.
- **Seeded RNG** for draft draws and level order — reproducible runs in tests, and leaves the door open for a shared daily-seed challenge (same idea as Lunar Lander terrain).
- **Roguelite levels** reuse the handcrafted layouts in a seeded shuffle, ramping ball speed and brick HP each loop — no procedural generation needed for v1.
- Multiball makes `balls[]` an array **from day one** in the state shape — cheaper than retrofitting, and Classic simply always has one ball.

> **Power-ups:** the draft pool replaces the earlier "power-ups someday" idea. Classic stays untouched retro; anything paddle/ball-altering lives in Roguelite drafts instead of random drops.

## Physics & mechanics

| Mechanic        | Rule                                                                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Ball movement   | Constant speed (magnitude), direction vector; speed ramps slightly per level and per paddle hit (capped)                                   |
| Wall bounce     | Reflect velocity component on axis-aligned walls; top wall included                                                                        |
| Paddle bounce   | Reflection angle from hit offset — center hit = steep, edge hit = shallow; clamped to 30°–150° from horizontal                             |
| Brick collision | AABB overlap test; reflect on the axis of least penetration; break brick (or decrement HP for tough bricks)                                |
| Lives           | 3 per run; losing the ball resets to serve state                                                                                           |
| Tunneling guard | Substep collision checks when per-tick travel exceeds brick thickness — matters most at 30 fps, where the ball moves twice as far per tick |

All physics lives in **pure functions** — `(state, input, dt) → state` with a **fixed `dt`** from the shared loop — so the interesting logic is deterministic and Vitest-testable without a canvas (roadmap: "Vitest coverage for pure game logic"). Ball speed and paddle speed are defined in units/second, so gameplay feels identical at 30 and 60 fps.

## Levels

- Static layouts defined in code (`lib/breakout/levels.ts`) — grid of brick definitions per level.
- **v1: 5 handcrafted levels** (Classic). Later rows introduce multi-hit bricks (2 HP, darker shade) and unbreakable bricks sparingly.
- Roguelite cycles the same layouts in a seeded shuffle with ramping speed/HP per loop.
- Brick colors follow a retro row palette; tough bricks visually distinct.

## Scoring

```text
Brick points   = base by row/type (top rows worth more)
Volley combo   = +10% per extra brick broken in a single volley (between paddle touches)
Level clear    = +500 × level number
Lives bonus    = +250 per remaining life at game end (Classic)
Curse mult     = product of active curse multipliers, applied to brick + clear points (Roguelite)
Draft skip     = +250 flat when skipping a draft pick (Roguelite)
```

**Per-mode bests** (Classic best score; Roguelite best score + deepest level reached) stored per the shared pattern: localStorage for guests, Supabase bests for signed-in users, merge on sign-in — same shape as Type Racer's per-mode bests.

## Controls

| Input               | Action                                                        |
| ------------------- | ------------------------------------------------------------- |
| Mouse move          | Paddle follows pointer x (primary, desktop)                   |
| ← / → keys          | Keyboard paddle movement (accessibility)                      |
| Touch drag          | Paddle follows finger — Breakout is naturally mobile-friendly |
| Click / Space / tap | Serve ball; pause toggle via Esc / pause button               |

Auto-pause when the tab loses visibility or the canvas loses focus.

## Retro aesthetic & juice

- Chunky pixel bricks, scanline overlay (CSS, cheap), limited palette that respects light/dark theme.
- Screen shake on brick break streaks; particle burst on brick destruction (canvas-native particles, not tsParticles, to stay in the game loop).
- Audio via the Web Audio pattern established in Prompt Run — bounce blip, brick break, life lost, level clear. Mute/volume respects the shared audio settings convention.
- **Reduced motion** — no screen shake, no particles, no scanline flicker; state changes remain instant and legible.

## Shared canvas engine (new — `lib/game-canvas/`)

Built as part of this game, consumed by Lunar Lander next:

```text
lib/game-canvas/
  use-game-loop.ts    # fixed-timestep loop (30/60 fps), pause on blur/visibilitychange
  use-canvas.ts       # DPR-aware sizing, ResizeObserver, context setup
  input.ts            # keyboard + pointer state snapshot per tick
  settings.ts         # shared game settings (fps target) — localStorage
  types.ts            # Vec2, shared loop/input types
```

Keep it minimal — a loop, a canvas hook, and an input snapshot. No entity system, no scene graph; each game owns its own state and render function.

### Frame rate — fixed timestep at 30 or 60 fps

Games target a consistent, user-selectable frame rate rather than the display's refresh rate:

- **Simulation** runs on a fixed timestep — `dt = 1/60` or `1/30` — via the classic accumulator pattern: `requestAnimationFrame` measures elapsed real time, the loop steps the simulation zero or more times per rAF callback until the accumulator is drained, and renders once after stepping.
- On a 120 Hz+ display at the 60 fps setting, most rAF callbacks step once and some skip (render is skipped too when no tick ran — nothing changed). At 30 fps, every other callback steps. On a slow device that can't hold the target, the accumulator is clamped (max 3–4 ticks per frame) so the game slows down rather than spiraling.
- **Why fixed timestep:** identical physics regardless of monitor refresh rate, deterministic and unit-testable update functions, and no tunneling surprises from variable `dt`.
- **User setting:** fps toggle (60 default, 30 for low-power devices) lives in the pause/settings surface of each game, stored in a shared `zuna-game-settings` localStorage key (`settings.ts`) so the choice applies across all canvas games. Switching takes effect immediately — no restart needed, since game constants are expressed per-second.

## File layout (when built)

```text
app/playground/breakout/page.tsx

components/playground/breakout/
  breakout-game.tsx      # client shell — canvas mount, HUD, overlays
  hud.tsx                # score, lives, level, active modifiers (Roguelite)
  mode-select.tsx        # Classic / Roguelite start overlay
  draft-overlay.tsx      # Roguelite pick-1-of-3 screen (Framer Motion — it's DOM, not canvas)
  results-panel.tsx

lib/breakout/
  constants.ts           # speeds, sizes, scoring, palette
  types.ts
  levels.ts              # static level layouts + seeded shuffle for Roguelite
  modifiers.ts           # modifier pool, rarity weights, apply transforms — Vitest
  rng.ts                 # seeded RNG (draft draws, level order) — Vitest
  physics.ts             # reflection, AABB collision — Vitest
  update.ts              # pure (state, input, dt) → state — Vitest
  scoring.ts             # combo + bonuses + curse multipliers — Vitest
  storage.ts             # localStorage per-mode bests (shared conventions)
```

## State shape (draft)

```ts
type BreakoutMode = "classic" | "roguelite";

type BreakoutPhase =
  | "idle"
  | "serve"
  | "playing"
  | "level-clear"
  | "draft" // roguelite only — between level-clear and next serve
  | "game-over";

type BreakoutState = {
  mode: BreakoutMode;
  phase: BreakoutPhase;
  level: number;
  score: number;
  lives: number;
  paddle: { x: number; width: number; sticky: boolean };
  balls: Ball[]; // always length 1 in classic; multiball appends
  bricks: Brick[]; // { rect, hp, points, breakable }
  volleyCount: number; // bricks broken since last paddle touch
  modifiers: ModifierId[]; // roguelite picks, in draft order
  draftOptions: ModifierId[] | null; // 3 options when phase === "draft"
  seed: number; // roguelite — drives draft draws + level shuffle
};
```

Derived run config (paddle width, ball speed, brick HP bonus, score multiplier) is computed by folding `modifiers` over base constants — never stored, so it can't drift out of sync.

React renders HUD and overlays from a snapshot; the loop mutates a ref and syncs to React state only on phase/score changes (avoid re-render per frame).

## Achievements (proposed)

Definitions in `lib/achievements/definitions.ts`; wired in `breakout-game.tsx`.

| Id                     | Trigger                               |
| ---------------------- | ------------------------------------- |
| `breakout-first-clear` | Clear level 1 (either mode)           |
| `breakout-classic`     | Clear all 5 Classic levels in one run |
| `breakout-no-miss`     | Clear a level without losing a life   |
| `breakout-combo-5`     | Break 5+ bricks in a single volley    |
| `breakout-run-deep`    | Reach level 10 in a Roguelite run     |
| `breakout-cursed`      | Win a level with 3+ active curses     |
| `breakout-high-score`  | Beat a personal best (either mode)    |

Category: **Playground** / **Breakout** in the roadmap achievement table.

## Persistence

| Data                                                            | Guest                           | Authenticated                                                                                                                                      |
| --------------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Per-mode bests (Classic score; Roguelite score + deepest level) | localStorage (shared helpers)   | Supabase bests; merge on sign-in                                                                                                                   |
| Settings (volume)                                               | Shared audio settings key       | Same                                                                                                                                               |
| Settings (fps 30/60)                                            | Shared `zuna-game-settings` key | Same — device preference, no sync needed                                                                                                           |
| Mid-run save                                                    | Not in v1                       | Not in v1 — Classic runs are short; revisit for Roguelite if deep runs prove long (state is one JSON blob, same pattern as Prompt Run `activeRun`) |

Uses the guest-localStorage conventions from roadmap priority #2 — build those helpers here if not already extracted.

## Rollout

| Step                   | Status  | Deliverable                                                                                          |
| ---------------------- | ------- | ---------------------------------------------------------------------------------------------------- |
| Spec                   | Done    | This doc                                                                                             |
| Canvas engine          | Planned | `lib/game-canvas/` fixed-timestep loop (30/60 fps setting), canvas, input — shared with Lunar Lander |
| Classic core           | Planned | Paddle, `balls[]`, bricks, lives, level 1; pure update fn + Vitest                                   |
| Levels + scoring       | Planned | 5 layouts, combo/bonuses, mode select, results panel                                                 |
| Juice                  | Planned | Particles, shake, audio, scanlines, reduced-motion path                                              |
| Roguelite mode         | Planned | Draft screen, modifier pool, seeded shuffle, curse multipliers                                       |
| Persist + achievements | Planned | Per-mode bests local + Supabase, achievement wiring                                                  |

Classic ships fully playable before the Roguelite layer lands — but the state shape (`mode`, `balls[]`, `modifiers`) is built roguelite-ready from the first commit so the second mode is additive, not a refactor.

## Open decisions

| Question                  | Lean                                                                                                  |
| ------------------------- | ----------------------------------------------------------------------------------------------------- |
| Canvas resolution         | Fixed internal resolution (e.g. 480×640) scaled to container — crisp pixels, simple math              |
| Draft pool size at ship   | ~11 modifiers above; enough for variety without balance hell — grow after playtesting                 |
| Duplicate picks           | Stackable where sensible (wide paddle ×2); uniques (sticky, piercing) drop out of the pool once taken |
| Roguelite difficulty ramp | Speed/HP ramp per loop of the 5 layouts; tune so ~level 10 is a good run                              |
| Daily-seed challenge      | Later — seeded RNG makes it cheap; pairs with the Lunar Lander daily-seed idea                        |
| Global leaderboard        | Same answer as other games — local/Supabase best first                                                |

## Related

- [lunar-lander.md](./lunar-lander.md) — flagship canvas game built on this engine
- [prompt-run.md](./prompt-run.md) — audio pattern to reuse
- [motion-and-3d.md](./motion-and-3d.md) — motion conventions (HUD/overlays only; gameplay is canvas-native)
- [product/backlog.md](../../product/backlog.md) — playground games wishlist
- [product/roadmap.md](../../product/roadmap.md) — prioritized platform work
