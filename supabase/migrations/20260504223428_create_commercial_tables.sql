-- 1. Create Clientes
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  cpf_cnpj TEXT,
  endereco TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  email TEXT UNIQUE,
  senha TEXT,
  nome TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Adjust Orcamentos and Orcamento_itens (adding user_id)
ALTER TABLE public.orcamentos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
ALTER TABLE public.orcamento_itens ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
CREATE UNIQUE INDEX IF NOT EXISTS orcamentos_numero_orcamento_key ON public.orcamentos (numero_orcamento);

-- Drop existing FKs to recreate them safely
ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS orcamentos_cliente_id_fkey;
ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS orcamentos_responsavel_id_fkey;
ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS orcamentos_pedido_id_fkey;
ALTER TABLE public.orcamento_itens DROP CONSTRAINT IF EXISTS orcamento_itens_orcamento_id_fkey;

-- We migrate existing data to avoid FK errors
INSERT INTO public.clientes (id, nome, email)
SELECT id, name, email FROM public.profiles
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.usuarios (id, email, nome, role)
SELECT id, email, name, role FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- Re-add the FKs safely
ALTER TABLE public.orcamentos ADD CONSTRAINT orcamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;
ALTER TABLE public.orcamentos ADD CONSTRAINT orcamentos_responsavel_id_fkey FOREIGN KEY (responsavel_id) REFERENCES public.usuarios(id);
ALTER TABLE public.orcamento_itens ADD CONSTRAINT orcamento_itens_orcamento_id_fkey FOREIGN KEY (orcamento_id) REFERENCES public.orcamentos(id) ON DELETE CASCADE;

-- 4. Create Pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  numero_pedido TEXT UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  orcamento_id UUID REFERENCES public.orcamentos(id),
  responsavel_id UUID REFERENCES public.usuarios(id),
  data_pedido DATE,
  data_entrega_prevista DATE,
  data_entrega_real DATE,
  status TEXT,
  valor_total NUMERIC,
  forma_pagamento TEXT,
  data_pagamento DATE,
  valor_pago NUMERIC,
  rastreamento TEXT,
  observacoes TEXT,
  motivo_cancelamento TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link Orcamentos to Pedidos
ALTER TABLE public.orcamentos ADD CONSTRAINT orcamentos_pedido_id_fkey FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id);

-- 5. Create Pedido_itens
CREATE TABLE IF NOT EXISTS public.pedido_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.products(id),
  quantidade INTEGER,
  valor_unitario NUMERIC,
  valor_total NUMERIC,
  descricao TEXT
);

