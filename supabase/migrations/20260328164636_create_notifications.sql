-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    type text NOT NULL DEFAULT 'system',
    is_read boolean NOT NULL DEFAULT false,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can delete own notifications" ON public.notifications
    FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Enable Realtime
DO $$
DECLARE
    pub_exists boolean;
    table_in_pub boolean;
BEGIN
    SELECT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') INTO pub_exists;
    IF NOT pub_exists THEN
        CREATE PUBLICATION supabase_realtime;
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
    ) INTO table_in_pub;

    IF NOT table_in_pub THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    END IF;
END
$$ LANGUAGE plpgsql;

-- 1. Trigger: Event Registration
CREATE OR REPLACE FUNCTION notify_event_registration() RETURNS trigger AS $$
DECLARE
    v_user_id uuid;
    v_event_name text;
BEGIN
    SELECT user_id INTO v_user_id FROM public.athletes WHERE id = NEW.athlete_id;
    IF v_user_id IS NOT NULL THEN
        SELECT name INTO v_event_name FROM public.events WHERE id = NEW.event_id;
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (v_user_id, 'Inscrição Confirmada', 'Sua inscrição no evento ' || COALESCE(v_event_name, '') || ' foi realizada com sucesso.', 'event');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_event_registration ON public.event_registrations;
CREATE TRIGGER trigger_notify_event_registration
    AFTER INSERT ON public.event_registrations
    FOR EACH ROW EXECUTE FUNCTION notify_event_registration();

-- 2. Trigger: Order Payment
CREATE OR REPLACE FUNCTION notify_order_payment() RETURNS trigger AS $$
BEGIN
    IF NEW.status = 'paid' AND (OLD.status IS NULL OR OLD.status <> 'paid') THEN
        IF NEW.user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, 'Pagamento Confirmado', 'O pagamento do seu pedido foi recebido.', 'payment');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_order_payment ON public.orders;
CREATE TRIGGER trigger_notify_order_payment
    AFTER UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION notify_order_payment();

-- 3. Trigger: Club Suspended
CREATE OR REPLACE FUNCTION notify_club_suspension() RETURNS trigger AS $$
BEGIN
    IF NEW.affiliation_status = 'suspended' AND (OLD.affiliation_status IS NULL OR OLD.affiliation_status <> 'suspended') THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT user_id, 'Clube Suspenso', 'A filiação do clube ' || NEW.name || ' foi suspensa.', 'club'
        FROM public.athletes
        WHERE club_id = NEW.id AND is_club_admin = true AND user_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_club_suspension ON public.clubs;
CREATE TRIGGER trigger_notify_club_suspension
    AFTER UPDATE ON public.clubs
    FOR EACH ROW EXECUTE FUNCTION notify_club_suspension();

-- 4. Trigger: New Blog Post
CREATE OR REPLACE FUNCTION notify_new_blog_post() RETURNS trigger AS $$
BEGIN
    INSERT INTO public.notifications (user_id, title, message, type)
    SELECT id, 'Novo Post no Blog', 'Confira nosso novo artigo: ' || NEW.title, 'blog'
    FROM auth.users;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_notify_new_blog_post ON public.blog_posts;
CREATE TRIGGER trigger_notify_new_blog_post
    AFTER INSERT ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION notify_new_blog_post();
