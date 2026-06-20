CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number SERIAL,
    title TEXT NOT NULL,
    description TEXT,
    client_id UUID REFERENCES public.profiles(id),
    technician_id UUID REFERENCES public.profiles(id),
    module TEXT,
    priority TEXT CHECK (priority IN ('P1', 'P2', 'P3', 'P4')),
    status TEXT CHECK (status IN ('Aberto', 'Em Atendimento', 'Aguardando Cliente', 'Aguardando Terceiro', 'Resolvido', 'Fechado')),
    sla_started_at TIMESTAMPTZ DEFAULT NOW(),
    sla_paused_at TIMESTAMPTZ,
    total_paused_time_ms BIGINT DEFAULT 0,
    parent_ticket_id UUID REFERENCES public.support_tickets(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    old_status TEXT,
    new_status TEXT,
    old_technician_id UUID REFERENCES public.profiles(id),
    new_technician_id UUID REFERENCES public.profiles(id),
    note TEXT,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.ticket_sla_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    priority TEXT UNIQUE NOT NULL,
    response_time_minutes INT,
    start_time_minutes INT,
    resolution_time_minutes INT,
    escalation_time_minutes INT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_ticket_status_change()
RETURNS trigger AS $func$
BEGIN
  IF NEW.status IN ('Aguardando Cliente', 'Aguardando Terceiro') AND OLD.status NOT IN ('Aguardando Cliente', 'Aguardando Terceiro') THEN
    NEW.sla_paused_at := NOW();
  ELSIF NEW.status IN ('Em Atendimento', 'Resolvido', 'Fechado') AND OLD.status IN ('Aguardando Cliente', 'Aguardando Terceiro') THEN
    IF OLD.sla_paused_at IS NOT NULL THEN
      NEW.total_paused_time_ms := OLD.total_paused_time_ms + (EXTRACT(EPOCH FROM (NOW() - OLD.sla_paused_at)) * 1000)::BIGINT;
      NEW.sla_paused_at := NULL;
    END IF;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS ticket_status_trigger ON public.support_tickets;
CREATE TRIGGER ticket_status_trigger
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_ticket_status_change();

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_sla_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated_all_tickets" ON public.support_tickets;
CREATE POLICY "authenticated_all_tickets" ON public.support_tickets FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_history" ON public.ticket_history;
CREATE POLICY "authenticated_all_history" ON public.ticket_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "authenticated_all_configs" ON public.ticket_sla_configs;
CREATE POLICY "authenticated_all_configs" ON public.ticket_sla_configs FOR ALL TO authenticated USING (true) WITH CHECK (true);

INSERT INTO public.ticket_sla_configs (priority, response_time_minutes, start_time_minutes, resolution_time_minutes, escalation_time_minutes) VALUES
('P1', 15, 30, 240, 60),
('P2', 60, 120, 480, 240),
('P3', 240, 480, 2880, 1440),
('P4', 480, 1440, 7200, 4320)
ON CONFLICT (priority) DO UPDATE SET
  response_time_minutes = EXCLUDED.response_time_minutes,
  start_time_minutes = EXCLUDED.start_time_minutes,
  resolution_time_minutes = EXCLUDED.resolution_time_minutes,
  escalation_time_minutes = EXCLUDED.escalation_time_minutes;

DO $func$
DECLARE
  main_user_id UUID;
  tech1_id UUID;
  client1_id UUID;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    main_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (main_user_id, '00000000-0000-0000-0000-000000000000', 'ias2371@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin Suporte"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role) VALUES (main_user_id, 'ias2371@gmail.com', 'Admin Suporte', 'admin') ON CONFLICT (id) DO UPDATE SET role = 'admin';
  ELSE
    SELECT id INTO main_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tech1@mock.com') THEN
    tech1_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (tech1_id, '00000000-0000-0000-0000-000000000000', 'tech1@mock.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Carlos Técnico"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role) VALUES (tech1_id, 'tech1@mock.com', 'Carlos Técnico', 'staff') ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO tech1_id FROM auth.users WHERE email = 'tech1@mock.com' LIMIT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'client1@mock.com') THEN
    client1_id := gen_random_uuid();
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (client1_id, '00000000-0000-0000-0000-000000000000', 'client1@mock.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Empresa XPTO"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    INSERT INTO public.profiles (id, email, name, role, is_client, cpf_cnpj) VALUES (client1_id, 'client1@mock.com', 'Empresa XPTO', 'client', true, '12.345.678/0001-90') ON CONFLICT (id) DO NOTHING;
  ELSE
    SELECT id INTO client1_id FROM auth.users WHERE email = 'client1@mock.com' LIMIT 1;
  END IF;

  IF (SELECT count(*) FROM public.support_tickets) < 8 THEN
    INSERT INTO public.support_tickets (title, description, client_id, technician_id, module, priority, status) VALUES
    ('ERP Fora do ar', 'O sistema não carrega e mostra erro 500', client1_id, main_user_id, 'Infra', 'P1', 'Aberto'),
    ('Login Travado', 'Usuários não conseguem logar', client1_id, tech1_id, 'Login', 'P1', 'Em Atendimento'),
    ('Lentidão no Checkout', 'A tela de pagamento está demorando 15 segundos', client1_id, tech1_id, 'Checkout', 'P2', 'Aguardando Terceiro'),
    ('Erro crítico no módulo de vendas', 'Vendas sendo duplicadas no banco', client1_id, main_user_id, 'Vendas', 'P2', 'Aberto'),
    ('Erro em relatório financeiro', 'O saldo de DRE está errado no fechamento', client1_id, tech1_id, 'Financeiro', 'P3', 'Resolvido'),
    ('Bug visual em botão', 'O botão de salvar está com texto quebrado', client1_id, main_user_id, 'UI', 'P3', 'Fechado'),
    ('Dúvida sobre campanha', 'Como configuro uma nova promoção de natal?', client1_id, tech1_id, 'Marketing', 'P4', 'Aguardando Cliente'),
    ('Ajuste de cor em campanha', 'Gostaria de mudar o verde para azul no banner', client1_id, main_user_id, 'Marketing', 'P4', 'Aberto');
  END IF;
END;
$func$;
