Status: `active`
Scope: `platform`
Last updated: `2026-06-22`

# Product roadmap

Infrastructure and platform milestones for the portfolio site. **Features and games** live in the [backlog](./backlog.md) — not every item needs a phase number.

Public portfolio with an optional game-layer meta-progression system (achievements, points, return visits).

## Phase 0 — Foundation ✅ complete

- [x] Next.js 16 App Router scaffold
- [x] TypeScript strict, ESLint, Prettier, Husky
- [x] shadcn/ui base + `next-themes`
- [x] `AGENTS.md`, `docs/`, `.github/` CI
- [x] Verify lint, typecheck, format, and build pass locally

## Phase 1 — Portfolio shell ✅ complete

- [x] Landing, About, Projects, Resume, Contact
- [x] New visual design (ground-up, not old Hero)
- [x] SEO metadata and OG images

## Phase 2 — Supabase auth + profile ✅ complete

- [x] Supabase project, `lib/supabase/*`, `proxy.ts`
- [x] Login, sign-up, callback
- [x] Profiles table + guest vs authenticated UX
- [x] Run `yarn supabase:link` then `yarn supabase:db-push` if `profiles` is not on the remote yet

## Phase 3 — Explore zone

- [x] Pokédex (PokéAPI) — list, detail, collection
- [x] Star Wars (SWAPI) — browse franchise content
- [ ] Explore polish as needed (see [backlog](./backlog.md))

## Phase 4 — Playground foundation

- [ ] Playground hub and first shippable game(s) — see [backlog](./backlog.md)
- [ ] Shared patterns: guest localStorage, game layout, Vitest for pure game logic

## Phase 5 — Persistence & achievements

- [ ] Save game history and high scores to Supabase
- [ ] Profile stats and optional leaderboard
- [ ] Achievement system wired across zones

## Phase 6 — AI features

- [ ] Prompt Run image generation — [FLUX.2 Turbo](https://fal.ai/models/fal-ai/flux-2/turbo) (`fal-ai/flux-2/turbo`, $0.008/MP); env-gated, rate-limited; [spec](../improvements/active/prompt-run.md)
- [ ] Streaming chat UI and server route (`/chat`)

## Phase 7 — Polish + launch

- [ ] Performance, a11y, analytics, custom domain

## Achievement system (cross-cutting)

Runs across the whole site — optional meta-game, never gates core portfolio content. Full item list: [backlog — Account & meta](./backlog.md#account--meta).

| Category            | Examples                                             |
| ------------------- | ---------------------------------------------------- |
| Explorer            | Visit all sections, open all project case studies    |
| Pokédex / Star Wars | Catch milestones, favorites                          |
| Playground          | Game milestones (Type Racer WPM, Prompt Run streaks) |
| Meta                | Sign up, return visits, complete profile             |
| Secret              | Hidden easter eggs                                   |

**Data model (Phase 2+):** `profiles`, `achievements`, `user_achievements`, optional `user_stats`.

Guests unlock locally; signing in syncs progress.

## Related

- [backlog.md](./backlog.md) — games, features, polish (no phase assignment)
- [improvements/active/](../improvements/active/) — detailed specs for in-flight work
