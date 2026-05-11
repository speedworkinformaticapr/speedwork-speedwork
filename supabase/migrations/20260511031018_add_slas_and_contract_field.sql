ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS sla_id UUID REFERENCES public.sla_types(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.sla_types WHERE name = 'SLA Desenvolvimento') THEN
    INSERT INTO public.sla_types (id, name, response_time, resolution_time, description)
    VALUES (
      gen_random_uuid(),
      'SLA Desenvolvimento', 
      '24h úteis', 
      '5-30 dias úteis', 
      'Escopo: Desenvolvimento web, mobile, APIs, customizações e integrações de sistemas.

Compromissos:
- Resposta a dúvidas técnicas: 24h úteis
- Resolução conforme escopo: 5-30 dias úteis (definido no contrato)
- Disponibilidade do sistema: 99%
- Horário de atendimento: Seg-Sex 08h-18h
- Escalonamento: Dev → Tech Lead → Gerente de Projeto

Exclusões: Mudanças de escopo não contratadas, requisitos não documentados, infraestrutura do cliente.'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.sla_types WHERE name = 'SLA Suporte Técnico') THEN
    INSERT INTO public.sla_types (id, name, response_time, resolution_time, description)
    VALUES (
      gen_random_uuid(),
      'SLA Suporte Técnico', 
      'Variável por prioridade', 
      'Variável por prioridade', 
      'Escopo: Help desk, resolução de problemas, suporte remoto/on-site, gestão de chamados, treinamento.

Compromissos por Prioridade:
- Crítico: Resposta 1h / Resolução 4h (Sistema fora do ar, perda de dados)
- Alto: Resposta 4h / Resolução 8h (Funcionalidade principal afetada)
- Médio: Resposta 8h / Resolução 24h (Funcionalidade secundária afetada)
- Baixo: Resposta 24h / Resolução 72h (Dúvidas, melhorias, documentação)

- Disponibilidade: 99.5%
- Horário: 24h/7 dias
- Escalonamento: Help Desk → Técnico Especialista → Engenheiro Sênior

Exclusões: Problemas causados por negligência do cliente, software não autorizado, falta de backups.'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.sla_types WHERE name = 'SLA Infraestrutura') THEN
    INSERT INTO public.sla_types (id, name, response_time, resolution_time, description)
    VALUES (
      gen_random_uuid(),
      'SLA Infraestrutura', 
      'Variável por prioridade', 
      'Variável por prioridade', 
      'Escopo: Servidores, redes, nuvem, backup, disaster recovery, monitoramento 24/7.

Compromissos por Prioridade:
- Crítico: Resposta 30min / Resolução 2h (Servidor/rede fora do ar)
- Alto: Resposta 2h / Resolução 8h (Performance degradada)
- Médio: Resposta 4h / Resolução 24h (Alertas de monitoramento)

- Disponibilidade: 99.9% (máximo 43min/mês de downtime)
- Horário: 24h/7 dias
- Escalonamento: Monitoramento → Infraestrutura → Arquiteto Sênior

Exclusões: Ataques DDoS, falhas de hardware não previstas, configurações inadequadas do cliente.'
    );
  END IF;
END $$;
