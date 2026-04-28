CREATE OR REPLACE FUNCTION public.delete_user_admin(target_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
BEGIN
  -- Verifica se quem chamou é administrador
  PERFORM 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem excluir usuários.';
  END IF;

  -- Impede que o administrador exclua a si mesmo
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Acesso negado: você não pode excluir sua própria conta.';
  END IF;

  -- Remove o usuário da tabela auth.users (O DELETE CASCADE remove tabelas dependentes ligadas)
  DELETE FROM auth.users WHERE id = target_user_id;
  
  -- Remove o profile caso seja um registro órfão sem correspondência em auth.users
  DELETE FROM public.profiles WHERE id = target_user_id;
END;
$$;
