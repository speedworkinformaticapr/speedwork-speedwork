-- ============================================================
-- Fix: confirm email for pamelasofiavidal.10@gmail.com to resolve "Email not confirmed" login error
-- NOTE: auth.users.confirmed_at is a generated column and cannot be set directly.
-- Setting email_confirmed_at and clearing confirmation_token is sufficient.
-- ============================================================

UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  confirmation_token = '',
  updated_at = NOW()
WHERE
  email = 'pamelasofiavidal.10@gmail.com';
