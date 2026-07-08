DO $$
DECLARE
  v_menu_config JSONB;
  v_financeiro_index INT;
  v_item_exists BOOLEAN;
  v_submenus JSONB;
  v_sys_id UUID := '00000000-0000-0000-0000-000000000001'::uuid;
  v_column_exists BOOLEAN;
  v_insert_pos INT := 0;
  v_idx INT;
  v_item JSONB;
  v_has_submenus_key BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'system_data'
      AND column_name = 'admin_menu_config'
  ) INTO v_column_exists;

  IF NOT v_column_exists THEN
    RETURN;
  END IF;

  SELECT admin_menu_config INTO v_menu_config
  FROM public.system_data
  WHERE id = v_sys_id;

  IF v_menu_config IS NULL OR jsonb_typeof(v_menu_config) != 'array' THEN
    RETURN;
  END IF;

  SELECT (pos - 1) INTO v_financeiro_index
  FROM jsonb_array_elements(v_menu_config) WITH ORDINALITY arr(elem, pos)
  WHERE elem->>'id' = 'financeiro';

  IF v_financeiro_index IS NULL THEN
    RETURN;
  END IF;

  v_has_submenus_key := v_menu_config->v_financeiro_index ? 'submenus';

  IF v_has_submenus_key THEN
    v_submenus := v_menu_config->v_financeiro_index->'submenus';
  ELSE
    v_submenus := v_menu_config->v_financeiro_index->'items';
  END IF;

  IF v_submenus IS NULL OR jsonb_typeof(v_submenus) != 'array' THEN
    v_submenus := '[]'::jsonb;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM jsonb_array_elements(v_submenus) AS item
    WHERE item->>'id' = 'bank-accounts'
       OR item->>'url' = '/admin/financial/bank-accounts'
  ) INTO v_item_exists;

  IF v_item_exists THEN
    RETURN;
  END IF;

  v_insert_pos := jsonb_array_length(v_submenus);

  FOR v_idx IN 0..jsonb_array_length(v_submenus) - 1 LOOP
    v_item := v_submenus->v_idx;
    IF v_item->>'id' = 'chart-of-accounts' THEN
      v_insert_pos := v_idx + 1;
    END IF;
  END LOOP;

  v_submenus := jsonb_insert(
    v_submenus,
    ARRAY[v_insert_pos::text],
    '{"id": "bank-accounts", "label": "Contas Bancárias", "url": "/admin/financial/bank-accounts"}'::jsonb
  );

  IF v_has_submenus_key THEN
    v_menu_config := jsonb_set(
      v_menu_config,
      ARRAY[v_financeiro_index::text, 'submenus'],
      v_submenus
    );
  ELSE
    v_menu_config := jsonb_set(
      v_menu_config,
      ARRAY[v_financeiro_index::text, 'items'],
      v_submenus
    );
  END IF;

  UPDATE public.system_data
  SET admin_menu_config = v_menu_config,
      updated_at = NOW()
  WHERE id = v_sys_id;
END $$;
