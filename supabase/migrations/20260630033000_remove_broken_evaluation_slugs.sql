-- Remove evaluation_slug references that point to non-existent /avaliar/ routes
-- The /avaliar/ public evaluation page has been removed, so any service
-- with an evaluation_slug would generate a broken link.
-- Nullify all evaluation_slug values to prevent 404 errors from stale links.

UPDATE public.services
SET evaluation_slug = NULL
WHERE evaluation_slug IS NOT NULL;

-- Drop the unique partial index before any future operations can conflict
DROP INDEX IF EXISTS idx_services_evaluation_slug_unique;
