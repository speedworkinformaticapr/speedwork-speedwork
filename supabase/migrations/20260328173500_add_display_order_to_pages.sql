-- Add display_order column to pages table
ALTER TABLE public.pages ADD COLUMN IF NOT EXISTS display_order INTEGER NOT NULL DEFAULT 0;
