Status: `active`
Scope: `playground`
Last updated: `2026-08-19`

# Asteroids — mini-game spec

A wrap-around arena shooter for the **Playground** zone, in the Asteroids lineage, with two modes: **Classic** (pure retro — ship, bullets, rocks that split) and **Roguelite** (endless waves — draft a loadout and reshape the field after every clear). Canvas rendering on the shared fixed-timestep engine at a user-selectable **30 or 60 fps** (see [Breakout — frame rate](./breakout.md#frame-rate--fixed-timestep-at-30-or-60-fps)). Guest play via localStorage; Supabase per-mode best-score sync following the shared playground patterns.

> **Sequencing:** Specced as a canvas candidate. [Lunar Lander](./lunar-lander.md) is still the roadmap's next canvas game; which of the two ships first is **undecided**. Both reuse `lib/game-canvas/` from [Breakout](./breakout.md). This game is the closer cousin to the lander on **controls** (rotate + thrust) and to Breakout on **Roguelite drafts**.

## Why this game

- Build-crafting on canvas — a different skill signal from Breakout's paddle modifiers and Lunar Lander's one-shot physics puzzle. Visitors leave with a _gun they made_, not just a score.
- Stress-tests the shared loop with many entities (rocks, shots, seekers, delayed fuses, blasts) while keeping update logic pure and Vitest-testable.
- Reuses Breakout's draft overlay, Prompt Run rarity colors, and `PlaygroundGameShell` so the new work is the simulation, not another platform layer.

## Route

```text
/playground/asteroids
```

Linked from `/playground` hub alongside Type Racer, Prompt Run, and Breakout.

**Display name** is an open decision — **Asteroids** is the working title (same classic-name convention as Breakout / Lunar Lander).

## Modes

| Mode          | Structure                                             | Win/end condition                  | Personality                                      |
| ------------- | ----------------------------------------------------- | ---------------------------------- | ------------------------------------------------ |
| **Classic**   | Finite waves, fixed difficulty ramp, standard bullets | Clear wave 8 or lose all lives     | Pure retro — no drafts, no pickups, no fuses     |
| **Roguelite** | Endless waves; draft 1 of 3 after each clear; pickups | Lose all lives (score/depth chase) | Loadout + field curses; timed multi-shot choices |

Both modes share physics, wrap, controls, and juice. The roguelite layer is additive. Per-mode best scores follow the Type Racer / Breakout convention.

## Core loop

1. **Start** — mode select (Classic / Roguelite) + rules; runs start at wave 1 (no mid-run save in v1).
2. **Play** — rotate, thrust, fire. Rocks wrap and split on death. Colliding with a rock costs a life (brief i-frames on respawn).
3. **Wave clear** — all _rocks_ gone (shooting stars that already left the screen do not block clear). Classic: short interstitial, next wave, more/faster rocks. Roguelite: **draft screen** — pick 1 of 3 modifiers (or skip for flat points), then next wave.
4. **Roguelite pickup** (in-wave) — breaking a rock may drop a timed multi-shot buff; collecting it opens a **short choice**: staggered vs spread (see [Timed buffs](#timed-buffs--multi-shot)).
5. **Game over** — 0 lives (either mode) or wave 8 cleared (Classic); results panel with score, per-mode best, loadout + field picks (Roguelite), retry.

## Roguelite — three-slot loadout

Drafts fold into a derived **run config**, never ad-hoc branches in `update.ts`. Think of the gun as three slots; most cards write to one slot. Classic ignores this entirely (always standard impact bullets).

| Slot         | What it is                          | v1 rule                                                                                                                    |
| ------------ | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Delivery** | How the shot flies                  | One active family: bullets (default) **or** thick bullets **or** missiles. Missiles then pick a brain: dumb **or** seeker. |
| **Payload**  | What happens when the fuse runs out | Impact (default) **or** split **or** blast. Split and blast are mutually exclusive.                                        |
| **Scale**    | How hard that payload hits          | Only offered after the matching payload: **+child count** (split) or **+radius** (blast). Stackable.                       |

Weapon boons and field curses share the **same 3-card offer** so a run can fork as “seekers into gravel” vs “dumb missiles into giants”.

After every wave clear, **3 modifiers** from a weighted pool; pick one or **skip for +250 flat points**. Rarity tiers reuse the Prompt Run / Breakout color language (common / uncommon / rare / epic).

### Delivery (boons)

| Modifier        | Rarity   | Unique | Effect                                                                                                                  |
| --------------- | -------- | ------ | ----------------------------------------------------------------------------------------------------------------------- |
| Thick bullets   | Uncommon | Yes    | Larger hitbox, slightly slower projectile. Drops missile cards from the pool.                                           |
| Dumb missiles   | Uncommon | Yes    | Fire-and-forget; faster than seekers, no turn. Drops thick-bullets and seeker from the pool.                            |
| Seeker missiles | Rare     | Yes    | Limited turn rate, lock nearest rock. Slower shot and worse fire rate than dumb. Drops thick-bullets and dumb-missiles. |

Standard bullets are the implicit default — not a card.

**Dumb vs seeker** exist so missiles are two guns, not a difficulty slider. Dumb is a skill shot (leads, shooting-star lanes). Seekers eat “surrounded by junk” and waste themselves on gravel unless the player took split/blast instead of hoping for locks.

### Payload (boons)

| Modifier   | Rarity | Unique | Effect                                                                                                                                                                                     |
| ---------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Split fuse | Rare   | Yes    | After a delay, the shot becomes **N child projectiles** (v1: 3) in a small cone. Children are impact-only — they do not split again. Drops blast-fuse from the pool. Unlocks Cluster size. |
| Blast fuse | Rare   | Yes    | After a delay, the shot **detonates** in a radius even if it never hit. Drops split-fuse. Unlocks Blast radius.                                                                            |

Default payload is **impact** (die on collision, no fuse). Fuses tick in flight; a split/blast that hits a rock before the fuse expires still delivers its payload at the impact point (split: children spawn there; blast: detonates there) so the card is never strictly worse than impact.

Child shots and blast sparks do **not** wrap into a second generation of fuses.

### Scale (boons — gated)

| Modifier     | Rarity   | Unique | Requires   | Effect                                            |
| ------------ | -------- | ------ | ---------- | ------------------------------------------------- |
| Cluster size | Uncommon | No     | Split fuse | +2 child projectiles per split (cap in constants) |
| Blast radius | Uncommon | No     | Blast fuse | +30% explosion radius (cap in constants)          |

### Ship (boons)

Small pool so not every card is a gun. Stackable where noted.

| Modifier   | Rarity   | Unique | Effect                                   |
| ---------- | -------- | ------ | ---------------------------------------- |
| Rapid fire | Common   | No     | +15% fire rate (cap)                     |
| Thrusters  | Common   | No     | +15% thrust                              |
| Extra life | Uncommon | No     | +1 life immediately (not derived config) |

### Field curses (risk / reward)

Each adds a **permanent score multiplier**. These change _what the arena is_, not how the gun shoots.

| Modifier       | Rarity   | Unique | Effect                                                             | Reward          |
| -------------- | -------- | ------ | ------------------------------------------------------------------ | --------------- |
| Swarm          | Uncommon | No     | More rocks per wave                                                | +25% score mult |
| Giants         | Uncommon | No     | Fewer rocks, larger, more HP                                       | +25% score mult |
| Gravel         | Rare     | No     | Size bias toward small pieces (harder to hit; seekers waste locks) | +30% score mult |
| Shooting stars | Epic     | Yes    | Fast, straight, **cross-screen** extras spawn during the wave      | +50% score mult |

**Shooting stars** are a new species, not a rock reskin:

- Do **not** wrap and do **not** split.
- Telegraph a lane (brief line or edge glint), then race through and despawn off the opposite edge.
- Collision kills the ship like a rock; destroying one is high points.
- Wave-clear ignores stars that have already left. Stars still on-screen are optional bonus targets, not blockers.

### Design & implementation notes

- **Modifiers are data** — `{ id, rarity, kind, unique, requires?, exclusiveGroup?, apply }`. `apply` is a pure transform on derived run config (delivery, payload, childCount, blastRadius, fireRate, thrust, scoreMult, rockCountMult, rockSizeBias, starSpawns) plus flags checked in `update.ts`. Same pattern as `lib/breakout/modifiers.ts`.
- **Exclusive groups** — `delivery` (thick | dumb | seeker) and `payload` (split | blast). Drawing a card from a group removes the siblings from the pool for the rest of the run.
- **Gating** — scale cards stay out of `drawDraftOptions` until `requires` is in `modifiers`.
- **Seeded RNG** for draft draws, wave composition, and star lanes — reproducible in tests; leaves a daily-seed door open (same idea as Breakout / Lunar Lander).
- **Projectiles are an array from day one** — Classic always has simple bullets; Roguelite appends children, seekers, and blast volumes without a state-shape refactor.
- Timed multi-shot is a **pickup**, not a draft card. Drafts are permanent; pickups are the short-term spice.

## Timed buffs — multi-shot

Roguelite only. Chance to drop on rock-break (tune drop rate in playtesting).

On pickup, **pause the sim** and offer two buttons (DOM overlay, like the draft screen):

| Choice        | Pattern                                      | Reads as          |
| ------------- | -------------------------------------------- | ----------------- |
| **Staggered** | Extra shots back-to-back on the same heading | Chain / follow-up |
| **Spread**    | Extra shots side-by-side (horizontal fan)    | Wall / coverage   |

Duration ~8–12 seconds; extra projectile count is a constant (v1: +2, so 3 shots per trigger). Formation applies on top of the current loadout: staggered splits become a chain of clusters; spread blasts become a wall of delayed detonations.

If the buff expires mid-choice, default to **staggered** (safer, less screen-filling). One pending choice at a time; a second pickup while the buff is active **refreshes duration** and does not re-open the picker.

Classic has no pickups.

## Physics & mechanics

| Mechanic        | Rule                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------- |
| World           | Axis-aligned rectangle; **wrap** for ship, rocks, and projectiles                              |
| Ship motion     | Rotate at fixed angular speed while held; thrust along nose; drag so you can stop              |
| Fire            | Cooldown from derived fire rate; spawn projectile at nose with muzzle velocity                 |
| Rocks           | Large → medium → small on death; each fragment inherits a kick of parent velocity              |
| Shooting stars  | Constant high velocity, no wrap, no split; spawn from a telegraphed edge                       |
| Collisions      | Circle vs circle (ship, rocks, stars, bullets). Blasts are a radius query at detonation.       |
| Seekers         | Steer toward nearest rock (not stars, not fragments smaller than a floor) with a max turn rate |
| Fuses           | Countdown in seconds; on 0, split or detonate; on hit-before-0, trigger at impact point        |
| Lives           | 3 per run; hit → lose life, respawn center with i-frames                                       |
| Tunneling guard | Substep when per-tick travel exceeds the smallest collision radius (30 fps / seekers / stars)  |

No gravity. Stylized inertia, not n-body. All constants in units/second so 30 and 60 fps feel identical.

All physics lives in **pure functions** — `(state, input, dt) → state` with a **fixed `dt`** from the shared loop.

### Shared input (needed for this game and Lunar Lander)

`lib/game-canvas` `GameInput` is currently Breakout-shaped (`left` / `right` / `pointerX` / `primaryPressed`). Asteroids needs **rotate + thrust + fire** held independently. Extend the snapshot (additive fields, Breakout keeps using what it uses) before this game or the lander ships:

```ts
type GameInput = {
  left: boolean;
  right: boolean;
  up: boolean; // thrust
  primaryPressed: boolean; // edge — pause / confirm
  fireHeld: boolean; // Space / click held
  pointerX: number | null;
};
```

## Waves

- Wave N spawns a **rock budget** (count × size mix) from constants, scaled by field curses.
- Classic: 8 hand-tuned waves, then win.
- Roguelite: same budget curve continues past 8 with a soft cap; curses multiply on top.
- Shooting stars are extra spawns during the wave, not part of the clear budget.

## Scoring

```text
Rock points      = base by size (large > medium > small? or invert — small worth more because they are harder)
                  lean: large 20 / medium 50 / small 100 (classic Asteroids-ish)
Star points      = 250
Wave clear       = +500 × wave number
Lives bonus      = +250 per remaining life at game end (Classic)
Curse mult       = product of active field-curse multipliers, applied to rock + star + clear points (Roguelite)
Draft skip       = +250 flat when skipping a draft pick (Roguelite)
```

**Per-mode bests** (Classic best score; Roguelite best score + deepest wave) — localStorage for guests, Supabase bests for signed-in users, merge on sign-in.

## Controls

| Input              | Action                |
| ------------------ | --------------------- |
| ← → / A D          | Rotate                |
| ↑ / W              | Thrust (hold)         |
| Space / click      | Fire (hold to repeat) |
| Esc / pause button | Pause                 |
| R (on results)     | Retry                 |

Auto-pause when the tab loses visibility or the canvas loses focus.

### Mobile

Same simultaneous-input problem as Lunar Lander: rotate-left, rotate-right, thrust, and fire. v1: on-screen zones (left / right rotate, thrust, fire) with multi-touch. Desktop-first is acceptable; the game must still be playable on touch. Shared touch-control ideas with the lander if that game ships first (or this one does).

## Retro aesthetic & juice

- Vector-ish ship and rocks (polyline outlines), limited palette that respects light/dark theme. Not a CRT clone of Breakout — this one should read as **line art in space**.
- Muzzle flash, split burst, blast ring, star telegraph, death shards — canvas-native particles in the game loop (same approach as Breakout).
- Audio via the Web Audio pattern from Prompt Run / Breakout — fire, rock split, blast, star whoosh, life lost, wave clear. Mute/volume respects shared audio settings.
- **Reduced motion** — no shake, no particles, no telegraph flicker; telegraphs remain a static lane mark; state changes stay instant and legible.

## File layout (when built)

```text
app/playground/asteroids/page.tsx

components/playground/asteroids/
  asteroids-game.tsx     # client shell — canvas mount, HUD, overlays
  hud.tsx                # score, lives, wave, loadout chips (Roguelite)
  mode-select.tsx
  draft-overlay.tsx      # pick-1-of-3 (DOM / Framer Motion) — same UX as Breakout
  buff-choice.tsx        # staggered vs spread on pickup
  touch-controls.tsx
  results-panel.tsx

lib/asteroids/
  constants.ts           # speeds, sizes, fuse times, scoring, palette
  types.ts
  modifiers.ts           # pool, exclusive groups, gating, deriveRunConfig — Vitest
  rng.ts                 # seeded RNG — Vitest
  physics.ts             # wrap, circles, seeker steer, blast query — Vitest
  projectiles.ts         # spawn, fuse, split, blast — Vitest
  waves.ts               # rock budget, star lanes — Vitest
  update.ts              # pure (state, input, dt) → state — Vitest
  scoring.ts             # — Vitest
  storage.ts             # localStorage per-mode bests (shared conventions)
```

Reuses `lib/game-canvas/` (loop, canvas, input — with the input extension above). Do not invent a second engine.

## State shape (draft)

```ts
type AsteroidsMode = "classic" | "roguelite";

type AsteroidsPhase =
  | "idle"
  | "playing"
  | "wave-clear"
  | "draft" // roguelite only
  | "buff-choice" // roguelite only — sim paused
  | "game-over";

type Delivery = "bullet" | "thick" | "dumb-missile" | "seeker";
type Payload = "impact" | "split" | "blast";
type Formation = "staggered" | "spread";

type AsteroidsState = {
  mode: AsteroidsMode;
  phase: AsteroidsPhase;
  wave: number;
  score: number;
  lives: number;
  ship: {
    pos: Vec2;
    vel: Vec2;
    angle: number;
    cooldown: number;
    iFrames: number;
  };
  rocks: Rock[]; // wrapping, splitting
  stars: Star[]; // no wrap, no split
  projectiles: Projectile[];
  blasts: Blast[]; // radius + ttl, for render + damage window
  pickups: Pickup[];
  multiShot: { remaining: number; formation: Formation } | null;
  modifiers: AsteroidsModifierId[];
  draftOptions: AsteroidsModifierId[] | null;
  seed: number;
  rngState: number;
};
```

Derived run config (delivery, payload, childCount, blastRadius, fireRate, thrust, scoreMult, rock budget, star flag) is computed by folding `modifiers` over base constants — never stored.

React renders HUD and overlays from a snapshot; the loop mutates a ref and syncs to React only on phase/score/HUD ticks.

## Achievements (proposed)

Definitions in `lib/achievements/definitions.ts`; wired in `asteroids-game.tsx`.

| Id                     | Trigger                                  |
| ---------------------- | ---------------------------------------- |
| `asteroids-first-wave` | Clear wave 1 (either mode)               |
| `asteroids-classic`    | Clear all 8 Classic waves in one run     |
| `asteroids-star-shot`  | Destroy a shooting star                  |
| `asteroids-cluster`    | Break a rock with a split child          |
| `asteroids-blast`      | Break a rock with a blast                |
| `asteroids-cursed`     | Clear a wave with 3+ active field curses |
| `asteroids-run-deep`   | Reach wave 10 in a Roguelite run         |
| `asteroids-high-score` | Beat a personal best (either mode)       |

Category: **Playground** / **Asteroids** in the roadmap achievement table.

## Persistence

| Data                                                           | Guest                           | Authenticated                                      |
| -------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| Per-mode bests (Classic score; Roguelite score + deepest wave) | localStorage (`zuna-asteroids`) | Supabase `asteroids_best_scores`; merge on sign-in |
| Settings (volume)                                              | Shared audio settings key       | Same                                               |
| Settings (fps 30/60)                                           | Shared `zuna-game-settings` key | Same — device preference, no sync                  |
| Mid-run save                                                   | Not in v1                       | Not in v1                                          |

Table shape can mirror `breakout_best_scores` (`user_id`, `mode`, `score`, `level`/`wave`, unique on `user_id + mode`).

## Rollout

| Step                    | Status  | Deliverable                                                               |
| ----------------------- | ------- | ------------------------------------------------------------------------- |
| Spec                    | Done    | This doc                                                                  |
| Input extension         | Planned | `GameInput` + `useGameInput` gain `up` / `fireHeld` (shared with Lander)  |
| Classic core            | Planned | Wrap, ship, bullets, splitting rocks, lives, wave 1; pure update + Vitest |
| Classic waves + scoring | Planned | 8 waves, mode select, results                                             |
| Juice                   | Planned | Particles, audio, telegraphs, reduced-motion path                         |
| Roguelite loadout       | Planned | Draft screen, delivery/payload/scale, exclusive groups + gating           |
| Field curses + stars    | Planned | Swarm / giants / gravel / shooting stars                                  |
| Timed multi-shot        | Planned | Pickup drop, staggered vs spread overlay                                  |
| Persist + achievements  | Planned | Per-mode bests local + Supabase, achievement wiring                       |

Classic ships fully playable before the Roguelite layer — but the state shape (`projectiles[]`, `modifiers`, `delivery`/`payload` on derived config) is loadout-ready from the first commit.

**Do not start implementation** until this game is chosen over (or sequenced after) Lunar Lander on the [roadmap](../../product/roadmap.md).

## Open decisions

| Question                   | Lean                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| Display name               | **Asteroids** for now; rename if we want something more original                                  |
| Sequencing vs Lunar Lander | Undecided — Lander is still "up next" on the roadmap until you pick                               |
| Canvas resolution          | Fixed internal landscape (e.g. 640×480) scaled to container                                       |
| Friendly fire (own blast)  | No in v1 — portfolio visitors should not suicide on a long fuse                                   |
| Seeker target              | Nearest rock above a size floor; never stars (stars are too fast; dumb missiles are the star gun) |
| Fuse length                | One constant per payload in v1; shorter/longer fuse cards later (same gating pattern as scale)    |
| Split + blast combo card   | Not in v1 — a later epic that lets children detonate                                              |
| Buff-choice UX             | Pause-on-pickup (clear). Alternative: two pickup types, or a run-wide bind                        |
| Duplicate scale picks      | Stack up to a cap; delivery/payload stay unique                                                   |
| UFOs / hyperspace          | Not in v1                                                                                         |
| Daily-seed challenge       | Later — seeded RNG makes it cheap                                                                 |
| Global leaderboard         | Same as other games — local/Supabase best first                                                   |

## Related

- [breakout.md](./breakout.md) — shared canvas engine, draft overlay, modifier-as-data pattern
- [lunar-lander.md](./lunar-lander.md) — rotate + thrust; sequencing still open
- [prompt-run.md](./prompt-run.md) — rarity colors, audio pattern
- [motion-and-3d.md](./motion-and-3d.md) — HUD/overlays only; gameplay is canvas-native
- [product/backlog.md](../../product/backlog.md) — playground games wishlist
- [product/roadmap.md](../../product/roadmap.md) — prioritized platform work
