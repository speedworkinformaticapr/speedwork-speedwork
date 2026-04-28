DO $$
DECLARE
  i INT;
  j INT;
  new_club_id UUID;
  new_category_id UUID;
  club_count INT;
BEGIN
  -- Verificar se já existem clubes seed para garantir idempotência
  SELECT COUNT(*) INTO club_count FROM public.clubs WHERE name LIKE 'Clube Seed %';
  
  IF club_count = 0 THEN
      -- Inserir uma categoria padrão se não houver
      INSERT INTO public.categories (id, name, status) 
      VALUES (gen_random_uuid(), 'Categoria Padrão Seed', 'active')
      ON CONFLICT DO NOTHING
      RETURNING id INTO new_category_id;
    
      IF new_category_id IS NULL THEN
        SELECT id INTO new_category_id FROM public.categories LIMIT 1;
      END IF;
    
      -- Gerar 20 clubes
      FOR i IN 1..20 LOOP
        new_club_id := gen_random_uuid();
        INSERT INTO public.clubs (id, name, city, state, status, affiliation_status)
        VALUES (new_club_id, 'Clube Seed ' || i, 'Cidade ' || i, 'PR', 'active', 'active');
        
        -- Gerar 48 atletas por clube (20 * 48 = 960)
        FOR j IN 1..48 LOOP
          INSERT INTO public.athletes (
            id, club_id, name, category_id, status, gender
          ) VALUES (
            gen_random_uuid(), 
            new_club_id, 
            'Atleta Seed ' || ((i-1)*48 + j), 
            new_category_id, 
            'active', 
            CASE WHEN j % 2 = 0 THEN 'Feminino' ELSE 'Masculino' END
          );
        END LOOP;
      END LOOP;
  END IF;
END $$;
