DO $$
DECLARE
  v_page_id uuid := gen_random_uuid();
  v_section_hero_id uuid := gen_random_uuid();
  v_section_history_id uuid := gen_random_uuid();
  v_section_features_id uuid := gen_random_uuid();
BEGIN
  -- Insert Sections
  INSERT INTO public.sections (id, type, data, is_published, display_order)
  VALUES
    (
      v_section_hero_id,
      'hero',
      '{
        "name": "Sobre - Hero",
        "title": "Sobre Nós",
        "description": "Conheça a história e o compromisso da federação com o desenvolvimento do esporte no estado do Paraná.",
        "icon": "Users",
        "breadcrumbs": [{"label": "Home", "href": "/"}, {"label": "Sobre"}]
      }'::jsonb,
      true,
      0
    ),
    (
      v_section_history_id,
      'text_image',
      '{
        "name": "Sobre - Nossa História",
        "title": "Nossa História",
        "content": "<p>O Footgolf Paraná nasceu da paixão compartilhada por dois dos esportes mais populares do mundo: o futebol e o golfe. Começamos como um pequeno grupo de entusiastas e rapidamente crescemos para nos tornarmos a referência oficial do esporte no estado.</p><p>Nossa organização trabalha incansavelmente para promover competições justas, desenvolver novos talentos e expandir a infraestrutura de campos disponíveis para a prática do Footgolf em todo o Paraná.</p>",
        "imageUrl": "https://img.usecurling.com/p/800/600?q=footgolf&color=blue",
        "imagePosition": "right"
      }'::jsonb,
      true,
      1
    ),
    (
      v_section_features_id,
      'features',
      '{
        "name": "Sobre - Funcionalidades",
        "items": [
          {
            "title": "Missão",
            "description": "Desenvolver, promover e organizar a prática do Footgolf no Paraná, proporcionando eventos de excelência e inclusão para atletas de todos os níveis.",
            "icon": "Target"
          },
          {
            "title": "Visão",
            "description": "Ser reconhecida nacionalmente como a principal força fomentadora do Footgolf, revelando talentos e sediando os melhores torneios do país.",
            "icon": "Shield"
          },
          {
            "title": "Valores",
            "description": "Integridade, respeito, espírito esportivo, inclusão, sustentabilidade e paixão pelo esporte em cada chute e em cada buraco.",
            "icon": "Trophy"
          }
        ]
      }'::jsonb,
      true,
      2
    );

  -- Insert Page if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM public.pages WHERE slug = 'sobre') THEN
    INSERT INTO public.pages (id, slug, title, meta_title, meta_description, is_published, display_order, blocks)
    VALUES (
      v_page_id,
      'sobre',
      'Sobre Nós',
      'Sobre Nós - Footgolf PR',
      'Conheça a história, a missão e os valores do Footgolf no Paraná.',
      true,
      0,
      jsonb_build_array(
        jsonb_build_object('id', gen_random_uuid(), 'section_id', v_section_hero_id, 'isHidden', false),
        jsonb_build_object('id', gen_random_uuid(), 'section_id', v_section_history_id, 'isHidden', false),
        jsonb_build_object('id', gen_random_uuid(), 'section_id', v_section_features_id, 'isHidden', false)
      )
    );
  END IF;
END $$;
