-- Per-user Pokémon collection: favorites, in-game catches, and TCG cards
create table if not exists public.pokemon_collection (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pokemon_id integer not null check (pokemon_id > 0),
  pokemon_slug text not null,
  is_favorite boolean not null default false,
  caught_in_game boolean not null default false,
  has_card boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, pokemon_id)
);

create index if not exists pokemon_collection_user_id_idx on public.pokemon_collection (user_id);

alter table public.pokemon_collection enable row level security;

create policy "Users can view their own pokemon collection"
  on public.pokemon_collection
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "Users can insert their own pokemon collection"
  on public.pokemon_collection
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can update their own pokemon collection"
  on public.pokemon_collection
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own pokemon collection"
  on public.pokemon_collection
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop trigger if exists pokemon_collection_updated_at on public.pokemon_collection;
create trigger pokemon_collection_updated_at
  before update on public.pokemon_collection
  for each row
  execute function public.handle_updated_at();
