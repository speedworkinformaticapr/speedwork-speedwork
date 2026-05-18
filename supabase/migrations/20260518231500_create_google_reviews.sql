CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_url TEXT,
  profile_photo_url TEXT,
  rating INTEGER NOT NULL,
  text TEXT,
  time INTEGER,
  relative_time_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'google_reviews_author_time_key'
  ) THEN
    ALTER TABLE public.google_reviews ADD CONSTRAINT google_reviews_author_time_key UNIQUE(author_name, time);
  END IF;
END $$;

ALTER TABLE public.google_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "google_reviews_select" ON public.google_reviews;
CREATE POLICY "google_reviews_select" ON public.google_reviews FOR SELECT USING (true);
