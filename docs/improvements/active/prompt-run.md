Status: `active`
Scope: `playground`
Last updated: `2026-06-22`

# Prompt Run — mini-game spec

A roguelike prompt-building game for the **Playground** zone. Draft through prompt categories across a run, chase rarity and streak bonuses, spend points in a mid-run shop, then generate AI artwork from the assembled prompt. Guest play via localStorage; optional Supabase sync later.

> **Naming:** Portfolio title is **Prompt Run** (run-based roguelike). The reference game in Art Hero is still called _Art Roulette_ — do not rename anything in the `art-hero` repo.

## Reference implementation

The game design and mechanics originate in **Art Hero** (private work repo: `art-hero`). That product’s _Art Roulette_ mode includes full creative-platform integrations (multi-model picker, LoRAs, image gallery, e-commerce). This portfolio build **reuses the core loop** but strips platform scope and aligns with Victor Perez site conventions (shadcn, Framer Motion, Vitest reducers, guest-first).

Key Art Hero sources to port or simplify (paths unchanged in `art-hero`):

| Area                                | Art Hero path                               | Portfolio note                                                 |
| ----------------------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| Game phases & reducer               | `components/Roulette/context/reducer.ts`    | Same phase machine; Vitest coverage                            |
| Constants (rarities, shop, streaks) | `components/Roulette/utils/constants.ts`    | Start with same tuning; tweak after playtesting                |
| Types                               | `components/Roulette/utils/types.ts`        | Drop NFT / LoRA-specific fields in v1                          |
| Round UI                            | `components/Roulette/Stage.tsx`, `Card.tsx` | Reskin to portfolio theme                                      |
| Shop                                | `components/Roulette/Shop.tsx`              | Keep mechanics; simpler layout                                 |
| Generate phase                      | `components/Roulette/Generate.tsx`          | Single model; no multi-model picker                            |
| Onboarding                          | `components/Roulette/OnboardingModal.tsx`   | Reuse rules copy; portfolio modal component                    |
| Audio                               | `components/Roulette/context/Audio.tsx`     | Web Audio API rarity sounds — first playground game with audio |

## Why this game

- Showcases **game state**, scoring systems, and **AI integration** in one demo — strong portfolio piece (ties to [Art Hero project](../../../lib/data/projects.ts)).
- Natural fit for **Framer Motion** (card reveals, rarity flash, shop purchase) per [motion-and-3d.md](./motion-and-3d.md).
- Complements Type Racer (skill vs chance) in the [playground backlog](../../product/backlog.md).

## Route

```text
/playground/prompt-run
```

Linked from `/playground` hub alongside Type Racer.

## Core loop

1. **Start run** — fresh phase; optional onboarding (first visit).
2. **Round** — for each category in the sequence (descriptors → subjects → actions → styles → backgrounds → colors), pick one of three options or skip. Reroll charges refresh the current category’s options.
3. **Score** — each pick awards points by rarity; streak multipliers apply for consecutive Rare+ picks. Round bonuses for speed, Epic+ sets, or all-Legendary perfect rounds.
4. **Shop** (round 2+) — spend total score on Rare/Legendary variables or buffs (reroll charges, rarity boost). Refresh costs flat points.
5. **Generate** — assembled prompt (round variables + shop purchases) is shown; player generates image(s) or scraps the prompt for bonus points.
6. **Overview** — results, generated images, stats; continue to next round (max 7 per run) or start a new run.

### Phases

```text
fresh → round → generate → overview → round → … → run complete
```

| Phase      | Player sees                                               |
| ---------- | --------------------------------------------------------- |
| `fresh`    | Start screen, rules link                                  |
| `round`    | Category stage, timer, reroll meter, shop (when unlocked) |
| `generate` | Prompt text, generation options, Generate / Scrap         |
| `overview` | Last round score, images, history, next round CTA         |

## Prompt categories

Default sequence (customizable in settings, stored in localStorage):

```text
descriptors → subjects → actions → styles → backgrounds → colors
```

- **3 options** per category; player must complete at least **2** categories (cannot skip below that).
- **Reroll charges**: start with 3, max 5; +1 per completed round; bonus charges earned mid-round by high point thresholds.

## Rarities & scoring

| Rarity    | Point range | Roll chance |
| --------- | ----------- | ----------- |
| Common    | 10–19       | 45%         |
| Uncommon  | 20–49       | 25%         |
| Rare      | 50–99       | 15%         |
| Epic      | 100–199     | 10%         |
| Legendary | 200–300     | 5%          |

**Streak** (consecutive Rare+ picks): On Fire (3–4) +50%, Unstoppable (5–6) +100%, Legendary (7+) +150% on each pick’s base points. Common or Uncommon resets streak.

