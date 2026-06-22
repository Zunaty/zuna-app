# Victor Perez — Portfolio

Public portfolio and interactive playground by [Victor Perez](https://github.com/Zunaty).

More than a static resume — a place to explore projects, play small games, browse API-driven demos, and (eventually) earn achievements as you poke around. Built to showcase modern full-stack patterns recruiters can actually inspect in the open.

## Live demo

_Coming soon._

## What’s here

| Zone           | Description                        | Status                             |
| -------------- | ---------------------------------- | ---------------------------------- |
| **Portfolio**  | About, projects, resume, contact   | Live                               |
| **Playground** | Prompt Run, mini-games, scores     | Phase 4+                           |
| **Explore**    | Pokédex, Star Wars, API demos      | Planned                            |
| **Account**    | Auth, saved progress, achievements | Live (profile); achievements later |

See [docs/product/roadmap.md](./docs/product/roadmap.md) for the full phased plan.

## Stack

- **Framework** — [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/)
- **Language** — TypeScript (strict)
- **Styling** — [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [next-themes](https://github.com/pacocoursey/next-themes)
- **Auth & data** — Supabase (Phase 2+)
- **Tooling** — ESLint, Prettier, Husky, GitHub Actions CI

## Getting started

**Requirements:** Node.js 20+, [Yarn](https://yarnpkg.com/)

```bash
# Install dependencies
yarn install

# Copy env template (optional for Phase 0)
cp .env.example .env.local

# Start dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable                               | Required   | Description                                                       |
| -------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`                 | No         | Canonical site URL for metadata and OAuth (defaults to localhost) |
| `NEXT_PUBLIC_SUPABASE_URL`             | Phase 2+   | Supabase project URL                                              |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes (auth) | Publishable/anon key from Supabase API settings                   |

## Scripts

| Command             | Description                   |
| ------------------- | ----------------------------- |
| `yarn dev`          | Start development server      |
| `yarn build`        | Production build              |
| `yarn start`        | Serve production build        |
| `yarn lint`         | Run ESLint                    |
| `yarn typecheck`    | Run TypeScript compiler check |
| `yarn format`       | Format with Prettier          |
| `yarn format:check` | Check formatting              |

### Supabase

| Command                              | Description                                    |
| ------------------------------------ | ---------------------------------------------- |
| `yarn supabase:link`                 | Link repo to your Supabase project (once)      |
| `yarn supabase:migration:new <name>` | New migration file in `supabase/migrations/`   |
| `yarn supabase:db-push`              | Apply pending migrations to the linked project |
| `yarn supabase:gen-types`            | Regenerate `types/supabase/database.ts`        |

See [supabase/README.md](./supabase/README.md) and [docs/database/README.md](./docs/database/README.md).

## Project structure

```
app/                  # App Router pages and layouts
components/
  layout/             # Site header, footer
  ui/                 # shadcn/ui primitives
docs/                 # Roadmap, architecture, improvement notes
supabase/             # Migrations (source of truth for schema)
lib/                  # Shared utilities
```

Agent and contributor notes live in [AGENTS.md](./AGENTS.md).

## Development

- Default branch for active work: `develop`
- CI runs on push/PR to `main` and `develop` — lint, typecheck, format check, build
- Pre-commit hooks run lint-staged via Husky

## License

Private — all rights reserved.
