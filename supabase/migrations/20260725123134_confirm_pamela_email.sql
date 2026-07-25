-- ============================================================
-- Fix: confirm email for pamelasofiavidal.10@gmail.com to resolve "Email not confirmed" login error
-- ============================================================

UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmed_at = COALESCE(confirmed_at, NOW()),
  confirmation_token = '',
  updated_at = NOW()
WHERE
  email = 'pamelasofiavidal.10@gmail.com'
  AND EXISTS (SELECT 1 FROM auth.users WHERE email = 'pamelasofiavidal.10@gmail.com');
