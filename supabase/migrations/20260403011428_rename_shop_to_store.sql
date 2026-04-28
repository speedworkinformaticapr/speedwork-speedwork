-- Renames the 'shop' page to 'store' dynamically for consistency with the new store URL pattern
UPDATE public.pages
SET slug = 'store'
WHERE slug = 'shop';