**Round bonuses** (no skipped categories):

| Bonus       | Condition                | Points |
| ----------- | ------------------------ | ------ |
| Speed       | Finish round under 30s   | +250   |
| Epic+ round | All picks Epic or higher | +400   |
| Perfect     | All Legendary            | +500   |

**Scrap** — skip generation; gain +⅓ of the round score as bonus points (breaks streak).

## Shop

- Unlocks on **round 2**.
- **3 slots** — Rare/Legendary variables and buff items (reroll packs, rarity boost).
- **Refresh**: 250 points (no cooldown on refresh).
- **Purchase**: deducts from `totalScore`; purchased variable joins the round prompt; slot cooldown 2 rounds.

## AI image generation

### Requirement

Generation must be **text-to-image**: the assembled round prompt (comma-joined variables from categories + shop) is sent as a `prompt` string with **no reference image**. Models like [FLUX.1 Kontext [pro]](https://fal.ai/models/fal-ai/flux-pro/kontext) are **ruled out** — Kontext is image-to-image / in-context editing and requires `image_url`.

Provider: **[fal.ai](https://fal.ai)** via `@fal-ai/client` on a **server route only** — never expose `FAL_KEY`.

### Model choice

**[FLUX.2 [turbo]](https://fal.ai/models/fal-ai/flux-2/turbo)** on [fal.ai](https://fal.ai) — endpoint `fal-ai/flux-2/turbo`.

|              |                                                                                        |
| ------------ | -------------------------------------------------------------------------------------- |
| **Type**     | Text-to-image — `prompt` only, no reference image                                      |
| **Cost**     | **$0.008 per megapixel** (~$0.008 for 1024×1024; scales with resolution)               |
| **Speed**    | ~6s for 1MP (8-step distilled inference)                                               |
| **Client**   | `@fal-ai/client` on server route only — never expose `FAL_KEY`                         |
| **Override** | `FAL_IMAGE_MODEL` env var (default `fal-ai/flux-2/turbo`) for A/B without code changes |

**Input highlights** (see [model page](https://fal.ai/models/fal-ai/flux-2/turbo) for full schema):

| Parameter               | v1 default                     | Notes                                        |
| ----------------------- | ------------------------------ | -------------------------------------------- |
| `prompt`                | assembled round string         | Required                                     |
| `image_size`            | `square_hd` or `landscape_4_3` | Match generate-panel aspect picker           |
| `num_images`            | `1`                            | Art Hero allowed up to 10; cap at 1 for cost |
| `guidance_scale`        | `2.5`                          | Model default                                |
| `enable_safety_checker` | `true`                         | NSFW filter on                               |
| `output_format`         | `jpeg`                         | Smaller payloads than PNG default            |
| `seed`                  | optional                       | Pass through for reproducibility             |

**Ruled out:** [FLUX.1 Kontext [pro]](https://fal.ai/models/fal-ai/flux-pro/kontext) — image-to-image; requires `image_url`.

**Alternatives** (only if Turbo quality disappoints in playtesting): FLUX.2 [pro] (~$0.03/MP), FLUX.1 [schnell] (~$0.003/MP for dev).

### Server route (draft)

```text
app/api/playground/prompt-run/generate/route.ts
```

- `POST` body: `{ prompt: string; aspectRatio?: string; seed?: number }`
- Auth: optional — rate limit by IP + session id for guests
- Env: `FAL_KEY` (required when generation enabled); `FAL_IMAGE_MODEL` (default `fal-ai/flux-2/turbo`); feature flag `PROMPT_RUN_GENERATION_ENABLED`
- Response: `{ images: { url: string; width: number; height: number }[]; seed?: number }`
- Errors: structured JSON; no stack traces to client

Example server call:

```ts
import { fal } from "@fal-ai/client";

const model = process.env.FAL_IMAGE_MODEL ?? "fal-ai/flux-2/turbo";

fal.config({ credentials: process.env.FAL_KEY });

const result = await fal.subscribe(model, {
  input: {
    prompt: assembledPrompt,
    image_size: "square_hd",
    num_images: 1,
    output_format: "jpeg",
    enable_safety_checker: true,
    // seed — optional
  },
});
```

### Rate limits & cost control

Portfolio traffic must stay predictable:

| Guard                                    | Suggested default                          |
| ---------------------------------------- | ------------------------------------------ |
| Images per generate request              | 1 (Art Hero allowed up to 10; start at 1)  |
| Generates per guest per day              | 5–10 (localStorage + server counter)       |
| Generates per authenticated user per day | 20                                         |
| Max prompt length                        | 500 chars (truncate with warning)          |
| Generation disabled without `FAL_KEY`    | Show prompt + “generation unavailable” CTA |

Log generation count server-side for cost monitoring. Phase 6 in [roadmap](../../product/roadmap.md).

### v1 scope vs Art Hero

| Art Hero                            | Portfolio v1                                           |
| ----------------------------------- | ------------------------------------------------------ |
| Multi-model dropdown                | FLUX.2 Turbo only (`FAL_IMAGE_MODEL` override)         |
| 1–10 images per request             | 1 image default                                        |
| Full image gallery / DB persistence | Session + localStorage preview; Supabase gallery later |
| LoRA subjects toggle                | Static word banks only                                 |
| Backend proxy to separate API       | Direct fal route in Next.js                            |
| React Query + toast stack           | Fetch from client hook; sonner optional                |

## UX & motion

- **Onboarding modal** — rarities, streaks, shop rules (port copy from Art Hero `OnboardingModal.tsx`).
- **Rarity colors** — common neutral, uncommon green, rare blue, epic purple, legendary orange.
- **Reduced motion** — skip card stagger; instant reveals.
- **Audio** — Web Audio rarity tones; mute + volume in localStorage ([backlog](../../product/backlog.md) lists Prompt Run first for game audio).

Framer Motion targets: card flip on reveal, shop purchase pop, generate loading pulse, overview image stagger.

## File layout (when built)

```text
app/playground/prompt-run/page.tsx
app/api/playground/prompt-run/generate/route.ts

components/playground/prompt-run/
  prompt-run-game.tsx        # client shell, phase router
  start-screen.tsx
  round-stage.tsx
  prompt-card.tsx
  shop-panel.tsx
  generate-panel.tsx
  overview-panel.tsx
  onboarding-dialog.tsx
  live-timer.tsx

lib/prompt-run/
  constants.ts               # rarities, shop, streaks — from Art Hero tuning
  types.ts
  reducer.ts                 # pure reducer — Vitest
  scoring.ts                 # streak, round bonus — Vitest
  variables/                 # static category word banks
  storage.ts                 # localStorage game + settings
  use-prompt-run.ts          # hook wiring reducer + actions
  assemble-prompt.ts         # round + shop → prompt string — Vitest
```

## State shape (draft)

```ts
type Phase = "fresh" | "round" | "generate" | "overview";

type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

type PromptRunState = {
  phase: Phase;
  totalScore: number;
  completedRounds: number;
  rerollCharges: number;
  streak: number;
  rounds: CompletedRound[];
  shop: ShopState;
  // active round fields when phase === "round"
};
```

Reducer + Vitest tests mirror [Type Racer](./type-racer.md) pattern.

## Achievements (later)

| Id                       | Trigger                       |
| ------------------------ | ----------------------------- |
| `prompt-run-first-round` | Complete first round          |
| `prompt-run-perfect`     | Perfect (all Legendary) round |
| `prompt-run-streak-7`    | Reach Legendary streak tier   |
| `prompt-run-generate`    | Generate first image          |
| `prompt-run-high-score`  | Beat personal best run score  |

Category: **Playground** / **Prompt Run** in [roadmap achievement table](../../product/roadmap.md).

## Rollout

| Step              | Status  | Deliverable                                        |
| ----------------- | ------- | -------------------------------------------------- |
| Spec              | Done    | This doc                                           |
| Game loop (no AI) | Planned | Rounds, scoring, shop, localStorage — no API       |
| Generate API      | Planned | `fal-ai/flux-2/turbo` route, env gate, rate limits |
| Polish            | Planned | Motion, audio, onboarding                          |
| Persist           | Planned | Supabase scores / image history optional           |

Build order: **game loop first** (playable without spend), then wire generation in Phase 6.

## Open decisions

| Question               | Lean                                                    |
| ---------------------- | ------------------------------------------------------- |
| Default `image_size`   | `square_hd` in UI; expose aspect picker later           |
| Images per request     | 1 for v1 (cost control)                                 |
| Variable data source   | Static JSON banks in repo (no admin UI)                 |
| Category customization | localStorage sequence editor (port from Art Hero)       |
| Guest generate limits  | Strict server rate limit; localStorage is advisory only |

## Related

- [product/backlog.md](../../product/backlog.md) — playground games wishlist
- [product/roadmap.md](../../product/roadmap.md) — Phase 6 AI features
- [type-racer.md](./type-racer.md) — sibling playground spec
- [motion-and-3d.md](./motion-and-3d.md) — Framer Motion plans
- [FLUX.2 [turbo] on fal.ai](https://fal.ai/models/fal-ai/flux-2/turbo) — chosen T2I model ($0.008/MP)
