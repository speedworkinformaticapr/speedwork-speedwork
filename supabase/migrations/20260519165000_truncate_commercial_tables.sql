DO $$
BEGIN
  TRUNCATE TABLE 
    public.pedidos,
    public.orcamentos,
    public.financial_charges,
    public.lancamentos_financeiros,
    public.clientes,
    public.financial_partners
  CASCADE;
END $$;
