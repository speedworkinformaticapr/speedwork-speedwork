-- Fix RLS for profiles to ensure all inserts are allowed for authenticated users
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_update" ON public.profiles;
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY "profiles_delete" ON public.profiles FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO public USING (true);

-- Fix RLS for orders so admins can create quotes smoothly
DROP POLICY IF EXISTS "orders_insert_auth" ON public.orders;
CREATE POLICY "orders_insert_auth" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "orders_update_auth" ON public.orders;
CREATE POLICY "orders_update_auth" ON public.orders FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "orders_select_auth" ON public.orders;
CREATE POLICY "orders_select_auth" ON public.orders FOR SELECT TO authenticated USING (true);

-- Fix RLS for order_items
DROP POLICY IF EXISTS "order_items_insert_auth" ON public.order_items;
CREATE POLICY "order_items_insert_auth" ON public.order_items FOR INSERT TO authenticated WITH CHECK (true);

-- Add quote footer text to system_data
ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS quote_footer_text text;

-- Fix audit_logs RLS which had no policies, causing 403s on triggers
DROP POLICY IF EXISTS "audit_logs_all" ON public.audit_logs;
CREATE POLICY "audit_logs_all" ON public.audit_logs FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY "audit_logs_select" ON public.audit_logs FOR SELECT TO public USING (true);
