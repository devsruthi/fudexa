-- =============================================================================
-- OrderFlow 003 — Restaurants, categories, menu items, inventory
-- =============================================================================

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  logo text,
  cover_image text,
  address text not null,
  city text not null,
  country text not null,
  postal_code text,
  phone text,
  email text,
  opening_time time,
  closing_time time,
  is_open boolean not null default false,
  rating numeric(3, 2) not null default 0
    check (rating >= 0 and rating <= 5),
  total_reviews integer not null default 0
    check (total_reviews >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint restaurants_name_length check (char_length(trim(name)) >= 2),
  constraint restaurants_hours_valid check (
    opening_time is null
    or closing_time is null
    or opening_time <> closing_time
  )
);

create index if not exists restaurants_owner_id_idx on public.restaurants (owner_id);
create index if not exists restaurants_city_idx on public.restaurants (city);
create index if not exists restaurants_is_open_idx on public.restaurants (is_open);
create index if not exists restaurants_rating_idx on public.restaurants (rating desc);
create index if not exists restaurants_created_at_idx on public.restaurants (created_at desc);
create index if not exists restaurants_name_trgm_idx on public.restaurants (lower(name));

comment on table public.restaurants is 'Merchant restaurant entities. One owner may have multiple restaurants.';

drop trigger if exists restaurants_updated_at on public.restaurants;
create trigger restaurants_updated_at
  before update on public.restaurants
  for each row execute function public.handle_updated_at();

-- Own-restaurant helper used by RLS
create or replace function public.owns_restaurant(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.restaurants r
    where r.id = p_restaurant_id
      and r.owner_id = auth.uid()
  );
$$;

create or replace function public.owned_restaurant_ids()
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select r.id
  from public.restaurants r
  where r.owner_id = auth.uid();
$$;

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  name text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  constraint categories_name_length check (char_length(trim(name)) >= 1),
  constraint categories_unique_name_per_restaurant unique (restaurant_id, name)
);

create index if not exists categories_restaurant_id_idx on public.categories (restaurant_id);
create index if not exists categories_display_order_idx
  on public.categories (restaurant_id, display_order);
create index if not exists categories_is_active_idx on public.categories (is_active)
  where is_active = true;

comment on table public.categories is 'Menu categories scoped to a single restaurant.';

-- ---------------------------------------------------------------------------
-- Menu items
-- ---------------------------------------------------------------------------

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  category_id uuid not null references public.categories (id) on delete restrict,
  name text not null,
  description text,
  price numeric(12, 2) not null check (price >= 0),
  image text,
  is_available boolean not null default true,
  preparation_time integer check (preparation_time is null or preparation_time >= 0),
  calories integer check (calories is null or calories >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint menu_items_name_length check (char_length(trim(name)) >= 1)
);

create index if not exists menu_items_restaurant_id_idx on public.menu_items (restaurant_id);
create index if not exists menu_items_category_id_idx on public.menu_items (category_id);
create index if not exists menu_items_is_available_idx on public.menu_items (is_available)
  where is_available = true;
create index if not exists menu_items_created_at_idx on public.menu_items (created_at desc);
create index if not exists menu_items_price_idx on public.menu_items (restaurant_id, price);

comment on table public.menu_items is 'Sellable dishes/items belonging to a restaurant category.';

-- Ensure category belongs to the same restaurant as the menu item
create or replace function public.validate_menu_item_category()
returns trigger
language plpgsql
as $$
declare
  category_restaurant_id uuid;
begin
  select c.restaurant_id into category_restaurant_id
  from public.categories c
  where c.id = new.category_id;

  if category_restaurant_id is null then
    raise exception 'Category % does not exist', new.category_id;
  end if;

  if category_restaurant_id <> new.restaurant_id then
    raise exception 'Category % does not belong to restaurant %',
      new.category_id, new.restaurant_id;
  end if;

  return new;
end;
$$;

drop trigger if exists menu_items_validate_category on public.menu_items;
create trigger menu_items_validate_category
  before insert or update of category_id, restaurant_id on public.menu_items
  for each row execute function public.validate_menu_item_category();

