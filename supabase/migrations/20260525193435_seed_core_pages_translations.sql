DO $$
BEGIN
  INSERT INTO public.pages (
    id, slug, title, title_en, title_es, 
    meta_title, meta_title_en, meta_title_es, 
    is_published, display_order
  ) VALUES 
    (gen_random_uuid(), 'home', 'Início', 'Home', 'Inicio', 'Início', 'Home', 'Inicio', true, 1),
    (gen_random_uuid(), 'scheduling', 'Agendamento', 'Scheduling', 'Agenda', 'Agendamento', 'Scheduling', 'Agenda', true, 2),
    (gen_random_uuid(), 'blog', 'Blog', 'Blog', 'Blog', 'Blog', 'Blog', 'Blog', true, 3),
    (gen_random_uuid(), 'store', 'Loja', 'Store', 'Tienda', 'Loja', 'Store', 'Tienda', true, 4),
    (gen_random_uuid(), 'maintenance', 'Manutenção', 'Maintenance', 'Mantenimiento', 'Manutenção', 'Maintenance', 'Mantenimiento', true, 5),
    (gen_random_uuid(), 'settings', 'Configurações', 'Settings', 'Ajustes', 'Configurações', 'Settings', 'Ajustes', true, 6),
    (gen_random_uuid(), 'users', 'Usuários', 'Users', 'Usuarios', 'Usuários', 'Users', 'Usuarios', true, 7),
    (gen_random_uuid(), 'financial', 'Financeiro', 'Financial', 'Financiero', 'Financeiro', 'Financial', 'Financiero', true, 8)
  ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    title_en = EXCLUDED.title_en,
    title_es = EXCLUDED.title_es,
    meta_title = EXCLUDED.meta_title,
    meta_title_en = EXCLUDED.meta_title_en,
    meta_title_es = EXCLUDED.meta_title_es,
    is_published = EXCLUDED.is_published;
END $$;
