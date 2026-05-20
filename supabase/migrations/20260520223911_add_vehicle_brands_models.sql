DO $$
BEGIN
    CREATE TABLE IF NOT EXISTS public.vehicle_brands (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS public.vehicle_models (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        brand_id UUID NOT NULL REFERENCES public.vehicle_brands(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE(brand_id, name)
    );
END $$;

ALTER TABLE public.vehicle_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "brands_select_all" ON public.vehicle_brands;
CREATE POLICY "brands_select_all" ON public.vehicle_brands FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "models_select_all" ON public.vehicle_models;
CREATE POLICY "models_select_all" ON public.vehicle_models FOR SELECT TO authenticated USING (true);

DO $$
BEGIN
    UPDATE public.orcamentos SET veiculo_placa = 'NAO INF' WHERE veiculo_placa IS NULL;
    UPDATE public.orcamentos SET veiculo_km = '0' WHERE veiculo_km IS NULL;
    
    UPDATE public.pedidos SET veiculo_placa = 'NAO INF' WHERE veiculo_placa IS NULL;
    UPDATE public.pedidos SET veiculo_km = '0' WHERE veiculo_km IS NULL;

    ALTER TABLE public.orcamentos ALTER COLUMN veiculo_placa SET NOT NULL;
    ALTER TABLE public.orcamentos ALTER COLUMN veiculo_placa SET DEFAULT '';
    ALTER TABLE public.orcamentos ALTER COLUMN veiculo_km SET NOT NULL;
    ALTER TABLE public.orcamentos ALTER COLUMN veiculo_km SET DEFAULT '0';

    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS veiculo_brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE SET NULL;
    ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS veiculo_model_id UUID REFERENCES public.vehicle_models(id) ON DELETE SET NULL;

    ALTER TABLE public.pedidos ALTER COLUMN veiculo_placa SET NOT NULL;
    ALTER TABLE public.pedidos ALTER COLUMN veiculo_placa SET DEFAULT '';
    ALTER TABLE public.pedidos ALTER COLUMN veiculo_km SET NOT NULL;
    ALTER TABLE public.pedidos ALTER COLUMN veiculo_km SET DEFAULT '0';

    ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS veiculo_brand_id UUID REFERENCES public.vehicle_brands(id) ON DELETE SET NULL;
    ALTER TABLE public.pedidos ADD COLUMN IF NOT EXISTS veiculo_model_id UUID REFERENCES public.vehicle_models(id) ON DELETE SET NULL;
END $$;

DO $$
DECLARE
    kia_id UUID;
    hyundai_id UUID;
BEGIN
    INSERT INTO public.vehicle_brands (name) VALUES ('KIA') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO kia_id;
    
    INSERT INTO public.vehicle_models (brand_id, name) VALUES 
    (kia_id, 'Sorento'), (kia_id, 'EV9'), (kia_id, 'EV5'), (kia_id, 'Stonic MHEV'), 
    (kia_id, 'Niro HEV'), (kia_id, 'Sportage MHEV'), (kia_id, 'Carnival HEV'), 
    (kia_id, 'Bongo'), (kia_id, 'Picanto'), (kia_id, 'Cerato'), (kia_id, 'Soul'), (kia_id, 'K4')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.vehicle_brands (name) VALUES ('HYUNDAI') ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id INTO hyundai_id;

    INSERT INTO public.vehicle_models (brand_id, name) VALUES 
    (hyundai_id, 'HB20'), (hyundai_id, 'HB20S'), (hyundai_id, 'Creta'), (hyundai_id, 'Kona Híbrido'), 
    (hyundai_id, 'Palisade'), (hyundai_id, 'Tucson'), (hyundai_id, 'Venue'), (hyundai_id, 'Santa Fé')
    ON CONFLICT DO NOTHING;
END $$;

DO $$
DECLARE
    new_user_id UUID;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
        new_user_id := gen_random_uuid();
        INSERT INTO auth.users (
            id, instance_id, email, encrypted_password, email_confirmed_at,
            created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
            is_super_admin, role, aud,
            confirmation_token, recovery_token, email_change_token_new,
            email_change, email_change_token_current,
            phone, phone_change, phone_change_token, reauthentication_token
        ) VALUES (
            new_user_id,
            '00000000-0000-0000-0000-000000000000',
            'ias2371@gmail.com',
            crypt('Skip@Pass', gen_salt('bf')),
            NOW(), NOW(), NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Admin Test"}',
            false, 'authenticated', 'authenticated',
            '', '', '', '', '', NULL, '', '', ''
        );
        INSERT INTO public.profiles (id, email, name, role)
        VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Test', 'admin')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;
