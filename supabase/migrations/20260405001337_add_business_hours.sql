ALTER TABLE public.system_data ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{
  "monday": { "is_open": true, "open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00" },
  "tuesday": { "is_open": true, "open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00" },
  "wednesday": { "is_open": true, "open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00" },
  "thursday": { "is_open": true, "open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00" },
  "friday": { "is_open": true, "open_time": "08:00", "close_time": "18:00", "lunch_start": "12:00", "lunch_end": "13:00" },
  "saturday": { "is_open": true, "open_time": "08:00", "close_time": "12:00", "lunch_start": "", "lunch_end": "" },
  "sunday": { "is_open": false, "open_time": "", "close_time": "", "lunch_start": "", "lunch_end": "" }
}'::jsonb;
