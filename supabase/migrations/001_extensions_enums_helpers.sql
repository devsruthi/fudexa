-- =============================================================================
-- OrderFlow 001 — Extensions, enums, and shared helpers
-- Execute first in the Supabase SQL Editor.
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $$ begin
  create type public.user_role as enum ('customer', 'restaurant');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.order_status as enum (
    'Pending',
    'Accepted',
    'Preparing',
    'Ready',
    'OutForDelivery',
    'Completed',
    'Cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_status as enum (
    'Pending',
    'Paid',
    'Failed',
    'Refunded'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.payment_method as enum ('Cash', 'Card', 'UPI');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.inventory_status as enum (
    'InStock',
    'LowStock',
    'OutOfStock'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.notification_type as enum (
    'order',
    'system',
    'promotion',
    'review'
  );
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------------
-- Shared timestamp trigger function
-- ---------------------------------------------------------------------------

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

comment on function public.handle_updated_at() is
  'Sets updated_at to UTC now() on row update.';

-- Profile-dependent helpers (current_user_role, is_customer, is_restaurant_user)
-- are created in 002_profiles.sql AFTER profiles.role is the user_role enum.
-- Creating them here fails when an older profiles.role text column still exists.

-- Defined after restaurants table exists; stubbed here and replaced in 003.
create or replace function public.owns_restaurant(p_restaurant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select false;
$$;
