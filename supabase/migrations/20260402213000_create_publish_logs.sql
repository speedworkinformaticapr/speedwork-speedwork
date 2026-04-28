CREATE TABLE IF NOT EXISTS public.publish_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status TEXT NOT NULL,
    message TEXT NOT NULL,
    error_details TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.publish_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "publish_logs_all" ON public.publish_logs;
CREATE POLICY "publish_logs_all" ON public.publish_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
