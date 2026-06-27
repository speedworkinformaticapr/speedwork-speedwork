CREATE TABLE IF NOT EXISTS public.customer_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('NPS', 'CSAT', 'CES')),
    score INTEGER NOT NULL,
    comments TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.customer_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "customer_feedback_all" ON public.customer_feedback;
CREATE POLICY "customer_feedback_all" ON public.customer_feedback
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_customer_feedback_type ON public.customer_feedback(type);
CREATE INDEX IF NOT EXISTS idx_customer_feedback_created_at ON public.customer_feedback(created_at DESC);

UPDATE auth.users
SET encrypted_password = crypt('Skip@Pass', gen_salt('bf')),
    updated_at = NOW()
WHERE email = 'ias2371@gmail.com';

DO $$
DECLARE
    v_client_id UUID;
BEGIN
    SELECT id INTO v_client_id FROM auth.users WHERE email = 'client1@mock.com' LIMIT 1;
    IF v_client_id IS NULL THEN
        SELECT id INTO v_client_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
    END IF;

    IF v_client_id IS NOT NULL AND (SELECT count(*) FROM public.customer_feedback) < 12 THEN
        INSERT INTO public.customer_feedback (client_id, type, score, comments) VALUES
        (v_client_id, 'NPS', 10, 'Excelente serviço, super recomendo!'),
        (v_client_id, 'NPS', 8, 'Bom, mas pode melhorar.'),
        (v_client_id, 'NPS', 9, 'Muito satisfeito com o suporte.'),
        (v_client_id, 'NPS', 6, 'Demorou mais que o esperado.'),
        (v_client_id, 'NPS', 10, 'Equipe muito atenciosa.'),
        (v_client_id, 'NPS', 7, 'Razoável.'),
        (v_client_id, 'CSAT', 5, 'Totalmente satisfeito'),
        (v_client_id, 'CSAT', 4, 'Satisfeito'),
        (v_client_id, 'CSAT', 3, 'Neutro'),
        (v_client_id, 'CSAT', 5, 'Ótimo atendimento'),
        (v_client_id, 'CES', 2, 'Foi muito fácil resolver'),
        (v_client_id, 'CES', 4, 'Exigiu algum esforço');
    END IF;
END $$;
