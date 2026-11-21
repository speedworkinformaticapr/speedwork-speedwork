-- Rodada 2 (fechamento): distinguir tipos de documento no webhook Autentique.
-- 1) autentique_events: colunas de leitura da tela Assinaturas (tipo, nome e
--    status do documento no momento do evento).
-- 2) contratos.pending_autentique_docs: documentos de cancelamento
--    (termo de cancelamento / termo de responsabilidade) em assinatura na
--    Autentique, identificados pelo public_id — permitem ao webhook saber que
--    um DOCUMENT_FINISHED se refere a um termo e não ao contrato principal.

-- ===== 1) autentique_events =====
alter table public.autentique_events
  add column if not exists document_type text,
  add column if not exists document_name text,
  add column if not exists status text;

-- ===== 2) contratos: documentos de cancelamento pendentes =====
alter table public.contratos
  add column if not exists pending_autentique_docs jsonb not null default '[]'::jsonb;
-- fim
