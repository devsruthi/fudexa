-- =============================================================================
-- OrderFlow 002 — Profiles
-- =============================================================================

do $$
begin
  if exists (
    select 1
    from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then
    alter table public.profiles add column if not exists phone text;

    -- Drop legacy check constraints that pin role to text literals
    alter table public.profiles drop constraint if exists profiles_role_check;
    alter table public.profiles drop constraint if exists restaurant_name_required;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'role'
        and udt_name in ('text', 'varchar', 'bpchar')
    ) then
      alter table public.profiles
        alter column role drop default;

      alter table public.profiles
        alter column role type public.user_role
        using trim(role)::public.user_role;
    end if;

    if exists (
      select 1
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'profiles'
        and column_name = 'restaurant_name'
    ) then
      alter table public.profiles drop column restaurant_name;
    end if;
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null,
  avatar_url text,
  phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint profiles_email_format check (position('@' in email) > 1),
  constraint profiles_full_name_length check (char_length(trim(full_name)) >= 1)
);

create unique index if not exists profiles_email_uidx on public.profiles (lower(email));
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_created_at_idx on public.profiles (created_at desc);

comment on table public.profiles is 'Application user profiles linked 1:1 with auth.users.';

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Profile-only signup handler (restaurant bootstrap added in 003).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_role public.user_role;
begin
  begin
    selected_role := coalesce(
      (new.raw_user_meta_data ->> 'role')::public.user_role,
      'customer'::public.user_role
    );
  exception when others then
    selected_role := 'customer'::public.user_role;
  end;

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

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;

-- ---------------------------------------------------------------------------
-- Auth helper functions (used by RLS) — require profiles.role as user_role
-- ---------------------------------------------------------------------------

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'customer'::public.user_role
  );
$$;

create or replace function public.is_restaurant_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'restaurant'::public.user_role
  );
$$;
