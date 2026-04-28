DO $$ 
BEGIN
    -- Add rating to products
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS rating numeric DEFAULT 5.0;

    -- Create cart_items table
    CREATE TABLE IF NOT EXISTS public.cart_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
        product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
        quantity integer DEFAULT 1,
        created_at timestamptz DEFAULT now(),
        UNIQUE(user_id, product_id)
    );

    -- Enable RLS for cart_items
    ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can manage their own cart items" ON public.cart_items;
    CREATE POLICY "Users can manage their own cart items" ON public.cart_items
        FOR ALL TO authenticated
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    -- Add missing columns to orders
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_address text;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_method text;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount numeric DEFAULT 0;

    -- Update RLS for orders
    DROP POLICY IF EXISTS "Enable read access for all users" ON public.orders;
    DROP POLICY IF EXISTS "Enable read access for own orders" ON public.orders;
    DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.orders;
    DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.orders;
    DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.orders;
    DROP POLICY IF EXISTS "Users can read own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
    DROP POLICY IF EXISTS "Users can update own orders" ON public.orders;

    CREATE POLICY "Users can read own orders" ON public.orders
        FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() IN (SELECT user_id FROM athletes WHERE id = athlete_id));

    CREATE POLICY "Users can insert own orders" ON public.orders
        FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own orders" ON public.orders
        FOR UPDATE TO authenticated USING (auth.uid() = user_id);

    -- Seed products if none exist
    IF NOT EXISTS (SELECT 1 FROM public.products LIMIT 1) THEN
        INSERT INTO public.products (id, name, description, price, image_url, category, stock, rating) VALUES
        (gen_random_uuid(), 'Bola Oficial Footgolf', 'Bola tamanho 5 padrão FIFA. Essencial para competições profissionais, garantindo o peso e a circunferência ideais.', 199.90, 'https://img.usecurling.com/p/400/400?q=soccer%20ball&color=white', 'Equipamento', 50, 4.8),
        (gen_random_uuid(), 'Camisa Polo Pro', 'Camisa polo respirável para jogos em dias quentes. Tecido de alta tecnologia que afasta o suor do corpo.', 149.90, 'https://img.usecurling.com/p/400/400?q=polo%20shirt&color=green', 'Vestuário', 100, 4.5),
        (gen_random_uuid(), 'Meias Argyle Premium', 'Meias tradicionais de golfe, padrão xadrez. O clássico encontra o esporte moderno com conforto extremo.', 59.90, 'https://img.usecurling.com/p/400/400?q=argyle%20socks&color=blue', 'Vestuário', 200, 4.9),
        (gen_random_uuid(), 'Chuteira Society', 'Chuteira sem travas para proteger o green. Essencial e obrigatório de acordo com o livro de regras oficial.', 299.90, 'https://img.usecurling.com/p/400/400?q=turf%20shoes&color=black', 'Calçados', 30, 4.7),
        (gen_random_uuid(), 'Boné Footgolf PR', 'Boné oficial do circuito. Proteção solar essencial para partidas longas ao ar livre.', 79.90, 'https://img.usecurling.com/p/400/400?q=baseball%20cap&color=white', 'Acessórios', 80, 4.6),
        (gen_random_uuid(), 'Marcador de Bola', 'Marcador magnético de metal para uso no green. Permite limpar a bola sem perder a posição.', 29.90, 'https://img.usecurling.com/p/400/400?q=metal%20coin&color=gray', 'Acessórios', 150, 4.2)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
