CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  flow_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviado',
  provider TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_all_email_logs" ON public.email_logs;
CREATE POLICY "admin_all_email_logs" ON public.email_logs
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.email_logs LIMIT 1) THEN
    INSERT INTO public.email_logs (recipient_email, subject, flow_type, status, provider, created_at)
    VALUES 
      ('atleta1@exemplo.com', 'Bem-vindo ao Footgolf PR!', 'welcome', 'lido', 'smtp2go', NOW() - INTERVAL '2 hours'),
      ('clube_abc@exemplo.com', 'Confirmação de Inscrição - Footgolf PR', 'event_registration', 'recebido', 'smtp2go', NOW() - INTERVAL '1 day'),
      ('financeiro@exemplo.com', 'Lembrete de Vencimento - Footgolf PR', 'billing_reminder', 'enviado', 'smtp2go', NOW() - INTERVAL '5 minutes'),
      ('erro@exemplo.com', 'Alteração de Senha - Footgolf PR', 'password_reset', 'falha', 'smtp2go', NOW() - INTERVAL '10 minutes');
  END IF;
END $$;
