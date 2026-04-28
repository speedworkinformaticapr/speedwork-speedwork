CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (
    id, 
    user_id, 
    email, 
    name, 
    document, 
    phone, 
    is_client,
    role
  )
  VALUES (
    NEW.id, 
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'document',
    NEW.raw_user_meta_data->>'phone',
    COALESCE((NEW.raw_user_meta_data->>'is_client')::boolean, false),
    COALESCE(NEW.raw_user_meta_data->>'role', 'athlete')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    document = COALESCE(EXCLUDED.document, public.profiles.document),
    phone = COALESCE(EXCLUDED.phone, public.profiles.phone),
    is_client = EXCLUDED.is_client;
  RETURN NEW;
END;
$function$;