-- 6. Create Contratos
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  numero_contrato TEXT UNIQUE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE CASCADE,
  responsavel_id UUID REFERENCES public.usuarios(id),
  tipo_contrato TEXT,
  data_inicio DATE,
  data_fim DATE,
  duracao_ciclo TEXT,
  valor_ciclo NUMERIC,
  status TEXT,
  renovacao_automatica BOOLEAN DEFAULT false,
  data_proxima_cobranca DATE,
  data_cancelamento DATE,
  motivo_cancelamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create Lancamentos Financeiros
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  tipo TEXT CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT,
  valor NUMERIC,
  data_lancamento DATE,
  categoria TEXT,
  referencia_id UUID,
  referencia_tipo TEXT CHECK (referencia_tipo IN ('orcamento', 'pedido', 'contrato')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Apply RLS
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['clientes', 'usuarios', 'orcamentos', 'orcamento_itens', 'pedidos', 'pedido_itens', 'contratos', 'lancamentos_financeiros'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', t);
    
    EXECUTE format('DROP POLICY IF EXISTS "%I_select" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "%I_select" ON public.%I FOR SELECT USING (user_id = auth.uid());', t, t);
    
    EXECUTE format('DROP POLICY IF EXISTS "%I_insert" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "%I_insert" ON public.%I FOR INSERT WITH CHECK (user_id = auth.uid());', t, t);
    
    EXECUTE format('DROP POLICY IF EXISTS "%I_update" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "%I_update" ON public.%I FOR UPDATE USING (user_id = auth.uid());', t, t);
    
    EXECUTE format('DROP POLICY IF EXISTS "%I_delete" ON public.%I;', t, t);
    EXECUTE format('CREATE POLICY "%I_delete" ON public.%I FOR DELETE USING (user_id = auth.uid());', t, t);
  END LOOP;
END $$;

-- 9. Insert Mock Data
DO $$
DECLARE
  current_user_id UUID;
  c1 UUID := gen_random_uuid();
  c2 UUID := gen_random_uuid();
  c3 UUID := gen_random_uuid();
  u1 UUID := gen_random_uuid();
  u2 UUID := gen_random_uuid();
  o1 UUID := gen_random_uuid();
  o2 UUID := gen_random_uuid();
  p1 UUID := gen_random_uuid();
  p2 UUID := gen_random_uuid();
  ct1 UUID := gen_random_uuid();
  ct2 UUID := gen_random_uuid();
BEGIN
  -- Ensure user exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'ias2371@gmail.com') THEN
    current_user_id := gen_random_uuid();
    INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud, confirmation_token, recovery_token, email_change_token_new, email_change, email_change_token_current, phone_change, phone_change_token, reauthentication_token)
    VALUES (current_user_id, 'ias2371@gmail.com', crypt('Skip@Pass', gen_salt('bf')), NOW(), NOW(), NOW(), '{"provider": "email", "providers": ["email"]}', '{"name": "Admin"}', false, 'authenticated', 'authenticated', '', '', '', '', '', '', '', '');
    
    INSERT INTO public.profiles (id, email, name, role) VALUES (current_user_id, 'ias2371@gmail.com', 'Admin', 'admin') ON CONFLICT DO NOTHING;
  ELSE
    SELECT id INTO current_user_id FROM auth.users WHERE email = 'ias2371@gmail.com' LIMIT 1;
  END IF;

  -- Update existing orcamentos and itens to belong to the user so they stay visible
  UPDATE public.orcamentos SET user_id = current_user_id WHERE user_id IS NULL;
  UPDATE public.orcamento_itens SET user_id = current_user_id WHERE user_id IS NULL;

  INSERT INTO public.clientes (id, user_id, nome, email, telefone, cpf_cnpj, endereco) VALUES
    (c1, current_user_id, 'Cliente Alpha', 'alpha@teste.com', '11999999999', '000.000.000-01', 'Rua A, 123'),
    (c2, current_user_id, 'Cliente Beta', 'beta@teste.com', '11888888888', '000.000.000-02', 'Rua B, 456'),
    (c3, current_user_id, 'Cliente Gama', 'gama@teste.com', '11777777777', '000.000.000-03', 'Rua C, 789')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.usuarios (id, user_id, email, nome, role) VALUES
    (u1, current_user_id, 'vendedor1@teste.com', 'Vendedor 1', 'vendedor'),
    (u2, current_user_id, 'vendedor2@teste.com', 'Vendedor 2', 'vendedor')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.orcamentos (id, user_id, numero_orcamento, cliente_id, responsavel_id, data_emissao, status, total) VALUES
    (o1, current_user_id, 'ORC-001', c1, u1, CURRENT_DATE, 'rascunho', 1500.00),
    (o2, current_user_id, 'ORC-002', c2, u2, CURRENT_DATE, 'aprovado', 3200.00),
    (gen_random_uuid(), current_user_id, 'ORC-003', c3, u1, CURRENT_DATE, 'enviado', 450.00),
    (gen_random_uuid(), current_user_id, 'ORC-004', c1, u2, CURRENT_DATE, 'rejeitado', 800.00),
    (gen_random_uuid(), current_user_id, 'ORC-005', c2, u1, CURRENT_DATE, 'convertido', 5000.00)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.pedidos (id, user_id, numero_pedido, cliente_id, orcamento_id, responsavel_id, data_pedido, status, valor_total) VALUES
    (p1, current_user_id, 'PED-001', c2, o2, u2, CURRENT_DATE, 'pendente', 3200.00),
    (p2, current_user_id, 'PED-002', c1, o1, u1, CURRENT_DATE, 'entregue', 1500.00),
    (gen_random_uuid(), current_user_id, 'PED-003', c3, NULL, u1, CURRENT_DATE, 'cancelado', 450.00),
    (gen_random_uuid(), current_user_id, 'PED-004', c1, NULL, u2, CURRENT_DATE, 'em_preparacao', 800.00),
    (gen_random_uuid(), current_user_id, 'PED-005', c2, NULL, u1, CURRENT_DATE, 'enviado', 5000.00)
  ON CONFLICT DO NOTHING;

  INSERT INTO public.contratos (id, user_id, numero_contrato, cliente_id, responsavel_id, tipo_contrato, data_inicio, status, valor_ciclo) VALUES
    (ct1, current_user_id, 'CTR-001', c1, u1, 'servico', CURRENT_DATE, 'ativo', 500.00),
    (ct2, current_user_id, 'CTR-002', c2, u2, 'manutencao', CURRENT_DATE, 'ativo', 1200.00),
    (gen_random_uuid(), current_user_id, 'CTR-003', c3, u1, 'servico', CURRENT_DATE, 'ativo', 300.00),
    (gen_random_uuid(), current_user_id, 'CTR-004', c1, u2, 'hospedagem', CURRENT_DATE, 'ativo', 150.00),
    (gen_random_uuid(), current_user_id, 'CTR-005', c2, u1, 'suporte', CURRENT_DATE, 'ativo', 800.00)
  ON CONFLICT DO NOTHING;
END $$;
