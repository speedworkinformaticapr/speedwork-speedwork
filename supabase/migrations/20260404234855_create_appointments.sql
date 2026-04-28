DO $$
BEGIN
  -- 1. Create table
  CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    service_name TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pendente',
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  -- 2. Enable RLS
  ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

  -- 3. Create policies
  DROP POLICY IF EXISTS "appointments_all" ON public.appointments;
  CREATE POLICY "appointments_all" ON public.appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);

  -- 4. Seed data
  IF NOT EXISTS (SELECT 1 FROM public.appointments) THEN
    INSERT INTO public.appointments (id, date, start_time, end_time, service_name, client_name, status, notes)
    VALUES 
      (gen_random_uuid(), CURRENT_DATE, '09:00:00', '13:00:00', 'Consultoria de Campo', 'Clube Alpha', 'Confirmado', 'Detalhes da consultoria'),
      (gen_random_uuid(), CURRENT_DATE + INTERVAL '1 day', '14:00:00', '17:00:00', 'Treinamento Tático', 'João Silva', 'Pendente', 'Treinamento inicial'),
      (gen_random_uuid(), CURRENT_DATE, '14:00:00', '16:00:00', 'Auditoria de Regras', 'Maria Costa', 'Em Andamento', '');
  END IF;
END $$;
