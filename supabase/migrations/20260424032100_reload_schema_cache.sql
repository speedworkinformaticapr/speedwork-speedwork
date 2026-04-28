-- Force update of the schema cache in PostgREST to prevent errors
-- The columns were added but sometimes the API cache needs an explicit reload
NOTIFY pgrst, 'reload schema';
