-- Add foreign key from whatsapp_logs.cliente_id to profiles.id
-- This fixes PGRST200 error when querying whatsapp_logs?select=*,profiles(name)

DO $$
BEGIN
  -- Drop existing constraint if it exists (idempotent)
  ALTER TABLE public.whatsapp_logs DROP CONSTRAINT IF EXISTS whatsapp_logs_cliente_id_fkey;

  -- Add the foreign key constraint
  ALTER TABLE public.whatsapp_logs
    ADD CONSTRAINT whatsapp_logs_cliente_id_fkey
    FOREIGN KEY (cliente_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
END $$;

-- Reload PostgREST schema cache so the new relationship is recognized immediately
NOTIFY pgrst, 'reload schema';
