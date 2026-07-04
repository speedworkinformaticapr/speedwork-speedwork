ALTER TABLE public.financial_charges
  DROP CONSTRAINT IF EXISTS financial_charges_master_record_id_fkey;

ALTER TABLE public.financial_charges
  ADD CONSTRAINT financial_charges_master_record_id_fkey
  FOREIGN KEY (master_record_id) REFERENCES public.financial_master_records(id) ON DELETE CASCADE;

UPDATE public.system_data
SET admin_menu_config = (
  SELECT COALESCE(jsonb_agg(
    CASE
      WHEN grp->>'id' = 'financeiro' THEN
        jsonb_set(
          grp,
          '{submenus}',
          COALESCE(
            (
              SELECT jsonb_agg(
                CASE
                  WHEN sub->>'id' = 'financial-dashboard' THEN
                    jsonb_set(sub, '{label}', '"Fluxo de Caixa"')
                  WHEN sub->>'id' = 'financial-dashboard' THEN
                    jsonb_set(sub, '{url}', '"/admin/financial"')
                  ELSE sub
                END
              )
              FROM jsonb_array_elements(grp->'submenus') AS sub
            ),
            grp->'submenus'
          )
        )
      ELSE grp
    END
  ), '[]'::jsonb)
  FROM jsonb_array_elements(COALESCE(admin_menu_config, '[]'::jsonb)) AS grp
),
updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001'::uuid
  AND admin_menu_config IS NOT NULL;
