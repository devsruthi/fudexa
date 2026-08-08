-- =============================================================================
-- Fudexa 010 — Privileges for PostgREST (anon / authenticated / service_role)
-- =============================================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;
grant all on all tables in schema public to service_role;

grant usage, select on all sequences in schema public to authenticated, service_role;

grant execute on all functions in schema public to authenticated, anon, service_role;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;

alter default privileges in schema public
  grant select on tables to anon;

alter default privileges in schema public
  grant all on tables to service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;

alter default privileges in schema public
  grant execute on functions to authenticated, anon, service_role;

-- Views already granted in 007; reaffirm
grant select on
  public.analytics_restaurant_revenue,
  public.analytics_daily_orders,
  public.analytics_monthly_sales,
  public.analytics_best_selling_menu_items,
  public.analytics_top_customers,
  public.analytics_average_order_value,
  public.analytics_popular_categories
to authenticated, service_role;
