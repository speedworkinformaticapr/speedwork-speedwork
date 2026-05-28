DO $$
DECLARE
  v_page_id uuid;
  v_blocks jsonb;
  v_new_block jsonb;
BEGIN
  SELECT id, blocks INTO v_page_id, v_blocks FROM public.pages WHERE slug IN ('inicio', 'home') LIMIT 1;
  
  IF v_page_id IS NOT NULL THEN
    v_new_block := '{
      "id": "scheduling-calendar-1",
      "type": "scheduling_calendar",
      "data": {
        "title": "Agende seu Atendimento",
        "subtitle": "Escolha o melhor horário na nossa agenda e iniciaremos o seu atendimento imediatamente.",
        "primaryColor": "hsl(var(--primary))",
        "instructionText": "Selecione o dia desejado para ver os horários disponíveis."
      },
      "order": 99
    }'::jsonb;
    
    IF v_blocks IS NULL OR jsonb_array_length(v_blocks) = 0 THEN
      v_blocks := jsonb_build_array(v_new_block);
    ELSE
      IF NOT (v_blocks @> jsonb_build_array(jsonb_build_object('type', 'scheduling_calendar'))) THEN
        v_blocks := v_blocks || v_new_block;
      END IF;
    END IF;

    UPDATE public.pages SET blocks = v_blocks WHERE id = v_page_id;
  END IF;
END $$;
