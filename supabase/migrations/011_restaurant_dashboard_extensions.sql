-- =============================================================================
-- OrderFlow 011 — Restaurant dashboard extensions
-- Safe additive migration for settings, menu flags, review replies, status log
-- =============================================================================

alter table public.restaurants
  add column if not exists tax_percentage numeric(5, 2) not null default 8
    check (tax_percentage >= 0 and tax_percentage <= 100),
  add column if not exists default_delivery_fee numeric(12, 2) not null default 3.99
    check (default_delivery_fee >= 0),
  add column if not exists minimum_order numeric(12, 2) not null default 0
    check (minimum_order >= 0),
  add column if not exists delivery_radius_km numeric(8, 2)
    check (delivery_radius_km is null or delivery_radius_km >= 0),
  add column if not exists accepted_payment_methods text[] not null default array['Cash', 'Card', 'UPI']::text[];

alter table public.menu_items
  add column if not exists is_featured boolean not null default false,
  add column if not exists tags text[] not null default '{}'::text[];

alter table public.reviews
  add column if not exists reply text,
  add column if not exists replied_at timestamptz;

create table if not exists public.order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  from_status public.order_status,
  to_status public.order_status not null,
  changed_by uuid references public.profiles (id) on delete set null,
  note text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists order_status_events_order_id_idx
  on public.order_status_events (order_id, created_at desc);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.inventory (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  previous_stock integer not null,
  new_stock integer not null,
  delta integer not null,
  reason text,
  changed_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists inventory_movements_restaurant_id_idx
  on public.inventory_movements (restaurant_id, created_at desc);
create index if not exists inventory_movements_menu_item_id_idx
  on public.inventory_movements (menu_item_id, created_at desc);

-- Log order status changes
create or replace function public.log_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.order_status_events (order_id, from_status, to_status, changed_by)
    values (new.id, null, new.status, auth.uid());
    return new;
  end if;

  if new.status is distinct from old.status then
    insert into public.order_status_events (order_id, from_status, to_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;

drop trigger if exists orders_log_status on public.orders;
create trigger orders_log_status
  after insert or update of status on public.orders
  for each row execute function public.log_order_status_change();

-- Log inventory stock changes
create or replace function public.log_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'UPDATE' and new.stock is distinct from old.stock then
    insert into public.inventory_movements (
      inventory_id, restaurant_id, menu_item_id,
      previous_stock, new_stock, delta, reason, changed_by
    )
    values (
      new.id, new.restaurant_id, new.menu_item_id,
      old.stock, new.stock, new.stock - old.stock,
      'manual_or_order', auth.uid()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists inventory_log_movement on public.inventory;
create trigger inventory_log_movement
  after update of stock on public.inventory
  for each row execute function public.log_inventory_movement();

alter table public.order_status_events enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists order_status_events_select_related on public.order_status_events;
create policy order_status_events_select_related
  on public.order_status_events for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_status_events.order_id
        and (
          o.customer_id = auth.uid()
          or public.owns_restaurant(o.restaurant_id)
        )
    )
  );

drop policy if exists inventory_movements_select_owner on public.inventory_movements;
create policy inventory_movements_select_owner
  on public.inventory_movements for select
  to authenticated
  using (public.owns_restaurant(restaurant_id));

grant select on public.order_status_events to authenticated;
grant select on public.inventory_movements to authenticated;
