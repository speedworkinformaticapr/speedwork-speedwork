-- Garante que as colunas necessárias para a integração Asaas/Stripe existam
ALTER TABLE public.registration_payments 
ADD COLUMN IF NOT EXISTS payment_intent_id text,
ADD COLUMN IF NOT EXISTS entity_type text,
ADD COLUMN IF NOT EXISTS entity_id uuid,
ADD COLUMN IF NOT EXISTS valor numeric,
ADD COLUMN IF NOT EXISTS metodo_pagamento text,
ADD COLUMN IF NOT EXISTS data_pagamento timestamp with time zone,
ADD COLUMN IF NOT EXISTS tenant_id uuid;
