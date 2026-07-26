-- Damnatiox Knowledge: schema, integrity checks, RLS, storage and realtime.
create extension if not exists pgcrypto;

create type public.profile_role as enum ('admin', 'reader');
create type public.document_status as enum ('draft', 'published');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role public.profile_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.folders(id) on delete restrict,
  name text not null check (length(trim(name)) between 1 and 120),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,119}$'),
  description text,
  icon text,
  sort_order integer not null default 0,
  is_visible boolean not null default true,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint folder_not_own_parent check (parent_id is null or parent_id <> id)
);

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid references public.folders(id) on delete restrict,
  owner_id uuid references auth.users(id) on delete set null default auth.uid(),
  slug text not null check (slug ~ '^[a-z0-9][a-z0-9-]{0,159}$'),
  title text not null check (length(trim(title)) between 1 and 240),
  description text,
  content text not null,
  tags text[] not null default '{}',
  cover_url text,
  source_storage_path text,
  original_filename text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes between 0 and 2097152),
  content_hash text,
  status public.document_status not null default 'draft',
  sort_order integer not null default 0,
  reading_time integer check (reading_time is null or reading_time > 0),
  excerpt text,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint published_document_has_date check (
    status = 'draft' or published_at is not null
  )
);

create table public.document_links (
  id uuid primary key default gen_random_uuid(),
  source_document_id uuid not null references public.documents(id) on delete cascade,
  target_document_id uuid not null references public.documents(id) on delete cascade,
  link_text text,
  created_at timestamptz not null default now(),
  unique (source_document_id, target_document_id)
);

-- NULL-safe sibling uniqueness for root and nested folders/documents.
create unique index folders_root_slug_unique on public.folders(slug) where parent_id is null;
create unique index folders_child_slug_unique on public.folders(parent_id, slug) where parent_id is not null;
create index folders_parent_idx on public.folders(parent_id);
create index folders_slug_idx on public.folders(slug);
create index folders_sort_idx on public.folders(parent_id, sort_order, name);

create unique index documents_unfiled_slug_unique on public.documents(slug) where folder_id is null;
create unique index documents_folder_slug_unique on public.documents(folder_id, slug) where folder_id is not null;
create index documents_folder_idx on public.documents(folder_id);
create index documents_slug_idx on public.documents(slug);
create index documents_status_idx on public.documents(status);
create index documents_tags_idx on public.documents using gin(tags);
create index documents_updated_idx on public.documents(updated_at desc);
create index documents_published_idx on public.documents(published_at desc);
create index documents_sort_idx on public.documents(folder_id, sort_order, title);
create index document_links_source_idx on public.document_links(source_document_id);
create index document_links_target_idx on public.document_links(target_document_id);

create or replace function public.set_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger folders_set_updated_at before update on public.folders
for each row execute function public.set_updated_at();
create trigger documents_set_updated_at before update on public.documents
for each row execute function public.set_updated_at();

create or replace function public.create_profile_for_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    'reader'
  );
  return new;
end;
$$;

create trigger auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.prevent_folder_cycle()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.parent_id is null then return new; end if;
  if new.parent_id = new.id then
    raise exception 'A folder cannot be its own parent';
  end if;
  if exists (
    with recursive descendants as (
      select id from public.folders where parent_id = new.id
      union all
      select f.id
      from public.folders f
      join descendants d on f.parent_id = d.id
    )
    select 1 from descendants where id = new.parent_id
  ) then
    raise exception 'A folder cannot be moved into its descendant';
  end if;
  return new;
end;
$$;

create trigger folders_prevent_cycle
before insert or update of parent_id on public.folders
for each row execute function public.prevent_folder_cycle();

create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Only an administrator may change roles';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_escalation
before update of role on public.profiles
for each row execute function public.prevent_profile_role_escalation();

alter table public.profiles enable row level security;
alter table public.folders enable row level security;
alter table public.documents enable row level security;
alter table public.document_links enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_non_role_fields"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "folders_public_select_visible"
on public.folders for select
to anon, authenticated
using (is_visible or public.is_admin());

create policy "folders_admin_insert"
on public.folders for insert to authenticated
with check (public.is_admin());
create policy "folders_admin_update"
on public.folders for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "folders_admin_delete"
on public.folders for delete to authenticated
using (public.is_admin());

create policy "documents_public_select_published"
on public.documents for select
to anon, authenticated
using (status = 'published' or public.is_admin());

create policy "documents_admin_insert"
on public.documents for insert to authenticated
with check (public.is_admin());
create policy "documents_admin_update"
on public.documents for update to authenticated
using (public.is_admin()) with check (public.is_admin());
create policy "documents_admin_delete"
on public.documents for delete to authenticated
using (public.is_admin());

create policy "document_links_public_select"
on public.document_links for select
to anon, authenticated
using (
  exists (
    select 1 from public.documents d
    where d.id = source_document_id and (d.status = 'published' or public.is_admin())
  )
);
create policy "document_links_admin_all"
on public.document_links for all
to authenticated
using (public.is_admin()) with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('knowledge-source', 'knowledge-source', false, 2097152, array['text/markdown', 'text/plain']),
  ('knowledge-assets', 'knowledge-assets', true, 20971520, array[
    'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf'
  ])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "assets_public_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'knowledge-assets');

create policy "admin_read_source"
on storage.objects for select
to authenticated
using (bucket_id = 'knowledge-source' and public.is_admin());

create policy "admin_upload_knowledge_files"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('knowledge-source', 'knowledge-assets')
  and public.is_admin()
  and (storage.foldername(name))[1] = 'documents'
);

create policy "admin_update_knowledge_files"
on storage.objects for update
to authenticated
using (bucket_id in ('knowledge-source', 'knowledge-assets') and public.is_admin())
with check (bucket_id in ('knowledge-source', 'knowledge-assets') and public.is_admin());

create policy "admin_delete_knowledge_files"
on storage.objects for delete
to authenticated
using (bucket_id in ('knowledge-source', 'knowledge-assets') and public.is_admin());

alter publication supabase_realtime add table public.folders;
alter publication supabase_realtime add table public.documents;

grant usage on schema public to anon, authenticated;
grant select on public.folders, public.documents, public.document_links to anon, authenticated;
grant select, insert, update, delete on public.folders, public.documents, public.document_links to authenticated;
grant select, update on public.profiles to authenticated;
