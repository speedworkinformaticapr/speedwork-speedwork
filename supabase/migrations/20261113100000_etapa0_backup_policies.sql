-- ETAPA 0 — Backup das policies atuais (rollback) antes das correções de segurança.
-- Idempotente: pode rodar 2x sem erro. Guarda a definição integral de cada policy
-- existente em public.security_policy_backup (acesso só via service_role).

create table if not exists public.security_policy_backup (
  tablename text not null,
  policyname text not null,
  cmd text not null,
  roles text[] not null default '{}',
  qual text,
  with_check text,
  backed_up_at timestamptz not null default now(),
  constraint security_policy_backup_pkey primary key (tablename, policyname, cmd)
);

alter table public.security_policy_backup enable row level security;

insert into public.security_policy_backup (tablename, policyname, cmd, roles, qual, with_check)
select p.tablename,
       p.policyname,
       p.cmd,
       p.roles,
       coalesce(p.qual::text, ''),
       coalesce(p.with_check::text, '')
from pg_policies p
where p.schemaname = 'public'
  and p.tablename in ('profiles', 'system_data', 'services', 'user_roles')
on conflict (tablename, policyname, cmd) do nothing;

-- Export em formato CREATE POLICY para rollback manual pela usuária
create or replace function public.security_policy_backup_dump()
returns table (tablename text, policyname text, cmd text, roles text[], qual text, with_check text, restore_sql text)
language sql stable security definer set search_path = public as $$
  select b.tablename,
         b.policyname,
         b.cmd,
         b.roles,
         b.qual,
         b.with_check,
         format(
           'ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY; DROP POLICY IF EXISTS %I ON public.%I; CREATE POLICY %I ON public.%I AS %s FOR %s TO %s USING %s WITH CHECK %s;',
           b.tablename, b.policyname, b.tablename,
           b.policyname, b.tablename,
           'authenticated', b.cmd,
           (select string_agg('"' || r || '"', ', ') from unnest(b.roles) r),
           case when coalesce(b.qual, '') = '' then 'NULL' else b.qual end,
           case when coalesce(b.with_check, '') = '' then 'NULL' else b.with_check end
         )
  from public.security_policy_backup b
  order by b.tablename, b.policyname;
$$;

revoke all on function public.security_policy_backup_dump() from anon, authenticated;
