-- 1. Add Vehicle Columns to Orcamentos and Pedidos
ALTER TABLE public.orcamentos 
ADD COLUMN IF NOT EXISTS veiculo_placa TEXT,
ADD COLUMN IF NOT EXISTS veiculo_modelo TEXT,
ADD COLUMN IF NOT EXISTS veiculo_km TEXT;

ALTER TABLE public.pedidos 
ADD COLUMN IF NOT EXISTS veiculo_placa TEXT,
ADD COLUMN IF NOT EXISTS veiculo_modelo TEXT,
ADD COLUMN IF NOT EXISTS veiculo_km TEXT;

-- 2. Trigger for Financial Entries - Orcamentos
CREATE OR REPLACE FUNCTION public.handle_orcamento_financeiro()
RETURNS trigger AS $function$
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id
    ) VALUES (
      'entrada', 'Orçamento Aprovado ' || COALESCE(NEW.numero_orcamento, ''), NEW.total, NEW.data_emissao, 'Orçamento Aprovado', NEW.id, 'orcamento', NEW.responsavel_id
    );
  ELSIF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status <> 'rejeitado') THEN
    -- Apenas para registro, valor 0
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id
    ) VALUES (
      'saida', 'Orçamento Rejeitado ' || COALESCE(NEW.numero_orcamento, ''), 0, NEW.data_emissao, 'Orçamento Rejeitado', NEW.id, 'orcamento', NEW.responsavel_id
    );
  ELSIF NEW.status = 'convertido' AND (OLD.status IS NULL OR OLD.status <> 'convertido') THEN
    -- Update previous entry if exists to point to the new pedido
    UPDATE public.lancamentos_financeiros
    SET referencia_tipo = 'pedido', referencia_id = NEW.pedido_id
    WHERE referencia_id = NEW.id AND referencia_tipo = 'orcamento';
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_orcamento_financeiro ON public.orcamentos;
CREATE TRIGGER trg_orcamento_financeiro
  AFTER UPDATE ON public.orcamentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_orcamento_financeiro();

-- 3. Trigger for Financial Entries & Stock - Pedidos
CREATE OR REPLACE FUNCTION public.handle_pedido_financeiro_estoque()
RETURNS trigger AS $function$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status <> 'confirmado') THEN
    -- Financeiro: Lançamento de Entrada
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id
    ) VALUES (
      'entrada', 'Pedido Confirmado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, COALESCE(NEW.data_pedido, NOW()::date), 'Pedido Confirmado', NEW.id, 'pedido', NEW.responsavel_id
    );
    -- Estoque: Baixa de Produtos
    FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
      UPDATE public.products SET stock = GREATEST(COALESCE(stock, 0) - item.quantidade, 0) WHERE id = item.produto_id;
    END LOOP;
  ELSIF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status <> 'entregue') THEN
    -- Atualiza categoria do lançamento
    UPDATE public.lancamentos_financeiros SET categoria = 'Pedido Entregue' WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido';
  ELSIF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status <> 'cancelado') THEN
    -- Financeiro: Lançamento de Saída (Estorno)
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id
    ) VALUES (
      'saida', 'Pedido Cancelado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, NOW()::date, 'Pedido Cancelado', NEW.id, 'pedido', NEW.responsavel_id
    );
    -- Estoque: Estorno se estava confirmado/producao/enviado/entregue
    IF OLD.status IN ('confirmado', 'producao', 'enviado', 'entregue') THEN
      FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
        UPDATE public.products SET stock = COALESCE(stock, 0) + item.quantidade WHERE id = item.produto_id;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_pedido_financeiro_estoque ON public.pedidos;
CREATE TRIGGER trg_pedido_financeiro_estoque
  AFTER UPDATE ON public.pedidos
  FOR EACH ROW EXECUTE FUNCTION public.handle_pedido_financeiro_estoque();
