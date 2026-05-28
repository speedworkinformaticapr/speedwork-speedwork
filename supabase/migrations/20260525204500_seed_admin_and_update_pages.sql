DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed user (idempotent: skip if email already exists)
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
      '', '', '', '', '',
      NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Test', 'admin')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.usuarios (user_id, email, nome, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Test', 'admin')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;

-- Insert pages for dashboards if missing
INSERT INTO public.pages (id, slug, title, title_en, title_es, is_published, display_order, submenus)
VALUES 
  (gen_random_uuid(), 'dashboards', 'Dashboards', 'Dashboards', 'Paneles', true, 1, 
    '[
      {"title": "Dashboard Geral", "title_en": "General Dashboard", "title_es": "Panel General", "slug": "admin/dashboard", "icon": "LayoutDashboard"},
      {"title": "Financeiro", "title_en": "Financial", "title_es": "Financiero", "slug": "admin/financial/dashboard", "icon": "DollarSign"},
      {"title": "Agendamentos", "title_en": "Appointments", "title_es": "Citas", "slug": "admin/appointments-dashboard", "icon": "Calendar"},
      {"title": "Comercial", "title_en": "Commercial", "title_es": "Comercial", "slug": "admin/commercial/dashboard", "icon": "TrendingUp"}
    ]'::jsonb),
  (gen_random_uuid(), 'scheduling', 'Agendamentos', 'Scheduling', 'Citas', true, 2, '[]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET 
  title = EXCLUDED.title,
  title_en = EXCLUDED.title_en,
  title_es = EXCLUDED.title_es,
  submenus = EXCLUDED.submenus;
