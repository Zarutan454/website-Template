
-- Funktion zum Inkrementieren von Benutzermetriken wie followers_count und following_count
CREATE OR REPLACE FUNCTION public.increment_user_metric(
  user_id UUID,
  metric_name TEXT,
  increment_value INTEGER
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  valid_metrics TEXT[] := ARRAY['followers_count', 'following_count', 'posts_count', 'mined_tokens'];
  current_value INTEGER;
BEGIN
  -- Überprüfe, ob die Metrik gültig ist
  IF NOT metric_name = ANY(valid_metrics) THEN
    RAISE EXCEPTION 'Ungültige Metrik: %', metric_name;
  END IF;

  -- Aktuelle Metrik abrufen
  EXECUTE format('SELECT %I FROM public.users WHERE id = $1', metric_name)
  INTO current_value
  USING user_id;

  -- Falls der Wert noch nicht existiert, als 0 behandeln
  IF current_value IS NULL THEN
    current_value := 0;
  END IF;

  -- Neue Werte berechnen, unter Beachtung, dass der Wert nicht unter 0 fallen darf
  current_value := GREATEST(0, current_value + increment_value);

  -- Wert aktualisieren
  EXECUTE format('UPDATE public.users SET %I = $1 WHERE id = $2', metric_name)
  USING current_value, user_id;
END;
$$;
