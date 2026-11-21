-- Contrato V6: representante da CONTRATANTE e e-mail de notificação
-- (preâmbulo do modelo SGC4WEB V6 e cláusula 18.6 — notificações por e-mail).
alter table public.contratos
  add column if not exists cliente_representante_nome text,
  add column if not exists cliente_representante_cpf text,
  add column if not exists cliente_email_notificacao text;
