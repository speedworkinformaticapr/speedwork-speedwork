-- 1. Add new columns to contas_bancarias
ALTER TABLE public.contas_bancarias ADD COLUMN IF NOT EXISTS tipo_conta TEXT NOT NULL DEFAULT 'conta_corrente';
ALTER TABLE public.contas_bancarias ADD COLUMN IF NOT EXISTS subtipo TEXT;
ALTER TABLE public.contas_bancarias ADD COLUMN IF NOT EXISTS instituicao TEXT;

-- 2. CHECK constraint for tipo_conta
ALTER TABLE public.contas_bancarias DROP CONSTRAINT IF EXISTS contas_bancarias_tipo_conta_check;
ALTER TABLE public.contas_bancarias ADD CONSTRAINT contas_bancarias_tipo_conta_check
  CHECK (tipo_conta IN ('conta_corrente', 'poupanca', 'cartao_credito', 'cartao_debito'));

-- 3. Deduplicate numero_conta before creating unique index
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM (
      SELECT numero_conta, COUNT(*) AS cnt
      FROM public.contas_bancarias
      WHERE numero_conta IS NOT NULL AND numero_conta != ''
      GROUP BY numero_conta HAVING COUNT(*) > 1
    ) dups
  ) THEN
    DELETE FROM public.contas_bancarias a
    WHERE a.numero_conta IS NOT NULL
      AND a.numero_conta != ''
      AND a.id NOT IN (
        SELECT MIN(id) FROM public.contas_bancarias b
        WHERE b.numero_conta IS NOT NULL AND b.numero_conta != ''
        GROUP BY b.numero_conta
      );
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS contas_bancarias_numero_conta_unique
  ON public.contas_bancarias (numero_conta)
  WHERE numero_conta IS NOT NULL AND numero_conta != '';

CREATE INDEX IF NOT EXISTS contas_bancarias_tipo_conta_idx
  ON public.contas_bancarias (tipo_conta);

-- 4. Trigger function: auto-create plano_contas + sync + updated_at
CREATE OR REPLACE FUNCTION public.handle_conta_bancaria_plano_contas()
RETURNS trigger AS $$
DECLARE
  v_parent_id UUID;
  v_max_num INTEGER;
  v_new_code TEXT;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.plano_contas_id IS NULL THEN
    SELECT id INTO v_parent_id
    FROM public.plano_contas
    WHERE codigo_estrutural = '3' AND natureza = 'conta_bancaria'
    LIMIT 1;

    IF v_parent_id IS NULL THEN
      INSERT INTO public.plano_contas (codigo_estrutural, nome, natureza)
      VALUES ('3', 'Contas Bancarias e Cartoes', 'conta_bancaria')
      RETURNING id INTO v_parent_id;
    END IF;

    SELECT COALESCE(MAX(SPLIT_PART(codigo_estrutural, '.', 2)::INTEGER), 0) + 1
    INTO v_max_num
    FROM public.plano_contas
    WHERE codigo_estrutural ~ '^3\.[0-9]+$';

    v_new_code := '3.' || v_max_num::TEXT;

    INSERT INTO public.plano_contas (codigo_estrutural, nome, natureza, conta_pai_id, is_active)
    VALUES (v_new_code, NEW.nome, 'conta_bancaria', v_parent_id, NEW.is_active)
    RETURNING id INTO NEW.plano_contas_id;
  END IF;

  IF NEW.plano_contas_id IS NOT NULL THEN
    UPDATE public.plano_contas
    SET nome = NEW.nome, is_active = NEW.is_active, updated_at = NOW()
    WHERE id = NEW.plano_contas_id;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Create trigger
DROP TRIGGER IF EXISTS trg_conta_bancaria_plano_contas ON public.contas_bancarias;
CREATE TRIGGER trg_conta_bancaria_plano_contas
  BEFORE INSERT OR UPDATE ON public.contas_bancarias
  FOR EACH ROW EXECUTE FUNCTION public.handle_conta_bancaria_plano_contas();

