-- =============================================================================
-- OrderFlow 012 — Realtime ops: order versioning, reviews publication
-- =============================================================================

-- Optimistic concurrency for multi-device kitchen / dashboard edits
alter table public.orders
  add column if not exists version integer not null default 1;

comment on column public.orders.version is 'Incremented on each update for optimistic concurrency control.';

create or replace function public.bump_order_version()
returns trigger
language plpgsql
as $$
begin
  new.version := coalesce(old.version, 1) + 1;
  return new;
end;
$$;

drop trigger if exists orders_bump_version on public.orders;
create trigger orders_bump_version
  before update on public.orders
  for each row
  execute function public.bump_order_version();

-- Publish reviews for live merchant + rating sync
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end $$;

alter table public.reviews replica identity full;

-- Optional: publish restaurants for settings sync across devices
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'restaurants'
  ) then
    alter publication supabase_realtime add table public.restaurants;
  end if;
end $$;

alter table public.restaurants replica identity full;
