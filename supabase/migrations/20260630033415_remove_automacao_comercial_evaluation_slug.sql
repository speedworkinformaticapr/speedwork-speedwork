-- Remove evaluation_slug for 'automacao-comercial' service to prevent 404 errors
-- from non-existent /avaliar/automacao-comercial route
UPDATE public.services SET evaluation_slug = NULL WHERE evaluation_slug = 'automacao-comercial';

-- Remove any 'avaliar' page that might generate navigation links to /avaliar/* paths
DELETE FROM public.pages WHERE slug = 'avaliar';

-- Clean up submenus in pages that reference /avaliar/ paths
UPDATE public.pages
SET submenus = COALESCE(
  (SELECT jsonb_agg(elem)
   FROM jsonb_array_elements(submenus) AS elem
   WHERE NOT (elem->>'url') LIKE '%/avaliar/%'),
  '[]'::jsonb
)
WHERE submenus IS NOT NULL
  AND submenus::text LIKE '%/avaliar/%';

-- Clean up hero carousel entries with link_url containing /avaliar/
DELETE FROM public.hero_carousel WHERE link_url LIKE '%/avaliar/%';

-- Clean up sections data that might reference /avaliar/ paths
DELETE FROM public.sections
WHERE data::text LIKE '%/avaliar/automacao-comercial%';
