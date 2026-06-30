-- Remove the public evaluation landing page if it was added as a dynamic page
DELETE FROM public.pages WHERE slug = 'avaliar';
