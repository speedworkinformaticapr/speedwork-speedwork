DO $$
BEGIN
  -- Ensures the scheduling_interval_minutes parameter is seeded with a valid default value
  -- Used to dynamically render time slots in the appointments calendar.
  UPDATE public.system_data 
  SET scheduling_interval_minutes = 30 
  WHERE id = '00000000-0000-0000-0000-000000000001' AND scheduling_interval_minutes IS NULL;
END $$;
