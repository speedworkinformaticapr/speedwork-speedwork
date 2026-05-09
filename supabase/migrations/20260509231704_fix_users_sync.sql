DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Criar tabela temporária para mapear duplicações
    CREATE TEMP TABLE tmp_user_mapping ON COMMIT DROP AS
    WITH ranked_email AS (
        SELECT id, email, ROW_NUMBER() OVER (PARTITION BY email ORDER BY updated_at DESC, created_at DESC) as rnum
        FROM public.usuarios
        WHERE email IS NOT NULL AND email != ''
    ),
    email_dups AS (
        SELECT d.id as old_id, p.id as new_id
        FROM ranked_email d
        JOIN ranked_email p ON d.email = p.email AND p.rnum = 1
        WHERE d.rnum > 1
    ),
    ranked_user_id AS (
        SELECT id, user_id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rnum
        FROM public.usuarios
        WHERE user_id IS NOT NULL 
          AND id NOT IN (SELECT old_id FROM email_dups)
    ),
    user_id_dups AS (
        SELECT d.id as old_id, p.id as new_id
        FROM ranked_user_id d
        JOIN ranked_user_id p ON d.user_id = p.user_id AND p.rnum = 1
        WHERE d.rnum > 1
    )
    SELECT * FROM email_dups 
    UNION ALL 
    SELECT * FROM user_id_dups;

    -- 2. Atualizar todas as foreign keys que apontam para usuarios(id) para usar o novo id
    FOR r IN (
        SELECT 
            tc.table_schema, 
            tc.table_name, 
            kcu.column_name
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
          AND ccu.table_name = 'usuarios'
          AND ccu.column_name = 'id'
    ) LOOP
        EXECUTE format('
            UPDATE %I.%I t
            SET %I = m.new_id
            FROM tmp_user_mapping m
            WHERE t.%I = m.old_id;
        ', r.table_schema, r.table_name, r.column_name, r.column_name);
    END LOOP;

    -- 3. Remover duplicações na tabela usuarios (agora sem violar FKs)
    DELETE FROM public.usuarios
    WHERE id IN (SELECT old_id FROM tmp_user_mapping);

    -- 4. Garantir que user_id em usuarios aponta corretamente para auth.users
    UPDATE public.usuarios u
    SET user_id = a.id
    FROM auth.users a
    WHERE u.email = a.email AND (u.user_id IS NULL OR u.user_id != a.id);

    -- 5. Sincronizar perfis faltantes da tabela auth.users & usuarios para profiles
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

    -- 6. Atualizar o acesso do ias2371@gmail.com para 'master' em ambas as tabelas
    UPDATE public.profiles 
    SET role = 'master' 
    WHERE email = 'ias2371@gmail.com';

    UPDATE public.usuarios 
    SET role = 'master' 
    WHERE email = 'ias2371@gmail.com';
END $$;