-- 6. Seed 4 bank accounts (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE numero_conta = '76.287-3') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, agencia, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Banco do Brasil', 'Banco do Brasil', 'conta_corrente', '0695-5', '76.287-3', 'Speedwork Informatica', 50000.00, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE numero_conta = '000823161884-6') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, agencia, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Caixa Economica Federal', 'Caixa Economica Federal', 'conta_corrente', '1633', '000823161884-6', 'Speedwork Informatica', 15000.00, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE numero_conta = '0265154') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, agencia, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Bradesco', 'Bradesco', 'conta_corrente', '3287', '0265154', 'Speedwork Informatica', 30000.00, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE numero_conta = '4678854-9') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, agencia, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Inter', 'Inter', 'conta_corrente', NULL, '4678854-9', 'Speedwork Informatica', 10000.00, true);
  END IF;
END $$;

-- 7. Seed 12 credit cards (idempotent) — Nubank PF/PJ + Santander, BB, Bradesco, Inter, Caixa
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Nubank' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Nubank PF', 'Nubank', 'cartao_credito', 'PF', '1001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Nubank' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Nubank PJ', 'Nubank', 'cartao_credito', 'PJ', '1002', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Santander' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Santander PF', 'Santander', 'cartao_credito', 'PF', '2001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Santander' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Santander PJ', 'Santander', 'cartao_credito', 'PJ', '2002', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Banco do Brasil' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Banco do Brasil PF', 'Banco do Brasil', 'cartao_credito', 'PF', '3001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Banco do Brasil' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Banco do Brasil PJ', 'Banco do Brasil', 'cartao_credito', 'PJ', '3002', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Bradesco' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Bradesco PF', 'Bradesco', 'cartao_credito', 'PF', '4001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Bradesco' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Bradesco PJ', 'Bradesco', 'cartao_credito', 'PJ', '4002', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Inter' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Inter PF', 'Inter', 'cartao_credito', 'PF', '5001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Inter' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Inter PJ', 'Inter', 'cartao_credito', 'PJ', '5002', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Caixa Economica Federal' AND subtipo = 'PF' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Caixa PF', 'Caixa Economica Federal', 'cartao_credito', 'PF', '6001', 'Speedwork Informatica', 0, true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE instituicao = 'Caixa Economica Federal' AND subtipo = 'PJ' AND tipo_conta = 'cartao_credito') THEN
    INSERT INTO public.contas_bancarias (nome, instituicao, tipo_conta, subtipo, numero_conta, titular, saldo_inicial, is_active)
    VALUES ('Caixa PJ', 'Caixa Economica Federal', 'cartao_credito', 'PJ', '6002', 'Speedwork Informatica', 0, true);
  END IF;
END $$;

-- 8. Ensure RLS policies for contas_bancarias
ALTER TABLE public.contas_bancarias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "contas_bancarias_select" ON public.contas_bancarias;
CREATE POLICY "contas_bancarias_select" ON public.contas_bancarias
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "contas_bancarias_insert" ON public.contas_bancarias;
CREATE POLICY "contas_bancarias_insert" ON public.contas_bancarias
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "contas_bancarias_update" ON public.contas_bancarias;
CREATE POLICY "contas_bancarias_update" ON public.contas_bancarias
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "contas_bancarias_delete" ON public.contas_bancarias;
CREATE POLICY "contas_bancarias_delete" ON public.contas_bancarias
  FOR DELETE TO authenticated USING (true);

-- 9. Ensure RLS policies for plano_contas
ALTER TABLE public.plano_contas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "plano_contas_select" ON public.plano_contas;
CREATE POLICY "plano_contas_select" ON public.plano_contas
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "plano_contas_insert" ON public.plano_contas;
CREATE POLICY "plano_contas_insert" ON public.plano_contas
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "plano_contas_update" ON public.plano_contas;
CREATE POLICY "plano_contas_update" ON public.plano_contas
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "plano_contas_delete" ON public.plano_contas;
CREATE POLICY "plano_contas_delete" ON public.plano_contas
  FOR DELETE TO authenticated USING (true);
