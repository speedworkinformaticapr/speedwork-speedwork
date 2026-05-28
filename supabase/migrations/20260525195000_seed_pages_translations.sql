ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS title_en text;
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS title_es text;

DO $$
BEGIN
  INSERT INTO public.pages (id, slug, title, title_en, title_es, is_published, display_order)
  VALUES 
    (gen_random_uuid(), 'home', 'Início', 'Home', 'Inicio', false, 0),
    (gen_random_uuid(), 'scheduling', 'Agendamento', 'Scheduling', 'Agenda', false, 0),
    (gen_random_uuid(), 'blog', 'Blog', 'Blog', 'Blog', false, 0),
    (gen_random_uuid(), 'store', 'Loja', 'Store', 'Tienda', false, 0),
    (gen_random_uuid(), 'maintenance', 'Manutenção', 'Maintenance', 'Mantenimiento', false, 0),
    (gen_random_uuid(), 'settings', 'Configurações', 'Settings', 'Ajustes', false, 0),
    (gen_random_uuid(), 'users', 'Usuários', 'Users', 'Usuarios', false, 0),
    (gen_random_uuid(), 'financial', 'Financeiro', 'Financial', 'Financiero', false, 0),
    (gen_random_uuid(), 'dashboard-general', 'Dashboard Geral', 'General Dashboard', 'Panel General', false, 0),
    (gen_random_uuid(), 'dashboard-financial', 'Dashboard Financeiro', 'Financial Dashboard', 'Panel Financiero', false, 0),
    (gen_random_uuid(), 'dashboard-scheduling', 'Dashboard Agendamentos', 'Scheduling Dashboard', 'Panel de Agendas', false, 0),
    (gen_random_uuid(), 'dashboard-commercial', 'Dashboard Comercial', 'Commercial Dashboard', 'Panel Comercial', false, 0)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_es = EXCLUDED.title_es;
END $$;
