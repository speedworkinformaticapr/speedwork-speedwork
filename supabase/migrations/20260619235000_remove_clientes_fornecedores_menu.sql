DO $block$
DECLARE
  v_menu jsonb;
  v_group jsonb;
  v_item jsonb;
  v_new_submenus jsonb;
  v_new_menu jsonb := '[]'::jsonb;
BEGIN
  -- Get current menu config
  SELECT admin_menu_config INTO v_menu FROM system_data WHERE id = '00000000-0000-0000-0000-000000000001';

  IF v_menu IS NOT NULL AND jsonb_typeof(v_menu) = 'array' THEN
    FOR v_group IN SELECT * FROM jsonb_array_elements(v_menu)
    LOOP
      -- Process submenus (AdminSidebar format)
      IF v_group ? 'submenus' AND jsonb_typeof(v_group->'submenus') = 'array' THEN
        v_new_submenus := '[]'::jsonb;
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_group->'submenus')
        LOOP
          IF v_item->>'label' != 'Clientes e Fornecedores' AND v_item->>'label' != 'Clients and Suppliers' THEN
            -- Update old path if it exists
            IF v_item->>'url' = '/admin/business/profiles' THEN
              v_item := jsonb_set(v_item, '{url}', '"/admin/users"');
            END IF;
            v_new_submenus := v_new_submenus || v_item;
          END IF;
        END LOOP;
        v_group := jsonb_set(v_group, '{submenus}', v_new_submenus);
      END IF;

      -- Process items (AppSidebar / DEFAULT_MENU_CONFIG format)
      IF v_group ? 'items' AND jsonb_typeof(v_group->'items') = 'array' THEN
        v_new_submenus := '[]'::jsonb;
        FOR v_item IN SELECT * FROM jsonb_array_elements(v_group->'items')
        LOOP
          IF v_item->>'label' != 'Clientes e Fornecedores' AND v_item->>'label' != 'Clients and Suppliers' THEN
            -- Update old path if it exists
            IF v_item->>'path' = '/admin/business/profiles' THEN
              v_item := jsonb_set(v_item, '{path}', '"/admin/users"');
            END IF;
            v_new_submenus := v_new_submenus || v_item;
          END IF;
        END LOOP;
        v_group := jsonb_set(v_group, '{items}', v_new_submenus);
      END IF;
      
      v_new_menu := v_new_menu || v_group;
    END LOOP;

    -- Save back updated menu
    UPDATE system_data SET admin_menu_config = v_new_menu WHERE id = '00000000-0000-0000-0000-000000000001';
  END IF;
END $block$;
