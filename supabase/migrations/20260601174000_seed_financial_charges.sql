DO $$
BEGIN
  INSERT INTO public.financial_charges (id, client_name, amount, due_date, description, status, type, category)
  VALUES 
    ('10000000-0000-0000-0000-000000000001'::uuid, 'João Silva', 1500.00, CURRENT_DATE - INTERVAL '5 days', 'Serviço de Consultoria', 'atrasado', 'receivable', 'servico'),
    ('10000000-0000-0000-0000-000000000002'::uuid, 'Maria Oliveira', 2500.50, CURRENT_DATE + INTERVAL '2 days', 'Projeto Web', 'pendente', 'receivable', 'projeto'),
    ('10000000-0000-0000-0000-000000000003'::uuid, 'Fornecedor A', 500.00, CURRENT_DATE - INTERVAL '1 day', 'Compra de Material', 'pago', 'payable', 'compra'),
    ('10000000-0000-0000-0000-000000000004'::uuid, 'Empresa XYZ', 10000.00, CURRENT_DATE + INTERVAL '10 days', 'Contrato Mensal', 'pendente', 'receivable', 'contrato'),
    ('10000000-0000-0000-0000-000000000005'::uuid, 'Software SA', 299.90, CURRENT_DATE, 'Licença de Software', 'pendente', 'payable', 'despesa')
  ON CONFLICT (id) DO NOTHING;
END $$;
