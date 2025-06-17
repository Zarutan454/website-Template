
-- This function safely increments the mined_tokens field for a user
CREATE OR REPLACE FUNCTION public.increment_mined_tokens(user_id_param uuid, increment_value numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET mined_tokens = COALESCE(mined_tokens, 0) + increment_value,
      updated_at = now()
  WHERE id = user_id_param;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER;
