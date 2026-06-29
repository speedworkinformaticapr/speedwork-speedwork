-- Allow anonymous (public) and authenticated users to read plan_services for public pricing pages
DROP POLICY IF EXISTS "plan_services_select_public" ON public.plan_services;
CREATE POLICY "plan_services_select_public" ON public.plan_services
    FOR SELECT TO anon, authenticated USING (true);

-- Allow anonymous (public) and authenticated users to read plan_categories
DROP POLICY IF EXISTS "plan_categories_select_public" ON public.plan_categories;
CREATE POLICY "plan_categories_select_public" ON public.plan_categories
    FOR SELECT TO anon, authenticated USING (true);

-- Allow anonymous (public) and authenticated users to read sla_types
DROP POLICY IF EXISTS "sla_types_select_public" ON public.sla_types;
CREATE POLICY "sla_types_select_public" ON public.sla_types
    FOR SELECT TO anon, authenticated USING (true);
