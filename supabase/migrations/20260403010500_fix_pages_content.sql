DO $$
BEGIN
  -- Insert default platform pages if they don't exist yet
  INSERT INTO public.pages (slug, title, is_published, display_order, meta_description, blocks)
  VALUES
    ('courses', 'Campos', true, 1, 'Conheça nossos campos de Footgolf.', '[
      {
        "id": "hero-courses",
        "type": "hero",
        "data": {
          "title": "Nossos Campos",
          "subtitle": "Descubra os melhores campos para praticar Footgolf."
        }
      }
    ]'::jsonb),
    ('tournaments', 'Torneios', true, 2, 'Participe dos nossos torneios oficiais.', '[
      {
        "id": "hero-tournaments",
        "type": "hero",
        "data": {
          "title": "Torneios Oficiais",
          "subtitle": "Inscreva-se e compita com os melhores do estado."
        }
      }
    ]'::jsonb),
    ('ranking', 'Ranking', true, 3, 'Acompanhe a classificação dos atletas na temporada.', '[
      {
        "id": "hero-ranking",
        "type": "hero",
        "data": {
          "title": "Ranking Estadual",
          "subtitle": "Veja quem são os líderes da temporada atual."
        }
      }
    ]'::jsonb),
    ('rules', 'Regras', true, 4, 'Conheça as regras oficiais do esporte.', '[
      {
        "id": "hero-rules",
        "type": "hero",
        "data": {
          "title": "Regras do Jogo",
          "subtitle": "Tudo o que você precisa saber para jogar Footgolf."
        }
      }
    ]'::jsonb)
  ON CONFLICT (slug) DO NOTHING;

  -- Update any existing page that has empty content to have a default Hero Block
  UPDATE public.pages
  SET blocks = jsonb_build_array(
    jsonb_build_object(
      'id', gen_random_uuid(),
      'type', 'hero',
      'data', jsonb_build_object(
        'title', title,
        'subtitle', COALESCE(meta_description, 'Bem-vindo(a) à página ' || title)
      )
    )
  )
  WHERE blocks IS NULL OR blocks::text = '[]'::text OR jsonb_array_length(blocks) = 0;
END $$;
