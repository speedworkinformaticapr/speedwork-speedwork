DO $$
BEGIN 
  -- Creating tables
  CREATE TABLE IF NOT EXISTS public.whatsapp_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    api_provider TEXT CHECK (api_provider IN ('twilio', 'evolution')),
    account_sid TEXT,
    auth_token TEXT,
    phone_number TEXT,
    is_active BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo_mensagem TEXT,
    titulo TEXT,
    conteudo TEXT,
    variaveis JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cliente_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    telefone TEXT,
    tipo_mensagem TEXT,
    status TEXT CHECK (status IN ('enviado', 'falha', 'pendente')),
    resposta_api JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_empresa_id ON public.whatsapp_logs(empresa_id);
  CREATE INDEX IF NOT EXISTS idx_whatsapp_logs_cliente_id ON public.whatsapp_logs(cliente_id);

  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS autoriza_whatsapp BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telefone_whatsapp TEXT;

  ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS whatsapp_enviado BOOLEAN DEFAULT false;
  ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS link_pagamento TEXT;
  
  ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS whatsapp_enviado BOOLEAN DEFAULT false;

  -- RLS Policies
  ALTER TABLE public.whatsapp_config ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "admin_all_whatsapp_config" ON public.whatsapp_config;
  CREATE POLICY "admin_all_whatsapp_config" ON public.whatsapp_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_whatsapp_templates" ON public.whatsapp_templates;
  CREATE POLICY "admin_all_whatsapp_templates" ON public.whatsapp_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

  DROP POLICY IF EXISTS "admin_all_whatsapp_logs" ON public.whatsapp_logs;
  CREATE POLICY "admin_all_whatsapp_logs" ON public.whatsapp_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

END $$;
