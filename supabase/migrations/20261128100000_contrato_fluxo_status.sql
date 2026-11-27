-- Fluxo de status do contrato Speedwork (pedido do usuário):
-- CRIADO → ASSINATURAS → ASSINADO → FINANCEIRO
-- contratos.status é texto: nenhuma mudança estrutural (nem destrutiva).
-- Apenas converte os valores legados em uso para os valores do novo fluxo.

update public.contratos
   set status = 'CRIADO'
 where status = 'rascunho'
    or status is null;

update public.contratos
   set status = 'ASSINATURAS'
 where status = 'Em Assinatura';

update public.contratos
   set status = 'ASSINADO'
 where status = 'ativo';
-- fim
