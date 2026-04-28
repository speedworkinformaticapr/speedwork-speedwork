DO $$
BEGIN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tipo_usuario text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf_cnpj text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS numero_registro_federativo text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS categoria text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subcategoria text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_filiacao_clube timestamptz;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status_delinquencia boolean DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS data_ultima_movimentacao timestamptz;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS documento_identidade text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS observacoes text;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_cpf_cnpj ON public.profiles (cpf_cnpj) WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS public.athlete_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    clube_id_anterior uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    clube_id_novo uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    categoria_anterior text,
    categoria_nova text,
    data_mudanca timestamptz DEFAULT now(),
    motivo text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.financial_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_movimento text CHECK (tipo_movimento IN ('pagamento', 'multa', 'devolucao', 'transferencia')),
    valor numeric(10,2),
    data_movimento timestamptz DEFAULT now(),
    descricao text,
    comprovante_url text,
    status text CHECK (status IN ('pendente', 'confirmado', 'cancelado')) DEFAULT 'pendente',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.athlete_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_movements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "athlete_history_all" ON public.athlete_history;
CREATE POLICY "athlete_history_all" ON public.athlete_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "financial_movements_all" ON public.financial_movements;
CREATE POLICY "financial_movements_all" ON public.financial_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO public USING (deleted_at IS NULL);

DROP POLICY IF EXISTS "profiles_all_auth" ON public.profiles;
CREATE POLICY "profiles_all_auth" ON public.profiles FOR ALL TO authenticated USING (deleted_at IS NULL) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.calcular_categoria_atleta()
RETURNS trigger AS $$
DECLARE
    idade int;
BEGIN
    IF NEW.birth_date IS NOT NULL THEN
        idade := date_part('year', age(NEW.birth_date));
        IF NEW.gender = 'masculino' THEN
            IF idade < 18 THEN
                NEW.categoria := 'Junior';
            ELSIF idade <= 45 THEN
                NEW.categoria := 'Adulto';
            ELSIF idade <= 55 THEN
                NEW.categoria := 'Sênior';
            ELSE
                NEW.categoria := 'Master';
            END IF;
        ELSIF NEW.gender = 'feminino' THEN
            IF idade < 18 THEN
                NEW.categoria := 'Junior Feminino';
            ELSE
                NEW.categoria := 'Feminino';
            END IF;
        ELSE
            NEW.categoria := 'Geral';
        END IF;
        NEW.subcategoria := NEW.categoria;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcula_categoria ON public.profiles;
CREATE TRIGGER trigger_calcula_categoria
BEFORE INSERT OR UPDATE OF birth_date, gender ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.calcular_categoria_atleta();

CREATE OR REPLACE FUNCTION public.validar_usuario_ativo_financeiro()
RETURNS trigger AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.user_id AND deleted_at IS NULL) THEN
        RAISE EXCEPTION 'Usuário inativo ou não encontrado.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_valida_usuario_financeiro ON public.financial_movements;
CREATE TRIGGER trigger_valida_usuario_financeiro
BEFORE INSERT ON public.financial_movements
FOR EACH ROW EXECUTE FUNCTION public.validar_usuario_ativo_financeiro();
