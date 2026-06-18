Status: `active`
Scope: `product`
Last updated: `2026-06-18` (mapbox rows)

# Feature backlog

Things the app should do or hold — **not tied to roadmap phases**. Pick items as capacity allows; update status here when something ships.

For infrastructure milestones (auth, explore, launch), see [roadmap.md](./roadmap.md).

## Playground — games

| Item                        | Status  | Route / notes                                                                          |
| --------------------------- | ------- | -------------------------------------------------------------------------------------- |
| **Type Racer**              | ✅ MVP  | `/playground/type-racer` — words 30s/60s; [spec](../improvements/active/type-racer.md) |
| Type Racer — sentence mode  | Planned | Curated one-liners                                                                     |
| Type Racer — paragraph mode | Planned | Short passages, 120s cap                                                               |
| **Art Roulette**            | Planned | `/playground/art-roulette` — game loop, scoring, shop, audio                           |
| Art Roulette — AI images    | Planned | Prompt → generated art; rate-limited API                                               |
| Additional mini-games       | Ideas   | TBD — backlog as ideas land                                                            |

## Playground — platform

| Item                          | Status  | Notes                                          |
| ----------------------------- | ------- | ---------------------------------------------- |
| Playground hub                | ✅      | `/playground` — card grid linking to each game |
| Guest progress (localStorage) | Partial | Type Racer best scores; extend per game        |
| Saved scores to Supabase      | Planned | Profile stats, optional leaderboard            |
| Shared achievements           | Planned | Cross-game; never gates portfolio content      |
| Game audio                    | Planned | Art Roulette first                             |

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

| Item                          | Status  | Notes                                                                                                                      |
| ----------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------- |
| Framer Motion foundation      | ✅      | [motion-and-3d.md](../improvements/active/motion-and-3d.md)                                                                |
| Home / Pokédex motion polish  | Partial | Hero stagger, grid, toggles                                                                                                |
| Page transitions              | Ideas   | Global or zone-scoped                                                                                                      |
| **tsParticles**               | Planned | Hero ambient field, achievement bursts, Star Wars hyperspace — [motion-and-3d.md](../improvements/active/motion-and-3d.md) |
| Three.js — hero ambient       | Ideas   | Lazy WebGL background (or defer if tsParticles covers hero)                                                                |
| Three.js — Art Roulette wheel | Ideas   | 3D drum when Roulette ships                                                                                                |

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
