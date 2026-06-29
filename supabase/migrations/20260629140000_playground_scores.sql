-- Playground best scores for authenticated users (Type Racer per mode, Prompt Run best run).

create table if not exists public.type_racer_best_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null check (mode in ('words-30', 'words-60', 'sentence', 'paragraph')),
  wpm integer not null check (wpm >= 0),
  accuracy numeric(5, 1) not null check (accuracy >= 0 and accuracy <= 100),
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, mode)
);

create index if not exists type_racer_best_scores_user_id_idx on public.type_racer_best_scores (user_id);

alter table public.type_racer_best_scores enable row level security;

create policy "Users can view their own type racer scores"
  on public.type_racer_best_scores
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own type racer scores"
  on public.type_racer_best_scores
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own type racer scores"
  on public.type_racer_best_scores
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own type racer scores"
  on public.type_racer_best_scores
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists type_racer_best_scores_updated_at on public.type_racer_best_scores;
create trigger type_racer_best_scores_updated_at
  before update on public.type_racer_best_scores
  for each row
  execute function public.handle_updated_at();

create table if not exists public.prompt_run_best_runs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  total_score integer not null check (total_score >= 0),
  completed_rounds integer not null check (completed_rounds >= 0),
  achieved_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.prompt_run_best_runs enable row level security;

create policy "Users can view their own prompt run best"
  on public.prompt_run_best_runs
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own prompt run best"
  on public.prompt_run_best_runs
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own prompt run best"
  on public.prompt_run_best_runs
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own prompt run best"
  on public.prompt_run_best_runs
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists prompt_run_best_runs_updated_at on public.prompt_run_best_runs;
create trigger prompt_run_best_runs_updated_at
  before update on public.prompt_run_best_runs
  for each row
  execute function public.handle_updated_at();
