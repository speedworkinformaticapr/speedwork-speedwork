DO $$
BEGIN
  -- Convert legacy "pendente" or "aberto" to "rascunho"
  UPDATE public.orcamentos
  SET status = 'rascunho'
  WHERE status IN ('pendente', 'aberto');

  -- Convert "enviado" to "aguardando aprovação"
  UPDATE public.orcamentos
  SET status = 'aguardando aprovação'
  WHERE status = 'enviado';

  -- Convert "aceito" to "aprovado"
  UPDATE public.orcamentos
  SET status = 'aprovado'
  WHERE status = 'aceito';

  -- Convert "recusado" or "cancelado" to "rejeitado"
  UPDATE public.orcamentos
  SET status = 'rejeitado'
  WHERE status IN ('recusado', 'cancelado');
END $$;
