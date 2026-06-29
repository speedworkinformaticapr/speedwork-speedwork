DO $$
BEGIN
  UPDATE public.system_data
  SET admin_menu_config = NULL,
      updated_at = NOW()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END $$;
