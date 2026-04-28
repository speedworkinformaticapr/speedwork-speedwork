-- Create additional tables needed for the full application functionality

-- Base Tables that might be missing
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.athletes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  birth_date DATE,
  gender TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- System Settings
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pages
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Page Sections
CREATE TABLE IF NOT EXISTS public.page_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES public.pages(id) ON DELETE CASCADE,
  title TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Athlete Attributes
CREATE TABLE IF NOT EXISTS public.athlete_attributes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Athlete Evaluations
CREATE TABLE IF NOT EXISTS public.athlete_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluation_date DATE NOT NULL,
  notes TEXT,
  metrics JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Athlete Scouting
CREATE TABLE IF NOT EXISTS public.athlete_scouting (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
  scout_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  report TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Categories
CREATE TABLE IF NOT EXISTS public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Partners
CREATE TABLE IF NOT EXISTS public.financial_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  document TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Financial Transactions
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.financial_categories(id) ON DELETE SET NULL,
  partner_id UUID REFERENCES public.financial_partners(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date DATE,
  payment_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Abandoned Carts
CREATE TABLE IF NOT EXISTS public.abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recovered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Logistics
CREATE TABLE IF NOT EXISTS public.logistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  tracking_code TEXT,
  carrier TEXT,
  status TEXT DEFAULT 'processing',
  estimated_delivery DATE,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Hero Carousel
CREATE TABLE IF NOT EXISTS public.hero_carousel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Publish Logs
CREATE TABLE IF NOT EXISTS public.publish_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Registration Payments
CREATE TABLE IF NOT EXISTS public.registration_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE,
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Billing Logs
CREATE TABLE IF NOT EXISTS public.billing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES public.financial_transactions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rankings
CREATE TABLE IF NOT EXISTS public.rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id UUID REFERENCES public.athletes(id) ON DELETE CASCADE,
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE SET NULL,
  points INTEGER NOT NULL DEFAULT 0,
  position INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS on all new tables
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.athlete_scouting ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_carousel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registration_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;

-- Apply RLS policies
DO $$
DECLARE
  table_name text;
  tables text[] := ARRAY[
    'athletes', 'tournaments', 'orders',
    'system_settings', 'pages', 'page_sections', 'athlete_attributes', 
    'athlete_evaluations', 'athlete_scouting', 'financial_categories', 
    'financial_partners', 'financial_transactions', 'abandoned_carts', 
    'logistics', 'hero_carousel', 'publish_logs', 'registration_payments',
    'billing_logs', 'rankings'
  ];
BEGIN
  FOREACH table_name IN ARRAY tables
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS "Public can view %I" ON public.%I', table_name, table_name);
    
    -- Allow public read for specific tables
    IF table_name IN ('system_settings', 'pages', 'page_sections', 'athlete_attributes', 'hero_carousel', 'rankings', 'tournaments') THEN
      EXECUTE format('CREATE POLICY "Public can view %I" ON public.%I FOR SELECT USING (true)', table_name, table_name);
    END IF;

    EXECUTE format('DROP POLICY IF EXISTS "Admin can manage %I" ON public.%I', table_name, table_name);
    EXECUTE format('CREATE POLICY "Admin can manage %I" ON public.%I USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = ''admin''))', table_name, table_name);
  END LOOP;
END $$;

-- Additional user-specific policies
DROP POLICY IF EXISTS "Users can view their abandoned carts" ON public.abandoned_carts;
CREATE POLICY "Users can view their abandoned carts" ON public.abandoned_carts FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their abandoned carts" ON public.abandoned_carts;
CREATE POLICY "Users can manage their abandoned carts" ON public.abandoned_carts FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their logistics" ON public.logistics;
CREATE POLICY "Users can view their logistics" ON public.logistics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = logistics.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Athletes can view their registration payments" ON public.registration_payments;
CREATE POLICY "Athletes can view their registration payments" ON public.registration_payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.athletes WHERE id = registration_payments.athlete_id AND profile_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can view their athletes" ON public.athletes;
CREATE POLICY "Users can view their athletes" ON public.athletes FOR SELECT USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "Users can view their orders" ON public.orders;
CREATE POLICY "Users can view their orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

-- Seed/Update Admin User from the request
DO $$
DECLARE
  new_user_id uuid;
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
      crypt('Sp23Wk71@1994', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin", "role": "admin"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '',
      NULL, '', '', ''
    );
  ELSE
    UPDATE auth.users 
    SET encrypted_password = crypt('Sp23Wk71@1994', gen_salt('bf')),
        raw_user_meta_data = '{"name": "Admin", "role": "admin"}'
    WHERE email = 'ias2371@gmail.com';
    
    SELECT id INTO new_user_id FROM auth.users WHERE email = 'ias2371@gmail.com';
  END IF;

  -- Ensure profile role is admin
  INSERT INTO public.profiles (id, email, name, role) 
  VALUES (new_user_id, 'ias2371@gmail.com', 'Admin', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin';
END $$;
