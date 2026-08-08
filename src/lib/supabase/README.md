# supabase

Typed Supabase browser client and PostgreSQL migrations for Fudexa.

## Client

- `supabase.ts` — browser client with session persistence + auto refresh
- `database.types.ts` — generated-style TypeScript types for tables, views, enums

## Migrations

Run **in order** in the Supabase SQL Editor (or via Supabase CLI):

| File | Purpose |
| --- | --- |
| `001_extensions_enums_helpers.sql` | Extensions, enums, shared helpers |
| `002_profiles.sql` | Profiles + signup trigger (profile only) |
| `003_restaurants_menu_inventory.sql` | Restaurants, categories, menu, inventory + bootstrap restaurant on signup |
| `004_orders.sql` | Orders, order items, order number sequence |
| `005_reviews_favorites_notifications.sql` | Reviews, favorites, notifications + rating/inventory triggers |
| `006_rls_policies.sql` | Row Level Security for all tables |
| `007_analytics_views.sql` | Revenue, daily/monthly, bestsellers, AOV, etc. |
| `008_storage_realtime.sql` | Realtime publication + storage buckets/policies |
| `009_seed_data.sql` | Demo restaurant, menu, customers, orders |
| `010_grants.sql` | Table/sequence/function grants for PostgREST |

### Auth redirect URLs

Add to Supabase Auth URL configuration:

- `http://localhost:5173/login`
- `http://localhost:5173/reset-password`

### Seed logins

After `009_seed_data.sql`:

| Email | Role | Password |
| --- | --- | --- |
| `owner@harborgrill.demo` | restaurant | `Password123!` |
| `customer01@orderflow.demo` … `customer10@orderflow.demo` | customer | `Password123!` |

### Storage path conventions

| Bucket | Path |
| --- | --- |
| `restaurant-logos` | `{restaurant_id}/...` |
| `restaurant-covers` | `{restaurant_id}/...` |
| `menu-images` | `{restaurant_id}/...` |
| `avatars` | `{user_id}/...` |
