-- Force PostgREST to reload the schema cache so new columns are immediately available
NOTIFY pgrst, 'reload schema';
