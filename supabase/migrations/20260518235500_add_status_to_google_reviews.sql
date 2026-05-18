ALTER TABLE public.google_reviews ADD COLUMN IF NOT EXISTS status text DEFAULT 'approved';

UPDATE public.google_reviews SET status = 'approved' WHERE status IS NULL;

DROP POLICY IF EXISTS "google_reviews_update" ON public.google_reviews;
CREATE POLICY "google_reviews_update" ON public.google_reviews
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
