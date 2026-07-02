Status: `active`
Scope: `product`
Last updated: `2026-06-29`

# Feature backlog

Things the app should do or hold — **not tied to roadmap phases**. Pick items as capacity allows; update status here when something ships.

For infrastructure milestones (auth, explore, launch), see [roadmap.md](./roadmap.md).

## Playground — games

| Item                        | Status | Route / notes                                                                                                  |
| --------------------------- | ------ | -------------------------------------------------------------------------------------------------------------- |
| **Type Racer**              | ✅     | `/playground/type-racer` — words, sentence, paragraph; [spec](../improvements/active/type-racer.md)            |
| Type Racer — words polish   | ✅     | Live stats, timer on first key, motion, shortcuts; [spec](../improvements/archive/2026/type-racer-polish.md)   |
| Type Racer — sentence mode  | ✅     | Curated one-liners                                                                                             |
| Type Racer — paragraph mode | ✅     | Short passages, 120s cap                                                                                       |
| **Prompt Run**              | ✅     | `/playground/prompt-run` — rounds, shop, generate, motion, audio; [spec](../improvements/active/prompt-run.md) |
| Prompt Run — AI images      | ✅     | [FLUX.2 Turbo](https://fal.ai/models/fal-ai/flux-2/turbo) @ $0.008/MP; env-gated, rate-limited                 |
| Prompt Run — run archive    | Ideas  | Completed-run history on start screen (localStorage); guest persist otherwise shipped                          |
| Additional mini-games       | Ideas  | TBD — backlog as ideas land                                                                                    |

## Playground — platform

| Item                          | Status  | Notes                                                                      |
| ----------------------------- | ------- | -------------------------------------------------------------------------- |
| Playground hub                | ✅      | `/playground` — card grid linking to each game                             |
| Guest progress (localStorage) | Partial | Type Racer best scores; Prompt Run settings, active run resume, best score |
| Saved scores to Supabase      | Partial | Type Racer per-mode bests + Prompt Run best run; merge on sign-in          |
| Shared achievements           | ✅      | Guest unlocks in localStorage; merge + `user_achievements` sync on sign-in |
| Game audio                    | ✅      | Prompt Run rarity sounds + mute/volume settings                            |

## Explore

| Item                                         | Status | Notes                                                                                          |
| -------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Pokédex — list, detail, filters              | ✅     | PokéAPI                                                                                        |
| Pokédex — collection (favorite, caught, TCG) | ✅     | Guest favorites + auth sync                                                                    |
| Star Wars browse                             | ✅     | SWAPI                                                                                          |
| Explore polish / motion                      | ✅     | Page enter, grid stagger, toggles on explore routes                                            |
| **Geocoding fly-to**                         | ✅     | `/explore/geo` — Mapbox Geocoding search + map; [spec](../improvements/archive/2026/mapbox.md) |

## Lab

| Item    | Status  | Notes                                 |
| ------- | ------- | ------------------------------------- |
| AI chat | Planned | `/chat` — streaming UI + server route |

## Portfolio

| Item                                                | Status  | Notes                                                                              |
| --------------------------------------------------- | ------- | ---------------------------------------------------------------------------------- |
| Core pages (home, about, projects, resume, contact) | ✅      |                                                                                    |
| Project case studies                                | Ideas   | Deeper per-project pages if desired                                                |
| OG / SEO pass                                       | Partial | Root `opengraph-image.tsx` + per-route metadata; no per-route OG images yet        |
| **Aviation flight map**                             | ✅      | `/about` — KSLC hub, curved routes; [spec](../improvements/archive/2026/mapbox.md) |

## Motion & 3D

| Item                         | Status  | Notes                                                                                                                      |
| ---------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framer Motion foundation     | ✅      | [motion-and-3d.md](../improvements/active/motion-and-3d.md)                                                                |
| Home / Pokédex motion polish | Partial | Hero stagger, grid, toggles                                                                                                |
| Page transitions             | Ideas   | Global or zone-scoped                                                                                                      |
| **tsParticles**              | Planned | Hero ambient field, achievement bursts, Star Wars hyperspace — [motion-and-3d.md](../improvements/active/motion-and-3d.md) |
| Three.js — hero ambient      | Ideas   | Lazy WebGL background (or defer if tsParticles covers hero)                                                                |
| Three.js — Prompt Run scene  | Ideas   | Optional 3D category stage when game ships                                                                                 |

## Account & meta

| Item                         | Status | Notes                                                                                                     |
| ---------------------------- | ------ | --------------------------------------------------------------------------------------------------------- |
| Auth + profiles              | ✅     | Supabase                                                                                                  |
| Achievement definitions + UI | ✅     | `lib/achievements/` catalog, unlock toasts, `/profile` stats + grid                                       |
| Portfolio explorer unlocks   | ✅     | Page visits (About/Projects/Resume/Contact), grand tour, skills filter + shuffle                          |
| Explore-zone achievements    | ✅     | Pokédex favorite/catch/collector + geo fly-to, field trip combo (Star Wars skipped — zone may be removed) |
| Return visits / streaks      | Ideas  | Meta achievements                                                                                         |

## Launch polish

| Item                | Status  | Notes                                   |
| ------------------- | ------- | --------------------------------------- |
| Performance audit   | Planned | Lighthouse on key routes                |
| Accessibility audit | Planned | Keyboard, contrast, reduced motion      |
| Custom domain       | Planned |                                         |
| Analytics review    | Partial | Vercel Analytics + Speed Insights wired |

## How to use this doc

- **Status:** ✅ shipped · 🚧 in progress · Planned · Ideas
- Add rows freely; no need to assign a phase.
- When a spec in `docs/improvements/active/` ships, move it to `archive/` and mark the row ✅ here.
- Roadmap phases stay for **sequenced platform work**; this list is the **product wishlist**.
