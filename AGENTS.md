<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# Victor Perez portfolio — agent context

Personal portfolio site (repo: `zuna-app`). User-facing branding is **Victor Perez**, not "Zuna".

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

## Git commits

**Do not commit unless the user explicitly asks to commit** (e.g. "commit this", "create a commit", "commit to develop").

- It is fine to finish implementation and summarize changes without committing.
- Do not commit as a default "wrap up" step after completing work.
- Do not push to remote unless explicitly requested.
- When the user does ask to commit: show what will be included, use a clear message, and follow the project's git safety practices (no secrets, no force push, etc.).
