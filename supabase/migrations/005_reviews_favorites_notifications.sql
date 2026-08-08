-- =============================================================================
-- Fudexa 005 — Reviews, favorites, notifications + dependent triggers
-- =============================================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  review text,
  created_at timestamptz not null default timezone('utc', now()),
  constraint reviews_unique_customer_restaurant unique (restaurant_id, customer_id),
  constraint reviews_text_length check (
    review is null or char_length(trim(review)) >= 3
  )
);

create index if not exists reviews_restaurant_id_idx on public.reviews (restaurant_id);
create index if not exists reviews_customer_id_idx on public.reviews (customer_id);
create index if not exists reviews_rating_idx on public.reviews (restaurant_id, rating);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

comment on table public.reviews is
  'Customer reviews. One review per customer per restaurant; only after a completed order.';

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------

create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  constraint favorites_unique_pair unique (customer_id, restaurant_id)
);

create index if not exists favorites_customer_id_idx on public.favorites (customer_id);
create index if not exists favorites_restaurant_id_idx on public.favorites (restaurant_id);
create index if not exists favorites_created_at_idx on public.favorites (created_at desc);

comment on table public.favorites is 'Customer-saved restaurants.';

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type public.notification_type not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  constraint notifications_title_length check (char_length(trim(title)) >= 1),
  constraint notifications_message_length check (char_length(trim(message)) >= 1)
);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id, is_read, created_at desc)
  where is_read = false;
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);
create index if not exists notifications_type_idx on public.notifications (type);

comment on table public.notifications is 'In-app notifications for customers and restaurant owners.';

-- ---------------------------------------------------------------------------
-- Recalculate restaurant rating after review changes
-- ---------------------------------------------------------------------------

create or replace function public.refresh_restaurant_rating(p_restaurant_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.restaurants r
  set
    rating = coalesce((
      select round(avg(rv.rating)::numeric, 2)
      from public.reviews rv
      where rv.restaurant_id = p_restaurant_id
    ), 0),
    total_reviews = coalesce((
      select count(*)::integer
      from public.reviews rv
      where rv.restaurant_id = p_restaurant_id
    ), 0),
    updated_at = timezone('utc', now())
  where r.id = p_restaurant_id;
end;
$$;

create or replace function public.handle_review_rating_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_restaurant_rating(old.restaurant_id);
    return old;
  end if;

  perform public.refresh_restaurant_rating(new.restaurant_id);

  if tg_op = 'UPDATE' and old.restaurant_id is distinct from new.restaurant_id then
    perform public.refresh_restaurant_rating(old.restaurant_id);
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_refresh_rating on public.reviews;
create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.handle_review_rating_change();

-- Ensure customer completed an order at the restaurant before reviewing
create or replace function public.validate_review_eligibility()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.orders o
    where o.customer_id = new.customer_id
      and o.restaurant_id = new.restaurant_id
      and o.status = 'Completed'
  ) then
    raise exception
      'Customers may only review restaurants after completing an order';
  end if;

  if not exists (
    select 1
    from public.profiles p
    where p.id = new.customer_id
      and p.role = 'customer'
  ) then
    raise exception 'Only customers can write reviews';
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_validate_eligibility on public.reviews;
create trigger reviews_validate_eligibility
  before insert or update on public.reviews
  for each row execute function public.validate_review_eligibility();

-- ---------------------------------------------------------------------------
-- Attach order-completion inventory + notification trigger
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
        insert into public.inventory (restaurant_id, menu_item_id, stock, low_stock_limit)
        values (new.restaurant_id, item.menu_item_id, 0, 5)
        on conflict (menu_item_id) do update
          set stock = greatest(public.inventory.stock - item.quantity, 0);
      end if;
    end loop;

    insert into public.notifications (user_id, title, message, type)
    select
      r.owner_id,
      'Order completed',
      format('Order %s was marked completed. Inventory has been updated.', new.order_number),
      'order'::public.notification_type
    from public.restaurants r
    where r.id = new.restaurant_id;
  end if;

  if old.status is distinct from new.status then
    insert into public.notifications (user_id, title, message, type)
    values (
      new.customer_id,
      format('Order %s update', new.order_number),
      format('Your order status is now: %s', new.status),
      'order'::public.notification_type
    );

    -- Also notify restaurant on incoming / progressing orders
    if new.status in ('Pending', 'Accepted', 'Preparing', 'Ready', 'OutForDelivery', 'Cancelled') then
      insert into public.notifications (user_id, title, message, type)
      select
        r.owner_id,
        format('Order %s', new.order_number),
        format('Status changed to %s', new.status),
        'order'::public.notification_type
      from public.restaurants r
      where r.id = new.restaurant_id;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists orders_on_status_change on public.orders;
create trigger orders_on_status_change
  after update of status on public.orders
  for each row execute function public.decrement_inventory_on_order_completed();

-- Notify restaurant when a new order is placed
create or replace function public.notify_on_new_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, message, type)
  select
    r.owner_id,
    'New order received',
    format('Order %s was placed. Total: %s', new.order_number, new.total),
    'order'::public.notification_type
  from public.restaurants r
  where r.id = new.restaurant_id;

  return new;
end;
$$;

drop trigger if exists orders_notify_new on public.orders;
create trigger orders_notify_new
  after insert on public.orders
  for each row execute function public.notify_on_new_order();

alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;
