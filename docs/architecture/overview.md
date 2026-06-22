Status: `active`
Scope: `platform`
Last updated: `2026-06-22`

# Architecture overview

## Purpose

The `zuna-app` repository hosts **Victor Perez's public portfolio** — an interactive skills demo recruiters can inspect in the open. Private work repos stay private; this site shows how the work is built.

## Layers

```
Portfolio     →  who you are, projects, resume, contact
Playground    →  games (Prompt Run, future mini-games)
Explore       →  API-driven demos (Pokédex, Star Wars, Mapbox geocoding)
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
/playground/type-racer
/playground/prompt-run
/explore/pokemon
/explore/star-wars
/explore/geo
/chat
/auth/login
/auth/callback
/profile
```

## Stack

| Layer     | Choice                                                             |
| --------- | ------------------------------------------------------------------ |
| Framework | Next.js 16, App Router                                             |
| Language  | TypeScript 5, strict                                               |
| UI        | Tailwind + shadcn/ui + lucide                                      |
| Theme     | `next-themes`                                                      |
| Motion    | Framer Motion — active                                             |
| Particles | tsParticles — planned (hero, bursts)                               |
| 3D        | Three.js + R3F — planned (Phase 4+)                                |
| Auth + DB | Supabase (`@supabase/ssr`) — Phase 2                               |
| AI        | Vercel AI SDK (chat); fal.ai FLUX.2 Turbo for Prompt Run — Phase 6 |
| Maps      | Mapbox GL — planned (About aviation map, Explore geocoding)        |
| Quality   | ESLint 9, Prettier, Husky, Vitest when needed                      |

See [motion-and-3d.md](../improvements/active/motion-and-3d.md) for integration ideas and phasing. See [mapbox.md](../improvements/active/mapbox.md) for Mapbox specs.

## Auth

Supabase Auth (not Auth0). Use `getUser()` on the server for protected routes. Session refresh via `proxy.ts` (Next 16).

## Repo workflow

- `AGENTS.md` — Cursor/AI rules
- `docs/` — roadmap and architecture
- `.github/workflows/ci.yml` — lint, typecheck, format, build
- Branch model: `develop` → `main` (when adopted)
