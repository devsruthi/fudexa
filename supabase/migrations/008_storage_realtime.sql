-- =============================================================================
-- OrderFlow 008 — Realtime publication + Storage buckets & policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

do $$
begin
  -- Add tables to supabase_realtime publication if not already present
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'orders'
  ) then
    alter publication supabase_realtime add table public.orders;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'inventory'
  ) then
    alter publication supabase_realtime add table public.inventory;
  end if;
end $$;

-- Replica identity full improves realtime UPDATE/DELETE payloads
alter table public.orders replica identity full;
alter table public.notifications replica identity full;
alter table public.inventory replica identity full;

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'restaurant-logos',
    'restaurant-logos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'restaurant-covers',
    'restaurant-covers',
    true,
    10485760,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'menu-images',
    'menu-images',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152,
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  )
on conflict (id) do update
  set
    public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Storage helper: path convention
--   restaurant-logos / restaurant-covers / menu-images : {restaurant_id}/...
--   avatars : {user_id}/...
-- ---------------------------------------------------------------------------

create or replace function public.storage_restaurant_id_from_path(object_name text)
returns uuid
language plpgsql
immutable
as $$
declare
  first_segment text;
begin
  first_segment := split_part(object_name, '/', 1);
  begin
    return first_segment::uuid;
  exception when others then
    return null;
  end;
end;
$$;

-- Drop existing storage policies for these buckets (idempotent)
do $$
declare
  r record;
begin
  for r in
    select policyname
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname like 'orderflow_%'
  loop
    execute format('drop policy if exists %I on storage.objects', r.policyname);
  end loop;
end $$;

-- Public read for public buckets
create policy "orderflow_public_read_restaurant_logos"
  on storage.objects for select
  to public
  using (bucket_id = 'restaurant-logos');

create policy "orderflow_public_read_restaurant_covers"
  on storage.objects for select
  to public
  using (bucket_id = 'restaurant-covers');

create policy "orderflow_public_read_menu_images"
  on storage.objects for select
  to public
  using (bucket_id = 'menu-images');

create policy "orderflow_public_read_avatars"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Restaurant owners manage logo/cover/menu images under their restaurant folder
create policy "orderflow_owner_write_restaurant_logos"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-logos'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_update_restaurant_logos"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'restaurant-logos'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  )
  with check (
    bucket_id = 'restaurant-logos'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_delete_restaurant_logos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'restaurant-logos'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_write_restaurant_covers"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'restaurant-covers'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_update_restaurant_covers"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'restaurant-covers'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  )
  with check (
    bucket_id = 'restaurant-covers'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_delete_restaurant_covers"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'restaurant-covers'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_write_menu_images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'menu-images'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_update_menu_images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'menu-images'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  )
  with check (
    bucket_id = 'menu-images'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

create policy "orderflow_owner_delete_menu_images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'menu-images'
    and public.owns_restaurant(public.storage_restaurant_id_from_path(name))
  );

-- Avatars: users manage files under their own user id folder
create policy "orderflow_user_write_avatars"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "orderflow_user_update_avatars"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );

create policy "orderflow_user_delete_avatars"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  );
