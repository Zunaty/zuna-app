<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Zuna App — agent context

## Stack

- Next.js 16 App Router, React 19, TypeScript (strict)
- Tailwind CSS 3 + shadcn/ui + `next-themes`
- Supabase for auth and data (Phase 2+)
- Yarn for package management

## Conventions

- Use `@/*` path aliases
- Prefer Server Components; add `"use client"` only when needed
- Use `supabase.auth.getUser()` for auth checks — not `getSession()`
- No `any` types
- Match existing ESLint and Prettier settings

## Project structure

- `app/` — routes and layouts
- `components/ui/` — shadcn primitives
- `components/layout/` — site chrome
- `lib/` — shared utilities
- `docs/` — roadmap, architecture, active improvements

## Phases

See `docs/product/roadmap.md` for the full plan. Do not skip ahead without user approval.
