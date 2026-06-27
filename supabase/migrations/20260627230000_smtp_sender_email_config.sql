DO $$
BEGIN
  UPDATE public.system_data
  SET integrations = jsonb_set(
    COALESCE(integrations, '{}'::jsonb),
    '{smtp_sender_email}',
    COALESCE(
      (integrations->>'smtp_sender_email')::jsonb,
      to_jsonb(COALESCE(email, 'contato@speedwork.com.br'))
    ),
    true
  )
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
    AND NOT (integrations ? 'smtp_sender_email');
END $$;
