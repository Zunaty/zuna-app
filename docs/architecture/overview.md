Status: `active`
Scope: `platform`
Last updated: `2026-06-17`

# Architecture overview

## Purpose

zuna-app is a **public portfolio** that doubles as an interactive skills demo. Private work repos stay private; this repo shows engineering maturity recruiters can actually open.

## Layers

```
Portfolio     →  who you are, projects, resume, contact
Playground    →  games (Art Roulette, future mini-games)
Explore       →  API-driven demos (Pokédex, Star Wars)
Lab           →  AI chat (later)
Account       →  Supabase auth, saved progress, achievements
```

## Target routes

```
/                    Home
/about
/projects
/resume
/contact
/playground
/playground/art-roulette
/explore/pokemon
/explore/star-wars
/chat
/auth/login
/auth/callback
/profile
```

## Stack

| Layer     | Choice                                        |
| --------- | --------------------------------------------- |
| Framework | Next.js 16, App Router                        |
| Language  | TypeScript 5, strict                          |
| UI        | Tailwind + shadcn/ui + lucide                 |
| Theme     | `next-themes`                                 |
| Auth + DB | Supabase (`@supabase/ssr`) — Phase 2          |
| AI        | Vercel AI SDK — Phase 6–7                     |
| Quality   | ESLint 9, Prettier, Husky, Vitest when needed |

## Auth

Supabase Auth (not Auth0). Use `getUser()` on the server for protected routes. Session refresh via `proxy.ts` (Next 16).

## Repo workflow

- `AGENTS.md` — Cursor/AI rules
- `docs/` — roadmap and architecture
- `.github/workflows/ci.yml` — lint, typecheck, format, build
- Branch model: `develop` → `main` (when adopted)
