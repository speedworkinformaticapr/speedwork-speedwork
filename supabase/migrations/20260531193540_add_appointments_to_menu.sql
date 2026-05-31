DO $$
DECLARE
  v_menu_config JSONB;
  v_comercial_index INT;
  v_item_exists BOOLEAN;
  v_sys_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  v_items JSONB;
BEGIN
  SELECT admin_menu_config INTO v_menu_config FROM public.system_data WHERE id = v_sys_id;

  IF v_menu_config IS NOT NULL AND jsonb_typeof(v_menu_config) = 'array' THEN
    SELECT pos - 1 INTO v_comercial_index
    FROM jsonb_array_elements(v_menu_config) WITH ORDINALITY arr(elem, pos)
    WHERE elem->>'id' = 'comercial';

    IF v_comercial_index IS NOT NULL THEN
      v_items := v_menu_config->v_comercial_index->'items';
      
      IF v_items IS NULL OR jsonb_typeof(v_items) != 'array' THEN
        v_items := '[]'::jsonb;
      END IF;

      SELECT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(v_items) AS item
        WHERE item->>'id' = 'com-agendamentos' OR item->>'path' = '/admin/commercial/appointments'
      ) INTO v_item_exists;

      IF NOT v_item_exists THEN
        v_items := jsonb_insert(
          v_items,
          '{0}',
          '{"id": "com-agendamentos", "label": "Agendamentos", "path": "/admin/commercial/appointments", "icon": "Calendar"}'::jsonb
        );
        
        v_menu_config := jsonb_set(
          v_menu_config,
          ARRAY[v_comercial_index::text, 'items'],
          v_items
        );

        UPDATE public.system_data SET admin_menu_config = v_menu_config WHERE id = v_sys_id;
      END IF;
    END IF;
  END IF;
END $$;
