DO $$
BEGIN
  -- Insert default pages into the CMS so the navigation links are not broken after migrating from static routes
  INSERT INTO public.pages (id, title, slug, is_published, display_order)
  VALUES 
    (gen_random_uuid(), 'Cursos', 'courses', true, 10),
    (gen_random_uuid(), 'Torneios', 'tournaments', true, 20),
    (gen_random_uuid(), 'Ranking', 'ranking', true, 30),
    (gen_random_uuid(), 'Regras', 'rules', true, 40),
    (gen_random_uuid(), 'Sobre', 'about', true, 50),
    (gen_random_uuid(), 'Contato', 'contact', true, 60),
    (gen_random_uuid(), 'Loja', 'store', true, 70),
    (gen_random_uuid(), 'Galeria', 'gallery', true, 80),
    (gen_random_uuid(), 'Blog', 'blog', true, 90)
  ON CONFLICT (slug) DO NOTHING;
END $$;
