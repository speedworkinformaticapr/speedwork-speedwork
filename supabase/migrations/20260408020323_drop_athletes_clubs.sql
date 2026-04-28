-- 1. Update functions that referenced athletes or clubs
CREATE OR REPLACE FUNCTION public.notify_event_registration()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_user_id uuid;
    v_event_name text;
BEGIN
    SELECT user_id INTO v_user_id FROM public.profiles WHERE id = NEW.athlete_id;
    IF v_user_id IS NOT NULL THEN
        SELECT name INTO v_event_name FROM public.events WHERE id = NEW.event_id;
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (v_user_id, 'Inscrição Confirmada', 'Sua inscrição no evento ' || COALESCE(v_event_name, '') || ' foi realizada com sucesso.', 'event');
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.notify_club_suspension()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    IF NEW.is_club = true AND NEW.affiliation_status = 'suspended' AND (OLD.affiliation_status IS NULL OR OLD.affiliation_status <> 'suspended') THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        SELECT user_id, 'Clube Suspenso', 'A filiação do clube ' || NEW.name || ' foi suspensa.', 'club'
        FROM public.profiles
        WHERE club_id = NEW.id AND is_club_admin = true AND user_id IS NOT NULL;
    END IF;
    RETURN NEW;
END;
$function$;

-- 2. Recreate trigger on profiles to handle club suspension notifications
DROP TRIGGER IF EXISTS trigger_notify_club_suspension ON public.profiles;
CREATE TRIGGER trigger_notify_club_suspension 
AFTER UPDATE ON public.profiles 
FOR EACH ROW EXECUTE FUNCTION public.notify_club_suspension();

-- 3. Drop legacy tables safely
DROP TABLE IF EXISTS public.athletes CASCADE;
DROP TABLE IF EXISTS public.clubs CASCADE;
