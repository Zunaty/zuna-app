-- Durable server-side rate limit buckets (e.g. Prompt Run image generation).
-- Accessed only via service_role RPC — no anon/authenticated policies.

create table if not exists public.rate_limit_buckets (
  bucket_key text not null,
  scope text not null,
  count integer not null default 0 check (count >= 0),
  reset_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (bucket_key, scope)
);

alter table public.rate_limit_buckets enable row level security;

create or replace function public.consume_rate_limit(
  p_bucket_key text,
  p_scope text,
  p_limit integer,
  p_window_seconds integer
)
returns table (
  allowed boolean,
  remaining integer,
  limit_val integer,
  reset_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_reset_at timestamptz;
  v_count integer;
  v_window interval := make_interval(secs => p_window_seconds);
begin
  if p_limit < 1 then
    raise exception 'p_limit must be >= 1';
  end if;

  if p_window_seconds < 1 then
    raise exception 'p_window_seconds must be >= 1';
  end if;

  select b.count, b.reset_at
  into v_count, v_reset_at
  from public.rate_limit_buckets b
  where b.bucket_key = p_bucket_key
    and b.scope = p_scope
  for update;

  if not found or v_now >= v_reset_at then
    v_reset_at := v_now + v_window;
    insert into public.rate_limit_buckets (bucket_key, scope, count, reset_at)
    values (p_bucket_key, p_scope, 1, v_reset_at)
    on conflict (bucket_key, scope) do update
      set count = 1,
          reset_at = excluded.reset_at,
          updated_at = v_now;
    return query select true, p_limit - 1, p_limit, v_reset_at;
    return;
  end if;

  if v_count >= p_limit then
    return query select false, 0, p_limit, v_reset_at;
    return;
  end if;

  update public.rate_limit_buckets
  set count = v_count + 1,
      updated_at = v_now
  where bucket_key = p_bucket_key
    and scope = p_scope;

  return query select true, p_limit - (v_count + 1), p_limit, v_reset_at;
end;
$$;

revoke all on function public.consume_rate_limit (text, text, integer, integer) from public;
revoke all on function public.consume_rate_limit (text, text, integer, integer) from anon;
revoke all on function public.consume_rate_limit (text, text, integer, integer) from authenticated;
grant execute on function public.consume_rate_limit (text, text, integer, integer) to service_role;