drop trigger if exists menu_items_updated_at on public.menu_items;
create trigger menu_items_updated_at
  before update on public.menu_items
  for each row execute function public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants (id) on delete cascade,
  menu_item_id uuid not null references public.menu_items (id) on delete cascade,
  stock integer not null default 0 check (stock >= 0),
  low_stock_limit integer not null default 5 check (low_stock_limit >= 0),
  status public.inventory_status not null default 'OutOfStock',
  updated_at timestamptz not null default timezone('utc', now()),
  constraint inventory_menu_item_unique unique (menu_item_id)
);

create index if not exists inventory_restaurant_id_idx on public.inventory (restaurant_id);
create index if not exists inventory_menu_item_id_idx on public.inventory (menu_item_id);
create index if not exists inventory_status_idx on public.inventory (status);
create index if not exists inventory_low_stock_idx on public.inventory (restaurant_id, status)
  where status in ('LowStock', 'OutOfStock');

comment on table public.inventory is 'Per-menu-item stock levels for a restaurant.';

create or replace function public.compute_inventory_status(
  p_stock integer,
  p_low_stock_limit integer
)
returns public.inventory_status
language sql
immutable
as $$
  select case
    when p_stock <= 0 then 'OutOfStock'::public.inventory_status
    when p_stock <= p_low_stock_limit then 'LowStock'::public.inventory_status
    else 'InStock'::public.inventory_status
  end;
$$;

create or replace function public.sync_inventory_status()
returns trigger
language plpgsql
as $$
declare
  item_restaurant_id uuid;
begin
  select mi.restaurant_id into item_restaurant_id
  from public.menu_items mi
  where mi.id = new.menu_item_id;

  if item_restaurant_id is null then
    raise exception 'Menu item % does not exist', new.menu_item_id;
  end if;

  if new.restaurant_id <> item_restaurant_id then
    raise exception 'Inventory restaurant_id must match menu item restaurant';
  end if;

  new.status := public.compute_inventory_status(new.stock, new.low_stock_limit);
  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists inventory_sync_status on public.inventory;
create trigger inventory_sync_status
  before insert or update of stock, low_stock_limit, menu_item_id, restaurant_id
  on public.inventory
  for each row execute function public.sync_inventory_status();

-- Auto-create inventory row when a menu item is created
create or replace function public.create_inventory_for_menu_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inventory (restaurant_id, menu_item_id, stock, low_stock_limit, status)
  values (
    new.restaurant_id,
    new.id,
    0,
    5,
    'OutOfStock'
  )
  on conflict (menu_item_id) do nothing;

  return new;
end;
$$;

drop trigger if exists menu_items_create_inventory on public.menu_items;
create trigger menu_items_create_inventory
  after insert on public.menu_items
  for each row execute function public.create_inventory_for_menu_item();

-- Keep menu availability in sync with inventory stock
create or replace function public.sync_menu_availability_from_inventory()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.menu_items
  set
    is_available = (new.stock > 0),
    updated_at = timezone('utc', now())
  where id = new.menu_item_id
    and is_available is distinct from (new.stock > 0);

  return new;
end;
$$;

drop trigger if exists inventory_sync_menu_availability on public.inventory;
create trigger inventory_sync_menu_availability
  after insert or update of stock on public.inventory
  for each row execute function public.sync_menu_availability_from_inventory();

-- ---------------------------------------------------------------------------
-- Signup: bootstrap restaurant for restaurant-role users
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
  selected_restaurant_name text;
begin
  begin
    selected_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'customer'::public.user_role
    );
  exception when others then
    selected_role := 'customer'::public.user_role;
  end;

  selected_restaurant_name := nullif(
    trim(coalesce(new.raw_user_meta_data ->> 'restaurant_name', '')),
    ''
  );

  insert into public.profiles (id, email, full_name, role, phone, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    ),
    selected_role,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'avatar_url', '')), '')
  )
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      phone = coalesce(excluded.phone, public.profiles.phone),
      avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
      updated_at = timezone('utc', now());

  if selected_role = 'restaurant' then
    insert into public.restaurants (
      owner_id,
      name,
      description,
      address,
      city,
      country,
      is_open
    )
    select
      new.id,
      coalesce(selected_restaurant_name, 'My Restaurant'),
      'Welcome to OrderFlow — complete your restaurant profile to go live.',
      'Address pending',
      'City pending',
      'Country pending',
      false
    where not exists (
      select 1 from public.restaurants r where r.owner_id = new.id
    );
  end if;

  return new;
end;
$$;

alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.inventory enable row level security;
