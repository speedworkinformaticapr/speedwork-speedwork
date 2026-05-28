DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.appointments LIMIT 1) THEN
    INSERT INTO public.appointments (
      date, start_time, end_time, service_name, client_name, status, 
      vehicle_brand, vehicle_model, vehicle_plate, vehicle_year
    ) VALUES 
    (CURRENT_DATE, '08:00:00', '09:00:00', 'Revisão Básica', 'João Silva', 'Agendado', 'Toyota', 'Corolla', 'ABC-1234', '2020'),
    (CURRENT_DATE, '09:30:00', '11:00:00', 'Troca de Óleo', 'Maria Oliveira', 'Em Andamento', 'Honda', 'Civic', 'DEF-5678', '2022'),
    (CURRENT_DATE, '11:00:00', '12:30:00', 'Alinhamento', 'Carlos Souza', 'Pré Agendado', 'Ford', 'Focus', 'GHI-9012', '2019'),
    (CURRENT_DATE, '14:00:00', '16:00:00', 'Freios', 'Ana Costa', 'Pendente', 'Chevrolet', 'Cruze', 'JKL-3456', '2021')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;
