UPDATE public.system_data
SET
  platform_name = 'Speedwork',
  slogan = 'Tecnologia, inovação e inteligência para transformar o seu negócio.',
  short_description = 'Empresa de tecnologia que oferece serviços e produtos de TI com soluções inteligentes e inovadoras.',
  razao_social = COALESCE(NULLIF(razao_social, ''), 'Speedwork'),
  updated_at = NOW()
WHERE id = '00000000-0000-0000-0000-000000000001';
