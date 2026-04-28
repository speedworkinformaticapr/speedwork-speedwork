DO $$
BEGIN
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS image_url TEXT;
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS summary TEXT;
  ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
EXCEPTION
  WHEN undefined_table THEN
    NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.blog_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  ALTER TABLE public.blog_comments ENABLE ROW LEVEL SECURITY;
EXCEPTION
  WHEN others THEN NULL;
END $$;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.blog_comments;
CREATE POLICY "Enable read access for all users" ON public.blog_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable insert for all users" ON public.blog_comments;
CREATE POLICY "Enable insert for all users" ON public.blog_comments
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.blog_comments;
CREATE POLICY "Enable all access for authenticated users" ON public.blog_comments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Seed Initial Posts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.blog_posts LIMIT 1) THEN
    INSERT INTO public.blog_posts (id, title, summary, content, category, image_url, tags, published_at)
    VALUES 
      (gen_random_uuid(), 'O Guia Definitivo do Footgolf', 'Tudo o que você precisa saber para começar no esporte que mais cresce no Brasil.', '## Introdução ao Esporte\n\nO Footgolf é uma mistura fascinante de futebol e golfe. Jogado em um campo de golfe (com buracos adaptados), o objetivo é completar o circuito com o menor número de chutes possíveis.\n\n### Equipamentos Básicos\n- Bola de futebol tamanho 5\n- Chuteira de society (travas de borracha ou turf)\n- Roupas adequadas (bermuda, meião, camisa gola polo)\n\n### Regras de Etiqueta\nManter o silêncio durante o chute do adversário e preservar o campo (principalmente os greens) são regras de ouro no esporte.', 'Iniciantes', 'https://img.usecurling.com/p/800/400?q=golf&color=green', '["regras", "dicas"]'::jsonb, NOW()),
      (gen_random_uuid(), 'Como melhorar seu Handicap', 'Dicas avançadas de profissionais para reduzir seus números e melhorar no ranking estadual.', '## Análise de Campo\n\nAntes de realizar seu chute inicial (Tee shot), analise o vento, o declive do terreno e as armadilhas (bunkers e água). Um bom planejamento vale mais que força bruta.\n\n### Treino Mental\nO golfe é 80% mental, e o footgolf não é diferente. Aprender a esquecer um buraco ruim e focar no próximo chute é a diferença entre um campeão e um amador.\n\n### Chute de Aproximação (Putt)\nTreine a leitura do "green". A grama baixa e as ondulações exigem um toque sutil com a parte interna do pé.', 'Avançado', 'https://img.usecurling.com/p/800/400?q=sports&color=blue', '["treino", "handicap", "competição"]'::jsonb, NOW());
  END IF;
END $$;
