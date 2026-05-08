ALTER TABLE public.media_items ADD COLUMN IF NOT EXISTS name TEXT;

-- Update existing rows to have a name based on title or file_name to avoid nulls
UPDATE public.media_items SET name = COALESCE(title, file_name) WHERE name IS NULL;
