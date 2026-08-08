-- =============================================================================
-- Fudexa 006 — Row Level Security policies
-- =============================================================================

-- Drop existing policies for idempotent re-runs
do $$
declare
  r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'restaurants',
        'categories',
        'menu_items',
        'inventory',
        'orders',
        'order_items',
        'reviews',
        'favorites',
        'notifications'
      )
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

-- Ensure RLS is enabled
alter table public.profiles enable row level security;
alter table public.restaurants enable row level security;
alter table public.categories enable row level security;
alter table public.menu_items enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.notifications enable row level security;

-- =============================================================================
-- profiles
-- =============================================================================

create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

-- Restaurant owners can read basic customer profiles related to their orders
create policy "profiles_select_customers_for_restaurant_orders"
  on public.profiles for select
  to authenticated
  using (
    public.is_restaurant_user()
    and role = 'customer'
    and exists (
      select 1
      from public.orders o
      join public.restaurants r on r.id = o.restaurant_id
      where o.customer_id = profiles.id
        and r.owner_id = auth.uid()
    )
  );

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- =============================================================================
-- restaurants
-- =============================================================================

-- Anyone authenticated can browse restaurants (customers need this)
create policy "restaurants_select_authenticated"
  on public.restaurants for select
  to authenticated
  using (true);

-- Public browse for anon marketplace (optional; keep authenticated-only if preferred)
create policy "restaurants_select_anon_open"
  on public.restaurants for select
  to anon
  using (is_open = true);

create policy "restaurants_insert_owner"
  on public.restaurants for insert
  to authenticated
  with check (
    owner_id = auth.uid()
    and public.is_restaurant_user()
  );

create policy "restaurants_update_owner"
  on public.restaurants for update
  to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

create policy "restaurants_delete_owner"
  on public.restaurants for delete
  to authenticated
  using (owner_id = auth.uid());

-- =============================================================================
-- categories
-- =============================================================================

create policy "categories_select_authenticated"
  on public.categories for select
  to authenticated
  using (
    is_active = true
    or public.owns_restaurant(restaurant_id)
  );

create policy "categories_select_anon_active"
  on public.categories for select
  to anon
  using (
    is_active = true
    and exists (
      select 1 from public.restaurants r
      where r.id = categories.restaurant_id
        and r.is_open = true
    )
  );

create policy "categories_insert_owner"
  on public.categories for insert
  to authenticated
  with check (public.owns_restaurant(restaurant_id));

create policy "categories_update_owner"
  on public.categories for update
  to authenticated
  using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

create policy "categories_delete_owner"
  on public.categories for delete
  to authenticated
  using (public.owns_restaurant(restaurant_id));

-- =============================================================================
-- menu_items
-- =============================================================================

create policy "menu_items_select_authenticated"
  on public.menu_items for select
  to authenticated
  using (
    is_available = true
    or public.owns_restaurant(restaurant_id)
  );

create policy "menu_items_select_anon_available"
  on public.menu_items for select
  to anon
  using (
    is_available = true
    and exists (
      select 1 from public.restaurants r
      where r.id = menu_items.restaurant_id
        and r.is_open = true
    )
  );

create policy "menu_items_insert_owner"
  on public.menu_items for insert
  to authenticated
  with check (public.owns_restaurant(restaurant_id));

create policy "menu_items_update_owner"
  on public.menu_items for update
  to authenticated
  using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

create policy "menu_items_delete_owner"
  on public.menu_items for delete
  to authenticated
  using (public.owns_restaurant(restaurant_id));

-- =============================================================================
-- inventory (owners only)
-- =============================================================================

create policy "inventory_select_owner"
  on public.inventory for select
  to authenticated
  using (public.owns_restaurant(restaurant_id));

create policy "inventory_insert_owner"
  on public.inventory for insert
  to authenticated
  with check (public.owns_restaurant(restaurant_id));

create policy "inventory_update_owner"
  on public.inventory for update
  to authenticated
  using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

create policy "inventory_delete_owner"
  on public.inventory for delete
  to authenticated
  using (public.owns_restaurant(restaurant_id));

-- =============================================================================
-- orders
-- =============================================================================

create policy "orders_select_customer"
  on public.orders for select
  to authenticated
  using (customer_id = auth.uid());

create policy "orders_select_restaurant_owner"
  on public.orders for select
  to authenticated
  using (public.owns_restaurant(restaurant_id));

create policy "orders_insert_customer"
  on public.orders for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and public.is_customer()
    and exists (
      select 1 from public.restaurants r
      where r.id = restaurant_id
        and r.is_open = true
    )
  );

-- Customers may cancel their own pending orders
create policy "orders_update_customer_cancel"
  on public.orders for update
  to authenticated
  using (
    customer_id = auth.uid()
    and status = 'Pending'
  )
  with check (
    customer_id = auth.uid()
    and status in ('Pending', 'Cancelled')
  );

-- Restaurant owners update status / fulfillment fields
create policy "orders_update_restaurant_owner"
  on public.orders for update
  to authenticated
  using (public.owns_restaurant(restaurant_id))
  with check (public.owns_restaurant(restaurant_id));

-- =============================================================================
-- order_items
-- =============================================================================

create policy "order_items_select_customer"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
    )
  );

create policy "order_items_select_restaurant_owner"
  on public.order_items for select
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and public.owns_restaurant(o.restaurant_id)
    )
  );

create policy "order_items_insert_customer"
  on public.order_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
        and o.status = 'Pending'
    )
  );

create policy "order_items_update_customer_pending"
  on public.order_items for update
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
        and o.status = 'Pending'
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
        and o.status = 'Pending'
    )
  );

create policy "order_items_delete_customer_pending"
  on public.order_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id
        and o.customer_id = auth.uid()
        and o.status = 'Pending'
    )
  );

-- =============================================================================
-- reviews
-- =============================================================================

create policy "reviews_select_authenticated"
  on public.reviews for select
  to authenticated
  using (true);

create policy "reviews_select_anon"
  on public.reviews for select
  to anon
  using (true);

create policy "reviews_insert_customer_completed"
  on public.reviews for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and public.is_customer()
    and exists (
      select 1 from public.orders o
      where o.customer_id = auth.uid()
        and o.restaurant_id = reviews.restaurant_id
        and o.status = 'Completed'
    )
  );

create policy "reviews_update_own"
  on public.reviews for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

create policy "reviews_delete_own"
  on public.reviews for delete
  to authenticated
  using (customer_id = auth.uid());

-- =============================================================================
-- favorites
-- =============================================================================

create policy "favorites_select_own"
  on public.favorites for select
  to authenticated
  using (customer_id = auth.uid());

create policy "favorites_insert_own"
  on public.favorites for insert
  to authenticated
  with check (
    customer_id = auth.uid()
    and public.is_customer()
  );

create policy "favorites_delete_own"
  on public.favorites for delete
  to authenticated
  using (customer_id = auth.uid());

-- =============================================================================
-- notifications
-- =============================================================================

create policy "notifications_select_own"
  on public.notifications for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "notifications_delete_own"
  on public.notifications for delete
  to authenticated
  using (user_id = auth.uid());

-- Inserts are performed by security definer triggers / service role.
-- Authenticated users cannot forge notifications for others.
create policy "notifications_insert_own_system"
  on public.notifications for insert
  to authenticated
  with check (user_id = auth.uid());
