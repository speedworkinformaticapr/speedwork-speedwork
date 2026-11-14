-- ============================================================
-- Ajuste de acesso da Caroline (carolinelochcordeiro8@gmail.com)
-- profiles.role = 'autor' + linha em user_roles (papel 'autor').
-- Padrão copiado da usuária pamelasofiavidal.10@gmail.com (role 'autor',
-- is_author = true, status active). Idempotente.
--
-- IMPORTANTE: o profiles.id da Caroline (2df7391c-...) NÃO corresponde ao
-- auth.users.id dela (c42aac60-...). user_roles tem FK para auth.users,
-- então o perfil é realinhado ao id de auth.users (mesmo tratamento dado
-- à Pamela na migration 20260725141200).
-- ============================================================

DO $$
DECLARE
  v_auth_id UUID;
  v_profile_id UUID := '2df7391c-912f-42ea-adff-5c3e6933a62f'::UUID;
BEGIN
  -- 0. Identifica o id real de auth.users pelo e-mail.
  SELECT id INTO v_auth_id
  FROM auth.users
  WHERE email = 'carolinelochcordeiro8@gmail.com'
  LIMIT 1;

  IF v_auth_id IS NULL THEN
    RAISE NOTICE 'Usuário de auth não encontrado para carolinelochcordeiro8@gmail.com; nada feito.';
    RETURN;
  END IF;

  -- 1. Realinha o perfil ao id de auth.users e ajusta o papel.
  UPDATE public.profiles
  SET id = v_auth_id, role = 'autor', is_author = true
  WHERE id = v_profile_id OR email = 'carolinelochcordeiro8@gmail.com';

  -- Se não havia perfil, cria já com o papel correto.
  IF NOT FOUND THEN
    INSERT INTO public.profiles (id, email, role, is_author, status)
    VALUES (v_auth_id, 'carolinelochcordeiro8@gmail.com', 'autor', true, 'active')
    ON CONFLICT (id) DO UPDATE SET role = 'autor', is_author = true;
  END IF;

  -- 2. Garante a linha correspondente em user_roles (papel 'autor').
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_auth_id, 'autor')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- 3. Sincroniza a tabela usuarios (trigger sync_profile_to_usuarios já
  --    propaga, mas garantimos aqui por idempotência).
  UPDATE public.usuarios
  SET role = 'autor', updated_at = NOW()
  WHERE user_id = v_auth_id OR user_id = v_profile_id;
END $$;
