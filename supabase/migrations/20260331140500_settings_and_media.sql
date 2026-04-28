CREATE TABLE IF NOT EXISTS public.media_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "media_items_select" ON public.media_items;
CREATE POLICY "media_items_select" ON public.media_items FOR SELECT TO public USING (true);

DROP POLICY IF EXISTS "media_items_all" ON public.media_items;
CREATE POLICY "media_items_all" ON public.media_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

ALTER TABLE public.system_data 
ADD COLUMN IF NOT EXISTS bg_opacity INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS menu_logo_size INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS browser_icon_url TEXT,
ADD COLUMN IF NOT EXISTS show_cnpj BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS show_contact_bar BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS session_lifetime INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS ai_context TEXT,
ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'pt',
ADD COLUMN IF NOT EXISTS libras_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_auth BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_method TEXT DEFAULT 'email',
ADD COLUMN IF NOT EXISTS integrations JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS terms JSONB DEFAULT '{"lgpd": "", "uso": "", "cookies": ""}'::jsonb;
