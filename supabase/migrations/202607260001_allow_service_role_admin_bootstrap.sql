-- Allow trusted service-role automation to bootstrap and maintain administrator roles.
create or replace function public.prevent_profile_role_escalation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.role <> old.role
    and coalesce(auth.role(), '') <> 'service_role'
    and not public.is_admin()
  then
    raise exception 'Only an administrator may change roles';
  end if;
  return new;
end;
$$;
