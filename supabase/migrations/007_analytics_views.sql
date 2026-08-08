-- =============================================================================
-- Fudexa 007 — Analytics views
-- Restaurant owners should query these filtered by owns_restaurant / owner_id.
-- Views run with invoker rights so RLS on base tables still applies.
-- =============================================================================

-- Restaurant revenue (lifetime paid/completed)
create or replace view public.analytics_restaurant_revenue
with (security_invoker = true)
as
select
  r.id as restaurant_id,
  r.owner_id,
  r.name as restaurant_name,
  count(o.id) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ) as completed_orders,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_revenue,
  coalesce(sum(o.subtotal) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_subtotal,
  coalesce(sum(o.tax) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_tax,
  coalesce(sum(o.delivery_fee) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_delivery_fees,
  coalesce(sum(o.discount) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_discounts
from public.restaurants r
left join public.orders o on o.restaurant_id = r.id
group by r.id, r.owner_id, r.name;

comment on view public.analytics_restaurant_revenue is
  'Lifetime revenue metrics per restaurant (Completed + Paid orders).';

-- Daily orders
create or replace view public.analytics_daily_orders
with (security_invoker = true)
as
select
  o.restaurant_id,
  r.owner_id,
  (o.created_at at time zone 'utc')::date as order_date,
  count(*) as order_count,
  count(*) filter (where o.status = 'Completed') as completed_count,
  count(*) filter (where o.status = 'Cancelled') as cancelled_count,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as revenue
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
group by o.restaurant_id, r.owner_id, (o.created_at at time zone 'utc')::date;

comment on view public.analytics_daily_orders is
  'Per-restaurant daily order volume and revenue.';

-- Monthly sales
create or replace view public.analytics_monthly_sales
with (security_invoker = true)
as
select
  o.restaurant_id,
  r.owner_id,
  date_trunc('month', o.created_at at time zone 'utc')::date as month_start,
  count(*) filter (where o.status = 'Completed') as completed_orders,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as revenue,
  coalesce(avg(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as average_order_value
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
group by o.restaurant_id, r.owner_id, date_trunc('month', o.created_at at time zone 'utc');

comment on view public.analytics_monthly_sales is
  'Per-restaurant monthly sales rollup.';

-- Best selling menu items
create or replace view public.analytics_best_selling_menu_items
with (security_invoker = true)
as
select
  mi.restaurant_id,
  r.owner_id,
  mi.id as menu_item_id,
  mi.name as menu_item_name,
  mi.category_id,
  c.name as category_name,
  coalesce(sum(oi.quantity) filter (where o.id is not null), 0)::integer as units_sold,
  coalesce(sum(oi.subtotal) filter (where o.id is not null), 0)::numeric(14, 2) as revenue,
  count(distinct oi.order_id) filter (where o.id is not null)::integer as order_count
from public.menu_items mi
join public.restaurants r on r.id = mi.restaurant_id
left join public.categories c on c.id = mi.category_id
left join public.order_items oi on oi.menu_item_id = mi.id
left join public.orders o
  on o.id = oi.order_id
 and o.status = 'Completed'
 and o.payment_status = 'Paid'
group by mi.restaurant_id, r.owner_id, mi.id, mi.name, mi.category_id, c.name;

comment on view public.analytics_best_selling_menu_items is
  'Units sold and revenue by menu item (Completed + Paid).';

-- Top customers
create or replace view public.analytics_top_customers
with (security_invoker = true)
as
select
  o.restaurant_id,
  r.owner_id,
  o.customer_id,
  p.full_name as customer_name,
  p.email as customer_email,
  count(*)::integer as order_count,
  coalesce(sum(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as total_spent,
  max(o.created_at) as last_order_at
from public.orders o
join public.restaurants r on r.id = o.restaurant_id
join public.profiles p on p.id = o.customer_id
group by o.restaurant_id, r.owner_id, o.customer_id, p.full_name, p.email;

comment on view public.analytics_top_customers is
  'Customers ranked by spend/order count per restaurant.';

-- Average order value
create or replace view public.analytics_average_order_value
with (security_invoker = true)
as
select
  r.id as restaurant_id,
  r.owner_id,
  r.name as restaurant_name,
  count(o.id) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  )::integer as paid_order_count,
  coalesce(avg(o.total) filter (
    where o.status = 'Completed' and o.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as average_order_value,
  coalesce((
    select round(
      (
        percentile_cont(0.5) within group (order by o2.total)
      )::numeric,
      2
    )
    from public.orders o2
    where o2.restaurant_id = r.id
      and o2.status = 'Completed'
      and o2.payment_status = 'Paid'
  ), 0)::numeric(14, 2) as median_order_value
from public.restaurants r
left join public.orders o on o.restaurant_id = r.id
group by r.id, r.owner_id, r.name;

comment on view public.analytics_average_order_value is
  'Average and median order value per restaurant.';

-- Popular categories
create or replace view public.analytics_popular_categories
with (security_invoker = true)
as
select
  c.restaurant_id,
  r.owner_id,
  c.id as category_id,
  c.name as category_name,
  coalesce(sum(oi.quantity) filter (where o.id is not null), 0)::integer as units_sold,
  coalesce(sum(oi.subtotal) filter (where o.id is not null), 0)::numeric(14, 2) as revenue,
  count(distinct oi.order_id) filter (where o.id is not null)::integer as order_count
from public.categories c
join public.restaurants r on r.id = c.restaurant_id
left join public.menu_items mi on mi.category_id = c.id
left join public.order_items oi on oi.menu_item_id = mi.id
left join public.orders o
  on o.id = oi.order_id
 and o.status = 'Completed'
 and o.payment_status = 'Paid'
group by c.restaurant_id, r.owner_id, c.id, c.name;

comment on view public.analytics_popular_categories is
  'Category popularity by units sold and revenue.';

grant select on public.analytics_restaurant_revenue to authenticated;
grant select on public.analytics_daily_orders to authenticated;
grant select on public.analytics_monthly_sales to authenticated;
grant select on public.analytics_best_selling_menu_items to authenticated;
grant select on public.analytics_top_customers to authenticated;
grant select on public.analytics_average_order_value to authenticated;
grant select on public.analytics_popular_categories to authenticated;
