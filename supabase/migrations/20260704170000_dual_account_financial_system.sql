-- 1. Create contas_bancarias table
CREATE TABLE IF NOT EXISTS public.contas_bancarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    agencia TEXT,
    numero_conta TEXT,
    titular TEXT,
    saldo_inicial NUMERIC NOT NULL DEFAULT 0,
    plano_contas_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. RLS for contas_bancarias
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

-- 3. Update plano_contas natureza constraint to allow D, C
ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check;
ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check1;
ALTER TABLE public.plano_contas ADD CONSTRAINT plano_contas_natureza_check
    CHECK (natureza IN ('receita', 'despesa', 'conta_bancaria', 'D', 'C'));

-- 4. Backfill natureza: receita -> C, despesa -> D
UPDATE public.plano_contas SET natureza = 'C' WHERE natureza = 'receita';
UPDATE public.plano_contas SET natureza = 'D' WHERE natureza = 'despesa';

-- 5. Final constraint
ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check;
ALTER TABLE public.plano_contas ADD CONSTRAINT plano_contas_natureza_check
    CHECK (natureza IN ('conta_bancaria', 'D', 'C'));

-- 6. Add conta_origem_id and conta_destino_id to financial tables
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS conta_origem_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.financial_charges ADD COLUMN IF NOT EXISTS conta_destino_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;

ALTER TABLE public.financial_master_records ADD COLUMN IF NOT EXISTS conta_origem_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.financial_master_records ADD COLUMN IF NOT EXISTS conta_destino_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;

ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS conta_origem_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;
ALTER TABLE public.lancamentos_financeiros ADD COLUMN IF NOT EXISTS conta_destino_id UUID REFERENCES public.plano_contas(id) ON DELETE SET NULL;

-- 7. Historical data migration: populate conta_origem_id from existing conta_id
UPDATE public.financial_charges
SET conta_origem_id = conta_id
WHERE conta_id IS NOT NULL AND conta_origem_id IS NULL;

UPDATE public.financial_master_records m
SET conta_origem_id = sub.conta_id
FROM (
    SELECT master_record_id, MIN(conta_id) AS conta_id
    FROM public.financial_charges
    WHERE conta_id IS NOT NULL AND master_record_id IS NOT NULL
    GROUP BY master_record_id
) sub
WHERE m.id = sub.master_record_id AND m.conta_origem_id IS NULL;

UPDATE public.lancamentos_financeiros
SET conta_origem_id = conta_id
WHERE conta_id IS NOT NULL AND conta_origem_id IS NULL;

-- 8. Seed additional plano_contas bank entries (3.4 - 3.8)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.plano_contas WHERE codigo_estrutural = '3.4') THEN
    INSERT INTO public.plano_contas (codigo_estrutural, nome, natureza) VALUES
      ('3.4', 'Banco Santander', 'conta_bancaria'),
      ('3.5', 'Banco do Brasil', 'conta_bancaria'),
      ('3.6', 'Banco Inter', 'conta_bancaria'),
      ('3.7', 'Nubank', 'conta_bancaria'),
      ('3.8', 'Banco Sicredi', 'conta_bancaria');
  END IF;
END $$;

-- 9. Set parent relationships for bank accounts (3 -> parent of 3.x)
UPDATE public.plano_contas
SET conta_pai_id = (SELECT id FROM public.plano_contas WHERE codigo_estrutural = '3' LIMIT 1)
WHERE codigo_estrutural IN ('3.1', '3.2', '3.3', '3.4', '3.5', '3.6', '3.7', '3.8')
  AND conta_pai_id IS NULL;

-- 10. Seed 8 contas_bancarias entries
DO $$
DECLARE
  v_pc_id UUID;
BEGIN
  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.1' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco Itaú', '1234', '10001-1', 'Speedwork Informática', 50000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.2' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco Bradesco', '5678', '20002-2', 'Speedwork Informática', 30000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.3' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Caixa Econômica Federal', '9012', '30003-3', 'Speedwork Informática', 15000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.4' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco Santander', '3456', '40004-4', 'Speedwork Informática', 20000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.5' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco do Brasil', '7890', '50005-5', 'Speedwork Informática', 40000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.6' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco Inter', '1122', '60006-6', 'Speedwork Informática', 10000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.7' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Nubank', '3344', '70007-7', 'Speedwork Informática', 5000.00, v_pc_id);
  END IF;

  SELECT id INTO v_pc_id FROM public.plano_contas WHERE codigo_estrutural = '3.8' LIMIT 1;
  IF v_pc_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.contas_bancarias WHERE plano_contas_id = v_pc_id) THEN
    INSERT INTO public.contas_bancarias (nome, agencia, numero_conta, titular, saldo_inicial, plano_contas_id)
    VALUES ('Banco Sicredi', '5566', '80008-8', 'Speedwork Informática', 8000.00, v_pc_id);
  END IF;
END $$;

-- 11. Auth seed (idempotent)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
    INSERT INTO public.profiles (id, email, name, role, status)
    VALUES (v_user_id, 'ias2371@gmail.com', 'Admin', 'master', 'active')
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;
