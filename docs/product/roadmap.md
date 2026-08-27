Status: `active`
Scope: `platform`
Last updated: `2026-08-27`

# Product roadmap

Priority-ordered platform work for the portfolio site. Work top-down; reorder freely as priorities change. **Features and games** live in the [backlog](./backlog.md).

Public portfolio with an optional game-layer meta-progression system (achievements, points, return visits).

## Up next (in priority order)

### 1. Launch polish

The portfolio's core job is to impress visitors — get it live and fast before adding more features.

- [ ] Performance audit — Lighthouse on key routes (Mapbox pages, Pokédex, Prompt Run likely heaviest)
- [x] Accessibility audit — skip link, nav focus/Escape, overlay autofocus; reduced-motion already wired (contrast pass deferred)
- [x] Per-route OG images — portfolio + Explore + Playground (shared `lib/og/` card)
- [x] Custom domain — victorlperez.com
- [x] Analytics review — Vercel Analytics + Speed Insights in root layout (pageviews / Web Vitals); no custom events needed for v1

### 2. Playground shared patterns

Pay down before the next game ships — two games already diverge slightly.

- [x] Guest localStorage conventions — `lib/storage/` keys + read/write/subscribe/snapshot helpers; games keep stable `zuna-*` keys
- [x] Shared game layout — `PlaygroundGameShell` (scores provider, header, back link)
- [x] Vitest coverage for pure game logic — shared storage helpers + game-canvas coords/FPS; existing game suites remain

### 3. New mini-games — canvas pair

Picked and specced: **Breakout** first (validates the shared canvas engine), then **Asteroids** (wrap-around shooter; Classic playable), then **Lunar Lander** (flagship, Earth-to-Moon mission). Asteroids extends shared `GameInput` with rotate + thrust + hold-to-fire, which the lander reuses.

- [x] Pick and spec the next game — [breakout.md](../improvements/active/breakout.md), [lunar-lander.md](../improvements/active/lunar-lander.md), [asteroids.md](../improvements/active/asteroids.md)
- [x] Breakout — shared `lib/game-canvas/` engine + Classic core + juice + Roguelite draft mode (needs `yarn supabase:db-push` for the `breakout_best_scores` table)
- [ ] Asteroids — Classic core is playable; juice, Roguelite drafts, persist, and achievements still open; [asteroids.md](../improvements/active/asteroids.md)
- [ ] Lunar Lander — descent MVP first, then full three-phase mission
- [x] Build on the shared patterns above (guest persist, Supabase bests, achievements)

## Deferred

- **AI chat (`/chat`)** — streaming chat UI and server route. Deliberately deferred: adds ongoing API cost and moderation surface. Revisit after launch.

## Shipped ✅

- **Foundation** — Next.js 16 App Router, TypeScript strict, ESLint/Prettier/Husky, shadcn/ui + `next-themes`, CI
- **Portfolio shell** — Landing, About, Projects, Resume, Contact; ground-up visual design; SEO metadata and OG images (root)
- **Supabase auth + profile** — `lib/supabase/*`, login/sign-up/callback, profiles table, guest vs authenticated UX
- **Explore zone** — Pokédex (PokéAPI) with collection, geocoding fly-to (`/explore/geo`), motion polish
- **Playground foundation** — hub at `/playground`, Type Racer, Prompt Run
- **Persistence & achievements** — Supabase high scores (per-mode/per-game bests), `/profile` stats and scores, achievement system (code catalog + `user_achievements` sync, unlock toasts, wired across Playground, portfolio Explorer, Explore zone, and meta combos)
- **Prompt Run AI images** — [FLUX.2 Turbo](https://fal.ai/models/fal-ai/flux-2/turbo) (`fal-ai/flux-2/turbo`, $0.008/MP); env-gated, rate-limited; [spec](../improvements/active/prompt-run.md)

## Achievement system (cross-cutting)

Runs across the whole site — optional meta-game, never gates core portfolio content. Full item list: [backlog — Account & meta](./backlog.md#account--meta).

| Category   | Examples                                             |
| ---------- | ---------------------------------------------------- |
| Explorer   | Visit all sections, open all project case studies    |
| Pokédex    | Catch milestones, favorites                          |
| Playground | Game milestones (Type Racer WPM, Prompt Run streaks) |
| Meta       | Sign up, return visits, complete profile             |
| Secret     | Hidden easter eggs                                   |

**Data model:** `profiles` (points, level), `user_achievements` (unlock state). Definitions live in code — `lib/achievements/definitions.ts` — so no `achievements` table is needed.

Guests unlock locally; signing in syncs progress.

## Related

- [backlog.md](./backlog.md) — games, features, polish (no priority assignment)
- [improvements/active/](../improvements/active/) — detailed specs for in-flight work
