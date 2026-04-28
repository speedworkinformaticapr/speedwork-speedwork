ALTER TABLE public.billing_configuration 
ADD COLUMN IF NOT EXISTS tenant_id uuid,
ADD COLUMN IF NOT EXISTS auto_generate_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS due_day integer DEFAULT 10,
ADD COLUMN IF NOT EXISTS due_month integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS days_before_generation integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS reminders_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_days_before integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS reminder_days_after integer DEFAULT 5;

-- Force update of the schema cache in PostgREST to prevent errors
NOTIFY pgrst, 'reload schema';
