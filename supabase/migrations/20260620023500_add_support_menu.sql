DO $$
DECLARE
  v_menu jsonb;
  v_new_group jsonb := '{
    "id": "suporte",
    "icon": "LifeBuoy",
    "label": "Suporte",
    "items": [
      { "id": "sup-tickets", "path": "/admin/support/tickets", "label": "Gestão de Chamados", "icon": "Ticket" },
      { "id": "sup-sla", "path": "/admin/support/sla", "label": "Configurações de SLA", "icon": "Clock" }
    ],
    "submenus": [
      { "id": "sup-tickets", "url": "/admin/support/tickets", "label": "Gestão de Chamados", "icon": "Ticket" },
      { "id": "sup-sla", "url": "/admin/support/sla", "label": "Configurações de SLA", "icon": "Clock" }
    ]
  }'::jsonb;
BEGIN
  SELECT admin_menu_config INTO v_menu FROM system_data WHERE id = '00000000-0000-0000-0000-000000000001';

  IF v_menu IS NOT NULL AND jsonb_typeof(v_menu) = 'array' THEN
    IF NOT (
      SELECT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(v_menu) AS elem
        WHERE elem->>'id' IN ('suporte', 'support')
      )
    ) THEN
      UPDATE system_data 
      SET admin_menu_config = v_menu || jsonb_build_array(v_new_group)
      WHERE id = '00000000-0000-0000-0000-000000000001';
    END IF;
  END IF;
END $$;
