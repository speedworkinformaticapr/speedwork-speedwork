-- Adiciona política RLS para permitir deleção na tabela profiles por admins
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

-- Cria função para administradores deletarem o usuário completamente (auth.users e dependências em cascata)
CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se quem chamou é administrador
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.';
  END IF;

  -- Impede que o administrador exclua a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: você não pode excluir sua própria conta.';
  END IF;

  -- Remove o usuário da tabela auth.users
  -- Por ter ON DELETE CASCADE ou SET NULL, removerá ou atualizará profiles, athletes, etc.
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;

-- Garante permissão de execução para usuários autenticados (a validação ocorre no corpo da função)
GRANT EXECUTE ON FUNCTION public.delete_user_admin(uuid) TO authenticated;
