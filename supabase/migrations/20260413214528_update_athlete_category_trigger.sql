CREATE OR REPLACE FUNCTION public.calcular_categoria_atleta()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
    idade int;
    cat_record record;
    user_gender text;
BEGIN
    IF NEW.birth_date IS NOT NULL THEN
        idade := date_part('year', age(NEW.birth_date));
        user_gender := LOWER(COALESCE(NEW.gender, ''));

        -- Mapear genero para o formato da tabela de categorias (m, f)
        IF user_gender IN ('masculino', 'm') THEN
            user_gender := 'm';
        ELSIF user_gender IN ('feminino', 'f') THEN
            user_gender := 'f';
        END IF;

        -- Tentar buscar categoria dinamicamente na tabela categories
        SELECT * INTO cat_record
        FROM public.categories
        WHERE status = 'active'
          AND (min_age IS NULL OR idade >= min_age)
          AND (max_age IS NULL OR idade <= max_age)
          AND (
            gender IS NULL 
            OR gender = '' 
            OR LOWER(gender) = 'ambos'
            OR LOWER(gender) = user_gender
          )
        ORDER BY 
          -- Priorizar categorias mais especificas (com limites definidos)
          CASE WHEN min_age IS NOT NULL AND max_age IS NOT NULL THEN 0 ELSE 1 END,
          -- Priorizar categorias com menor diferenca entre limites
          COALESCE(max_age, 999) - COALESCE(min_age, 0) ASC
        LIMIT 1;

        IF FOUND THEN
            NEW.categoria := cat_record.name;
            NEW.category_id := cat_record.id;
            NEW.subcategoria := cat_record.name;
        ELSE
            -- Fallback para o comportamento original se nenhuma categoria for encontrada
            IF NEW.gender = 'masculino' THEN
                IF idade < 18 THEN
                    NEW.categoria := 'Junior';
                ELSIF idade <= 45 THEN
                    NEW.categoria := 'Adulto';
                ELSIF idade <= 55 THEN
                    NEW.categoria := 'Sênior';
                ELSE
                    NEW.categoria := 'Master';
                END IF;
            ELSIF NEW.gender = 'feminino' THEN
                IF idade < 18 THEN
                    NEW.categoria := 'Junior Feminino';
                ELSE
                    NEW.categoria := 'Feminino';
                END IF;
            ELSE
                NEW.categoria := 'Geral';
            END IF;
            NEW.subcategoria := NEW.categoria;
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;
