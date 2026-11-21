-- Rodada 2: Integração Autentique no módulo de contratos.
-- 1) contract_signers: colunas da Autentique (public_id, signature_id, URL de assinatura)
-- 2) autentique_events: histórico de eventos do webhook (dedup por event_id)
-- 3) bucket 'contratos' para os PDFs assinados
-- 4) menu Configurações > Assinaturas em admin_menu_config
-- 5) defaults em system_data.integrations (signatário CONTRATADA, modelos, webhook secret)
--    A API key NUNCA vai para o banco: fica apenas no secret AUTENTIQUE_API_KEY.

-- ===== 1) contract_signers =====
alter table public.contract_signers
  add column if not exists autentique_public_id text,
  add column if not exists autentique_signature_id text,
  add column if not exists signature_url text;

-- ===== 2) autentique_events =====
create table if not exists public.autentique_events (
  id uuid primary key default gen_random_uuid(),
  event_id text unique,
  event_type text not null,
  contract_id uuid references public.contratos(id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.autentique_events enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'autentique_events' and policyname = 'autentique_events_select_admin'
  ) then
    create policy autentique_events_select_admin on public.autentique_events
      for select using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'autentique_events' and policyname = 'autentique_events_insert_admin'
  ) then
    create policy autentique_events_insert_admin on public.autentique_events
      for insert with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      );
  end if;
end $$;

-- ===== 3) bucket 'contratos' =====
insert into storage.buckets (id, name, public)
values ('contratos', 'contratos', false)
on conflict (id) do nothing;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'contratos_read_admin'
  ) then
    create policy contratos_read_admin on storage.objects
      for select using (
        bucket_id = 'contratos'
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'contratos_write_admin'
  ) then
    create policy contratos_write_admin on storage.objects
      for insert with check (
        bucket_id = 'contratos'
        and exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      );
  end if;
end $$;

-- ===== 4) Menu Configurações > Assinaturas =====
update public.system_data
set admin_menu_config = (
  select jsonb_agg(
    case
      when m->>'id' = 'configuracoes' then
        case
          when not exists (
            select 1 from jsonb_array_elements(coalesce(m->'submenus','[]'::jsonb)) sm
            where sm->>'id' = 'assinaturas'
          )
          then jsonb_set(
            m,
            '{submenus}',
            coalesce(m->'submenus','[]'::jsonb)
              || jsonb_build_object(
                'id', 'assinaturas',
                'label', 'Assinaturas',
                'url', '/admin/settings/assinaturas',
                'icon', 'PenTool'
              )
          )
          else m
        end
      else m
    end
    order by m_ord
  )
  from jsonb_array_elements(admin_menu_config) with ordinality as t(m, m_ord)
)
where id = '00000000-0000-0000-0000-000000000001'
  and admin_menu_config is not null;

-- ===== 5) Defaults em system_data.integrations (sem tocar na API key) =====
-- Signatário padrão da CONTRATADA + modelos por tipo de documento.
update public.system_data
set integrations = jsonb_set(
  jsonb_set(
    jsonb_set(
      coalesce(integrations, '{}'::jsonb),
      '{autentique_signer_name}',
      coalesce(integrations->'autentique_signer_name', to_jsonb(coalesce(razao_social, platform_name, 'Speedwork')))
    ),
    '{autentique_signer_cpf_cnpj}',
    coalesce(integrations->'autentique_signer_cpf_cnpj', to_jsonb(cnpj))
  ),
  '{autentique_templates}',
  coalesce(
    integrations->'autentique_templates',
    '{"contrato":"Modelo Mestre — SGC4WEB V6","cancelamento":"Termo de Cancelamento","termo_responsabilidade":"Termo de Responsabilidade"}'::jsonb
  )
)
where id = '00000000-0000-0000-0000-000000000001';

-- Token compartilhado do webhook (distinto da API key, que nunca vai para o banco):
-- gerado uma única vez, visível na tela Assinaturas para configurar no painel da Autentique.
update public.system_data
set integrations = jsonb_set(
  coalesce(integrations, '{}'::jsonb),
  '{autentique_webhook_secret}',
  to_jsonb(encode(gen_random_bytes(24), 'hex'))
)
where id = '00000000-0000-0000-0000-000000000001'
  and not coalesce(integrations, '{}'::jsonb) ? 'autentique_webhook_secret';
-- fim
