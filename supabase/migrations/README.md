# OrderFlow database migrations

Production-ready PostgreSQL schema for the multi-restaurant ordering platform.

## Execute

In the Supabase Dashboard → **SQL Editor**, run each file top-to-bottom:

1. `001_extensions_enums_helpers.sql`
2. `002_profiles.sql`
3. `003_restaurants_menu_inventory.sql`
4. `004_orders.sql`
5. `005_reviews_favorites_notifications.sql`
6. `006_rls_policies.sql`
7. `007_analytics_views.sql`
8. `008_storage_realtime.sql`
9. `009_seed_data.sql` (optional demo data)
10. `010_grants.sql`
11. `011_restaurant_dashboard_extensions.sql` (merchant dashboard: settings fields, review replies, order status events, inventory movements)
12. `012_realtime_ops.sql` (order `version` for concurrency, publish reviews + restaurants to realtime)

Or with the CLI (linked project):

```bash
supabase db push
```

## Schema overview

```
auth.users 1—1 profiles
profiles (restaurant) 1—* restaurants
restaurants 1—* categories 1—* menu_items 1—1 inventory
profiles (customer) 1—* orders *—1 restaurants
orders 1—* order_items *—1 menu_items
restaurants 1—* reviews *—1 profiles (customer)
profiles (customer) *—* restaurants  (favorites)
profiles 1—* notifications
```

## Realtime tables

`orders`, `notifications`, `inventory`
