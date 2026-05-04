CREATE TABLE IF NOT EXISTS public.orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_orcamento TEXT,
    cliente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    data_emissao DATE NOT NULL,
    data_validade DATE,
    status TEXT NOT NULL DEFAULT 'rascunho',
    subtotal NUMERIC(10, 2) DEFAULT 0,
    desconto_percentual NUMERIC(5, 2) DEFAULT 0,
    desconto_valor NUMERIC(10, 2) DEFAULT 0,
    valor_impostos NUMERIC(10, 2) DEFAULT 0,
    total NUMERIC(10, 2) DEFAULT 0,
    observacoes TEXT,
    motivo_rejeicao TEXT,
    data_conversao DATE,
    pedido_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orcamento_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
    produto_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    valor_unitario NUMERIC(10, 2) NOT NULL DEFAULT 0,
    valor_total NUMERIC(10, 2) NOT NULL DEFAULT 0,
    descricao TEXT
);

CREATE SEQUENCE IF NOT EXISTS orcamento_numero_seq START 10001;

CREATE OR REPLACE FUNCTION generate_numero_orcamento()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_orcamento IS NULL OR NEW.numero_orcamento = '' THEN
        NEW.numero_orcamento := 'ORC-' || nextval('orcamento_numero_seq')::TEXT;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_generate_numero_orcamento ON public.orcamentos;
CREATE TRIGGER trg_generate_numero_orcamento
BEFORE INSERT ON public.orcamentos
FOR EACH ROW
EXECUTE FUNCTION generate_numero_orcamento();

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "orcamentos_all" ON public.orcamentos;
CREATE POLICY "orcamentos_all" ON public.orcamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orcamento_itens_all" ON public.orcamento_itens;
CREATE POLICY "orcamento_itens_all" ON public.orcamento_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
