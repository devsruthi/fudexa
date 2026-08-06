-- =============================================================================
-- OrderFlow 004 — Orders and order items
-- =============================================================================

create sequence if not exists public.order_number_seq
  as bigint
  start with 1000
  increment by 1
  minvalue 1000
  no maxvalue
  cache 1;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  restaurant_id uuid not null references public.restaurants (id) on delete restrict,
  status public.order_status not null default 'Pending',
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  tax numeric(12, 2) not null default 0 check (tax >= 0),
  delivery_fee numeric(12, 2) not null default 0 check (delivery_fee >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  total numeric(12, 2) not null default 0 check (total >= 0),
  payment_status public.payment_status not null default 'Pending',
  payment_method public.payment_method not null default 'Card',
  delivery_address text not null,
  notes text,
  estimated_delivery timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint orders_order_number_unique unique (order_number),
  constraint orders_total_consistency check (
    total = round((subtotal + tax + delivery_fee - discount)::numeric, 2)
  ),
  constraint orders_delivery_address_length check (char_length(trim(delivery_address)) >= 5)
);

create index if not exists orders_customer_id_idx on public.orders (customer_id);
create index if not exists orders_restaurant_id_idx on public.orders (restaurant_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_payment_status_idx on public.orders (payment_status);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_restaurant_status_created_idx
  on public.orders (restaurant_id, status, created_at desc);
create index if not exists orders_customer_created_idx
  on public.orders (customer_id, created_at desc);

comment on table public.orders is 'Customer food orders placed against a restaurant.';

drop trigger if exists orders_updated_at on public.orders;
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Order number generation: OF-YYYYMMDD-#####
-- ---------------------------------------------------------------------------

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    new.order_number :=
      'OF-'
      || to_char(timezone('utc', now()), 'YYYYMMDD')
      || '-'
      || lpad(nextval('public.order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists orders_generate_number on public.orders;
create trigger orders_generate_number
  before insert on public.orders
  for each row execute function public.generate_order_number();

-- ---------------------------------------------------------------------------
-- Order items
-- ---------------------------------------------------------------------------

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete restrict,
  quantity integer not null check (quantity > 0),
  price numeric(12, 2) not null check (price >= 0),
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  constraint order_items_subtotal_consistency check (
    subtotal = round((price * quantity)::numeric, 2)
  )
);

create index if not exists order_items_order_id_idx on public.order_items (order_id);
create index if not exists order_items_menu_item_id_idx on public.order_items (menu_item_id);

comment on table public.order_items is 'Line items for an order. price is snapshotted at purchase time.';

-- Validate menu item belongs to order restaurant; snapshot price if needed
create or replace function public.validate_order_item()
returns trigger
language plpgsql
as $$
declare
  order_restaurant_id uuid;
  item_restaurant_id uuid;
  item_price numeric(12, 2);
begin
  select o.restaurant_id into order_restaurant_id
  from public.orders o
  where o.id = new.order_id;

  if order_restaurant_id is null then
    raise exception 'Order % does not exist', new.order_id;
  end if;

  select mi.restaurant_id, mi.price
  into item_restaurant_id, item_price
  from public.menu_items mi
  where mi.id = new.menu_item_id;

  if item_restaurant_id is null then
    raise exception 'Menu item % does not exist', new.menu_item_id;
  end if;

  if item_restaurant_id <> order_restaurant_id then
    raise exception 'Menu item does not belong to the order restaurant';
  end if;

  if new.price is null then
    new.price := item_price;
  end if;

  new.subtotal := round((new.price * new.quantity)::numeric, 2);
  return new;
end;
$$;

drop trigger if exists order_items_validate on public.order_items;
create trigger order_items_validate
  before insert or update on public.order_items
  for each row execute function public.validate_order_item();

-- ---------------------------------------------------------------------------
-- Decrement inventory when an order is completed
-- ---------------------------------------------------------------------------

create or replace function public.decrement_inventory_on_order_completed()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
begin
  if new.status = 'Completed'
     and old.status is distinct from 'Completed'
  then
    for item in
      select oi.menu_item_id, oi.quantity
      from public.order_items oi
      where oi.order_id = new.id
    loop
      update public.inventory inv
      set stock = greatest(inv.stock - item.quantity, 0)
      where inv.menu_item_id = item.menu_item_id
        and inv.restaurant_id = new.restaurant_id;

      if not found then
        -- Inventory row missing — create at zero after deduction attempt
        insert into public.inventory (restaurant_id, menu_item_id, stock, low_stock_limit)
        values (new.restaurant_id, item.menu_item_id, 0, 5)
        on conflict (menu_item_id) do update
          set stock = greatest(public.inventory.stock - item.quantity, 0);
      end if;
    end loop;

    -- Notify restaurant owner
    insert into public.notifications (user_id, title, message, type)
    select
      r.owner_id,
      'Order completed',
      format('Order %s was marked completed. Inventory has been updated.', new.order_number),
      'order'::public.notification_type
    from public.restaurants r
    where r.id = new.restaurant_id;
  end if;

  -- Notify customer on meaningful status transitions
  if new.status is distinct from old.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.customer_id,
      format('Order %s update', new.order_number),
      format('Your order status is now: %s', new.status),
      'order'::public.notification_type
    );
  end if;

  return new;
end;
$$;

-- Trigger attached after notifications table exists (005). Stub here; replaced in 005.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
