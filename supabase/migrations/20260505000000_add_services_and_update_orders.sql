DO $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    cost_value NUMERIC DEFAULT 0,
    sale_value NUMERIC DEFAULT 0,
    exec_time TEXT,
    margin_time NUMERIC DEFAULT 0,
    add_time TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
  );

  ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS "services_all" ON public.services;
  CREATE POLICY "services_all" ON public.services FOR ALL TO authenticated USING (true) WITH CHECK (true);
  
  DROP POLICY IF EXISTS "services_select_public" ON public.services;
  CREATE POLICY "services_select_public" ON public.services FOR SELECT TO public USING (true);

  ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.services(id) ON DELETE SET NULL;
  ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS tipo_item TEXT DEFAULT 'produto';
  ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS tempo_estimado NUMERIC DEFAULT 0;

  ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS servico_id UUID REFERENCES public.services(id) ON DELETE SET NULL;
  ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS tipo_item TEXT DEFAULT 'produto';
  ALTER TABLE public.pedido_itens ADD COLUMN IF NOT EXISTS tempo_estimado NUMERIC DEFAULT 0;
END $$;
