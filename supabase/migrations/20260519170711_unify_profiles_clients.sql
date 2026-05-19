DO $$
BEGIN
  -- Add is_client and is_supplier to profiles
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_client BOOLEAN DEFAULT false;
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_supplier BOOLEAN DEFAULT false;

  -- Allow profiles to exist without an auth user
  ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

  -- Update foreign keys to point to profiles instead of clientes
  -- orcamentos
  ALTER TABLE public.orcamentos DROP CONSTRAINT IF EXISTS orcamentos_cliente_id_fkey;
  ALTER TABLE public.orcamentos ADD CONSTRAINT orcamentos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  -- pedidos
  ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_cliente_id_fkey;
  ALTER TABLE public.pedidos ADD CONSTRAINT pedidos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

  -- contratos
  ALTER TABLE public.contratos DROP CONSTRAINT IF EXISTS contratos_cliente_id_fkey;
  ALTER TABLE public.contratos ADD CONSTRAINT contratos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

END $$;
