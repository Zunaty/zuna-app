Status: `active`
Scope: `product`
Last updated: `2026-06-22` (prompt run rename)

# Feature backlog

Things the app should do or hold — **not tied to roadmap phases**. Pick items as capacity allows; update status here when something ships.

For infrastructure milestones (auth, explore, launch), see [roadmap.md](./roadmap.md).

## Playground — games

| Item                        | Status  | Route / notes                                                                                            |
| --------------------------- | ------- | -------------------------------------------------------------------------------------------------------- |
| **Type Racer**              | ✅      | `/playground/type-racer` — words, sentence, paragraph; [spec](../improvements/active/type-racer.md)      |
| Type Racer — words polish   | ✅      | Live stats, timer on first key, motion, shortcuts; [spec](../improvements/active/type-racer-polish.md)   |
| Type Racer — sentence mode  | ✅      | Curated one-liners                                                                                       |
| Type Racer — paragraph mode | ✅      | Short passages, 120s cap                                                                                 |
| **Prompt Run**              | 🚧      | `/playground/prompt-run` — round loop MVP; shop + AI later; [spec](../improvements/active/prompt-run.md) |
| Prompt Run — AI images      | Planned | [FLUX.2 Turbo](https://fal.ai/models/fal-ai/flux-2/turbo) @ $0.008/MP; env-gated, rate-limited           |
| Additional mini-games       | Ideas   | TBD — backlog as ideas land                                                                              |

## Playground — platform

| Item                          | Status  | Notes                                                      |
| ----------------------------- | ------- | ---------------------------------------------------------- |
| Playground hub                | ✅      | `/playground` — card grid linking to each game             |
| Guest progress (localStorage) | Partial | Type Racer best scores; Prompt Run active run + best score |
| Saved scores to Supabase      | Planned | Profile stats, optional leaderboard                        |
| Shared achievements           | Planned | Cross-game; never gates portfolio content                  |
| Game audio                    | Planned | Prompt Run first                                           |

## Explore

| Item                                         | Status  | Notes                                                                                    |
| -------------------------------------------- | ------- | ---------------------------------------------------------------------------------------- |
| Pokédex — list, detail, filters              | ✅      | PokéAPI                                                                                  |
| Pokédex — collection (favorite, caught, TCG) | ✅      | Guest favorites + auth sync                                                              |
| Star Wars browse                             | ✅      | SWAPI                                                                                    |
| Explore polish / motion                      | ✅      | Page enter, grid stagger, toggles on explore routes                                      |
| **Geocoding fly-to**                         | Planned | `/explore/geo` — Mapbox Geocoding search + map; [spec](../improvements/active/mapbox.md) |

## Lab

| Item    | Status  | Notes                                 |
| ------- | ------- | ------------------------------------- |
| AI chat | Planned | `/chat` — streaming UI + server route |

## Portfolio

| Item                                                | Status  | Notes                                                                                                             |
| --------------------------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------- |
| Core pages (home, about, projects, resume, contact) | ✅      |                                                                                                                   |
| Project case studies                                | Ideas   | Deeper per-project pages if desired                                                                               |
| OG / SEO pass                                       | Partial | Metadata on main routes                                                                                           |
| **Aviation flight map**                             | Planned | `/about` — KSLC hub, curved routes to Nephi, Fillmore, St. George, etc.; [spec](../improvements/active/mapbox.md) |

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

| Item                         | Status  | Notes                    |
| ---------------------------- | ------- | ------------------------ |
| Auth + profiles              | ✅      | Supabase                 |
| Achievement definitions + UI | Planned | Optional meta-game layer |
| Return visits / streaks      | Ideas   | Meta achievements        |

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
