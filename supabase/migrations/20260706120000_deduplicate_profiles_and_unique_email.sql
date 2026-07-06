-- Deduplicate profiles by email and add UNIQUE constraint on email column
-- This prevents "multiple rows returned" errors when using .single() or .maybeSingle()

-- Step 1: Remove duplicate profiles for each email, keeping only the most relevant record
-- Strategy: Keep the profile that has a matching auth.users entry; if multiple, keep the newest
DO $$
DECLARE
  dup_record RECORD;
  keep_id uuid;
BEGIN
  FOR dup_record IN
    SELECT email, COUNT(*) as cnt
    FROM public.profiles
    WHERE email IS NOT NULL AND email != ''
    GROUP BY email
    HAVING COUNT(*) > 1
  LOOP
    -- Find the best profile to keep: prefer one linked to auth.users, then newest by created_at
    SELECT p.id INTO keep_id
    FROM public.profiles p
    LEFT JOIN auth.users u ON u.id = p.id
    WHERE p.email = dup_record.email
    ORDER BY
      (u.id IS NOT NULL) DESC,
      p.created_at DESC NULLS LAST
    LIMIT 1;

    IF keep_id IS NOT NULL THEN
      -- Delete all other duplicate profiles for this email
      DELETE FROM public.profiles
      WHERE email = dup_record.email
        AND id != keep_id;

      RAISE NOTICE 'Deduplicated email %: kept profile %, removed % duplicates',
        dup_record.email, keep_id, dup_record.cnt - 1;
    END IF;
  END LOOP;
END $$;

-- Step 2: Add UNIQUE constraint on email column (idempotent)
-- First check if the constraint already exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_email_unique'
      AND conrelid = 'public.profiles'::regclass
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
    RAISE NOTICE 'Added UNIQUE constraint on profiles.email';
  END IF;
END $$;

-- Step 3: Create an index on email for faster lookups (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx ON public.profiles (email)
  WHERE email IS NOT NULL AND email != '';
