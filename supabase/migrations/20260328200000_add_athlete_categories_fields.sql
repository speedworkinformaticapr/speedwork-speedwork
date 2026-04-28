-- Add fields to categories table for Athlete Category logic
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS min_age INTEGER;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS max_age INTEGER;
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS icon TEXT;

-- Add gender to athletes table
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS gender TEXT;

-- Insert the 6 requested default categories with logic
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Masculino') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Masculino', 18, NULL, 'M', 'Categoria Masculina (18+)');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Senior Masculino') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Senior Masculino', 45, 54, 'M', 'Categoria Senior Masculino (45 a 54 anos)');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Senior Plus Masculino') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Senior Plus Masculino', 55, NULL, 'M', 'Categoria Senior Plus Masculino (55+)');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Feminino') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Feminino', NULL, NULL, 'F', 'Categoria Feminina (todas as idades)');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Senior Feminino') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Senior Feminino', 45, NULL, 'F', 'Categoria Senior Feminino (45+)');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE name = 'Juniores') THEN
    INSERT INTO public.categories (id, name, min_age, max_age, gender, description) 
    VALUES (gen_random_uuid(), 'Juniores', NULL, 17, NULL, 'Categoria Juniores (Sub-15 e Sub-18)');
  END IF;
END $$;
