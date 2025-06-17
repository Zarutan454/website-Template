
-- Diese Funktion sollte manuell in der Supabase SQL-Konsole ausgeführt werden
CREATE OR REPLACE FUNCTION public.increment(value integer)
RETURNS integer AS $$
BEGIN
  RETURN value + 1;
END;
$$ LANGUAGE plpgsql;

-- Diese Funktion sollte manuell in der Supabase SQL-Konsole ausgeführt werden
CREATE OR REPLACE FUNCTION public.increment_tokens(user_id uuid, value numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET mined_tokens = COALESCE(mined_tokens, 0) + value
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
