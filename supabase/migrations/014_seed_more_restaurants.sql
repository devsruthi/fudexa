-- =============================================================================
-- Fudexa 014 — 10 additional demo restaurants + images
-- Requires: 009 (seed_auth_user helper + customers exist)
-- Password for new owners: Password123!
-- =============================================================================

do $$
declare
  -- Fixed owner IDs (b1…b10)
  v_owners uuid[] := array[
    'b1000001-0001-4001-8001-000000000001'::uuid,
    'b1000002-0002-4002-8002-000000000002'::uuid,
    'b1000003-0003-4003-8003-000000000003'::uuid,
    'b1000004-0004-4004-8004-000000000004'::uuid,
    'b1000005-0005-4005-8005-000000000005'::uuid,
    'b1000006-0006-4006-8006-000000000006'::uuid,
    'b1000007-0007-4007-8007-000000000007'::uuid,
    'b1000008-0008-4008-8008-000000000008'::uuid,
    'b1000009-0009-4009-8009-000000000009'::uuid,
    'b1000010-0010-4010-8010-000000000010'::uuid
  ];
  -- Fixed restaurant IDs (c1…c10)
  v_restaurants uuid[] := array[
    'c2000001-0001-4001-8001-000000000001'::uuid,
    'c2000002-0002-4002-8002-000000000002'::uuid,
    'c2000003-0003-4003-8003-000000000003'::uuid,
    'c2000004-0004-4004-8004-000000000004'::uuid,
    'c2000005-0005-4005-8005-000000000005'::uuid,
    'c2000006-0006-4006-8006-000000000006'::uuid,
    'c2000007-0007-4007-8007-000000000007'::uuid,
    'c2000008-0008-4008-8008-000000000008'::uuid,
    'c2000009-0009-4009-8009-000000000009'::uuid,
    'c2000010-0010-4010-8010-000000000010'::uuid
  ];

  v_names text[] := array[
    'Nonna''s Kitchen',
    'Sakura Ramen House',
    'El Fogón',
    'Spice Route',
    'Green Bowl',
    'Ember Steakhouse',
    'Bao & Bun',
    'Maison Crêpe',
    'Pizza Vesuvio',
    'Burger District'
  ];
  v_emails text[] := array[
    'owner@nonnas.demo',
    'owner@sakura.demo',
    'owner@elfogon.demo',
    'owner@spiceroute.demo',
    'owner@greenbowl.demo',
    'owner@ember.demo',
    'owner@baobun.demo',
    'owner@maisoncrepe.demo',
    'owner@vesuvio.demo',
    'owner@burgerdistrict.demo'
  ];
  v_owner_names text[] := array[
    'Sofia Ricci',
    'Kenji Nakamura',
    'Diego Morales',
    'Priya Sharma',
    'Maya Chen',
    'Marcus Webb',
    'Linh Tran',
    'Camille Dubois',
    'Luca Bianchi',
    'Alex Rivera'
  ];
  v_descriptions text[] := array[
    'Homestyle Italian trattoria — handmade pasta, wood-oven pizzas, and nonna''s tiramisu.',
    'Tokyo-inspired ramen bowls, gyoza, and seasonal izakaya sides.',
    'Vibrant Mexican street food — tacos al pastor, fresh salsas, and aguas frescas.',
    'Bold Indian curries, tandoor breads, and fragrant biryanis.',
    'Bright bowls, salads, and cold-pressed juices for everyday eating.',
    'Charcoal steaks, craft cocktails, and classic American sides.',
    'Steamed bao, crispy dumplings, and modern Asian snacks.',
    'Parisian crêpes, quiches, and café sweets — sweet or savory.',
    'Neapolitan-style pizza, focaccia, and Italian gelato.',
    'Smash burgers, loaded fries, and thick milkshakes.'
  ];
  v_addresses text[] := array[
    '42 Olive Street',
    '88 Cherry Blossom Ave',
    '15 Mission Street',
    '210 Spice Lane',
    '77 Garden Road',
    '9 Ember Way',
    '55 Lantern Court',
    '3 Rue Lafayette',
    '120 Vesuvio Plaza',
    '64 Grill Avenue'
  ];
  v_cities text[] := array[
    'San Francisco',
    'Oakland',
    'San Jose',
    'Berkeley',
    'Palo Alto',
    'San Francisco',
    'Daly City',
    'San Francisco',
    'Redwood City',
    'San Mateo'
  ];
  v_phones text[] := array[
    '+14155550101', '+14155550102', '+14085550103', '+15105550104', '+16505550105',
    '+14155550106', '+16505550107', '+14155550108', '+16505550109', '+16505550110'
  ];
  -- Cover / hero images (Unsplash)
  v_covers text[] := array[
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&q=80',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1200&q=80',
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=1200&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=1200&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=1200&q=80',
    'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=1200&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=1200&q=80',
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80'
  ];
  -- Logo / secondary images
  v_logos text[] := array[
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&q=80',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&q=80',
    'https://images.unsplash.com/photo-1565557623262-b51c2513a41f?w=400&q=80',
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80',
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80'
  ];

  -- 3 category names per restaurant (flat: index = (r-1)*3 + c)
  v_cat_names text[] := array[
    'Pasta', 'Mains', 'Desserts',
    'Ramen', 'Sides', 'Drinks',
    'Tacos', 'Plates', 'Extras',
    'Curries', 'Breads', 'Rice',
    'Bowls', 'Salads', 'Juices',
    'Steaks', 'Sides', 'Desserts',
    'Bao', 'Dumplings', 'Snacks',
    'Sweet', 'Savory', 'Café',
    'Pizzas', 'Starters', 'Gelato',
    'Burgers', 'Fries', 'Shakes'
  ];

  -- 6 dishes per restaurant (flat: index = (r-1)*6 + d)
  v_dish_names text[] := array[
    'Cacio e Pepe', 'Tagliatelle Bolognese', 'Margherita Pizza', 'Chicken Parmigiana', 'Tiramisu', 'Panna Cotta',
    'Tonkotsu Ramen', 'Shoyu Ramen', 'Spicy Miso Bowl', 'Gyoza (6pc)', 'Edamame', 'Yuzu Soda',
    'Al Pastor Tacos', 'Carnitas Plate', 'Veggie Burrito', 'Elote Street Corn', 'Guacamole & Chips', 'Horchata',
    'Butter Chicken', 'Lamb Rogan Josh', 'Palak Paneer', 'Garlic Naan', 'Chicken Biryani', 'Mango Lassi',
    'Harvest Grain Bowl', 'Mediterranean Bowl', 'Kale Caesar', 'Avocado Toast Bowl', 'Green Goddess Juice', 'Berry Smoothie',
    'Ribeye 12oz', 'Filet Mignon', 'NY Strip', 'Truffle Fries', 'Creamed Spinach', 'Chocolate Lava Cake',
    'Pork Belly Bao', 'Chicken Karaage Bao', 'Shrimp Dumplings', 'Veggie Dumplings', 'Chili Oil Cucumbers', 'Milk Tea',
    'Nutella Banana Crêpe', 'Berry Cream Crêpe', 'Ham & Gruyère', 'Spinach Quiche', 'Café au Lait', 'Pain au Chocolat',
    'Margherita', 'Diavola', 'Quattro Formaggi', 'Bruschetta', 'Caprese', 'Pistachio Gelato',
    'Classic Smash', 'Double Cheddar', 'BBQ Bacon Burger', 'Loaded Fries', 'Onion Rings', 'Vanilla Malt'
  ];
  v_dish_prices numeric[] := array[
    16.50, 18.00, 15.00, 19.50, 9.00, 8.50,
    14.50, 13.50, 15.00, 8.00, 5.50, 4.00,
    12.00, 14.50, 11.50, 6.50, 7.00, 4.50,
    15.50, 17.00, 13.50, 4.50, 14.00, 5.00,
    13.00, 13.50, 11.00, 12.00, 6.50, 7.00,
    42.00, 48.00, 39.00, 9.50, 8.00, 10.00,
    11.00, 10.50, 9.50, 8.50, 6.00, 5.50,
    9.50, 10.00, 11.50, 10.50, 4.50, 5.00,
    14.00, 16.00, 17.00, 8.50, 9.00, 6.50,
    12.50, 14.50, 15.50, 7.50, 6.50, 6.00
  ];
  v_dish_images text[] := array[
    -- Nonna's
    'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=800&q=80',
    'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=80',
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=800&q=80',
    'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    -- Sakura
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80',
    'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&q=80',
    'https://images.unsplash.com/photo-1591814468924-caf88d1232cd?w=800&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
    -- El Fogón
    'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
    'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80',
    'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&q=80',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
    -- Spice Route
    'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=800&q=80',
    'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80',
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
    'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&q=80',
    -- Green Bowl
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
    'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=800&q=80',
    'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80',
    'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80',
    -- Ember
    'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80',
    'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb082ddcea63?w=800&q=80',
    'https://images.unsplash.com/photo-1607532941433-304659e8198a?w=800&q=80',
    'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=800&q=80',
    -- Bao & Bun
    'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80',
    'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=800&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
    'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=800&q=80',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=800&q=80',
    'https://images.unsplash.com/photo-1558857563-b37103387363?w=800&q=80',
    -- Maison Crêpe
    'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80',
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c64120?w=800&q=80',
    'https://images.unsplash.com/photo-1506084868230-bb9d95c64120?w=800&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
    -- Vesuvio
    'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80',
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    'https://images.unsplash.com/photo-1571407970349-bc81e7e96d20?w=800&q=80',
    'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=800&q=80',
    'https://images.unsplash.com/photo-1608897013039-887f21d8c804?w=800&q=80',
    'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&q=80',
    -- Burger District
    'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
    'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
    'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80',
    'https://images.unsplash.com/photo-1573080496219-bb082ddcea63?w=800&q=80',
    'https://images.unsplash.com/photo-1639024471283-035266509953?w=800&q=80',
    'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&q=80'
  ];

  v_harbor uuid := '22222222-2222-4222-8222-222222222222';
  v_harbor_menu uuid[] := array[
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
  v_harbor_images text[] := array[
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
  ];

  r int;
  c int;
  d int;
  v_cat_id uuid;
  v_item_id uuid;
  v_flat int;
  v_rating numeric;
begin
  if to_regprocedure('public.seed_auth_user(uuid, text, text, public.user_role, text, text)') is null then
    raise exception '014 requires public.seed_auth_user from migration 009. Run 009 first.';
  end if;

  -- -------------------------------------------------------------------------
  -- Harbor Grill: add cover + dish images
  -- -------------------------------------------------------------------------
  update public.restaurants
  set
    cover_image = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    logo = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=80',
    updated_at = timezone('utc', now())
  where id = v_harbor;

  for d in 1..20 loop
    update public.menu_items
    set image = v_harbor_images[d], updated_at = timezone('utc', now())
    where id = v_harbor_menu[d];
  end loop;

  -- -------------------------------------------------------------------------
  -- 10 new restaurants
  -- -------------------------------------------------------------------------
  for r in 1..10 loop
    perform public.seed_auth_user(
      v_owners[r],
      v_emails[r],
      v_owner_names[r],
      'restaurant',
      v_names[r]
    );

    v_rating := round((3.8 + (r % 5) * 0.2)::numeric, 1);

    insert into public.restaurants (
      id, owner_id, name, description, logo, cover_image,
      address, city, country, postal_code, phone, email,
      opening_time, closing_time, is_open, rating, total_reviews
    )
    values (
      v_restaurants[r],
      v_owners[r],
      v_names[r],
      v_descriptions[r],
      v_logos[r],
      v_covers[r],
      v_addresses[r],
      v_cities[r],
      'USA',
      format('94%s', lpad((100 + r)::text, 3, '0')),
      v_phones[r],
      replace(v_emails[r], 'owner@', 'hello@'),
      time '10:00',
      time '22:00',
      (r % 7) <> 0,
      v_rating,
      4 + (r * 3)
    )
    on conflict (id) do update
      set
        name = excluded.name,
        description = excluded.description,
        logo = excluded.logo,
        cover_image = excluded.cover_image,
        address = excluded.address,
        city = excluded.city,
        phone = excluded.phone,
        email = excluded.email,
        opening_time = excluded.opening_time,
        closing_time = excluded.closing_time,
        is_open = excluded.is_open,
        rating = excluded.rating,
        total_reviews = excluded.total_reviews,
        updated_at = timezone('utc', now());

    -- Drop auto-created shell restaurants for this owner
    delete from public.restaurants
    where owner_id = v_owners[r]
      and id <> v_restaurants[r];

    -- Categories (3)
    for c in 1..3 loop
      v_cat_id := (
        lpad(to_hex(r), 8, '0') || '-' ||
        lpad(to_hex(c), 4, '0') || '-' ||
        '4001-8001-d00000000001'
      )::uuid;

      insert into public.categories (id, restaurant_id, name, display_order, is_active)
      values (v_cat_id, v_restaurants[r], v_cat_names[(r - 1) * 3 + c], c, true)
      on conflict (id) do update
        set name = excluded.name, display_order = excluded.display_order, is_active = true;
    end loop;

    -- Menu items (6 = 2 per category)
    for d in 1..6 loop
      v_flat := (r - 1) * 6 + d;
      v_cat_id := (
        lpad(to_hex(r), 8, '0') || '-' ||
        lpad(to_hex(((d - 1) / 2) + 1), 4, '0') || '-' ||
        '4001-8001-d00000000001'
      )::uuid;
      v_item_id := (
        lpad(to_hex(r), 8, '0') || '-' ||
        lpad(to_hex(d), 4, '0') || '-' ||
        '4001-8001-e00000000001'
      )::uuid;

      insert into public.menu_items (
        id, restaurant_id, category_id, name, description, price, image,
        is_available, preparation_time, calories
      )
      values (
        v_item_id,
        v_restaurants[r],
        v_cat_id,
        v_dish_names[v_flat],
        format('House specialty from %s.', v_names[r]),
        v_dish_prices[v_flat],
        v_dish_images[v_flat],
        true,
        12 + ((d * 4) % 20),
        220 + (d * 40) + (r * 5)
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

      update public.inventory
      set stock = 25 + ((r + d) * 3) % 35, low_stock_limit = 5
      where menu_item_id = v_item_id;
    end loop;
  end loop;

  raise notice '014 complete: Harbor Grill images + 10 restaurants seeded. Owners use Password123!.';
end $$;
