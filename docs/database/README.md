Status: `active`
Scope: `database`
Last updated: `2026-06-17`

# Database & migrations

Postgres schema is managed with the [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started). SQL files under `supabase/migrations/` are versioned in git so anyone can see how the schema evolved over time.

## One-time setup

```bash
# Link this repo to your Supabase project (interactive)
yarn supabase:link
```

You need access to the project in the Supabase dashboard. Linking writes local state under `supabase/.temp/` (gitignored).

## Changing the schema

1. **Create** — `yarn supabase:migration:new add_achievements`  
   Produces `supabase/migrations/<timestamp>_add_achievements.sql`.

2. **Write SQL** — tables, RLS policies, triggers, etc.

3. **Push** — `yarn supabase:db-push`  
   Applies only migrations not yet recorded on the linked remote.

4. **Types** — `yarn supabase:gen-types`  
   Updates `types/supabase/database.ts` for TypeScript.

5. **Commit** — migration file + types + any app changes together.

## Rules

- **Migrations are append-only** after they hit a shared environment. Do not rewrite old files; add a new migration instead.
- **RLS on every public table** exposed through the Data API.
- Use `auth.uid()` in policies; use `getUser()` in app code — not `getSession()` for authorization.
- Regenerate types after every schema change so the app stays in sync.

## Local development (optional)

```bash
yarn supabase start    # Docker: local Postgres + Auth
yarn supabase db reset # Replay all migrations locally
```

Most solo work can use the hosted dev project + `db push` without running Docker.

## Related

- CLI reference: [supabase/README.md](../../supabase/README.md)
- Auth & profiles: Phase 2 in [product/roadmap.md](../product/roadmap.md)
