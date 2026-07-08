-- Fix the CHECK constraint on plano_contas.natureza to allow 'conta_bancaria'
-- The original migration only allowed ('receita', 'despesa') but the bank accounts
-- automation trigger needs to insert rows with natureza = 'conta_bancaria'

ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check;
ALTER TABLE public.plano_contas DROP CONSTRAINT IF EXISTS plano_contas_natureza_check1;

ALTER TABLE public.plano_contas ADD CONSTRAINT plano_contas_natureza_check
  CHECK (natureza IN ('receita', 'despesa', 'conta_bancaria', 'C', 'D'));

-- Ensure the parent 'Contas Bancarias e Cartoes' node exists for the trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.plano_contas
    WHERE codigo_estrutural = '3' AND natureza = 'conta_bancaria'
  ) THEN
    INSERT INTO public.plano_contas (codigo_estrutural, nome, natureza, is_active)
    VALUES ('3', 'Contas Bancarias e Cartoes', 'conta_bancaria', true)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
