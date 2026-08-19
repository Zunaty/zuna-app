Status: `active`
Scope: `playground`
Last updated: `2026-07-08`

# Lunar Lander — mini-game spec

A three-phase Earth-to-Moon mission for the **Playground** zone: launch from Earth, escape into a coast phase, flip the ship, and soft-land on the Moon with whatever fuel is left. Canvas rendering on the shared fixed-timestep engine at a user-selectable **30 or 60 fps** (see [Breakout — frame rate](./breakout.md#frame-rate--fixed-timestep-at-30-or-60-fps)). Guest play via localStorage; Supabase bests per the shared playground patterns.

> **Sequencing:** Ships **after** [Breakout](./breakout.md), which builds and validates the shared canvas engine (`lib/game-canvas/`). This is the flagship canvas game — more physics, more phases, more polish.

## Why this game

- Deepest physics showcase on the site: thrust vs gravity, rotation, fuel-as-mass, landing thresholds — all pure, Vitest-testable functions.
- The **one fuel tank across three phases** design ties the run together: fuel wasted on ascent is fuel missing on descent. Original twist on a classic — memorable for visitors.
- Natural home for the planned particle work (thruster exhaust, touchdown dust) and a strong `prefers-reduced-motion` story for the accessibility audit.

## Route

```text
/playground/lunar-lander
```

Linked from `/playground` hub.

## Mission phases

One continuous vertical world — launchpad at the bottom, Moon at the top — rendered as a camera that follows the ship. **Stylized physics, not orbital mechanics**: gravity is a simple function of altitude with a crossover point, and the "flip" is a player action, not a simulation of orbital insertion.

```text
countdown → ascent → coast → descent → landed | crashed
```

### 1. Ascent (Earth)

- Ship starts on the pad, nose up. Hold thrust to climb against Earth gravity.
- Earth gravity is strong near the surface and falls off with altitude (simple falloff curve — tuned for feel, not realism).
- Light horizontal drift control via rotation; the main skill is **throttle discipline** — burning too long here starves the descent.
- Reaching **escape altitude** transitions to coast.

### 2. Coast + flip (the memorable moment)

- Engines optional; momentum carries the ship. Earth shrinks behind, Moon grows ahead (camera + parallax sell it).
- Somewhere mid-corridor is the **gravity crossover**: Earth pull fades to zero, Moon pull ramps in (opposite direction).
- The player must **rotate 180°** so the engine faces the Moon before descent — flipping late means burning fuel just to recover.
- Minor drift correction; a mostly calm phase between two tense ones. HUD hints the flip once Moon gravity takes over.

### 3. Descent (Moon)

- Classic lander tension: Moon gravity (weaker than Earth's, constant near surface) accelerates the ship toward terrain; kill velocity with remaining fuel.
- Terrain has flat **landing pads** (score multipliers on smaller pads) amid uneven ground.
- **Touchdown check** at contact: vertical speed, horizontal speed, tilt, and on-pad — all under threshold = landed; otherwise crashed.

| Touchdown threshold | v1 value (tune in playtesting) |
| ------------------- | ------------------------------ |
| Vertical speed      | ≤ 5 m/s soft · ≤ 8 m/s hard    |
| Horizontal speed    | ≤ 3 m/s                        |
| Tilt from vertical  | ≤ 10°                          |
| Surface             | On a landing pad               |

## Physics model (stylized)

```text
gravity(altitude)  = earthG · falloff(alt)  −  moonG · rampIn(alt)   # signed toward each body
thrust             = direction(shipAngle) · thrustPower              # only while burning and fuel > 0
mass               = dryMass + fuelMass                              # thrust acceleration grows as fuel burns
fuelBurn           = burnRate · dt while thrusting
```

- Integration: semi-implicit Euler on the shared **fixed timestep** (`dt = 1/60` or `1/30` per the fps setting) — deterministic, identical feel at either rate since all constants are per-second.
- Rotation: fixed angular speed while holding rotate keys; no angular momentum in v1 (keeps controls approachable).
- All of it in pure functions — `lib/lunar-lander/physics.ts` under Vitest: gravity crossover, touchdown classification, fuel/mass math.

## Scoring

```text
Landing softness  = points scale by touchdown speed under threshold (softer = more)
Fuel bonus        = remaining fuel % × multiplier
Pad multiplier    = ×1 large pad · ×2 small pad
Mission time      = small bonus under par time
Crash             = 0 points; crash-site distance shown for fun
```

Bests stored per shared pattern (localStorage guest / Supabase auth / merge on sign-in): **best score**, **softest landing (m/s)**, **most fuel remaining (%)**.

## Controls

| Input              | Action              |
| ------------------ | ------------------- |
| ↑ / W / Space      | Thrust (hold)       |
| ← → / A D          | Rotate left / right |
| Esc / pause button | Pause               |
| R (on results)     | Retry               |

### Mobile — explicit design problem

Lander needs rotate-left, rotate-right, and thrust **simultaneously**. v1 answer: three fixed on-screen touch zones — left third = rotate left, right third = rotate right, bottom-center button = thrust — with multi-touch support and generous hit areas. Tilt controls considered and rejected for v1 (permission prompts, calibration). Revisit after playtesting; desktop-first is acceptable but the game must be playable on touch.

## HUD & feedback

| Element      | Notes                                                             |
| ------------ | ----------------------------------------------------------------- |
| Fuel gauge   | The star of the HUD — always visible, color shifts as it drains   |
| Velocity     | Vertical + horizontal m/s; turns green when inside landing limits |
| Altitude     | Distance to surface (descent) / to escape (ascent)                |
| Attitude     | Small ship-angle indicator; flip prompt during coast              |
| Phase banner | Ascent / Coast / Descent transitions                              |

## Visuals & juice

- Vertical parallax: pad and Earth surface below, starfield corridor, Moon terrain above; Earth shrinks / Moon grows through coast.
- Thruster exhaust as canvas-native particles (in-loop, same approach as Breakout); touchdown dust puff; crash debris.
- Subtle screen shake on thrust and crash.
- Audio via the shared Web Audio pattern — thruster rumble (looped while burning), warning beep near limits, touchdown chime, crash.
- **Reduced motion** — no shake, no particle systems, static starfield; ship, HUD, and terrain remain fully functional. This game is the flagship reduced-motion test case for the accessibility audit.

## File layout (when built)

```text
app/playground/lunar-lander/page.tsx

components/playground/lunar-lander/
  lander-game.tsx        # client shell — canvas mount, HUD, overlays
  hud.tsx                # fuel, velocity, altitude, attitude
  touch-controls.tsx     # mobile zones
  start-overlay.tsx
  results-panel.tsx      # landed/crashed, score breakdown, bests

lib/lunar-lander/
  constants.ts           # gravity curves, thrust, fuel, thresholds, scoring
  types.ts
  physics.ts             # gravity crossover, integration, touchdown check — Vitest
  update.ts              # pure (state, input, dt) → state — Vitest
  scoring.ts             # softness/fuel/pad/time — Vitest
  terrain.ts             # Moon surface + pad generation (seeded)
  storage.ts             # localStorage bests (shared conventions)
```

Reuses `lib/game-canvas/` (loop, canvas, input) built for Breakout.

## State shape (draft)

```ts
type LanderPhase = "idle" | "countdown" | "ascent" | "coast" | "descent" | "landed" | "crashed";

type LanderState = {
  phase: LanderPhase;
  ship: {
    pos: Vec2;
    vel: Vec2;
    angle: number; // radians from vertical
    fuel: number; // 0–100
    thrusting: boolean;
  };
  terrain: TerrainSegment[]; // includes pad flags + multipliers
  missionTime: number;
  result?: TouchdownResult; // speeds, tilt, pad, score breakdown
};
```

Same render strategy as Breakout: loop mutates a ref; React re-renders only on phase changes and HUD ticks (throttled).

## Achievements (proposed)

| Id                     | Trigger                                         |
| ---------------------- | ----------------------------------------------- |
| `lander-first-landing` | First successful landing                        |
| `lander-first-try`     | Land on the very first mission (no crashes yet) |
| `lander-feather`       | Touch down under 2 m/s vertical                 |
| `lander-fumes`         | Land with less than 5% fuel remaining           |
| `lander-small-pad`     | Land on a ×2 pad                                |
| `lander-lithobrake`    | Secret — crash at maximum velocity              |

Category: **Playground** / **Lunar Lander** in the roadmap achievement table.

## Persistence

| Data                             | Guest                           | Authenticated                            |
| -------------------------------- | ------------------------------- | ---------------------------------------- |
| Best score / softest / most fuel | localStorage                    | Supabase bests; merge on sign-in         |
| Settings (volume)                | Shared key                      | Same                                     |
| Settings (fps 30/60)             | Shared `zuna-game-settings` key | Same — device preference, no sync needed |
| Mid-mission save                 | No — missions are ~1–2 min      | No                                       |

## Rollout

| Step                   | Status  | Deliverable                                                     |
| ---------------------- | ------- | --------------------------------------------------------------- |
| Spec                   | Done    | This doc                                                        |
| Descent-only MVP       | Planned | Classic lander on Moon terrain — physics, touchdown, HUD, retry |
| Full mission           | Planned | Ascent + coast + gravity crossover + camera/parallax            |
| Mobile controls        | Planned | Touch zones, multi-touch                                        |
| Juice                  | Planned | Particles, audio, shake, reduced-motion path                    |
| Persist + achievements | Planned | Bests local + Supabase, achievement wiring                      |

**Descent-first build order** de-risks the hardest tuning (touchdown feel) and yields a playable classic lander early; ascent and coast layer on top of proven physics.

## Open decisions

| Question                        | Lean                                                                                           |
| ------------------------------- | ---------------------------------------------------------------------------------------------- |
| Difficulty levels               | One tuning in v1; "hard mode" (less fuel, smaller pads) later                                  |
| Terrain: fixed vs seeded random | Seeded random with a daily seed — replayable, and enables a shared daily challenge later       |
| Fuel for rotation               | No — rotation is free; only thrust burns fuel (approachable)                                   |
| Wind / drift during descent     | No in v1 — keep the physics story clean                                                        |
| Three.js version                | Not for this game — 2D canvas reads better and ships faster; R3F stays a separate backlog idea |

## Related

- [breakout.md](./breakout.md) — builds the shared canvas engine first
- [asteroids.md](./asteroids.md) — rotate + thrust cousin; sequencing vs this game is still open
- [prompt-run.md](./prompt-run.md) — audio pattern to reuse
- [motion-and-3d.md](./motion-and-3d.md) — particles/motion conventions (HUD/overlays only; gameplay is canvas-native)
- [product/backlog.md](../../product/backlog.md) — playground games wishlist
- [product/roadmap.md](../../product/roadmap.md) — prioritized platform work
