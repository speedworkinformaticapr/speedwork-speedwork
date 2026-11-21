-- Rodada 2 (integração Autentique): tabela de termos de cancelamento enviados
-- à Autentique. A edge function autentique-create-document faz upsert aqui para
-- document_type 'cancelamento' e 'termo_responsabilidade' (dedup por contrato+tipo).

create table if not exists public.contract_cancel_documents (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contratos(id) on delete cascade,
  document_type text not null check (document_type in ('cancelamento', 'termo_responsabilidade')),
  autentique_public_id text,
  status text not null default 'pendente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (contract_id, document_type)
);

alter table public.contract_cancel_documents enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'contract_cancel_documents'
      and policyname = 'contract_cancel_documents_admin_all'
  ) then
    create policy contract_cancel_documents_admin_all on public.contract_cancel_documents
      for all using (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      )
      with check (
        exists (
          select 1 from public.profiles p
          where p.id = auth.uid()
            and (p.role in ('admin','master') or public.is_master_user())
        )
      );
  end if;
end $$;

-- Service role (edge functions) contorna RLS; nenhuma policy anônima é criada.
-- fim
