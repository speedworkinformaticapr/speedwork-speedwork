CREATE TABLE IF NOT EXISTS public.plano_contas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo_estrutural TEXT NOT NULL,
    nome TEXT NOT NULL,
    natureza TEXT NOT NULL CHECK (natureza IN ('receita', 'despesa')),
    conta_pai_id UUID REFERENCES public.plano_contas(id) ON DELETE CASCADE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.contratos ADD COLUMN IF NOT EXISTS conta_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.handle_orcamento_financeiro()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status <> 'aprovado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'entrada', 'Orçamento Aprovado ' || COALESCE(NEW.numero_orcamento, ''), NEW.total, NEW.data_emissao, 'Orçamento Aprovado', NEW.id, 'orcamento', NEW.responsavel_id, NEW.conta_id
    );
  ELSIF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status <> 'rejeitado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'saida', 'Orçamento Rejeitado ' || COALESCE(NEW.numero_orcamento, ''), 0, NEW.data_emissao, 'Orçamento Rejeitado', NEW.id, 'orcamento', NEW.responsavel_id, NEW.conta_id
    );
  ELSIF NEW.status = 'convertido' AND (OLD.status IS NULL OR OLD.status <> 'convertido') THEN
    UPDATE public.lancamentos_financeiros
    SET referencia_tipo = 'pedido', referencia_id = NEW.pedido_id
    WHERE referencia_id = NEW.id AND referencia_tipo = 'orcamento';
  END IF;
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_pedido_financeiro_estoque()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status <> 'confirmado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'entrada', 'Pedido Confirmado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, COALESCE(NEW.data_pedido, NOW()::date), 'Pedido Confirmado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
    );
    FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
      UPDATE public.products SET stock = GREATEST(COALESCE(stock, 0) - item.quantidade, 0) WHERE id = item.produto_id;
    END LOOP;
  ELSIF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status <> 'entregue') THEN
    UPDATE public.lancamentos_financeiros SET categoria = 'Pedido Entregue' WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido';
  ELSIF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status <> 'cancelado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'saida', 'Pedido Cancelado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, NOW()::date, 'Pedido Cancelado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
    );
    IF OLD.status IN ('confirmado', 'producao', 'enviado', 'entregue') THEN
      FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
        UPDATE public.products SET stock = COALESCE(stock, 0) + item.quantidade WHERE id = item.produto_id;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "plano_contas_all" ON public.plano_contas;
CREATE POLICY "plano_contas_all" ON public.plano_contas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plano_contas WHERE codigo_estrutural = '1') THEN
    INSERT INTO public.plano_contas (id, codigo_estrutural, nome, natureza) VALUES
      ('00000000-0000-0000-0000-000000000100'::uuid, '1', 'Receitas', 'receita'),
      ('00000000-0000-0000-0000-000000000101'::uuid, '1.1', 'Receitas Operacionais', 'receita'),
      ('00000000-0000-0000-0000-000000000200'::uuid, '2', 'Despesas', 'despesa'),
      ('00000000-0000-0000-0000-000000000201'::uuid, '2.1', 'Despesas Operacionais', 'despesa');
      
    UPDATE public.plano_contas SET conta_pai_id = '00000000-0000-0000-0000-000000000100'::uuid WHERE id = '00000000-0000-0000-0000-000000000101'::uuid;
    UPDATE public.plano_contas SET conta_pai_id = '00000000-0000-0000-0000-000000000200'::uuid WHERE id = '00000000-0000-0000-0000-000000000201'::uuid;
  END IF;
END $$;
