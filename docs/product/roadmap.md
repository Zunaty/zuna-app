Status: `active`
Scope: `platform`
Last updated: `2026-07-06`

# Product roadmap

Priority-ordered platform work for the portfolio site. Work top-down; reorder freely as priorities change. **Features and games** live in the [backlog](./backlog.md).

Public portfolio with an optional game-layer meta-progression system (achievements, points, return visits).

## Up next (in priority order)

### 1. Launch polish

The portfolio's core job is to impress visitors — get it live and fast before adding more features.

- [ ] Performance audit — Lighthouse on key routes (Mapbox pages, Pokédex, Prompt Run likely heaviest)
- [ ] Accessibility audit — keyboard nav, contrast, `prefers-reduced-motion` for Framer Motion surfaces
- [ ] Per-route OG images (root `opengraph-image.tsx` exists; per-route missing)
- [ ] Custom domain
- [ ] Analytics review (Vercel Analytics + Speed Insights already wired)

### 2. Playground shared patterns

Pay down before the next game ships — two games already diverge slightly.

- [ ] Guest localStorage conventions (shared helpers, consistent keys/merge-on-sign-in)
- [ ] Shared game layout
- [ ] Vitest coverage for pure game logic

### 3. New mini-game

- [ ] Pick and spec the next game (see [backlog — Playground](./backlog.md#playground--games) ideas)
- [ ] Build on the shared patterns above (guest persist, Supabase bests, achievements)

## Deferred

- **AI chat (`/chat`)** — streaming chat UI and server route. Deliberately deferred: adds ongoing API cost and moderation surface. Revisit after launch.
- **Star Wars zone decision** — keep or remove; decide before deep launch-polish work on those pages.

## Shipped ✅

- **Foundation** — Next.js 16 App Router, TypeScript strict, ESLint/Prettier/Husky, shadcn/ui + `next-themes`, CI
- **Portfolio shell** — Landing, About, Projects, Resume, Contact; ground-up visual design; SEO metadata and OG images (root)
- **Supabase auth + profile** — `lib/supabase/*`, login/sign-up/callback, profiles table, guest vs authenticated UX
- **Explore zone** — Pokédex (PokéAPI) with collection, Star Wars (SWAPI), geocoding fly-to (`/explore/geo`), motion polish
- **Playground foundation** — hub at `/playground`, Type Racer, Prompt Run
- **Persistence & achievements** — Supabase high scores (per-mode/per-game bests), `/profile` stats and scores, achievement system (code catalog + `user_achievements` sync, unlock toasts, wired across Playground, portfolio Explorer, Explore zone, and meta combos)
- **Prompt Run AI images** — [FLUX.2 Turbo](https://fal.ai/models/fal-ai/flux-2/turbo) (`fal-ai/flux-2/turbo`, $0.008/MP); env-gated, rate-limited; [spec](../improvements/active/prompt-run.md)

## Achievement system (cross-cutting)

Runs across the whole site — optional meta-game, never gates core portfolio content. Full item list: [backlog — Account & meta](./backlog.md#account--meta).

| Category            | Examples                                             |
| ------------------- | ---------------------------------------------------- |
| Explorer            | Visit all sections, open all project case studies    |
| Pokédex / Star Wars | Catch milestones, favorites                          |
| Playground          | Game milestones (Type Racer WPM, Prompt Run streaks) |
| Meta                | Sign up, return visits, complete profile             |
| Secret              | Hidden easter eggs                                   |

**Data model:** `profiles` (points, level), `user_achievements` (unlock state). Definitions live in code — `lib/achievements/definitions.ts` — so no `achievements` table is needed.

Guests unlock locally; signing in syncs progress.

## Related

- [backlog.md](./backlog.md) — games, features, polish (no priority assignment)
- [improvements/active/](../improvements/active/) — detailed specs for in-flight work
