# Supabase (database)

Schema changes live in `migrations/` and are the source of truth. Each file is a timestamped step in how the database evolved — useful for reviewers and future you.

## Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli/getting-started) via `yarn supabase` (pinned `npx supabase@2.101.0` — no local `postinstall` binary)
- Project linked once: `yarn supabase:link` (stores ref under `supabase/.temp/`; that folder is gitignored)

## Common commands

From the repo root:

| Command                              | Purpose                                                                 |
| ------------------------------------ | ----------------------------------------------------------------------- |
| `yarn supabase -- --version`         | CLI version                                                             |
| `yarn supabase:migration:new <name>` | New empty migration file                                                |
| `yarn supabase:db-push`              | Apply pending migrations to the **linked** hosted project               |
| `yarn supabase:gen-types`            | Regenerate `types/supabase/database.ts` from linked project             |
| `yarn supabase db reset`             | **Local only** — replay migrations (requires `supabase start` + Docker) |

On Windows, if Yarn swallows CLI args, use the `--` form:

```bash
yarn supabase -- migration new add_achievements
yarn supabase -- db push
```

## Workflow (schema change)

1. `yarn supabase:migration:new short_description`
2. Edit the new file under `migrations/`
3. `yarn supabase:db-push` to apply to the hosted project
4. `yarn supabase:gen-types` (writes `types/supabase/database.ts` via `scripts/gen-supabase-types.mjs`)
5. Commit **migration + generated types + app code** in the same change set

**Never edit or delete migrations that already shipped** — add a new migration to fix or extend.

## If the CLI cannot download

Corporate VPN/proxy may block GitHub release downloads. Options:

1. Set `HTTPS_PROXY` / `HTTP_PROXY` for Node
2. Install the CLI via [official install docs](https://supabase.com/docs/guides/cli/getting-started) (Scoop on Windows, etc.)
3. Fallback: run the SQL file in the Supabase dashboard **SQL Editor**

## Migrations in this repo

| Migration                                       | Description                                          |
| ----------------------------------------------- | ---------------------------------------------------- |
| `20260617180000_profiles.sql`                   | `profiles` table, RLS, auto-create on signup         |
| `20260618120000_avatars_and_delete_account.sql` | `avatars` storage bucket, `delete_own_account()` RPC |

More detail: [docs/database/README.md](../docs/database/README.md)
