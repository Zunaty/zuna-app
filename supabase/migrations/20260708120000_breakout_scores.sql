-- Breakout per-mode best scores (classic, roguelite).

create table if not exists public.breakout_best_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('classic', 'roguelite')),
  score integer not null check (score >= 0),
  level integer not null check (level >= 0),
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mode)
);

create index if not exists breakout_best_scores_user_id_idx on public.breakout_best_scores (user_id);

alter table public.breakout_best_scores enable row level security;

create policy "Users can view their own breakout scores"
  on public.breakout_best_scores
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own breakout scores"
  on public.breakout_best_scores
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own breakout scores"
  on public.breakout_best_scores
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own breakout scores"
  on public.breakout_best_scores
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists breakout_best_scores_updated_at on public.breakout_best_scores;
create trigger breakout_best_scores_updated_at
  before update on public.breakout_best_scores
  for each row
  execute function public.handle_updated_at();
