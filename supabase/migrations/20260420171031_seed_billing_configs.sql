DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.billing_configuration LIMIT 1) THEN
    INSERT INTO public.billing_configuration (company_name, email, payment_methods)
    VALUES ('Plataforma Footgolf', 'contato@footgolf.com', '["pix", "card"]'::jsonb);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.billing_registration_config LIMIT 1) THEN
    INSERT INTO public.billing_registration_config (payment_method, charge_on_athlete_registration, charge_on_club_registration)
    VALUES ('both', false, false);
  END IF;
END $$;
