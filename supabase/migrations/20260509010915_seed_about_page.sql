DO $$
DECLARE
  new_page_id uuid := gen_random_uuid();
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.pages WHERE slug = 'sobre') THEN
    INSERT INTO public.pages (id, title, slug, is_published, meta_title, meta_description, blocks)
    VALUES (
      new_page_id,
      'Sobre Nós',
      'sobre',
      true,
      'Nossa História e Valores - Federação',
      'Conheça a história, missão, visão e valores da nossa Federação.',
      '[
        {
          "id": "block-hero",
          "type": "hero",
          "name": "Hero Principal",
          "order": 0,
          "data": {
            "title": "Sobre Nós",
            "subtitle": "Conheça a história e os princípios que nos guiam na promoção do Footgolf.",
            "backgroundImage": "https://img.usecurling.com/p/1200/600?q=golf%20course"
          }
        },
        {
          "id": "block-history",
          "type": "text_image",
          "name": "Nossa História",
          "order": 1,
          "data": {
            "title": "A Nossa História",
            "content": "<p>A Federação nasceu da paixão pelo esporte e da vontade de unir atletas e clubes em torno do Footgolf.</p><p>Desde a nossa fundação, temos trabalhado incansavelmente para promover competições justas, transparentes e de alto nível, fomentando o crescimento da modalidade em todo o estado.</p>",
            "imageUrl": "https://img.usecurling.com/p/600/400?q=team%20sports",
            "imagePosition": "right"
          }
        },
        {
          "id": "block-features",
          "type": "feature_cards",
          "name": "Missão, Visão e Valores",
          "order": 2,
          "data": {
            "title": "Nossos Princípios",
            "items": [
              {
                "title": "Missão",
                "icon": "Target",
                "description": "Fomentar e desenvolver a prática do Footgolf, oferecendo suporte técnico, estrutural e organizacional para clubes e atletas."
              },
              {
                "title": "Visão",
                "icon": "Shield",
                "description": "Ser a instituição de referência nacional na organização e gestão do Footgolf, reconhecida pela excelência e transparência."
              },
              {
                "title": "Valores",
                "icon": "Trophy",
                "description": "Ética, respeito, inclusão, sustentabilidade e paixão pelo esporte."
              }
            ]
          }
        }
      ]'::jsonb
    );
  END IF;
END $$;
