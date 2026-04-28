ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE public.clubs ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

DO $$
BEGIN
  -- Sync existing soft-deleted profiles to athletes
  UPDATE public.athletes a
  SET deleted_at = p.deleted_at,
      status = 'inactive'
  FROM public.profiles p
  WHERE a.profile_id = p.id 
    AND p.deleted_at IS NOT NULL 
    AND a.deleted_at IS NULL;

  -- Sync existing soft-deleted profiles to clubs
  UPDATE public.clubs c
  SET deleted_at = p.deleted_at,
      status = 'inactive'
  FROM public.profiles p
  WHERE c.profile_id = p.id 
    AND p.deleted_at IS NOT NULL 
    AND c.deleted_at IS NULL;
END $$;
