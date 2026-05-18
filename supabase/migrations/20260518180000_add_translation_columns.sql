-- Adicionar colunas de tradução para blog_posts
ALTER TABLE public.blog_posts 
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS summary_en TEXT,
  ADD COLUMN IF NOT EXISTS summary_es TEXT,
  ADD COLUMN IF NOT EXISTS introduction_en TEXT,
  ADD COLUMN IF NOT EXISTS introduction_es TEXT,
  ADD COLUMN IF NOT EXISTS content_en TEXT,
  ADD COLUMN IF NOT EXISTS content_es TEXT,
  ADD COLUMN IF NOT EXISTS conclusion_en TEXT,
  ADD COLUMN IF NOT EXISTS conclusion_es TEXT;

UPDATE public.blog_posts 
SET 
  title_en = title || ' (EN)', title_es = title || ' (ES)',
  summary_en = summary || ' (EN)', summary_es = summary || ' (ES)',
  introduction_en = introduction || ' (EN)', introduction_es = introduction || ' (ES)',
  content_en = content || ' (EN)', content_es = content || ' (ES)',
  conclusion_en = conclusion || ' (EN)', conclusion_es = conclusion || ' (ES)'
WHERE title_en IS NULL;

-- Adicionar colunas de tradução para products
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT;

UPDATE public.products
SET
  name_en = name || ' (EN)', name_es = name || ' (ES)',
  description_en = description || ' (EN)', description_es = description || ' (ES)'
WHERE name_en IS NULL;

-- Adicionar colunas de tradução para events
ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT;

UPDATE public.events
SET
  name_en = name || ' (EN)', name_es = name || ' (ES)',
  description_en = description || ' (EN)', description_es = description || ' (ES)'
WHERE name_en IS NULL;

-- Adicionar colunas de tradução para courses
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS name_en TEXT,
  ADD COLUMN IF NOT EXISTS name_es TEXT,
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_es TEXT;

UPDATE public.courses
SET
  name_en = name || ' (EN)', name_es = name || ' (ES)',
  description_en = description || ' (EN)', description_es = description || ' (ES)'
WHERE name_en IS NULL;

-- Adicionar colunas de tradução para pages
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS title_en TEXT,
  ADD COLUMN IF NOT EXISTS title_es TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_title_es TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_en TEXT,
  ADD COLUMN IF NOT EXISTS meta_description_es TEXT;

UPDATE public.pages
SET
  title_en = title || ' (EN)', title_es = title || ' (ES)'
WHERE title_en IS NULL;
