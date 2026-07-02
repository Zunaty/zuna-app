-- Achievement unlocks per user. Definitions (titles, points) live in code
-- (lib/achievements/definitions.ts); only unlock state is persisted.

create table if not exists public.user_achievements (
  user_id uuid not null references auth.users (id) on delete cascade,
  achievement_id text not null check (char_length(achievement_id) between 1 and 64),
  unlocked_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

create index if not exists user_achievements_user_id_idx on public.user_achievements (user_id);

alter table public.user_achievements enable row level security;

create policy "Users can view their own achievements"
  on public.user_achievements
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own achievements"
  on public.user_achievements
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own achievements"
  on public.user_achievements
  for delete
  to authenticated
  using (auth.uid() = user_id);
