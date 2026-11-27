-- Desconto adicional percentual do contrato (pedido do Iverson):
-- a guia Faturamento troca o campo de valor por um % de desconto.
-- O valor do ciclo continua sendo gravado (soma dos serviços menos o
-- desconto), então a geração das parcelas no financeiro não muda.
alter table public.contratos
  add column if not exists desconto_adicional numeric not null default 0;

-- Sem RLS nova: a coluna segue as policies existentes da tabela contratos.
