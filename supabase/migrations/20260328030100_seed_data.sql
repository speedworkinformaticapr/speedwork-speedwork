DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Profissional') THEN
    INSERT INTO public.categories (name) VALUES ('Profissional'), ('Amador'), ('Sênior'), ('Iniciante');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.clubs WHERE name = 'Curitiba Footgolf Club') THEN
    INSERT INTO public.clubs (name, city, state) VALUES 
      ('Curitiba Footgolf Club', 'Curitiba', 'PR'),
      ('Londrina Footgolf', 'Londrina', 'PR'),
      ('Maringá FG', 'Maringá', 'PR');
  END IF;
END $$;
