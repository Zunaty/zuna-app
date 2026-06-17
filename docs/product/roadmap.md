Status: `active`
Scope: `platform`
Last updated: `2026-06-17`

# Product roadmap

Public portfolio with a game-layer meta-progression system (achievements, points, return visits).

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

## Phase 2 — Supabase auth + profile

- [ ] Supabase project, `lib/supabase/*`, `proxy.ts`
- [ ] Login, sign-up, callback
- [ ] Profiles table + guest vs authenticated UX

## Phase 3 — Explore zone

- [ ] Pokédex (PokéAPI) — list, detail, favorites
- [ ] Star Wars (SWAPI) — browse franchise content

## Phase 4 — Art Roulette core

- [ ] Game loop, scoring, shop, audio
- [ ] Guest play via localStorage
- [ ] Vitest for reducer/scoring logic

## Phase 5 — Art Roulette persistence

- [ ] Save history and high scores to Supabase
- [ ] Profile stats and optional leaderboard

## Phase 6 — Art Roulette + AI

- [ ] Image generation from built prompts
- [ ] Rate limiting and env-gated API

## Phase 7 — AI chat

- [ ] Streaming chat UI and server route

## Phase 8 — More playground games

- [ ] Additional mini-games
- [ ] Shared achievements across the app

## Phase 9 — Polish + launch

- [ ] Performance, a11y, analytics, custom domain

## Achievement system (cross-cutting)

Runs across the whole site — optional meta-game, never gates core portfolio content.

| Category            | Examples                                          |
| ------------------- | ------------------------------------------------- |
| Explorer            | Visit all sections, open all project case studies |
| Pokédex / Star Wars | Catch milestones, favorites                       |
| Roulette            | Streaks, legendary pulls, shop unlock             |
| Meta                | Sign up, return visits, complete profile          |
| Secret              | Hidden easter eggs                                |

**Data model (Phase 2+):** `profiles`, `achievements`, `user_achievements`, optional `user_stats`.

Guests unlock locally; signing in syncs progress.
