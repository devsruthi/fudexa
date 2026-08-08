-- =============================================================================
-- Fudexa 009 — Seed data
-- 1 restaurant owner, 1 restaurant, 5 categories, 20 menu items,
-- 10 customers, 25 orders (+ items), reviews, inventory, favorites, notifications
--
-- Seed login password for all users: Password123!
-- Run AFTER 001–008. Idempotent via fixed UUIDs + ON CONFLICT.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Helpers: upsert auth user + identity
-- ---------------------------------------------------------------------------

create or replace function public.seed_auth_user(
  p_id uuid,
  p_email text,
  p_full_name text,
  p_role public.user_role,
  p_restaurant_name text default null,
  p_password text default 'Password123!'
)
returns void
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  encrypted text;
begin
  encrypted := crypt(p_password, gen_salt('bf'));

  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    coalesce(
      (select id from auth.instances limit 1),
      '00000000-0000-0000-0000-000000000000'
    ),
    p_id,
    'authenticated',
    'authenticated',
    p_email,
    encrypted,
    timezone('utc', now()),
    jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
    jsonb_strip_nulls(
      jsonb_build_object(
        'full_name', p_full_name,
        'role', p_role::text,
        'restaurant_name', p_restaurant_name
      )
    ),
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update
    set
      email = excluded.email,
      encrypted_password = excluded.encrypted_password,
      raw_user_meta_data = excluded.raw_user_meta_data,
      updated_at = timezone('utc', now());

  insert into auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  )
  values (
    p_id,
    p_id,
    jsonb_build_object(
      'sub', p_id::text,
      'email', p_email,
      'email_verified', true
    ),
    'email',
    p_id::text,
    timezone('utc', now()),
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (provider, provider_id) do update
    set
      identity_data = excluded.identity_data,
      updated_at = timezone('utc', now());

  -- Ensure profile exists even if trigger already ran / conflicted
  insert into public.profiles (id, email, full_name, role, phone)
  values (
    p_id,
    p_email,
    p_full_name,
    p_role,
    '+1555' || lpad((abs(hashtext(p_email)) % 10000000)::text, 7, '0')
  )
  on conflict (id) do update
    set
      email = excluded.email,
      full_name = excluded.full_name,
      role = excluded.role,
      phone = coalesce(public.profiles.phone, excluded.phone),
      updated_at = timezone('utc', now());
end;
$$;

-- ---------------------------------------------------------------------------
-- Fixed IDs
-- ---------------------------------------------------------------------------

do $$
declare
  v_owner_id uuid := '11111111-1111-4111-8111-111111111111';
  v_restaurant_id uuid := '22222222-2222-4222-8222-222222222222';
  v_customer_ids uuid[] := array[
    'a0000001-0001-4001-8001-000000000001'::uuid,
    'a0000002-0002-4002-8002-000000000002'::uuid,
    'a0000003-0003-4003-8003-000000000003'::uuid,
    'a0000004-0004-4004-8004-000000000004'::uuid,
    'a0000005-0005-4005-8005-000000000005'::uuid,
    'a0000006-0006-4006-8006-000000000006'::uuid,
    'a0000007-0007-4007-8007-000000000007'::uuid,
    'a0000008-0008-4008-8008-000000000008'::uuid,
    'a0000009-0009-4009-8009-000000000009'::uuid,
    'a0000010-0010-4010-8010-000000000010'::uuid
  ];
  v_category_ids uuid[] := array[
    'c0000001-0001-4001-8001-000000000001'::uuid,
    'c0000002-0002-4002-8002-000000000002'::uuid,
    'c0000003-0003-4003-8003-000000000003'::uuid,
    'c0000004-0004-4004-8004-000000000004'::uuid,
    'c0000005-0005-4005-8005-000000000005'::uuid
  ];
  v_menu_ids uuid[] := array[
    'b0000001-0001-4001-8001-000000000001'::uuid,
    'b0000002-0002-4002-8002-000000000002'::uuid,
    'b0000003-0003-4003-8003-000000000003'::uuid,
    'b0000004-0004-4004-8004-000000000004'::uuid,
    'b0000005-0005-4005-8005-000000000005'::uuid,
    'b0000006-0006-4006-8006-000000000006'::uuid,
    'b0000007-0007-4007-8007-000000000007'::uuid,
    'b0000008-0008-4008-8008-000000000008'::uuid,
    'b0000009-0009-4009-8009-000000000009'::uuid,
    'b0000010-0010-4010-8010-000000000010'::uuid,
    'b0000011-0011-4011-8011-000000000011'::uuid,
    'b0000012-0012-4012-8012-000000000012'::uuid,
    'b0000013-0013-4013-8013-000000000013'::uuid,
    'b0000014-0014-4014-8014-000000000014'::uuid,
    'b0000015-0015-4015-8015-000000000015'::uuid,
    'b0000016-0016-4016-8016-000000000016'::uuid,
    'b0000017-0017-4017-8017-000000000017'::uuid,
    'b0000018-0018-4018-8018-000000000018'::uuid,
    'b0000019-0019-4019-8019-000000000019'::uuid,
    'b0000020-0020-4020-8020-000000000020'::uuid
  ];
  v_order_ids uuid[] := array[
    'd0000001-0001-4001-8001-000000000001'::uuid,
    'd0000002-0002-4002-8002-000000000002'::uuid,
    'd0000003-0003-4003-8003-000000000003'::uuid,
    'd0000004-0004-4004-8004-000000000004'::uuid,
    'd0000005-0005-4005-8005-000000000005'::uuid,
    'd0000006-0006-4006-8006-000000000006'::uuid,
    'd0000007-0007-4007-8007-000000000007'::uuid,
    'd0000008-0008-4008-8008-000000000008'::uuid,
    'd0000009-0009-4009-8009-000000000009'::uuid,
    'd0000010-0010-4010-8010-000000000010'::uuid,
    'd0000011-0011-4011-8011-000000000011'::uuid,
    'd0000012-0012-4012-8012-000000000012'::uuid,
    'd0000013-0013-4013-8013-000000000013'::uuid,
    'd0000014-0014-4014-8014-000000000014'::uuid,
    'd0000015-0015-4015-8015-000000000015'::uuid,
    'd0000016-0016-4016-8016-000000000016'::uuid,
    'd0000017-0017-4017-8017-000000000017'::uuid,
    'd0000018-0018-4018-8018-000000000018'::uuid,
    'd0000019-0019-4019-8019-000000000019'::uuid,
    'd0000020-0020-4020-8020-000000000020'::uuid,
    'd0000021-0021-4021-8021-000000000021'::uuid,
    'd0000022-0022-4022-8022-000000000022'::uuid,
    'd0000023-0023-4023-8023-000000000023'::uuid,
    'd0000024-0024-4024-8024-000000000024'::uuid,
    'd0000025-0025-4025-8025-000000000025'::uuid
  ];
  v_customer_names text[] := array[
    'Ava Thompson', 'Noah Patel', 'Mia Chen', 'Liam Garcia', 'Emma Wilson',
    'Oliver Brown', 'Sophia Davis', 'Elijah Martinez', 'Isabella Lee', 'Lucas Anderson'
  ];
  v_category_names text[] := array[
    'Starters', 'Mains', 'Sides', 'Drinks', 'Desserts'
  ];
  v_menu_names text[] := array[
    'Crispy Calamari', 'Tomato Bruschetta', 'Soup of the Day', 'Garden Salad',
    'Grilled Salmon', 'Herb Roast Chicken', 'Ribeye Steak', 'Mushroom Risotto',
    'Truffle Pasta', 'Vegan Buddha Bowl',
    'Garlic Fries', 'Mac & Cheese', 'Seasonal Vegetables', 'Loaded Potatoes',
    'House Lemonade', 'Iced Tea', 'Craft Cola', 'Espresso',
    'Chocolate Lava Cake', 'Vanilla Panna Cotta'
  ];
  v_menu_prices numeric[] := array[
    12.50, 9.00, 8.50, 10.00,
    24.00, 19.50, 32.00, 18.00,
    21.00, 16.50,
    6.50, 7.50, 5.50, 8.00,
    4.50, 3.50, 3.00, 3.75,
    9.50, 8.00
  ];
  v_statuses public.order_status[] := array[
    'Completed', 'Completed', 'Completed', 'Completed', 'Completed',
    'Completed', 'Completed', 'Completed', 'Completed', 'Completed',
    'Completed', 'Completed', 'Preparing', 'Ready', 'OutForDelivery',
    'Accepted', 'Pending', 'Pending', 'Cancelled', 'Completed',
    'Completed', 'Completed', 'Completed', 'Completed', 'Completed'
  ];
  i int;
  j int;
  v_cat uuid;
  v_item uuid;
  v_customer uuid;
  v_order uuid;
  v_status public.order_status;
  v_subtotal numeric(12, 2);
  v_tax numeric(12, 2);
  v_delivery numeric(12, 2);
  v_discount numeric(12, 2);
  v_total numeric(12, 2);
  v_price numeric(12, 2);
  v_qty int;
  v_item_a uuid;
  v_item_b uuid;
begin
  -- Owner
  perform public.seed_auth_user(
    v_owner_id,
    'owner@harborgrill.demo',
    'Jordan Hale',
    'restaurant',
    'Harbor Grill'
  );

  -- Customers
  for i in 1..10 loop
    perform public.seed_auth_user(
      v_customer_ids[i],
      format('customer%s@orderflow.demo', lpad(i::text, 2, '0')),
      v_customer_names[i],
      'customer'
    );
  end loop;

  -- Restaurant (upsert; replace any auto-created shell)
  insert into public.restaurants (
    id, owner_id, name, description, logo, cover_image,
    address, city, country, postal_code, phone, email,
    opening_time, closing_time, is_open, rating, total_reviews
  )
  values (
    v_restaurant_id,
    v_owner_id,
    'Harbor Grill',
    'Coastal comfort food with wood-fired mains, seasonal sides, and house desserts.',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    '128 Pier Avenue',
    'San Francisco',
    'USA',
    '94105',
    '+14155550100',
    'hello@harborgrill.demo',
    time '10:00',
    time '22:00',
    true,
    0,
    0
  )
  on conflict (id) do update
    set
      name = excluded.name,
      description = excluded.description,
      logo = excluded.logo,
      cover_image = excluded.cover_image,
      address = excluded.address,
      city = excluded.city,
      country = excluded.country,
      postal_code = excluded.postal_code,
      phone = excluded.phone,
      email = excluded.email,
      opening_time = excluded.opening_time,
      closing_time = excluded.closing_time,
      is_open = excluded.is_open,
      updated_at = timezone('utc', now());

  -- Remove leftover auto-created restaurants for this owner (keep seeded one)
  delete from public.restaurants
  where owner_id = v_owner_id
    and id <> v_restaurant_id;

  -- Categories
  for i in 1..5 loop
    insert into public.categories (id, restaurant_id, name, display_order, is_active)
    values (v_category_ids[i], v_restaurant_id, v_category_names[i], i, true)
    on conflict (id) do update
      set name = excluded.name, display_order = excluded.display_order, is_active = true;
  end loop;

  -- Menu items (4 per category)
  for i in 1..20 loop
    v_cat := v_category_ids[((i - 1) / 4) + 1];
    insert into public.menu_items (
      id, restaurant_id, category_id, name, description, price, image,
      is_available, preparation_time, calories
    )
    values (
      v_menu_ids[i],
      v_restaurant_id,
      v_cat,
      v_menu_names[i],
      format('Chef-crafted %s from Harbor Grill.', lower(v_menu_names[i])),
      v_menu_prices[i],
      (array[
        'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80',
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
        'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=800&q=80',
        'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
        'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
        'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',
        'https://images.unsplash.com/photo-1573080496219-bb082ddcea63?w=800&q=80',
        'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
        'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
        'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
        'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
        'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
        'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
        'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
        'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
        'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
        'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80',
        'https://images.unsplash.com/photo-1558857563-b37103387363?w=800&q=80'
      ])[i],
      true,
      10 + ((i * 3) % 25),
      180 + (i * 35)
    )
    on conflict (id) do update
      set
        name = excluded.name,
        description = excluded.description,
        price = excluded.price,
        image = excluded.image,
        category_id = excluded.category_id,
        is_available = true,
        updated_at = timezone('utc', now());
  end loop;

  -- Inventory stock levels
  for i in 1..20 loop
    update public.inventory
    set
      stock = 20 + ((i * 7) % 40),
      low_stock_limit = 5
    where menu_item_id = v_menu_ids[i];
  end loop;

  -- Orders + items
  for i in 1..25 loop
    v_order := v_order_ids[i];
    v_customer := v_customer_ids[((i - 1) % 10) + 1];
    v_status := v_statuses[i];
    v_item_a := v_menu_ids[((i - 1) % 20) + 1];
    v_item_b := v_menu_ids[((i + 3) % 20) + 1];

    -- Build monetary totals from two line items
    select price into v_price from public.menu_items where id = v_item_a;
    v_qty := 1 + (i % 3);
    v_subtotal := round((v_price * v_qty)::numeric, 2);

    select price into v_price from public.menu_items where id = v_item_b;
    v_qty := 1 + ((i + 1) % 2);
    v_subtotal := round((v_subtotal + (v_price * v_qty))::numeric, 2);

    v_tax := round((v_subtotal * 0.08)::numeric, 2);
    v_delivery := case when i % 4 = 0 then 0 else 3.99 end;
    v_discount := case when i % 5 = 0 then 5.00 else 0 end;
    v_total := round((v_subtotal + v_tax + v_delivery - v_discount)::numeric, 2);

    insert into public.orders (
      id, order_number, customer_id, restaurant_id, status,
      subtotal, tax, delivery_fee, discount, total,
      payment_status, payment_method, delivery_address, notes,
      estimated_delivery, created_at, updated_at
    )
    values (
      v_order,
      format('OF-SEED-%s', lpad(i::text, 5, '0')),
      v_customer,
      v_restaurant_id,
      v_status,
      v_subtotal,
      v_tax,
      v_delivery,
      v_discount,
      v_total,
      case
        when v_status in ('Completed', 'OutForDelivery', 'Ready') then 'Paid'::public.payment_status
        when v_status = 'Cancelled' then 'Refunded'::public.payment_status
        else 'Pending'::public.payment_status
      end,
      (array['Card', 'UPI', 'Cash']::public.payment_method[])[1 + (i % 3)],
      format('%s Market Street, Apt %s, San Francisco, CA', 100 + i, i),
      case when i % 3 = 0 then 'Please ring the doorbell' else null end,
      timezone('utc', now()) + make_interval(mins => 30 + i),
      timezone('utc', now()) - make_interval(days => (25 - i), hours => (i % 12)),
      timezone('utc', now()) - make_interval(days => (25 - i), hours => (i % 12))
    )
    on conflict (id) do update
      set
        status = excluded.status,
        subtotal = excluded.subtotal,
        tax = excluded.tax,
        delivery_fee = excluded.delivery_fee,
        discount = excluded.discount,
        total = excluded.total,
        payment_status = excluded.payment_status,
        updated_at = timezone('utc', now());

    delete from public.order_items where order_id = v_order;

    select price into v_price from public.menu_items where id = v_item_a;
    v_qty := 1 + (i % 3);
    insert into public.order_items (order_id, menu_item_id, quantity, price, subtotal)
    values (
      v_order,
      v_item_a,
      v_qty,
      v_price,
      round((v_price * v_qty)::numeric, 2)
    );

    select price into v_price from public.menu_items where id = v_item_b;
    v_qty := 1 + ((i + 1) % 2);
    insert into public.order_items (order_id, menu_item_id, quantity, price, subtotal)
    values (
      v_order,
      v_item_b,
      v_qty,
      v_price,
      round((v_price * v_qty)::numeric, 2)
    );
  end loop;

  -- Reviews (only for customers with completed orders — first 8 customers)
  for i in 1..8 loop
    insert into public.reviews (restaurant_id, customer_id, rating, review)
    values (
      v_restaurant_id,
      v_customer_ids[i],
      3 + (i % 3),
      format('Great experience #%s at Harbor Grill. Food arrived hot and on time.', i)
    )
    on conflict (restaurant_id, customer_id) do update
      set rating = excluded.rating, review = excluded.review;
  end loop;

  -- Favorites
  for i in 1..6 loop
    insert into public.favorites (customer_id, restaurant_id)
    values (v_customer_ids[i], v_restaurant_id)
    on conflict (customer_id, restaurant_id) do nothing;
  end loop;

  -- Sample notifications for owner + a few customers
  insert into public.notifications (user_id, title, message, type, is_read)
  values
    (
      v_owner_id,
      'Welcome to Fudexa',
      'Your Harbor Grill workspace is ready. Review incoming orders from the dashboard.',
      'system',
      false
    ),
    (
      v_customer_ids[1],
      'Thanks for ordering',
      'Your recent Harbor Grill order is on its way.',
      'order',
      false
    )
  on conflict do nothing;

  raise notice 'Fudexa seed complete. Owner: owner@harborgrill.demo / Password123!';
end $$;

-- Optional: keep seed helper for re-runs; drop if you prefer a clean public schema
-- drop function if exists public.seed_auth_user(uuid, text, text, public.user_role, text, text);
