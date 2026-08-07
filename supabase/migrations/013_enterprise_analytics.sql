-- =============================================================================
-- OrderFlow 013 — Enterprise analytics views
-- Additional BI rollups for merchant analytics dashboard.
-- =============================================================================

-- Hourly order volume (UTC hour of day)
create or replace view public.analytics_hourly_orders
with (security_invoker = true)
as
select
  o.restaurant_id,
  r.owner_id,
  extract(hour from o.created_at at time zone 'utc')::integer as hour_of_day,
  count(*)::integer as order_count,
  count(*) filter (where o.status = 'Completed')::integer as completed_count,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as revenue
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
group by o.restaurant_id, r.owner_id, extract(hour from o.created_at at time zone 'utc');

comment on view public.analytics_hourly_orders is
  'Order volume and revenue by hour of day (UTC).';

-- Weekday order volume (0=Sunday … 6=Saturday, UTC)
create or replace view public.analytics_weekday_orders
with (security_invoker = true)
as
select
  o.restaurant_id,
  r.owner_id,
  extract(dow from o.created_at at time zone 'utc')::integer as weekday,
  count(*)::integer as order_count,
  count(*) filter (where o.status = 'Completed')::integer as completed_count,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as revenue
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
group by o.restaurant_id, r.owner_id, extract(dow from o.created_at at time zone 'utc');

comment on view public.analytics_weekday_orders is
  'Order volume and revenue by weekday (UTC).';

-- Review distribution + reply rate
create or replace view public.analytics_review_stats
with (security_invoker = true)
as
select
  rv.restaurant_id,
  r.owner_id,
  count(*)::integer as total_reviews,
  coalesce(avg(rv.rating), 0)::numeric(4, 2) as average_rating,
  count(*) filter (where rv.rating = 1)::integer as rating_1,
  count(*) filter (where rv.rating = 2)::integer as rating_2,
  count(*) filter (where rv.rating = 3)::integer as rating_3,
  count(*) filter (where rv.rating = 4)::integer as rating_4,
  count(*) filter (where rv.rating = 5)::integer as rating_5,
  count(*) filter (where rv.reply is not null and length(trim(rv.reply)) > 0)::integer as replied_count,
  case
    when count(*) = 0 then 0
    else round(
      (
        count(*) filter (where rv.reply is not null and length(trim(rv.reply)) > 0)::numeric
        / count(*)::numeric
      ) * 100,
      1
    )
  end as response_rate_pct
from public.reviews rv
join public.restaurants r on r.id = rv.restaurant_id
group by rv.restaurant_id, r.owner_id;

comment on view public.analytics_review_stats is
  'Review rating distribution and owner response rate.';

-- Inventory valuation + stock health
create or replace view public.analytics_inventory_value
with (security_invoker = true)
as
select
  i.restaurant_id,
  r.owner_id,
  count(*)::integer as sku_count,
  count(*) filter (where i.status = 'InStock')::integer as in_stock_count,
  count(*) filter (where i.status = 'LowStock')::integer as low_stock_count,
  count(*) filter (where i.status = 'OutOfStock')::integer as out_of_stock_count,
  coalesce(sum(i.stock * mi.price), 0)::numeric(14, 2) as inventory_value,
  coalesce(sum(i.stock), 0)::integer as total_units
from public.inventory i
join public.restaurants r on r.id = i.restaurant_id
join public.menu_items mi on mi.id = i.menu_item_id
group by i.restaurant_id, r.owner_id;

comment on view public.analytics_inventory_value is
  'Inventory valuation and stock status counts (stock × menu price).';

-- Indexes to speed period-filtered order analytics
create index if not exists orders_restaurant_created_at_idx
  on public.orders (restaurant_id, created_at desc);

create index if not exists orders_restaurant_status_created_at_idx
  on public.orders (restaurant_id, status, created_at desc);

create index if not exists reviews_restaurant_created_at_idx
  on public.reviews (restaurant_id, created_at desc);

grant select on public.analytics_hourly_orders to authenticated;
grant select on public.analytics_weekday_orders to authenticated;
grant select on public.analytics_review_stats to authenticated;
grant select on public.analytics_inventory_value to authenticated;
