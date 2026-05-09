DO $$
BEGIN
    -- 1. Remover duplicações na tabela usuarios baseadas no mesmo email mantendo o mais recente
    DELETE FROM public.usuarios
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC, created_at DESC) as rnum
            FROM public.usuarios
            WHERE email IS NOT NULL AND email != ''
        ) t
        WHERE t.rnum > 1
    );

    -- 2. Remover duplicações na tabela usuarios baseadas no mesmo user_id mantendo o mais recente
    DELETE FROM public.usuarios
    WHERE id IN (
        SELECT id FROM (
            SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rnum
            FROM public.usuarios
            WHERE user_id IS NOT NULL
        ) t
        WHERE t.rnum > 1
    );

    -- 3. Garantir que user_id em usuarios aponta corretamente para auth.users
    UPDATE public.usuarios u
    SET user_id = a.id
    FROM auth.users a
    WHERE u.email = a.email AND (u.user_id IS NULL OR u.user_id != a.id);

    -- 4. Sincronizar perfis faltantes da tabela auth.users & usuarios para profiles
    INSERT INTO public.profiles (id, email, name, role)
    SELECT 
        a.id, 
        a.email, 
        COALESCE(u.nome, a.raw_user_meta_data->>'name', 'Usuário'),
        COALESCE(u.role, 'user')
    FROM auth.users a
    LEFT JOIN public.usuarios u ON u.email = a.email
    ON CONFLICT (id) DO UPDATE 
    SET 
        email = EXCLUDED.email, 
        name = COALESCE(public.profiles.name, EXCLUDED.name);

    -- 5. Atualizar o acesso do ias2371@gmail.com para 'master' em ambas as tabelas
    UPDATE public.profiles 
    SET role = 'master' 
    WHERE email = 'ias2371@gmail.com';

    UPDATE public.usuarios 
    SET role = 'master' 
    WHERE email = 'ias2371@gmail.com';
END $$;
