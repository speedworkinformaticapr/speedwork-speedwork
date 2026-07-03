DO $$
DECLARE
  current_config jsonb;
  has_sports_group boolean;
  new_config jsonb;
BEGIN
  SELECT admin_menu_config INTO current_config
  FROM public.system_data
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;

  IF current_config IS NULL OR jsonb_typeof(current_config) != 'array' THEN
    new_config := '[
      {"id":"dashboard","label":"Dashboard","url":"/admin/dashboard","icon":"LayoutDashboard"},
      {"id":"esportes","label":"Esportes","icon":"Trophy","submenus":[{"id":"athletes","label":"Atletas","url":"/admin/sports/athletes"}]}
    ]'::jsonb;
  ELSE
    has_sports_group := EXISTS (
      SELECT 1 FROM jsonb_array_elements(current_config) AS elem
      WHERE elem->>'id' = 'esportes'
    );

    IF has_sports_group THEN
      new_config := current_config;
    ELSE
      new_config := current_config || jsonb_build_object(
        'id', 'esportes',
        'label', 'Esportes',
        'icon', 'Trophy',
        'submenus', jsonb_build_array(
          jsonb_build_object('id', 'athletes', 'label', 'Atletas', 'url', '/admin/sports/athletes')
        )
      );
      new_config := jsonb_build_array(new_config);
    END IF;
  END IF;

  UPDATE public.system_data
  SET admin_menu_config = new_config,
      updated_at = NOW()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END $$;
