DO $$
BEGIN
  -- 1. Drop dependent triggers that might block the alter
  DROP TRIGGER IF EXISTS "trg_pedido_financeiro_estoque" ON public.pedidos;
  
  -- 2. Alter columns to NUMERIC(10,2) to support decimals
  ALTER TABLE public.products ALTER COLUMN stock TYPE NUMERIC(10,2) USING stock::NUMERIC(10,2);
  ALTER TABLE public.orcamento_itens ALTER COLUMN quantidade TYPE NUMERIC(10,2) USING quantidade::NUMERIC(10,2);
  ALTER TABLE public.pedido_itens ALTER COLUMN quantidade TYPE NUMERIC(10,2) USING quantidade::NUMERIC(10,2);
END $$;

CREATE OR REPLACE FUNCTION public.handle_pedido_financeiro_estoque()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $$
DECLARE
  item RECORD;
BEGIN
  IF NEW.status = 'confirmado' AND (OLD.status IS NULL OR OLD.status <> 'confirmado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'entrada', 'Pedido Confirmado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, COALESCE(NEW.data_pedido, NOW()::date), 'Pedido Confirmado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
    );
    FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
      UPDATE public.products SET stock = GREATEST(COALESCE(stock, 0) - item.quantidade, 0) WHERE id = item.produto_id;
    END LOOP;
  ELSIF NEW.status = 'entregue' AND (OLD.status IS NULL OR OLD.status <> 'entregue') THEN
    UPDATE public.lancamentos_financeiros SET categoria = 'Pedido Entregue' WHERE referencia_id = NEW.id AND referencia_tipo = 'pedido';
  ELSIF NEW.status = 'cancelado' AND (OLD.status IS NULL OR OLD.status <> 'cancelado') THEN
    INSERT INTO public.lancamentos_financeiros (
      tipo, descricao, valor, data_lancamento, categoria, referencia_id, referencia_tipo, user_id, conta_id
    ) VALUES (
      'saida', 'Pedido Cancelado ' || COALESCE(NEW.numero_pedido, ''), NEW.valor_total, NOW()::date, 'Pedido Cancelado', NEW.id, 'pedido', NEW.responsavel_id, NEW.conta_id
    );
    IF OLD.status IN ('confirmado', 'producao', 'enviado', 'entregue') THEN
      FOR item IN SELECT produto_id, quantidade FROM public.pedido_itens WHERE pedido_id = NEW.id AND tipo_item = 'produto' AND produto_id IS NOT NULL LOOP
        UPDATE public.products SET stock = COALESCE(stock, 0) + item.quantidade WHERE id = item.produto_id;
      END LOOP;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_pedido_financeiro_estoque ON public.pedidos;
CREATE TRIGGER trg_pedido_financeiro_estoque AFTER UPDATE ON public.pedidos FOR EACH ROW EXECUTE FUNCTION public.handle_pedido_financeiro_estoque();

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Seed admin user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    new_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, role, aud,
      confirmation_token, recovery_token, email_change_token_new,
      email_change, email_change_token_current,
      phone, phone_change, phone_change_token, reauthentication_token
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'ias2371@gmail.com',
      crypt('Skip@Pass', gen_salt('bf')),
      NOW(), NOW(), NOW(),
      '{"provider": "email", "providers": ["email"]}',
      '{"name": "Admin Master"}',
      false, 'authenticated', 'authenticated',
      '', '', '', '', '', NULL, '', '', ''
    );

    INSERT INTO public.profiles (id, email, name, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
    ON CONFLICT (id) DO NOTHING;
    
    INSERT INTO public.usuarios (user_id, email, nome, role)
    VALUES (new_user_id, 'ias2371@gmail.com', 'Admin Master', 'master')
    ON CONFLICT (email) DO NOTHING;
  END IF;
END $$;
